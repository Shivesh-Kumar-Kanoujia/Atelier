"""Supabase client singleton."""
from supabase import create_client, Client
from config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    """Admin Supabase client with service role key for DB and administrative auth."""
    global _client
    if _client is None:
        s = get_settings()
        if not s.supabase_url or not s.supabase_service_role_key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
            )
        _client = create_client(s.supabase_url, s.supabase_service_role_key)
    return _client


def get_anon_supabase() -> Client:
    """Supabase client with anon key for user authentication (avoids mutating admin client session)."""
    s = get_settings()
    if not s.supabase_url or not s.supabase_anon_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    return create_client(s.supabase_url, s.supabase_anon_key)

