-- ============================================================
-- ROLE PERMISSIONS TABLE
-- Stores which permissions each role has, configurable by ADMIN.
-- ============================================================

CREATE TABLE role_permissions (
  role        user_role NOT NULL,
  permission  text      NOT NULL,
  enabled     boolean   NOT NULL DEFAULT true,
  PRIMARY KEY (role, permission)
);

-- Seed default permission matrix
INSERT INTO role_permissions (role, permission, enabled) VALUES
  -- ADMIN: all permissions (immutable from UI)
  ('ADMIN', 'MANAGE_USERS',       true),
  ('ADMIN', 'CREATE_MOVEMENT',    true),
  ('ADMIN', 'VIEW_MOVEMENT',      true),
  ('ADMIN', 'MANAGE_MINISTRIES',  true),
  ('ADMIN', 'MANAGE_BUDGETS',     true),
  ('ADMIN', 'REVIEW_INTENTIONS',  true),
  ('ADMIN', 'SUBMIT_INTENTIONS',  true),
  ('ADMIN', 'MANAGE_SETTINGS',    true),
  ('ADMIN', 'VIEW_WORKFLOW',      true),
  -- BURSAR: operational permissions
  ('BURSAR', 'CREATE_MOVEMENT',   true),
  ('BURSAR', 'VIEW_MOVEMENT',     true),
  ('BURSAR', 'MANAGE_MINISTRIES', true),
  ('BURSAR', 'MANAGE_BUDGETS',    true),
  ('BURSAR', 'REVIEW_INTENTIONS', true),
  ('BURSAR', 'VIEW_WORKFLOW',     true),
  -- FINANCE: read-only monitoring
  ('FINANCE', 'VIEW_MOVEMENT',    true),
  ('FINANCE', 'VIEW_WORKFLOW',    true),
  -- MINISTER: fund request workflow
  ('MINISTER', 'SUBMIT_INTENTIONS', true),
  ('MINISTER', 'VIEW_WORKFLOW',     true);

-- RLS: all authenticated can read; only ADMIN can write
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rp_read"  ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "rp_write" ON role_permissions FOR ALL    TO authenticated USING (get_my_role() = 'ADMIN');
