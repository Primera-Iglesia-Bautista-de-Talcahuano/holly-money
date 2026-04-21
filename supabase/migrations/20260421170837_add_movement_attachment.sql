ALTER TABLE movements ADD COLUMN attachment_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('movement-attachments', 'movement-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "authenticated users can upload movement attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'movement-attachments');

CREATE POLICY "movement attachments are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'movement-attachments');
