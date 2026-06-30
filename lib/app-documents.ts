import { getSupabaseAdminClient } from "@/lib/supabase-server";

const DOCUMENT_TABLE = "app_documents";

interface AppDocumentRow {
  document_key: string;
  content: unknown;
}

export async function readAppDocument<T>(documentKey: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(DOCUMENT_TABLE)
    .select("document_key, content")
    .eq("document_key", documentKey)
    .maybeSingle<AppDocumentRow>();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.content as T | undefined) ?? null;
}

export async function writeAppDocument(
  documentKey: string,
  content: unknown,
  updatedByUsername?: string | null
) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from(DOCUMENT_TABLE).upsert(
    {
      document_key: documentKey,
      content,
      updated_by_username: updatedByUsername ?? null,
    },
    {
      onConflict: "document_key",
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
