#!/bin/bash
set -e

# Ensure the database directory and sqlite file exist
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Ensure correct permissions for storage, bootstrap/cache, and database
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

if [ "$1" = "apache2-foreground" ]; then
    # Create the storage symlink so uploaded files are publicly accessible
    php artisan storage:link --force 2>/dev/null || true

    # Run database migrations as www-data to prevent root ownership of sqlite files
    su -s /bin/bash -c "php artisan migrate --force" www-data
fi

# Execute the main command (e.g. apache2-foreground or php artisan reverb:start)
exec "$@"
