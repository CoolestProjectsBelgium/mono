import { BadRequestException } from '@nestjs/common';

/**
 * The only render resolutions a Pi may request. Deliberately a short, fixed
 * list (not free-form width/height) so the render cache can't be blown up by
 * arbitrary sizes, and deliberately all 16:9 so `renderSlide`'s uniform
 * `transform: scale()` from the 1920x1080 authoring canvas always fits
 * exactly — no letterboxing/cropping math needed.
 */
export const PRESENTATION_RESOLUTIONS = [
  { key: '1280x720', width: 1280, height: 720 },
  { key: '1920x1080', width: 1920, height: 1080 },
  { key: '2560x1440', width: 2560, height: 1440 },
  { key: '3840x2160', width: 3840, height: 2160 },
] as const;

export type PresentationResolution = (typeof PRESENTATION_RESOLUTIONS)[number];

/** Every slide is authored (and every already-saved slide `body` is written) in this coordinate space. */
export const CANONICAL_RESOLUTION = { width: 1920, height: 1080 };

export const DEFAULT_PRESENTATION_RESOLUTION_KEY = '1920x1080';

/** Falls back to the canonical/default resolution when `key` is omitted; throws on an unsupported value. */
export function resolvePresentationResolution(
  key?: string,
): PresentationResolution {
  const target = PRESENTATION_RESOLUTIONS.find(
    (resolution) => resolution.key === (key ?? DEFAULT_PRESENTATION_RESOLUTION_KEY),
  );
  if (!target) {
    throw new BadRequestException(`Unsupported resolution "${key}"`);
  }
  return target;
}
