#!/bin/bash
set -e

# Ensure the database directory and sqlite file exist
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Ensure correct permissions for storage, bootstrap/cache, and database
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Run database migrations
php artisan migrate --force

# Execute the main command (e.g. apache2-foreground or php artisan reverb:start)
exec "$@"
