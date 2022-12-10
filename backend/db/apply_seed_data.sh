psql \
    --single-transaction \
    --variable ON_ERROR_STOP=1 \
    --dbname "$DB_CONNECTION_STRING" \
    --file "seed_data.sql"