import type { SupabaseClient } from "@supabase/supabase-js";
import { STUDY_SYNC_TABLE, STUDY_SYNC_ID, type StudyTimerStore } from "./studyTimerSync.ts";

export function createStudyTimerStore(client: SupabaseClient, id = STUDY_SYNC_ID): StudyTimerStore {
  return {
    async read() {
      const { data, error } = await client.from(STUDY_SYNC_TABLE)
        .select("snapshot").eq("id", id).abortSignal(AbortSignal.timeout(10_000)).maybeSingle();
      if (error) throw error;
      return data ? data.snapshot : null;
    },
    async write(expected, value) {
      const row = {
        id, snapshot: value, updated_at: new Date().toISOString(),
      };
      if (expected === null) {
        const { data, error } = await client.from(STUDY_SYNC_TABLE)
          .upsert(row, { onConflict: "id", ignoreDuplicates: true })
          .select("id").abortSignal(AbortSignal.timeout(10_000));
        if (error) throw error;
        return Boolean(data?.length);
      }
      const { data, error } = await client.from(STUDY_SYNC_TABLE).update(row)
        .eq("id", id).eq("snapshot", expected).select("id").abortSignal(AbortSignal.timeout(10_000));
      if (error) throw error;
      return Boolean(data?.length);
    },
  };
}
