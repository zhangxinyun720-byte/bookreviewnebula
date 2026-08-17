-- ============================================================
-- 个人书评网站 · Supabase 数据库 Schema
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- ============================================================

-- ---------- 分类表 ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- 书籍表 ----------
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  category_id uuid references public.categories(id) on delete set null,
  cover_url   text,
  rating      int  not null default 0 check (rating >= 0 and rating <= 5),
  summary     text,
  review      text,
  status      text not null default 'published' check (status in ('draft', 'published')),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 为已有 books 表添加 sort_order 字段（迁移用）
alter table if exists public.books add column if not exists sort_order int not null default 0;

-- 根据 created_at 为已有书籍初始化 sort_order（从 0 开始，升序排列）
update public.books
set sort_order = t.seq
from (
  select id, row_number() over (order by created_at asc) - 1 as seq
  from public.books
) t
where public.books.id = t.id
  and public.books.sort_order = 0;

create index if not exists books_category_id_idx on public.books(category_id);
create index if not exists books_created_at_idx   on public.books(created_at desc);
create index if not exists books_sort_order_idx  on public.books(sort_order asc);

-- ---------- 自动更新 updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- ============================================================
-- 行级安全策略 (RLS)
--   · 所有人可读已发布的书籍与全部分类
--   · 仅登录用户可增/改/删
-- ============================================================
alter table public.categories enable row level security;
alter table public.books      enable row level security;

-- 分类：读取
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- 分类：写入（仅认证用户）
drop policy if exists "categories_modify_auth" on public.categories;
create policy "categories_modify_auth"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 书籍：读取已发布
drop policy if exists "books_select_published" on public.books;
create policy "books_select_published"
  on public.books for select
  using (status = 'published' or auth.role() = 'authenticated');

-- 书籍：写入（仅认证用户）
drop policy if exists "books_modify_auth" on public.books;
create policy "books_modify_auth"
  on public.books for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 多对多：书籍 ↔ 分类 关联表
-- ============================================================
create table if not exists public.book_categories (
  book_id     uuid references public.books(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (book_id, category_id)
);

-- 迁移旧数据：把 books.category_id 迁移到 book_categories
insert into public.book_categories (book_id, category_id)
select id, category_id from public.books where category_id is not null
on conflict (book_id, category_id) do nothing;

-- RLS：book_categories
alter table public.book_categories enable row level security;

drop policy if exists "book_categories_select" on public.book_categories;
create policy "book_categories_select"
  on public.book_categories for select
  using (true);

drop policy if exists "book_categories_modify_auth" on public.book_categories;
create policy "book_categories_modify_auth"
  on public.book_categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 示例数据（可选）
-- ============================================================
insert into public.categories (name, slug, description, sort_order) values
  ('心理学',   'psychology', '关于心灵、认知与行为的思考', 1),
  ('小说',     'novel',      '虚构世界里的真实人生',       2),
  ('技术分享', 'tech',       '工程实践与前沿技术笔记',     3)
on conflict (slug) do nothing;
