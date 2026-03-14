-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    category text NOT NULL,
    amount numeric NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Allow users to see their own expenses
CREATE POLICY "Users see own expenses"
ON expenses
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own expenses
CREATE POLICY "Users insert own expenses"
ON expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own expenses
CREATE POLICY "Users update own expenses"
ON expenses
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own expenses
CREATE POLICY "Users delete own expenses"
ON expenses
FOR DELETE
USING (auth.uid() = user_id);
