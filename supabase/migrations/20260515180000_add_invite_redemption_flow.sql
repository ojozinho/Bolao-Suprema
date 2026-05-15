-- Persist invite redemption separately from admin invite creation.
-- Users remain pending after redeeming an invite; admins still approve participation.

alter table public.users
  add column if not exists invite_code text,
  add column if not exists invite_redeemed_at timestamptz;

create table if not exists public.participant_invite_redemptions (
  id uuid primary key default uuid_generate_v4(),
  invite_id uuid not null references public.participant_invites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  email text,
  status text not null default 'pending' check (status in ('pending','active','blocked','removed')),
  redeemed_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_participant_invite_redemptions_invite_id on public.participant_invite_redemptions(invite_id);
create index if not exists idx_participant_invite_redemptions_user_id on public.participant_invite_redemptions(user_id);

alter table public.participant_invite_redemptions enable row level security;

drop policy if exists "invite_redemptions_admin_select" on public.participant_invite_redemptions;
create policy "invite_redemptions_admin_select"
on public.participant_invite_redemptions
for select to authenticated
using (public.is_admin((select auth.uid())));

create or replace function public.redeem_participant_invite(p_code text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text;
  invite_row public.participant_invites%rowtype;
  before_user public.users%rowtype;
  after_user public.users%rowtype;
  existing_redemption public.participant_invite_redemptions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sessao expirada. Entre novamente.';
  end if;

  normalized_code := upper(trim(coalesce(p_code, '')));
  if normalized_code = '' then
    raise exception 'Convite invalido.';
  end if;

  select * into before_user
  from public.users
  where id = auth.uid();

  if not found then
    raise exception 'Perfil nao encontrado.';
  end if;

  if before_user.participant_status in ('blocked','removed') then
    raise exception 'Participante bloqueado ou removido.';
  end if;

  select * into invite_row
  from public.participant_invites
  where code = normalized_code
  for update;

  if not found or not invite_row.is_active then
    raise exception 'Convite invalido ou desativado.';
  end if;

  if invite_row.expires_at is not null and invite_row.expires_at <= now() then
    raise exception 'Convite expirado.';
  end if;

  select * into existing_redemption
  from public.participant_invite_redemptions
  where user_id = auth.uid();

  if not found then
    if invite_row.max_uses is not null and invite_row.used_count >= invite_row.max_uses then
      raise exception 'Convite esgotado.';
    end if;

    insert into public.participant_invite_redemptions(invite_id, user_id, email, status)
    values (invite_row.id, auth.uid(), before_user.email, before_user.participant_status);

    update public.participant_invites
    set used_count = used_count + 1
    where id = invite_row.id;
  end if;

  update public.users
  set invite_code = normalized_code,
      invite_redeemed_at = coalesce(invite_redeemed_at, now()),
      participant_status = case
        when participant_status = 'active' then 'active'
        else 'pending'
      end
  where id = auth.uid()
  returning * into after_user;

  insert into public.notifications(user_id, channel, type, title, body, entity_type, entity_id)
  values (
    auth.uid(),
    'in_app',
    'participant_status',
    'Cadastro recebido',
    'Seu convite foi registrado. Agora um admin precisa aprovar sua participacao no bolao.',
    'invite',
    invite_row.id::text
  );

  perform public.log_audit('invite_redeemed', 'invite', invite_row.id::text, to_jsonb(before_user), to_jsonb(after_user));
  return after_user;
end;
$$;

revoke execute on function public.redeem_participant_invite(text) from public, anon;
grant execute on function public.redeem_participant_invite(text) to authenticated;
