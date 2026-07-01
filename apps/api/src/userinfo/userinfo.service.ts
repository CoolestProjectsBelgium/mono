import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@coolestprojects/database';
import { UserDto } from '../dto/user.dto';
import { validateAddress } from '../geo/postal-codes';

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
      t_size: user.tshirtId,
      gsm_guardian: user.gsm_guardian ?? '',
      email_guardian: user.email_guardian ?? '',
      via: user.via ?? '',
      medical: user.medical ?? '',
      delete_possible: true,
      address: {
        street: user.street ?? '',
        house_number: user.house_number ?? '',
        municipality_name: user.municipality_name ?? '',
        box_number: user.box_number ?? '',
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

    validateAddress(
      updateUserDto.address.postalcode,
      updateUserDto.address.municipality_name,
    );

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
    user.municipality_name = updateUserDto.address.municipality_name;
    user.street = updateUserDto.address.street;
    user.house_number = updateUserDto.address.house_number;
    user.box_number = updateUserDto.address.box_number;

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
