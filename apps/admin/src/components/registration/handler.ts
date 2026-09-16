import {
  Project as ProjectModel,
  UserProject as UserProjectModel,
} from '@coolestprojects/database';
import { NestApiClient } from '../../api/nest-api-client.js';
import { sequelize } from '../../database.js';

const Project = sequelize.models.Project as typeof ProjectModel;
const UserProject = sequelize.models.UserProject as typeof UserProjectModel;

export interface RegisterUserFormOption {
  id: number;
  name: string;
  description?: string;
}

export interface RegisterUserVoucherOption {
  code: string;
  projectName: string;
}

export interface RegisterUserMunicipalityOption {
  postalcode: number;
  name: string;
}

export interface RegisterUserDojoOption {
  id: number;
  name: string;
}

export interface RegisterUserFormData {
  guardianAge: number;
  questions: RegisterUserFormOption[];
  approvals: RegisterUserFormOption[];
  tshirts: RegisterUserFormOption[];
  vouchers: RegisterUserVoucherOption[];
  dojos: RegisterUserDojoOption[];
  municipalities: RegisterUserMunicipalityOption[];
}

// Unredeemed vouchers (UserProject rows with no userId yet) for the admin's
// own event, joined to their project name — see resolveVoucher/redeem in
// registration.service.ts:312-338 for how a voucherGuid is later consumed.
async function fetchAvailableVouchers(
  eventId: number,
): Promise<RegisterUserVoucherOption[]> {
  const rows = await UserProject.findAll({
    where: { eventId, userId: null, deletedAt: null },
    include: [
      { model: Project, attributes: ['name'], where: { deletedAt: null } },
    ],
    order: [[{ model: Project, as: 'project' }, 'name', 'ASC']],
  });
  return rows.map((row) => ({
    code: row.voucherGuid,
    projectName: row.project?.name ?? 'Unknown project',
  }));
}

// Flat shape the RegisterUser.tsx form actually submits — reshaped into
// RegistrationDto (apps/api/src/dto/registration.dto.ts) below, so the form
// itself doesn't need to know that nested contract.
interface RegisterUserSubmission {
  email: string;
  firstname: string;
  lastname: string;
  sex: string;
  language: string;
  gsm: string;
  year: number;
  month: number;
  t_size: number;
  street: string;
  house_number: string;
  box_number: string;
  postalcode: number;
  municipality_name: string;
  via_type: 'dojo' | 'other' | '';
  via: string;
  medical: string;
  email_guardian?: string;
  gsm_guardian?: string;
  general_questions: string[];
  mandatory_approvals: string[];
  isOwnProject: boolean;
  project_name?: string;
  project_descr?: string;
  project_type?: string;
  project_lang?: string;
  project_code?: string;
}

function buildRegistrationPayload(form: RegisterUserSubmission) {
  return {
    user: {
      language: form.language,
      email: form.email,
      firstname: form.firstname,
      lastname: form.lastname,
      sex: form.sex,
      gsm: form.gsm,
      general_questions: form.general_questions ?? [],
      mandatory_approvals: form.mandatory_approvals ?? [],
      year: Number(form.year),
      month: Number(form.month),
      t_size: Number(form.t_size),
      gsm_guardian: form.gsm_guardian ?? '',
      email_guardian: form.email_guardian ?? '',
      via: form.via ?? '',
      via_type: form.via_type ?? '',
      medical: form.medical ?? '',
      address: {
        street: form.street,
        house_number: form.house_number,
        box_number: form.box_number,
        municipality_name: form.municipality_name,
        postalcode: Number(form.postalcode),
      },
    },
    project: form.isOwnProject
      ? {
          own_project: {
            project_name: form.project_name,
            project_descr: form.project_descr,
            project_type: form.project_type,
            project_lang: form.project_lang,
          },
        }
      : {
          other_project: {
            project_code: form.project_code,
          },
        },
  };
}

function errorMessage(error: unknown): string {
  const axiosError = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const apiMessage = axiosError?.response?.data?.message;
  if (Array.isArray(apiMessage)) {
    return apiMessage.join(', ');
  }
  return apiMessage || axiosError?.message || 'Failed to register user.';
}

export const registerUserHandler = async (
  request: any,
  _response: any,
  context: any,
) => {
  const api = await NestApiClient.fromExpressRequest(request);

  if (request.method?.toLowerCase() === 'post') {
    try {
      const payload = buildRegistrationPayload(
        (request.payload ?? {}) as RegisterUserSubmission,
      );
      const response = await api.post<{ id: number; email: string }>(
        '/registration',
        payload,
      );
      return {
        notice: {
          message: `Registered and activated: ${response.data?.email ?? payload.user.email}`,
          type: 'success',
        },
        created: response.data,
      };
    } catch (error) {
      return {
        notice: { message: errorMessage(error), type: 'error' },
      };
    }
  }

  // GET — form data: mandatory questions/approvals and t-shirt options for
  // the currently-active event, plus the guardian-age threshold (from the
  // same public /settings the registration frontend uses) so the form can
  // show/hide guardian fields the same way apps/registration does. Vouchers
  // are queried directly from the DB (scoped to the admin's own event)
  // rather than through apps/api, which has no listing endpoint for them.
  const eventId = context.currentAdmin?.eventId;
  const [
    questions,
    approvals,
    tshirtGroups,
    settings,
    vouchers,
    dojos,
    municipalities,
  ] = await Promise.all([
    api.get<RegisterUserFormOption[]>('/questions'),
    api.get<RegisterUserFormOption[]>('/approvals'),
    api.get<Array<{ group: string; items: RegisterUserFormOption[] }>>(
      '/tshirts',
    ),
    api.get<{ guardianAge: number }>('/settings'),
    eventId ? fetchAvailableVouchers(eventId) : Promise.resolve([]),
    api.get<Array<{ id: number; name: string }>>('/dojos'),
    api.get<
      Array<{
        postalcode: number;
        municipality_name_nl: string;
      }>
    >('/municipalities'),
  ]);

  const data: RegisterUserFormData = {
    guardianAge: settings.data.guardianAge,
    questions: questions.data,
    approvals: approvals.data,
    tshirts: tshirtGroups.data.flatMap((group) => group.items),
    vouchers,
    dojos: dojos.data,
    municipalities: municipalities.data.map((entry) => ({
      postalcode: entry.postalcode,
      name: entry.municipality_name_nl,
    })),
  };

  return data;
};
