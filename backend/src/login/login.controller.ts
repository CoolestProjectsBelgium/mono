import { Controller, Body, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginActivateDto } from '../dto/login-activate.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginMailDto } from '../dto/logon-mail.dto';

@Controller('login')
@ApiTags('login')
export class LoginController {
  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async activateLogin(
    @Body() loginActivateDto: LoginActivateDto,
  ): Promise<LoginDto> {
    return null;
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async logout() {
    return null;
  }

  @Post('mailToken')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async mailToken(@Body() loginMailDto: LoginMailDto) {
    return null;
  }
}
