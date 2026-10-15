import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { createStudyTimerStore } from "./studyTimerStore.ts";
import { STUDY_SYNC_AUTHOR, STUDY_SYNC_KEY } from "./studyTimerSync.ts";

test("Supabase transport isolates timer records and uses conditional writes", async () => {
  const requests: { url: URL; method: string; headers: Headers; body: any }[] = [];
  const client = createClient("https://timer-test.supabase.co", "test-anon-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      requests.push({
        url: new URL(String(input)), method: init?.method ?? "GET",
        headers: new Headers(init?.headers), body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return new Response(JSON.stringify(init?.method === "GET" ? [{ free_memo: "snapshot" }] : [{ id: "test" }]),
        { status: 200, headers: { "Content-Type": "application/json" } });
    } },
  });
  const store = createStudyTimerStore(client);
  assert.equal(await store.read(), "snapshot");
  assert.equal(requests[0].url.pathname, "/rest/v1/work_logs");
  assert.equal(requests[0].url.searchParams.get("author"), "eq." + STUDY_SYNC_AUTHOR);
  assert.equal(requests[0].url.searchParams.get("log_date"), "eq." + STUDY_SYNC_KEY);
  assert.equal(await store.write(null, "first"), true);
  assert.match(requests[1].headers.get("Prefer")!, /resolution=ignore-duplicates/);
  assert.equal(await store.write("first", "next"), true);
  assert.equal(requests[2].method, "PATCH");
  assert.equal(requests[2].url.searchParams.get("free_memo"), "eq.first");
  assert.equal(requests[2].body.free_memo, "next");
});

test("Supabase failures throw, and zero affected rows signal a conflict", async () => {
  let failure = true;
  const client = createClient("https://timer-test.supabase.co", "test-anon-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async () => new Response(
      JSON.stringify(failure ? { message: "table unavailable", code: "42P01" } : []),
      { status: failure ? 400 : 200, headers: { "Content-Type": "application/json" } },
    ) },
  });
  const store = createStudyTimerStore(client);
  await assert.rejects(store.read());
  await assert.rejects(store.write("old", "new"));
  failure = false;
  assert.equal(await store.read(), null);
  assert.equal(await store.write("old", "new"), false);
});
