import type { UserDto } from '~/types/api'

export const userFixture: UserDto = {
  id: 1,
  language: 'nl',
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'User',
  sex: 'm',
  gsm: '0470123456',
  general_questions: [],
  mandatory_approvals: ['1'],
  year: 2012,
  month: 6,
  t_size: 2,
  gsm_guardian: '',
  email_guardian: '',
  via: '',
  via_type: '',
  medical: '',
  delete_possible: true,
  address: {
    street: 'Teststraat',
    house_number: '1',
    municipality_name: 'Mechelen',
    box_number: '',
    postalcode: 2800,
  },
}
