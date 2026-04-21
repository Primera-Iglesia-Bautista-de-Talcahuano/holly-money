ALTER TABLE invoices ADD COLUMN attachment_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-attachments', 'invoice-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "authenticated users can upload invoice attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoice-attachments');

CREATE POLICY "invoice attachments are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'invoice-attachments');
