#!/bin/bash

# Database Restore Script for Civic Issue Monitoring System
# Usage: ./restore.sh <backup_file>

set -e

# Configuration
DB_NAME="${DB_NAME:-civic_issues}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    echo "Example: ./restore.sh backups/civic_issues_full_20240113_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will overwrite the existing database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Extract backup if compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Extracting compressed backup..."
    gunzip -k "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

echo "Restoring database from: $BACKUP_FILE"

# Restore database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

echo "Database restore completed successfully!"

# Cleanup extracted file if it was compressed
if [[ "$1" == *.gz ]]; then
    rm "$BACKUP_FILE"
fi
