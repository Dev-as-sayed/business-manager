-- Run as a PostgreSQL superuser:
--   psql -U postgres -f prisma/db.sql
--
-- Database: s_omnia_db
-- Role:     s_omnia_user
-- Password: StrongPassword123!

\set ON_ERROR_STOP on

DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 's_omnia_user') THEN
    CREATE ROLE s_omnia_user LOGIN PASSWORD 'StrongPassword123!';
  ELSE
    ALTER ROLE s_omnia_user WITH LOGIN PASSWORD 'StrongPassword123!';
  END IF;
END
$$;

ALTER ROLE s_omnia_user CREATEDB;

SELECT 'CREATE DATABASE s_omnia_db OWNER s_omnia_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 's_omnia_db')\gexec

ALTER DATABASE s_omnia_db OWNER TO s_omnia_user;

\connect s_omnia_db

GRANT ALL PRIVILEGES ON DATABASE s_omnia_db TO s_omnia_user;
GRANT ALL ON SCHEMA public TO s_omnia_user;
ALTER SCHEMA public OWNER TO s_omnia_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO s_omnia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO s_omnia_user;
