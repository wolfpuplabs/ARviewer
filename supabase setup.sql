-- ============================================================
--  ARable — Supabase setup
--  Jalankan seluruh isi file ini di: Supabase Dashboard
--  -> SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1) Tabel untuk menyimpan metadata model yang di-share
create table if not exists public.models (
  id         uuid primary key default gen_random_uuid(),
  glb_url    text,
  usdz_url   text,
  created_at timestamptz default now()
);

-- 2) Aktifkan Row Level Security
alter table public.models enable row level security;

-- 3) Policy: siapa saja boleh MEMBACA (agar link share bisa dibuka publik)
drop policy if exists "Public read models" on public.models;
create policy "Public read models"
  on public.models
  for select
  to anon, authenticated
  using (true);

-- 4) Policy: siapa saja boleh MENYIMPAN record baru (saat upload)
drop policy if exists "Public insert models" on public.models;
create policy "Public insert models"
  on public.models
  for insert
  to anon, authenticated
  with check (true);

-- ============================================================
--  Storage bucket "models"
-- ============================================================
-- 5) Buat bucket publik bernama "models"
--    (Bisa juga lewat menu Storage -> New bucket -> nama "models" -> centang "Public")
insert into storage.buckets (id, name, public)
values ('models', 'models', true)
on conflict (id) do update set public = true;

-- 6) Policy: siapa saja boleh UPLOAD file ke bucket "models"
drop policy if exists "Public upload to models" on storage.objects;
create policy "Public upload to models"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'models');

-- 7) Policy: siapa saja boleh MEMBACA file dari bucket "models"
drop policy if exists "Public read from models" on storage.objects;
create policy "Public read from models"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'models');
