import {
  Controller,
  Get,
  Body,
  Delete,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiCookieAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { UserDto } from '../dto/user.dto';
import { UserinfoService } from './userinfo.service';
import { UserCookieInterceptor } from '../user-cookie.interceptor';

@Controller('userinfo')
@ApiTags('userinfo')
@ApiCookieAuth('jwt-user-cookie')
export class UserinfoController {
  constructor(private readonly userinfoService: UserinfoService) {}

  @Get()
  @UseGuards(JwtUserAuthGuard)
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  getUserInfo(@Request() req: { user: { id: number } }): Promise<UserDto> {
    return this.userinfoService.getUserInfo(req.user.id);
  }

  @Delete()
  @UseGuards(JwtUserAuthGuard)
  @ApiSecurity('csrf')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  deleteUser(@Request() req: { user: { id: number } }) {
    return this.userinfoService.deleteUser(req.user.id);
  }

  @Patch()
  @UseGuards(JwtUserAuthGuard)
  @ApiSecurity('csrf')
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateUser(
    @Request() req: { user: { id: number } },
    @Body() updateUserDto: UserDto,
  ): Promise<UserDto> {
    return this.userinfoService.updateUser(req.user.id, updateUserDto);
  }
}
