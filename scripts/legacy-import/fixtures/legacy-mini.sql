SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
CREATE DATABASE IF NOT EXISTS `legacy` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `legacy`;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int NOT NULL,
  `azure_storage_container` varchar(255) DEFAULT NULL,
  `minAge` int DEFAULT NULL,
  `maxAge` int DEFAULT NULL,
  `minGuardianAge` int DEFAULT NULL,
  `maxRegistration` int DEFAULT NULL,
  `maxVoucher` int DEFAULT NULL,
  `officialStartDate` datetime DEFAULT NULL,
  `event_title` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `maxFileSize` int DEFAULT NULL,
  `eventBeginDate` datetime DEFAULT NULL,
  `registrationOpenDate` datetime DEFAULT NULL,
  `registrationClosedDate` datetime DEFAULT NULL,
  `projectClosedDate` datetime DEFAULT NULL,
  `eventEndDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `events` VALUES (
  1,'coolestproject',7,18,16,64,3,
  '2021-04-18 09:00:00','Coolest Projects 2021',
  '2021-01-01 00:00:00','2021-01-01 00:00:00',2147483647,
  '2021-01-01 00:00:00','2021-01-15 00:00:00','2021-03-01 00:00:00',
  '2021-04-01 00:00:00','2021-04-19 18:00:00'
);

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `account_type` varchar(32) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `accounts` VALUES (1,'jury@example.test','$2b$10$notarealhashvaluexxxxx','jury','2021-01-01 00:00:00','2021-01-01 00:00:00');

DROP TABLE IF EXISTS `tshirtgroups`;
CREATE TABLE `tshirtgroups` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `tshirtgroups` VALUES (1,'kids','2021-01-01 00:00:00','2021-01-01 00:00:00',1);

DROP TABLE IF EXISTS `tshirts`;
CREATE TABLE `tshirts` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eventId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `tshirts` VALUES (1,'M','2021-01-01 00:00:00','2021-01-01 00:00:00',1,1);

DROP TABLE IF EXISTS `tshirttranslations`;
CREATE TABLE `tshirttranslations` (
  `id` int NOT NULL,
  `language` varchar(8) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `TShirtId` int DEFAULT NULL,
  `EventId` int NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `tshirttranslations` VALUES (1,'en','Medium','2021-01-01 00:00:00','2021-01-01 00:00:00',1,1);

DROP TABLE IF EXISTS `tshirtgrouptranslations`;
CREATE TABLE `tshirtgrouptranslations` (
  `id` int NOT NULL,
  `language` varchar(8) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `TShirtGroupId` int DEFAULT NULL,
  `EventId` int NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `tshirtgrouptranslations` VALUES (1,'en','Kids','2021-01-01 00:00:00','2021-01-01 00:00:00',1,1);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL,
  `language` varchar(8) NOT NULL,
  `postalcode` int DEFAULT NULL,
  `municipality_name` varchar(30) DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `house_number` varchar(20) DEFAULT NULL,
  `box_number` varchar(20) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `sex` varchar(8) NOT NULL,
  `birthmonth` date DEFAULT NULL,
  `last_token` datetime DEFAULT NULL,
  `via` varchar(255) DEFAULT NULL,
  `medical` varchar(255) DEFAULT NULL,
  `gsm` varchar(13) DEFAULT NULL,
  `gsm_guardian` varchar(13) DEFAULT NULL,
  `internalinfo` varchar(2000) DEFAULT NULL,
  `email_guardian` varchar(254) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `sizeId` int DEFAULT NULL,
  `eventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `users` VALUES
 (1,'nl',1000,'Brussel','Secretstraat','1','2','owner@example.test','Ada','Lovelace','f','2008-05-01',NULL,'School X',NULL,'0470000001',NULL,NULL,'guardian@example.test','2021-02-01 00:00:00','2021-02-01 00:00:00',1,1),
 (2,'en',2000,'Antwerpen',NULL,NULL,NULL,'guest@example.test','Alan','Turing','m','2009-01-01',NULL,'',NULL,NULL,NULL,NULL,NULL,'2021-02-02 00:00:00','2021-02-02 00:00:00',1,1);

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `project_descr` varchar(4000) DEFAULT NULL,
  `project_type` varchar(100) DEFAULT NULL,
  `internalinfo` varchar(4000) DEFAULT NULL,
  `project_lang` varchar(8) DEFAULT NULL,
  `max_tokens` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ownerId` int DEFAULT NULL,
  `eventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `projects` VALUES (1,'Robot Cat','A cardboard robot cat','hardware','keep this note','nl',3,'2021-02-01 00:00:00','2021-02-01 00:00:00',1,1);

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
  `idx` int NOT NULL,
  `id` varchar(36) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `participantId` int DEFAULT NULL,
  `projectId` int DEFAULT NULL,
  `eventId` int DEFAULT NULL,
  PRIMARY KEY (`idx`)
);
INSERT INTO `vouchers` VALUES
 (1,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','2021-02-01 00:00:00','2021-02-01 00:00:00',1,1,1),
 (2,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','2021-02-02 00:00:00','2021-02-02 00:00:00',2,1,1),
 (3,'cccccccc-cccc-cccc-cccc-cccccccccccc','2021-02-03 00:00:00','2021-02-03 00:00:00',NULL,1,1);

DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  `mandatory` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `questions` VALUES (1,'Agreed to Photo',NULL,'2021-01-01 00:00:00','2021-01-01 00:00:00',1);

DROP TABLE IF EXISTS `questiontranslations`;
CREATE TABLE `questiontranslations` (
  `id` int NOT NULL,
  `language` varchar(8) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `positive` varchar(120) DEFAULT NULL,
  `negative` varchar(120) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `QuestionId` int DEFAULT NULL,
  `EventId` int NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `questiontranslations` VALUES (1,'en','Photo ok?','Yes','No','2021-01-01 00:00:00','2021-01-01 00:00:00',1,1);

DROP TABLE IF EXISTS `questionusers`;
CREATE TABLE `questionusers` (
  `UserId` int NOT NULL,
  `QuestionId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EventId` int NOT NULL,
  PRIMARY KEY (`UserId`,`QuestionId`)
);
INSERT INTO `questionusers` VALUES (1,1,'2021-02-01 00:00:00','2021-02-01 00:00:00',1);

DROP TABLE IF EXISTS `attachments`;
CREATE TABLE `attachments` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `confirmed` tinyint(1) DEFAULT NULL,
  `internal` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ProjectId` int DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `attachments` VALUES (1,'team photo',1,0,'2021-02-01 00:00:00','2021-02-01 00:00:00',1,'cat.jpg',1);

DROP TABLE IF EXISTS `azureblobs`;
CREATE TABLE `azureblobs` (
  `id` int NOT NULL,
  `container_name` varchar(255) DEFAULT NULL,
  `blob_name` varchar(255) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `AttachmentId` int DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `azureblobs` VALUES (1,'coolestproject','cat.jpg',4096,'2021-02-01 00:00:00','2021-02-01 00:00:00',1,1);

DROP TABLE IF EXISTS `hyperlinks`;
CREATE TABLE `hyperlinks` (
  `id` int NOT NULL,
  `href` varchar(1024) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `AttachmentId` int DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `hyperlinks` VALUES (1,'https://youtu.be/abc123','2021-02-01 00:00:00','2021-02-01 00:00:00',1,1);

DROP TABLE IF EXISTS `votecategories`;
CREATE TABLE `votecategories` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `min` int NOT NULL,
  `max` int NOT NULL,
  `public` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eventId` int DEFAULT NULL,
  `optional` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `votecategories` VALUES (1,'Creativity',1,10,0,'2021-01-01 00:00:00','2021-01-01 00:00:00',1,0);

DROP TABLE IF EXISTS `votes`;
CREATE TABLE `votes` (
  `id` int NOT NULL,
  `amount` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eventId` int DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  `projectId` int DEFAULT NULL,
  `accountId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `votes` VALUES (1,8,'2021-04-18 12:00:00','2021-04-18 12:00:00',1,1,1,1);

DROP TABLE IF EXISTS `awards`;
CREATE TABLE `awards` (
  `id` int NOT NULL,
  `VoteCategoryId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EventId` int DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `JurorId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `awards` VALUES (1,1,'2021-04-18 13:00:00','2021-04-18 13:00:00',1,1,1);

DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` int NOT NULL,
  `text` varchar(4000) DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `certificates` VALUES (1,'Well done',1,'2021-04-18 14:00:00','2021-04-18 14:00:00',1);

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL,
  `startAt` datetime DEFAULT NULL,
  `endAt` datetime DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `messages` VALUES (1,'2021-04-18 09:00:00','2021-04-18 18:00:00','Welcome',1);

DROP TABLE IF EXISTS `tables`;
CREATE TABLE `tables` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `maxPlaces` int DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eventId` int DEFAULT NULL,
  `LocationId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `tables` VALUES
 (20,'A1',4,NULL,'2021-01-01 00:00:00','2021-01-01 00:00:00',1,1),
 (21,'Unused',2,NULL,'2021-01-01 00:00:00','2021-01-01 00:00:00',1,1);

DROP TABLE IF EXISTS `projecttables`;
CREATE TABLE `projecttables` (
  `id` int NOT NULL,
  `usedPlaces` int DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `TableId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `projecttables` VALUES (1,2,1,20,'2021-04-18 00:00:00','2021-04-18 00:00:00','10:00:00','11:00:00',1);

DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` int NOT NULL,
  `text` varchar(255) DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `locations` VALUES (1,'Hall',1,'2021-01-01 00:00:00','2021-01-01 00:00:00');

DROP TABLE IF EXISTS `publicvotes`;
CREATE TABLE `publicvotes` (
  `id` int NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `projectId` int DEFAULT NULL,
  `EventId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `publicvotes` VALUES (1,'0470000000','2021-04-18 00:00:00','2021-04-18 00:00:00',1,1);
