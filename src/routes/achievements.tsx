import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Crown,
  Download,
  Flame,
  Leaf,
  LoaderCircle,
  Lock,
  Medal,
  Printer,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/SectionHeader";
import { showError, showSuccess } from "@/lib/sweetAlert";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      {
        title: "Achievements — MindBloom",
      },
      {
        name: "description",
        content:
          "Celebrate your wellness milestones and view your personalized MindBloom certificate.",
      },
    ],
  }),
  component: AchievementsPage,
});

type SavedUser = {
  id: number;
  fullname: string;
  email: string;
  role?: "user" | "admin";
  profile_image?: string;
};

type Achievement = {
  id: number;
  achievement_key: string;
  achievement_title: string;
  achievement_description: string;
  certificate_number: string;
  earned_date: string;
  status: "earned" | "locked";
  created_at: string;
};

type UserResponse = {
  id: number;
  fullname: string;
  email: string;
  profile_image?: string;
};

type AchievementProgressItem = {
  current: number;
  required: number;
  earned: boolean;
};

type AchievementProgress = Record<
  string,
  AchievementProgressItem
>;

type NewAchievementResult = {
  key: string;
  achievement_id?: number;
  certificate_number?: string;
  earned_date?: string;
};

const demoAchievement: Achievement = {
  id: 0,
  achievement_key: "demo_certificate",
  achievement_title: "Mindful Wellness Journey",
  achievement_description:
    "Presented in recognition of commitment to personal growth, emotional balance and consistent self-care.",
  certificate_number: "MB-DEMO-2026-001",
  earned_date: "2026-06-01",
  status: "earned",
  created_at: "2026-06-01 10:00:00",
};

const badgeCatalog = [
  {
    key: "mindbloom_journey_started",
    icon: Sparkles,
    name: "Journey Starter",
    description: "Began a personal wellness journey with MindBloom.",
    requirement: "Account created",
    unit: "completed",
    gradient: "from-[#b6a7ff] via-[#8fb8ff] to-[#72d7e6]",
  },
  {
    key: "seven_day_streak",
    icon: Flame,
    name: "7-Day Streak",
    description: "One week of consistent wellness practice.",
    requirement: "Complete activities for 7 days",
    unit: "days",
    gradient: "from-[#f6b7a7] via-[#e8b1d8] to-[#c6b7ff]",
  },
  {
    key: "thirty_day_consistency",
    icon: Award,
    name: "30-Day Consistency",
    description: "A full month of showing up with care.",
    requirement: "Maintain a 30-day routine",
    unit: "days",
    gradient: "from-[#c8b8ff] via-[#9fbef8] to-[#8ed6ef]",
  },
  {
    key: "self_care_champion",
    icon: Crown,
    name: "Self-Care Champion",
    description: "Completed 50 wellness activities.",
    requirement: "Complete 50 activities",
    unit: "activities",
    gradient: "from-[#a9e8d3] via-[#8ed8ef] to-[#9db8ff]",
  },
  {
    key: "mindfulness_explorer",
    icon: Leaf,
    name: "Mindfulness Explorer",
    description: "Explored multiple mindfulness activities.",
    requirement: "Complete 5 mindfulness exercises",
    unit: "exercises",
    gradient: "from-[#9edff0] via-[#aeb9ff] to-[#d2b8ff]",
  },
  {
    key: "wellness_legend",
    icon: Trophy,
    name: "Wellness Legend",
    description: "Reached an advanced wellness milestone.",
    requirement: "Reach a 90-day streak",
    unit: "days",
    gradient: "from-[#dbc0ff] via-[#f2b9cf] to-[#f7c5aa]",
  },
];

function AchievementsPage() {
  const [savedUser, setSavedUser] = useState<SavedUser | null>(
    null
  );

  const [achievementUser, setAchievementUser] =
    useState<UserResponse | null>(null);

  const [achievements, setAchievements] = useState<
    Achievement[]
  >([]);

  const [achievementProgress, setAchievementProgress] =
    useState<AchievementProgress>({});

  const [loading, setLoading] = useState(true);
  const [certificateIndex, setCertificateIndex] =
    useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser: SavedUser =
        JSON.parse(storedUser);

      if (parsedUser.role === "admin") {
        setLoading(false);
        return;
      }

      setSavedUser(parsedUser);
    } catch (error) {
      console.error(
        "Achievement user session error:",
        error
      );

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!savedUser) {
      return;
    }

    const syncAndLoadAchievements = async () => {
      try {
        setLoading(true);

        const syncResponse = await fetch(
          "http://localhost/api/user/sync_my_achievements.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: savedUser.id,
              email: savedUser.email,
            }),
          }
        );

        const syncData =
          await syncResponse.json();

        if (!syncData.success) {
          await showError(
            "Unable to Prepare Certificate",
            syncData.message ||
              "MindBloom could not prepare your achievement certificate."
          );
          return;
        }

        setAchievementProgress(
          syncData.progress &&
            typeof syncData.progress === "object"
            ? syncData.progress
            : {}
        );

        const newlyUnlocked: NewAchievementResult[] =
          Array.isArray(syncData.new_achievements)
            ? syncData.new_achievements
            : [];

        if (newlyUnlocked.length > 0) {
          const unlockedTitles = newlyUnlocked
            .map((item) => {
              const badge = badgeCatalog.find(
                (entry) => entry.key === item.key
              );

              return badge?.name || item.key;
            })
            .join(", ");

          await showSuccess(
            newlyUnlocked.length === 1
              ? "New Achievement Unlocked! 🏆"
              : "New Achievements Unlocked! 🏆",
            `Congratulations! You unlocked: ${unlockedTitles}.`
          );
        }

        const response = await fetch(
          "http://localhost/api/user/get_my_achievements.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: savedUser.id,
            }),
          }
        );

        const data = await response.json();

        if (!data.success) {
          await showError(
            "Unable to Load Achievements",
            data.message ||
              "Your achievements could not be loaded."
          );
          return;
        }

        setAchievementUser(data.user || null);
        setAchievements(
          Array.isArray(data.achievements)
            ? data.achievements
            : []
        );
      } catch (error) {
        console.error(
          "Achievement loading error:",
          error
        );

        await showError(
          "Connection Error",
          "MindBloom could not connect to the achievements service. Please check Apache and MySQL."
        );
      } finally {
        setLoading(false);
      }
    };

    syncAndLoadAchievements();
  }, [savedUser]);

  const activeCertificate = useMemo(() => {
    if (!savedUser) {
      return demoAchievement;
    }

    return (
      achievements[certificateIndex] ||
      achievements[0] ||
      demoAchievement
    );
  }, [
    achievements,
    certificateIndex,
    savedUser,
  ]);

  const certificateName =
    achievementUser?.fullname ||
    savedUser?.fullname ||
    "MindBloom Member";

  const earnedKeys = useMemo(
    () =>
      new Set(
        achievements
          .filter(
            (achievement) =>
              achievement.status === "earned"
          )
          .map(
            (achievement) =>
              achievement.achievement_key
          )
      ),
    [achievements]
  );

  const getBadgeProgress = (badgeKey: string) => {
    if (
      badgeKey === "mindbloom_journey_started"
    ) {
      return {
        current: 1,
        required: 1,
        earned: true,
      };
    }

    return (
      achievementProgress[badgeKey] || {
        current: 0,
        required:
          badgeKey === "seven_day_streak"
            ? 7
            : badgeKey ===
                "thirty_day_consistency"
              ? 30
              : badgeKey ===
                  "self_care_champion"
                ? 50
                : badgeKey ===
                    "mindfulness_explorer"
                  ? 5
                  : 90,
        earned: false,
      }
    );
  };

  const getProgressPercentage = (
    current: number,
    required: number
  ) => {
    if (required <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (current / required) * 100
        )
      )
    );
  };

  const formattedDate = (
    dateValue: string
  ) => {
    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative overflow-hidden">
      <style>
        {`
          @keyframes certificateFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes shimmerSweep {
            0% { transform: translateX(-140%) skewX(-18deg); }
            100% { transform: translateX(240%) skewX(-18deg); }
          }

          @keyframes softPulse {
            0%, 100% { opacity: 0.45; transform: scale(1); }
            50% { opacity: 0.75; transform: scale(1.08); }
          }

          .mindbloom-certificate {
            animation: certificateFloat 6s ease-in-out infinite;
          }

          .certificate-shimmer {
            animation: shimmerSweep 4.8s ease-in-out infinite;
          }

          .certificate-glow {
            animation: softPulse 5s ease-in-out infinite;
          }

          @media print {
            body * {
              visibility: hidden !important;
            }

            #mindbloom-certificate,
            #mindbloom-certificate * {
              visibility: visible !important;
            }

            #mindbloom-certificate {
              position: absolute !important;
              inset: 0 !important;
              width: 100% !important;
              min-height: 100vh !important;
              margin: 0 !important;
              padding: 18mm !important;
              border: none !important;
              box-shadow: none !important;
              animation: none !important;
              background: white !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .certificate-actions {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#ddd7fa]/30 dark:bg-[#3d2d7a]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-[34rem] h-96 w-96 rounded-full bg-[#caedf5]/35 dark:bg-[#1a3d5c]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#d9f3e8]/30 dark:bg-[#1a3d4c]/15 blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Achievements"
          title={
            <>
              Celebrate your{" "}
              <span className="text-gradient">
                growth
              </span>
            </>
          }
          subtitle={
            savedUser
              ? "Your MindBloom achievements are connected to your personal account and stored securely in the database."
              : "Explore a sample certificate and see how MindBloom celebrates meaningful wellness progress."
          }
        />

        <section className="mt-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {badgeCatalog.map(
              (badge, index) => {
                const unlocked =
                  badge.key ===
                    "mindbloom_journey_started" &&
                  !savedUser
                    ? true
                    : earnedKeys.has(
                        badge.key
                      );

                const Icon =
                  badge.icon;

                const progress =
                  getBadgeProgress(
                    badge.key
                  );

                const progressPercentage =
                  getProgressPercentage(
                    progress.current,
                    progress.required
                  );

                const progressText =
                  progress.earned
                    ? "Completed"
                    : `${progress.current}/${progress.required} ${badge.unit}`;

                return (
                  <Card
                    key={badge.key}
                    className={`group relative overflow-hidden rounded-[30px] border p-6 text-center backdrop-blur-xl transition-all duration-500 ${
                      unlocked
                        ? "border-white/90 dark:border-white/8 bg-white/82 dark:bg-white/5 shadow-[0_20px_52px_rgba(120,126,190,0.12)] hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(120,126,190,0.18)]"
                        : "border-[#ddd9ef]/85 dark:border-white/8 bg-gradient-to-br from-[#f4f1fb]/92 dark:from-white/5 via-[#f8f9fc]/90 dark:via-white/3 to-[#edf4fb]/92 dark:to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_46px_rgba(120,126,190,0.10)]"
                    }`}
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/45 dark:bg-white/5 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-[#dcd7f8]/25 dark:bg-[#3d2d7a]/15 blur-2xl" />

                    <div
                      className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] shadow-[0_18px_35px_rgba(125,137,200,0.24)] ${
                        unlocked
                          ? `bg-gradient-to-br ${badge.gradient} transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105`
                          : "bg-gradient-to-br from-[#aeb3c0] via-[#c3c7d0] to-[#9ea5b3]"
                      }`}
                    >
                      <Icon className="h-11 w-11 text-white" />

                      {unlocked ? (
                        <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#5db69e] text-white shadow-soft">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#8f96a5] text-white shadow-soft">
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <h3
                      className={`mt-6 font-display text-xl font-bold ${
                        unlocked ? "text-[#273149] dark:text-[#e8eaf5]" : "text-[#566176] dark:text-[#8892a8]"
                      }`}
                    >
                      {badge.name}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        unlocked ? "text-[#758096] dark:text-[#8892a8]" : "text-[#8791a4] dark:text-[#6b7590]"
                      }`}
                    >
                      {badge.description}
                    </p>

                    <div
                      className={`mt-5 rounded-2xl border px-4 py-3 text-left ${
                        unlocked
                          ? "border-[#d8eee7] dark:border-white/8 bg-[#eefaf6]/80 dark:bg-white/5"
                          : "border-[#ded9ee] dark:border-white/8 bg-[#f0edf8]/78 dark:bg-white/5"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a7fd0] dark:text-[#a99df0]">
                        {unlocked ? "Achievement" : "Requirement"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#68748a] dark:text-[#8892a8]">
                        {badge.requirement}
                      </p>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/85 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ${
                            unlocked
                              ? "bg-gradient-to-r from-[#74c8ad] to-[#6cb6df]"
                              : "bg-gradient-to-r from-[#b1a6e8] to-[#9ebbe7]"
                          }`}
                          style={{
                            width: `${
                              unlocked
                                ? 100
                                : progressPercentage
                            }%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-semibold text-[#8a94a8] dark:text-[#6b7590]">
                        <span>
                          {progressText}
                        </span>

                        <span>
                          {unlocked
                            ? "100%"
                            : `${progressPercentage}%`}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`mt-5 inline-flex rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        unlocked
                          ? "border-[#d6eee5] dark:border-white/8 bg-[#eaf9f4] dark:bg-white/5 text-[#4c9d8a] dark:text-[#6fc5ad]"
                          : "border-[#ddd9e9] dark:border-white/8 bg-[#eeeaf6] dark:bg-white/5 text-[#797f90] dark:text-[#8892a8]"
                      }`}
                    >
                      {unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </Card>
                );
              }
            )}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader
            eyebrow="Personal Certificate"
            title="A luxury certificate made for your milestone"
            subtitle={
              savedUser
                ? "Your real name, achievement title, issue date and certificate number are loaded from MindBloom."
                : "This public preview uses an example name. Registered users receive their own personalized certificate."
            }
          />

          {loading ? (
            <Card className="mt-10 flex min-h-[420px] items-center justify-center rounded-[36px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 backdrop-blur-xl">
              <div className="text-center">
                <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-[#8174d2] dark:text-[#a99df0]" />

                <p className="mt-4 font-semibold text-[#65718a] dark:text-[#8892a8]">
                  Preparing your certificate...
                </p>
              </div>
            </Card>
          ) : (
            <>
              {savedUser &&
                achievements.length >
                  1 && (
                  <div className="mt-10 flex flex-wrap justify-center gap-3">
                    {achievements.map(
                      (
                        achievement,
                        index
                      ) => (
                        <button
                          key={
                            achievement.id
                          }
                          type="button"
                          onClick={() =>
                            setCertificateIndex(
                              index
                            )
                          }
                          className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                            certificateIndex ===
                            index
                              ? "border-transparent bg-gradient-to-r from-[#9f92eb] via-[#83a9ec] to-[#64bddf] text-white shadow-soft"
                              : "border-white/90 dark:border-white/10 bg-white/72 dark:bg-white/5 text-[#65718a] dark:text-[#8892a8] hover:bg-white dark:hover:bg-white/10"
                          }`}
                        >
                          {
                            achievement.achievement_title
                          }
                        </button>
                      )
                    )}
                  </div>
                )}

              <div
                id="mindbloom-certificate"
                className="mindbloom-certificate relative mt-10 overflow-hidden rounded-[40px] border border-[#e8dfbd] bg-[#fffdf8] p-3 shadow-[0_34px_90px_rgba(99,85,150,0.20)] sm:p-5 lg:p-7"
              >
                <div className="certificate-glow pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#d9cffb]/40 blur-3xl" />
                <div className="certificate-glow pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#cceee3]/45 blur-3xl" />

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="certificate-shimmer absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>

                <div className="relative rounded-[32px] border border-[#cabd8b] bg-gradient-to-br from-[#fffefb] via-[#faf7ff] to-[#f5fbff] p-3 sm:p-4">
                  <div className="rounded-[26px] border-[3px] border-double border-[#c7b16a] p-5 sm:p-8 lg:p-12">
                    <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                      <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-[#d9c888] bg-white/75 shadow-inner lg:flex">
                        <Medal className="h-12 w-12 text-[#a58a35]" />
                      </div>

                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#9f92eb] via-[#83a9ec] to-[#64bddf] text-white shadow-[0_16px_35px_rgba(120,126,190,0.24)]">
                          <Sparkles className="h-8 w-8" />
                        </div>

                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.34em] text-[#9b8140] sm:text-sm">
                          MindBloom Wellness Certificate
                        </p>

                        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#273149] sm:text-5xl lg:text-6xl">
                          Certificate of Achievement
                        </h2>

                        <div className="mx-auto mt-6 h-px max-w-xl bg-gradient-to-r from-transparent via-[#c6b576] to-transparent" />

                        <p className="mt-8 text-sm uppercase tracking-[0.24em] text-[#7c8496]">
                          Proudly presented to
                        </p>

                        <h3 className="mt-3 bg-gradient-to-r from-[#6f63bd] via-[#568dca] to-[#3e9eb7] bg-clip-text font-display text-4xl font-extrabold text-transparent sm:text-6xl">
                          {certificateName}
                        </h3>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#65718a]">
                          has been recognized for successfully achieving
                        </p>

                        <p className="mt-3 font-display text-2xl font-bold text-[#273149] sm:text-3xl">
                          {
                            activeCertificate.achievement_title
                          }
                        </p>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#758096] sm:text-base">
                          {
                            activeCertificate.achievement_description
                          }
                        </p>

                        <div className="mx-auto mt-9 grid max-w-3xl gap-5 sm:grid-cols-3">
                          <div className="rounded-2xl border border-[#e4d9b4] bg-white/65 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8140]">
                              Certificate No.
                            </p>

                            <p className="mt-2 break-all text-sm font-bold text-[#4f5b73]">
                              {
                                activeCertificate.certificate_number
                              }
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e4d9b4] bg-white/65 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8140]">
                              Date Issued
                            </p>

                            <p className="mt-2 text-sm font-bold text-[#4f5b73]">
                              {formattedDate(
                                activeCertificate.earned_date
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e4d9b4] bg-white/65 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b8140]">
                              Status
                            </p>

                            <p className="mt-2 text-sm font-bold text-[#4c9d8a]">
                              Verified Achievement
                            </p>
                          </div>
                        </div>

                        <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:items-end">
                          <div>
                            <p className="font-display text-2xl italic text-[#665aa6]">
                              MindBloom
                            </p>

                            <div className="mx-auto mt-2 h-px max-w-[220px] bg-[#a9a0b7]" />

                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#7c8496]">
                              Wellness Platform
                            </p>
                          </div>

                          <div>
                            <p className="font-display text-2xl italic text-[#568dca]">
                              Bloom
                            </p>

                            <div className="mx-auto mt-2 h-px max-w-[220px] bg-[#a9a0b7]" />

                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#7c8496]">
                              AI Wellness Companion
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-[#d9c888] bg-white/75 shadow-inner lg:flex">
                        <Trophy className="h-12 w-12 text-[#a58a35]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="certificate-actions mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  onClick={handlePrint}
                  className="min-h-12 rounded-full bg-gradient-to-r from-[#9f92eb] via-[#83a9ec] to-[#64bddf] px-7 text-white shadow-glow"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save as PDF
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={handlePrint}
                  className="min-h-12 rounded-full border-[#ddd8f7] dark:border-white/10 bg-white/78 dark:bg-white/5 px-7 text-[#776bc8] dark:text-[#a99df0]"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Certificate
                </Button>
              </div>

              {!savedUser && (
                <Card className="mt-8 rounded-[26px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-5 text-center shadow-soft backdrop-blur-xl">
                  <Star className="mx-auto h-6 w-6 text-[#8174d2] dark:text-[#a99df0]" />

                  <p className="mt-3 font-semibold text-[#273149] dark:text-[#e8eaf5]">
                    This is a public demo certificate.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                    After login, MindBloom automatically replaces the example name and certificate details with the current user&apos;s database record.
                  </p>
                </Card>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}