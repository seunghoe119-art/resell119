import type { SupabaseClient } from "@supabase/supabase-js";
import { STUDY_SYNC_AUTHOR, STUDY_SYNC_KEY, type StudyTimerStore } from "./studyTimerSync.ts";

export function createStudyTimerStore(client: SupabaseClient): StudyTimerStore {
  return {
    async read() {
      const { data, error } = await client.from("work_logs")
        .select("free_memo").eq("author", STUDY_SYNC_AUTHOR)
        .eq("log_date", STUDY_SYNC_KEY).abortSignal(AbortSignal.timeout(10_000)).maybeSingle();
      if (error) throw error;
      return data ? data.free_memo : null;
    },
    async write(expected, value) {
      const row = {
        author: STUDY_SYNC_AUTHOR, log_date: STUDY_SYNC_KEY,
        free_memo: value, updated_at: new Date().toISOString(),
      };
      if (expected === null) {
        const { data, error } = await client.from("work_logs")
          .upsert(row, { onConflict: "log_date,author", ignoreDuplicates: true })
          .select("id").abortSignal(AbortSignal.timeout(10_000));
        if (error) throw error;
        return Boolean(data?.length);
      }
      const { data, error } = await client.from("work_logs").update(row)
        .eq("author", STUDY_SYNC_AUTHOR).eq("log_date", STUDY_SYNC_KEY)
        .eq("free_memo", expected).select("id").abortSignal(AbortSignal.timeout(10_000));
      if (error) throw error;
      return Boolean(data?.length);
    },
  };
}
