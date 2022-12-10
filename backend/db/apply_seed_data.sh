psql \
    --single-transaction \
    --variable ON_ERROR_STOP=1 \
    --dbname "$DB_CONNECTION_STRING" \
    --file "schema.sql"

psql \
    --single-transaction \
    --variable ON_ERROR_STOP=1 \
    --dbname "$DB_CONNECTION_STRING" \
    --file "users_rows.sql"

psql \
    --single-transaction \
    --variable ON_ERROR_STOP=1 \
    --dbname "$DB_CONNECTION_STRING" \
    --file "templates_rows.sql"

psql \
    --single-transaction \
    --variable ON_ERROR_STOP=1 \
    --dbname "$DB_CONNECTION_STRING" \
    --file "models_rows.sql"