import { Controller, Body, Post } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { RegistrationDto } from '../dto/registration.dto';
import { Info } from '../info.decorator';
import { InfoDto } from '../dto/info.dto';

@Controller('registration')
@ApiTags('registration')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post()
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Info() info: InfoDto,
    @Body() createRegistrationDto: RegistrationDto,
  ) {
    await this.registrationService.create(info, createRegistrationDto);
  }
}
