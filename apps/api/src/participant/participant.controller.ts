import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegistrationService } from '../registration/registration.service';
import { OtherProjectDto } from '../dto/other-project.dto';

@Controller('participant')
@ApiTags('participant')
@ApiCookieAuth()
export class ParticipantController {
  constructor(
      private registrationService: RegistrationService,
    ) { }

  @Post()
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createParticipant(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.registrationService.assignParticipant(req.user.id, participantDto.project_code);
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteParticipant(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.registrationService.unassignParticipant(req.user.id, participantDto.project_code);
  }
  
}
