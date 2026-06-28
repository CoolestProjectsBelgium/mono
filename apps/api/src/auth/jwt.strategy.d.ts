import { User } from '@coolestprojects/database';
import { RegistrationService } from '../registration/registration.service';
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userModel;
    private readonly registrationService;
    constructor(userModel: typeof User, registrationService: RegistrationService);
    validate(payload: any): Promise<User>;
}
export {};
