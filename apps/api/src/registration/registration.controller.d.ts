import { RegistrationService } from './registration.service';
import { RegistrationDto } from '../dto/registration.dto';
import { InfoDto } from '../dto/info.dto';
export declare class RegistrationController {
    private registrationService;
    constructor(registrationService: RegistrationService);
    create(info: InfoDto, createRegistrationDto: RegistrationDto): Promise<void>;
}
