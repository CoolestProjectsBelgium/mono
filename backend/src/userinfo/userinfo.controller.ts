import { Controller, Get, Body, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('userinfo')
@ApiTags('userinfo')
@ApiCookieAuth()
export class UserinfoController {
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  getUserInfo(): Promise<UserDto> {
    return null;
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  deleteUser() {
    return null;
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateUser(@Body() updateUserDto: UserDto): Promise<UserDto> {
    return null;
  }
}
