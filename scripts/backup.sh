#!/bin/bash

# Database Backup Script for Civic Issue Monitoring System
# Usage: ./backup.sh [backup_type]
# backup_type: full, schema, data

set -e

# Configuration
DB_NAME="${DB_NAME:-civic_issues}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to perform full backup
full_backup() {
    echo "Performing full database backup..."
    BACKUP_FILE="$BACKUP_DIR/civic_issues_full_$TIMESTAMP.sql"
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-acl \
        --file="$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "Full backup completed: ${BACKUP_FILE}.gz"
}

# Function to backup schema only
schema_backup() {
    echo "Performing schema-only backup..."
    BACKUP_FILE="$BACKUP_DIR/civic_issues_schema_$TIMESTAMP.sql"
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --schema-only \
        --no-owner \
        --no-acl \
        --file="$BACKUP_FILE"
    
    gzip "$BACKUP_FILE"
    echo "Schema backup completed: ${BACKUP_FILE}.gz"
}

# Function to backup data only
data_backup() {
    echo "Performing data-only backup..."
    BACKUP_FILE="$BACKUP_DIR/civic_issues_data_$TIMESTAMP.sql"
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --data-only \
        --no-owner \
        --no-acl \
        --file="$BACKUP_FILE"
    
    gzip "$BACKUP_FILE"
    echo "Data backup completed: ${BACKUP_FILE}.gz"
}

# Function to cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    echo "Cleaning up old backups..."
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete
    echo "Old backups cleaned up"
}

# Main execution
BACKUP_TYPE="${1:-full}"

case "$BACKUP_TYPE" in
    full)
        full_backup
        ;;
    schema)
        schema_backup
        ;;
    data)
        data_backup
        ;;
    *)
        echo "Invalid backup type. Use: full, schema, or data"
        exit 1
        ;;
esac

cleanup_old_backups

echo "Backup process completed successfully!"
