import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Providers } from "./providers";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg?v=2",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <Meta />
        <Links />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="bg-[#121212] text-[#e3e2de] antialiased min-h-screen flex flex-col font-sans selection:bg-[#333333] selection:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "Terjadi kesalahan yang tidak terduga.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Halaman Tidak Ditemukan" : "Error";
    details =
      error.status === 404
        ? "Halaman yang Anda cari tidak dapat ditemukan."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#121212] text-[#e3e2de]">
      <div className="max-w-lg w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-red-400 mb-2">{message}</h1>
        <p className="text-neutral-300 text-sm mb-4">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto bg-[#141414] border border-[#262626] rounded text-xs font-mono text-neutral-400 mb-4">
            <code>{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white text-xs font-medium rounded transition"
        >
          Kembali ke Beranda
        </a>
      </div>
    </main>
  );
}
