import { supabase } from "./supabase";
import { createStudyTimerStore } from "./studyTimerStore";

export const studyTimerStore = createStudyTimerStore(supabase);
