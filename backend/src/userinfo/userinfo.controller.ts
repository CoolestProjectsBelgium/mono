import { Controller, Get, Body, Delete, Patch } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UserDto } from '../dto/user.dto';

@Controller('userinfo')
@ApiTags('userinfo')
@ApiCookieAuth()
export class UserinfoController {
  @Get()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  getUserInfo(): Promise<UserDto> {
    return null;
  }

  @Delete()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  deleteUser() {
    return null;
  }

  @Patch()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateUser(@Body() updateUserDto: UserDto): Promise<UserDto> {
    return null;
  }
}
