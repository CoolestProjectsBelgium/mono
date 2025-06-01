import { Controller, Body, Post, HttpException, HttpStatus } from '@nestjs/common';
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
  @ApiResponse({ status: 201, description: 'Successfully created registration.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Info() info: InfoDto,
    @Body() createRegistrationDto: RegistrationDto,
  ) {
    try {
      await this.registrationService.create(info, createRegistrationDto);
    } catch (error) {
      console.error('Error during registration:', error);
      throw new HttpException('Internal server error.', HttpStatus.INTERNAL_SERVER_ERROR);  
    }
  }
}
