import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Target,
  WandSparkles,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { showError, showSuccess } from "@/lib/sweetAlert";

export const Route = createFileRoute("/wellness-plan")({
  head: () => ({
    meta: [
      { title: "Today's Wellness Plan — MindBloom" },
      {
        name: "description",
        content: "View your personalized seven-day wellness plan and reminders.",
      },
    ],
  }),
  component: WellnessPlanPage,
});

const GET_REMINDERS_API = "http://localhost/api/user/get_my_reminders.php";
const COMPLETE_REMINDER_API = "http://localhost/api/user/complete_reminder.php";
const GET_ACTIVE_PLAN_API = "http://localhost/api/user/get_active_wellness_plan.php";
const COMPLETE_PLAN_TASK_API = "http://localhost/api/user/complete_wellness_plan_task.php";
const GENERATE_PLAN_API = "http://localhost/api/user/generate_wellness_plan.php";
const ASSESSMENT_HISTORY_API = "http://localhost/api/user/get_assessment_history.php";

type SavedUser = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  profile_image?: string;
};

type Reminder = {
  id: number;
  reminder_type: "exercise" | "assessment" | "general";
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string | null;
  status: "pending" | "completed";
  date_status: "today" | "upcoming" | "overdue";
};

type TaskAvailability =
  | "available_today"
  | "locked"
  | "missed"
  | "completed";

type PlanTask = {
  id: number;
  plan_id: number;
  user_id: number;
  day_number: number;
  task_date: string;
  task_title: string;
  task_description: string;
  activity_type: string;
  duration_minutes: number | null;
  status: "pending" | "completed" | "skipped";
  availability_status: TaskAvailability;
  completed_at: string | null;
};

type WellnessPlan = {
  id: number;
  assessment_id: number | null;
  plan_title: string;
  category_name: string;
  assessment_score: number;
  wellness_level: string;
  summary: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled";
  progress_percentage: number;
  recommendation_source: "ai" | "fallback";
  total_tasks: number;
  completed_tasks: number;
  tasks: PlanTask[];
};

type LatestAssessment = {
  id: number;
  category_name: string;
  score: number;
};

function WellnessPlanPage() {
  const [user, setUser] = useState<SavedUser | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activePlan, setActivePlan] = useState<WellnessPlan | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<LatestAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [completingPlanTaskId, setCompletingPlanTaskId] = useState<number | null>(null);
  const [completingReminderId, setCompletingReminderId] = useState<number | null>(null);
  const [selectedPlanTask, setSelectedPlanTask] = useState<PlanTask | null>(null);
  const [taskReflection, setTaskReflection] = useState("");
  const [taskConfirmed, setTaskConfirmed] = useState(false);

  const loadReminders = async (currentUser: SavedUser) => {
    const response = await fetch(GET_REMINDERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id, email: currentUser.email }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Reminders could not be loaded.");
    setReminders(Array.isArray(data.reminders) ? data.reminders : []);
  };

  const loadActivePlan = async (currentUser: SavedUser) => {
    const response = await fetch(GET_ACTIVE_PLAN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Wellness plan could not be loaded.");
    }
    setActivePlan(data.has_plan ? data.plan : null);
  };

  const loadLatestAssessment = async (currentUser: SavedUser) => {
    const response = await fetch(ASSESSMENT_HISTORY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id, limit: 1 }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Latest assessment could not be loaded.");
    }
    setLatestAssessment(data.latest_assessment ?? null);
  };

  const loadPageData = async (currentUser: SavedUser, manual = false) => {
    try {
      manual ? setRefreshing(true) : setLoading(true);
      await Promise.all([
        loadReminders(currentUser),
        loadActivePlan(currentUser),
        loadLatestAssessment(currentUser),
      ]);
    } catch (error) {
      console.error(error);
      await showError(
        "Unable to Load Wellness Plan",
        error instanceof Error ? error.message : "MindBloom could not connect to the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      window.location.href = "/login";
      return;
    }
    try {
      const parsedUser: SavedUser = JSON.parse(savedUser);
      if (parsedUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }
      setUser(parsedUser);
      loadPageData(parsedUser);
    } catch {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPlanTask ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPlanTask]);

  const handleOpenPlanTask = (task: PlanTask) => {
    if (task.availability_status !== "available_today") return;

    setTaskReflection("");
    setTaskConfirmed(false);
    setSelectedPlanTask(task);
  };

  const handleClosePlanTask = () => {
    if (completingPlanTaskId !== null) return;

    setSelectedPlanTask(null);
    setTaskReflection("");
    setTaskConfirmed(false);
  };

  const handleGeneratePlan = async () => {
    if (!user || !latestAssessment || generatingPlan) return;
    try {
      setGeneratingPlan(true);
      const response = await fetch(GENERATE_PLAN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          assessment_id: latestAssessment.id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "The plan could not be generated.");
      }
      setSelectedPlanTask(null);
      setTaskReflection("");
      setTaskConfirmed(false);
      await loadActivePlan(user);
      await showSuccess(
        data.already_exists ? "Plan Already Available 🌸" : "7-Day Plan Created ✨",
        data.message || "Your personalized wellness plan is ready."
      );
    } catch (error) {
      await showError(
        "Unable to Create Plan",
        error instanceof Error ? error.message : "MindBloom could not create your plan."
      );
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCompletePlanTask = async (task: PlanTask) => {
    if (!user || !activePlan || completingPlanTaskId !== null) return;
    if (task.availability_status !== "available_today") return;

    try {
      setCompletingPlanTaskId(task.id);
      const response = await fetch(COMPLETE_PLAN_TASK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(user.id),
          plan_id: Number(activePlan.id),
          task_id: Number(task.id),
          response_text: taskReflection.trim(),
          completion_confirmed: taskConfirmed ? 1 : 0,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "The task could not be completed.");
      }
      setSelectedPlanTask(null);
      setTaskReflection("");
      setTaskConfirmed(false);

      await loadActivePlan(user);

      await showSuccess(
        data.plan?.status === "completed"
          ? "Plan Completed 🌟"
          : "Task Completed 🌸",
        data.message ||
        "Your reflection and task progress have been saved successfully."
      );
    } catch (error) {
      await showError(
        "Unable to Complete Task",
        error instanceof Error ? error.message : "MindBloom could not update this task."
      );
    } finally {
      setCompletingPlanTaskId(null);
    }
  };

  const handleCompleteReminder = async (reminderId: number) => {
    if (!user || completingReminderId !== null) return;
    try {
      setCompletingReminderId(reminderId);
      const response = await fetch(COMPLETE_REMINDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          reminder_id: reminderId,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Reminder could not be completed.");
      setReminders((current) =>
        current.map((item) =>
          item.id === reminderId ? { ...item, status: "completed" } : item
        )
      );
      await showSuccess("Well Done 🌸", "Your reminder has been marked as completed.");
    } catch (error) {
      await showError(
        "Unable to Complete Reminder",
        error instanceof Error ? error.message : "MindBloom could not update your reminder."
      );
    } finally {
      setCompletingReminderId(null);
    }
  };

  const assignedReminders = useMemo(
    () =>
      reminders
        .filter(
          (item) =>
            item.date_status === "today" ||
            item.date_status === "upcoming"
        )
        .sort((a, b) => {
          const firstDate = new Date(
            `${a.reminder_date}T${a.reminder_time || "00:00:00"
            }`
          ).getTime();

          const secondDate = new Date(
            `${b.reminder_date}T${b.reminder_time || "00:00:00"
            }`
          ).getTime();

          return firstDate - secondDate;
        }),
    [reminders]
  );

  const todayReminders =
    assignedReminders.filter(
      (item) => item.date_status === "today"
    );

  const upcomingReminders =
    assignedReminders.filter(
      (item) => item.date_status === "upcoming"
    );

  const completedReminders =
    assignedReminders.filter(
      (item) => item.status === "completed"
    );

  const reminderProgress =
    assignedReminders.length > 0
      ? Math.round(
        (completedReminders.length /
          assignedReminders.length) *
        100
      )
      : 0;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));

  const getTaskIcon = (type: string) => {
    const value = type.toLowerCase();
    if (value.includes("breath") || value.includes("mindful")) return Brain;
    if (value.includes("journal") || value.includes("reflection")) return FileQuestion;
    if (value.includes("walk") || value.includes("movement")) return Activity;
    return Sparkles;
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <Card className="rounded-[30px] border border-white/80 dark:border-white/8 bg-white/75 dark:bg-white/4 px-10 py-12 text-center shadow-card backdrop-blur-xl">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8fa] dark:border-white/10 border-t-[#978bea] dark:border-t-[#a99df0]" />
          <h2 className="mt-5 font-display text-2xl font-bold text-slate-800 dark:text-[#e8eaf5]">
            Loading your wellness plan
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-[#8892a8]">
            Preparing your personalized tasks and reminders.
          </p>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#dcd5fa]/25 dark:bg-[#3d2d7a]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-80 h-96 w-96 rounded-full bg-[#c8edf5]/30 dark:bg-[#1a3d5c]/15 blur-3xl" />

      <div className="relative">
        <Card className="overflow-hidden rounded-[36px] border border-white/80 dark:border-white/8 bg-gradient-to-br from-[#efedff]/90 dark:from-white/6 via-[#eaf5ff]/85 dark:via-white/4 to-[#eaf9f4]/85 dark:to-white/6 p-7 shadow-[0_25px_70px_rgba(120,126,190,0.13)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="flex w-fit items-center gap-2 rounded-full border border-white/90 dark:border-white/10 bg-white/70 dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8174d2] dark:text-[#a99df0] shadow-soft">
                <BellRing className="h-4 w-4" />
                Personal Wellness Schedule
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-[#1f2943] dark:text-[#e8eaf5] sm:text-5xl">
                Your{" "}
                <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                  Wellness Plan
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#65718a] dark:text-[#8892a8]">
                Hello {user.fullname}. Follow your personalized seven-day plan and complete your reminders one step at a time.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => loadPageData(user, true)}
              disabled={refreshing}
              className="min-h-12 rounded-2xl border border-white/90 dark:border-white/10 bg-white/80 dark:bg-white/8 px-5 text-[#776bc8] dark:text-[#a99df0] shadow-soft hover:bg-white dark:hover:bg-white/12"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Plan
            </Button>
          </div>
        </Card>

        <section className="mt-8">
          {activePlan ? (
            <>
              <Card className="rounded-[34px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_20px_55px_rgba(120,126,190,0.11)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd8f7] dark:border-white/10 bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] dark:text-[#a99df0]">
                      <WandSparkles className="h-4 w-4" />
                      {activePlan.recommendation_source === "ai"
                        ? "AI Personalized"
                        : "Safe Personalized Plan"}
                    </span>

                    <h2 className="mt-4 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                      {activePlan.plan_title}
                    </h2>

                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[#758096] dark:text-[#8892a8]">
                      {activePlan.summary}
                    </p>
                  </div>

                  <div className="rounded-[26px] bg-gradient-to-br from-[#f1efff] via-[#edf7ff] to-[#edf9f5] p-5 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">
                      Overall Progress
                    </p>
                    <p className="mt-2 font-display text-4xl font-extrabold text-[#8174d2] dark:text-[#a99df0]">
                      {activePlan.progress_percentage}%
                    </p>
                    <p className="mt-1 text-xs text-[#7b869a] dark:text-[#8892a8]">
                      {activePlan.completed_tasks} of {activePlan.total_tasks} completed
                    </p>
                  </div>
                </div>

                <Progress value={activePlan.progress_percentage} className="mt-6 h-3" />

                {activePlan.status === "completed" && (
                  <div className="mt-6 rounded-[24px] border border-[#cde9df] dark:border-white/8 bg-gradient-to-r from-[#effaf6] dark:from-white/5 via-[#f2f9ff] dark:via-white/3 to-[#f4f1ff] dark:to-white/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#78c9af] to-[#69b8df] text-white shadow-soft">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="font-display text-lg font-bold text-[#2f6558]">
                          Seven-Day Wellness Plan Completed
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#658078]">
                          You successfully completed all seven activities and recorded your
                          wellness reflections. Your progress has been saved in MindBloom.
                        </p>

                        <Link
                          to="/assessment"
                          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#7468c8] shadow-soft transition hover:bg-[#faf9ff]"
                        >
                          <Brain className="h-4 w-4" />
                          Take a New Assessment
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label="Assessment" value={activePlan.category_name} icon={Brain} />
                  <SummaryCard label="Assessment Score" value={`${Math.round(activePlan.assessment_score)}/100`} icon={Target} />
                  <SummaryCard label="Plan Duration" value={`${formatDate(activePlan.start_date)} — ${formatDate(activePlan.end_date)}`} icon={CalendarDays} />
                  <SummaryCard label="Wellness Level" value={activePlan.wellness_level} icon={Sparkles} />
                </div>
              </Card>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
                  Seven-Day Journey
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                  Your Personalized Tasks
                </h2>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {activePlan.tasks.map((task) => {
                  const Icon = getTaskIcon(task.activity_type);

                  const isCompleted =
                    task.availability_status === "completed" ||
                    task.status === "completed";

                  const isAvailableToday =
                    task.availability_status === "available_today";

                  const isLocked =
                    task.availability_status === "locked";

                  const isMissed =
                    task.availability_status === "missed";

                  return (
                    <Card
                      key={task.id}
                      className={`relative overflow-hidden rounded-[28px] border p-6 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 ${isCompleted
                        ? "border-[#d7eee6] dark:border-white/8 bg-[#f0faf7]/85 dark:bg-white/5"
                        : isAvailableToday
                          ? "border-[#cfc8f4] dark:border-white/8 bg-white/90 dark:bg-white/5 shadow-[0_20px_55px_rgba(131,119,215,0.16)] hover:-translate-y-1"
                          : isLocked
                            ? "border-[#e3e0ef] dark:border-white/8 bg-[#f9f9fc]/82 dark:bg-white/5"
                            : "border-[#eadfe3] dark:border-white/8 bg-[#fbf7f8]/82 dark:bg-white/5"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-white shadow-soft ${isCompleted
                            ? "bg-gradient-to-br from-[#8bd3be] to-[#59b9df]"
                            : isAvailableToday
                              ? "bg-gradient-to-br from-[#a397ed] via-[#84aaeb] to-[#62bbe0]"
                              : "bg-[#c4c1d8]"
                            }`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f0edff] px-3 py-1 text-xs font-bold text-[#7569c9]">
                              Day {task.day_number}
                            </span>
                            <span className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs font-bold capitalize text-[#608aaa]">
                              {task.activity_type.replace(/_/g, " ")}
                            </span>

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf9f5] px-3 py-1 text-xs font-bold text-[#4c9d8a]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Completed
                              </span>
                            )}

                            {isAvailableToday && !isCompleted && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#eeeaff] dark:bg-white/8 px-3 py-1 text-xs font-bold text-[#7668ca] dark:text-[#a99df0]">
                                <Sparkles className="h-3.5 w-3.5" />
                                Available Today
                              </span>
                            )}

                            {isLocked && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f1f5] px-3 py-1 text-xs font-bold text-[#778197]">
                                <Clock3 className="h-3.5 w-3.5" />
                                Scheduled
                              </span>
                            )}

                            {isMissed && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f9ecef] dark:bg-white/5 px-3 py-1 text-xs font-bold text-[#b27182] dark:text-[#d48aa5]">
                                <Clock3 className="h-3.5 w-3.5" />
                                Window Closed
                              </span>
                            )}
                          </div>

                          <h3 className="mt-4 font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                            {task.task_title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                            {task.task_description}
                          </p>

                          {isAvailableToday && !isCompleted && (
                            <div className="mt-4 rounded-2xl border border-[#dcd6f6] dark:border-white/10 bg-gradient-to-r from-[#f3f0ff] dark:from-white/5 to-[#eef8ff] dark:to-white/3 px-4 py-3">
                              <p className="text-sm font-bold text-[#6f62c0] dark:text-[#a99df0]">
                                Today's wellness activity is ready
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[#78839a] dark:text-[#8892a8]">
                                You have until 11:59 PM today to complete this activity and submit your reflection.
                              </p>
                            </div>
                          )}

                          {isLocked && (
                            <div className="mt-4 rounded-2xl border border-[#e4e2eb] dark:border-white/10 bg-[#f5f5f8] dark:bg-white/5 px-4 py-3">
                              <p className="text-sm font-bold text-[#626d83] dark:text-[#c0c6d4]">
                                Scheduled for {formatDate(task.task_date)}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[#8790a1] dark:text-[#8892a8]">
                                This activity will unlock automatically on its assigned date and remain available for 24 hours.
                              </p>
                            </div>
                          )}

                          {isMissed && !isCompleted && (
                            <div className="mt-4 rounded-2xl border border-[#eedde2] dark:border-white/10 bg-[#fbf1f3] dark:bg-white/5 px-4 py-3">
                              <p className="text-sm font-bold text-[#a26274] dark:text-[#d48aa5]">
                                Completion window has ended
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[#987b83] dark:text-[#8892a8]">
                                This activity was available on {formatDate(task.task_date)}. Its 24-hour completion period has now ended.
                              </p>
                            </div>
                          )}

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#7b869a] dark:text-[#8892a8]">
                              <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ff] dark:bg-white/8 px-3 py-2">
                                <CalendarDays className="h-4 w-4 text-[#9184dc] dark:text-[#a99df0]" />
                                {formatDate(task.task_date)}
                              </span>
                              {task.duration_minutes !== null && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] dark:bg-white/8 px-3 py-2">
                                  <Clock3 className="h-4 w-4 text-[#6c9fc4] dark:text-[#7ab3e0]" />
                                  {task.duration_minutes} minutes
                                </span>
                              )}
                            </div>

                            {isCompleted ? (
                              <span className="inline-flex items-center gap-2 rounded-xl bg-[#eaf9f5] dark:bg-white/8 px-4 py-2.5 text-sm font-bold text-[#4c9d8a] dark:text-[#6fc5ad]">
                                <CheckCircle2 className="h-4 w-4" />
                                Task Completed
                              </span>
                            ) : isAvailableToday ? (
                              <Button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenPlanTask(task);
                                }}
                                disabled={completingPlanTaskId !== null}
                                className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 text-white shadow-soft hover:opacity-95"
                              >
                                <Activity className="mr-2 h-4 w-4" />
                                Start Today’s Task
                              </Button>
                            ) : isLocked ? (
                              <Button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-xl border border-[#e1dfeb] bg-[#f1f1f5] px-5 text-[#7e8798] opacity-100 shadow-none"
                              >
                                <Clock3 className="mr-2 h-4 w-4" />
                                Available{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "numeric",
                                }).format(
                                  new Date(`${task.task_date}T00:00:00`)
                                )}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-xl border border-[#eadde1] bg-[#f7eff1] px-5 text-[#a06d7b] opacity-100 shadow-none"
                              >
                                <Clock3 className="mr-2 h-4 w-4" />
                                24-Hour Window Ended
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card className="rounded-[34px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-white/68 dark:bg-white/4 p-8 text-center shadow-soft backdrop-blur-xl sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                <WandSparkles className="h-10 w-10" />
              </div>

              <h2 className="mt-6 font-display text-3xl font-bold text-[#29334a] dark:text-[#e8eaf5]">
                Create Your 7-Day Wellness Plan
              </h2>

              {latestAssessment ? (
                <>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#788399] dark:text-[#8892a8]">
                    MindBloom will use your latest <strong>{latestAssessment.category_name}</strong> assessment score of <strong>{Math.round(latestAssessment.score)}/100</strong> to create seven personalized daily tasks.
                  </p>

                  <Button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="mt-7 min-h-12 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-7 text-white shadow-soft hover:opacity-95"
                  >
                    <WandSparkles className="mr-2 h-5 w-5" />
                    {generatingPlan ? "Creating Your Plan..." : "Create My 7-Day Plan"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#788399] dark:text-[#8892a8]">
                    Complete a wellness assessment first. MindBloom will then use your result to create a suitable seven-day plan.
                  </p>
                  <Link
                    to="/assessment"
                    className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-7 text-sm font-semibold text-white shadow-soft"
                  >
                    <Brain className="h-5 w-5" />
                    Take an Assessment
                  </Link>
                </>
              )}
            </Card>
          )}
        </section>

        <section className="mt-12 border-t border-white/80 dark:border-white/8 pt-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7fd8] dark:text-[#a99df0]">
            Assigned Wellness Reminders
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
            Your Scheduled Tasks
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7b869a] dark:text-[#8892a8]">
            View today&apos;s activities and upcoming reminders assigned by MindBloom or your wellness administrator.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniCard
              label="Assigned Tasks"
              value={assignedReminders.length}
            />

            <MiniCard
              label="Available Today"
              value={todayReminders.length}
            />

            <MiniCard
              label="Upcoming"
              value={upcomingReminders.length}
            />

            <MiniCard
              label="Completed"
              value={`${reminderProgress}%`}
            />
          </div>

          {assignedReminders.length > 0 ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {assignedReminders.map((reminder) => (
                <Card key={reminder.id} className="rounded-[28px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-soft backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#91d8c5] to-[#79c7e5] text-white shadow-soft">
                      <BellRing className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                        {reminder.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {reminder.date_status === "today" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#eeeaff] dark:bg-white/8 px-3 py-1 text-xs font-bold text-[#7668ca] dark:text-[#a99df0]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Available Today
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#edf7ff] dark:bg-white/8 px-3 py-1 text-xs font-bold text-[#608aaa] dark:text-[#7ab3e0]">
                            <Clock3 className="h-3.5 w-3.5" />
                            Upcoming
                          </span>
                        )}
                      </div>

                      {reminder.description && (
                        <p className="mt-3 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                          {reminder.description}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ff] dark:bg-white/8 px-3 py-2 text-xs font-semibold text-[#7b869a] dark:text-[#8892a8]">
                          <CalendarDays className="h-4 w-4 text-[#9184dc] dark:text-[#a99df0]" />
                          {formatDate(reminder.reminder_date)}
                        </span>
                        {reminder.status === "completed" ? (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-[#eaf9f5] dark:bg-white/8 px-4 py-2.5 text-sm font-bold text-[#4c9d8a] dark:text-[#6fc5ad]">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        ) : reminder.date_status === "today" ? (
                          <Button
                            type="button"
                            onClick={() => handleCompleteReminder(reminder.id)}
                            disabled={completingReminderId !== null}
                            className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 text-white shadow-soft"
                          >
                            {completingReminderId === reminder.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            {completingReminderId === reminder.id
                              ? "Completing..."
                              : "Mark as Completed"}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-xl border border-[#dce8f0] dark:border-white/10 bg-[#edf7ff] dark:bg-white/5 px-5 text-[#608aaa] dark:text-[#7ab3e0] opacity-100 shadow-none"
                          >
                            <Clock3 className="mr-2 h-4 w-4" />
                            Available {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                            }).format(new Date(`${reminder.reminder_date}T00:00:00`))}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6 rounded-[30px] border border-dashed border-[#d9d3f4] dark:border-white/10 bg-white/65 dark:bg-white/4 p-9 text-center shadow-soft backdrop-blur-xl">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#8b7fd8] dark:text-[#a99df0]" />
              <p className="mt-3 font-semibold text-[#59657b] dark:text-[#8892a8]">
                No current or upcoming reminders are scheduled.
              </p>
            </Card>
          )}
        </section>
      </div>


      {selectedPlanTask && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#1f2943]/60 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wellness-task-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePlanTask();
            }
          }}
        >
          <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/90 bg-white shadow-[0_35px_100px_rgba(31,41,67,0.32)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#dcd5fa]/55 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-[#c8edf5]/55 blur-3xl" />

            <button
              type="button"
              onClick={handleClosePlanTask}
              disabled={completingPlanTaskId !== null}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#7d72c8] shadow-soft transition hover:bg-white disabled:opacity-50"
              aria-label="Close task"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] px-6 pb-7 pt-8 sm:px-8">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white shadow-soft">
                  {(() => {
                    const ModalTaskIcon = getTaskIcon(selectedPlanTask.activity_type);
                    return <ModalTaskIcon className="h-7 w-7" />;
                  })()}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#ddd8f7] bg-white/75 px-3 py-1 text-xs font-bold text-[#7569c9]">
                      Day {selectedPlanTask.day_number}
                    </span>
                    <span className="rounded-full border border-[#d9e9f3] bg-white/75 px-3 py-1 text-xs font-bold capitalize text-[#608aaa]">
                      {selectedPlanTask.activity_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h2
                    id="wellness-task-title"
                    className="mt-3 font-display text-2xl font-bold leading-tight text-[#273149] sm:text-3xl"
                  >
                    {selectedPlanTask.task_title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6f7b91]">
                    Complete today&apos;s activity honestly, then save a short reflection about your experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative max-h-[68vh] space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="rounded-[24px] border border-[#e5e1f5] bg-gradient-to-br from-white via-[#faf9ff] to-[#f4f9fd] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b7fd8]">
                  Task Instructions
                </p>
                <p className="mt-3 text-sm leading-7 text-[#667289]">
                  {selectedPlanTask.task_description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#e3def5] bg-[#f4f1ff]/75 p-4">
                  <div className="flex items-center gap-2 text-[#8174d2]">
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Scheduled Date</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#33405a]">
                    {formatDate(selectedPlanTask.task_date)}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#dcebf3] bg-[#edf7ff]/75 p-4">
                  <div className="flex items-center gap-2 text-[#669cc0]">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Suggested Duration</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#33405a]">
                    {selectedPlanTask.duration_minutes ?? 5} minutes
                  </p>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#dcd6f6] bg-gradient-to-r from-[#f3f0ff] to-[#eef8ff] px-4 py-3">
                <p className="text-sm font-bold text-[#6f62c0]">Available until 11:59 PM today</p>
                <p className="mt-1 text-xs leading-5 text-[#78839a]">
                  This task can only be submitted during its assigned 24-hour window.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e1dcf5] bg-white/85 p-5">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-[#8174d2]" />
                  <label htmlFor="task-reflection" className="text-sm font-bold text-[#33405a]">
                    Short completion reflection
                  </label>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#7b869a]">
                  Briefly describe what you completed and how you felt afterward.
                </p>
                <textarea
                  id="task-reflection"
                  value={taskReflection}
                  onChange={(event) => setTaskReflection(event.target.value)}
                  rows={4}
                  maxLength={400}
                  placeholder="Example: I completed the activity and felt calmer and more focused afterward."
                  className="mt-4 w-full resize-none rounded-2xl border border-[#ded9f4] bg-[#fbfaff] px-4 py-3 text-sm leading-6 text-[#33405a] outline-none transition placeholder:text-[#a0a8b8] focus:border-[#a99deb] focus:ring-4 focus:ring-[#a99deb]/15"
                />
                <div className="mt-2 flex justify-between gap-3 text-xs text-[#8a94a7]">
                  <span>At least 5 characters required.</span>
                  <span>{taskReflection.length}/400</span>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-[#d7eee6] bg-[#effaf6] p-4">
                <input
                  type="checkbox"
                  checked={taskConfirmed}
                  onChange={(event) => setTaskConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#9fcfbe] text-[#55a38f] focus:ring-[#9fcfbe]"
                />
                <span>
                  <span className="block text-sm font-bold text-[#3f806f]">
                    I have completed this wellness activity
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#668b80]">
                    Confirm this only after genuinely completing the activity.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-[#ece9f7] pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClosePlanTask}
                  disabled={completingPlanTaskId !== null}
                  className="min-h-11 rounded-xl border-[#ddd8f7] bg-white px-5 font-semibold text-[#776bc8] hover:bg-[#f5f3ff]"
                >
                  Close
                </Button>

                <Button
                  type="button"
                  onClick={() => handleCompletePlanTask(selectedPlanTask)}
                  disabled={
                    completingPlanTaskId !== null ||
                    !taskConfirmed ||
                    taskReflection.trim().length < 5
                  }
                  className="min-h-11 rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white shadow-soft hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {completingPlanTaskId === selectedPlanTask.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Progress...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Completion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Brain;
}) {
  return (
    <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/68 dark:bg-white/5 p-5 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0edff] dark:bg-white/8 text-[#8174d2] dark:text-[#a99df0]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#273149] dark:text-[#e8eaf5]">{value}</p>
    </div>
  );
}

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/68 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-wider text-[#7e879b] dark:text-[#8892a8]">{label}</p>
      <p className="mt-2 font-display text-4xl font-extrabold text-[#8174d2] dark:text-[#a99df0]">{value}</p>
    </div>
  );
}