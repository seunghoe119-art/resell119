import type { SupabaseClient } from "@supabase/supabase-js";
import { STUDY_SYNC_TABLE, STUDY_SYNC_ID, type StudyTimerStore } from "./studyTimerSync.ts";
import { snapshotStudyDate, studyHistoryId } from "./studyTimerHistory.ts";

export function createStudyTimerStore(client: SupabaseClient, id = STUDY_SYNC_ID, history = true): StudyTimerStore {
  let archived: string | null = null;
  const archive = async (raw: string | null) => {
    if (!history || raw === null || raw === archived) return;
    const dayId = studyHistoryId(id, snapshotStudyDate(raw));
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing, error: readError } = await client.from(STUDY_SYNC_TABLE)
        .select("snapshot").eq("id", dayId).abortSignal(AbortSignal.timeout(10_000)).maybeSingle();
      if (readError) throw readError;
      if (existing && (existing.snapshot === raw ||
          JSON.parse(existing.snapshot).saved_at > JSON.parse(raw).saved_at)) {
        archived = raw;
        return;
      }
      const row = { id: dayId, snapshot: raw, updated_at: new Date().toISOString() };
      const query = existing
        ? client.from(STUDY_SYNC_TABLE).update(row).eq("id", dayId).eq("snapshot", existing.snapshot)
        : client.from(STUDY_SYNC_TABLE).upsert(row, { onConflict: "id", ignoreDuplicates: true });
      const { data, error } = await query.select("id").abortSignal(AbortSignal.timeout(10_000));
      if (error) throw error;
      if (data?.length) { archived = raw; return; }
    }
    throw new Error("Study history changed concurrently; retry");
  };
  return {
    async read() {
      const { data, error } = await client.from(STUDY_SYNC_TABLE)
        .select("snapshot").eq("id", id).abortSignal(AbortSignal.timeout(10_000)).maybeSingle();
      if (error) throw error;
      await archive(data?.snapshot ?? null);
      return data ? data.snapshot : null;
    },
    async write(expected, value) {
      // Preserve yesterday before any action replaces the shared current model.
      await archive(expected);
      const row = {
        id, snapshot: value, updated_at: new Date().toISOString(),
      };
      if (expected === null) {
        const { data, error } = await client.from(STUDY_SYNC_TABLE)
          .upsert(row, { onConflict: "id", ignoreDuplicates: true })
          .select("id").abortSignal(AbortSignal.timeout(10_000));
        if (error) throw error;
        if (data?.length) await archive(value);
        return Boolean(data?.length);
      }
      const { data, error } = await client.from(STUDY_SYNC_TABLE).update(row)
        .eq("id", id).eq("snapshot", expected).select("id").abortSignal(AbortSignal.timeout(10_000));
      if (error) throw error;
      if (data?.length) await archive(value);
      return Boolean(data?.length);
    },
  };
}
