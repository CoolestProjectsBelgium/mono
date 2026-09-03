import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractVotingSchema, looksLikeFullAzureDump } from './extract-voting.mjs';

const dump = `
CREATE DATABASE \`mysql\`;
USE \`mysql\`;
CREATE TABLE \`user\` (id int);
INSERT INTO \`user\` VALUES (1);
USE \`archief\`;
CREATE TABLE \`projects_2019\` (id int);
USE \`voting\`;
CREATE TABLE \`events\` (
  \`id\` int NOT NULL
) /*!50100 TABLESPACE \`innodb_system\` */ ENGINE=InnoDB;
INSERT INTO \`events\` VALUES (1);
/*!50001 DROP VIEW IF EXISTS \`contactlist\`*/;
DROP TABLE IF EXISTS \`contactlist\`;
/*!50001 DROP VIEW IF EXISTS \`contactlist\`*/;
/*!50001 CREATE VIEW \`contactlist\` AS SELECT 1 AS \`firstname\`*/;
SET character_set_client = @saved_cs_client;
-- Dumping routines for database 'voting'
DELIMITER ;;
CREATE DEFINER=\`tom\`@\`%\` PROCEDURE \`statistics-update\`()
BEGIN
SELECT 1;
END ;;
DELIMITER ;
USE \`mysql\`;
CREATE TABLE \`db\` (id int);
USE \`voting\`;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=\`tom\`@\`%\` SQL SECURITY DEFINER */
/*!50001 VIEW \`contactlist\` AS select 1 AS \`firstname\` */;
`;

test('extractVotingSchema keeps voting tables and drops mysql, archief, views, procedures', () => {
  const sql = extractVotingSchema(dump);
  assert.match(sql, /USE `legacy`;/);
  assert.match(sql, /CREATE TABLE `events`/);
  assert.match(sql, /INSERT INTO `events` VALUES \(1\);/);
  assert.doesNotMatch(sql, /innodb_system/);
  assert.doesNotMatch(sql, /USE `mysql`/);
  assert.doesNotMatch(sql, /USE `archief`/);
  assert.doesNotMatch(sql, /projects_2019/);
  assert.doesNotMatch(sql, /CREATE TABLE `user`/);
  assert.doesNotMatch(sql, /statistics-update/);
  assert.doesNotMatch(sql, /CREATE VIEW/);
  assert.doesNotMatch(sql, /DELIMITER/);
});

test('looksLikeFullAzureDump detects system schemas', () => {
  assert.equal(looksLikeFullAzureDump(dump), true);
  assert.equal(looksLikeFullAzureDump('CREATE TABLE events (id int);'), false);
});
