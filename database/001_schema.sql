-- HomeFix PostgreSQL schema
-- Re-runnable migration: drops and recreates the HomeFix database objects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS service_professionals CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROFESSIONAL', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL CHECK (password_hash <> ''),
  phone VARCHAR(30),
  address TEXT,
  location VARCHAR(80) NOT NULL CHECK (location IN ('Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan')),
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  profession VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  location VARCHAR(80) NOT NULL CHECK (location IN ('Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan')),
  experience_years INTEGER NOT NULL CHECK (experience_years BETWEEN 0 AND 60),
  rating NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  profile_image_url TEXT NOT NULL CHECK (profile_image_url LIKE 'https://%'),
  availability VARCHAR(120) NOT NULL,
  bio TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A professional can offer many services and a service can have many professionals.
CREATE TABLE service_professionals (
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (service_id, professional_id)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5),
  location VARCHAR(80) NOT NULL CHECK (location IN ('Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan')),
  notes TEXT,
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (booking_date >= DATE '2026-01-01')
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) >= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bookings_user_id_idx ON bookings(user_id);
CREATE INDEX bookings_service_id_idx ON bookings(service_id);
CREATE INDEX bookings_professional_id_idx ON bookings(professional_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_professional_id_idx ON reviews(professional_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER professionals_set_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
