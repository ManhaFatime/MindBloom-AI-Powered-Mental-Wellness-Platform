import { Link } from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import {
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

import {
  showActivityLoginAlert,
  showConfirm,
  showSuccess,
} from "@/lib/sweetAlert";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/companion", label: "AI Companion" },
  { to: "/hub", label: "Wellness Hub" },
  { to: "/activities", label: "Activities" },
  { to: "/achievements", label: "Achievements" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

type UserType = {
  id: number;
  fullname: string;
  email: string;
  role?: "user" | "admin";
  profile_image?: string;
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] =
    useState<UserType | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return;
    }

    try {
      const parsedUser: UserType =
        JSON.parse(savedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Invalid saved user:",
        error
      );

      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : "/dashboard";

  /*
  |--------------------------------------------------------------------------
  | Protected Activities Link
  |--------------------------------------------------------------------------
  */

  const handleNavigationClick = async (
    event: MouseEvent<HTMLAnchorElement>,
    path: string,
    mobile = false
  ) => {
    if (mobile) {
      setOpen(false);
    }

    if (path !== "/activities") {
      return;
    }

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      return;
    }

    event.preventDefault();

    await showActivityLoginAlert();
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Logout from MindBloom?",
      "Your wellness progress will remain safely saved.",
      "Yes, Logout",
      "Stay Logged In"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    await showSuccess(
      "Logged Out Successfully 🌸"
    );

    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm theme-transition">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>

            <span className="font-display text-xl font-bold tracking-tight">
              Mind
              <span className="text-gradient">
                Bloom
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{
                  exact: link.to === "/",
                }}
                onClick={(event) =>
                  handleNavigationClick(
                    event,
                    link.to
                  )
                }
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                activeProps={{
                  className:
                    "text-foreground bg-accent/60",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-10 w-10"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <div className="hidden items-center gap-2 md:flex">
              {!user ? (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full px-5"
                    >
                      Login
                    </Button>
                  </Link>

                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="rounded-full bg-gradient-primary px-5 text-primary-foreground"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={dashboardPath}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />

                      {user.role === "admin"
                        ? "Admin Dashboard"
                        : "Dashboard"}
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>



            {/* Mobile menu button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() =>
                setOpen((current) => !current)
              }
              aria-label={
                open
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {open && (
          <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl lg:hidden theme-transition">
            <nav className="flex flex-col gap-2 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(event) =>
                    handleNavigationClick(
                      event,
                      link.to,
                      true
                    )
                  }
                  className="rounded-lg px-3 py-2 hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}

              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    <Button
                      className="mt-2 w-full"
                      variant="outline"
                    >
                      Login
                    </Button>
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    <Button className="mt-2 w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />

                      {user.role === "admin"
                        ? "Admin Dashboard"
                        : "Dashboard"}
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full"
                    variant="destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}