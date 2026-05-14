/**
 * `/app` is redirected to `/app/overview` in middleware so we never call
 * `redirect()` from a page under the client `AppShell` layout (Next.js 15
 * can surface NEXT_REDIRECT as a 500 in that pattern).
 */
export default function AppIndexPage() {
  return null;
}
