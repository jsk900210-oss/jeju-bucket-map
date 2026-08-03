create extension if not exists pgcrypto;

create table if not exists public.pois (
  id text primary key,
  name text not null,
  category text not null check (category in ('stay','fish','boat','food','hot','oreum')),
  active boolean not null default true
);

insert into public.pois (id, name, category) values
  ('bucket','버킷제주 게스트하우스','stay'),
  ('hamdeok','함덕해수욕장','hot'),
  ('seongsan','성산일출봉','oreum'),
  ('hyeopjae','협재해수욕장','hot'),
  ('dongmun','동문재래시장','food'),
  ('osulloc','오설록 티뮤지엄','hot'),
  ('udo','우도','hot'),
  ('manjang','만장굴','hot'),
  ('jusang','주상절리대','hot'),
  ('saryeoni','사려니숲길','hot'),
  ('aewol','애월 한담해안산책로','hot'),
  ('jejudang','제주당 (애월)','food'),
  ('ujin','우진해장국','food'),
  ('jamae','자매국수','food'),
  ('monsant','몽상드애월','hot'),
  ('camellia','카멜리아힐','hot'),
  ('ecoland','에코랜드 테마파크','hot'),
  ('snoopy','스누피가든','hot'),
  ('park981','9.81파크','hot'),
  ('saebyeol','새별오름','oreum'),
  ('camforest','동백포레스트','hot'),
  ('okmanine','옥만이네 (협재)','food'),
  ('saebyeolf','새별프렌즈 동물원','hot'),
  ('sagye','사계해변 (해루질 포인트)','fish'),
  ('hyeongje','형제섬 (배낚시)','boat'),
  ('unjin','운진항 방파제 (낚시)','fish')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  active = true;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  poi_id text not null references public.pois(id),
  author_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  flag text not null check (char_length(flag) between 1 and 8),
  body text not null check (char_length(body) between 10 and 1000),
  stars smallint not null check (stars between 1 and 5),
  onsite_verified boolean not null default false,
  status text not null default 'approved' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_poi_created_idx
  on public.reviews (poi_id, created_at desc)
  where status = 'approved';

create table if not exists public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media', 'review-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.pois enable row level security;
alter table public.reviews enable row level security;
alter table public.review_media enable row level security;

drop policy if exists "pois are publicly readable" on public.pois;
create policy "pois are publicly readable"
  on public.pois for select
  to anon, authenticated
  using (active = true);

drop policy if exists "approved reviews are publicly readable" on public.reviews;
create policy "approved reviews are publicly readable"
  on public.reviews for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "owners can read their own reviews" on public.reviews;
create policy "owners can read their own reviews"
  on public.reviews for select
  to authenticated
  using (author_id = (select auth.uid()));

revoke insert, update, delete on public.reviews from anon, authenticated;
revoke all on public.review_media from anon, authenticated;

drop policy if exists "users upload review media to own folder" on storage.objects;
create policy "users upload review media to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'review-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "users delete review media from own folder" on storage.objects;
create policy "users delete review media from own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'review-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.submit_review(
  p_poi_id text,
  p_nickname text,
  p_flag text,
  p_body text,
  p_stars integer
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_review public.reviews;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (select 1 from public.pois where id = p_poi_id and active) then
    raise exception 'invalid poi';
  end if;

  if char_length(trim(p_nickname)) not between 1 and 30 then
    raise exception 'invalid nickname';
  end if;

  if char_length(trim(p_body)) not between 10 and 1000 then
    raise exception 'invalid review body';
  end if;

  if p_body ~* '(광고|홍보|dm주세요|https?://|www\.|팔로우)' then
    raise exception 'promotional content is not allowed';
  end if;

  if p_stars not between 1 and 5 then
    raise exception 'invalid stars';
  end if;

  if char_length(p_flag) not between 1 and 8 then
    raise exception 'invalid flag';
  end if;

  insert into public.reviews (
    poi_id, author_id, nickname, flag, body, stars,
    onsite_verified, status
  ) values (
    p_poi_id, v_user_id, trim(p_nickname), p_flag, trim(p_body), p_stars,
    false, 'approved'
  )
  returning * into v_review;

  return v_review;
end;
$$;

revoke all on function public.submit_review(text,text,text,text,integer) from public, anon;
grant execute on function public.submit_review(text,text,text,text,integer) to authenticated;

create or replace function public.attach_review_media(
  p_review_id uuid,
  p_object_path text,
  p_mime_type text,
  p_size_bytes bigint
)
returns public.review_media
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_media public.review_media;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not exists (
    select 1 from public.reviews
    where id = p_review_id and author_id = v_user_id
  ) then raise exception 'review ownership required'; end if;
  if p_object_path not like v_user_id::text || '/' || p_review_id::text || '/%' then
    raise exception 'invalid object path';
  end if;
  if p_mime_type not in ('image/jpeg','image/png','image/webp') then
    raise exception 'invalid media type';
  end if;
  if p_size_bytes < 1 or p_size_bytes > 5242880 then raise exception 'invalid media size'; end if;
  if (select count(*) from public.review_media where review_id = p_review_id) >= 10 then
    raise exception 'media limit exceeded';
  end if;

  insert into public.review_media (review_id, owner_id, object_path, mime_type, size_bytes)
  values (p_review_id, v_user_id, p_object_path, p_mime_type, p_size_bytes)
  returning * into v_media;
  return v_media;
end;
$$;

revoke all on function public.attach_review_media(uuid,text,text,bigint) from public, anon;
grant execute on function public.attach_review_media(uuid,text,text,bigint) to authenticated;

drop policy if exists "approved review media are publicly readable" on public.review_media;
create policy "approved review media are publicly readable"
  on public.review_media for select
  to anon, authenticated
  using (exists (
    select 1 from public.reviews
    where reviews.id = review_media.review_id and reviews.status = 'approved'
  ));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'review_media'
  ) then
    alter publication supabase_realtime add table public.review_media;
  end if;
end $$;
