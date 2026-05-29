# Deploy flashcards lên Vercel + Firebase

## A. Tạo Firebase project (5 phút)

1. Vào https://console.firebase.google.com → **Add project**
2. **Project name**: `japanese-flashcards` (hoặc tên bạn thích) → Continue
3. **Google Analytics**: tắt cho gọn → Create project → đợi ~30s

## B. Đăng ký Web app

1. Trong project Firebase → click icon **`</>`** (Add app → Web)
2. **App nickname**: `flashcards-web` → **Register app**
3. Hiện cấu hình `firebaseConfig` — **copy 6 giá trị** (apiKey, authDomain, ...)
4. Paste vào `firebase-config.js`, thay 6 PLACEHOLDER
5. Skip "Add Firebase SDK" / "Install Firebase CLI" — đã có sẵn trong code

## C. Bật Email Link Authentication

1. Trong Firebase Console → **Build → Authentication** → **Get started**
2. Tab **Sign-in method** → **Email/Password** → **Enable**:
   - Bật toggle **Email/Password**
   - Bật cả toggle **Email link (passwordless sign-in)** (quan trọng — đây là cách app dùng)
   - **Save**
3. Tab **Settings → Authorized domains** — thêm:
   - `japanese-flashcards-ashy.vercel.app`
   - (`localhost` đã có sẵn cho test local)

## D. Tạo Firestore database

1. Sidebar → **Build → Firestore Database** → **Create database**
2. **Location**: `asia-southeast1 (Singapore)` — gần Việt Nam
3. **Start in production mode** → Next → Enable
4. Sau khi database tạo xong, vào tab **Rules** → xoá toàn bộ → paste nội dung file `firestore.rules` (xem bên dưới) → **Publish**

## E. Update code + push GitHub

```bash
cd /Users/myho/Documents/flashcards
git add firebase-config.js
git commit -m "Add Firebase credentials"
git push
```

Vercel auto-redeploy ~30s. Refresh URL → nút **Đăng nhập** xuất hiện ở header.

## F. Đăng nhập thử

1. Click **Đăng nhập** → nhập email → **Gửi link đăng nhập**
2. Mở email → click link "Sign in to japanese-flashcards"
3. Quay lại app → đã đăng nhập, mọi thay đổi (thuộc/★/shuffle) tự sync sau 2s
4. Mở app trên điện thoại → đăng nhập cùng email → thấy tiến trình đồng bộ

## Lưu ý

- `firebase-config.js` (apiKey, projectId, ...) **an toàn để public** — Firestore Security Rules bảo vệ data
- Không đăng nhập vẫn dùng được — tiến trình lưu localStorage
- Mất mạng vẫn dùng được — sync sẽ retry khi mạng lại
- Reset tiến trình cloud: Firebase Console → Firestore → `users/{uid}/decks/` → xoá doc

## Gemini AI Grading (cho practice ngữ pháp N5)

Tính năng dịch tự do trong practice (3 câu Việt→Nhật + 3 câu Nhật→Việt) cần Gemini API key:

1. **Lấy API key** (free):
   - Vào https://aistudio.google.com/app/apikey
   - Sign in Google → **Create API key** → copy

2. **Add env var trên Vercel:**
   - Vercel Dashboard → project `japanese-flashcards` → **Settings → Environment Variables**
   - Name: `GEMINI_API_KEY`
   - Value: paste API key
   - Environments: tick cả **Production, Preview, Development**
   - Save

3. **Redeploy:**
   - Vercel Dashboard → Deployments → click `...` ở deployment mới nhất → **Redeploy**
   - Sau ~30s, AI grading sẽ hoạt động

> 💡 Free tier Gemini: 15 req/phút, 1M token/ngày — quá đủ cho practice cá nhân.
> ⚠️ Local file:// KHÔNG gọi được serverless function — AI grading chỉ chạy trên Vercel.

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| Nút "Đăng nhập" không hiện | `firebase-config.js` còn PLACEHOLDER | Cập nhật 6 giá trị thật từ Firebase Console |
| Click link không quay lại app | Domain chưa authorized | Bước C-3, thêm domain Vercel vào Authorized domains |
| "Missing or insufficient permissions" | Firestore rules chưa publish | Quay lại bước D-4 |
| Email không nhận được | Spam folder / Firebase free tier có rate limit | Check spam, đợi 1 phút thử lại |
