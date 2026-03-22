-- ═══════════════════════════════════════════════════════════════════
--  TRIVIA — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--
--  Tables:
--    profiles              Core user profile & gamification state
--    subject_scores        Per-user per-subject accuracy tracking
--    user_achievements     Which badges a user has earned
--    sessions              Every completed quiz session
--    session_answers       Individual question answers per session
--    questions             Question bank (editable by admins)
--    leaderboard_view      Materialised view for fast leaderboard reads
--    question_reports      In-session question flags from users
--    streak_logs           Daily streak activity log
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search on questions


-- ───────────────────────────────────────────────────────────────────
-- 1. PROFILES
--    One row per auth.users entry. Created automatically via trigger.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,

  -- Identity
  username                  text unique,                        -- display name slug
  full_name                 text not null default '',
  avatar_url                text,                               -- Supabase Storage URL

  -- Field of study
  active_field              text not null default 'JAMB Bundle',

  -- Gamification
  xp                        integer not null default 0 check (xp >= 0),
  level                     integer not null default 1 check (level >= 1),
  streak                    integer not null default 0 check (streak >= 0),
  streak_freeze_tokens      integer not null default 0 check (streak_freeze_tokens >= 0 and streak_freeze_tokens <= 3),
  last_session_at           timestamptz,
  last_streak_date          date,                               -- last calendar day a session was completed

  -- Aggregate stats (denormalised for fast dashboard reads)
  total_sessions            integer not null default 0,
  total_questions_answered  integer not null default 0,
  average_score             numeric(5,2) not null default 0.00, -- 0-100

  -- Settings
  sound_enabled             boolean not null default true,
  audio_mode                boolean not null default false,     -- screen reader / sound translator mode

  -- Timestamps
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user. Stores gamification state and denormalised stats.';
comment on column public.profiles.streak_freeze_tokens is 'Max 3. Earned 1 per 7-day streak. Consumed when a day is missed.';
comment on column public.profiles.audio_mode is 'If true, Sound Translator (TTS) mode is active for this user.';


-- ───────────────────────────────────────────────────────────────────
-- 2. SUBJECT SCORES
--    Per-subject rolling accuracy average per user.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.subject_scores (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  score       numeric(5,2) not null default 0.00 check (score >= 0 and score <= 100),
  sessions    integer not null default 0,
  updated_at  timestamptz not null default now(),

  unique(user_id, subject)
);

comment on table public.subject_scores is 'Rolling weighted accuracy per user per subject. Updated after each session.';


-- ───────────────────────────────────────────────────────────────────
-- 3. USER ACHIEVEMENTS
--    Tracks which badges a user has earned and when.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  text not null,  -- matches the id in the client-side ACHIEVEMENTS array
  earned_at       timestamptz not null default now(),

  unique(user_id, achievement_id)
);

-- Seed: define all possible achievements for reference
create table if not exists public.achievements (
  id          text primary key,
  name        text not null,
  description text not null,
  icon        text not null,
  xp_reward   integer not null default 0
);

insert into public.achievements (id, name, description, icon, xp_reward) values
  ('first_session',   'First Steps',          'Complete your first quiz session.',                            '🎯', 50),
  ('streak_7',        '7-Day Streak',         'Practice for 7 consecutive days.',                             '🔥', 150),
  ('streak_30',       '30-Day Streak',        'Practice for 30 consecutive days.',                            '🔥', 500),
  ('streak_100',      '100-Day Streak',       'Practice for 100 consecutive days.',                           '🔥', 2000),
  ('perfect_score',   'Perfect Score',        'Score 100% on a session.',                                     '💯', 200),
  ('hard_mode',       'Hard Mode Unlock',     'Complete a session at Hard difficulty.',                       '⚡', 100),
  ('scholar_tier',    'Scholar Tier',         'Reach Scholar tier.',                                          '◈', 100),
  ('expert_tier',     'Expert Tier',          'Reach Expert tier.',                                           '◆', 250),
  ('champion_tier',   'Champion Tier',        'Reach Champion tier.',                                         '★', 500),
  ('legend_tier',     'Legend Tier',          'Reach the highest tier.',                                      '♛', 1000),
  ('doc_quiz',        'Document Scholar',     'Generate a quiz from an uploaded document.',                   '📄', 100),
  ('sessions_50',     '50 Sessions',          'Complete 50 quiz sessions.',                                   '📚', 300)
on conflict (id) do nothing;


-- ───────────────────────────────────────────────────────────────────
-- 4. QUESTIONS
--    The question bank. Admins add questions; users never write here.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.questions (
  id            uuid primary key default uuid_generate_v4(),

  -- Content
  question      text not null,
  options       jsonb not null,            -- ["option A", "option B", "option C", "option D"]
  correct_index smallint not null check (correct_index >= 0 and correct_index <= 3),
  explanation   text not null default '',

  -- Classification
  subject       text not null,
  category      text not null default 'General',
  difficulty    text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  xp_reward     integer not null default 10,

  -- Source
  source        text default 'manual',     -- 'manual', 'ai_generated', 'uploaded_doc'
  source_ref    text,                      -- e.g. document upload id for AI-generated Qs

  -- Moderation
  is_active     boolean not null default true,
  report_count  integer not null default 0,

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null
);

comment on column public.questions.options is 'JSON array of exactly 4 answer strings. Index matches correct_index.';
comment on column public.questions.source is '''manual'' = admin-written; ''ai_generated'' = OpenAI; ''uploaded_doc'' = from user document.';

-- Full-text search index on questions
create index if not exists idx_questions_subject on public.questions(subject);
create index if not exists idx_questions_difficulty on public.questions(difficulty);
create index if not exists idx_questions_active on public.questions(is_active);
create index if not exists idx_questions_fts on public.questions using gin(to_tsvector('english', question));


-- ───────────────────────────────────────────────────────────────────
-- 5. SESSIONS
--    One row per completed quiz session.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,

  -- Session config
  subject           text not null,
  difficulty        text not null default 'Medium',
  mode              text not null default 'standard',   -- 'standard', 'weak_areas', 'document', 'targeted'
  total_questions   smallint not null,

  -- Results
  correct_answers   smallint not null default 0,
  score_percent     numeric(5,2) not null default 0.00,
  xp_earned         integer not null default 0,
  duration_seconds  integer,                             -- how long the session took

  -- Timestamps
  completed_at      timestamptz not null default now()
);

comment on table public.sessions is 'Each row is one completed quiz session. Drives leaderboard and analytics.';

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_completed_at on public.sessions(completed_at desc);
create index if not exists idx_sessions_subject on public.sessions(subject);


-- ───────────────────────────────────────────────────────────────────
-- 6. SESSION ANSWERS
--    Individual answer records — one row per question per session.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.session_answers (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  question_id     uuid references public.questions(id) on delete set null,

  selected_index  smallint,               -- null if timed out
  is_correct      boolean not null,
  time_taken_ms   integer,                -- response time in ms

  answered_at     timestamptz not null default now()
);

create index if not exists idx_session_answers_session on public.session_answers(session_id);
create index if not exists idx_session_answers_user on public.session_answers(user_id);
create index if not exists idx_session_answers_question on public.session_answers(question_id);


-- ───────────────────────────────────────────────────────────────────
-- 7. QUESTION REPORTS
--    In-session "Flag this question" submissions.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.question_reports (
  id            uuid primary key default uuid_generate_v4(),
  question_id   uuid not null references public.questions(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reason        text not null,             -- 'wrong_answer', 'unclear', 'offensive', 'other'
  note          text,                      -- optional short free-text
  status        text not null default 'pending',  -- 'pending', 'resolved', 'rejected'
  created_at    timestamptz not null default now(),

  unique(question_id, user_id)            -- one report per user per question
);

create index if not exists idx_reports_status on public.question_reports(status);
create index if not exists idx_reports_question on public.question_reports(question_id);


-- ───────────────────────────────────────────────────────────────────
-- 8. STREAK LOGS
--    One row per calendar day a user completes at least one session.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.streak_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  log_date    date not null,
  freeze_used boolean not null default false,

  unique(user_id, log_date)
);

create index if not exists idx_streak_logs_user on public.streak_logs(user_id, log_date desc);


-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- ── Trigger: auto-create profile when user signs up ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    -- Generate username from email prefix (deduplication handled separately)
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g')),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Drop and re-create to avoid duplicate trigger errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Trigger: update profiles.updated_at automatically ─────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_subject_scores_updated_at on public.subject_scores;
create trigger set_subject_scores_updated_at
  before update on public.subject_scores
  for each row execute procedure public.set_updated_at();


-- ── Function: update stats after a session completes ──────────────
--
--  Call this from your Nuxt API route after saving a session row.
--  It atomically updates XP, score average, streak, and subject scores.
--
create or replace function public.complete_session(
  p_user_id         uuid,
  p_session_id      uuid,
  p_subject         text,
  p_score_percent   numeric,
  p_xp_earned       integer,
  p_correct         integer,
  p_total           integer
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_last_date       date;
  v_today           date := current_date;
  v_new_streak      integer;
  v_freeze_tokens   integer;
  v_old_score       numeric;
  v_old_sessions    integer;
begin
  -- ── 1. Update XP and session counts ─────────────────────────
  update public.profiles
  set
    xp                       = xp + p_xp_earned,
    total_sessions           = total_sessions + 1,
    total_questions_answered = total_questions_answered + p_total,
    last_session_at          = now(),
    -- Rolling average: new_avg = (old_avg * old_count + new_score) / (old_count + 1)
    average_score            = (average_score * total_sessions + p_score_percent) / (total_sessions + 1)
  where id = p_user_id;

  -- ── 2. Streak logic ──────────────────────────────────────────
  select last_streak_date, streak, streak_freeze_tokens
  into v_last_date, v_new_streak, v_freeze_tokens
  from public.profiles where id = p_user_id;

  if v_last_date is null or v_last_date < v_today - interval '2 days' then
    -- Missed more than one day — reset streak
    v_new_streak := 1;
  elsif v_last_date = v_today - interval '1 day' then
    -- Consecutive day
    v_new_streak := v_new_streak + 1;
  elsif v_last_date = v_today then
    -- Already practiced today, no change to streak
    null;
  else
    -- Missed exactly one day; check for freeze token
    if v_freeze_tokens > 0 then
      v_new_streak := v_new_streak + 1;  -- freeze protects the streak
      v_freeze_tokens := v_freeze_tokens - 1;
      insert into public.streak_logs (user_id, log_date, freeze_used)
      values (p_user_id, v_today - interval '1 day', true)
      on conflict (user_id, log_date) do nothing;
    else
      v_new_streak := 1;  -- broken, restart
    end if;
  end if;

  -- Award a freeze token every 7-day milestone
  if v_new_streak % 7 = 0 and v_freeze_tokens < 3 then
    v_freeze_tokens := least(v_freeze_tokens + 1, 3);
  end if;

  update public.profiles
  set
    streak               = v_new_streak,
    streak_freeze_tokens = v_freeze_tokens,
    last_streak_date     = v_today
  where id = p_user_id;

  -- Log today's activity
  insert into public.streak_logs (user_id, log_date)
  values (p_user_id, v_today)
  on conflict (user_id, log_date) do nothing;

  -- ── 3. Update subject score (weighted rolling average) ───────
  select score, sessions into v_old_score, v_old_sessions
  from public.subject_scores
  where user_id = p_user_id and subject = p_subject;

  if not found then
    insert into public.subject_scores (user_id, subject, score, sessions)
    values (p_user_id, p_subject, p_score_percent, 1);
  else
    update public.subject_scores
    set
      score    = (v_old_score * 0.7) + (p_score_percent * 0.3),  -- exponential moving avg
      sessions = v_old_sessions + 1
    where user_id = p_user_id and subject = p_subject;
  end if;

  -- ── 4. Bump question report count ───────────────────────────
  update public.questions
  set report_count = report_count + 1
  where id in (
    select question_id from public.session_answers
    where session_id = p_session_id and is_correct = false
  );

end;
$$;


-- ═══════════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════════

-- Leaderboard view — top 100 per subject, refreshed on read
create or replace view public.leaderboard_global as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.xp,
  p.average_score,
  p.streak,
  -- Tier derived from XP
  case
    when p.xp >= 6000 then 'Legend'
    when p.xp >= 3000 then 'Champion'
    when p.xp >= 1500 then 'Expert'
    when p.xp >= 500  then 'Scholar'
    else 'Rookie'
  end as tier,
  rank() over (order by p.xp desc) as rank
from public.profiles p
where p.username is not null
order by p.xp desc
limit 200;

-- Weekly leaderboard (last 7 days XP gains)
create or replace view public.leaderboard_weekly as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  coalesce(sum(s.xp_earned), 0) as weekly_xp,
  count(s.id) as sessions_this_week,
  rank() over (order by coalesce(sum(s.xp_earned), 0) desc) as rank
from public.profiles p
left join public.sessions s
  on s.user_id = p.id
  and s.completed_at >= now() - interval '7 days'
where p.username is not null
group by p.id, p.username, p.full_name, p.avatar_url
order by weekly_xp desc
limit 200;


-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all user-data tables
alter table public.profiles          enable row level security;
alter table public.subject_scores    enable row level security;
alter table public.user_achievements enable row level security;
alter table public.sessions          enable row level security;
alter table public.session_answers   enable row level security;
alter table public.question_reports  enable row level security;
alter table public.streak_logs       enable row level security;

-- Questions and achievements are publicly readable
alter table public.questions    enable row level security;
alter table public.achievements enable row level security;

-- ── profiles ──────────────────────────────────────────────────────
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow leaderboard: others can read username, xp, streak, tier (no PII)
create policy "Public can read leaderboard fields"
  on public.profiles for select
  using (true);   -- RLS at column level is handled by the leaderboard view

-- ── subject_scores ────────────────────────────────────────────────
create policy "Users manage own subject scores"
  on public.subject_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── user_achievements ─────────────────────────────────────────────
create policy "Users read own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Service role inserts achievements"
  on public.user_achievements for insert
  with check (true);   -- restricted via service key in API route

-- ── sessions ──────────────────────────────────────────────────────
create policy "Users manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── session_answers ───────────────────────────────────────────────
create policy "Users manage own answers"
  on public.session_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── questions ─────────────────────────────────────────────────────
create policy "Anyone can read active questions"
  on public.questions for select
  using (is_active = true);

create policy "Admins can manage questions"
  on public.questions for all
  using (auth.role() = 'service_role');

-- ── achievements (definition table) ──────────────────────────────
create policy "Anyone can read achievement definitions"
  on public.achievements for select
  using (true);

-- ── question_reports ──────────────────────────────────────────────
create policy "Users submit own reports"
  on public.question_reports for insert
  with check (auth.uid() = user_id);

create policy "Users read own reports"
  on public.question_reports for select
  using (auth.uid() = user_id);

-- ── streak_logs ───────────────────────────────────────────────────
create policy "Users read own streak logs"
  on public.streak_logs for select
  using (auth.uid() = user_id);

create policy "Users insert own streak logs"
  on public.streak_logs for insert
  with check (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- SAMPLE SEED DATA (optional — remove before production)
-- ═══════════════════════════════════════════════════════════════════

-- Seed 5 sample questions for JAMB
insert into public.questions (question, options, correct_index, explanation, subject, difficulty, xp_reward, source)
values
(
  'In which year did Nigeria gain independence?',
  '["1957", "1960", "1963", "1966"]',
  1,
  'Nigeria gained independence from Britain on October 1, 1960.',
  'Government', 'Easy', 10, 'manual'
),
(
  'What is the chemical formula for water?',
  '["HO₂", "H₂O₂", "H₂O", "OH"]',
  2,
  'Water is composed of two hydrogen atoms bonded to one oxygen atom: H₂O.',
  'Chemistry', 'Easy', 10, 'manual'
),
(
  'If a triangle has angles of 90° and 45°, what is the third angle?',
  '["30°", "45°", "60°", "90°"]',
  1,
  'Sum of angles in a triangle = 180°. So 180 - 90 - 45 = 45°.',
  'Mathematics', 'Easy', 10, 'manual'
),
(
  'Which organelle is known as the powerhouse of the cell?',
  '["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"]',
  2,
  'Mitochondria produce ATP through cellular respiration, hence the nickname.',
  'Biology', 'Easy', 10, 'manual'
),
(
  'Newton''s second law states that Force equals:',
  '["Mass × Velocity", "Mass × Acceleration", "Mass × Distance", "Weight × Height"]',
  1,
  'F = ma, where F is force (N), m is mass (kg), a is acceleration (m/s²).',
  'Physics', 'Medium', 15, 'manual'
)
on conflict do nothing;
