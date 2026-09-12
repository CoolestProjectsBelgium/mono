import type { CreationAttributes } from 'sequelize';
import type { CertificateTemplate } from '@coolestprojects/database';

/**
 * Same brand palette as `seed-presentation-slides.ts` (teal primary,
 * bold geometric type) — no Google Fonts loaded here for the same "no
 * network from the rendered page" reason `toDataUri` exists for images.
 */
const FONT_STACK = "'Poppins','Trebuchet MS',Arial,sans-serif";
const TEAL = '#00AEA9';
const TEAL_DARK = '#008f8b';
const GOLD = '#c9a227';
const GRAY_900 = '#111827';
const GRAY_600 = '#4b5563';

function certificateBody(copy: {
  eyebrow: string;
  title: string;
  presentedTo: string;
  participatedIn: string;
  winnerPrefix: string;
  footerNote: string;
}): string {
  return `
<div style="box-sizing:border-box;width:100%;min-height:100vh;padding:48px;background:#ffffff;font-family:${FONT_STACK};">
  <div style="box-sizing:border-box;height:100%;padding:56px 72px;border:3px solid ${TEAL};border-radius:12px;text-align:center;position:relative;">
    {{#if (lookup assets 'logo.png')}}
    <img src="{{lookup assets 'logo.png'}}" style="max-height:64px;margin-bottom:24px;" />
    {{/if}}
    <div style="color:${TEAL_DARK};font-size:20px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">${copy.eyebrow}</div>
    <div style="color:${GRAY_900};font-size:48px;font-weight:800;margin-top:12px;">${copy.title}</div>

    <div style="color:${GRAY_600};font-size:20px;margin-top:40px;">${copy.presentedTo}</div>
    <div style="color:${GRAY_900};font-size:40px;font-weight:800;margin-top:8px;">{{participant.firstname}} {{participant.lastname}}</div>

    <div style="color:${GRAY_600};font-size:22px;margin-top:32px;">
      ${copy.participatedIn} <strong style="color:${GRAY_900};">{{project.name}}</strong>
    </div>

    {{#if certificate.text}}
    <div style="color:${GRAY_600};font-size:20px;line-height:1.6;max-width:720px;margin:28px auto 0;">
      {{certificate.text}}
    </div>
    {{/if}}

    {{#if award.won}}
    <div style="display:inline-block;margin-top:32px;padding:10px 28px;border-radius:999px;background:${GOLD};color:#ffffff;font-size:20px;font-weight:700;">
      ${copy.winnerPrefix} {{award.categoryName}}
    </div>
    {{/if}}

    <div style="color:#9ca3af;font-size:16px;margin-top:56px;">
      {{event.eventTitle}} &middot; {{year}}
    </div>
    <div style="color:#9ca3af;font-size:14px;margin-top:8px;">${copy.footerNote}</div>
  </div>
</div>
`.trim();
}

const BODY_EN = certificateBody({
  eyebrow: 'Certificate of Participation',
  title: 'Coolest Projects',
  presentedTo: 'This certificate is proudly presented to',
  participatedIn: 'for taking part with the project',
  winnerPrefix: 'Winner —',
  footerNote:
    'Thank you for sharing your creativity and hard work with us.',
});

const BODY_NL = certificateBody({
  eyebrow: 'Deelnamecertificaat',
  title: 'Coolest Projects',
  presentedTo: 'Dit certificaat wordt met trots uitgereikt aan',
  participatedIn: 'voor deelname met het project',
  winnerPrefix: 'Winnaar —',
  footerNote: 'Bedankt om je creativiteit en inzet met ons te delen.',
});

const BODY_FR = certificateBody({
  eyebrow: 'Certificat de participation',
  title: 'Coolest Projects',
  presentedTo: 'Ce certificat est fièrement remis à',
  participatedIn: 'pour sa participation avec le projet',
  winnerPrefix: 'Gagnant —',
  footerNote: 'Merci d’avoir partagé ta créativité et ton travail avec nous.',
});

/** Seed rows for `CertificateTemplate.bulkCreate`; caller stamps `eventId`. */
export function buildSeedCertificateTemplates(
  eventId: number,
): CreationAttributes<CertificateTemplate>[] {
  return [
    { eventId, language: 'en', bodyHtml: BODY_EN },
    { eventId, language: 'nl', bodyHtml: BODY_NL },
    { eventId, language: 'fr', bodyHtml: BODY_FR },
  ];
}
