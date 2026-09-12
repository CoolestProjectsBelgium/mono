import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiCookieAuth,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { RegistrationDto } from '../dto/registration.dto';
import { Info } from '../info.decorator';
import { InfoDto } from '../dto/info.dto';
import { OptionalAdminCookieGuard } from '../auth/optional-admin-cookie.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('registration')
@ApiTags('registration')
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({
    description:
      'Admin cookie is optional: when present, the registration is attributed to that admin session; anonymous registration is otherwise allowed.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created registration.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiCookieAuth('admin-cookie')
  @ApiSecurity('csrf')
  @UseGuards(ThrottlerGuard, OptionalAdminCookieGuard)
  // Open, unauthenticated endpoint — throttle against scripted mass
  // registration (see security-assessment-2026-09.md H1).
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(
    @Info() info: InfoDto,
    @Body() createRegistrationDto: RegistrationDto,
  ) {
    try {
      await this.registrationService.create(info, createRegistrationDto);
    } catch (error) {
      console.error('Error during registration:', error);
      const message =
        error instanceof Error ? error.message : 'Internal server error.';
      // Client-facing validation / business-rule failures
      if (
        message.includes('mandatory questions') ||
        message.includes('age requirements') ||
        message.includes('Guardian') ||
        message.includes('guardian') ||
        message.includes('Project') ||
        message.includes('Registration is not open') ||
        message.includes('Event not found') ||
        message.includes('Validation') ||
        message.includes('isEmail')
      ) {
        throw new BadRequestException(message);
      }
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
