# Plan — Giao diện nhập OTP cho Đăng nhập & Đặt lại mật khẩu (Admin CMS)

Ngày: 2026-08-02 · Trạng thái: **chờ xác nhận, chưa viết code**
Nguồn contract: `flexpay.identity/.../v1/admin/AdminAuthController.java` + `AdminOtpConstants.java` + `AdminOtpChallengeServiceImpl.java`

---

## 0. Phát hiện quan trọng trước khi bàn giao diện

BE **đã đổi contract của hai endpoint mà FE đang gọi**, không phải chỉ thêm endpoint mới:

| Endpoint | FE hiện đang kỳ vọng | BE mới trả về |
|---|---|---|
| `POST /auth/login` | `DataLogin` (accessToken + refreshToken) | `AdminLoginResponse` — **không có token**, chỉ `otpRequired/requestId/maskedRecipient/expiresIn/canResendAfter/resendRemaining` |
| `POST /auth/reset-password` | `void` (đổi mật khẩu xong luôn) | `OtpChallengeResponse` — **mật khẩu chưa được áp dụng**, mới chỉ gửi OTP |

Hệ quả nếu deploy BE mà FE chưa sửa: đăng nhập "thành công" nhưng không có token → `authSlice` bỏ qua (guard `if (token)`), `Login.tsx` vẫn `navigate()` → `AuthLayout` thấy `accessToken` null → đứng im ở màn login. Và đặt lại mật khẩu báo thành công trong khi mật khẩu **chưa** đổi. Đây là lý do phải làm cả hai luồng cùng lúc, không tách phase được.

Hai endpoint mới thêm: `POST /auth/login/verify-otp`, `POST /auth/reset-password/verify-otp`, `POST /auth/otp/resend` (resend dùng chung cho cả hai luồng).

---

## 1. Sự thật từ BE — mọi con số trên UI phải bám theo đây

Từ `AdminOtpConstants.java`, không được hardcode lại ở FE mà **luôn đọc từ response**:

| Thông số | Giá trị | Ảnh hưởng UI |
|---|---|---|
| Độ dài mã | **6 chữ số** (`\d{6}`) | 6 ô hiển thị |
| TTL mã | 180s (3 phút) | `expiresIn` → đồng hồ đếm ngược |
| Cooldown gửi lại | 60s | `canResendAfter` → nút "Gửi lại" khoá kèm đếm ngược |
| Số lần gửi lại tối đa | 3 / phiên | `resendRemaining` → hiển thị "Còn N lần gửi lại" |
| Số lần nhập sai tối đa | 5 | BE trả `detail` = "Mã OTP không chính xác. Bạn còn N lần thử." |
| Khoá sau khi sai quá số lần | 900s (15 phút) | State khoá riêng, có `Retry-After` |
| Cửa sổ sống của phiên | 420s (7 phút) | Hết → `OTP_FLOW_EXPIRED`, phải làm lại từ đầu |
| Chống double-verify | 5s | 409 `OTP_VERIFY_IN_PROGRESS` |

**Kênh gửi đã được BE chốt là EMAIL** — `AdminOtpRecipientResolver` bắt buộc tài khoản có email đã verified trong Keycloak, notification đi qua `OtpEmailNotificationRequest`. Không cần plan hai nhánh email/SMS nữa. `maskedRecipient` là email đã che (`t***@beam.vn`). Nếu sau này thêm SMS, chỉ đổi câu copy và icon — cấu trúc màn không đổi.

`expiresIn` và `canResendAfter` là **giây**, và khi phiên được tái sử dụng (`reuseChallenge`) BE trả TTL **còn lại thật**, không phải 180. UI phải tin số từ response, không tự đặt lại 180 mỗi lần vào màn.

---

## 2. Điểm nhìn thiết kế

Cột auth hiện tại đã có một mạch rõ: *một hành động bảo mật, một cột 420px, không card nổi, teal `#2bd9d0` trên nền trắng*. Màn OTP nối tiếp mạch đó, không tạo thế giới mới.

**Luận điểm: mã OTP là một vật thể đang hết hạn, không phải một ô input.**

Điều làm màn này khác một form 6 ô thông thường: **tuổi thọ của mã là thành phần thị giác chính**, gắn liền với chính hàng ô nhập — không phải một dòng chữ "còn 02:59" trôi nổi bên dưới.

- Một **đường thời gian mảnh (2px) chạy sát dưới hàng 6 ô**, đúng bằng chiều ngang của hàng, rút ngắn tuyến tính theo `expiresIn`. Teal khi còn nhiều thời gian, chuyển hổ phách ở mốc 30s cuối. Người dùng cảm nhận thời gian mà không phải đọc số.
- Số `mm:ss` vẫn có, nhưng **nhỏ, thứ cấp**, đặt cạnh nhãn — vì đọc được số là yêu cầu a11y, không phải yêu cầu thẩm mỹ.
- Khi hết hạn: đường thời gian biến mất, hàng ô xám lại và **không nhận nhập nữa** — màn nói thẳng "Mã đã hết hạn", nút chính đổi thành "Gửi mã mới". Không để người dùng gõ vào một cái mã đã chết.

**Ba trạng thái có hình dạng riêng, không phải cùng một form đổi màu:** nhập mã · mã hết hạn · tài khoản bị khoá 15 phút. Trạng thái khoá tái dùng đúng ngôn ngữ của `InvalidLinkState` đã có trong `reset-password` — đĩa icon, tiêu đề, lời giải thích, một lối thoát duy nhất.

---

## 3. Quyết định kỹ thuật cho ô nhập

**Một `<input>` thật + 6 ô vẽ ra**, không phải 6 input rời (khác với `verify-code/style.css` cũ — file CSS mồ côi đó sẽ bị xoá).

```
<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d*">
  → trong suốt, phủ lên 6 ô; caret giả nhấp nháy ở ô đang nhập
```

Lý do: paste 6 số từ email hoạt động đúng (6 input rời phải tự viết logic phân phối ký tự và luôn lỗi ở IME/Android), backspace tự nhiên, screen reader đọc **một** trường có nhãn thay vì sáu ô vô danh, bàn phím số mobile không nhảy lung tung, và `autoComplete="one-time-code"` cho Safari/iOS gợi ý mã từ Mail.

**Cho phép paste — ngược với stance hiện tại của `Login.tsx`** (đang `preventDefault` trên copy/paste/cut ở username & password). Với OTP thì chặn paste chỉ làm khổ người dùng: mã dùng một lần, sống 3 phút, người dùng vừa mở email ngay cạnh. *Cần bạn xác nhận điểm này (§9).*

Auto-submit khi đủ 6 số, nhưng **chỉ một lần cho mỗi giá trị** — nếu sai và người dùng sửa lại thành cùng chuỗi cũ thì không tự gửi lại, tránh đốt sạch 5 lượt thử và tránh đâm vào lock 409 5 giây của BE. Nút "Xác nhận" vẫn giữ, cho người dùng bàn phím và cho trường hợp auto-submit bị chặn.

---

## 4. Kiến trúc file

```
src/components/ui/otp-input-component/
├── OtpInput.tsx            # primitive: input ẩn + 6 ô + caret giả (~110 dòng)
└── index.ts

src/pages/auth/shared/otp/
├── OtpChallengeStep.tsx    # khung màn dùng chung 2 luồng (~150 dòng)
├── OtpCountdownBar.tsx     # đường thời gian + mm:ss (~60 dòng)
├── OtpResendButton.tsx     # nút gửi lại + cooldown + resendRemaining (~70 dòng)
├── OtpLockedState.tsx      # trạng thái khoá 15 phút (~70 dòng)
├── useOtpChallenge.ts      # state máy của phiên OTP (~150 dòng)
├── useCountdown.ts         # đếm ngược theo deadline tuyệt đối (~40 dòng)
├── otp-error.ts            # map mã lỗi 221xx → thông điệp + hành động
├── types.ts                # OtpChallenge, OtpFlowStatus (as const)
└── index.ts

src/app/services/authEndpoints.ts   # + 3 mutation mới, sửa 2 mutation cũ
src/app/types/auth.ts               # + type challenge/verify
src/app/slices/authSlice.ts         # + matcher verifyLoginOtp.matchFulfilled
src/pages/auth/login/Login.tsx      # tách: LoginCredentialsStep + điều phối step
src/pages/auth/reset-password/      # + step OTP sau khi submit mật khẩu
src/pages/auth/verify-code/         # XOÁ (style.css mồ côi, không có TSX)
```

`useCountdown` đếm theo **deadline tuyệt đối** (`Date.now() + expiresIn*1000`), không phải `setInterval` trừ dần — tab bị throttle hay máy ngủ thì số vẫn đúng khi quay lại.

**Không tạo route mới.** OTP là một *step trong trang hiện tại*: `/login` và `/reset-password` tự đổi step. Lý do: `requestId` là chứng chỉ của phiên xác thực dở dang, chỉ được sống trong memory — không cookie, không localStorage, không URL. Reload trang = mất `requestId` = quay về bước đầu, và đó là hành vi đúng về mặt bảo mật. Một route `/verify-code` riêng sẽ hứa hẹn một thứ (URL chia sẻ/refresh được) mà ta cố tình không cho phép. `PATHS.AUTH.VERIFY_CODE` và `VERIFY` trong `pathConstant.ts` là hằng số chết → xoá.

Chặn thoát nhầm: khi đang ở step OTP, bấm Back của trình duyệt → quay về step nhập mật khẩu trong cùng trang (dùng `history.pushState` giả bước) thay vì rời trang. Đây là chi tiết nhỏ nhưng là lỗi khó chịu nhất của mọi luồng OTP.

---

## 5. Contract FE và cơ chế fallback khi BE chưa deploy

Fallback bằng **feature detection theo hình dạng response**, không bằng cờ môi trường và không bằng cách bắt 404 — nhờ vậy không bao giờ gọi vào endpoint chưa tồn tại.

### 5.1 Đăng nhập

```ts
// POST /auth/login  → AdminLoginResponse | DataLogin (BE cũ)
if ('accessToken' in data && data.accessToken) {
  // BE CŨ: vào thẳng hệ thống, y như hiện tại
} else if (data.otpRequired && data.requestId) {
  // BE MỚI: chuyển sang step OTP
} else {
  // Không đọc được → báo lỗi rõ ràng, KHÔNG điều hướng
}
```

`POST /auth/login/verify-otp` `{ requestId, otp }` → `AuthenticationResponse` (accessToken, expiresIn, refreshToken, refreshExpiresIn) → thêm matcher mới trong `authSlice` làm đúng việc mà matcher `userLogin` đang làm; matcher `userLogin` cũ **giữ nguyên** để BE cũ vẫn chạy (guard `if (token)` đã tự bỏ qua response mới).

### 5.2 Đặt lại mật khẩu

```ts
// POST /auth/reset-password → OtpChallengeResponse | null (BE cũ)
if (data?.requestId) {
  // BE MỚI: gửi OTP xong, sang step OTP
} else {
  // BE CŨ: mật khẩu đã đổi xong → SUCCESS như hiện tại
}
```

`POST /auth/reset-password/verify-otp` `{ requestId, otp }` → `void` → chuyển sang `SuccessState` sẵn có (đếm ngược 5s về login).

`useResetPassword` thêm status `AWAITING_OTP` vào `ResetPasswordStatus` — đúng mô hình 5 trạng thái đang có, không đập đi.

### 5.3 Gửi lại mã (dùng chung)

`POST /auth/otp/resend` `{ requestId }` → `OtpChallengeResponse` (requestId **không đổi**, TTL và cooldown mới).

### 5.4 Đọc `Retry-After`

429 của BE có header `Retry-After`. `fetchBaseQuery` không đưa header vào error mặc định → dùng `transformErrorResponse(baseQueryReturnValue, meta)` đọc `meta?.response?.headers.get('retry-after')` và gắn vào error object. Đây là nguồn số giây đáng tin cho đồng hồ khoá; text trong `detail` chỉ là dự phòng.

---

## 6. Trạng thái, lỗi và câu chữ

`otp-error.ts` viết theo đúng khuôn `password-reset-error.ts` đang có (đọc `body.status` làm mã lỗi, `body.detail` làm thông điệp).

| Mã | HTTP | Xử lý UI |
|---|---|---|
| `22101` OTP_INVALID | 400 | Rung hàng ô 1 lần, xoá sạch, focus lại; hiện `detail` của BE ("Bạn còn N lần thử") — **không tự chế số lần thử ở FE** |
| `22105` OTP_SESSION_EXPIRED | 400 | Chuyển state "mã đã hết hạn", CTA "Gửi mã mới" |
| `22111` OTP_FLOW_EXPIRED | 400 | Hết cửa sổ 7 phút → thông báo + đưa về bước đầu (login / forgot-password) |
| `22112` OTP_LOCKED | 429 | `OtpLockedState` + đếm ngược theo `Retry-After` (15 phút), khoá toàn bộ input |
| `22108` OTP_RESEND_COOLDOWN | 429 | Đồng bộ lại cooldown nút gửi lại theo `Retry-After` |
| `22109` OTP_MAX_RESEND | 429 | Ẩn nút gửi lại, giải thích đã hết 3 lượt, lối thoát về bước đầu |
| `22114` OTP_VERIFY_IN_PROGRESS | 409 | Im lặng giữ trạng thái loading ~1s rồi cho thử lại — không đổ lỗi cho người dùng |
| `22107` OTP_NOTIFICATION_FAILED | 500 | "Không gửi được mã" + nút thử lại |
| `22113` OTP_RECIPIENT_UNAVAILABLE | — | Tài khoản không có email verified → thông báo liên hệ quản trị hệ thống, đây là lỗi cấu hình tài khoản chứ không phải lỗi người dùng |
| `23015/16/17` | 400 | Token reset hỏng giữa chừng → dùng lại `toInvalidLinkMessage` sẵn có |
| FETCH_ERROR / TIMEOUT | — | Dùng `NETWORK_SUBMIT_ERROR` sẵn có, **giữ nguyên mã đã gõ** để người dùng chỉ cần bấm lại |

Copy tiếng Việt, hardcode như các màn auth hiện tại (i18n chưa cần theo PRODUCT.md). Thông điệp lỗi ưu tiên `detail` từ BE vì BE đã viết sẵn tiếng Việt và chứa số lần thử còn lại — FE chỉ fallback khi `detail` trống.

---

## 7. Đặc tả màn hình

**Trong cột `AuthLayout` 420px sẵn có** (brand panel weather bên trái giữ nguyên, không đụng).

```
[ header brand mobile — chỉ md:hidden, y hệt các màn auth khác ]

        ┌──────────┐
        │  ✉ + 🔒  │   đĩa 58px, bo 16px, gradient teal-50→teal-100
        └──────────┘   (cùng ngôn ngữ với đĩa mail của ForgotPassword)

        Nhập mã xác thực                      26px, extrabold
        Mã gồm 6 chữ số vừa gửi tới           13px, gray-400
        t***@beam.vn                          teal-600, semibold

        Mã xác thực              Hết hạn sau 2:47      ← nhãn + số phụ
        ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐
        │ 4││ 8││ 1││  ││  ││  │              ô 52×56, bo 10px, 22px semibold
        └──┘└──┘└──┘└──┘└──┘└──┘
        ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░              ← đường thời gian 2px

        [ Xác nhận ]                          42px, teal, full-width

        Gửi lại mã sau 0:47 · còn 2 lượt      13px, teal-600 khi bật
        ← Quay lại đăng nhập
```

**Ô nhập:**
- Rỗng: nền `gray-50/80`, viền `gray-200` — đúng bề mặt input của `Login`/`ForgotPassword`.
- Đang nhập (ô kế tiếp): viền teal + halo `rgba(43,217,208,0.14)` — cùng công thức focus của `ForgotPassword`.
- Đã có số: nền trắng, viền `gray-300`, chữ `gray-900`.
- Sai: viền đỏ + nền `red-50`, rung 1 nhịp ~200ms.
- Hết hạn / đang gửi: `opacity-60`, `pointer-events-none`.

**Responsive:** 6 ô × 52px + 5 khe 8px = 352px, vừa trong cột 420px kể cả padding. Dưới 360px: ô co còn 44px và khe 6px bằng `flex-1` + `min-w-0` — không xuống hai hàng, vì hai hàng phá cảm giác "một mã liền mạch". Bàn phím mobile không được che nút "Xác nhận": bọc `scroll-margin` + auto-scroll khi focus.

**Chuyển động** (gsap, đã có trong dự án):
- Vào step OTP: cột hiện tại trượt trái 12px + mờ dần, step OTP vào từ phải 12px — một hành trình có hướng, không phải cắt cảnh. ~280ms.
- 6 ô vào so le 40ms.
- Sai mã: rung ngang biên độ 6px, 1 nhịp.
- Thành công: các ô lần lượt chuyển viền teal (~50ms/ô) trước khi điều hướng — người dùng thấy mã được chấp nhận, không bị nhảy màn đột ngột.
- `prefers-reduced-motion`: bỏ toàn bộ trượt/rung, chỉ đổi màu. Bắt buộc.

**A11y:**
- Input thật có `<label>` gắn `htmlFor`, không dùng `aria-label` trên 6 div.
- 6 ô hiển thị `aria-hidden="true"` — screen reader chỉ thấy một trường.
- Lỗi: `role="alert"`, liên kết bằng `aria-describedby`, focus về input sau khi xoá.
- Đồng hồ: `aria-live="off"` cho số chạy từng giây (tránh spam), nhưng thông báo mốc **60s và 10s** qua vùng `aria-live="polite"` riêng.
- Vào step OTP: focus tự động vào input, và tiêu đề `tabIndex={-1}` được đọc — theo đúng cách `ForgotPassword` đang làm với `successHeadingRef`.
- Focus ring `outline-3 outline-offset-3 outline-teal-200`, dùng lại đúng công thức của `ForgotPassword`.

---

## 8. Kiểm thử (vitest + RTL, theo khuôn `reset-password/test/`)

- `OtpInput`: gõ số, chặn ký tự không phải số, paste 6 số, paste chuỗi có khoảng trắng/dấu gạch, backspace, đủ 6 số bắn `onComplete` đúng một lần.
- `useCountdown`: fake timers, nhảy thời gian hệ thống, unmount không rò interval.
- `useOtpChallenge`: verify thành công · 22101 còn lượt · 22112 khoá · 22111 flow hết hạn · 22114 im lặng thử lại · resend cooldown · mất mạng giữ nguyên mã.
- `Login`: BE cũ (có accessToken) vào thẳng · BE mới sang step OTP · verify xong lưu token và điều hướng.
- `ResetPassword`: BE cũ (không requestId) → SUCCESS ngay · BE mới → AWAITING_OTP → verify → SUCCESS.
- `otp-error`: bảng ánh xạ ở §6, gồm cả trường hợp `detail` trống.

---

## 9. Cần bạn xác nhận trước khi code

1. **Cho phép paste mã OTP** — ngược với stance chặn paste đang áp cho username/password ở `Login.tsx`. Tôi đề xuất cho phép, lý do ở §3 -cho phép.
2. **OTP là step trong trang, không phải route riêng** — kéo theo xoá `PATHS.AUTH.VERIFY_CODE`, `PATHS.AUTH.VERIFY` và thư mục `src/pages/auth/verify-code/`. Xác nhận thư mục đó thật sự là code chết. oke cho phép
3. **Thứ tự deploy.** FE sau khi sửa vẫn chạy được với BE cũ (§5), nhưng **BE mới bắt buộc phải đi cùng hoặc sau FE mới** — deploy BE trước sẽ làm hỏng đăng nhập và làm reset mật khẩu báo sai sự thật. Cần chốt với đội BE. oke
4. **Mốc chuyển màu hổ phách của đường thời gian: 30s cuối** — đề xuất của tôi, không phải quy định từ BE. oke

---

## 10. Thứ tự thi công (sau khi chốt §9)

1. Tầng type + service: `auth.ts`, `authEndpoints.ts` (3 mutation mới, sửa kiểu 2 mutation cũ), `transformErrorResponse` đọc `Retry-After`, `otp-error.ts`. Test cho `otp-error`.
2. Primitive `OtpInput` + `useCountdown` + test — dựng độc lập, chưa gắn luồng.
3. `useOtpChallenge` + `OtpChallengeStep` + `OtpCountdownBar` + `OtpResendButton` + `OtpLockedState` + test.
4. Gắn vào `Login` (tách `LoginCredentialsStep`, giữ `Login.tsx` < 200 dòng) + `authSlice` matcher mới + test.
5. Gắn vào `ResetPassword` (`AWAITING_OTP`) + test.
6. Dọn: xoá `verify-code/`, xoá hằng số path chết, chạy toàn bộ test + build.
