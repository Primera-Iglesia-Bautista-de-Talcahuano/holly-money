-- ============================================================
-- RENAME ROLES: OPERATOR → BURSAR, VIEWER → FINANCE
-- Postgres enums cannot rename values, so the column must
-- round-trip through text.
-- ============================================================

-- Drop all RLS policies that depend on get_my_role() or reference old role literals
DROP POLICY IF EXISTS "users_insert"    ON users;
DROP POLICY IF EXISTS "users_update"    ON users;
DROP POLICY IF EXISTS "movements_insert" ON movements;
DROP POLICY IF EXISTS "movements_update" ON movements;

-- Drop functions that have user_role in their signature
DROP FUNCTION IF EXISTS get_my_role();
DROP FUNCTION IF EXISTS create_user_with_role(text, text, text, user_role);

-- Drop column default (typed against user_role enum) before dropping the type
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Convert column to text and remap values
ALTER TABLE users ALTER COLUMN role TYPE text;
UPDATE users SET role = 'BURSAR'  WHERE role = 'OPERATOR';
UPDATE users SET role = 'FINANCE' WHERE role = 'VIEWER';

-- Recreate enum with new values (MINISTER was added via ALTER in 20260426000001)
DROP TYPE user_role;
CREATE TYPE user_role AS ENUM ('ADMIN', 'BURSAR', 'FINANCE', 'MINISTER');
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Restore column default using new enum value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'FINANCE';

-- Recreate get_my_role()
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- Recreate create_user_with_role (body from 20260417024043_add_user_status.sql)
-- Default role changed: 'VIEWER' → 'FINANCE'
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT,
  p_role       user_role DEFAULT 'FINANCE'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF get_my_role() != 'ADMIN' THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  new_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    created_at, updated_at, role, aud, instance_id
  ) VALUES (
    new_id, p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '', '', '', '', '', '', '', '',
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id,
    jsonb_build_object('sub', new_id::text, 'email', p_email),
    'email', p_email,
    NOW(), NOW(), NOW()
  );

  INSERT INTO users (id, full_name, email, role, status)
  VALUES (new_id, p_full_name, p_email, p_role, 'ACTIVE');

  RETURN new_id;
END;
$$;

-- Restore users RLS policies (unchanged logic, just recreated after function drop)
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN');

-- Restore movements RLS policies with BURSAR in place of OPERATOR
CREATE POLICY "movements_insert" ON movements FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('ADMIN', 'BURSAR'));
CREATE POLICY "movements_update" ON movements FOR UPDATE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'BURSAR'));
