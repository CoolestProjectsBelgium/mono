import {
  Controller,
  Delete,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ParticipantService } from './participant.service';
import { ParticipantDto } from '../dto/participant.dto';
import { UserCookieInterceptor } from '../user-cookie.interceptor';
import { mapVoucherToParticipant } from './participant.mapper';

@Controller('participant')
@ApiTags('participant')
@ApiCookieAuth()
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createParticipant(
    @Request() req: { user: { id: number } },
  ): Promise<ParticipantDto> {
    const voucher = await this.participantService.generateParticipantVoucher(
      req.user.id,
    );
    return mapVoucherToParticipant({
      id: voucher.id,
      voucherGuid: voucher.getDataValue('voucherGuid') as string,
      participantId: voucher.getDataValue('participantId') as number | null,
      participant: null,
    });
  }

  @Delete('self')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async leaveProject(@Request() req: { user: { id: number } }) {
    await this.participantService.leaveProject(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-cookiecombo'))
  @UseInterceptors(UserCookieInterceptor)
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteParticipant(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
  ) {
    const removed = await this.participantService.removeParticipant(
      req.user.id,
      Number(id),
    );
    if (!removed) {
      throw new ForbiddenException('Cannot remove participant');
    }
    return { success: true };
  }
}
