// Supabase configuration — REPLACE 2 dòng dưới với credentials của bạn
// Lấy ở: Supabase Dashboard → Project Settings → API
// - "Project URL"   → SUPABASE_URL
// - "anon public"   → SUPABASE_ANON_KEY  (an toàn để public, RLS bảo vệ data)
//
// Khi 2 giá trị còn là PLACEHOLDER, app hoạt động ở chế độ localStorage
// (không cần đăng nhập, dữ liệu chỉ ở browser này).

window.SUPABASE_CONFIG = {
  url:     'PLACEHOLDER_SUPABASE_URL',
  anonKey: 'PLACEHOLDER_SUPABASE_ANON_KEY',
};
