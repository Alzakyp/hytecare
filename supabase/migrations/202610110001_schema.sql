create extension if not exists pgcrypto;
create type public.user_role as enum ('admin','patient');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete restrict,
 display_name text not null default '' check (char_length(display_name) <= 100),
 avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_roles (
 user_id uuid primary key references public.profiles(id) on delete restrict,
 role public.user_role not null default 'patient', created_at timestamptz not null default now()
);
create table public.blood_pressure_readings (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 systolic integer not null check (systolic > 0), diastolic integer not null check (diastolic > 0),
 heart_rate integer check (heart_rate > 0), measured_at timestamptz not null, notes text check (notes is null or char_length(notes) <= 1000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quiz_games (
 id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 title text not null check (char_length(title) between 1 and 200), description text not null default '', game_type text not null,
 is_active boolean not null default false, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quiz_questions (
 id uuid primary key default gen_random_uuid(), game_id uuid not null references public.quiz_games(id) on delete restrict,
 prompt text not null check (char_length(prompt) > 0), explanation text not null default '', sort_order integer not null default 0,
 is_active boolean not null default false, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quiz_options (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.quiz_questions(id) on delete restrict,
 label text not null check (char_length(label) > 0), is_correct boolean not null default false, sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(question_id,id)
);
create table public.quiz_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 game_id uuid not null references public.quiz_games(id) on delete restrict, score integer not null default 0 check (score >= 0),
 total_questions integer not null check (total_questions >= 0 and score <= total_questions), started_at timestamptz not null default now(),
 completed_at timestamptz, status text not null check (status in ('in_progress','completed','abandoned')),
 question_snapshot jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create table public.quiz_answers (
 id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.quiz_attempts(id) on delete restrict,
 question_id uuid not null references public.quiz_questions(id) on delete restrict,
 selected_option_id uuid not null references public.quiz_options(id) on delete restrict, is_correct boolean not null,
 prompt_snapshot text not null, option_label_snapshot text not null, answered_at timestamptz not null default now(), unique(attempt_id,question_id)
);
create table public.emergency_contacts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 name text not null check (char_length(name) between 1 and 100), relationship text check (relationship is null or char_length(relationship) <= 100),
 phone_number text not null check (char_length(phone_number) between 1 and 40), contact_type text not null,
 notes text check (notes is null or char_length(notes) <= 500), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_article_progress (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 article_slug text not null check (char_length(article_slug) between 1 and 200), is_bookmarked boolean not null default false,
 is_read boolean not null default false, updated_at timestamptz not null default now(), unique(user_id,article_slug)
);
create index readings_user_measured_idx on public.blood_pressure_readings(user_id,measured_at desc);
create index attempts_user_started_idx on public.quiz_attempts(user_id,started_at desc);
create index questions_game_active_order_idx on public.quiz_questions(game_id,is_active,sort_order);
create index options_question_order_idx on public.quiz_options(question_id,sort_order);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),100));
 insert into public.user_roles(user_id,role) values(new.id,'patient');
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger readings_updated before update on public.blood_pressure_readings for each row execute function public.set_updated_at();
create trigger games_updated before update on public.quiz_games for each row execute function public.set_updated_at();
create trigger questions_updated before update on public.quiz_questions for each row execute function public.set_updated_at();
create trigger options_updated before update on public.quiz_options for each row execute function public.set_updated_at();
create trigger contacts_updated before update on public.emergency_contacts for each row execute function public.set_updated_at();
