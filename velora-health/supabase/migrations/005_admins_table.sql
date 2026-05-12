-- Create the admins table
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow users to check if they are admins (required for the UI to function)
DROP POLICY IF EXISTS "Users can view their own admin status" ON admins;
CREATE POLICY "Users can view their own admin status"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- Allow existing admins to manage other admins
DROP POLICY IF EXISTS "Admins can manage admins table" ON admins;
CREATE POLICY "Admins can manage admins table"
  ON admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );
