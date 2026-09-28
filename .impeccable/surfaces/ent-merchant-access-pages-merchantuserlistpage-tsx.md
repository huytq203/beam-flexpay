---
version: 1
slug: "ent-merchant-access-pages-merchantuserlistpage-tsx"
primary_target: "src/pages/merchant-management/merchant-access/pages/MerchantUserListPage.tsx"
related_targets: ["src/pages/merchant-management/merchant-access/pages/MerchantRoleListPage.tsx"]
---

# Merchant access

Mode: Operate. Sources: `Quản trị Merchant.dc.html` screens `users` and `roles` in the supplied Downloads folder; SRS sections 2.8–2.9. Scope: Merchant User and Merchant permission groups only. Admin account and Admin roles stay separate.

## Direction contract

THESIS: Carry the supplied two-list mockup into the existing FlexPay CMS shell, with Merchant identity visible wherever an operator may change access.

OWN-WORLD: Use the shell's foreground, border, muted, primary, success, warning and danger tokens; white bordered surfaces, compact outlined action buttons, and the project's display/body type. No new palette or component family.

STORY: Filter a system-wide list, inspect Merchant and scope, then make a deliberate access change. Show the affected Merchant again in confirmations.

FIRST VIEWPORT: Header and actions, compact count cards, a context line with responsive filters, then a horizontally scrollable table. User and role pages share this rhythm.

FORM: Supplied mockup is the pinned composition; no concept seed applies to this specified extension. Interactions use shared UI wrappers and typed data outside the view.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
