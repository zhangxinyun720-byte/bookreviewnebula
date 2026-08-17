import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] 缺少环境变量 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。\n' +
    '请复制 .env.example 为 .env 并填入你的 Supabase 项目配置。'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
