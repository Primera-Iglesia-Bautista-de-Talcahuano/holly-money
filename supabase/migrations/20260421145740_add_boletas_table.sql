CREATE TYPE invoice_status AS ENUM ('PENDING', 'SETTLED');

CREATE TABLE invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT NOT NULL,
  date          DATE NOT NULL,
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description   TEXT,
  status        invoice_status NOT NULL DEFAULT 'PENDING',
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true);
