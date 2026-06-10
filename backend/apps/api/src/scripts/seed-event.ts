import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/sequelize';
import {
  EmailTemplate,
  Event,
  EventTable,
  Location,
  Question,
  QuestionTranslation,
  Tshirt,
  TshirtGroup,
  TshirtGroupTranslation,
  TshirtTranslation,
} from '@coolestprojects/database';
import { AppModule } from '../app.module';
import { seedDatabase } from '../seeder/seed';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const eventModel = app.get<typeof Event>(getModelToken(Event));
  const existing = await eventModel.findOne({
    attributes: ['id', 'event_title', 'eventBeginDate', 'eventEndDate'],
    where: {},
  });

  if (existing) {
    const now = new Date();
    const active =
      existing.eventBeginDate < now && existing.eventEndDate > now;
    console.log(
      `Event already exists: id=${existing.id} "${existing.event_title}" (active=${active})`,
    );
    await app.close();
    return;
  }

  await seedDatabase(
    eventModel,
    app.get<typeof TshirtGroup>(getModelToken(TshirtGroup)),
    app.get<typeof Question>(getModelToken(Question)),
    app.get<typeof QuestionTranslation>(getModelToken(QuestionTranslation)),
    app.get<typeof Tshirt>(getModelToken(Tshirt)),
    app.get<typeof TshirtGroupTranslation>(
      getModelToken(TshirtGroupTranslation),
    ),
    app.get<typeof Location>(getModelToken(Location)),
    app.get<typeof EventTable>(getModelToken(EventTable)),
    app.get<typeof EmailTemplate>(getModelToken(EmailTemplate)),
    app.get<typeof TshirtTranslation>(getModelToken(TshirtTranslation)),
  );

  const event = await eventModel.findOne({ attributes: ['id', 'event_title'] });
  console.log(`Seeded event id=${event?.id} "${event?.event_title}"`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
