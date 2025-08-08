-- Initialize database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user if not exists (for development)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_user
      WHERE  usename = 'pokemon') THEN

      CREATE USER pokemon WITH PASSWORD 'pokemon123';
   END IF;
END
$do$;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE pokemon_todo TO pokemon;
GRANT ALL ON SCHEMA public TO pokemon;