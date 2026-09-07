import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  Pencil,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type AdminUser = {
  id: number;
  fullname: string;
  email: string;
  role: "admin";
  profile_image?: string;
};

const adminNavigation = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Manage Users",
    to: "/admin/users",
    icon: Users,
    exact: false,
  },
  {
    label: "Activities",
    to: "/admin/activities",
    icon: Activity,
    exact: false,
  },
  {
    label: "Mood Records",
    to: "/admin/moods",
    icon: Heart,
    exact: false,
  },
  {
    label: "Reminders",
    to: "/admin/reminders",
    icon: BellRing,
    exact: false,
  },
  {
    label: "Contact Messages",
    to: "/admin/contact-messages",
    icon: Mail,
    exact: false,
  },
  {
    label: "Wellness Hub",
    to: "/admin/wellness-hub",
    icon: Newspaper,
    exact: false,
  },
] as const;

function AdminLayout() {
  const [admin, setAdmin] =
    useState<AdminUser | null>(null);

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        await showError(
          "Login Required",
          "Please login using your MindBloom administrator account."
        );

        window.location.href = "/login";
        return;
      }

      try {
        const parsedUser: AdminUser =
          JSON.parse(savedUser);

        if (parsedUser.role !== "admin") {
          await showError(
            "Access Denied",
            "This area is only available to MindBloom administrators."
          );

          window.location.href = "/dashboard";
          return;
        }

        setAdmin(parsedUser);
        setCheckingAccess(false);
      } catch (error) {
        console.error(
          "Admin session error:",
          error
        );

        localStorage.removeItem("user");

        await showError(
          "Session Error",
          "Your login session is invalid. Please login again."
        );

        window.location.href = "/login";
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Logout from Admin Panel?",
      "Your administrator session will be closed securely.",
      "Yes, Logout",
      "Stay Logged In"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("user");

    await showSuccess(
      "Logged Out Successfully 🌸",
      "Your administrator session has ended."
    );

    window.location.href = "/login";
  };

  const isLinkActive = (
    path: string,
    exact: boolean
  ) => {
    if (exact) {
      return (
        pathname === path ||
        pathname === `${path}/`
      );
    }

    return pathname.startsWith(path);
  };

  const pageTitle =
    pathname.startsWith("/admin/users")
      ? "Manage Users"
      : pathname.startsWith("/admin/activities")
        ? "Manage Activities"
        : pathname.startsWith("/admin/moods")
          ? "Mood Records"
          : pathname.startsWith("/admin/reminders")
            ? "Manage Reminders"
            : pathname.startsWith("/admin/contact-messages")
              ? "Contact Messages"
              : pathname.startsWith("/admin/wellness-hub")
                ? "Manage Wellness Hub"
                : pathname.startsWith("/admin/profile")
                  ? "Admin Profile"
                  : "Dashboard Overview";

  if (checkingAccess) {
    return (
      <div
        className="
          flex min-h-screen items-center justify-center
          bg-gradient-to-br
          from-[#eef4ff] via-[#f5f2ff] to-[#eaf9f4]
          px-4
          transition-colors duration-300
          dark:from-[#0f1629]
          dark:via-[#131a30]
          dark:to-[#0f1a24]
        "
      >
        <div
          className="
            rounded-[30px]
            border border-[#dddff0]
            bg-white/90
            px-10 py-12
            text-center
            shadow-[0_22px_60px_rgba(120,126,190,0.14)]
            backdrop-blur-xl
            transition-colors duration-300
            dark:border-white/8
            dark:bg-[#151c32]/90
            dark:shadow-[0_22px_60px_rgba(0,0,0,0.30)]
          "
        >
          <div
            className="
              mx-auto h-14 w-14 animate-spin rounded-full
              border-4 border-[#ddd8f7]
              border-t-[#9589df]
              dark:border-white/10
              dark:border-t-[#a99df0]
            "
          />

          <h2
            className="
              mt-5 font-display text-2xl font-bold
              text-[#273149]
              dark:text-[#e8eaf5]
            "
          >
            Checking access
          </h2>

          <p
            className="
              mt-2 text-sm
              text-[#6f7a90]
              dark:text-[#8892a8]
            "
          >
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const profileImageUrl =
    admin.profile_image &&
    admin.profile_image !== ""
      ? `http://localhost/api/${admin.profile_image}`
      : "";

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#eef4ff] via-[#f5f2ff] to-[#eaf9f4]
        transition-colors duration-300
        dark:from-[#0f1629]
        dark:via-[#131a30]
        dark:to-[#0f1a24]
      "
    >
      {/* Admin top header */}
      <header
        className="
          sticky top-0 z-[100]
          border-b border-[#dde1ef]
          bg-white/92
          shadow-[0_10px_35px_rgba(120,126,190,0.11)]
          backdrop-blur-2xl
          transition-colors duration-300
          dark:border-white/8
          dark:bg-[#151c32]/90
          dark:shadow-[0_10px_35px_rgba(0,0,0,0.24)]
        "
      >
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-2xl
                border border-[#d7d9ed]
                bg-white
                text-[#8579d4]
                shadow-soft
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#f4f1ff]
                dark:border-white/10
                dark:bg-white/5
                dark:text-[#a99df0]
                dark:hover:bg-white/10
              "
              aria-label="Open admin menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="min-w-0">
              <p
                className="
                  hidden text-xs font-semibold uppercase
                  tracking-[0.2em]
                  text-[#8174d2]
                  sm:block
                  dark:text-[#a99df0]
                "
              >
                MindBloom Administration
              </p>

              <h2
                className="
                  truncate font-display
                  text-xl font-bold
                  text-[#25304a]
                  sm:mt-1 sm:text-2xl
                  dark:text-[#e8eaf5]
                "
              >
                {pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-2xl
                border border-[#d7d9ed]
                bg-white
                text-[#8579d4]
                shadow-soft
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#f4f1ff]
                dark:border-white/10
                dark:bg-white/5
                dark:text-[#a99df0]
                dark:hover:bg-white/10
              "
              aria-label={
                isDark
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                isDark
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="
                    group flex min-w-0 items-center gap-3
                    rounded-2xl
                    border border-[#dfe2ef]
                    bg-white/95
                    px-3 py-2
                    shadow-soft
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-[#d4d0ec]
                    hover:bg-white
                    hover:shadow-[0_14px_35px_rgba(120,126,190,0.13)]
                    sm:px-4
                    dark:border-white/10
                    dark:bg-white/5
                    dark:hover:border-white/15
                    dark:hover:bg-white/8
                    dark:hover:shadow-[0_14px_35px_rgba(0,0,0,0.24)]
                  "
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={admin.fullname}
                      className="
                        h-11 w-11 shrink-0 rounded-full
                        border-2 border-[#d8d3f1]
                        object-cover shadow-soft
                        dark:border-white/15
                      "
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}

                  <div className="hidden min-w-0 text-left sm:block">
                    <p
                      className="
                        max-w-56 truncate text-sm font-bold
                        text-[#273149]
                        dark:text-[#e8eaf5]
                      "
                    >
                      {admin.fullname}
                    </p>

                    <p
                      className="
                        text-xs
                        text-[#6f7a90]
                        dark:text-[#8892a8]
                      "
                    >
                      Primary Administrator
                    </p>
                  </div>

                  <ChevronDown
                    className="
                      h-4 w-4 shrink-0
                      text-[#8579d4]
                      transition-transform duration-300
                      group-data-[state=open]:rotate-180
                      dark:text-[#a99df0]
                    "
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="
                  z-[200] w-64
                  rounded-[22px]
                  border border-[#dedcef]
                  bg-white/98
                  p-2
                  shadow-[0_24px_65px_rgba(110,113,170,0.18)]
                  backdrop-blur-xl
                  dark:border-white/8
                  dark:bg-[#1a2140]/96
                  dark:shadow-[0_24px_65px_rgba(0,0,0,0.35)]
                "
              >
                <div
                  className="
                    rounded-2xl
                    bg-gradient-to-r
                    from-[#efecff]
                    via-[#eaf5ff]
                    to-[#e8f8f2]
                    p-3
                    dark:from-white/8
                    dark:via-white/5
                    dark:to-white/8
                  "
                >
                  <p
                    className="
                      truncate text-sm font-bold
                      text-[#273149]
                      dark:text-[#e8eaf5]
                    "
                  >
                    {admin.fullname}
                  </p>

                  <p
                    className="
                      mt-1 truncate text-xs
                      text-[#6f7a90]
                      dark:text-[#8892a8]
                    "
                  >
                    {admin.email}
                  </p>
                </div>

                <DropdownMenuSeparator
                  className="
                    my-2 bg-[#e8e6f2]
                    dark:bg-white/8
                  "
                />

                <DropdownMenuItem
                  onSelect={() => {
                    window.location.href =
                      "/admin/profile";
                  }}
                  className="
                    cursor-pointer rounded-xl
                    px-3 py-3
                    font-semibold
                    text-[#59657b]
                    focus:bg-[#f1efff]
                    focus:text-[#776bc8]
                    dark:text-[#aab2c5]
                    dark:focus:bg-white/6
                    dark:focus:text-[#b4a9f4]
                  "
                >
                  <Pencil className="mr-3 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handleLogout();
                  }}
                  className="
                    cursor-pointer rounded-xl
                    px-3 py-3
                    font-semibold
                    text-[#a95f7a]
                    focus:bg-[#fbf0f5]
                    focus:text-[#96516c]
                    dark:text-[#d48aa5]
                    dark:focus:bg-[#d48aa5]/10
                    dark:focus:text-[#e59bb6]
                  "
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="
            fixed inset-0 z-[110]
            bg-[#273149]/30
            backdrop-blur-sm
            dark:bg-black/55
          "
        />
      )}

      {/* Drawer sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[120]
          w-[310px] max-w-[88vw]
          border-r border-[#e0e2ef]
          bg-white/98
          shadow-[25px_0_70px_rgba(105,110,165,0.18)]
          backdrop-blur-2xl
          transition-transform duration-300 ease-out
          dark:border-white/8
          dark:bg-[#131a2e]/98
          dark:shadow-[25px_0_70px_rgba(0,0,0,0.38)]
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div
            className="
              pointer-events-none absolute
              -left-24 top-10
              h-64 w-64 rounded-full
              bg-[#ddd7fa]/45 blur-3xl
              dark:bg-[#7669d5]/12
            "
          />

          <div
            className="
              pointer-events-none absolute
              -right-24 bottom-24
              h-64 w-64 rounded-full
              bg-[#d3f3e7]/45 blur-3xl
              dark:bg-[#4cae9d]/8
            "
          />

          {/* Sidebar brand */}
          <div
            className="
              relative flex items-center justify-between
              border-b border-[#e5e4f0]
              px-5 py-5
              dark:border-white/8
            "
          >
            <Link
              to="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <p
                  className="
                    font-display text-2xl font-bold
                    text-[#263049]
                    dark:text-[#e8eaf5]
                  "
                >
                  MindBloom
                </p>

                <p
                  className="
                    text-xs font-medium
                    text-[#8174d2]
                    dark:text-[#a99df0]
                  "
                >
                  Administration Panel
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                border border-transparent
                bg-[#efedff]
                text-[#8579d4]
                transition
                hover:bg-[#e8e4ff]
                dark:border-white/8
                dark:bg-white/5
                dark:text-[#a99df0]
                dark:hover:bg-white/10
              "
              aria-label="Close admin menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin summary */}
          <div
            className="
              relative mx-4 mt-5
              rounded-[26px]
              border border-[#dedfeb]
              bg-gradient-to-br
              from-[#efecff]
              via-[#eaf5ff]
              to-[#e7f7f1]
              p-4
              shadow-soft
              dark:border-white/8
              dark:from-white/6
              dark:via-white/4
              dark:to-white/6
            "
          >
            <div className="flex items-center gap-3">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={admin.fullname}
                  className="
                    h-14 w-14 shrink-0 rounded-2xl
                    border-2 border-white
                    object-cover shadow-soft
                    dark:border-white/15
                  "
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0">
                <p
                  className="
                    truncate font-bold
                    text-[#273149]
                    dark:text-[#e8eaf5]
                  "
                >
                  {admin.fullname}
                </p>

                <p
                  className="
                    truncate text-xs
                    text-[#6f7a90]
                    dark:text-[#8892a8]
                  "
                >
                  {admin.email}
                </p>

                <p
                  className="
                    mt-1 text-[10px] font-semibold uppercase
                    tracking-[0.14em]
                    text-[#8174d2]
                    dark:text-[#a99df0]
                  "
                >
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {adminNavigation.map((item) => {
              const active = isLinkActive(
                item.to,
                item.exact
              );

              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={`
                    group flex items-center justify-between
                    rounded-2xl
                    px-4 py-3.5
                    text-sm font-semibold
                    transition-all duration-300
                    ${
                      active
                        ? `
                          bg-gradient-to-r
                          from-[#a397ed]
                          via-[#84aaeb]
                          to-[#62bbe0]
                          text-white
                          shadow-[0_14px_30px_rgba(132,145,205,0.22)]
                        `
                        : `
                          text-[#536078]
                          hover:translate-x-1
                          hover:bg-[#efedff]
                          hover:text-[#7064c5]
                          dark:text-[#8892a8]
                          dark:hover:bg-white/6
                          dark:hover:text-[#b0a5f2]
                        `
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </span>

                  <ChevronRight
                    className={`
                      h-4 w-4 transition-all
                      ${
                        active
                          ? "opacity-100"
                          : "opacity-40 group-hover:translate-x-1 group-hover:opacity-100"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div
            className="
              relative
              border-t border-[#e5e4f0]
              p-4
              dark:border-white/8
            "
          >
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center gap-3
                rounded-2xl
                border border-[#eccfdc]
                bg-[#fcf0f5]
                px-4 py-3.5
                font-semibold
                text-[#a75f79]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#f8e5ee]
                dark:border-white/8
                dark:bg-white/5
                dark:text-[#d48aa5]
                dark:hover:bg-[#d48aa5]/10
              "
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Page content */}
      <main className="min-h-[calc(100vh-80px)] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}