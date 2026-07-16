---
name: books-feature-plan-frontend
status: PLAN ONLY — nothing in this document has been implemented
---

# Books Feature — Frontend Plan

Companion to the backend plan (`BOOKS_FEATURE_PLAN.md` in `triskeloum-be`) — read that one first, since every prompt below maps to a specific backend prompt and reuses its entities/endpoints by name. Covers the sidebar section where books get created/managed, the admin tab that controls how the public Books section looks, the public landing-page section itself, and the customer-facing area (which doesn't exist yet in this codebase) where a buyer actually browses, buys, and reads or downloads what they paid for — plus categories, coupons, bundles, subscriptions, reviews, wishlists, physical shipping, analytics, and offline reading.

## Findings this plan is built on

- **There is currently no non-admin, logged-in area at all.** `App.tsx` only protects `/admin/*` behind `allowedRoles={['admin']}`; `MainLayout` is registered but empty. This plan introduces that layer.
- **Admin CRUD precedent**: `LandingPageSettings.tsx`'s "services" sub-CRUD (local array state, `temp-${Date.now()}` ids for unsaved rows, per-row Save/Delete, no bulk save) is the shape to copy for Books, Categories, Coupons, and Bundles admin management.
- **Sidebar wiring is two-place**: `Sidebar.tsx` has both a `menuItems` array and a separate `pathToKey` map — every new admin page needs both updated.
- **File upload today** goes through `FormData` + RTK Query mutations with `formData: true`. **No existing "paste a URL" input pattern exists anywhere** — new UI, not a copy of something already there.
- **Currency/CTA precedent**: `FormationSection.tsx`/`ServicesSection.tsx` already have the GHS/USD toggle and card-grid pattern — but their CTA is a WhatsApp inquiry link, not a real purchase. Books needs a real "Buy now."
- **Analytics precedent**: `StatGrid.tsx`, `KPICard.tsx`, `UsersGrowthChart.tsx`, `TopCoursesTable.tsx` already exist and are the components to reuse for the Books sales-analytics admin page, rather than building new chart primitives.
- **RTK Query convention**: `get<Plural>Query` / `create|update|delete<Singular>Mutation`, tag-based invalidation. Every new entity below follows this exactly.

## Prompt-by-prompt implementation plan

Sequencing mirrors the backend plan: Prompts 1–4 are the load-bearing core (catalog, purchase, delivery, library) and should ship first. Prompt 8 (subscriptions UI) is the heaviest and riskiest piece for the same reason it is on the backend side — consider deferring it past initial launch.

### Prompt 1 — Sidebar + Admin Books & Categories management (depends on backend Prompt 1)
- `src/components/Sidebar.tsx`: add a `Books` entry (`menuItems` + `pathToKey`, both required) pointing at `/admin/books`.
- `src/pages/admin/Books.tsx` — list + create/edit/delete, following the `LandingPageSettings` services-tab pattern (local array state, per-row save/delete, `temp-` ids). Fields: title FR/EN, description FR/EN, author, price GHS/USD, **category** (select, populated from `useGetBookCategoriesQuery`), delivery mode (Read-only/Downloadable radio), file source (Upload/Paste-a-URL radio, conditional field), cover image (`FileUploadZone`), preview file (optional second upload), `is_active`.
- `src/pages/admin/BookCategories.tsx` — simple CRUD for the category list (name FR/EN, slug, icon, sort order) — small page, same pattern, needed before books can be assigned a category.
- `src/services/api.ts`: `getBooks`/`getBook`/`createBook`/`updateBook`/`deleteBook`, `getBookCategories`/`createBookCategory`/etc., tags `'Books'`/`'BookCategories'`. List query supports `category`/`q`/`sort` params matching backend Prompt 1's filter support.
- `src/App.tsx`: register `/admin/books` and `/admin/books/categories` under the existing admin route group.
- Acceptance: admin manages the category list, then creates books against it, either uploading a file or pasting an external link, and marks each read-only or downloadable.

### Prompt 2 — "Books" tab in Landing Page Settings (depends on a small backend addition to the existing `LandingPageContent` section pattern — not a new backend prompt)
- New `'books'` tab in `LandingPageSettings.tsx`'s `TabType` union, with a `booksSettings` state slice (title/subtitle/description FR/EN) loaded/saved exactly like the `formations` tab's header fields — this tab controls section copy and on/off only; the catalog itself is managed on the Prompt 1 page, matching the split you asked for.
- Acceptance: admin edits the public Books section's heading text independent of managing individual books.

### Prompt 3 — Public "Books" landing section with search/filter/sort (depends on Prompt 1+2, backend Prompt 1)
- `src/pages/public/components/BooksSection.tsx`, added to `LandingPage.tsx`'s section list.
- Reuse the GHS/USD toggle + card-grid pattern from `FormationSection.tsx`. Add: a category filter bar (pills, one per active category), a search input, and a sort dropdown (Newest / Price / Rating) — all as query params passed to `useGetBooksQuery`, matching backend Prompt 1.
- Show `avg_rating`/`review_count` (backend Prompt 7) as a star rating on each card once that prompt exists; render nothing (no placeholder stars) until it does, rather than faking data.
- CTA per book: free → "Read/Download for free"; paid + logged out → route to `/login?redirect=...`; paid + logged in → "Buy now" starts checkout (backend Prompt 3), with a coupon-code input shown at the checkout-confirmation step (backend Prompt 5) before redirecting to Paystack.
- Acceptance: visitors can filter/search/sort the catalog and a logged-in buyer can apply a coupon before paying.

### Prompt 4 — Customer area: checkout return + "My Library" + reader (depends on backend Prompts 3+4)
- `src/layouts/MainLayout.tsx` gets its first real child routes.
- `src/pages/library/MyLibrary.tsx` — owned books via `useGetMyBooksQuery` (backend's `GET /app/me/books`), "Read"/"Download" per `delivery_mode`. Check `ProtectedRoute.tsx` — it may be hardcoded to `admin` only and need a `user`-role variant.
- `src/pages/library/CheckoutReturn.tsx` — Paystack redirect target, polls/re-fetches until the webhook lands.
- `src/pages/library/BookReader.tsx` — in-browser viewer for `READ_ONLY` books (new dependency needed, e.g. `react-pdf`), streamed from the authenticated `/read` endpoint; no download affordance. Be upfront internally that this is a normal reading UI, not real DRM.
- Acceptance: after payment, the buyer lands in My Library and can read or download per book.

### Prompt 5 — Coupons (admin UI) (depends on backend Prompt 5)
- `src/pages/admin/Coupons.tsx` — CRUD: code, discount type (percentage/fixed) + value, scope (all books / specific books / specific category / specific bundle — conditional picker shown per scope), date range, `max_uses_total`, `max_uses_per_user`, `min_order_amount`, `is_active`, plus a read-only "used X / Y times" column sourced from the backend's per-coupon usage stats.
- Acceptance: admin creates a scoped, capped, dated coupon and can see its live redemption count.

### Prompt 6 — Bundles (depends on backend Prompt 6)
- `src/pages/admin/Bundles.tsx` — CRUD: title/description FR/EN, cover, price GHS/USD, and a multi-select picker of existing books (reuses the catalog list from Prompt 1's `useGetBooksQuery`).
- `src/pages/public/components/BooksSection.tsx` gains a "Bundles" sub-tab or a visually distinct bundle card ("N books, save X%" computed client-side from the individual books' prices vs. the bundle price) with its own "Buy bundle" CTA hitting `POST /app/bundles/:id/checkout`.
- Acceptance: a bundle is buildable from existing books and purchasable as one checkout that unlocks every book in it.

### Prompt 7 — Reviews & ratings (depends on backend Prompt 7)
- On `BooksSection.tsx` / a book detail view: review list (approved only) + star rating input for verified owners (call `useGetMyBooksQuery` or a lighter "do I own this" check to decide whether to show the review form at all, rather than showing it and erroring on submit).
- `src/pages/admin/BookReviews.tsx` — moderation queue: pending reviews with Approve/Reject actions.
- Acceptance: only owners can submit a review; only approved reviews are publicly visible; admin has a single queue to clear.

### Prompt 8 — Subscriptions UI (depends on backend Prompt 8 — heaviest prompt on both sides, consider deferring past initial launch)
- `src/pages/public/components/SubscriptionSection.tsx` (or a tab within `BooksSection.tsx`) — plan cards (monthly/yearly) with "Subscribe" starting the Paystack subscription flow.
- `src/pages/library/MyLibrary.tsx` gains a subscription-status banner (active/past-due/canceled) and a "Manage subscription"/cancel action.
- `src/pages/admin/SubscriptionPlans.tsx` — CRUD for plans; a read-only active-subscriber list.
- Acceptance: a subscriber sees every subscription-included book unlocked in My Library for as long as their subscription is active, with a clear status indicator when it lapses.

### Prompt 9 — Wishlists (depends on backend Prompt 9 — simplest prompt in this plan)
- A heart/bookmark icon on each book card (`BooksSection.tsx`) toggling `useAddToWishlistMutation`/`useRemoveFromWishlistMutation`.
- `src/pages/library/Wishlist.tsx` — the buyer's saved-for-later list, each item linking back to the book with a direct "Buy now."
- Acceptance: wishlisting persists across sessions and is visible from My Library's navigation.

### Prompt 10 — Admin: grant free copies & refunds (depends on backend Prompt 10)
- On `src/pages/admin/Books.tsx`'s per-book row (or a book detail admin view): "Grant free access" action — a small modal to pick a user (reuse the existing Users admin search) and confirm.
- On a new `src/pages/admin/BookOrders.tsx` (order history across all buyers): a "Refund" action per `PAID` order, with a confirmation dialog since it's irreversible-in-effect (immediately revokes the buyer's access).
- Acceptance: admin can gift a book without touching its price, and refunding instantly reflects in that buyer's My Library (book disappears / re-locks).

### Prompt 11 — Physical shipping UI (depends on backend Prompt 11, optional per book)
- `src/pages/admin/Books.tsx` form gains an optional "Physical edition" section (toggle + physical price + stock quantity), only shown once toggled on.
- `BooksSection.tsx`'s buy flow, when a book has a physical edition, offers Digital vs Physical (± both) and collects a shipping address (recipient name, phone, address lines, city, region, country) before checkout when Physical is chosen.
- `src/pages/admin/BookOrders.tsx` gains a fulfillment-status column/action (Pending → Processing → Shipped → Delivered) for physical orders, manually operated — no courier tracking integration in this pass.
- Acceptance: a physical purchase collects a real address and the admin can move it through the fulfillment states.

### Prompt 12 — Admin sales analytics dashboard (depends on backend Prompt 12)
- `src/pages/admin/BooksAnalytics.tsx` — revenue KPI tiles (`KPICard`), a sales-over-time chart (reuse the `UsersGrowthChart` pattern with book-sales data instead), a best-sellers table (reuse `TopCoursesTable`'s shape), category performance, coupon usage, refund rate, and — if Prompt 8 shipped — active-subscriber count/MRR tile.
- Acceptance: one page gives the admin a real picture of book sales using components already proven elsewhere in the dashboard, not new chart code.

### Prompt 13 — Offline reading (PWA) (depends on backend Prompt 13's cache headers)
- Add `vite-plugin-pwa` (new dependency) with a service-worker strategy that caches a purchased downloadable file, or a read-only book's pages as they're viewed, once the buyer taps a per-book "Save for offline" toggle in My Library — not automatic/blanket caching of everything, since storage and consent should be explicit.
- Acceptance: a previously-opened book remains readable in `BookReader.tsx` / downloadable from My Library without a network connection, which matters given the target audience's real-world connectivity.

## What makes this "better than Amazon" (reflected across the plan above, not a separate build step)
- No DRM lock-in on downloadable purchases — a plain, fully-owned file, not a proprietary reader-locked format.
- One flexible reading experience for read-only books instead of a separate app/device ecosystem.
- Local-currency-first pricing (GHS default) instead of foreign-currency-only listings.
- Admin can gift access (Prompt 10) or run a scoped coupon (Prompt 5) without a separate "free tier" system.
- Source flexibility Amazon doesn't give sellers at all: upload a file *or* just paste a Drive/Dropbox link.
- Offline reading (Prompt 13) designed in from the start for real-world connectivity, not an afterthought.
