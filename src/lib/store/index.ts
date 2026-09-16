import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { demoStore } from "./demo-store";
import { supabaseStore } from "./supabase-store";
import type { DataStore } from "./types";

/**
 * The single data entry point for the whole platform.
 *
 * Supabase when it is configured, the bundled demo catalogue otherwise. Every
 * page and server action imports `store` and never branches on the mode — the
 * only place the distinction surfaces is the "Demo data" badge in the UI.
 */
export const store: DataStore = isSupabaseConfigured ? supabaseStore : demoStore;

export const isDemoMode = store.mode === "demo";

export type { DataStore, PropertyInput } from "./types";
export type { Facets } from "./filters";
