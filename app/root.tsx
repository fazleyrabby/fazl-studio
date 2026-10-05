import { useEffect } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import geistMonoLatin from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import { Cursor } from "~/components/Cursor";
import { Footer } from "~/components/Contact";
import { Nav } from "~/components/Nav";
import { TransitionProvider } from "~/components/Transition";
import { startSmoothScroll } from "~/lib/scroll";
import { NotFound } from "~/routes/not-found";

export const links: Route.LinksFunction = () => [
  // the two faces used above the fold, so type does not swap in late
  { rel: "preload", href: geistLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: geistMonoLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0b" />
        <meta name="format-detection" content="telephone=no" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => startSmoothScroll(), []);

  return (
    <TransitionProvider>
      <Nav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <Cursor />
    </TransitionProvider>
  );
}

export function HydrateFallback() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  const detail = import.meta.env.DEV && error instanceof Error ? error.message : "Something broke on this page.";
  return (
    <main className="gutter flex min-h-[100dvh] flex-col justify-end gap-6 pb-16">
      <h1 className="type-display text-(length:--text-title)">Error</h1>
      <p className="max-w-[50ch] text-muted">{detail}</p>
      <a href="/" className="btn self-start">
        Back to home
      </a>
    </main>
  );
}
