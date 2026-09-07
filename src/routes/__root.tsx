import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import {
  useEffect,
  type ReactNode,
} from "react";

import { ThemeProvider } from "@/hooks/use-theme";
import { UserDashboardLayout } from "@/components/UserDashboardLayout";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AICompanion } from "@/components/AICompanion";

import appCss from "../styles.css?url";

import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center shadow-glass">
        <h1 className="text-gradient text-7xl font-bold">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Let&apos;s get you back to a calm space.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="bg-gradient-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary:
        "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          This page didn&apos;t load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or
          head back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1",
        },
        {
          title:
            "MindBloom — Your Personal Mental Wellness Companion",
        },
        {
          name: "description",
          content:
            "Reduce anxiety, manage stress, build healthy habits, and track your wellness journey with MindBloom — your AI-powered mental wellness companion.",
        },
        {
          name: "author",
          content: "MindBloom",
        },
        {
          property: "og:title",
          content:
            "MindBloom — Your Personal Mental Wellness Companion",
        },
        {
          property: "og:description",
          content:
            "Reduce anxiety, manage stress, build healthy habits, and track your wellness journey with MindBloom — your AI-powered mental wellness companion.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "MindBloom",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content:
            "MindBloom — Your Personal Mental Wellness Companion",
        },
        {
          name: "twitter:description",
          content:
            "Reduce anxiety, manage stress, build healthy habits, and track your wellness journey with MindBloom — your AI-powered mental wellness companion.",
        },
        {
          property: "og:image",
          content:
            "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/61b8742e-1794-483d-8680-f82923798422",
        },
        {
          name: "twitter:image",
          content:
            "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/61b8742e-1794-483d-8680-f82923798422",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent:
      NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mindbloom-theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>

      <body className="theme-transition">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  const pathname = useRouterState({
    select: (state) =>
      state.location.pathname,
  });

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isLoggedInUser = (() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return false;
      }

      const parsedUser =
        JSON.parse(savedUser);

      return parsedUser.role !== "admin";
    } catch {
      return false;
    }
  })();

  const userAccessibleRoutes = [
  "/",
  "/dashboard",
  "/wellness-plan",
  "/activities",
  "/profile",
  "/assessment",
  "/assessment-history",
  "/companion",
  "/chat-history",
  "/hub",
  "/achievements",
  "/about",
  "/contact",
];

  const isUserDashboardRoute =
    isLoggedInUser &&
    userAccessibleRoutes.some(
      (routePath) => {
        if (routePath === "/") {
          return pathname === "/";
        }

        return (
          pathname === routePath ||
          pathname.startsWith(
            `${routePath}/`
          )
        );
      }
    );

  return (
    <ThemeProvider>
    <QueryClientProvider
      client={queryClient}
    >
      {isAdminRoute ? (
        <div className="min-h-screen">
          <Outlet />
        </div>
      ) : isUserDashboardRoute ? (
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">
            <UserDashboardLayout>
              <Outlet />
            </UserDashboardLayout>
          </div>

          <Footer />

          <AICompanion />
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">
            <Outlet />
          </main>

          <Footer />

          <AICompanion />
        </div>
      )}
    </QueryClientProvider>
    </ThemeProvider>
  );
}