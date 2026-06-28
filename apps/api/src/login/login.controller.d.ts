import { LoginActivateDto } from '../dto/login-activate.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginMailDto } from '../dto/logon-mail.dto';
export declare class LoginController {
    activateLogin(loginActivateDto: LoginActivateDto): Promise<LoginDto | null>;
    logout(): Promise<any>;
    mailToken(loginMailDto: LoginMailDto): Promise<any>;
}
