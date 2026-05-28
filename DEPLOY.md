# Deploy flashcards lên Vercel + Supabase

## A. Tạo Supabase project (5 phút)

1. Vào https://supabase.com → Sign up (Google/GitHub đăng nhập 1 click)
2. New project → đặt tên (vd: `flashcards`), password (lưu lại), region: **Southeast Asia (Singapore)**
3. Đợi ~1 phút khởi tạo
4. Trong Dashboard → **SQL Editor** → New query → paste toàn bộ nội dung `schema.sql` → **Run**
5. Lấy credentials: Dashboard → **Project Settings** → **API**, copy:
   - `Project URL` → paste vào `supabase-config.js` thay `PLACEHOLDER_SUPABASE_URL`
   - `anon public` key → paste thay `PLACEHOLDER_SUPABASE_ANON_KEY`
6. Test local: mở `index.html` → nút **"Đăng nhập"** xuất hiện ở góc phải header

## B. Cấu hình Auth (magic link)

1. Dashboard → **Authentication** → **Providers** → bật **Email** (mặc định đã bật)
2. Dashboard → **Authentication** → **URL Configuration** → **Site URL**: tạm điền `http://localhost` cho test
3. (Sau khi có URL Vercel ở bước D, quay lại đổi Site URL thành URL thật của Vercel để magic link redirect đúng)

## C. Push code lên GitHub

```bash
cd /Users/myho/Documents/flashcards
git init
git add -A
git commit -m "Initial flashcards app with Supabase sync"
```

Tạo repo trên GitHub (https://github.com/new) tên `flashcards`, rồi:

```bash
git remote add origin https://github.com/<username>/flashcards.git
git branch -M main
git push -u origin main
```

## D. Deploy lên Vercel (2 phút)

1. Vào https://vercel.com → Sign up bằng GitHub
2. **Add New… → Project** → import repo `flashcards`
3. **Framework Preset**: Other (Vercel tự nhận static site)
4. **Root Directory**: `./`  (mặc định)
5. **Build settings**: bỏ trống (không cần build)
6. Click **Deploy**
7. ~30s sau bạn có URL: `flashcards-xxx.vercel.app`

## E. Hoàn thiện

1. Quay lại Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://flashcards-xxx.vercel.app`
   - **Redirect URLs**: thêm `https://flashcards-xxx.vercel.app/**`
2. Mở URL Vercel, click **Đăng nhập** → nhập email → check mail → click link
3. Sau khi đăng nhập, mọi thay đổi (đã thuộc / ★ / thứ tự shuffle) tự sync lên cloud
4. Mở app trên điện thoại → đăng nhập email cùng → thấy tiến trình của mình

## F. Cập nhật code sau này

Mọi lần edit file local rồi push:
```bash
git add -A && git commit -m "..." && git push
```
Vercel auto-deploy trong ~30s.

## Lưu ý

- `supabase-config.js` chứa **anon key**, key này **an toàn để public** (RLS bảo vệ data) → commit vô GitHub OK
- Không đăng nhập vẫn dùng được — tiến trình lưu localStorage như cũ
- Mất mạng vẫn dùng được — sync sẽ retry khi có mạng lại
- Nếu muốn reset tiến trình cloud: vào Supabase → Table Editor → `user_deck_state` → xóa row tương ứng

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| Nút "Đăng nhập" không hiện | `supabase-config.js` còn PLACEHOLDER | Cập nhật URL/anonKey thật |
| "Email rate limit exceeded" | Gửi magic link quá nhanh | Đợi 1 phút |
| Click link không quay lại app | Site URL sai trong Supabase | Sửa Site URL ở bước E |
| Sync không cập nhật | RLS chặn | Verify `schema.sql` chạy thành công, RLS policies tồn tại |
