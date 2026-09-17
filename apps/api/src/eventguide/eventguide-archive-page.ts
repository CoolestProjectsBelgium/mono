import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as Handlebars from 'handlebars';
import { EventguideProjectDto } from '../dto/eventguide-project.dto';

Handlebars.registerHelper('nl2br', (text: string) => {
  const escaped = Handlebars.escapeExpression(text ?? '');
  return new Handlebars.SafeString(escaped.replace(/\n/g, '<br>'));
});

/**
 * Templates are plain `.hbs` files under `templates/` (see NestJS's own MVC
 * docs on storing views as files) — edit those, and the view model built in
 * `buildEventArchiveHtml`, to change the layout; nothing here needs to
 * change. Handlebars auto-escapes every `{{expr}}`, so project data (name,
 * participants, description) never needs manual escaping — only
 * `imageDataUri` and the `nl2br`-wrapped description opt into raw/escaped-then-safe HTML.
 */
function readTemplate(...segments: string[]): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'eventguide', 'templates', ...segments),
    path.join(__dirname, 'templates', ...segments),
  ];
  const file = candidates.find((candidate) => existsSync(candidate));
  if (!file) {
    throw new Error(
      `Archive template not found: ${path.join(...segments)} (looked in ${candidates.join(', ')})`,
    );
  }
  return readFileSync(file, 'utf8');
}

Handlebars.registerPartial(
  'projectCard',
  readTemplate('partials', 'project-card.hbs'),
);

const renderPage = Handlebars.compile(readTemplate('project-archive.hbs'));

interface ProjectCardView {
  name: string;
  place: string;
  languageLabel: string;
  participantsLabel: string;
  description: string;
  imageDataUri: string | null;
}

function formatPlace(
  project: Pick<EventguideProjectDto, 'tableNumber' | 'tableName'>,
): string {
  if (project.tableName) {
    return project.tableName;
  }
  if (project.tableNumber != null) {
    return `Table ${project.tableNumber}`;
  }
  return 'Unassigned';
}

function toCardView(
  project: EventguideProjectDto,
  imageDataUri: string | null,
): ProjectCardView {
  return {
    name: project.name,
    place: formatPlace(project),
    languageLabel: project.language.toUpperCase(),
    participantsLabel: project.participants.join(', ') || '—',
    description: project.description,
    imageDataUri,
  };
}

/** Single self-contained HTML file — every project plus its photo (as a base64 data URI) inlined, no server needed to view it afterward. */
export function buildEventArchiveHtml(options: {
  eventLabel: string;
  generatedAt: string;
  projects: EventguideProjectDto[];
  images: Map<number, string | null>;
}): string {
  const { eventLabel, generatedAt, projects, images } = options;

  return renderPage({
    eventLabel,
    generatedAt,
    projectCount: projects.length,
    projects: projects.map((project) =>
      toCardView(project, images.get(project.id) ?? null),
    ),
  });
}
