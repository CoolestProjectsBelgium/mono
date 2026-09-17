import { buildEventArchiveHtml } from './eventguide-archive-page';
import type { EventguideProjectDto } from '../dto/eventguide-project.dto';

describe('buildEventArchiveHtml', () => {
  const project: EventguideProjectDto = {
    id: 1,
    name: '<b>Escape room</b>',
    description: 'Line one\nLine two',
    language: 'nl',
    tableNumber: 46,
    tableName: '6_Table_46',
    participants: ['Tobe Claes', '<img onerror=alert(1)>'],
    agreedToPhoto: true,
    thumbnailUrl: '/eventguide/attachments/1/thumbnail',
  };

  it('escapes untrusted project fields (Handlebars auto-escaping)', () => {
    const html = buildEventArchiveHtml({
      eventLabel: 'Coolest Projects 2026',
      generatedAt: '2026-09-17T00:00:00.000Z',
      projects: [project],
      images: new Map(),
    });

    expect(html).toContain('&lt;b&gt;Escape room&lt;/b&gt;');
    expect(html).toContain('&lt;img onerror&#x3D;alert(1)&gt;');
    expect(html).not.toContain('<img onerror=alert');
    expect(html).toContain('Line one<br>Line two');
  });

  it('embeds the resolved image as a data URI and omits <img> when none is available', () => {
    const withImage = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [project],
      images: new Map([[1, 'data:image/png;base64,AAAA']]),
    });
    expect(withImage).toContain('src="data:image/png;base64,AAAA"');

    const withoutImage = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [{ ...project, thumbnailUrl: null }],
      images: new Map(),
    });
    expect(withoutImage).not.toContain('<img');
  });

  it('falls back to a placeholder when a project has no participants', () => {
    const html = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [{ ...project, participants: [] }],
      images: new Map(),
    });
    expect(html).toContain('<p class="participants">—</p>');
  });

  it('falls back to a table label, then Unassigned, when no table name is set', () => {
    const withNumberOnly = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [{ ...project, tableName: null, tableNumber: 12 }],
      images: new Map(),
    });
    expect(withNumberOnly).toContain('Table 12');

    const withNeither = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [{ ...project, tableName: null, tableNumber: null }],
      images: new Map(),
    });
    expect(withNeither).toContain('Unassigned');
  });

  it('stays self-contained: no external script/stylesheet references', () => {
    const html = buildEventArchiveHtml({
      eventLabel: 'Event',
      generatedAt: 'now',
      projects: [project],
      images: new Map(),
    });
    expect(html).not.toMatch(/<script src="https?:/);
    expect(html).not.toMatch(/<link[^>]+href="https?:/);
  });
});
