import { Injectable } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Readable } from 'stream';
import { Slide, Event, Project } from '@coolestprojects/database';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class PresentationService {
    constructor(
        @InjectModel(Slide)
        private readonly slideModel: typeof Slide,
        @InjectModel(Event)
        private readonly eventModel: typeof Event,
        @InjectModel(Project)
        private readonly projectModel: typeof Project,
    ) { }

    async generateSlideDeck(eventId: number): Promise<void> {
        const slides = await this.slideModel.findAll({
            where: { eventId },
            order: [['position', 'ASC']],
        });

        for (const slide of slides) {
            let data: Event | Project[] | null = null;
            switch (slide.datasource) {
                case 'project':
                    data = await this.projectModel.findAll({ where: { eventId } });
                    break;
                case 'event':
                    data = await this.eventModel.findOne({ where: { id: eventId } });
                    break;
                default:
                    break;
            }

            const template = Handlebars.compile(slide.html, { noEscape: true });
            // if the slidedeck is a list we generate a slide for each item in the list, otherwise we generate a single slide
            for (const d of (data instanceof Array ? data : [data])) {
                if (d) {
                    const image = await this.generateSlide(d, template);
                    //todo save image
                }
            }

        }
    }

    async getSlideList(eventId: number) {
        return [
            {
                index: 1,
                time: 60,
                image_url: '/presentation/generate/1'
            },
            {
                index: 2,
                time: 60,
                image_url: '/presentation/generate/2'
            },
            {
                index: 3,
                time: 60,
                image_url: '/presentation/generate/3'
            }
        ]
    }

    async generateSlide(data: Event | Project | null, html: HandlebarsTemplateDelegate): Promise<StreamableFile> {
        const browser = await puppeteer.launch({
            headless: true,
        });

        try {
            const page = await browser.newPage();

            await page.setViewport({
                width: 800,
                height: 400,
                deviceScaleFactor: 2,
            });

            await page.setContent(html(data));

            const image = await page.screenshot({
                type: 'png',
            });

            return new StreamableFile(Readable.from(image), {
                type: 'image/png',
                disposition: 'inline',
            });

        } finally {
            await browser.close();
        }
    }
}
