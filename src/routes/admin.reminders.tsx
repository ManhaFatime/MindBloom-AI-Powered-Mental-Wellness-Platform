import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  FileQuestion,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/reminders")({
  head: () => ({
    meta: [
      { title: "Manage Reminders — MindBloom Admin" },
      {
        name: "description",
        content: "Assign, edit and delete MindBloom user reminders.",
      },
    ],
  }),
  component: AdminRemindersPage,
});

type ReminderType = "exercise" | "assessment" | "general";

type MindBloomUser = {
  id: number;
  fullname: string;
  email: string;
  role: "user" | "admin";
  profile_image?: string;
};

type ReminderRecord = {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  profile_image?: string;
  reminder_type: ReminderType;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string | null;
  status: "pending" | "completed";
  email_sent: number;
  created_at: string;
};

function AdminRemindersPage() {
  const [users, setUsers] = useState<MindBloomUser[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] =
    useState<ReminderRecord | null>(null);

  const [userId, setUserId] = useState("");
  const [type, setType] = useState<ReminderType>("exercise");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
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
            "Only administrators can manage reminders."
          );

          window.location.href = "/dashboard";
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("user");

        await showError(
          "Session Error",
          "Your session is invalid. Please log in again."
        );

        window.location.href = "/login";
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (checkingAccess) {
      return;
    }

    const loadData = async () => {
      try {
        const [usersResponse, remindersResponse] = await Promise.all([
          fetch("http://localhost/api/admin/get_users.php", {
            cache: "no-store",
          }),
          fetch("http://localhost/api/admin/get_reminders.php", {
            cache: "no-store",
          }),
        ]);

        const usersData = await usersResponse.json();
        const remindersData = await remindersResponse.json();

        if (!usersData.success) {
          await showError(
            "Unable to Load Users",
            usersData.message || "Users could not be loaded."
          );
        } else {
          setUsers(
            (usersData.users || []).filter(
              (user: MindBloomUser) => user.role === "user"
            )
          );
        }

        if (!remindersData.success) {
          await showError(
            "Unable to Load Reminders",
            remindersData.message || "Reminders could not be loaded."
          );
        } else {
          setReminders(
            Array.isArray(remindersData.reminders)
              ? remindersData.reminders
              : []
          );
        }
      } catch (error) {
        console.error(error);

        await showError(
          "Connection Error",
          "MindBloom could not load reminder data. Please check Apache and MySQL."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [checkingAccess]);

  const filteredReminders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return reminders;
    }

    return reminders.filter((reminder) =>
      [
        reminder.user_name,
        reminder.user_email,
        reminder.title,
        reminder.description,
        reminder.reminder_type,
        reminder.status,
      ].some((value) =>
        (value || "").toLowerCase().includes(keyword)
      )
    );
  }, [reminders, search]);

  const clearForm = () => {
    setEditingReminder(null);
    setUserId("");
    setType("exercise");
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    clearForm();
  };

  const openCreateModal = () => {
    clearForm();
    setShowModal(true);
  };

  const openEditModal = (reminder: ReminderRecord) => {
    setEditingReminder(reminder);
    setUserId(String(reminder.user_id));
    setType(reminder.reminder_type);
    setTitle(reminder.title);
    setDescription(reminder.description || "");
    setDate(reminder.reminder_date);
    setTime(
      reminder.reminder_time
        ? reminder.reminder_time.split(":").slice(0, 2).join(":")
        : ""
    );
    setShowModal(true);
  };

  const handleSaveReminder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!userId || !title.trim() || !date) {
      await showError(
        "Missing Information",
        "Please select a user and enter the reminder title and date."
      );
      return;
    }

    const savedAdmin = localStorage.getItem("user");

    if (!savedAdmin) {
      await showError(
        "Session Error",
        "Administrator session was not found."
      );
      return;
    }

    try {
      setSaving(true);

      const admin = JSON.parse(savedAdmin);
      const isEditing = editingReminder !== null;

      const response = await fetch(
        isEditing
          ? "http://localhost/api/admin/update_reminder.php"
          : "http://localhost/api/admin/add_reminder.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reminder_id: editingReminder?.id,
            user_id: Number(userId),
            reminder_type: type,
            title: title.trim(),
            description: description.trim(),
            reminder_date: date,
            reminder_time: time,
            admin_email: admin.email,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          isEditing
            ? "Unable to Update Reminder"
            : "Unable to Create Reminder",
          data.message ||
            (isEditing
              ? "Reminder could not be updated."
              : "Reminder could not be created.")
        );
        return;
      }

      const selectedUser = users.find(
        (user) => user.id === Number(userId)
      );

      const updatedReminder: ReminderRecord = {
        ...data.reminder,
        profile_image: selectedUser?.profile_image || "",
        email_sent: Number(data.reminder?.email_sent ?? 0),
        created_at:
          editingReminder?.created_at || new Date().toISOString(),
      };

      if (isEditing && editingReminder) {
        setReminders((current) =>
          current.map((reminder) =>
            reminder.id === editingReminder.id
              ? updatedReminder
              : reminder
          )
        );

        closeModal();

        await showSuccess(
          "Reminder Updated 🌸",
          data.message || "The reminder was updated successfully."
        );
      } else {
        setReminders((current) => [
          updatedReminder,
          ...current,
        ]);

        closeModal();

        await showSuccess(
          "Reminder Assigned 🌸",
          data.message || "The reminder was assigned successfully."
        );
      }
    } catch (error) {
      console.error(error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReminder = async (
    reminder: ReminderRecord
  ) => {
    const confirmed = await showConfirm(
      "Delete This Reminder?",
      `"${reminder.title}" will be permanently removed from ${reminder.user_name}'s wellness plan.`,
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
        "Administrator session was not found."
      );
      return;
    }

    try {
      setDeletingId(reminder.id);

      const admin = JSON.parse(savedAdmin);

      const response = await fetch(
        "http://localhost/api/admin/delete_reminder.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reminder_id: reminder.id,
            admin_email: admin.email,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Delete Reminder",
          data.message || "Reminder could not be deleted."
        );
        return;
      }

      setReminders((current) =>
        current.filter(
          (currentReminder) =>
            currentReminder.id !== reminder.id
        )
      );

      await showSuccess(
        "Reminder Deleted",
        data.message || "The reminder was deleted successfully."
      );
    } catch (error) {
      console.error(error);

      await showError(
        "Connection Error",
        "MindBloom could not delete the reminder."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStyle = (reminderType: ReminderType) => {
    if (reminderType === "exercise") {
      return {
        icon: Dumbbell,
        iconClass: "from-[#91d8c5] to-[#79c7e5]",
        badgeClass:
          "border-[#d7eee6] bg-[#eaf9f5] text-[#4c9d8a] dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10 dark:text-[#8ed7c7]",
        label: "Exercise",
      };
    }

    if (reminderType === "assessment") {
      return {
        icon: FileQuestion,
        iconClass: "from-[#e8b8cf] to-[#b9acec]",
        badgeClass:
          "border-[#edd8e4] bg-[#fbf0f6] text-[#a86e91] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/10 dark:text-[#e2a0b8]",
        label: "Assessment",
      };
    }

    return {
      icon: Sparkles,
      iconClass: "from-[#a79cef] to-[#84aceb]",
      badgeClass:
        "border-[#ddd8f7] bg-[#f0edff] text-[#7569c9] dark:border-[#a99df0]/20 dark:bg-[#a99df0]/10 dark:text-[#b9b0f5]",
      label: "General",
    };
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[30px] border border-[#dfe2ef] bg-white/92 px-10 py-12 text-center shadow-[0_22px_60px_rgba(120,126,190,0.12)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_60px_rgba(0,0,0,0.3)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

          <p className="mt-4 text-sm text-[#7b869a] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#ddd7fa]/30 blur-3xl dark:bg-[#7669d5]/8" />
      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#caedf5]/35 blur-3xl dark:bg-[#568fb3]/7" />

      <div className="relative mx-auto max-w-7xl">
        <Card className="relative overflow-hidden rounded-[34px] border border-[#dce0ed] bg-white/90 shadow-[0_26px_75px_rgba(120,126,190,0.13)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]">
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
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dddfea] bg-white/80 px-4 py-2 text-sm font-semibold text-[#8174d2] shadow-soft dark:border-white/10 dark:bg-white/6 dark:text-[#b1a7f1]">
                  <BellRing className="h-4 w-4" />
                  User Reminder Management
                </span>

                <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] sm:text-5xl dark:text-[#edf0fa]">
                  Wellness{" "}
                  <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                    Reminders
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-[#65718a] dark:text-[#939db3]">
                  Assign, edit and delete exercise, assessment and
                  general wellness reminders.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="min-h-14 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white shadow-[0_13px_28px_rgba(132,145,205,0.22)]"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Assign Reminder
                </Button>

                <div className="rounded-[22px] border border-[#dce0eb] bg-white/82 px-6 py-4 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/88">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b869a] dark:text-[#939db3]">
                    Total Reminders
                  </p>

                  <p className="mt-1 font-display text-3xl font-extrabold text-[#8174d2] dark:text-[#b1a7f1]">
                    {loading ? "..." : reminders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-8 rounded-[28px] border border-[#dce0eb] bg-white/88 p-5 shadow-[0_18px_48px_rgba(120,126,190,0.09)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9184dc] dark:text-[#a99df0]" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user, email, title, type or status..."
              className="h-14 rounded-2xl border-[#ddd8f7] bg-white pl-14 text-[#273149] placeholder:text-[#9aa2b3] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="mt-8 flex min-h-72 items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

              <p className="mt-4 text-[#7b869a] dark:text-[#939db3]">
                Loading reminders...
              </p>
            </div>
          </Card>
        ) : filteredReminders.length === 0 ? (
          <Card className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 px-6 text-center backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] shadow-soft">
              <BellRing className="h-8 w-8 text-white" />
            </div>

            <h2 className="mt-5 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
              No Reminders Found
            </h2>

            <p className="mt-2 text-[#7b869a] dark:text-[#939db3]">
              Create the first wellness reminder for a user.
            </p>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {filteredReminders.map((reminder) => {
              const style = getStyle(reminder.reminder_type);
              const Icon = style.icon;

              const profileImageUrl = reminder.profile_image
                ? `http://localhost/api/${reminder.profile_image}`
                : "";

              const deleting = deletingId === reminder.id;

              return (
                <Card
                  key={reminder.id}
                  className="rounded-[30px] border border-[#dfe2ec] bg-white/92 p-6 shadow-[0_18px_48px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(120,126,190,0.14)] dark:border-white/8 dark:bg-[#252d43]/94 dark:shadow-[0_18px_48px_rgba(0,0,0,0.23)] dark:hover:bg-[#293249]"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] bg-gradient-to-br ${style.iconClass} text-white shadow-soft`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style.badgeClass}`}
                        >
                          {style.label}
                        </span>

                        <h2 className="mt-3 font-display text-xl font-bold text-[#273149] dark:text-[#edf0fa]">
                          {reminder.title}
                        </h2>
                      </div>
                    </div>

                    <span
                      className={
                        reminder.status === "completed"
                          ? "inline-flex items-center rounded-full border border-[#d7eee6] bg-[#eaf9f5] px-3 py-1.5 text-xs font-bold text-[#4c9d8a] dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10 dark:text-[#8ed7c7]"
                          : "inline-flex items-center rounded-full border border-[#eee2be] bg-[#fff8e8] px-3 py-1.5 text-xs font-bold text-[#9c7a3f] dark:border-[#d9bd72]/20 dark:bg-[#d9bd72]/10 dark:text-[#e5cb83]"
                      }
                    >
                      {reminder.status === "completed" ? (
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                      )}

                      {reminder.status}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-[#e1e3ed] bg-gradient-to-r from-[#f3f1ff]/90 via-[#edf7ff]/85 to-[#eaf9f4]/85 p-4 dark:border-white/8 dark:from-white/6 dark:via-white/4 dark:to-white/5">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={reminder.user_name}
                        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-soft dark:border-white/15"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                        <UserRound className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#273149] dark:text-[#edf0fa]">
                        {reminder.user_name}
                      </p>

                      <p className="truncate text-xs text-[#7b869a] dark:text-[#939db3]">
                        {reminder.user_email}
                      </p>
                    </div>
                  </div>

                  {reminder.description && (
                    <div className="mt-4 rounded-[20px] border border-[#e1e3ed] bg-white/90 p-4 shadow-inner dark:border-white/8 dark:bg-white/5">
                      <p className="whitespace-pre-line text-sm leading-6 text-[#4f5b73] dark:text-[#c2c9d8]">
                        {reminder.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-[#7b869a] dark:text-[#939db3]">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ff] px-3 py-2 dark:bg-[#a99df0]/10">
                      <CalendarDays className="h-4 w-4 text-[#9184dc] dark:text-[#a99df0]" />

                      {new Date(
                        `${reminder.reminder_date}T00:00:00`
                      ).toLocaleDateString()}
                    </span>

                    {reminder.reminder_time && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] px-3 py-2 dark:bg-[#78b7df]/10">
                        <Clock3 className="h-4 w-4 text-[#6c9fc4] dark:text-[#83bde2]" />

                        {reminder.reminder_time
                          .split(":")
                          .slice(0, 2)
                          .join(":")}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#ebe8f7] pt-5 sm:flex-row sm:justify-end dark:border-white/8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openEditModal(reminder)}
                      disabled={deleting}
                      className="rounded-xl border-[#ddd8f7] bg-[#f5f3ff] text-[#776bc8] hover:bg-[#eeeaff] dark:border-white/10 dark:bg-white/6 dark:text-[#b7acf5] dark:hover:bg-white/10"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Reminder
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        handleDeleteReminder(reminder)
                      }
                      disabled={deleting || deletingId !== null}
                      className="rounded-xl border-[#efdce5] bg-[#fbf3f7] text-[#ad6983] hover:bg-[#f8eaf1] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/8 dark:text-[#e2a0b8] dark:hover:bg-[#d48aa5]/12"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-[#273149]/35 px-4 py-6 backdrop-blur-sm sm:py-10 dark:bg-black/60">
          <Card className="relative my-auto w-full max-w-xl rounded-[30px] border border-[#dfe2ed] bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] p-7 shadow-[0_28px_80px_rgba(120,126,190,0.20)] dark:border-white/10 dark:from-[#252d43] dark:via-[#20283d] dark:to-[#1c263a] dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#273149] dark:text-[#edf0fa]">
                {editingReminder
                  ? "Edit Reminder"
                  : "Assign Reminder"}
              </h2>

              <p className="mt-2 text-sm text-[#65718a] dark:text-[#939db3]">
                {editingReminder
                  ? "Update this user's wellness reminder."
                  : "Create an exercise, assessment or general reminder."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/75 text-[#8174d2] shadow-soft dark:bg-white/6 dark:text-[#a99df0] dark:hover:bg-white/10"
              aria-label="Close reminder form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSaveReminder}
            className="mt-7 space-y-5"
          >
            <div>
              <Label
                htmlFor="reminder-user"
                className="text-[#465168] dark:text-[#c9cfdd]"
              >
                Select User
              </Label>

              <select
                id="reminder-user"
                value={userId}
                onChange={(event) =>
                  setUserId(event.target.value)
                }
                className="mt-2 h-12 w-full rounded-xl border border-[#ddd8f7] bg-white/90 px-4 text-sm text-[#273149] outline-none dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa]"
              >
                <option value="">
                  Choose a user
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.fullname} — {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="reminder-type"
                className="text-[#465168] dark:text-[#c9cfdd]"
              >
                Reminder Type
              </Label>

              <select
                id="reminder-type"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as ReminderType
                  )
                }
                className="mt-2 h-12 w-full rounded-xl border border-[#ddd8f7] bg-white/90 px-4 text-sm text-[#273149] outline-none dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa]"
              >
                <option value="exercise">
                  Exercise
                </option>
                <option value="assessment">
                  Assessment
                </option>
                <option value="general">
                  General
                </option>
              </select>
            </div>

            <div>
              <Label
                htmlFor="reminder-title"
                className="text-[#465168] dark:text-[#c9cfdd]"
              >
                Reminder Title
              </Label>

              <Input
                id="reminder-title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Complete breathing exercise"
                className="mt-2 h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
              />
            </div>

            <div>
              <Label
                htmlFor="reminder-description"
                className="text-[#465168] dark:text-[#c9cfdd]"
              >
                Description
              </Label>

              <textarea
                id="reminder-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add helpful reminder details..."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-[#ddd8f7] bg-white/90 px-4 py-3 text-sm text-[#273149] outline-none placeholder:text-[#9aa2b3] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="reminder-date"
                  className="text-[#465168] dark:text-[#c9cfdd]"
                >
                  Reminder Date
                </Label>

                <Input
                  id="reminder-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="mt-2 h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa]"
                />
              </div>

              <div>
                <Label
                  htmlFor="reminder-time"
                  className="text-[#465168] dark:text-[#c9cfdd]"
                >
                  Reminder Time
                </Label>

                <Input
                  id="reminder-time"
                  type="time"
                  value={time}
                  onChange={(event) =>
                    setTime(event.target.value)
                  }
                  className="mt-2 h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa]"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border-[#ddd8f7] bg-white/75 dark:border-white/10 dark:bg-white/6 dark:text-[#c9cfdd] dark:hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white"
              >
                {saving
                  ? editingReminder
                    ? "Updating..."
                    : "Assigning..."
                  : editingReminder
                    ? "Update Reminder"
                    : "Assign Reminder"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      )}
    </main>
  );
}