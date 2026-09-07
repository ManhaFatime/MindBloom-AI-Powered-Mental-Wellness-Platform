import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Heart,
  Lightbulb,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/activities")({
  head: () => ({
    meta: [
      {
        title: "Activities Management — MindBloom Admin",
      },
      {
        name: "description",
        content:
          "View and manage MindBloom wellness activity records.",
      },
    ],
  }),
  component: AdminActivitiesPage,
});

type ActivityType =
  | "daily_challenge"
  | "gratitude"
  | "mindfulness"
  | "positive_thought"
  | "reflection";

type ActivityRecord = {
  unique_id: string;
  record_id: number;
  user_id: number;
  activity_type: ActivityType;
  activity_title: string;
  primary_text: string;
  secondary_text: string;
  activity_date: string;
  created_at: string;
  user_name: string;
  user_email: string;
  profile_image: string;
};

const categories = [
  { value: "all", label: "All Activities" },
  { value: "daily_challenge", label: "Daily Challenges" },
  { value: "gratitude", label: "Gratitude Journals" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "positive_thought", label: "Positive Thoughts" },
  { value: "reflection", label: "Reflections" },
] as const;

function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [todayOnly, setTodayOnly] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTodayOnly(params.get("filter") === "today");
  }, []);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        await showError(
          "Login Required",
          "Please log in using your administrator account."
        );

        window.location.href = "/login";
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser.role !== "admin") {
          await showError(
            "Access Denied",
            "Only MindBloom administrators can view activity records."
          );

          window.location.href = "/dashboard";
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error("Admin session error:", error);

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
    if (checkingAccess) {
      return;
    }

    const loadActivities = async () => {
      try {
        const response = await fetch(
          "http://localhost/api/admin/get_activities.php"
        );

        const data = await response.json();

        if (data.success) {
          setActivities(data.activities || []);
        } else {
          await showError(
            "Unable to Load Activities",
            data.message || "Activity records could not be fetched."
          );
        }
      } catch (error) {
        console.error("Activities fetch error:", error);

        await showError(
          "Connection Error",
          "MindBloom could not load activity records. Please check Apache and MySQL."
        );
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [checkingAccess]);

  const filteredActivities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesCategory =
        category === "all" || activity.activity_type === category;

      const matchesSearch =
        keyword === "" ||
        activity.user_name.toLowerCase().includes(keyword) ||
        activity.user_email.toLowerCase().includes(keyword) ||
        activity.activity_title.toLowerCase().includes(keyword) ||
        activity.primary_text.toLowerCase().includes(keyword) ||
        activity.secondary_text.toLowerCase().includes(keyword);

      const activityDate = activity.created_at
        ? new Date(activity.created_at)
        : null;

      const today = new Date();

      const matchesToday =
        !todayOnly ||
        (activityDate !== null &&
          activityDate.getFullYear() === today.getFullYear() &&
          activityDate.getMonth() === today.getMonth() &&
          activityDate.getDate() === today.getDate());

      return matchesCategory && matchesSearch && matchesToday;
    });
  }, [activities, search, category, todayOnly]);

  const handleDeleteActivity = async (activity: ActivityRecord) => {
    const confirmed = await showConfirm(
      "Delete activity record?",
      `${activity.activity_title} by ${activity.user_name} will be permanently removed.`,
      "Yes, Delete",
      "Cancel"
    );

    if (!confirmed) {
      return;
    }

    const savedAdmin = localStorage.getItem("user");

    if (!savedAdmin) {
      await showError(
        "Session Error",
        "Administrator session was not found. Please log in again."
      );
      return;
    }

    try {
      const adminData = JSON.parse(savedAdmin);

      const response = await fetch(
        "http://localhost/api/admin/delete_activity.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            record_id: activity.record_id,
            activity_type: activity.activity_type,
            admin_email: adminData.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setActivities((currentActivities) =>
          currentActivities.filter(
            (item) => item.unique_id !== activity.unique_id
          )
        );

        await showSuccess(
          "Activity Deleted 🌸",
          data.message ||
            "The selected activity record was deleted successfully."
        );
      } else {
        await showError(
          "Delete Failed",
          data.message ||
            "The selected activity record could not be deleted."
        );
      }
    } catch (error) {
      console.error("Delete activity error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    }
  };

  const getActivityStyle = (type: ActivityType) => {
    switch (type) {
      case "daily_challenge":
        return {
          icon: CheckCircle2,
          gradient: "from-[#e6c58f] via-[#e7b89a] to-[#d9a7b7]",
          badge:
            "border-[#efd9b8] bg-[#fff7ea] text-[#a77a3f] dark:border-[#d7b46a]/20 dark:bg-[#d7b46a]/10 dark:text-[#e7c680]",
        };

      case "gratitude":
        return {
          icon: Heart,
          gradient: "from-[#e6b7cc] via-[#d6a9c3] to-[#b8ace9]",
          badge:
            "border-[#edd8e4] bg-[#fbf1f6] text-[#9b6a89] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/10 dark:text-[#e2a0b8]",
        };

      case "mindfulness":
        return {
          icon: Brain,
          gradient: "from-[#91d8c5] via-[#7fcdbf] to-[#78c7e5]",
          badge:
            "border-[#d6eee7] bg-[#edf9f5] text-[#4f9486] dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10 dark:text-[#8ed7c7]",
        };

      case "positive_thought":
        return {
          icon: Lightbulb,
          gradient: "from-[#efd89a] via-[#e8c88f] to-[#e4b19d]",
          badge:
            "border-[#f0e1bb] bg-[#fff9e9] text-[#a17c3d] dark:border-[#d9bd72]/20 dark:bg-[#d9bd72]/10 dark:text-[#e5cb83]",
        };

      default:
        return {
          icon: Sparkles,
          gradient: "from-[#a79cef] via-[#87adeb] to-[#66c1df]",
          badge:
            "border-[#ddd8f7] bg-[#f0edff] text-[#7569c9] dark:border-[#a99df0]/20 dark:bg-[#a99df0]/10 dark:text-[#b9b0f5]",
        };
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[30px] border border-[#dfe2ef] bg-white/92 px-10 py-12 text-center shadow-[0_22px_60px_rgba(120,126,190,0.13)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_60px_rgba(0,0,0,0.30)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

          <p className="mt-4 text-sm text-[#6f7a90] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-[#ddd7fa]/30 blur-3xl dark:bg-[#7669d5]/9" />

      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#caedf5]/35 blur-3xl dark:bg-[#568fb3]/7" />

      <div className="relative mx-auto max-w-7xl">
        {/* Hero */}
        <Card className="relative overflow-hidden rounded-[34px] border border-[#dce0ed] bg-white/90 shadow-[0_26px_75px_rgba(120,126,190,0.14)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#efedff]/95 via-[#ebf5ff]/90 to-[#eaf9f4]/90 dark:from-[#272f45] dark:via-[#242c42] dark:to-[#212c42]" />

          <div className="relative p-7 sm:p-9">
            <Link to="/admin">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-[#d9dcea] bg-white/90 text-[#59657b] shadow-soft hover:bg-white hover:text-[#776bc8] dark:border-white/10 dark:bg-white/6 dark:text-[#b0b8c9] dark:hover:bg-white/10 dark:hover:text-[#b7acf5]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dcddea] bg-white/80 px-4 py-2 text-sm font-semibold text-[#8174d2] dark:border-white/10 dark:bg-white/6 dark:text-[#b1a7f1]">
                  <Activity className="h-4 w-4" />
                  Wellness Activity Management
                </span>

                <h1 className="mt-5 font-display text-4xl font-extrabold text-[#25304a] sm:text-5xl dark:text-[#edf0fa]">
                  User{" "}
                  <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                    Activities
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-[#5f6c83] dark:text-[#939db3]">
                  Review daily challenges, gratitude journals, mindfulness
                  exercises, positive thoughts and wellness reflections.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#dce0eb] bg-white/82 px-6 py-4 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/88">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6f7a90] dark:text-[#939db3]">
                  Total Records
                </p>

                <p className="mt-1 font-display text-3xl font-extrabold text-[#8174d2] dark:text-[#b1a7f1]">
                  {loading ? "..." : activities.length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Search / Filter */}
        <Card className="relative z-20 mt-8 overflow-visible rounded-[28px] border border-[#dce0eb] bg-white/88 p-5 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8174d2] dark:text-[#a99df0]" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by user, email or activity content..."
                className="h-14 rounded-2xl border-[#d9ddeb] bg-white pl-14 text-[#273149] placeholder:text-[#9aa2b3] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
              />
            </div>

            <div
              ref={categoryDropdownRef}
              className="relative z-50"
            >
              <button
                type="button"
                onClick={() => setCategoryOpen((current) => !current)}
                className={`flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-5 text-left text-sm font-semibold text-[#4f5b73] shadow-inner outline-none transition-all duration-300 dark:bg-white/6 dark:text-[#d5daE6] ${
                  categoryOpen
                    ? "border-[#aaa0ea] ring-4 ring-[#ddd8f7]/70 dark:border-[#8f84da] dark:ring-[#8f84da]/15"
                    : "border-[#d9ddeb] hover:border-[#b9b0ec] hover:bg-white dark:border-white/10 dark:hover:border-white/15 dark:hover:bg-white/10"
                }`}
              >
                <span>
                  {categories.find((item) => item.value === category)?.label}
                </span>

                <ChevronDown
                  className={`h-5 w-5 text-[#9184dc] transition-transform duration-300 dark:text-[#a99df0] ${
                    categoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[999] overflow-hidden rounded-[22px] border border-[#dfe1ec] bg-white/98 p-2 shadow-[0_24px_65px_rgba(110,113,170,0.18)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#1a2140]/98 dark:shadow-[0_24px_65px_rgba(0,0,0,0.38)]">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#f0edff]/85 via-[#edf7ff]/80 to-[#eaf9f4]/75 dark:from-white/6 dark:via-white/4 dark:to-white/5" />

                  <div className="relative space-y-1">
                    {categories.map((item) => {
                      const selected = item.value === category;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setCategory(item.value);
                            setCategoryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                            selected
                              ? "bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] text-white shadow-[0_10px_28px_rgba(99,102,241,0.28)]"
                              : "text-[#65718a] hover:translate-x-1 hover:bg-white/80 hover:text-[#8174d2] dark:text-[#9fa8bd] dark:hover:bg-white/6 dark:hover:text-[#b6acf3]"
                          }`}
                        >
                          <span>{item.label}</span>

                          {selected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {todayOnly && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7eee6] bg-[#eaf9f5]/85 px-4 py-3 dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10">
              <p className="text-sm font-semibold text-[#4c9d8a] dark:text-[#8ed7c7]">
                Showing only today's activity records
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTodayOnly(false);
                  window.history.replaceState({}, "", "/admin/activities");
                }}
                className="rounded-xl border-[#d7eee6] bg-white text-[#4c9d8a] dark:border-white/10 dark:bg-white/6 dark:text-[#8ed7c7] dark:hover:bg-white/10"
              >
                Show All Activities
              </Button>
            </div>
          )}
        </Card>

        {loading ? (
          <Card className="mt-8 flex min-h-72 items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 shadow-[0_18px_48px_rgba(120,126,190,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

              <p className="mt-4 text-[#6f7a90] dark:text-[#939db3]">
                Loading activity records...
              </p>
            </div>
          </Card>
        ) : filteredActivities.length === 0 ? (
          <Card className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 px-6 text-center backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] shadow-soft">
              <Activity className="h-8 w-8 text-white" />
            </div>

            <h2 className="mt-5 font-display text-2xl font-bold text-[#25304a] dark:text-[#edf0fa]">
              No Activities Found
            </h2>

            <p className="mt-2 text-[#6f7a90] dark:text-[#939db3]">
              No activity record matches the selected filters.
            </p>
          </Card>
        ) : (
          <div className="relative z-0 mt-8 grid gap-6 xl:grid-cols-2">
            {filteredActivities.map((activity, index) => {
              const style = getActivityStyle(activity.activity_type);
              const Icon = style.icon;

              const profileImageUrl = activity.profile_image
                ? `http://localhost/api/${activity.profile_image}`
                : "";

              return (
                <Card
                  key={activity.unique_id}
                  className="group relative overflow-hidden rounded-[30px] border border-[#dfe2ec] bg-white/92 p-6 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#cbc7e7] hover:shadow-[0_24px_58px_rgba(120,126,190,0.14)] dark:border-white/8 dark:bg-[#252d43]/94 dark:shadow-[0_18px_48px_rgba(0,0,0,0.23)] dark:hover:border-white/12 dark:hover:bg-[#293249] dark:hover:shadow-[0_24px_58px_rgba(0,0,0,0.30)]"
                  style={{
                    animation: `adminActivityReveal 0.55s ease-out ${
                      index * 0.07
                    }s both`,
                  }}
                >
                  <div
                    className={`absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gradient-to-br ${style.gradient} opacity-10 blur-3xl transition-transform duration-700 group-hover:scale-150 dark:opacity-[0.07]`}
                  />

                  <div className="relative">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] bg-gradient-to-br ${style.gradient} text-white shadow-soft transition-transform duration-300 group-hover:scale-105`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style.badge}`}
                          >
                            {activity.activity_title}
                          </span>

                          <div className="mt-3 flex items-center gap-3">
                            {profileImageUrl ? (
                              <img
                                src={profileImageUrl}
                                alt={activity.user_name}
                                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-soft dark:border-white/15"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white">
                                <UserRound className="h-4 w-4" />
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-bold text-[#273149] dark:text-[#edf0fa]">
                                {activity.user_name}
                              </p>

                              <p className="text-xs text-[#6f7a90] dark:text-[#939db3]">
                                {activity.user_email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7a90] dark:text-[#939db3]">
                        <CalendarDays className="h-4 w-4 text-[#9184dc] dark:text-[#a99df0]" />

                        {activity.activity_date
                          ? new Date(activity.activity_date).toLocaleDateString()
                          : "Date unavailable"}
                      </div>
                    </div>

                    <div className="mt-6 rounded-[22px] border border-[#dfe1eb] bg-white/90 p-5 shadow-inner dark:border-white/8 dark:bg-white/5">
                      <p className="whitespace-pre-line text-sm leading-6 text-[#4f5b73] dark:text-[#c2c9d8]">
                        {activity.primary_text || "No details available."}
                      </p>
                    </div>

                    {activity.secondary_text && (
                      <div className="mt-4 rounded-[22px] border border-[#e2def5] bg-gradient-to-r from-[#f3f1ff]/90 via-[#edf7ff]/85 to-[#eaf9f4]/85 p-5 dark:border-white/8 dark:from-white/6 dark:via-white/4 dark:to-white/5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8174d2] dark:text-[#a99df0]">
                          Additional Response
                        </p>

                        <p className="whitespace-pre-line text-sm leading-6 text-[#5f6c83] dark:text-[#a7b0c2]">
                          {activity.secondary_text}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => handleDeleteActivity(activity)}
                        className="rounded-xl border-0 bg-gradient-to-r from-[#c989a1] to-[#b97891] px-5 text-white shadow-[0_10px_24px_rgba(185,120,145,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#bd7e97] hover:to-[#aa6d85] hover:shadow-[0_14px_32px_rgba(185,120,145,0.24)]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Record
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}