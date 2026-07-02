#!/usr/bin/env bash
# Idempotent schema patches for existing dev databases (Sequelize synchronize does not always ALTER).
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-coolestproject}"
DB_NAME="${DB_NAME:-coolestproject}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD is required}"

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<'SQL'
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Projects'
    AND COLUMN_NAME = 'removedAt'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE Projects ADD COLUMN removedAt DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SQL
