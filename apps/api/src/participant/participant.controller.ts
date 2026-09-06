import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth, ApiSecurity } from '@nestjs/swagger';
import { Request, Body } from '@nestjs/common';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { RegistrationService } from '../registration/registration.service';
import { OtherProjectDto } from '../dto/other-project.dto';

@Controller('participant')
@ApiTags('participant')
@ApiCookieAuth('jwt-user-cookie')
export class ParticipantController {
  constructor(
      private registrationService: RegistrationService,
    ) { }

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiSecurity('csrf')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createParticipant(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.registrationService.assignParticipant(req.user.id, participantDto.project_code);
  }
  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiSecurity('csrf')
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteParticipant(
    @Request() req: any,
    @Body() participantDto: OtherProjectDto,
  ) {
    return this.registrationService.unassignParticipant(req.user.id, participantDto.project_code);
  }
  
}
