const VIEW_OR_ROUTINE_CUT =
  /\n-- Dumping routines|\nDELIMITER ;;|\nCREATE DEFINER=/;

const TEMP_VIEW_BLOCK =
  /DROP TABLE IF EXISTS `[^`]+`;\s*\/\*!50001 DROP VIEW IF EXISTS[\s\S]*?SET character_set_client = @saved_cs_client;/g;

const CREATE_VIEW_COMMENT = /\/\*!50001 CREATE[\s\S]*?VIEW[\s\S]*?\*\//g;

export function extractVotingSchema(sql, { database = 'legacy' } = {}) {
  const sections = splitByUse(sql);
  let body;
  if (sections.length === 0) {
    body = sql;
  } else {
    const voting = sections.filter((section) => section.name === 'voting');
    if (voting.length === 0) {
      throw new Error('No `voting` database found in dump');
    }
    body = voting[0].body;
  }

  const cut = body.search(VIEW_OR_ROUTINE_CUT);
  if (cut !== -1) {
    body = body.slice(0, cut);
  }
  body = body.replace(TEMP_VIEW_BLOCK, '');
  body = body.replace(CREATE_VIEW_COMMENT, '');
  body = body.replace(/\/\*!50100 TABLESPACE `innodb_system` \*\//g, '');
  body = body.replace(/CREATE DATABASE[\s\S]*?;/gi, '');

  if (/\bUSE `mysql`|\bUSE `archief`/.test(body)) {
    throw new Error('Extracted voting schema still contains mysql or archief');
  }

  const preamble = [
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS=0;',
    'SET UNIQUE_CHECKS=0;',
    "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';",
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    `USE \`${database}\`;`,
    '',
  ].join('\n');

  return `${preamble}\n${body.trim()}\n`;
}

export function splitByUse(sql) {
  const re = /^USE `([^`]+)`;/gm;
  const matches = [...sql.matchAll(re)];
  const sections = [];
  for (let i = 0; i < matches.length; i += 1) {
    const name = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : sql.length;
    sections.push({ name, body: sql.slice(start, end) });
  }
  return sections;
}

export function looksLikeFullAzureDump(sql) {
  return /USE `mysql`/.test(sql) || /USE `archief`/.test(sql) || /USE `voting`/.test(sql);
}
