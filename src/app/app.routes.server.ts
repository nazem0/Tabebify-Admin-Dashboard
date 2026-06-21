import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Auth pages are safe to server-render (no browser APIs, no auth required)
    path: 'auth/**',
    renderMode: RenderMode.Server,
  },
  {
    // Dashboard is authenticated and data-driven — render entirely on the client.
    // SSR cannot access localStorage (tokens) or make authenticated API calls.
    path: 'dashboard/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
