# E2E tests

Playwright spec covering the M-Pesa mock checkout flow:

1. Provisions a confirmed test user via the Supabase service-role key.
2. Seeds the resulting session into `localStorage` so the app boots signed-in
   (skips the Google OAuth UI).
3. Adds a marketplace product to the cart.
4. Goes to `/checkout`, fills the M-Pesa phone, accepts terms, sends the STK,
   then clicks "I've paid — confirm".
5. Asserts the order row in `public.orders` flips to `status = 'paid'`.
6. Asserts the buyer sees the paid order on `/account/library`.

## One-time setup

```bash
bun run e2e:install   # downloads the chromium browser
```

## Required env vars

Export these before running (or put them in `.env.test` and `source` it):

| Var                        | What                                                    |
| -------------------------- | ------------------------------------------------------- |
| `E2E_BASE_URL`             | optional, defaults to `http://localhost:8080`           |
| `E2E_SUPABASE_URL`         | your project URL (`https://<ref>.supabase.co`)          |
| `E2E_SUPABASE_ANON_KEY`    | the publishable / anon key                              |
| `E2E_SUPABASE_SERVICE_KEY` | service-role key — used only to create + clean up the user |
| `E2E_TEST_EMAIL`           | e.g. `e2e+mpesa@example.com`                            |
| `E2E_TEST_PASSWORD`        | a long random string                                    |

The service-role key is sensitive — keep it out of git and only use it locally
or in a private CI environment.

## Run

```bash
bun run e2e          # headless
bun run e2e:ui       # interactive runner
```

Playwright auto-starts `bun run dev` on port 8080. To run against an already
running server (or a remote preview URL) set `E2E_NO_WEBSERVER=1` and
`E2E_BASE_URL=https://your-preview.example.com`.

## What it asserts

- An order row exists for the test user with `status = 'paid'`.
- `/account/library` shows the paid order to the signed-in buyer.

The download endpoint requires that an admin has uploaded `file_path` to the
`product-files` bucket for the seeded product. The test does not assume the
file exists — it only verifies the buyer reaches the library and sees a paid
order, which is the gate for the signed-URL endpoint to authorize the
download.
