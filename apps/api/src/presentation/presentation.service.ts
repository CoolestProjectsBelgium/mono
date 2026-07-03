import { Injectable } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Readable } from 'stream';

@Injectable()
export class PresentationService {
    async generateSlideDeck(){

        const test = [
            { "type": "loopProjects", "view": "project-detail"  },
            { "type": "sponsor" },
            { "type": "map" }
        ]
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

    async generateSlide(eventId: number, index: number): Promise<StreamableFile> {
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

            await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 800px;
              height: 400px;
              background: linear-gradient(135deg, #4CAF50, #2196F3);
              font-family: Arial, sans-serif;
            }

            h1 {
              color: white;
              font-size: 64px;
            }
          </style>
        </head>
        <body>
          <h1>Hello World 👋</h1>
        </body>
        </html>
      `);

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
