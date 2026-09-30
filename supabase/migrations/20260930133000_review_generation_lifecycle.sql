-- Track one retryable lifecycle per review generation. Existing rows are
-- successful generations and retain that status through the column default.
alter table public.review_generations
  add column generation_status text not null default 'generated';

-- Existing drafts keep their text; requested and failed rows may have none.
alter table public.review_generations
  alter column generated_text drop not null;

alter table public.review_generations
  drop constraint if exists review_generations_generated_text_check;

alter table public.review_generations
  add constraint review_generations_status_check
  check (
    (generation_status = 'generated'
      and generated_text is not null
      and length(btrim(generated_text)) between 1 and 10000)
    or (generation_status in ('requested', 'failed') and generated_text is null)
  );
