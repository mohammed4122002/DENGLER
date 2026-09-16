-- ===========================================================================
-- DENGLER — Arabic content
--
-- Adds a nullable Arabic counterpart to every user-facing text column. Nullable
-- on purpose: a record with no Arabic falls back to its English text on the
-- Arabic site rather than rendering an empty page, so a catalogue can be
-- translated incrementally.
--
-- Columns rather than a `property_translations` table: with two locales it
-- keeps every read a single row with no extra join, and — the deciding factor —
-- it lets one generated `search_text` column cover both languages, so an
-- Arabic query and an English query hit the same index.
--
-- A third locale would be the point to move to a translations table.
-- ===========================================================================

alter table public.properties
  add column if not exists title_ar       text,
  add column if not exists tagline_ar     text,
  add column if not exists description_ar text,
  add column if not exists location_ar    text,
  add column if not exists city_ar        text,
  add column if not exists country_ar     text;

alter table public.property_features
  add column if not exists feature_ar text;

-- --------------------------------------------------------------------------
-- Rebuild the search column over both languages.
--
-- Arabic is folded the same way `foldSearchText()` folds it in the app: marks
-- and tatweel removed, أ/إ/آ → ا, ى → ي, ة → ه. Without this, a visitor typing
-- "الامارات" would not match "الإمارات", which is how most people type it.
--
-- The two implementations must stay in step — src/lib/store/filters.ts folds
-- the query term, this folds the indexed column. If you change one, change both.
-- --------------------------------------------------------------------------
create or replace function public.fold_arabic(input text)
returns text
language sql
immutable
strict
as $$
  -- The character class below is written with literal characters rather than
  -- \u escapes so PostgreSQL's regex engine cannot misread them. It is
  -- U+064B–U+065F (harakat and the combining hamza forms), U+0670 (dagger
  -- alif) and U+0640 (tatweel).
  select translate(
    regexp_replace(lower(input), '[ً-ٰٟـ]', '', 'g'),
    'آأإىة',
    'ااايه'
  );
$$;

alter table public.properties drop column if exists search_text;

alter table public.properties
  add column search_text text generated always as (
    public.fold_arabic(
      coalesce(title, '')          || ' ' || coalesce(title_ar, '')       || ' ' ||
      coalesce(tagline, '')        || ' ' || coalesce(tagline_ar, '')     || ' ' ||
      coalesce(location, '')       || ' ' || coalesce(location_ar, '')    || ' ' ||
      coalesce(city, '')           || ' ' || coalesce(city_ar, '')        || ' ' ||
      coalesce(country, '')        || ' ' || coalesce(country_ar, '')     || ' ' ||
      coalesce(description, '')    || ' ' || coalesce(description_ar, '')
    )
  ) stored;

create index if not exists properties_search_idx
  on public.properties using gin (search_text gin_trgm_ops);
