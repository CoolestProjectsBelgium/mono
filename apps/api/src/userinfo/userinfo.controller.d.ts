import { UserDto } from '../dto/user.dto';
export declare class UserinfoController {
    getUserInfo(): Promise<UserDto> | null;
    deleteUser(): any;
    updateUser(updateUserDto: UserDto): Promise<UserDto | null>;
}
