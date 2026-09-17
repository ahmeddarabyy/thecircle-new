# The Circle — iOS app preview

A design preview of what [circleworkspace.com](https://circleworkspace.com) would look like
rebuilt as a native iPhone app. It is a **prototype, not an app**: plain HTML, CSS and
JavaScript rendered inside an iPhone 15 Pro frame (393 × 852 pt), styled to match iOS
conventions — large titles, inset grouped lists, segmented controls, a tab bar and a
home indicator.

Nothing here is wired to the backend and nothing ships to users. It exists to answer
"what would this look like?" before anyone commits to building it.

## Viewing it

Open the files directly, or serve the repository root so the shared `assets/` resolve:

```bash
python3 -m http.server 8080
# http://localhost:8080/ios-app-preview/index.html    clickable prototype
# http://localhost:8080/ios-app-preview/gallery.html  every screen side by side
```

| File | Purpose |
| --- | --- |
| `index.html` | Clickable prototype — tab bar, booking flow, dark mode and Arabic toggles |
| `gallery.html` | All screens at once. `?screens=home,spaces` picks a subset, `&bare=1` drops the page chrome for screenshots |
| `screens.js` | Every screen's markup, shared by both pages |
| `app.js` | Prototype navigation for `index.html` |
| `app.css` | The iOS UI kit, using the brand palette from `../styles.css` |

## Where the content comes from

The preview deliberately uses real data rather than lorem ipsum, so the screens can be
judged as a product rather than as decoration:

| Shown in the app | Source in this repo |
| --- | --- |
| Meeting rooms EGP 250/hr, 1,000 / 5 hrs, 1,500 / 8 hrs | `book-a-space.html` → `const prices` |
| Day pass EGP 200, shift pass EGP 100 | `book-a-space.html` → `prices.shared` |
| Opening hours 9:00 AM – 11:00 PM | `book-a-space.html` → `OPEN_HOUR` / `CLOSE_HOUR` |
| Branch names and addresses | `backend/server.js` → `sendBookingConfirmation()` |
| The seven space types | `services.html` and the per-space pages |
| Confirmation screen wording and layout | the customer email in `backend/server.js` |
| Photography | `../assets/` |
| Arabic screen | the 47 RTL pages in `../ar/` |

Rates that the website does not publish (private offices, suites, dedicated desks,
back offices, virtual office) show "Request pricing" instead of an invented number.

## Screen map: website → app

| Website | App |
| --- | --- |
| `index.html` | Home tab — branch switcher, next booking, quick actions |
| `services.html` + the 7 space pages | Spaces tab and the space detail screen |
| `book-a-space.html` (5-step wizard) | Book tab, condensed to 4 steps |
| booking confirmation email | Confirmation screen + Apple Wallet pass |
| *(nothing today)* | Passes tab — upcoming bookings and QR check-in |
| `support-request.html`, `insights.html`, `locations.html`, `partner-with-us.html` | Rows under the Account tab |
| `ar/` | In-app language switch |

## What building it for real would involve

**The API is already most of the way there.** `POST /api/bookings`, `GET /api/availability`,
`POST /api/support` and `POST /api/partner` are plain JSON over HTTP and would back the
app unchanged.

**The gaps are customer accounts and everything downstream of them.** Today the only
identity in the system is the `admins` table; bookings are anonymous rows keyed by an
email address. The Passes tab, the membership card and push notifications all assume a
signed-in customer, so an app needs:

- a customers table plus sign-in (Sign in with Apple is effectively required by App Store
  review once any other social login exists);
- `GET /api/me/bookings` and a cancel/reschedule endpoint — neither exists;
- a check-in mechanism behind the QR code;
- APNs device tokens and a sender for booking reminders;
- payment, if bookings should stop being settled at reception. Anything sold for use
  inside the app can use a card processor rather than Apple's in-app purchase, since
  coworking is a physical service.

**On the client**, the realistic options are roughly:

- *SwiftUI* — best fit for the look above, and the only option where Wallet passes,
  widgets and App Clips (scan a code at reception, book a desk without installing) feel
  native. Costs a second codebase in a repo that is currently only HTML.
- *React Native / Expo* — one codebase for iOS and Android, good enough fidelity, and
  over-the-air updates. The team already works in JavaScript.
- *Capacitor wrapper around the existing site* — cheapest, but the result is the current
  responsive site in a shell. It gets push notifications and an icon on the home screen
  and little else, and thin wrappers are a common App Store rejection.

**Worth deciding first:** whether an app earns its place at all. For a two-branch
workspace, the recurring jobs are "book a room", "let me in", and "show my pass" — that
is the case for the app. Everything marketing-shaped (blog, SEO landing pages, gallery)
should stay on the web, which is why those pages appear in the preview as a handful of
rows under Account rather than as tabs.
