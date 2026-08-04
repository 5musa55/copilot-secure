import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://qpvmuihuijeiygwaluga.supabase.co",
    "sb_publishable_irAggUMH7nGFLUFnbGz1zw_kMM-JtSJ"
  )
}