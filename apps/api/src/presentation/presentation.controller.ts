import { Controller, Delete, Post, UseGuards, StreamableFile, Get } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiCookieAuth, ApiSecurity } from '@nestjs/swagger';
import { PresentationService } from './presentation.service';
import { Info } from '../info.decorator';
import { InfoDto } from '../dto/info.dto';

@Controller('presentation')
@ApiTags('presentation')
export class PresentationController {
    constructor(private presentationService: PresentationService) {}

    @Get()
    async getSlideList(@Info() info: InfoDto) : Promise<SlideDto[]> {
        return this.presentationService.getSlideList(info.currentEvent);
    }

    @Post("generate")
    @ApiSecurity('csrf')
    async generateSlide(@Info() info: InfoDto, index: number) : Promise<StreamableFile>{
        return this.presentationService.generateSlide(info.currentEvent, index);
    }
}
