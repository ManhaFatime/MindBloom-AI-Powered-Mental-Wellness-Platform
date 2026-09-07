import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  Search,
  Smile,
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

export const Route = createFileRoute("/admin/moods")({
  head: () => ({
    meta: [
      {
        title: "Mood Records — MindBloom Admin",
      },
      {
        name: "description",
        content: "View MindBloom user mood check-ins.",
      },
    ],
  }),
  component: AdminMoodRecordsPage,
});

type MoodRecord = {
  id: number;
  user_id: number;
  mood: string;
  note: string;
  created_at: string;
  user_name: string;
  user_email: string;
  profile_image: string;
};

function AdminMoodRecordsPage() {
  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

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
            "Only MindBloom administrators can view mood records."
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
          "Your session is invalid. Please log in again."
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

    let isMounted = true;

    const loadMoods = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          "http://localhost/api/admin/get_moods.php",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Server returned status ${response.status}`
          );
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (data.success) {
          setMoods(
            Array.isArray(data.moods)
              ? data.moods
              : []
          );
        } else {
          await showError(
            "Unable to Load Moods",
            data.message ||
              "Mood records could not be fetched."
          );
        }
      } catch (error) {
        console.error("Mood fetch error:", error);

        if (isMounted) {
          await showError(
            "Connection Error",
            "MindBloom could not load mood records. Please check Apache and MySQL."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMoods();

    return () => {
      isMounted = false;
    };
  }, [checkingAccess]);

  const filteredMoods = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return moods;
    }

    return moods.filter((record) => {
      const userName = record.user_name || "";
      const userEmail = record.user_email || "";
      const mood = record.mood || "";
      const note = record.note || "";

      return (
        userName.toLowerCase().includes(keyword) ||
        userEmail.toLowerCase().includes(keyword) ||
        mood.toLowerCase().includes(keyword) ||
        note.toLowerCase().includes(keyword)
      );
    });
  }, [moods, search]);

  const handleDeleteMood = async (
    record: MoodRecord
  ) => {
    const confirmed = await showConfirm(
      "Delete mood record?",
      `${record.user_name}'s "${record.mood}" mood check-in will be permanently removed.`,
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
        "http://localhost/api/admin/delete_mood.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mood_id: record.id,
            admin_email: adminData.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMoods((currentMoods) =>
          currentMoods.filter(
            (item) => item.id !== record.id
          )
        );

        await showSuccess(
          "Mood Record Deleted 🌸",
          data.message ||
            "The selected mood record was deleted successfully."
        );
      } else {
        await showError(
          "Delete Failed",
          data.message ||
            "The selected mood record could not be deleted."
        );
      }
    } catch (error) {
      console.error("Delete mood error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    }
  };

  const getMoodEmoji = (mood: string) => {
    const normalizedMood = mood
      .toLowerCase()
      .trim();

    if (
      normalizedMood.includes("happy") ||
      normalizedMood.includes("great") ||
      normalizedMood.includes("excited")
    ) {
      return "😊";
    }

    if (
      normalizedMood.includes("calm") ||
      normalizedMood.includes("peace")
    ) {
      return "😌";
    }

    if (
      normalizedMood.includes("sad") ||
      normalizedMood.includes("down")
    ) {
      return "😔";
    }

    if (
      normalizedMood.includes("angry") ||
      normalizedMood.includes("frustrated")
    ) {
      return "😤";
    }

    if (
      normalizedMood.includes("anxious") ||
      normalizedMood.includes("worried")
    ) {
      return "😟";
    }

    return "🌸";
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[30px] border border-[#dfe2ef] bg-white/92 px-10 py-12 text-center shadow-[0_22px_60px_rgba(120,126,190,0.13)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_60px_rgba(0,0,0,0.30)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#efd9e4] border-t-[#b77f9c] dark:border-white/10 dark:border-t-[#d48aa5]" />

          <p className="mt-4 text-sm text-[#6f7a90] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#efdbe6]/35 blur-3xl dark:bg-[#b86f8e]/8" />

      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#ddd7fa]/30 blur-3xl dark:bg-[#7669d5]/8" />

      <div className="relative mx-auto max-w-7xl">
        {/* Hero */}
        <Card className="relative overflow-hidden rounded-[34px] border border-[#dce0ed] bg-white/90 shadow-[0_26px_75px_rgba(120,126,190,0.14)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbf1f6]/95 via-[#f2efff]/90 to-[#edf7ff]/90 dark:from-[#2b3046] dark:via-[#272c43] dark:to-[#222c42]" />

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
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e5d8e1] bg-white/80 px-4 py-2 text-sm font-semibold text-[#9b6a89] shadow-soft dark:border-[#d48aa5]/18 dark:bg-[#d48aa5]/9 dark:text-[#e2a0b8]">
                  <Heart className="h-4 w-4" />
                  User Mood Management
                </span>

                <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] sm:text-5xl dark:text-[#edf0fa]">
                  Mood{" "}
                  <span className="bg-gradient-to-r from-[#d6a9c3] via-[#b8ace9] to-[#82a7eb] bg-clip-text text-transparent">
                    Records
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-[#5f6c83] dark:text-[#939db3]">
                  Review user emotions, personal notes and wellness check-ins.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#dce0eb] bg-white/82 px-6 py-4 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/88">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6f7a90] dark:text-[#939db3]">
                  Total Check-ins
                </p>

                <p className="mt-1 font-display text-3xl font-extrabold text-[#a86e91] dark:text-[#e2a0b8]">
                  {loading ? "..." : moods.length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Search */}
        <Card className="mt-8 rounded-[28px] border border-[#dce0eb] bg-white/88 p-5 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b77f9c] dark:text-[#d48aa5]" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by user, email, mood or note..."
              className="h-14 rounded-2xl border-[#e1d7df] bg-white pl-14 text-[#273149] shadow-sm placeholder:text-[#9aa2b3] focus-visible:border-[#d3a9bf] focus-visible:ring-[#f0dfe7] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96] dark:focus-visible:border-[#d48aa5]/50 dark:focus-visible:ring-[#d48aa5]/15"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="mt-8 flex min-h-72 items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 shadow-[0_18px_48px_rgba(120,126,190,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#efd9e4] border-t-[#b77f9c] dark:border-white/10 dark:border-t-[#d48aa5]" />

              <p className="mt-4 text-[#6f7a90] dark:text-[#939db3]">
                Loading mood records...
              </p>
            </div>
          </Card>
        ) : filteredMoods.length === 0 ? (
          <Card className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 px-6 text-center shadow-[0_18px_48px_rgba(120,126,190,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6b7cc] via-[#c5b3e9] to-[#8eb8e9] shadow-soft">
              <Smile className="h-8 w-8 text-white" />
            </div>

            <h2 className="mt-5 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
              No Mood Records Found
            </h2>

            <p className="mt-2 text-[#6f7a90] dark:text-[#939db3]">
              No mood check-in matches your search.
            </p>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {filteredMoods.map(
              (record, index) => {
                const profileImageUrl =
                  record.profile_image
                    ? `http://localhost/api/${record.profile_image}`
                    : "";

                return (
                  <Card
                    key={record.id}
                    className="group relative overflow-hidden rounded-[30px] border border-[#dfe2ec] bg-white/92 p-6 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d8c8d6] hover:shadow-[0_24px_58px_rgba(120,126,190,0.14)] dark:border-white/8 dark:bg-[#252d43]/94 dark:shadow-[0_18px_48px_rgba(0,0,0,0.23)] dark:hover:border-white/12 dark:hover:bg-[#293249] dark:hover:shadow-[0_24px_58px_rgba(0,0,0,0.30)]"
                    style={{
                      animation: `adminMoodReveal 0.55s ease-out ${
                        index * 0.08
                      }s both`,
                    }}
                  >
                    <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-[#efdbe6]/35 via-[#ddd7fa]/30 to-[#caedf5]/30 blur-3xl transition-transform duration-700 group-hover:scale-150 dark:from-[#d48aa5]/7 dark:via-[#9b8fea]/6 dark:to-[#6d9ac0]/6" />

                    <div className="relative">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                          {profileImageUrl ? (
                            <img
                              src={profileImageUrl}
                              alt={record.user_name}
                              className="h-14 w-14 rounded-[18px] border-2 border-white object-cover shadow-soft dark:border-white/15"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#e6b7cc] via-[#c5b3e9] to-[#8eb8e9] text-white shadow-soft">
                              <UserRound className="h-7 w-7" />
                            </div>
                          )}

                          <div>
                            <p className="font-display text-lg font-bold text-[#273149] dark:text-[#edf0fa]">
                              {record.user_name}
                            </p>

                            <p className="text-xs text-[#6f7a90] dark:text-[#939db3]">
                              {record.user_email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f7a90] dark:text-[#939db3]">
                          <CalendarDays className="h-4 w-4 text-[#b77f9c] dark:text-[#d48aa5]" />

                          {record.created_at
                            ? new Date(
                                record.created_at
                              ).toLocaleDateString()
                            : "Date unavailable"}
                        </div>
                      </div>

                      {/* Mood */}
                      <div className="mt-6 flex items-center gap-4 rounded-[22px] border border-[#e5dce4] bg-gradient-to-r from-[#fbf1f6]/95 via-[#f3f1ff]/90 to-[#edf7ff]/90 p-5 dark:border-white/8 dark:from-[#d48aa5]/9 dark:via-[#a99df0]/8 dark:to-[#79b6dc]/7">
                        <div className="text-4xl">
                          {getMoodEmoji(
                            record.mood
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a86e91] dark:text-[#e2a0b8]">
                            Mood
                          </p>

                          <h3 className="mt-1 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
                            {record.mood}
                          </h3>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mt-4 rounded-[22px] border border-[#dfe1eb] bg-white/90 p-5 shadow-inner dark:border-white/8 dark:bg-white/5">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8a94a7] dark:text-[#7f899e]">
                          User Note
                        </p>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5b73] dark:text-[#c2c9d8]">
                          {record.note ||
                            "No note was added."}
                        </p>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <Button
                          type="button"
                          onClick={() =>
                            handleDeleteMood(record)
                          }
                          className="rounded-xl border-0 bg-gradient-to-r from-[#c989a1] to-[#b97891] px-5 text-white shadow-[0_10px_24px_rgba(185,120,145,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#bd7e97] hover:to-[#aa6d85] hover:shadow-[0_14px_32px_rgba(185,120,145,0.24)]"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Record
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}