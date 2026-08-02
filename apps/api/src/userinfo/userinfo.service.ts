import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UserinfoService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  private readField<T>(user: User, key: string): T {
    const fromDataValues =
      typeof user.getDataValue === 'function'
        ? user.getDataValue(key)
        : undefined;
    return (fromDataValues ?? (user as unknown as Record<string, unknown>)[key]) as T;
  }

  mapUserToDto(user: User): UserDto {
    const birthmonth = this.readField<Date | null>(user, 'birthmonth');
    const birth = birthmonth ? new Date(birthmonth) : null;
    return {
      id: user.id,
      language: this.readField(user, 'language'),
      email: this.readField(user, 'email'),
      firstname: this.readField(user, 'firstname'),
      lastname: this.readField(user, 'lastname'),
      sex: this.readField(user, 'sex'),
      gsm: this.readField(user, 'gsm'),
      general_questions: [],
      mandatory_approvals: [],
      year: birth ? birth.getFullYear() : 0,
      month: birth ? birth.getMonth() : -1,
      t_size: this.readField(user, 'tshirtId'),
      gsm_guardian: this.readField(user, 'gsm_guardian') ?? '',
      email_guardian: this.readField(user, 'email_guardian') ?? '',
      via: this.readField(user, 'via') ?? '',
      medical: this.readField(user, 'medical') ?? '',
      delete_possible: true,
      address: {
        street: this.readField(user, 'street') ?? '',
        house_number: this.readField(user, 'house_number') ?? '',
        municipality_name: this.readField(user, 'municipality_name') ?? '',
        box_number: this.readField(user, 'box_number') ?? '',
        postalcode: this.readField(user, 'postalcode') ?? 0,
      },
    };
  }

  async getUserInfo(userId: number): Promise<UserDto> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserToDto(user);
  }

  async updateUser(userId: number, updateUserDto: UserDto): Promise<UserDto> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.language = updateUserDto.language;
    user.email = updateUserDto.email;
    user.firstname = updateUserDto.firstname;
    user.lastname = updateUserDto.lastname;
    user.sex = updateUserDto.sex;
    user.gsm = updateUserDto.gsm;
    user.tshirtId = updateUserDto.t_size;
    user.gsm_guardian = updateUserDto.gsm_guardian;
    user.email_guardian = updateUserDto.email_guardian;
    user.via = updateUserDto.via;
    user.medical = updateUserDto.medical;
    user.postalcode = updateUserDto.address.postalcode;

    if (updateUserDto.year && updateUserDto.month >= 0) {
      user.birthmonth = new Date(updateUserDto.year, updateUserDto.month, 1);
    }

    await user.save();
    return this.mapUserToDto(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.destroy();
  }
}
