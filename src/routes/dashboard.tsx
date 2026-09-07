import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  Brain,
  Calendar,
  CheckCircle2,
  Clock3,
  Dumbbell,
  FileQuestion,
  Heart,
  History,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { showError, showSuccess } from "@/lib/sweetAlert";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "My Dashboard — MindBloom",
      },
      {
        name: "description",
        content:
          "View your mood records, wellness activities and recent progress.",
      },
    ],
  }),
  component: DashboardPage,
});

const API_URL =
  "http://localhost/api/user/dashboard.php";

const REMINDERS_API_URL =
  "http://localhost/api/user/get_my_reminders.php";

const COMPLETE_REMINDER_API_URL =
  "http://localhost/api/user/complete_reminder.php";

const ASSESSMENT_HISTORY_API_URL =
  "http://localhost/api/user/get_assessment_history.php";

type SavedUser = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  profile_image?: string;
};

type DashboardStats = {
  total_activities: number;
  daily_challenges: number;
  gratitude_entries: number;
  mindfulness_entries: number;
  mood_entries: number;
  positive_thoughts: number;
  reflection_entries: number;
};

type LatestMood = {
  mood: string;
  note: string;
  created_at: string;
};

type RecentActivity = {
  title: string;
  details: string;
  created_at: string;
};


type ReminderType =
  | "exercise"
  | "assessment"
  | "general";

type ReminderDateStatus =
  | "today"
  | "upcoming"
  | "overdue";

type UserReminder = {
  id: number;
  reminder_type: ReminderType;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string | null;
  status: "pending" | "completed";
  date_status: ReminderDateStatus;
  email_sent: number;
  created_at: string;
};

type RemindersResponse = {
  success: boolean;
  message?: string;
  today?: string;
  reminders?: UserReminder[];
};


type LatestAssessment = {
  id: number;
  user_id: number;
  category: string;
  category_name: string;
  score: number;
  wellness_level: string;
  level_key: string | null;
  ai_summary: string;
  recommendation_source:
    | "ai"
    | "fallback";
  created_at: string;
};

type AssessmentHistoryResponse = {
  success: boolean;
  message?: string;
  total?: number;
  latest_assessment?: LatestAssessment | null;
};

type DashboardResponse = {
  success: boolean;
  message?: string;

  user?: {
    id: number;
    fullname: string;
    email: string;
    profile_image?: string;
  };

  stats?: DashboardStats;
  latest_mood?: LatestMood | null;
  recent_activities?: RecentActivity[];
};

const emptyStats: DashboardStats = {
  total_activities: 0,
  daily_challenges: 0,
  gratitude_entries: 0,
  mindfulness_entries: 0,
  mood_entries: 0,
  positive_thoughts: 0,
  reflection_entries: 0,
};

function DashboardPage() {
  const [user, setUser] =
    useState<SavedUser | null>(null);

  const [stats, setStats] =
    useState<DashboardStats>(emptyStats);

  const [latestMood, setLatestMood] =
    useState<LatestMood | null>(null);

  const [recentActivities, setRecentActivities] =
    useState<RecentActivity[]>([]);

  const [reminders, setReminders] =
    useState<UserReminder[]>([]);

  const [
    latestAssessment,
    setLatestAssessment,
  ] = useState<LatestAssessment | null>(
    null
  );

  const [
    assessmentLoading,
    setAssessmentLoading,
  ] = useState(false);

  const [
    completingReminderId,
    setCompletingReminderId,
  ] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const currentMonth = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const profileImageUrl = user?.profile_image
    ? `http://localhost/api/${user.profile_image}`
    : "";


  const loadReminders = async (
    currentUser: SavedUser
  ) => {
    try {
      const response = await fetch(
        REMINDERS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            email: currentUser.email,
          }),
        }
      );

      const data: RemindersResponse =
        await response.json();

      if (!data.success) {
        await showError(
          "Reminder Error",
          data.message ||
            "Your reminders could not be loaded."
        );

        return;
      }

      setReminders(
        Array.isArray(data.reminders)
          ? data.reminders
          : []
      );
    } catch (error) {
      console.error(
        "Reminder loading error:",
        error
      );

      await showError(
        "Reminder Connection Error",
        "MindBloom could not load your reminders."
      );
    }
  };

  const loadAssessmentSummary = async (
    currentUser: SavedUser
  ) => {
    try {
      setAssessmentLoading(true);

      const response = await fetch(
        ASSESSMENT_HISTORY_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            limit: 1,
          }),
        }
      );

      const data: AssessmentHistoryResponse =
        await response.json();

      if (!response.ok || !data.success) {
        console.error(
          "Assessment summary error:",
          data.message
        );

        setLatestAssessment(null);
        return;
      }

      setLatestAssessment(
        data.latest_assessment ?? null
      );
    } catch (error) {
      console.error(
        "Assessment summary loading error:",
        error
      );

      setLatestAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const loadDashboard = async (
    currentUser: SavedUser,
    manualRefresh = false
  ) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
        }),
      });

      const data: DashboardResponse =
        await response.json();

      if (!data.success) {
        await showError(
          "Dashboard Error",
          data.message ||
            "Your dashboard information could not be loaded."
        );
        return;
      }

      const updatedUser: SavedUser = {
        ...currentUser,
        fullname:
          data.user?.fullname ||
          currentUser.fullname,
        email:
          data.user?.email ||
          currentUser.email,
        profile_image:
          data.user?.profile_image || "",
      };

      setUser(updatedUser);
      setStats(data.stats || emptyStats);
      setLatestMood(data.latest_mood || null);
      setRecentActivities(
        data.recent_activities || []
      );

      await Promise.all([
        loadReminders(updatedUser),
        loadAssessmentSummary(updatedUser),
      ]);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser: SavedUser =
        JSON.parse(savedUser);

      if (parsedUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setUser(parsedUser);
      loadDashboard(parsedUser);
    } catch (error) {
      console.error(
        "Dashboard session error:",
        error
      );

      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  const handleRefresh = () => {
    if (!user || refreshing) {
      return;
    }

    loadDashboard(user, true);
  };


  const handleCompleteReminder = async (
    reminderId: number
  ) => {
    if (!user || completingReminderId) {
      return;
    }

    try {
      setCompletingReminderId(reminderId);

      const response = await fetch(
        COMPLETE_REMINDER_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
            reminder_id: reminderId,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Complete Reminder",
          data.message ||
            "The reminder could not be completed."
        );

        return;
      }

      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                status: "completed",
              }
            : reminder
        )
      );

      await showSuccess(
        "Reminder Completed 🌸",
        data.message ||
          "Well done! Your reminder is now complete."
      );
    } catch (error) {
      console.error(
        "Complete reminder error:",
        error
      );

      await showError(
        "Connection Error",
        "MindBloom could not update the reminder."
      );
    } finally {
      setCompletingReminderId(null);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    const value = mood?.toLowerCase() || "";

    if (
      value.includes("very happy") ||
      value.includes("excellent")
    ) {
      return "😄";
    }

    if (
      value.includes("happy") ||
      value.includes("good")
    ) {
      return "😊";
    }

    if (
      value.includes("calm") ||
      value.includes("relaxed")
    ) {
      return "😌";
    }

    if (
      value.includes("sad") ||
      value.includes("low")
    ) {
      return "😔";
    }

    if (
      value.includes("angry") ||
      value.includes("stressed")
    ) {
      return "😣";
    }

    if (
      value.includes("anxious") ||
      value.includes("worried")
    ) {
      return "😟";
    }

    return "🌸";
  };

  const formatDate = (dateValue: string) => {
    if (!dateValue) {
      return "Recently";
    }

    const parsedDate = new Date(
      dateValue.replace(" ", "T")
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsedDate);
  };

  const getActivityIcon = (title: string) => {
    const value = title.toLowerCase();

    if (value.includes("gratitude")) {
      return Heart;
    }

    if (value.includes("mindfulness")) {
      return Brain;
    }

    if (value.includes("challenge")) {
      return Target;
    }

    if (value.includes("positive")) {
      return Sparkles;
    }

    return Activity;
  };

  const getAssessmentScoreStyle = (
    score: number
  ) => {
    if (score >= 80) {
      return {
        text: "text-[#4c9d8a]",
        background:
          "from-[#eaf9f5] to-[#edf9fb]",
        border: "border-[#d7eee6]",
      };
    }

    if (score >= 60) {
      return {
        text: "text-[#608aaa]",
        background:
          "from-[#edf5fc] to-[#eef8fd]",
        border: "border-[#d9e9f4]",
      };
    }

    if (score >= 40) {
      return {
        text: "text-[#9c7a3f]",
        background:
          "from-[#fff8e8] to-[#fff4ed]",
        border: "border-[#f1e3c5]",
      };
    }

    return {
      text: "text-[#a86e91]",
      background:
        "from-[#fbf0f6] to-[#fff2f5]",
      border: "border-[#efdce5]",
    };
  };

  const latestAssessmentScore =
    latestAssessment
      ? Math.round(
          Number(latestAssessment.score)
        )
      : 0;

  const assessmentScoreStyle =
    getAssessmentScoreStyle(
      latestAssessmentScore
    );

  const activityCounts = [
    {
      name: "Daily Challenges",
      value: stats.daily_challenges,
    },
    {
      name: "Gratitude Journals",
      value: stats.gratitude_entries,
    },
    {
      name: "Mindfulness",
      value: stats.mindfulness_entries,
    },
    {
      name: "Mood Logs",
      value: stats.mood_entries,
    },
    {
      name: "Positive Thoughts",
      value: stats.positive_thoughts,
    },
    {
      name: "Reflections",
      value: stats.reflection_entries,
    },
  ];

  const maximumActivityCount = Math.max(
    ...activityCounts.map(
      (item) => item.value
    ),
    1
  );

  const totalWellnessRecords =
    stats.total_activities +
    stats.mood_entries;

  const activeCategories =
    activityCounts.filter(
      (item) => item.value > 0
    ).length;

  const categoryProgress = Math.round(
    (activeCategories /
      activityCounts.length) *
      100
  );

  const hasDashboardRecords =
    totalWellnessRecords > 0;


  const pendingReminders = reminders.filter(
    (reminder) =>
      reminder.status === "pending"
  );

  const todayReminders =
    pendingReminders.filter(
      (reminder) =>
        reminder.date_status === "today"
    );

  const overdueReminders =
    pendingReminders.filter(
      (reminder) =>
        reminder.date_status === "overdue"
    );

  const upcomingReminders =
    pendingReminders.filter(
      (reminder) =>
        reminder.date_status === "upcoming"
    );

  const orderedReminders = [
    ...overdueReminders,
    ...todayReminders,
    ...upcomingReminders,
    ...reminders.filter(
      (reminder) =>
        reminder.status === "completed"
    ),
  ];

  const visibleReminders =
    orderedReminders.slice(0, 6);

  const getReminderPresentation = (
    reminder: UserReminder
  ) => {
    if (
      reminder.reminder_type ===
      "exercise"
    ) {
      return {
        label: "Exercise",
        icon: Dumbbell,
        iconClass:
          "from-[#91d8c5] to-[#79c7e5]",
        badgeClass:
          "border-[#d7eee6] bg-[#eaf9f5] text-[#4c9d8a]",
      };
    }

    if (
      reminder.reminder_type ===
      "assessment"
    ) {
      return {
        label: "Assessment",
        icon: FileQuestion,
        iconClass:
          "from-[#e8b8cf] to-[#b9acec]",
        badgeClass:
          "border-[#edd8e4] bg-[#fbf0f6] text-[#a86e91]",
      };
    }

    return {
      label: "General",
      icon: Sparkles,
      iconClass:
        "from-[#a79cef] to-[#84aceb]",
      badgeClass:
        "border-[#ddd8f7] bg-[#f0edff] text-[#7569c9]",
    };
  };

  const getReminderDateLabel = (
    reminder: UserReminder
  ) => {
    if (
      reminder.status === "completed"
    ) {
      return "Completed";
    }

    if (
      reminder.date_status === "today"
    ) {
      return "Due today";
    }

    if (
      reminder.date_status === "overdue"
    ) {
      return "Overdue";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        `${reminder.reminder_date}T00:00:00`
      )
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <Card className="rounded-[30px] border border-white/80 dark:border-white/8 bg-white/75 dark:bg-white/4 px-10 py-12 text-center shadow-card backdrop-blur-xl">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8fa] dark:border-white/10 border-t-[#978bea] dark:border-t-[#a99df0]" />

          <h2 className="mt-5 font-display text-2xl font-bold text-slate-800 dark:text-[#e8eaf5]">
            Loading your dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-[#8892a8]">
            Preparing your personal wellness
            information.
          </p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statsCards = [
    {
      label: "Total Activities",
      value: stats.total_activities,
      description: "Completed activities",
      icon: Activity,
      iconClass:
        "bg-gradient-to-br from-[#aaa0f2] to-[#75bce9]",
      badgeClass:
        "bg-[#f0edff] text-[#7569c9]",
    },
    {
      label: "Mood Records",
      value: stats.mood_entries,
      description: "Emotional check-ins",
      icon: Heart,
      iconClass:
        "bg-gradient-to-br from-[#e9b7ce] to-[#c2acec]",
      badgeClass:
        "bg-[#fbf0f6] text-[#a86e91]",
    },
    {
      label: "Gratitude Entries",
      value: stats.gratitude_entries,
      description: "Positive reflections",
      icon: Sparkles,
      iconClass:
        "bg-gradient-to-br from-[#91d8c5] to-[#79c7e5]",
      badgeClass:
        "bg-[#eaf9f5] text-[#4c9d8a]",
    },
    {
      label: "Category Progress",
      value: `${categoryProgress}%`,
      description: "Wellness categories used",
      icon: TrendingUp,
      iconClass:
        "bg-gradient-to-br from-[#83c4e7] to-[#aaa0ed]",
      badgeClass:
        "bg-[#edf5fc] text-[#608aaa]",
    },
  ];

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#dcd5fa]/25 dark:bg-[#3d2d7a]/15 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-80 h-96 w-96 rounded-full bg-[#c8edf5]/30 dark:bg-[#1a3d5c]/15 blur-3xl" />

      <div className="relative">
        {/* Welcome section */}
        <Card className="overflow-hidden rounded-[36px] border border-white/80 dark:border-white/8 bg-white/70 dark:bg-white/4 shadow-[0_25px_70px_rgba(120,126,190,0.13)] backdrop-blur-2xl">
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#efedff]/90 via-[#eaf5ff]/85 to-[#eaf9f4]/85 dark:from-white/6 dark:via-white/4 dark:to-white/6 p-7 sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/45 dark:bg-white/5 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/90 dark:border-white/10 bg-white/70 dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8174d2] dark:text-[#a99df0] shadow-soft">
                      <Sparkles className="h-4 w-4" />
                      Personal Wellness Space
                    </span>

                    <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight text-[#1f2943] dark:text-[#e8eaf5] sm:text-5xl lg:text-6xl">
                      Welcome back,{" "}
                      <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                        {user.fullname}
                      </span>
                    </h1>

                    <p className="mt-4 max-w-xl text-base leading-7 text-[#65718a] dark:text-[#8892a8]">
                      Take a small positive step
                      today and continue building
                      healthier habits for your
                      mind.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-2 rounded-full border border-white/90 dark:border-white/10 bg-white/75 dark:bg-white/8 px-4 py-2 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] shadow-soft">
                      <Calendar className="h-4 w-4" />
                      {currentMonth}
                    </span>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex items-center gap-2 rounded-full border border-white/90 dark:border-white/10 bg-white/75 dark:bg-white/8 px-4 py-2 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] shadow-soft transition hover:bg-white dark:hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          refreshing
                            ? "animate-spin"
                            : ""
                        }`}
                      />

                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/65 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                      Latest Mood
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#25304a] dark:text-[#e8eaf5]">
                      {latestMood
                        ? `${latestMood.mood} ${getMoodEmoji(
                            latestMood.mood
                          )}`
                        : "Not recorded 🌱"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/65 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                      Wellness Records
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#8c80dc] dark:text-[#a99df0]">
                      {totalWellnessRecords}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/65 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                      Active Categories
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#8c80dc] dark:text-[#a99df0]">
                      {activeCategories}
                      <span className="text-lg text-[#9aa3b5]">
                        /6
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact profile */}
            <div className="flex flex-col justify-center border-t border-white/80 dark:border-white/8 bg-white/72 dark:bg-white/4 p-7 text-center lg:border-l lg:border-t-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.fullname}
                  className="mx-auto h-28 w-28 rounded-[30px] border-4 border-white dark:border-white/15 object-cover shadow-[0_16px_40px_rgba(126,125,188,0.18)]"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[30px] border-4 border-white dark:border-white/15 bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-4xl font-bold text-white shadow-[0_16px_40px_rgba(126,125,188,0.18)]">
                  {user.fullname
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <h2 className="mt-5 truncate font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                {user.fullname}
              </h2>

              <p className="mt-1 break-all text-sm text-[#7c879c] dark:text-[#8892a8]">
                {user.email}
              </p>

              <span className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-4 py-2 text-xs font-semibold text-white shadow-soft">
                <Sparkles className="h-4 w-4" />
                MindBloom Member
              </span>

              <Link
                to="/profile"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ddd8f7] dark:border-white/10 bg-white/85 dark:bg-white/5 px-5 py-3 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ff] dark:hover:bg-white/10"
              >
                <UserRound className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </Card>


        {/* User reminders */}
        <Card className="mt-6 rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd8f7] dark:border-white/10 bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] dark:text-[#a99df0]">
                <BellRing className="h-4 w-4" />
                My Reminders
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                Today&apos;s Wellness Plan
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b869a] dark:text-[#8892a8]">
                Review your exercise and assessment reminders,
                then mark each one complete after finishing it.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-[#fff8e8] dark:bg-white/5 px-3 py-3 text-center">
                <p className="text-xl font-bold text-[#9c7a3f] dark:text-[#e6c87a]">
                  {todayReminders.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#a88a55] dark:text-[#c9a96e]">
                  Today
                </p>
              </div>

              <div className="rounded-2xl bg-[#fbf0f6] dark:bg-white/5 px-3 py-3 text-center">
                <p className="text-xl font-bold text-[#a86e91] dark:text-[#d48aa5]">
                  {overdueReminders.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#ad7a98] dark:text-[#c48ea8]">
                  Overdue
                </p>
              </div>

              <div className="rounded-2xl bg-[#eaf9f5] dark:bg-white/5 px-3 py-3 text-center">
                <p className="text-xl font-bold text-[#4c9d8a] dark:text-[#6fc5ad]">
                  {
                    reminders.filter(
                      (reminder) =>
                        reminder.status ===
                        "completed"
                    ).length
                  }
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5b9f90] dark:text-[#6fc5ad]">
                  Done
                </p>
              </div>
            </div>
          </div>

          {visibleReminders.length > 0 ? (
            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {visibleReminders.map(
                (reminder) => {
                  const presentation =
                    getReminderPresentation(
                      reminder
                    );

                  const ReminderIcon =
                    presentation.icon;

                  const isCompleting =
                    completingReminderId ===
                    reminder.id;

                  return (
                    <div
                      key={reminder.id}
                      className={`rounded-[26px] border p-5 transition-all duration-300 ${
                        reminder.status ===
                        "completed"
                          ? "border-[#d7eee6] dark:border-white/8 bg-[#f0faf7]/80 dark:bg-white/5 opacity-80"
                          : reminder.date_status ===
                              "overdue"
                            ? "border-[#efdce5] dark:border-white/8 bg-[#fff7fa]/85 dark:bg-white/5"
                            : "border-white/90 dark:border-white/8 bg-white/72 dark:bg-white/5 hover:-translate-y-0.5 hover:bg-white/90 dark:hover:bg-white/8 hover:shadow-soft"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${presentation.iconClass} text-white shadow-soft`}
                        >
                          <ReminderIcon className="h-6 w-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-bold ${presentation.badgeClass}`}
                            >
                              {presentation.label}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                                reminder.status ===
                                "completed"
                                  ? "bg-[#eaf9f5] text-[#4c9d8a]"
                                  : reminder.date_status ===
                                      "overdue"
                                    ? "bg-[#fbf0f6] text-[#a86e91]"
                                    : reminder.date_status ===
                                        "today"
                                      ? "bg-[#fff8e8] text-[#9c7a3f]"
                                      : "bg-[#edf5fc] text-[#608aaa]"
                              }`}
                            >
                              {reminder.status ===
                              "completed" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Clock3 className="h-3.5 w-3.5" />
                              )}

                              {getReminderDateLabel(
                                reminder
                              )}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                            {reminder.title}
                          </h3>

                          {reminder.description && (
                            <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                              {reminder.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#7b869a] dark:text-[#8892a8]">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f1ff] dark:bg-white/8 px-3 py-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#9184dc] dark:text-[#a99df0]" />
                                {new Intl.DateTimeFormat(
                                  "en-US",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                ).format(
                                  new Date(
                                    `${reminder.reminder_date}T00:00:00`
                                  )
                                )}
                              </span>

                              {reminder.reminder_time && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7ff] dark:bg-white/8 px-3 py-1.5">
                                  <Clock3 className="h-3.5 w-3.5 text-[#6c9fc4] dark:text-[#7ab3e0]" />
                                  {reminder.reminder_time
                                    .split(":")
                                    .slice(0, 2)
                                    .join(":")}
                                </span>
                              )}
                            </div>

                            {reminder.status ===
                            "pending" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCompleteReminder(
                                    reminder.id
                                  )
                                }
                                disabled={
                                  isCompleting ||
                                  completingReminderId !==
                                    null
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-4 py-2.5 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {isCompleting
                                  ? "Completing..."
                                  : "Mark as Completed"}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4c9d8a] dark:text-[#6fc5ad]">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-[28px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-gradient-to-br from-[#f5f3ff]/80 dark:from-white/5 to-[#eef7ff]/80 dark:to-white/3 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/90 dark:bg-white/8 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft">
                <BellRing className="h-8 w-8" />
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#29334a] dark:text-[#e8eaf5]">
                No reminders assigned
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                Your exercise and assessment reminders will
                appear here when they are assigned.
              </p>
            </div>
          )}
        </Card>


        {/* Assessment progress */}
        <Card className="mt-6 overflow-hidden rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#ddd7fb]/35 dark:bg-[#3d2d7a]/15 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-28 right-10 h-64 w-64 rounded-full bg-[#c9edf4]/35 dark:bg-[#1a3d5c]/15 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd8f7] dark:border-white/10 bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] dark:text-[#a99df0]">
                      <History className="h-4 w-4" />
                      Assessment Progress
                    </span>

                    <h2 className="mt-4 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                      Track your wellness growth
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b869a] dark:text-[#8892a8]">
                      Review your latest assessment result,
                      compare future scores and understand
                      how your wellness changes over time.
                    </p>
                  </div>

                  <Link
                    to="/assessment-history"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-[#ddd8f7] dark:border-white/10 bg-white/85 dark:bg-white/8 px-5 py-3 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ff] dark:hover:bg-white/12"
                  >
                    View Full History
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {assessmentLoading ? (
                  <div className="mt-7 flex min-h-40 items-center justify-center rounded-[28px] border border-white/90 dark:border-white/8 bg-white/60 dark:bg-white/5">
                    <RefreshCw className="h-7 w-7 animate-spin text-[#8b7fd8] dark:text-[#a99df0]" />

                    <span className="ml-3 text-sm font-semibold text-[#7b869a] dark:text-[#8892a8]">
                      Loading assessment result...
                    </span>
                  </div>
                ) : latestAssessment ? (
                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/70 dark:bg-white/5 p-5 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                        Latest Category
                      </p>

                      <p className="mt-2 text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                        {latestAssessment.category_name}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/70 dark:bg-white/5 p-5 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                        Wellness Level
                      </p>

                      <p className="mt-2 text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                        {latestAssessment.wellness_level}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/70 dark:bg-white/5 p-5 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                        Completed On
                      </p>

                      <p className="mt-2 text-lg font-bold text-[#273149] dark:text-[#e8eaf5]">
                        {formatDate(
                          latestAssessment.created_at
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-7 rounded-[28px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-gradient-to-br from-[#f5f3ff]/80 dark:from-white/5 to-[#eef7ff]/80 dark:to-white/3 p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-white/8 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft">
                          <Brain className="h-7 w-7" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                            No assessment result yet
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                            Complete your first assessment to
                            start tracking your progress.
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/assessment"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                      >
                        Take Assessment
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-white/85 dark:border-white/8 bg-gradient-to-br from-[#f3f1ff] dark:from-white/5 via-[#eef7ff] dark:via-white/3 to-[#eaf9f5] dark:to-white/5 p-7 text-center lg:border-l lg:border-t-0">
              {latestAssessment ? (
                <>
                  <div
                    className={`flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 bg-gradient-to-br ${assessmentScoreStyle.background} ${assessmentScoreStyle.border} shadow-soft`}
                  >
                    <span
                      className={`font-display text-4xl font-extrabold ${assessmentScoreStyle.text}`}
                    >
                      {latestAssessmentScore}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                      out of 100
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#a99df0]">
                    Latest Wellness Score
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#68758b] dark:text-[#8892a8]">
                    Higher scores represent stronger
                    wellness.
                  </p>

                  <Link
                    to="/assessment"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                  >
                    Take New Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-white/90 dark:bg-white/8 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft">
                    <Brain className="h-11 w-11" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#29334a] dark:text-[#e8eaf5]">
                    Discover your score
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                    Get personalized wellness guidance
                    based on your answers.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((statItem) => {
            const Icon = statItem.icon;

            return (
              <Card
                key={statItem.label}
                className="group overflow-hidden rounded-[28px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(120,126,190,0.14)]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${statItem.iconClass} text-white shadow-soft`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statItem.badgeClass}`}
                  >
                    Live
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#7e879a] dark:text-[#8892a8]">
                  {statItem.label}
                </p>

                <p className="mt-2 font-display text-4xl font-extrabold text-[#273149] dark:text-[#e8eaf5]">
                  {statItem.value}
                </p>

                <p className="mt-2 text-sm text-[#7b869b] dark:text-[#8892a8]">
                  {statItem.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Quick actions */}
        <Card className="mt-6 rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
                Quick Actions
              </p>

              <h2 className="mt-2 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                Choose a wellness activity
              </h2>

              <p className="mt-1 text-sm text-[#7b869a] dark:text-[#8892a8]">
                Start with a simple activity that
                matches how you feel today.
              </p>
            </div>

            <Link
              to="/activities"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(132,145,205,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
            >
              View All Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <a
              href="/activities?activity=mindful"
              className="group rounded-[26px] border border-[#ddd9f7] dark:border-white/8 bg-gradient-to-br from-[#f3f1ff] dark:from-white/5 to-[#edf7ff] dark:to-white/3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a69bee] to-[#79bce7] text-white shadow-soft">
                <Brain className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                Mindfulness
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                Relax your mind and focus on the
                present moment.
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#7a6dcc] dark:text-[#a99df0]">
                Begin activity
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
            </a>

            <a
              href="/activities?activity=gratitude"
              className="group rounded-[26px] border border-[#d7eee6] dark:border-white/8 bg-gradient-to-br from-[#effaf6] dark:from-white/5 to-[#edf8fd] dark:to-white/3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#91d8c5] to-[#78c7e5] text-white shadow-soft">
                <Heart className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                Gratitude Journal
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                Record positive moments and things
                you appreciate.
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#599b8b] dark:text-[#6fc5ad]">
                Write journal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
            </a>

            <a
              href="/activities?activity=mood"
              className="group rounded-[26px] border border-[#e8dfee] dark:border-white/8 bg-gradient-to-br from-[#faf3f8] dark:from-white/5 to-[#f2f0ff] dark:to-white/3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8b8cf] to-[#b9acec] text-white shadow-soft">
                <Activity className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                Mood Check
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                Record your current emotions and
                understand your mood.
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#a16e91] dark:text-[#d48aa5]">
                Record mood
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
            </a>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Latest mood */}
          <Card className="rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
                  Emotional Check-In
                </p>

                <h2 className="mt-2 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                  Latest Mood
                </h2>

                <p className="mt-1 text-sm text-[#7b869a] dark:text-[#8892a8]">
                  Your most recently recorded
                  emotional state.
                </p>
              </div>

              {latestMood && (
                <span className="rounded-full bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-semibold text-[#776bc8] dark:text-[#a99df0]">
                  {formatDate(
                    latestMood.created_at
                  )}
                </span>
              )}
            </div>

            {latestMood ? (
              <div className="mt-7 rounded-[28px] border border-white/85 dark:border-white/8 bg-gradient-to-br from-[#f0edff] dark:from-white/5 via-[#ebf5ff] dark:via-white/3 to-[#eaf8f3] dark:to-white/5 p-6 shadow-soft">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/90 dark:border-white/10 bg-white/85 dark:bg-white/8 text-5xl shadow-soft">
                    {getMoodEmoji(
                      latestMood.mood
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8174cf] dark:text-[#a99df0]">
                      You were feeling
                    </p>

                    <h3 className="mt-2 font-display text-4xl font-extrabold text-[#273149] dark:text-[#e8eaf5]">
                      {latestMood.mood}
                    </h3>

                    <p className="mt-3 leading-7 text-[#68748b] dark:text-[#8892a8]">
                      {latestMood.note ||
                        "No additional note was added with this mood."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-[28px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-gradient-to-br from-[#f5f3ff]/80 dark:from-white/5 to-[#eef7ff]/80 dark:to-white/3 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/90 dark:bg-white/8 text-3xl shadow-soft">
                  🌱
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#29334a] dark:text-[#e8eaf5]">
                  No mood recorded yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                  Complete a mood check to begin
                  tracking your emotional
                  wellbeing.
                </p>

                <a
                  href="/activities?activity=mood"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  Record My Mood
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </Card>

          {/* Category progress */}
          <Card className="rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
              Wellness Progress
            </p>

            <h2 className="mt-2 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
              Activity Categories
            </h2>

            <p className="mt-1 text-sm text-[#7b869a] dark:text-[#8892a8]">
              Number of records saved in each
              category.
            </p>

            <div className="mt-7 space-y-5">
              {activityCounts.map(
                (activityItem) => {
                  const percentage =
                    Math.round(
                      (activityItem.value /
                        maximumActivityCount) *
                        100
                    );

                  return (
                    <div
                      key={activityItem.name}
                    >
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-[#4f5b73] dark:text-[#c0c6d4]">
                          {activityItem.name}
                        </span>

                        <span className="rounded-full bg-[#f0edff] dark:bg-white/8 px-3 py-1 text-xs font-bold text-[#776bc8] dark:text-[#a99df0]">
                          {activityItem.value}
                        </span>
                      </div>

                      <Progress
                        value={percentage}
                        className="h-2.5"
                      />
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        </div>

        {/* Recent activities */}
        <Card className="mt-6 rounded-[32px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
                Recent Progress
              </p>

              <h2 className="mt-2 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                Your Wellness Journey
              </h2>

              <p className="mt-1 text-sm text-[#7b869a] dark:text-[#8892a8]">
                Your latest completed wellness
                activities.
              </p>
            </div>

            <Link
              to="/activities"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#776bc8] dark:text-[#a99df0] hover:underline"
            >
              View Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {recentActivities.map(
                (
                  activityItem,
                  index
                ) => {
                  const ActivityIcon =
                    getActivityIcon(
                      activityItem.title
                    );

                  return (
                    <div
                      key={`${activityItem.title}-${activityItem.created_at}-${index}`}
                      className="flex gap-4 rounded-[24px] border border-white/85 dark:border-white/8 bg-white/68 dark:bg-white/5 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 dark:hover:bg-white/8"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white shadow-soft">
                        <ActivityIcon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-[#29334a] dark:text-[#e8eaf5]">
                          {activityItem.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                          {activityItem.details ||
                            "Activity completed successfully."}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-[#7b6fca] dark:text-[#a99df0]">
                          {formatDate(
                            activityItem.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-[28px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-gradient-to-br from-white/75 dark:from-white/5 via-[#f5f3ff]/70 dark:via-white/3 to-[#eef7ff]/75 dark:to-white/5 p-9 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/90 dark:bg-white/8 text-[#8b7fd8] dark:text-[#a99df0] shadow-soft">
                <Activity className="h-8 w-8" />
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#29334a] dark:text-[#e8eaf5]">
                Start your wellness journey
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#788399] dark:text-[#8892a8]">
                Your completed activities will
                appear here. Start with a mood
                check, gratitude journal or
                mindfulness exercise.
              </p>

              <Link
                to="/activities"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 py-3 text-sm font-semibold text-white shadow-soft"
              >
                Start First Activity
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>

        {!hasDashboardRecords && (
          <div className="mt-6 rounded-[30px] border border-[#d7eee7] dark:border-white/8 bg-gradient-to-r from-[#eefaf6] dark:from-white/5 via-[#eef8fd] dark:via-white/3 to-[#f3f1ff] dark:to-white/5 p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 dark:bg-white/8 text-2xl shadow-soft">
                🌿
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#29334a] dark:text-[#e8eaf5]">
                  Your dashboard is ready
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#68758b] dark:text-[#8892a8]">
                  Complete wellness activities and
                  your mood, progress and recent
                  records will automatically appear
                  here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}