import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('participant')
@ApiTags('participant')
@ApiCookieAuth()
export class ParticipantController {
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createParticipant() {
    return null; //this.registrationService.createParticipant();
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteParticipant(id) {
    return null; //this.registrationService.createParticipant();
  }
}
