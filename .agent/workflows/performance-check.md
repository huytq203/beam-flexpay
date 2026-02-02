---
description: Check performance của feature/hook để phát hiện re-render issues
---

# Performance Check Workflow

## Khi nào chạy workflow này?
- Sau khi tạo hook mới
- Sau khi refactor component
- Khi nghi ngờ có re-render không cần thiết
- Trước khi merge PR

## Steps

### 1. Kiểm tra kích thước Hook

```bash
# Count số dòng return trong hook
grep -A 100 "return {" src/pages/[domain]/hooks/use*.tsx | wc -l
```

**Expect**: <30 dòng (tương đương <15 returns)

> ⚠️ Nếu >30 dòng → Tách hook theo concerns

---

### 2. Kiểm tra useCallback

```bash
# Search handlers không có useCallback
rg "const handle\w+ = async" src/pages/[domain]/hooks/ --type tsx
```

**Expect**: Tất cả handlers phải wrap bằng `useCallback`

```typescript
// ❌ Bad
const handleSubmit = async (data) => { ... }

// ✅ Good  
const handleSubmit = useCallback(async (data) => { ... }, [deps])
```

---

### 3. Kiểm tra useMemo

```bash
# Search computed arrays không có useMemo
rg "const \w+ = .*\.map\(" src/pages/[domain]/hooks/ --type tsx
```

**Expect**: Computed arrays/objects phải wrap `useMemo`

```typescript
// ❌ Bad
const dataSource = data?.map(...)

// ✅ Good
const dataSource = useMemo(() => data?.map(...), [data])
```

---

### 4. Kiểm tra React.memo

```bash
# Check components chưa memo
rg "^export default (?!memo)" src/pages/[domain]/components/ --type tsx
```

**Expect**: Form components nên export với `memo`

```typescript
export default memo(FormSearch)
```

---

### 5. Run ESLint

// turbo
```bash
npm run lint
```

**Expect**: Không có warning `react-hooks/exhaustive-deps`

---

### 6. Test Re-renders với Console

Thêm vào components:

```typescript
useEffect(() => {
  console.log(`🔴 [ComponentName] rendered`)
})
```

**Test cases**:
1. Click pagination → Chỉ Table log
2. Open modal → Chỉ Modal log  
3. Search → Chỉ FormSearch + Table log

---

### 7. Profiler Test (Manual)

1. Mở React DevTools → Profiler tab
2. Record session
3. Thực hiện actions:
   - Pagination
   - Search
   - Modal open/close
   - CRUD operations
4. Stop và review flame chart

**Expect**: 
- Pagination: <5 components re-render
- Modal toggle: <3 components re-render
- Search: <8 components re-render

---

## Quick Fix Checklist

Nếu phát hiện issues:

- [ ] Hook >15 returns → Tách thành hooks nhỏ
- [ ] Handler không `useCallback` → Thêm ngay
- [ ] Computed value không `useMemo` → Thêm ngay
- [ ] Component không memo → Wrap `memo`
- [ ] Missing dependencies → Fix theo ESLint suggestion

---

## Performance Score

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Hook lines | <30 | 30-50 | >50 |
| useCallback coverage | 100% | >80% | <80% |
| useMemo coverage | 100% | >70% | <70% |
| Components memo'd | >80% | >50% | <50% |
| Re-renders/action | <5 | <10 | >10 |

---

**Pass workflow này → Feature sẵn sàng merge! ✅**
