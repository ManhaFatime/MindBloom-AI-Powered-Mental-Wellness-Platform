import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  BellRing,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { showError } from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      {
        title: "Admin Dashboard — MindBloom",
      },
      {
        name: "description",
        content:
          "Manage MindBloom users, activities and wellness data.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminUser = {
  id: number;
  fullname: string;
  email: string;
  role: "admin";
  profile_image?: string;
};

type DashboardStats = {
  total_users: number;
  total_activities: number;
  total_mood_records: number;
  today_activities: number;
};

function AdminDashboardPage() {
  const [admin, setAdmin] =
    useState<AdminUser | null>(null);

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>({
      total_users: 0,
      total_activities: 0,
      total_mood_records: 0,
      today_activities: 0,
    });

  const [reminderStats, setReminderStats] =
    useState({
      total_reminders: 0,
      pending_reminders: 0,
    });

  const [loadingStats, setLoadingStats] =
    useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        await showError(
          "Login Required",
          "Please log in with your administrator account."
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
            "This page is only available to MindBloom administrators."
          );

          window.location.href = "/dashboard";
          return;
        }

        setAdmin(parsedUser);
        setCheckingAccess(false);
      } catch (error) {
        console.error(
          "Invalid stored user:",
          error
        );

        localStorage.removeItem("user");

        await showError(
          "Session Error",
          "Your login session is invalid. Please log in again."
        );

        window.location.href = "/login";
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const [
          dashboardResponse,
          remindersResponse,
        ] = await Promise.all([
          fetch(
            "http://localhost/api/admin/dashboard.php"
          ),
          fetch(
            "http://localhost/api/admin/get_reminders.php"
          ),
        ]);

        const dashboardData =
          await dashboardResponse.json();

        const remindersData =
          await remindersResponse.json();

        if (dashboardData.success) {
          setStats({
            total_users: Number(
              dashboardData.stats?.total_users ??
                0
            ),
            total_activities: Number(
              dashboardData.stats
                ?.total_activities ?? 0
            ),
            total_mood_records: Number(
              dashboardData.stats
                ?.total_mood_records ?? 0
            ),
            today_activities: Number(
              dashboardData.stats
                ?.today_activities ?? 0
            ),
          });
        } else {
          await showError(
            "Unable to Load Dashboard",
            dashboardData.message ||
              "Dashboard data could not be fetched."
          );
        }

        if (remindersData.success) {
          const reminders = Array.isArray(
            remindersData.reminders
          )
            ? remindersData.reminders
            : [];

          const pendingReminders =
            reminders.filter(
              (reminder: {
                status: string;
              }) =>
                reminder.status === "pending"
            ).length;

          setReminderStats({
            total_reminders:
              reminders.length,
            pending_reminders:
              pendingReminders,
          });
        } else {
          await showError(
            "Unable to Load Reminders",
            remindersData.message ||
              "Reminder statistics could not be loaded."
          );
        }
      } catch (error) {
        console.error(
          "Dashboard stats error:",
          error
        );

        await showError(
          "Connection Error",
          "MindBloom could not load the admin dashboard data. Please make sure Apache and MySQL are running."
        );
      } finally {
        setLoadingStats(false);
      }
    };

    if (admin) {
      loadDashboardStats();
    }
  }, [admin]);

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div
          className="
            rounded-[30px]
            border border-[#dfe2ef]
            bg-white/90
            px-10 py-12
            text-center
            shadow-[0_22px_60px_rgba(120,126,190,0.13)]
            backdrop-blur-xl

            dark:border-white/8
            dark:bg-[#1d253b]/92
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

              dark:text-[#edf0fa]
            "
          >
            Checking access
          </h2>

          <p
            className="
              mt-2 text-sm
              text-[#6f7a90]

              dark:text-[#939db3]
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

  const dashboardCards = [
    {
      label: "Total Users",
      value: loadingStats
        ? "..."
        : String(stats.total_users),
      icon: Users,
      subtitle: "Registered members",
      iconClass:
        "bg-gradient-to-br from-[#a79cef] to-[#84aceb]",
      glowClass:
        "bg-[#ddd7fa] dark:bg-[#8f83e7]",
      badgeClass:
        "bg-[#f0edff] text-[#7569c9] dark:bg-[#a99df0]/12 dark:text-[#b9b0f5] dark:border dark:border-[#a99df0]/15",
      lineClass:
        "bg-gradient-to-r from-[#a79cef] to-[#84aceb]",
      to: "/admin/users",
      linkText: "Open user management",
      todayOnly: false,
    },
    {
      label: "Activity Entries",
      value: loadingStats
        ? "..."
        : String(stats.total_activities),
      icon: Activity,
      subtitle: "Saved wellness activities",
      iconClass:
        "bg-gradient-to-br from-[#86bde7] to-[#6ec5d9]",
      glowClass:
        "bg-[#ccebf7] dark:bg-[#6ca6cf]",
      badgeClass:
        "bg-[#edf7fd] text-[#5c8daa] dark:bg-[#79b6dc]/12 dark:text-[#93c7e7] dark:border dark:border-[#79b6dc]/15",
      lineClass:
        "bg-gradient-to-r from-[#86bde7] to-[#6ec5d9]",
      to: "/admin/activities",
      linkText: "Open activity records",
      todayOnly: false,
    },
    {
      label: "Mood Records",
      value: loadingStats
        ? "..."
        : String(stats.total_mood_records),
      icon: Heart,
      subtitle: "User mood check-ins",
      iconClass:
        "bg-gradient-to-br from-[#e8b8cf] to-[#b9acec]",
      glowClass:
        "bg-[#f1dbe6] dark:bg-[#c77c9c]",
      badgeClass:
        "bg-[#fbf0f6] text-[#a86e91] dark:bg-[#d48aa5]/12 dark:text-[#e2a0b8] dark:border dark:border-[#d48aa5]/15",
      lineClass:
        "bg-gradient-to-r from-[#e8b8cf] to-[#b9acec]",
      to: "/admin/moods",
      linkText: "Open mood records",
      todayOnly: false,
    },
    {
      label: "Today's Activities",
      value: loadingStats
        ? "..."
        : String(stats.today_activities),
      icon: CalendarDays,
      subtitle:
        "Completed wellness tasks today",
      iconClass:
        "bg-gradient-to-br from-[#91d8c5] to-[#79c7e5]",
      glowClass:
        "bg-[#d5f2e9] dark:bg-[#63b6a4]",
      badgeClass:
        "bg-[#eaf9f5] text-[#4c9d8a] dark:bg-[#79c7b5]/12 dark:text-[#8ed7c7] dark:border dark:border-[#79c7b5]/15",
      lineClass:
        "bg-gradient-to-r from-[#91d8c5] to-[#79c7e5]",
      to: "/admin/activities",
      linkText:
        "View today's activity records",
      todayOnly: true,
    },
    {
      label: "User Reminders",
      value: loadingStats
        ? "..."
        : String(
            reminderStats.total_reminders
          ),
      icon: BellRing,
      subtitle: `${reminderStats.pending_reminders} pending reminders`,
      iconClass:
        "bg-gradient-to-br from-[#d4a8e8] to-[#8caee9]",
      glowClass:
        "bg-[#eadcf6] dark:bg-[#9c7fc5]",
      badgeClass:
        "bg-[#f5effc] text-[#896bb7] dark:bg-[#a99df0]/12 dark:text-[#b9b0f5] dark:border dark:border-[#a99df0]/15",
      lineClass:
        "bg-gradient-to-r from-[#d4a8e8] to-[#8caee9]",
      to: "/admin/reminders",
      linkText:
        "Open reminder management",
      todayOnly: false,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="
          pointer-events-none absolute
          -left-32 top-16
          h-80 w-80 rounded-full
          bg-[#ddd7fa]/30 blur-3xl

          dark:bg-[#7669d5]/10
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-32 top-72
          h-96 w-96 rounded-full
          bg-[#caedf5]/35 blur-3xl

          dark:bg-[#548baa]/8
        "
      />

      <div
        className="
          pointer-events-none absolute
          bottom-0 left-1/3
          h-72 w-72 rounded-full
          bg-[#d6f2e8]/30 blur-3xl

          dark:bg-[#5ea894]/7
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Welcome section */}
        <Card
          className="
            relative overflow-hidden
            rounded-[36px]
            border border-[#dde1ef]
            bg-white/88
            shadow-[0_26px_75px_rgba(120,126,190,0.14)]
            backdrop-blur-2xl

            dark:border-white/8
            dark:bg-[#20283d]/94
            dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]
          "
        >
          <div
            className="
              absolute inset-0
              bg-gradient-to-br
              from-[#efedff]/95
              via-[#ebf5ff]/90
              to-[#eaf9f4]/90

              dark:from-[#272f45]
              dark:via-[#242c42]
              dark:to-[#212c42]
            "
          />

          <div
            className="
              pointer-events-none absolute
              -right-20 -top-20
              h-64 w-64 rounded-full
              bg-white/45 blur-3xl

              dark:bg-[#8790b0]/7
            "
          />

          <div
            className="
              pointer-events-none absolute
              -bottom-24 left-1/3
              h-60 w-60 rounded-full
              bg-[#ddd7fa]/25 blur-3xl

              dark:bg-[#8e82e6]/8
            "
          />

          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <span
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-white/90
                    bg-white/80
                    px-4 py-2
                    text-sm font-semibold
                    text-[#8174d2]
                    shadow-soft
                    backdrop-blur-xl

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b1a7f1]
                  "
                >
                  <Sparkles className="h-4 w-4" />
                  MindBloom Administration
                </span>

                <h1
                  className="
                    mt-6 font-display
                    text-4xl font-extrabold
                    leading-tight
                    text-[#25304a]
                    sm:text-5xl
                    lg:text-6xl

                    dark:text-[#edf0fa]
                  "
                >
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                    {admin.fullname}
                  </span>
                </h1>

                <p
                  className="
                    mt-5 max-w-2xl
                    text-base leading-7
                    text-[#5f6c83]
                    sm:text-lg

                    dark:text-[#939db3]
                  "
                >
                  Manage users, wellness
                  activities and mental-health
                  insights from one secure and
                  organized control center.
                </p>
              </div>

              {/* Admin summary */}
              <div
                className="
                  relative min-w-[270px]
                  overflow-hidden
                  rounded-[28px]
                  border border-[#dde1ed]
                  bg-white/82
                  p-6
                  shadow-[0_18px_45px_rgba(120,126,190,0.12)]
                  backdrop-blur-xl

                  dark:border-white/8
                  dark:bg-[#2a334a]/88
                  dark:shadow-[0_18px_45px_rgba(0,0,0,0.25)]
                "
              >
                <div
                  className="
                    pointer-events-none absolute
                    -right-8 -top-8
                    h-28 w-28 rounded-full
                    bg-[#ddd7fa]/45 blur-2xl

                    dark:bg-[#9d91eb]/9
                  "
                />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs font-semibold uppercase
                          tracking-[0.18em]
                          text-[#717c91]

                          dark:text-[#939db3]
                        "
                      >
                        Signed in as
                      </p>

                      <p
                        className="
                          mt-1 font-semibold
                          text-[#273149]

                          dark:text-[#edf0fa]
                        "
                      >
                        Primary Administrator
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      mt-5 break-all
                      text-sm font-medium
                      text-[#5f6c83]

                      dark:text-[#939db3]
                    "
                  >
                    {admin.email}
                  </p>

                  <div
                    className="
                      mt-5 flex items-center gap-2
                      text-sm font-semibold
                      text-[#4d927f]

                      dark:text-[#80cdbb]
                    "
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7fc8b6]" />
                    Secure session active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {dashboardCards.map(
            (stat, index) => {
              const Icon = stat.icon;

              const cardContent = (
                <Card
                  className={`group relative h-full overflow-hidden rounded-[30px] border border-[#dde1ed] bg-white/88 p-7 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(120,126,190,0.15)] dark:border-white/8 dark:bg-[#252d43]/94 dark:shadow-[0_18px_48px_rgba(0,0,0,0.24)] dark:hover:border-white/12 dark:hover:bg-[#293249] dark:hover:shadow-[0_24px_58px_rgba(0,0,0,0.30)] ${
                    stat.to
                      ? "cursor-pointer"
                      : ""
                  }`}
                  style={{
                    animation: `adminCardReveal 0.65s ease-out ${
                      index * 0.1
                    }s both`,
                  }}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full ${stat.glowClass} opacity-45 blur-3xl transition-transform duration-500 group-hover:scale-125 dark:opacity-10`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${stat.iconClass} text-white shadow-soft`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      {stat.to && (
                        <div
                          className="
                            flex h-10 w-10 items-center justify-center
                            rounded-full
                            bg-[#f2efff]
                            text-[#8174d2]
                            transition-all duration-300
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                            group-hover:bg-[#ebe7ff]

                            dark:border
                            dark:border-white/8
                            dark:bg-white/6
                            dark:text-[#b1a7f1]
                            dark:group-hover:bg-white/10
                          "
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="mt-7">
                      <p
                        className="
                          text-sm font-semibold
                          text-[#6f7a90]

                          dark:text-[#939db3]
                        "
                      >
                        {stat.label}
                      </p>

                      <h2
                        className="
                          mt-2 font-display
                          text-4xl font-extrabold
                          text-[#273149]

                          dark:text-[#edf0fa]
                        "
                      >
                        {stat.value}
                      </h2>

                      <p
                        className="
                          mt-3 text-sm leading-6
                          text-[#748096]

                          dark:text-[#939db3]
                        "
                      >
                        {stat.subtitle}
                      </p>

                      <div
                        className={`mt-6 h-1.5 w-16 rounded-full ${stat.lineClass} transition-all duration-500 group-hover:w-28`}
                      />

                      {stat.to && (
                        <p
                          className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${stat.badgeClass}`}
                        >
                          {stat.linkText}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );

              if (stat.to) {
                return (
                  <Link
                    key={stat.label}
                    to={stat.to}
                    onClick={(event) => {
                      if (stat.todayOnly) {
                        event.preventDefault();

                        window.location.href =
                          "/admin/activities?filter=today";
                      }
                    }}
                    className="block h-full"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={stat.label}
                  className="h-full"
                >
                  {cardContent}
                </div>
              );
            }
          )}
        </div>
      </div>
    </main>
  );
}