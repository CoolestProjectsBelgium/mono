import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { UserDto } from '../dto/user.dto';
import { normalizeAffiliation } from '../affiliation/normalize-affiliation';

@Injectable()
export class UserinfoService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  mapUserToDto(user: User): UserDto {
    const birth = user.birthmonth ? new Date(user.birthmonth) : null;
    return {
      id: user.id,
      language: user.language,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      sex: user.sex,
      gsm: user.gsm,
      general_questions: [],
      mandatory_approvals: [],
      year: birth ? birth.getFullYear() : 0,
      month: birth ? birth.getMonth() : -1,
      t_size: user.tshirtId ?? 0,
      gsm_guardian: user.gsm_guardian ?? '',
      email_guardian: user.email_guardian ?? '',
      via: user.via ?? '',
      via_type: user.via_type ?? '',
      medical: user.medical ?? '',
      delete_possible: true,
      address: {
        street: '',
        house_number: '',
        municipality_name: user.municipality_name ?? '',
        box_number: '',
        postalcode: user.postalcode ?? 0,
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
    // Empty string fails Sequelize @IsEmail; store null when absent (same as registration).
    user.email_guardian = updateUserDto.email_guardian?.trim() || null;
    const affiliation = normalizeAffiliation(updateUserDto.via_type, updateUserDto.via);
    user.via = affiliation.via;
    user.via_type = affiliation.via_type;
    user.medical = updateUserDto.medical;
    user.postalcode = updateUserDto.address.postalcode;
    user.municipality_name = updateUserDto.address.municipality_name;

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
