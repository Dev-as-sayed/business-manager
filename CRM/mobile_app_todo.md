# Mobile TODO: Expo + React Native + TypeScript + RTK Query

**Scope note:** the mobile app should not copy the whole desktop/web app. Build the roles that benefit from a phone: **China employee** (QC photos, warehouse scanning), **shipping agent** (status updates, documents), and **customer** (track orders, approve quotations, view QC photos). Keep heavy admin, finance, and investor screens on web/desktop for now.

**Status (2026-11-10):** Phases 0–8 are implemented and verified except the items below that require missing backend APIs or external build infrastructure. Deployment/release work (Phase 10) is intentionally skipped per request.

**Blocked on backend/domain/devices:** customer invoices and PDF download, warehouse receiving, resumable background uploads, universal links (no production domain), real-device testing, push delivery job, and release automation. **Not implemented:** dark mode and full E2E auth/QC flow coverage.

## Phase 0: Project setup

- [x] Create the app: `npx create-expo-app@latest` (TypeScript template, Expo Router), `strict: true`, path aliases (`@/app`, `@/features`, `@/shared`)
- [x] Install: `@reduxjs/toolkit`, `react-redux`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `async-mutex`, `expo-secure-store`, `expo-image`, `expo-image-picker`, `expo-camera`, `expo-document-picker`, `expo-notifications`, `expo-constants`, `@react-native-community/netinfo`
- [x] Styling: **NativeWind** (Tailwind for RN, same class names as the web app) or Tamagui; pick one and stay with it
- [x] Icons: `lucide-react-native`; toasts: `sonner-native` or `react-native-toast-message`
- [x] Lists: `@shopify/flash-list` for long lists (orders, inventory)
- [x] ESLint, Prettier, Jest + `@testing-library/react-native`, MSW for API mocks
- [x] Env via `app.config.ts` and `EXPO_PUBLIC_API_URL`, validated with Zod at startup (separate dev, staging, prod via EAS profiles)
- [x] Use a **development build** (`expo-dev-client`), not Expo Go, as soon as you need secure store, camera, or push
- [x] Set up EAS (`eas.json`) with `development`, `preview`, `production` profiles

## Phase 1: Folder structure

```
.
├── app/                         # Expo Router (file-based routes only)
│   ├── _layout.tsx              # root: providers, auth gate
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── forgot-password.tsx
│   ├── (app)/
│   │   ├── _layout.tsx          # protected shell (tabs/drawer by role)
│   │   ├── (tabs)/              # dashboard, tasks, notifications, profile
│   │   └── <module>/[id].tsx    # detail screens
│   ├── +not-found.tsx
│   └── forbidden.tsx
└── src/
    ├── api/
    │   ├── baseApi.ts           # createApi + baseQueryWithReauth
    │   └── types.ts             # ApiResponse<T>, ApiError, Meta
    ├── store/                   # store.ts, hooks.ts
    ├── features/
    │   └── <module>/
    │       ├── <module>.api.ts
    │       ├── <module>.types.ts
    │       ├── <module>.schema.ts
    │       └── components/
    ├── shared/
    │   ├── components/          # ListItem, StatusBadge, EmptyState, ErrorState, Screen
    │   ├── guards/              # Can, RoleGate
    │   ├── hooks/               # usePermission, useDebounce, useRefreshOnFocus
    │   ├── storage/             # secureStorage.ts
    │   └── utils/
    └── config/                  # env.ts, routes.config.ts (role → tabs)
```

**Rule:** `app/` files stay thin (just import a screen from `src/features`). Only `*.api.ts` files know URLs. Same layering as the web client, so logic and types can be shared later.

## Phase 2: RTK Query core (same as web, before any feature)

- [x] Reuse the same `ApiResponse<T>` and `ApiError` types as the web app (move to a shared `packages/shared-types` if you use the monorepo)
- [x] **`baseApi`** with `fetchBaseQuery({ baseUrl })` and `prepareHeaders` that attaches `Authorization: Bearer <accessToken>`
- [x] **`baseQueryWithReauth`**: on `401`, call `/auth/refresh` with the stored refresh token, save the new pair, retry once; on failure, clear storage and send the user to login
- [x] **Mutex** (`async-mutex`) so parallel 401s trigger a single refresh
- [x] `transformResponse` to unwrap `data` and keep `meta`; `transformErrorResponse` to normalize errors
- [x] Tag types and `injectEndpoints` per feature
- [x] Handle network failure explicitly: `FETCH_ERROR` becomes a friendly "no connection" state, not a crash
- [x] Global `403` (no permission) and `429` (slow down) handling
- [x] `refetchOnReconnect: true` and `refetchOnFocus` via `setupListeners` with NetInfo and AppState
- [x] Longer request timeout and retry for flaky mobile networks (and China-to-server latency)

## Phase 3: Auth and tokens (the big difference from web)

Decision: **cookies are not reliable in React Native, so use bearer tokens in `expo-secure-store`.**

- [x] **Server change required:** the login and refresh endpoints must support mobile clients, returning tokens in the response body when the request has `X-Client: mobile`, while web keeps httpOnly cookies. Add this before starting.
- [x] Store the **refresh token in SecureStore** (Keychain/Keystore). Keep the **access token in memory** (Redux or a module variable), never in AsyncStorage
- [x] Never store tokens in AsyncStorage, and never log them
- [x] `secureStorage.ts` wrapper: `getRefreshToken`, `setTokens`, `clear`
- [x] **Bootstrap on launch:** keep the splash screen visible (`expo-splash-screen`) → read refresh token → call `/auth/refresh` → call `/auth/me` → hide splash. This prevents a login flash
- [x] `authSlice`: `user`, `permissions`, `status` (`idle | loading | authenticated | unauthenticated`)
- [x] Rotating refresh tokens: save the new refresh token **before** retrying the original request, or a crash mid-rotation logs the user out
- [x] On logout: call the API, clear SecureStore, `api.util.resetApiState()`, unregister the push token, redirect
- [x] Optional: biometric unlock (`expo-local-authentication`) to open the app, not as a replacement for server auth
- [x] Screens: Login, Forgot password, Reset password, Change password

## Phase 4: Routing and route protection

- [x] Expo Router with route groups: `(auth)` for public, `(app)` for protected
- [x] **Auth gate in `app/_layout.tsx`**: while `status === 'loading'` show the splash; if unauthenticated, `<Redirect href="/login" />`; if authenticated and on an auth screen, redirect to the role's home
- [x] Use Expo Router's **`Stack.Protected`** guards (or redirects in layouts) so protected screens are never mounted for the wrong state
- [x] **`RoleGate`** per section layout: wrong role renders or redirects to `forbidden`
- [x] Role-based home: customer → orders, China employee → assignments/QC queue, shipping agent → shipments
- [x] Tabs built from `routes.config.ts` (`{ name, title, icon, roles?, permission? }`) filtered by permissions (one source of truth)
- [x] **Deep links** (`omnia://orders/123`) that survive login: store the intended URL, redirect after auth
- [x] `+not-found` and `forbidden` screens, plus an error boundary per route group

## Phase 5: Role-based access in the UI

- [x] `usePermission()` hook, `can(resource, action)`
- [x] **`<Can resource="quotations" action="approve">`** component to hide buttons, tabs, and actions
- [x] Tab bar and home screen differ per role, driven by the same permission data as the web app
- [x] **Reminder:** hiding UI is only UX. The server enforces everything, and every mutation must handle `403` gracefully
- [x] Hide cost, profit, and other sensitive fields based on what the API returns, not only on role
- [x] Re-fetch `/auth/me` on app foreground so a changed role or revoked access applies quickly

## Phase 6: Shared UI building blocks

- [x] `Screen` wrapper (safe area, keyboard avoiding, pull-to-refresh, loading/error/empty handling)
- [x] **Paginated list** component: FlashList + RTK Query infinite scroll (merge pages with `serializeQueryArgs`/`merge`/`forceRefetch`), pull-to-refresh, skeletons, empty state
- [x] `useRefreshOnFocus` to refetch when a screen regains focus
- [x] Search bar with debounce and filter bottom sheet (`@gorhom/bottom-sheet`)
- [x] Form field wrappers for react-hook-form + Zod, mapping server field errors onto fields
- [x] `StatusBadge` with the same status-to-color map as the web app
- [x] `ConfirmDialog` / action sheet, toast helper (success from API `message`, errors from the normalized error)
- [x] **`PhotoCapture` / `FileUploader`**: camera and gallery, multi-select, compression (`expo-image-manipulator`), upload progress, retry
- [x] **`BarcodeScanner`** (QR/barcode for packages and cartons via `expo-camera`)
- [x] `OfflineBanner` driven by NetInfo
- [x] Haptics and keyboard handling polish

## Phase 7: Feature modules (repeat the same pattern)

For each: `*.api.ts` → types → Zod schema → list screen → detail screen → create/edit form (only where mobile needs it).

**Customer**

- [x] `auth` and `profile`
- [x] `product-requests` (create with camera photos, share links)
- [x] `quotations` (view, approve/reject)
- [x] `orders` (progress timeline)
- [x] `quality-control` (photo gallery, QC approval)
- [x] `shipments` (tracking timeline)
- [ ] `invoices` (view, download PDF)

**China employee**

- [x] `assignments` (sourcing tasks)
- [ ] `warehouse-receiving` (scan, verify quantities)
- [x] `quality-control` (checklist, defects, photo upload, submit report)

**Shipping agent**

- [x] `shipments` (status updates, package details, document upload)
- [x] `customs` (status and expense entry)

**Common**

- [x] `notifications` (in-app list and unread badge)
- [x] `dashboard` (role-specific stat cards)

Per-module checklist:

- [x] Loading, empty, error, offline states for every query
- [x] `providesTags` and `invalidatesTags` on every endpoint
- [x] Optimistic updates only where safe (never for financial actions)
- [x] Actions wrapped in `<Can>`
- [x] Status timeline driven by the API's status history

## Phase 8: Mobile-specific features

- [x] **Push notifications:** `expo-notifications`, register the device token after login, send it to the server, remove it on logout. Server needs a `DeviceToken` table and a push job (Expo Push API or FCM/APNs)
- [x] Notification tap opens the right screen via deep link (new quotation, QC ready, shipment status)
- [x] **Upload queue:** QC photos are the main offline case. Persist pending uploads (file URI + metadata) locally, retry when online, and show status per photo
- [x] Offline-tolerant reads: persist selected RTK Query cache (`redux-persist` with MMKV) for recent orders, but **never queue financial or approval actions offline**
- [ ] Background-safe uploads for large files (chunking or resumable uploads if photos are big)
- [x] Permissions flow for camera, photos, and notifications, with a clear explanation screen and a "open settings" fallback
- [x] Biometric lock (optional), screen privacy on app switcher for sensitive screens
- [x] i18n (`i18next` + `expo-localization`): English, Chinese, Bengali; check font support and text expansion
- [ ] Deep-link and universal-link setup (`scheme`, associated domains/app links)

## Phase 9: Quality and polish

- [x] Global error boundary with a friendly fallback, Sentry (`sentry-expo`/`@sentry/react-native`) for crashes
- [x] Accessibility pass (labels, touch target size, dynamic text)
- [ ] Dark mode, tablet/small-screen checks, Android back button behavior
- [x] Performance: memoized list items, image caching, avoid large Redux payloads, Hermes enabled
- [ ] Tests: auth gate, `baseQueryWithReauth` (MSW), permission components, one full flow (e.g. QC photo submit)
- [ ] Test on **real devices** on slow networks, and from inside China if staff use it there (some Google/Expo services can be unreliable, so check push and update delivery)

## Phase 10: Build, release, and updates

- [x] App identity: name, bundle ID / package name, icon, adaptive icon, splash screen
- [ ] EAS Build for iOS and Android (`development`, `preview`, `production`)
- [ ] Internal distribution first (TestFlight, Android internal testing) for China employees and agents
- [ ] **EAS Update** (OTA) for JS-only fixes, with runtime version policy so updates match native builds
- [ ] Store listings, privacy policy, and data-safety forms (needed even for B2B apps)
- [ ] Force-update check: the API returns a minimum supported app version, and the app blocks old versions
- [ ] CI: lint → test → EAS build on tagged releases

## Suggested order

**Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → one simple module end to end → the rest.**

Build `login → bootstrap → protected home → orders list → order detail` first. When that works with SecureStore tokens, refresh rotation, and role-based tabs, add the camera and QC flow, which is the main reason this app exists. Push notifications and the offline upload queue come after the core flow is stable.
