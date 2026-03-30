-- Tables for the Questionnaire App

-- 1. Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('radio', 'text', 'checkbox')),
  options JSONB, -- For radio/checkbox options
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Answers Table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id, question_id)
);

-- Row Level Security (RLS)

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Allow reading sessions and questions for authenticated users
CREATE POLICY "Allow authenticated users to read sessions" ON sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read questions" ON questions FOR SELECT TO authenticated USING (true);

-- Allow users to manage their own answers
CREATE POLICY "Users can create their own answers" ON answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own answers" ON answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own answers" ON answers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sample Data
INSERT INTO sessions (id, title, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Onboarding Survey', 'Help us understand your needs better.'),
('22222222-2222-2222-2222-222222222222', 'Feature Feedback', 'Tell us what you think about our new features.'),
('33333333-3333-3333-3333-333333333333', 'General Satisfaction', 'How are you enjoying our service?');

-- Questions for Onboarding Survey
INSERT INTO questions (session_id, question_text, question_type, options, order_index) VALUES 
('11111111-1111-1111-1111-111111111111', 'What is your primary goal?', 'radio', '["Learn React", "Build a Project", "Career Advancement"]'::JSONB, 1),
('11111111-1111-1111-1111-111111111111', 'How did you hear about us?', 'radio', '["Social Media", "Friend", "Search Engine", "Other"]'::JSONB, 2),
('11111111-1111-1111-1111-111111111111', 'What is your current profession?', 'text', NULL, 3),
('11111111-1111-1111-1111-111111111111', 'Why are you interested in this project?', 'text', NULL, 4);

-- Questions for Feature Feedback
INSERT INTO questions (session_id, question_text, question_type, options, order_index) VALUES 
('22222222-2222-2222-2222-222222222222', 'How easy is it to use the new dashboard?', 'radio', '["Very Easy", "Easy", "Neutral", "Hard", "Very Hard"]'::JSONB, 1),
('22222222-2222-2222-2222-222222222222', 'What feature do you use the most?', 'text', NULL, 2);
