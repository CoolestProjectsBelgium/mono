import type { CreationAttributes } from 'sequelize';
import type { PresentationSlide } from '@coolestprojects/database';

/**
 * Slide bodies mirror apps/eventguide's brand (tailwind.config.ts): teal
 * primary (#00AEA9), #f5f7fa hero background, bold geometric display type.
 * Google Fonts aren't loaded here — same "no network from the rendered
 * page" reasoning as `toDataUri` for images — so a bold system-font stack
 * stands in for League Spartan.
 */
const FONT_STACK = "'Poppins','Trebuchet MS',Arial,sans-serif";
const TEAL = '#00AEA9';
const TEAL_DARK = '#008f8b';
const HERO_BG = '#f5f7fa';
const GRAY_900 = '#111827';
const GRAY_700 = '#374151';
const GRAY_500 = '#6b7280';
const GRAY_200 = '#e5e7eb';

const PROJECT_SPOTLIGHT_BODY = `
<div style="width:1920px;height:1080px;display:flex;flex-direction:column;background:${HERO_BG};font-family:${FONT_STACK};overflow:hidden;">
  <div style="background:${TEAL};padding:32px 96px;display:flex;align-items:center;justify-content:space-between;">
    <div style="color:#ffffff;font-size:36px;font-weight:800;letter-spacing:1px;">COOLEST PROJECTS</div>
    {{#if record.tableNumber}}
    <div style="background:#ffffff;color:${TEAL_DARK};font-weight:700;font-size:28px;padding:10px 28px;border-radius:999px;">Table {{record.tableNumber}}</div>
    {{/if}}
  </div>
  <div style="flex:1;display:flex;align-items:center;padding:48px 96px;gap:64px;min-height:0;">
    {{#if record.thumbnailDataUri}}
    <div style="flex:0 0 600px;height:600px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
      <img src="{{record.thumbnailDataUri}}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
    {{/if}}
    <div style="flex:1;">
      <div style="font-size:72px;font-weight:800;color:${GRAY_900};line-height:1.05;margin-bottom:24px;">{{record.name}}</div>
      <div style="font-size:30px;color:${GRAY_700};line-height:1.5;max-width:900px;">{{record.description}}</div>
    </div>
  </div>
  <div style="background:#ffffff;border-top:1px solid ${GRAY_200};padding:20px 96px;font-size:22px;color:${GRAY_500};">
    {{event.eventTitle}} &middot; {{year}}
  </div>
</div>
`.trim();

const PROJECT_OVERVIEW_BODY = `
<div style="width:1920px;height:1080px;display:flex;flex-direction:column;background:#ffffff;font-family:${FONT_STACK};">
  <div style="background:${TEAL};padding:40px 96px;">
    <div style="color:#ffffff;font-size:44px;font-weight:800;">All Projects</div>
    <div style="color:#e0fbfa;font-size:26px;margin-top:8px;">{{event.eventTitle}}</div>
  </div>
  <div style="flex:1;padding:56px 96px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:28px;background:${HERO_BG};">
    {{#each records}}
    <div style="width:428px;background:#ffffff;border:1px solid ${GRAY_200};border-radius:16px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
      {{#if this.tableNumber}}
      <div style="color:${TEAL};font-weight:700;font-size:22px;margin-bottom:8px;">Table {{this.tableNumber}}</div>
      {{/if}}
      <div style="font-weight:700;font-size:30px;color:${GRAY_900};">{{this.name}}</div>
    </div>
    {{/each}}
  </div>
</div>
`.trim();

const SPONSOR_THANKS_BODY = `
<div style="width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${HERO_BG};font-family:${FONT_STACK};text-align:center;">
  <div style="font-size:64px;font-weight:800;color:${GRAY_900};margin-bottom:16px;">Thank You to Our Sponsors</div>
  <div style="font-size:28px;color:${GRAY_700};margin-bottom:64px;">{{event.eventTitle}} wouldn&apos;t be possible without your support</div>
  <div style="display:flex;gap:48px;flex-wrap:wrap;justify-content:center;max-width:1400px;">
    <div style="width:320px;height:180px;background:#ffffff;border:1px solid ${GRAY_200};border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
      {{#if (lookup assets 'sponsor-logo.png')}}
      <img src="{{lookup assets 'sponsor-logo.png'}}" style="max-width:80%;max-height:80%;" />
      {{else}}
      <div style="color:${TEAL};font-size:26px;font-weight:700;">Sponsor logo here</div>
      {{/if}}
    </div>
  </div>
  <div style="margin-top:56px;font-size:22px;color:#9ca3af;">
    Upload sponsor logos in Presentation Assets, then reference one with &#123;&#123;lookup assets 'filename.png'&#125;&#125;
  </div>
</div>
`.trim();

/** Seed rows for `PresentationSlide.bulkCreate`; caller stamps `eventId`. */
export function buildSeedPresentationSlides(
  eventId: number,
): CreationAttributes<PresentationSlide>[] {
  return [
    {
      eventId,
      order: 10,
      title: 'All projects overview',
      dataSource: 'projects',
      cardinality: 'single',
      body: PROJECT_OVERVIEW_BODY,
      time: 8,
      imagePath: null,
    },
    {
      eventId,
      order: 20,
      title: 'Project spotlight',
      dataSource: 'projects',
      cardinality: 'perRecord',
      body: PROJECT_SPOTLIGHT_BODY,
      time: 10,
      imagePath: null,
    },
    {
      eventId,
      order: 30,
      title: 'Thank you sponsors',
      dataSource: 'none',
      cardinality: 'single',
      body: SPONSOR_THANKS_BODY,
      time: 6,
      imagePath: null,
    },
  ];
}
