import {
  Controller,
  Body,
  Post,
  Request,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { verify } from 'jsonwebtoken';
import { env } from 'process';
import type { Response } from 'express';
import { LoginActivateDto } from '../dto/login-activate.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginMailDto } from '../dto/logon-mail.dto';
import { RegistrationService } from '../registration/registration.service';
import { TokensService } from '../tokens/tokens.service';
import { MailerService } from '../mailer/mailer.service';
import { UserCookieInterceptor } from '../user-cookie.interceptor';
import { InjectModel } from '@nestjs/sequelize';
import { User, Registration } from '@coolestprojects/database';
import { UnauthorizedException } from '@nestjs/common';

@Controller('login')
@ApiTags('login')
export class LoginController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly tokensService: TokensService,
    private readonly mailerService: MailerService,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
  ) {}

  private buildLoginDto(user: User): LoginDto {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return {
      api_key: '',
      expires,
      language: user.language,
    };
  }

  @Post()
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async activateLogin(
    @Body() loginActivateDto: LoginActivateDto,
    @Request() req: { user?: User },
  ): Promise<LoginDto> {
    let payload: { registrationID?: number; userID?: number };
    try {
      payload = verify(loginActivateDto.jwt, env.JWT_KEY || '') as {
        registrationID?: number;
        userID?: number;
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    let user: User | null = null;
    if (payload.registrationID) {
      user = await this.registrationService.activateRegistration(
        payload.registrationID,
      );
    } else if (payload.userID) {
      user = await this.userModel.findByPk(payload.userID);
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = user;
    return this.buildLoginDto(user);
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { success: true };
  }

  @Post('mailToken')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async mailToken(@Body() loginMailDto: LoginMailDto): Promise<LoginDto> {
    const user = await this.userModel.findOne({
      where: { email: loginMailDto.email },
    });

    if (user) {
      const token = this.tokensService.generateLoginToken(user.id);
      await this.mailerService.loginMail(user, token);
      if (process.env.NODE_ENV === 'development') {
        console.info(`Login token for ${user.email}: ${token}`);
      }
      return this.buildLoginDto(user);
    }

    const registration = await this.registrationModel.findOne({
      where: { email: loginMailDto.email },
      order: [['id', 'DESC']],
    });

    if (registration) {
      const token = this.tokensService.generateRegistrationToken(registration.id);
      await this.mailerService.registrationMail(registration, token);
      if (process.env.NODE_ENV === 'development') {
        console.info(`Registration token for ${registration.email}: ${token}`);
      }
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return {
      api_key: '',
      expires,
      language: 'nl',
    };
  }
}
