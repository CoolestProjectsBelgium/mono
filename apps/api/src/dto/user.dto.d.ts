import { AddressDto } from './address.dto';
export declare class UserDto {
    id?: number;
    language: string;
    email: string;
    firstname: string;
    lastname: string;
    sex: string;
    gsm: string;
    general_questions: string[];
    mandatory_approvals: string[];
    year: number;
    month: number;
    t_size: number;
    gsm_guardian: string;
    email_guardian: string;
    via: string;
    medical: string;
    delete_possible?: boolean;
    address: AddressDto;
}
