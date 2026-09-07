import { Link, useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  ArrowLeft,
  BellRing,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  History,
  House,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Medal,
  Menu,
  MessageCircleHeart,
  Pencil,
  Sparkles,
  UserRound,
  X,
  Sun,
  Moon,
} from "lucide-react";

import {
  showConfirm,
  showSuccess,
} from "@/lib/sweetAlert";

import { useTheme } from "@/hooks/use-theme";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserDashboardLayoutProps = {
  children: ReactNode;
};

type LoggedInUser = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  profile_image?: string;
};

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Wellness Plan",
    path: "/wellness-plan",
    icon: BellRing,
  },
  {
    label: "Activities",
    path: "/activities",
    icon: Activity,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserRound,
  },
  {
    label: "Home",
    path: "/",
    icon: House,
  },
  {
    label: "Assessment",
    path: "/assessment",
    icon: Brain,
  },
  {
    label: "Assessment History",
    path: "/assessment-history",
    icon: History,
  },
  {
    label: "AI Companion",
    path: "/companion",
    icon: MessageCircleHeart,
  },
  {
    label: "Wellness Hub",
    path: "/hub",
    icon: LibraryBig,
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: Medal,
  },
  {
    label: "About",
    path: "/about",
    icon: CircleHelp,
  },
  {
    label: "Contact",
    path: "/contact",
    icon: Sparkles,
  },
];

function isNavigationItemActive(
  pathname: string,
  path: string
) {
  if (path === "/") {
    return pathname === "/";
  }

  return (
    pathname === path ||
    pathname.startsWith(`${path}/`)
  );
}

export function UserDashboardLayout({
  children,
}: UserDashboardLayoutProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [user, setUser] =
    useState<LoggedInUser | null>(null);

  const desktopNavRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser: LoggedInUser =
        JSON.parse(savedUser);

      if (parsedUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "User layout session error:",
        error
      );

      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, [pathname]);

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

  useEffect(() => {
    const activeLink =
      desktopNavRef.current?.querySelector(
        '[data-active="true"]'
      );

    activeLink?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  const scrollDesktopNav = (
    direction: "left" | "right"
  ) => {
    desktopNavRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Logout from MindBloom?",
      "Your saved wellness progress will remain secure.",
      "Yes, Logout",
      "Stay Logged In"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("user");

    await showSuccess(
      "Logged Out Successfully 🌸",
      "Your MindBloom session has ended safely."
    );

    window.location.href = "/login";
  };

  const profileImageUrl =
    user?.profile_image
      ? `http://localhost/api/${user.profile_image}`
      : "";

  const getPageTitle = () => {
    if (pathname === "/wellness-plan") {
      return "Today's Wellness Plan";
    }

    if (pathname === "/activities") {
      return "Wellness Activities";
    }

    if (pathname === "/profile") {
      return "My Profile";
    }

    if (pathname === "/assessment") {
      return "Wellness Assessment";
    }

    if (pathname === "/assessment-history") {
      return "Assessment History";
    }

    if (pathname === "/companion") {
      return "AI Companion";
    }

    if (
      pathname === "/hub" ||
      pathname.startsWith("/hub/")
    ) {
      return "Wellness Hub";
    }

    if (pathname === "/achievements") {
      return "Achievements";
    }

    if (pathname === "/about") {
      return "About MindBloom";
    }

    if (pathname === "/contact") {
      return "Contact MindBloom";
    }

    if (pathname === "/") {
      return "MindBloom Home";
    }

    return "My Dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f5f2ff] to-[#eaf9f4] dark:from-[#0f1629] dark:via-[#131a30] dark:to-[#0f1a24] theme-transition">
      {/* Top navigation */}
      <header className="sticky top-0 z-[100] border-b border-white/85 dark:border-white/8 bg-white/90 dark:bg-[#151c32]/90 shadow-[0_10px_35px_rgba(120,126,190,0.10)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] backdrop-blur-2xl theme-transition">
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ddd8f7] dark:border-white/10 bg-white/85 dark:bg-white/5 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ff] dark:hover:bg-white/10"
              aria-label="Open user menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {pathname !== "/dashboard" && (
              <Link
                to="/dashboard"
                className="hidden h-12 items-center justify-center gap-2 rounded-2xl border border-[#ddd8f7] dark:border-white/10 bg-white/85 dark:bg-white/5 px-4 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ff] dark:hover:bg-white/10 sm:flex"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9184dc] dark:text-[#a99df0]">
                MindBloom Member
              </p>

              <h1 className="truncate font-display text-xl font-bold text-[#25304a] dark:text-[#e8eaf5] sm:text-2xl">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Theme toggle + Top profile dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#ddd8f7] dark:border-white/10 bg-white/85 dark:bg-white/5 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ff] dark:hover:bg-white/10"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/90 dark:border-white/10 bg-white/88 dark:bg-white/5 px-3 py-2 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ddd8f7] hover:bg-white dark:hover:bg-white/10 hover:shadow-[0_14px_35px_rgba(120,126,190,0.13)] sm:px-4"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={
                      user?.fullname || "User"
                    }
                    className="h-11 w-11 shrink-0 rounded-full border-2 border-[#dcd6f5] object-cover shadow-soft"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] font-bold text-white shadow-soft">
                    {user?.fullname
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>
                )}

                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-48 truncate text-sm font-bold text-[#273149] dark:text-[#e8eaf5]">
                    {user?.fullname ||
                      "MindBloom User"}
                  </p>

                  <p className="max-w-48 truncate text-xs text-[#7b869a] dark:text-[#8892a8]">
                    {user?.email || ""}
                  </p>
                </div>

                <ChevronDown className="h-4 w-4 shrink-0 text-[#9184dc] transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="z-[200] w-64 rounded-[22px] border border-[#e0dcf5] dark:border-white/10 bg-white/96 dark:bg-[#1a2140]/96 p-2 shadow-[0_24px_65px_rgba(110,113,170,0.18)] backdrop-blur-xl"
            >
              <div className="rounded-2xl bg-gradient-to-r from-[#f1efff] via-[#edf7ff] to-[#edf9f5] dark:from-white/8 dark:via-white/5 dark:to-white/8 p-3">
                <p className="truncate text-sm font-bold text-[#273149] dark:text-[#e8eaf5]">
                  {user?.fullname ||
                    "MindBloom User"}
                </p>

                <p className="mt-1 truncate text-xs text-[#7b869a] dark:text-[#8892a8]">
                  {user?.email || ""}
                </p>
              </div>

              <DropdownMenuSeparator className="my-2 bg-[#ece9f7] dark:bg-white/10" />

              <DropdownMenuItem
                onSelect={() => {
                  window.location.href =
                    "/profile";
                }}
                className="cursor-pointer rounded-xl px-3 py-3 font-semibold text-[#59657b] dark:text-[#8892a8] focus:bg-[#f3f1ff] dark:focus:bg-white/10 focus:text-[#776bc8] dark:focus:text-[#a99df0]"
              >
                <Pencil className="mr-3 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
                className="cursor-pointer rounded-xl px-3 py-3 font-semibold text-[#b36f88] dark:text-[#d48aa5] focus:bg-[#fbf2f6] dark:focus:bg-white/10 focus:text-[#9f5d76] dark:focus:text-[#e8a0b8]"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        {/* Professional desktop navigation */}
        <div className="hidden border-t border-[#ece9f7]/90 dark:border-white/8 bg-gradient-to-r from-white/92 dark:from-[#151c32]/90 via-[#fbfaff]/95 dark:via-[#171e35]/90 to-white/92 dark:to-[#151c32]/90 px-4 py-3 lg:block sm:px-6 lg:px-8 theme-transition">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <button
              type="button"
              onClick={() =>
                scrollDesktopNav("left")
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ded9f4] dark:border-white/10 bg-white dark:bg-white/5 text-[#8376d4] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3f1ff] dark:hover:bg-white/10"
              aria-label="Show previous navigation links"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white dark:from-[#161d33] to-transparent" />

              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white dark:from-[#161d33] to-transparent" />

              <nav
                ref={desktopNavRef}
                className="flex items-center gap-2 overflow-x-auto px-3 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Dashboard navigation"
              >
                {navigationItems.map(
                  (navigationItem) => {
                    const Icon =
                      navigationItem.icon;

                    const isActive =
                      isNavigationItemActive(
                        pathname,
                        navigationItem.path
                      );

                    return (
                      <Link
                        key={`top-${navigationItem.path}`}
                        to={navigationItem.path}
                        data-active={
                          isActive
                            ? "true"
                            : "false"
                        }
                        className={`group inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "border-transparent bg-gradient-to-r from-[#9f93eb] via-[#85aceb] to-[#62bce0] text-white shadow-[0_10px_26px_rgba(132,145,205,0.24)]"
                            : "border-transparent bg-transparent text-[#647089] dark:text-[#8892a8] hover:border-[#e4e0f6] dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/5 hover:text-[#776bc8] dark:hover:text-[#a99df0] hover:shadow-soft"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                            isActive
                              ? "bg-white/18"
                              : "bg-[#f2efff] dark:bg-white/8 text-[#887bd7] dark:text-[#a99df0] group-hover:bg-[#ebe7ff] dark:group-hover:bg-white/12"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span>
                          {navigationItem.label}
                        </span>
                      </Link>
                    );
                  }
                )}
              </nav>
            </div>

            <button
              type="button"
              onClick={() =>
                scrollDesktopNav("right")
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ded9f4] dark:border-white/10 bg-white dark:bg-white/5 text-[#8376d4] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3f1ff] dark:hover:bg-white/10"
              aria-label="Show more navigation links"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
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
          className="fixed inset-0 z-[110] bg-[#273149]/30 backdrop-blur-sm"
        />
      )}

      {/* Hidden sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[120] w-[310px] max-w-[88vw] border-r border-white/85 dark:border-white/8 bg-white/96 dark:bg-[#131a2e]/98 shadow-[25px_0_70px_rgba(105,110,165,0.18)] backdrop-blur-2xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#ddd7fa]/45 dark:bg-[#3d2d7a]/20 blur-3xl" />

          <div className="pointer-events-none absolute -right-24 bottom-24 h-64 w-64 rounded-full bg-[#d3f3e7]/45 dark:bg-[#1a3d5c]/20 blur-3xl" />

          {/* Sidebar heading */}
          <div className="relative flex items-center justify-between border-b border-[#ebe8f7] dark:border-white/8 px-5 py-5">
            <Link
              to="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <p className="font-display text-2xl font-bold text-[#263049] dark:text-[#e8eaf5]">
                  MindBloom
                </p>

                <p className="text-xs font-medium text-[#8d80d7] dark:text-[#a99df0]">
                  Wellness Space
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f1ff] dark:bg-white/8 text-[#8b7fd8] dark:text-[#a99df0] transition hover:bg-[#ebe8ff] dark:hover:bg-white/12"
              aria-label="Close user menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User summary */}
          <div className="relative mx-4 mt-5 rounded-[26px] border border-white/90 dark:border-white/8 bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] dark:from-white/6 dark:via-white/4 dark:to-white/6 p-4 shadow-soft">
            <div className="flex items-center gap-3">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={
                    user?.fullname || "User"
                  }
                  className="h-14 w-14 shrink-0 rounded-2xl border-2 border-white dark:border-white/15 object-cover shadow-soft"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-xl font-bold text-white shadow-soft">
                  {user?.fullname
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-bold text-[#273149] dark:text-[#e8eaf5]">
                  {user?.fullname ||
                    "MindBloom User"}
                </p>

                <p className="truncate text-xs text-[#7b869a] dark:text-[#8892a8]">
                  {user?.email || ""}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d80d7] dark:text-[#a99df0]">
                  Logged-in Member
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {navigationItems.map(
              (navigationItem) => {
                const Icon =
                  navigationItem.icon;

                const isActive =
                  isNavigationItemActive(
                    pathname,
                    navigationItem.path
                  );

                return (
                  <Link
                    key={
                      navigationItem.path
                    }
                    to={
                      navigationItem.path
                    }
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white shadow-[0_14px_30px_rgba(132,145,205,0.22)]"
                        : "text-[#59657b] dark:text-[#8892a8] hover:translate-x-1 hover:bg-[#f3f1ff] dark:hover:bg-white/6 hover:text-[#776bc8] dark:hover:text-[#a99df0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {navigationItem.label}
                    </span>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isActive
                          ? "translate-x-0"
                          : "opacity-40 group-hover:translate-x-1 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              }
            )}
          </nav>

          {/* Logout */}
          <div className="relative border-t border-[#ebe8f7] dark:border-white/8 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#efdce5] dark:border-white/8 bg-[#fbf3f7] dark:bg-white/5 px-4 py-3.5 font-semibold text-[#ad6983] dark:text-[#d48aa5] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f8eaf1] dark:hover:bg-white/8"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-136px)]">
        {children}
      </main>
    </div>
  );
}