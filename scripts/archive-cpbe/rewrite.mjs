import path from 'node:path';

const BACKEND_PLANNING_RE =
  /https:\/\/backend\.coolestprojects\.be\/website\/planning\/\d+\/projects\.json/g;

/**
 * @param {number} planningId
 * @returns {number}
 */
export function planningIdToYear(planningId) {
  return planningId + 20;
}

/**
 * @param {number} planningId
 * @returns {string}
 */
export function planningIdToPageName(planningId) {
  return `projects${planningIdToYear(planningId)}`;
}

/**
 * @param {unknown} projects
 * @returns {boolean}
 */
export function shouldKeepPlanning(projects) {
  return Array.isArray(projects) && projects.length > 0;
}

/**
 * @param {string | undefined | null} url
 * @returns {string}
 */
export function stripSas(url) {
  if (!url) {
    return '';
  }
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
}

/**
 * @param {string} picUrl
 * @returns {string}
 */
export function attachmentFilename(picUrl) {
  try {
    const parsed = new URL(picUrl);
    const rscd = parsed.searchParams.get('rscd') || '';
    const starMatch = rscd.match(/filename\*=(?:UTF-8''|utf-8'')([^;]+)/i);
    if (starMatch) {
      return decodeURIComponent(starMatch[1].trim());
    }
    const quotedMatch = rscd.match(/filename="([^"]+)"/i);
    if (quotedMatch) {
      return quotedMatch[1];
    }
    const plainMatch = rscd.match(/filename=([^;]+)/i);
    if (plainMatch) {
      return plainMatch[1].trim().replace(/^"|"$/g, '');
    }
  } catch {
    // ignore invalid URLs in tests
  }
  return '';
}

/**
 * @param {Buffer | Uint8Array} buffer
 * @returns {string}
 */
export function extensionFromBytes(buffer) {
  if (!buffer || buffer.length < 4) {
    return '';
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e) {
    return '.png';
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return '.jpg';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'qt  ') {
      return '.mov';
    }
    if (brand.startsWith('heic') || brand.startsWith('mif1')) {
      return '.heic';
    }
    return '.mp4';
  }
  return '';
}

/**
 * @param {string} name
 * @returns {string}
 */
export function sanitizeBasename(name) {
  const base = path.basename(name);
  const cleaned = base.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, ' ');
  return cleaned.trim() || 'media';
}

/**
 * @param {string} picUrl
 * @param {Buffer | Uint8Array} buffer
 * @returns {string}
 */
export function resolveMediaFilename(picUrl, buffer) {
  const blobId = path.basename(stripSas(picUrl));
  const attachment = attachmentFilename(picUrl);
  const extFromBytes = extensionFromBytes(buffer);
  const extFromName = path.extname(attachment).toLowerCase();

  if (attachment) {
    let base = sanitizeBasename(attachment);
    if (!path.extname(base) && (extFromName || extFromBytes)) {
      base += extFromName || extFromBytes;
    }
    return base;
  }

  if (extFromBytes && !path.extname(blobId)) {
    return `${blobId}${extFromBytes}`;
  }

  return blobId;
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
export function isVideoFilename(filename) {
  return /\.(mp4|mov|webm|m4v)$/i.test(filename);
}

/**
 * @param {string} picUrl
 * @returns {string}
 */
export function picFilename(picUrl) {
  return path.basename(stripSas(picUrl));
}

/**
 * @param {number} planningId
 * @param {string} picUrl
 * @returns {string}
 */
export function localPicPath(planningId, picUrl) {
  return `./images/${planningId}/${picFilename(picUrl)}`;
}

/**
 * @param {number} planningId
 * @returns {string}
 */
export function localProjectsJsonPath(planningId) {
  return `./data/${planningId}/projects.json`;
}

/**
 * @param {string} source
 * @param {number} planningId
 * @returns {string}
 */
export function rewriteFetchUrl(source, planningId) {
  const local = localProjectsJsonPath(planningId);
  return source.replace(
    /fetch\s*\(\s*['"]https:\/\/backend\.coolestprojects\.be\/website\/planning\/\d+\/projects\.json['"]\s*\)/g,
    `fetch('${local}')`,
  );
}

/**
 * @param {string} html
 * @param {number} planningId
 * @returns {string}
 */
export function rewriteXhrUrl(html, planningId) {
  const local = localProjectsJsonPath(planningId);
  return html.replace(
    /xhttp\.open\s*\(\s*["']GET["']\s*,\s*["']https:\/\/backend\.coolestprojects\.be\/website\/planning\/\d+\/projects\.json["']\s*,\s*true\s*\)/g,
    `xhttp.open("GET", "${local}", true)`,
  );
}

/**
 * @param {string} source
 * @returns {string}
 */
export function stripBackendPlanningUrls(source) {
  return source.replace(BACKEND_PLANNING_RE, './data/PLANNING/projects.json');
}

/**
 * @param {object[]} projects
 * @param {number} planningId
 * @param {Map<number, string>} savedFilenames
 * @returns {object[]}
 */
export function rewriteProjects(projects, planningId, savedFilenames) {
  return projects.map((project) => {
    if (!project.pic) {
      return project;
    }
    const filename = savedFilenames.get(project.projectID);
    if (!filename) {
      const { pic, ...rest } = project;
      return rest;
    }
    return {
      ...project,
      pic: `./images/${planningId}/${filename}`,
    };
  });
}

/**
 * @param {number[]} keptPlanningIds
 * @returns {string}
 */
export function buildIndexHtml(keptPlanningIds) {
  const links = keptPlanningIds
    .map((id) => {
      const year = planningIdToYear(id);
      const page = planningIdToPageName(id);
      return `    <li><a href="./${page}.html">Coolest Projects 20${String(year).slice(-2)}</a></li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Coolest Projects Belgium — project galleries</title>
  <link href="./vendor/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container py-4">
  <h1>Coolest Projects Belgium</h1>
  <p>Archived project galleries (offline snapshot).</p>
  <ul>
${links}
  </ul>
</body>
</html>
`;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function rewriteVendorUrls(html) {
  return html
    .replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.0-alpha3\/dist\/css\/bootstrap\.min\.css/g,
      './vendor/bootstrap.min.css',
    )
    .replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.0-alpha3\/dist\/js\/bootstrap\.bundle\.min\.js/g,
      './vendor/bootstrap.bundle.min.js',
    )
    .replace(
      /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/dompurify\/3\.0\.6\/purify\.min\.js/g,
      './vendor/purify.min.js',
    )
    .replace(/\s*<link rel="stylesheet" href="https:\/\/use\.typekit\.net\/[^"]+">\s*/g, '\n');
}

/**
 * Legacy CoderDojo banner filename (spaces). Used only when fetching the source image.
 * @param {number} year two-digit (21–26) or four-digit
 * @returns {string}
 */
export function remoteBannerFilename(year) {
  return `coolestprojects website 20${String(year).slice(-2)}.png`;
}

/**
 * Local banner filename. Hyphens avoid Apache 404s from `%20` in the on-disk name.
 * @param {number} year two-digit (21–26) or four-digit
 * @returns {string}
 */
export function localBannerFilename(year) {
  return `coolestprojects-website-20${String(year).slice(-2)}.png`;
}

/**
 * @param {string} html
 * @param {number} year
 * @returns {string}
 */
export function rewriteBannerUrl(html, year) {
  const local = localBannerFilename(year);
  return html.replace(
    /\.\/images\/coolestprojects%20website%20\d+\.png/g,
    `./banners/${local}`,
  );
}

const GALLERY_MEDIA_HELPER = `
function cpbeMediaTag(pic) {
    if (!pic || pic === ' ') {
        return '<img class="card-img" src=" " alt="">';
    }
    const lower = String(pic).toLowerCase();
    if (/\\.(mp4|mov|webm|m4v)(\\?|$)/.test(lower)) {
        return '<video class="card-img" src="' + pic + '" controls playsinline preload="metadata"></video>';
    }
    return '<img class="card-img" src="' + pic + '" alt="">';
}
`;

/**
 * @param {string} source
 * @returns {string}
 */
export function patchGalleryJs(source) {
  if (!source.includes('cpbeMediaTag') && source.includes('<img class="card-img"')) {
    let patched = GALLERY_MEDIA_HELPER + source;
    patched = patched.replace(
      /<img class="card-img" src="\$\{\(card\.pic === undefined\) \? " " : card\.pic\}" alt="\/">/g,
      '${cpbeMediaTag((card.pic === undefined) ? " " : card.pic)}',
    );
    patched = patched.replace(
      /<img class="card-img" src="\$\{card\.pic\}" alt="\/">/g,
      '${cpbeMediaTag(card.pic)}',
    );
    return patched;
  }
  return source;
}
