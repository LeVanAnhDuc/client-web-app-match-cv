---
name: jsx
paths:
  - 'src/**/*.tsx'
---

# JSX Convention

## 1. Interactive element → Ant Design component

Mọi phần tử có **hành vi** (click, input, select, upload, submit, step, progress…) dùng component Ant Design — KHÔNG dùng raw HTML tag tương ứng:

| Nhu cầu              | Dùng (antd)                    | KHÔNG dùng                  |
| -------------------- | ------------------------------ | --------------------------- |
| Nút bấm              | `<Button>`                     | ❌ `<button>`               |
| Text/URL input       | `<Input>` / `<Input.TextArea>` | ❌ `<input>` / `<textarea>` |
| Chọn 1 trong nhiều   | `<Select>` / `<Radio.Group>`   | ❌ `<select>`               |
| Upload file          | `<Upload>`                     | ❌ `<input type="file">`    |
| Stepper / tiến trình | `<Steps>` / `<Progress>`       | ❌ tự dựng div              |
| Tabs                 | `<Tabs>`                       | ❌ tự dựng                  |
| Modal / dialog       | `<Modal>`                      | ❌ raw `<dialog>`           |

```tsx
// ✅ Đúng
import { Button, Input } from 'antd'

<Input.TextArea placeholder="Paste JD text" rows={8} />
<Button type="primary" onClick={onNext}>Next</Button>

// ❌ Sai
<button onClick={onNext}>Next</button>
<textarea />
```

### Ngoại lệ có tài liệu

Được dùng raw element cho phần tử tương tác **chỉ khi** component antd tương ứng có hạn chế cụ thể đã biết, và **PHẢI kèm comment giải thích lý do** ngay tại chỗ. Ví dụ thực tế: `SavedDocRadioList` dùng native `<input type="radio">` (không phải `<Radio>` của antd) để tránh lỗi wrapping của inline-flex label — có comment nêu rõ. Không có lý do tài liệu hoá → mặc định dùng antd.

## 2. Layout tag thô — được phép

Các tag layout/semantic thuần (không hành vi) dùng thẳng: `<div>`, `<span>`, `<p>`, `<ul>`/`<li>`, `<section>`, `<aside>`, `<main>`, `<h1>`… Tailwind class để style.

```tsx
<aside className="w-72 shrink-0 border-r ...">
  <h1 className="text-xl font-semibold">{t('appName')}</h1>
</aside>
```

## 3. Điều hướng — TanStack Router `<Link>`

Link nội bộ dùng `<Link to="...">` từ `@tanstack/react-router` (xem `imports.md`) — KHÔNG `<a href>` cho route nội bộ. `<a>` chỉ cho external URL.

## 4. Markup dễ đọc

- Giữ markup gọn; nhánh state (loading/error/empty) render rõ ràng, tách component con khi 1 nhánh markup lớn (xem `views.md`).
- Text hiển thị đi qua `t(...)` i18n — không hard-code chuỗi (xem `locales.md`).
