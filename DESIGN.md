---
name: FlexPay CMS
description: A transit-map startup portal on a signage-light ground, riding on a teal-neutral admin shell.
colors:
  portal-ground: "#eceef2"
  portal-plate: "#ffffff"
  portal-ink: "#12181f"
  portal-ink-soft: "#5b6572"
  portal-rule: "#d5d9e0"
  portal-dim: "#7f8895"
  line-transaction: "#e0402f"
  line-transaction-ink: "#a52a1c"
  line-wallet: "#1f63d6"
  line-wallet-ink: "#14459c"
  line-role: "#7a3bc4"
  line-role-ink: "#5a2795"
  line-merchant: "#3f9440"
  line-merchant-ink: "#2c6a2d"
  line-fee: "#e08700"
  line-fee-ink: "#8a5200"
  primary: "#2bd9d0"
  primary-foreground: "#062f2d"
  background: "#ffffff"
  foreground: "#101114"
  border: "#c9e9e7"
  muted-foreground: "#647c7b"
  success-strong: "#0b7a4a"
  warning-strong: "#a15c07"
  danger-strong: "#c62828"
typography:
  display:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.04em"
  title:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "0.06em"
  body:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  body-small:
    fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.12em"
  label-micro:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.08em"
  numeric:
    fontFamily: "Archivo, 'IBM Plex Sans', Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "16px"
    fontFeature: "tabular-nums"
rounded:
  signage: "3px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  line-code-badge:
    backgroundColor: "{colors.line-transaction-ink}"
    textColor: "#ffffff"
    typography: "{typography.label-micro}"
    rounded: "{rounded.signage}"
    padding: "2px 6px"
  line-risk-chip:
    textColor: "{colors.line-transaction-ink}"
    typography: "{typography.label-micro}"
    rounded: "{rounded.signage}"
    padding: "2px 6px"
  station-link:
    textColor: "{colors.portal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "2px 8px 2px 36px"
  station-link-hover:
    backgroundColor: "{colors.portal-plate}"
    textColor: "{colors.line-transaction-ink}"
  network-label:
    backgroundColor: "{colors.portal-plate}"
    textColor: "{colors.portal-ink}"
    typography: "{typography.label-micro}"
    rounded: "{rounded.signage}"
    padding: "3px 8px"
  network-label-hub:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.signage}"
    padding: "3px 8px"
---

# Design System: FlexPay CMS

## Overview

**Creative North Star: "The Network Map"**

FlexPay CMS is where BEAM staff touch real money: eKYC approvals, transaction disputes, fee policy, internal permissions. The startup portal at `/secure-panel` states that job as a transit network — five business domains are five lines, every permitted screen is a station, and the operator's own permission set is the map that gets drawn. Nothing is generic: the map has exactly as many lines and stations as the signed-in account may enter. The material is printed signage rather than software chrome: a cool paper ground (`#eceef2`), near-black ink, saturated line colours reserved for graphics, and Archivo set uppercase with wide tracking the way an enamel station plate is set.

Density is a virtue here, not a cost. Every station the account can reach shows its full printed name on first paint — nothing hides behind a hover, nothing is an icon-only affordance, and no decorative empty field pads the composition out. The 3D network is a real extruded model with a real key light and a real cast shadow: depth is modelled, never painted on with a CSS shadow. The rejected alternative is explicit and permanent — a grid of icon/title/description cards and a hero KPI band are not how this product introduces itself.

The rest of the CMS runs on an incumbent teal shell (`#2bd9d0` on white, 12px radii, flat surfaces separated by a 1px `#c9e9e7` rule). The portal does not overturn that shell; it sits beside it as a chrome-less full-viewport surface with no header and no sidebar, and it hands the brand teal exactly two jobs — the interchange disc and the focus ring.

**Key Characteristics:**
- Signage-light ground with near-black ink; no glass, no gradient, no blur.
- Five domain colours as a full palette, each shipped as a block/ink pair.
- Archivo uppercase with wide tracking for anything that behaves like a printed plate; Inter for prose.
- Real modelled depth in WebGL, flat DOM at rest.
- Every destination is a labelled, keyboard-reachable link.

## Colors

A signage palette: one cool paper ground, one near-black ink, and five saturated line identities that carry meaning rather than decoration.

### Primary
- **FlexPay Teal** (`#2bd9d0`): the incumbent brand accent and the shell's action colour. On the portal it is rationed to two roles only — the interchange disc that says "bạn ở đây" and every focus ring. It is never a line colour and never a surface fill on this surface.

### Secondary — the five line identities
Each domain ships as a pair: the `-block` value paints rails, ribbons, station discs and chip rings; the `-ink` value is the only one allowed to be text, and it is also the fill behind white badge text (measured 6.39–9.73:1).
- **Vermilion — Giao dịch** (block `#e0402f`, ink `#a52a1c`): transaction handling, reconciliation, money movement.
- **Cobalt — Ví cá nhân** (block `#1f63d6`, ink `#14459c`): personal wallets, eKYC, identity.
- **Violet — Phân quyền** (block `#7a3bc4`, ink `#5a2795`): internal accounts and access scope; carries the elevated-risk chip.
- **Leaf — Merchant** (block `#3f9440`, ink `#2c6a2d`): merchant onboarding and business wallets.
- **Amber — Phí** (block `#e08700`, ink `#8a5200`): fee policy and assignment; carries the elevated-risk chip.

### Neutral
- **Signage Paper** (`#eceef2`): the full-bleed ground of the portal and its layout shell. The one surface colour behind everything.
- **Plate White** (`#ffffff`): raised paper — station-disc fills, hovered station rows, map labels, the modelled plates in the 3D scene.
- **Platform Ink** (`#12181f`): primary text and station names.
- **Muted Ink** (`#5b6572`): secondary prose, status line, line descriptions, muted line headings.
- **Rule Grey** (`#d5d9e0`): the drafting-table grid under the model, scrollbar thumbs, skeleton bars. Never text.
- **Dimmed Line** (`#7f8895`): the colour a line takes when another line is focused. Held at ≥3:1 against the ground on purpose.

### Named Rules
**The Block-Is-Not-Ink Rule.** A saturated line colour is never used as text colour. Text on a light ground takes the `-ink` variant; the block value is for rails, ribbons, discs and rings only.

**The Recede-By-Colour Rule.** A muted element changes colour, it does not lose opacity. The four unfocused lines stay fully opaque at `#7f8895` (≥3:1 on ground) because rails and station discs are meaningful graphics and the legend is the screen's only navigation. Map labels obey the same rule: a muted label keeps its text, swapping to muted ink (`#5b6572`) with a `#7f8895` dot, dropping its shadow, and softening its plate to a 72% mix of plate white — it recedes, it never dissolves. Anything that is the sole carrier of a destination must never be faded out.

**The Rationed Teal Rule.** On the portal, `#2bd9d0` means "you are here" and "this is focused" — nothing else. A sixth domain does not get teal; it gets a sixth line pair.

## Typography

**Display / Signage Font:** Archivo (variable, `wdth 75..112`, `wght 400..800`), fallback IBM Plex Sans → Helvetica → Arial
**Body Font:** Inter, fallback Helvetica Neue → Helvetica → Arial
Both load from Google Fonts alongside the shell's incumbent IBM Plex Sans — a decision taken 2026-09-04 with the offline risk knowingly accepted at project level.

**Character:** Archivo is the enamel plate — grotesk, heavy, uppercase, tracked wide, and readable at 10px. Inter is the voice that explains, set at ordinary case and ordinary weight. The two never trade jobs.

### Hierarchy
- **Display** (Archivo 800, `clamp(2rem, 3.6vw, 3rem)`, line-height 1.02, tracking −0.03em): the operator's given name at the head of the left column, closed with a teal full stop. One per screen.
- **Headline** (Archivo 800, 24px, uppercase, tracking 0.04em): full-screen state headings such as the no-permissions empty state.
- **Title** (Archivo 700, 15px, uppercase, line-height 20px, tracking 0.06em): line names in the legend — the map's route headers.
- **Body** (Inter 400, 13px, line-height 20px): station names and the intro sentence. Prose is held to ~44ch; the empty-state paragraph to 52ch.
- **Body small** (Inter 400, 12px, line-height 16px): one-line domain descriptions under each route header.
- **Label** (Archivo 600, 11px, uppercase, tracking 0.12em): the shift status row — greeting, date, place, weather.
- **Label micro** (Archivo 600–700, 10–11px, uppercase, tracking 0.08–0.1em): map station labels, line codes, the elevated-risk chip.
- **Numeric** (Archivo 600, 15px, `tabular-nums`): the shift clock, and any figure that must not jitter.

### Named Rules
**The Enamel Plate Rule.** Anything that behaves like printed signage — route header, station label, code badge, status row — is Archivo, uppercase, tracked ≥0.06em. Anything that is a sentence is Inter, sentence case, untracked.

**The Full Digit Rule.** Clocks, counts and amounts are `tabular-nums` and never abbreviated.

## Layout

The portal is full-bleed: `min-height: 100dvh`, and at `lg` and above exactly `100dvh` with `overflow: hidden`, so the composition never scrolls as a page. There is no header and no sidebar — the layout wrapper deliberately drops both and the screen navigates itself.

Above `lg` (1024px) the frame is a two-column grid, `minmax(340px, 36%)` for the legend and the remaining `1fr` for the model. The legend column is the only scroll container (thin scrollbar, `#d5d9e0` thumb) and starts 128px down so the display name clears the floating top bar; the model column fills its cell. Below `lg` the order inverts: the map comes first as a `38dvh` band with a `260px` floor, the legend follows beneath it, and the page scrolls normally. Station labels are dropped from the narrow-viewport map because the discs fall under the safe touch size there — the legend below is then the only path, and it carries every name.

The top bar floats over the ground rather than occupying a row: absolutely positioned, `pointer-events: none` except for the logo and the account control, 24/32/40px horizontal inset by breakpoint.

Rhythm is a 4px base stepped 4 · 8 · 12 · 16 · 24 · 32 · 40, with 128px reserved as the desktop top offset. Legend routes sit 12px apart; the status row uses 16px column gaps and 8px row gaps.

Map geometry is one shared source of truth: every segment runs on a multiple of 45° in Beck's diagram grammar, lines fan out from a single interchange on a `[-90, -45, 0, 45, 90]` slot set chosen symmetrically for fewer than five lines, and the same maths drives both the WebGL model and the SVG fallback so the two can never disagree.

## Elevation & Depth

Depth is modelled, not painted. The DOM is flat: no card shadows, no glass, no gradient. What reads as three-dimensional is an actual WebGL scene — extruded line ribbons and station plates lit by a hemisphere fill (`#ffffff` over `#c7ced8`, intensity 2.1) and a key directional light (intensity 2.4) casting PCF-soft shadows onto a transparent shadow plane at 10% opacity, with each line held at its own elevation so crossings are genuine grade separations. Materials are matte: roughness 0.34–0.42, metalness 0–0.05. A 44px ruled grid, radially masked and held at 70%, gives the model a drafting table to stand on.

The only DOM shadow in this world is the map label's hairline lift.

### Shadow Vocabulary
- **Label lift** (`box-shadow: 0 1px 3px rgb(18 24 31 / 0.18)`): the sole DOM shadow, separating a floating map label from the model behind it. The hub label drops even this and relies on teal fill instead.
- **Shell ambient** (`rgba(0,0,0,0.03) 0 4px 24px`) and **shell micro** (`rgba(16,24,40,0.04) 0 1px 4px`): the incumbent admin shell's two diffuse tokens, for surfaces outside the portal.

### Named Rules
**The Modelled-Depth Rule.** If something should look raised on this surface, model it and light it. Do not simulate depth with a CSS shadow, and never with a hard offset shadow.

**The Flat-At-Rest Rule.** Panels, cards and tables at rest carry no shadow anywhere in the product; separation is a 1px rule — `#d5d9e0` in the portal, `#c9e9e7` in the teal shell.

## Shapes

Two radius vocabularies, deliberately distinct. Signage geometry is nearly square: 3px on code badges, risk chips and map labels — a printed plate has a corner, not a curve. Interactive rows and controls take the shell's scale: 6px (badges/tags), 8px (tooltips/popovers), 12px (buttons, inputs, cards), 16px (modals). Fully round is reserved for circles that mean something: station discs, the interchange disc, the 3px line rails whose caps are rounded so a route reads as a continuous ribbon. Buttons are never pills.

Line identity is carried by stroke, not fill: a 3px vertical rail down the legend, station discs as 9px white circles with a 2.5px coloured ring, route heads as 17px white circles with a 3px ring. The elevated-risk chip is an inset ring in the line's block colour with `-ink` text — outlined, never filled.

## Components

### Line Strip (signature)
The legend is the menu, not a caption for the model. Character: a strip diagram peeled off a carriage wall.
- **Structure:** a full-height 3px rail in the line colour, a ringed route head, an uppercase Archivo route name, a 12px description, and the stations hanging off the rail in map order.
- **Colour:** the whole strip is driven by two scoped custom properties, `--line` (block) and `--line-ink` (text). Muting swaps both to `#7f8895` / `#5b6572`; nothing changes opacity.
- **Badges (right side):** a `-ink`-filled code badge with white text (`GD`, `VI`, `PQ`, `MC`, `PH`), preceded on high-blast-radius domains by an outlined `KIỂM SOÁT` chip.
- **States:** pointer enter and keyboard focus both focus the line, which mutes the other four and shifts the model's camera toward it; leaving or blurring restores. Colour transitions run 300ms.

### Station Link
- **Style:** a real router link, 13px Inter, ink text, 6px radius, indented 36px so it sits on the rail.
- **Hover:** plate-white row fill, the station disc scales to 125%, an arrow slides in from −4px to 0 and fades up, and the text takes the line's `-ink` colour.
- **Focus:** identical arrow reveal plus a 2px teal focus ring. Every station is tabbable; none is icon-only.

### Network Model / Diagram
- **Model:** a WebGL scene loaded through a dynamic import so `three` never enters the main bundle. Extruded ribbons, plate-white station discs, HTML station labels projected each frame.
- **Labels:** plate-white 3px chips, Archivo 10px uppercase tracked 0.08em, prefixed by a 5px dot in the line colour; the hub label inverts to teal fill with `#062f2d` ink. When its line is muted, a label swaps to muted ink and a dim dot, loses its shadow, and thins its plate to a 72% mix of plate white — the text stays fully legible.
- **Fallback:** an SVG diagram built from the identical geometry, used when WebGL is unavailable and at narrow widths. It keeps every station as a real link with its printed label; only the label-less narrow variant steps back to decoration and is hidden from assistive tech.

### Top Bar
- **Style:** floating, transparent, no border, no breadcrumb, no page title. Logo at 32px height on the left, account control on the right, 16px vertical padding. It is the only chrome the surface admits.

### Empty State
- **Style:** centred on the ground, a 52px duotone outline mark, a 24px uppercase Archivo headline, and a 52ch muted paragraph naming the fix (contact an administrator). No illustration panel, no card.

### Motion
One entrance sequence, ~1.2s, no loops and no scroll animation: top bar drops in, the display name wipes up under a `clip-path` reveal, the intro and status row rise, then routes and stations slide in from the left on a stagger. Focus interactions run 240–300ms colour tweens. `prefers-reduced-motion` skips the sequence entirely and the static SVG map is used.

### Named Rules
**The Never-Fade-The-Menu Rule.** The entrance sequence never animates `opacity` on `[data-portal-line]` or `[data-portal-station]`; those elements move on `transform` alone, with `clearProps` on completion. A sequence that never starts, stalls mid-way, or is cut short must still leave the navigation fully readable. This is enforced by `src/pages/home/test/usePortalMotion.test.tsx` and it exists because an earlier fade left the menu permanently invisible on a real screen.

## Do's and Don'ts

### Do:
- **Do** give a new business domain its own line pair — `--line-<token>` for graphics and a darker `--line-<token>-ink` for text — registered next to the permission key, so it appears on the map instead of vanishing.
- **Do** use `-ink` values for text and as the fill behind white badge text; keep measured contrast at or above 4.5:1.
- **Do** mute by swapping to `#7f8895`, keeping the muted line fully opaque and ≥3:1 against the ground.
- **Do** set signage in Archivo uppercase with tracking ≥0.06em, and prose in Inter at sentence case.
- **Do** move entrance content with `transform` and `clip-path`; give every element that is the only route to a destination a resting state that survives no animation at all.
- **Do** print the full name on every node — station labels, route names, code badges — and make each one a real, tabbable link.
- **Do** derive any second rendering of the map from the shared 2D geometry so the fallback and the model never disagree.
- **Do** keep heavy visual dependencies behind a dynamic import.
- **Do** separate resting surfaces with a 1px rule (`#d5d9e0` in the portal, `#c9e9e7` in the shell).

### Don't:
- **Don't** use a saturated line block colour as text colour.
- **Don't** fade navigation to convey state — that is what the dim colour is for.
- **Don't** spend the brand teal on anything but "you are here" and focus rings on this surface.
- **Don't** paint depth with CSS: no glass, no blur, no gradient, no hard offset shadow. Model it and light it, or leave it flat.
- **Don't** reintroduce an icon/title/description card grid or a hero KPI band as this screen's structure.
- **Don't** ship an icon-only affordance or an unlabelled node on the map.
- **Don't** show business figures or sensitive data on the startup surface; it states scope, not results.
- **Don't** put a header, sidebar, breadcrumb or page title on the portal — the screen is the navigation.
- **Don't** invent spacing outside the 4 · 8 · 12 · 16 · 24 · 32 · 40 rhythm, or a radius outside 3 / 6 / 8 / 12 / 16 / full.
- **Don't** give buttons a pill radius.
