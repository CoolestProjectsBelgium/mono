import {
  Account,
  Event,
  EventTable,
  Project,
  Vote,
  VoteCategory,
} from '@coolestprojects/database';
import { Op, Sequelize } from 'sequelize';

export const VOTING_TEST_PROJECTS = [
  {
    name: 'Line Following Robot',
    language: 'en' as const,
    type: 'Technology',
    description:
      'A small robot that follows a black line using infrared sensors and an Arduino.',
    maxVoucher: 3,
  },
  {
    name: 'Weather Dashboard',
    language: 'en' as const,
    type: 'Technology',
    description:
      'Reads temperature and humidity from a sensor and shows live values on a web page.',
    maxVoucher: 3,
  },
  {
    name: 'Slimme Kas',
    language: 'nl' as const,
    type: 'Technology',
    description:
      'Automatische kas met bodemvochtsensoren en een pomp die water geeft wanneer het droog is.',
    maxVoucher: 3,
  },
  {
    name: 'Muziekmachine',
    language: 'nl' as const,
    type: 'Art',
    description:
      'Een instrument gemaakt met Makey Makey en Scratch dat geluiden speelt via geleidende objecten.',
    maxVoucher: 3,
  },
  {
    name: 'Station Météo Junior',
    language: 'fr' as const,
    type: 'Technology',
    description:
      'Affiche la température et l’humidité sur un écran LCD avec un capteur DHT11.',
    maxVoucher: 3,
  },
  {
    name: 'Labyrinthe LED',
    language: 'fr' as const,
    type: 'Games',
    description:
      'Jeu de labyrinthe avec une bille et des LED qui s’allument quand le joueur réussit un passage.',
    maxVoucher: 3,
  },
];

export async function assignProjectsToEventTables(
  eventId: number,
  eventTableModel: typeof EventTable,
  projects: Project[],
): Promise<void> {
  const availableTables = await eventTableModel.findAll({
    where: { eventId, projectId: null },
    order: [['id', 'ASC']],
  });

  const activeProjects = projects.filter((project) => !project.deletedAt);
  for (let i = 0; i < activeProjects.length && i < availableTables.length; i++) {
    await availableTables[i].update({ projectId: activeProjects[i].id });
  }
}

export async function findActiveEvent(
  eventModel: typeof Event,
): Promise<Event | null> {
  const active = await eventModel.findOne({
    where: {
      eventBeginDate: { [Op.lt]: Sequelize.literal('CURDATE()') },
      eventEndDate: { [Op.gt]: Sequelize.literal('CURDATE()') },
    },
    order: [['id', 'DESC']],
  });
  if (active) {
    return active;
  }

  return eventModel.findOne({ order: [['id', 'DESC']] });
}

/**
 * Ensures jury-scoring projects exist for the active event and are linked to event tables.
 * Safe to run on an existing dev database (skips when enough table-linked projects exist).
 */
export async function ensureVotingTestProjects(
  eventModel: typeof Event,
  eventTableModel: typeof EventTable,
  projectModel: typeof Project,
  voteCategoryModel: typeof VoteCategory,
  voteModel: typeof Vote,
  accountModel: typeof Account,
): Promise<{ created: number; linked: number }> {
  const activeEvent = await findActiveEvent(eventModel);
  if (!activeEvent) {
    throw new Error('No active event found for voting fixtures');
  }

  const votingStartDate = new Date();
  votingStartDate.setDate(new Date().getDate() - 1);
  const votingEndDate = new Date();
  votingEndDate.setDate(new Date().getDate() + 30);
  await activeEvent.update({ votingStartDate, votingEndDate });

  await voteCategoryModel.update(
    { public: false },
    { where: { eventId: activeEvent.id } },
  );

  let linkedCount = 0;
  for (const project of await projectModel.findAll({
    where: { eventId: activeEvent.id, deletedAt: null },
  })) {
    const table = await eventTableModel.findOne({ where: { projectId: project.id } });
    if (table) {
      linkedCount += 1;
    }
  }

  let createdProjects: Project[] = [];
  if (linkedCount < 3) {
    createdProjects = await projectModel.bulkCreate(
      VOTING_TEST_PROJECTS.map((project) => ({
        ...project,
        eventId: activeEvent.id,
      })),
    );
    await assignProjectsToEventTables(
      activeEvent.id,
      eventTableModel,
      createdProjects,
    );
  }

  const unlinkedProjects: Project[] = [];
  for (const project of await projectModel.findAll({
    where: { eventId: activeEvent.id, deletedAt: null },
  })) {
    const table = await eventTableModel.findOne({ where: { projectId: project.id } });
    if (!table) {
      unlinkedProjects.push(project);
    }
  }
  if (unlinkedProjects.length > 0) {
    await assignProjectsToEventTables(
      activeEvent.id,
      eventTableModel,
      unlinkedProjects,
    );
  }

  const jury = await accountModel.findOne({
    where: { email: 'jury', account_type: 'jury' },
  });
  if (jury) {
    await voteModel.destroy({ where: { accountId: jury.id } });
  }

  let finalLinked = 0;
  for (const project of await projectModel.findAll({
    where: { eventId: activeEvent.id, deletedAt: null },
  })) {
    const table = await eventTableModel.findOne({ where: { projectId: project.id } });
    if (table) {
      finalLinked += 1;
    }
  }

  return { created: createdProjects.length, linked: finalLinked };
}
