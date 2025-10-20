## Web App (Nuxt 3)

### Overview

- SSR-enabled Nuxt app.
- All client calls should go to `/api/*` which is proxied server-side to your backend.

### Configure API base URL

- Set environment variable before running:
  - `API_BASE_URL` (e.g. `http://localhost:1312/api`)
- Defined in `nuxt.config.ts` as `runtimeConfig.apiUrl`.

### Server proxy

- Catch-all proxy: `server/api/[...path].ts`
- It strips the `/api` prefix from the incoming path and forwards to `API_BASE_URL` while preserving the query string.
- Uses `proxyRequest` and `sendProxy` for correct streaming, cookies, and headers.

Example mapping with `API_BASE_URL=http://localhost:1312/api`:

- Frontend request: `/api/users?role=admin`
- Upstream forwarded to: `http://localhost:1312/api/users?role=admin`

### useApi composable

File: `app/composables/shared/useApi.ts`

```ts
export function useApi<T>(url: string | (() => string), options?: any) {
  const { data, pending, error, refresh, execute, status } = useFetch<T>(url, {
    ...options,
  });
  return { data, pending, error, refresh, execute, status };
}

export function useApiLazy<T>(url: string | (() => string), options?: any) {
  return useApi<T>(url, { ...options, immediate: false });
}
```

#### Usage examples

- GET:

```ts
const { data, pending, error } = useApi<any>(() => "/api/users");
```

- GET with query:

```ts
const role = "admin";
const { data } = useApi<any>(
  () => `/api/users?role=${encodeURIComponent(role)}`,
);
```

- Lazy GET (trigger on demand):

```ts
const { data, execute } = useApiLazy<any>(() => "/api/users");
await execute();
```

- POST JSON:

```ts
const { data, error } = useApi<any>("/api/auth/login", {
  method: "POST",
  body: { email, password },
  headers: { "content-type": "application/json" },
});
```

- With Bearer token:

```ts
const token = useCookie("token").value;
const { data } = useApi<any>("/api/profile", {
  headers: { Authorization: `Bearer ${token}` },
});
```

- File upload (FormData):

```ts
const fd = new FormData();
fd.append("file", file);
const { data } = useApi<any>("/api/upload", { method: "POST", body: fd });
```

### Run

```bash
pnpm dev -F @apps/web
```

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
