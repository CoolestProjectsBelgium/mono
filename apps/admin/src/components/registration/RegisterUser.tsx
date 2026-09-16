import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { ActionProps } from 'adminjs';
import {
  Box,
  Button,
  CheckBox,
  FormGroup,
  H2,
  H4,
  Input,
  Label,
  Select,
  Text,
} from '@adminjs/design-system';
import type {
  RegisterUserFormData,
  RegisterUserFormOption,
} from './handler.js';

const api = new ApiClient();

type SelectOption = { value: string; label: string };

const SEX_OPTIONS: SelectOption[] = [
  { value: 'm', label: 'Male' },
  { value: 'f', label: 'Female' },
  { value: 'x', label: 'X' },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'nl', label: 'Nederlands' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

const AFFILIATION_OPTIONS: SelectOption[] = [
  { value: '', label: 'None' },
  { value: 'dojo', label: 'CoderDojo' },
  { value: 'other', label: 'Other organisation' },
];

const PROJECT_MODE_OPTIONS: SelectOption[] = [
  { value: 'own', label: 'Create a new project' },
  { value: 'join', label: 'Join an existing project (voucher code)' },
];

const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
}));

// Registers a User directly (validated the same way, and activated the same
// way, as the public registration flow — see
// apps/api/src/registration/registration.controller.ts) — a separate
// action alongside the default "Create new" button, not a replacement for
// it. Plain inputs rather than the public form's live dojo/postal-code
// search widgets — bad values are still caught server-side and shown below.
const RegisterUser: React.FC<ActionProps> = ({ resource, action }) => {
  const [formData, setFormData] = useState<RegisterUserFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [sex, setSex] = useState<SelectOption>(SEX_OPTIONS[0]);
  const [language, setLanguage] = useState<SelectOption>(LANGUAGE_OPTIONS[0]);
  const [gsm, setGsm] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState<SelectOption>(MONTH_OPTIONS[0]);
  const [tshirt, setTshirt] = useState<SelectOption | null>(null);
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [boxNumber, setBoxNumber] = useState('');
  const [postalcode, setPostalcode] = useState('');
  const [municipalityName, setMunicipalityName] = useState('');
  const [affiliationType, setAffiliationType] = useState<SelectOption>(
    AFFILIATION_OPTIONS[0],
  );
  const [affiliationName, setAffiliationName] = useState('');
  const [emailGuardian, setEmailGuardian] = useState('');
  const [gsmGuardian, setGsmGuardian] = useState('');
  const [medical, setMedical] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [selectedApprovals, setSelectedApprovals] = useState<Set<number>>(
    new Set(),
  );
  const [projectMode, setProjectMode] = useState<SelectOption>(
    PROJECT_MODE_OPTIONS[0],
  );
  const [projectName, setProjectName] = useState('');
  const [projectDescr, setProjectDescr] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectLang, setProjectLang] = useState<SelectOption>(
    LANGUAGE_OPTIONS[0],
  );
  const [projectCode, setProjectCode] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.resourceAction({
          resourceId: resource.id,
          actionName: action.name,
          method: 'get',
        });
        setFormData(response.data as unknown as RegisterUserFormData);
      } catch (err) {
        console.error('Failed to load registration form data:', err);
        setNotice({
          message: 'Unable to load the form. Please retry.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [resource.id, action.name]);

  const toggleSelected = (
    set: Set<number>,
    setSet: (s: Set<number>) => void,
    id: number,
  ) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSet(next);
  };

  const guardianRequired =
    formData != null &&
    birthYear !== '' &&
    (() => {
      const now = new Date();
      const age =
        now.getFullYear() -
        Number(birthYear) -
        (now.getMonth() < Number(birthMonth.value) ? 1 : 0);
      return age < formData.guardianAge;
    })();

  const submit = async () => {
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await api.resourceAction({
        resourceId: resource.id,
        actionName: action.name,
        method: 'post',
        data: {
          email,
          firstname,
          lastname,
          sex: sex.value,
          language: language.value,
          gsm,
          year: birthYear,
          month: birthMonth.value,
          t_size: tshirt?.value,
          street,
          house_number: houseNumber,
          box_number: boxNumber,
          postalcode,
          municipality_name: municipalityName,
          via_type: affiliationType.value,
          via: affiliationName,
          email_guardian: emailGuardian,
          gsm_guardian: gsmGuardian,
          medical,
          general_questions: Array.from(selectedQuestions).map(String),
          mandatory_approvals: Array.from(selectedApprovals).map(String),
          isOwnProject: projectMode.value === 'own',
          project_name: projectName,
          project_descr: projectDescr,
          project_type: projectType,
          project_lang: projectLang.value,
          project_code: projectCode,
        },
      });
      const data = response.data as unknown as {
        notice?: { message: string; type: 'success' | 'error' };
      };
      setNotice(data.notice ?? null);
    } catch (err) {
      console.error('Failed to register user:', err);
      setNotice({
        message: 'Unable to register this user. Please retry.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Text>Loading…</Text>;
  }

  return (
    <Box variant="grey">
      <H2>Register user</H2>
      <Text mb="lg">
        Creates a Registration and immediately activates it into a User — same
        validation as the public registration form, no activation email sent,
        and this account is never placed on the waiting list.
      </Text>

      {notice && (
        <Text color={notice.type === 'error' ? 'danger' : 'success'} mb="lg">
          {notice.message}
        </Text>
      )}

      <H4>Personal details</H4>
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="firstname">First name</Label>
        <Input
          id="firstname"
          value={firstname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFirstname(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="lastname">Last name</Label>
        <Input
          id="lastname"
          value={lastname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLastname(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="sex">Sex</Label>
        <Select options={SEX_OPTIONS} value={sex} onChange={setSex} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="language">Language</Label>
        <Select
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={setLanguage}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="gsm">Phone (GSM)</Label>
        <Input
          id="gsm"
          value={gsm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGsm(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="birthYear">Birth year</Label>
        <Input
          id="birthYear"
          type="number"
          value={birthYear}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBirthYear(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="birthMonth">Birth month</Label>
        <Select
          options={MONTH_OPTIONS}
          value={birthMonth}
          onChange={setBirthMonth}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="tshirt">T-shirt size</Label>
        <Select
          options={(formData?.tshirts ?? []).map(
            (t: RegisterUserFormOption) => ({
              value: String(t.id),
              label: t.name,
            }),
          )}
          value={tshirt}
          onChange={setTshirt}
        />
      </FormGroup>

      <H4>Address</H4>
      <FormGroup>
        <Label htmlFor="street">Street</Label>
        <Input
          id="street"
          value={street}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStreet(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="houseNumber">House number</Label>
        <Input
          id="houseNumber"
          value={houseNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setHouseNumber(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="boxNumber">Box number</Label>
        <Input
          id="boxNumber"
          value={boxNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBoxNumber(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="postalcode">Postal code</Label>
        <Input
          id="postalcode"
          type="number"
          value={postalcode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPostalcode(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="municipalityName">Municipality</Label>
        <Input
          id="municipalityName"
          value={municipalityName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMunicipalityName(e.target.value)
          }
        />
      </FormGroup>

      <H4>Affiliation</H4>
      <FormGroup>
        <Label htmlFor="affiliationType">Dojo affiliation</Label>
        <Select
          options={AFFILIATION_OPTIONS}
          value={affiliationType}
          onChange={setAffiliationType}
        />
      </FormGroup>
      {affiliationType.value !== '' && (
        <FormGroup>
          <Label htmlFor="affiliationName">
            {affiliationType.value === 'dojo'
              ? 'Dojo name'
              : 'Organisation name'}
          </Label>
          <Input
            id="affiliationName"
            value={affiliationName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAffiliationName(e.target.value)
            }
          />
        </FormGroup>
      )}

      {guardianRequired && (
        <>
          <H4>Guardian (required under {formData?.guardianAge})</H4>
          <FormGroup>
            <Label htmlFor="emailGuardian">Guardian email</Label>
            <Input
              id="emailGuardian"
              value={emailGuardian}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmailGuardian(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="gsmGuardian">Guardian phone (GSM)</Label>
            <Input
              id="gsmGuardian"
              value={gsmGuardian}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGsmGuardian(e.target.value)
              }
            />
          </FormGroup>
        </>
      )}

      <FormGroup>
        <Label htmlFor="medical">Medical info</Label>
        <Input
          id="medical"
          value={medical}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMedical(e.target.value)
          }
        />
      </FormGroup>

      {(formData?.approvals?.length ?? 0) > 0 && (
        <>
          <H4>Mandatory approvals</H4>
          {formData!.approvals.map((approval) => (
            <FormGroup key={approval.id}>
              <CheckBox
                id={`approval-${approval.id}`}
                checked={selectedApprovals.has(approval.id)}
                onChange={() =>
                  toggleSelected(
                    selectedApprovals,
                    setSelectedApprovals,
                    approval.id,
                  )
                }
              />
              <Label htmlFor={`approval-${approval.id}`} inline>
                {approval.name}
              </Label>
            </FormGroup>
          ))}
        </>
      )}

      {(formData?.questions?.length ?? 0) > 0 && (
        <>
          <H4>Questions</H4>
          {formData!.questions.map((question) => (
            <FormGroup key={question.id}>
              <CheckBox
                id={`question-${question.id}`}
                checked={selectedQuestions.has(question.id)}
                onChange={() =>
                  toggleSelected(
                    selectedQuestions,
                    setSelectedQuestions,
                    question.id,
                  )
                }
              />
              <Label htmlFor={`question-${question.id}`} inline>
                {question.name}
              </Label>
            </FormGroup>
          ))}
        </>
      )}

      <H4>Project</H4>
      <FormGroup>
        <Select
          options={PROJECT_MODE_OPTIONS}
          value={projectMode}
          onChange={setProjectMode}
        />
      </FormGroup>
      {projectMode.value === 'own' ? (
        <>
          <FormGroup>
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setProjectName(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="projectDescr">Project description</Label>
            <Input
              id="projectDescr"
              value={projectDescr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setProjectDescr(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="projectType">Project type</Label>
            <Input
              id="projectType"
              value={projectType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setProjectType(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="projectLang">Project language</Label>
            <Select
              options={LANGUAGE_OPTIONS}
              value={projectLang}
              onChange={setProjectLang}
            />
          </FormGroup>
        </>
      ) : (
        <FormGroup>
          <Label htmlFor="projectCode">Voucher / project code</Label>
          <Input
            id="projectCode"
            value={projectCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProjectCode(e.target.value)
            }
          />
        </FormGroup>
      )}

      <Button mt="xl" variant="primary" disabled={submitting} onClick={submit}>
        {submitting ? 'Registering…' : 'Register user'}
      </Button>
    </Box>
  );
};

export default RegisterUser;
