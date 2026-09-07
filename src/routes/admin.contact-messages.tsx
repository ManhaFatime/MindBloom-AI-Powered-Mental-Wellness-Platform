import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MailOpen,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/contact-messages")({
  head: () => ({
    meta: [
      { title: "Contact Messages — MindBloom Admin" },
      {
        name: "description",
        content:
          "Review, mark as read and delete MindBloom contact messages.",
      },
    ],
  }),
  component: AdminContactMessagesPage,
});

type ContactMessage = {
  id: number;
  user_id: number | null;
  fullname: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  profile_image?: string;
  created_at: string;
};

type AdminUser = {
  id: number;
  fullname: string;
  email: string;
  role: "admin";
};

function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [processingId, setProcessingId] =
    useState<number | null>(null);

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
        const parsedUser: AdminUser = JSON.parse(savedUser);

        if (parsedUser.role !== "admin") {
          await showError(
            "Access Denied",
            "Only MindBloom administrators can view contact messages."
          );
          window.location.href = "/dashboard";
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error("Admin contact session error:", error);
        localStorage.removeItem("user");
        await showError(
          "Session Error",
          "Your administrator session is invalid. Please log in again."
        );
        window.location.href = "/login";
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (checkingAccess) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost/api/admin/get_contact_messages.php",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!data.success) {
          await showError(
            "Unable to Load Messages",
            data.message || "Contact messages could not be loaded."
          );
          return;
        }

        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (error) {
        console.error("Contact messages loading error:", error);
        await showError(
          "Connection Error",
          "MindBloom could not load contact messages. Please check Apache and MySQL."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [checkingAccess]);

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return messages;

    return messages.filter((message) =>
      [
        message.fullname,
        message.email,
        message.subject,
        message.message,
        message.status,
      ].some((value) =>
        (value || "").toLowerCase().includes(keyword)
      )
    );
  }, [messages, search]);

  const unreadCount = messages.filter(
    (message) => message.status === "unread"
  ).length;

  const formatDate = (dateValue: string) => {
    const parsedDate = new Date(dateValue.replace(" ", "T"));

    if (Number.isNaN(parsedDate.getTime())) return dateValue;

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsedDate);
  };

  const getAdminEmail = () => {
    const savedAdmin = localStorage.getItem("user");
    if (!savedAdmin) return "";

    try {
      return JSON.parse(savedAdmin).email || "";
    } catch {
      return "";
    }
  };

  const markAsRead = async (message: ContactMessage) => {
    if (message.status === "read") return;

    const adminEmail = getAdminEmail();

    if (!adminEmail) {
      await showError(
        "Session Error",
        "Administrator session was not found."
      );
      return;
    }

    try {
      setProcessingId(message.id);

      const response = await fetch(
        "http://localhost/api/admin/mark_contact_read.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message_id: message.id,
            admin_email: adminEmail,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Update Message",
          data.message ||
            "The contact message could not be marked as read."
        );
        return;
      }

      const updatedMessage = {
        ...message,
        status: "read" as const,
      };

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? updatedMessage : item
        )
      );

      setSelectedMessage(updatedMessage);
    } catch (error) {
      console.error("Mark contact read error:", error);
      await showError(
        "Connection Error",
        "MindBloom could not update this message."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (message.status === "unread") {
      await markAsRead(message);
    }
  };

  const deleteMessage = async (message: ContactMessage) => {
    const confirmed = await showConfirm(
      "Delete This Message?",
      `"${message.subject}" from ${message.fullname} will be permanently removed.`,
      "Yes, Delete",
      "Cancel"
    );

    if (!confirmed) return;

    const adminEmail = getAdminEmail();

    if (!adminEmail) {
      await showError(
        "Session Error",
        "Administrator session was not found."
      );
      return;
    }

    try {
      setProcessingId(message.id);

      const response = await fetch(
        "http://localhost/api/admin/delete_contact_message.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message_id: message.id,
            admin_email: adminEmail,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Delete Message",
          data.message || "The contact message could not be deleted."
        );
        return;
      }

      setMessages((current) =>
        current.filter((item) => item.id !== message.id)
      );

      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }

      await showSuccess(
        "Message Deleted",
        data.message ||
          "The contact message was deleted successfully."
      );
    } catch (error) {
      console.error("Delete contact message error:", error);
      await showError(
        "Connection Error",
        "MindBloom could not delete this message."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[30px] border border-[#dfe2ef] bg-white/92 px-10 py-12 text-center shadow-[0_22px_60px_rgba(120,126,190,0.12)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_60px_rgba(0,0,0,0.30)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

          <p className="mt-4 text-sm text-[#7b869a] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

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
                  <Mail className="h-4 w-4" />
                  Website Contact Inbox
                </span>

                <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] sm:text-5xl dark:text-[#edf0fa]">
                  Contact{" "}
                  <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                    Messages
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-[#65718a] dark:text-[#939db3]">
                  Review website enquiries, open unread messages
                  and remove records that are no longer needed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-[#dce0eb] bg-white/82 px-6 py-4 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/88">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b869a] dark:text-[#939db3]">
                    Total
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-[#8174d2] dark:text-[#b1a7f1]">
                    {loading ? "..." : messages.length}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#f0dce6] bg-[#fbf3f7]/92 px-6 py-4 shadow-soft dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a27590] dark:text-[#d9a0b5]">
                    Unread
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-[#ad6983] dark:text-[#e2a0b8]">
                    {loading ? "..." : unreadCount}
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
              placeholder="Search by sender, email, subject, message or status..."
              className="h-14 rounded-2xl border-[#ddd8f7] bg-white pl-14 text-[#273149] placeholder:text-[#9aa2b3] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="mt-8 flex min-h-72 items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />
              <p className="mt-4 text-[#7b869a] dark:text-[#939db3]">
                Loading contact messages...
              </p>
            </div>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 px-6 text-center backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
              <Mail className="h-8 w-8" />
            </div>

            <h2 className="mt-5 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
              No Messages Found
            </h2>

            <p className="mt-2 text-[#7b869a] dark:text-[#939db3]">
              Website contact submissions will appear here.
            </p>
          </Card>
        ) : (
          <div className="mt-8 grid gap-5">
            {filteredMessages.map((message) => {
              const isUnread = message.status === "unread";

              const profileImageUrl = message.profile_image
                ? `http://localhost/api/${message.profile_image}`
                : "";

              const processing = processingId === message.id;

              return (
                <Card
                  key={message.id}
                  className={`group overflow-hidden rounded-[28px] border p-5 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(120,126,190,0.14)] sm:p-6 dark:shadow-[0_16px_42px_rgba(0,0,0,0.22)] dark:hover:shadow-[0_22px_52px_rgba(0,0,0,0.30)] ${
                    isUnread
                      ? "border-[#ddd8f7] bg-gradient-to-r from-[#f4f1ff]/95 via-white/92 to-[#edf7ff]/92 dark:border-[#a99df0]/18 dark:from-[#2a3049] dark:via-[#272e45] dark:to-[#242f47]"
                      : "border-[#dfe2ec] bg-white/92 dark:border-white/8 dark:bg-[#252d43]/94 dark:hover:bg-[#293249]"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <button
                      type="button"
                      onClick={() => openMessage(message)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start gap-4">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={message.fullname}
                            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-white object-cover shadow-soft dark:border-white/15"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                            <UserRound className="h-6 w-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate font-display text-xl font-bold text-[#273149] dark:text-[#edf0fa]">
                              {message.subject}
                            </h2>

                            <span
                              className={
                                isUnread
                                  ? "inline-flex items-center rounded-full border border-[#efdce5] bg-[#fbf3f7] px-3 py-1 text-xs font-bold text-[#ad6983] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/9 dark:text-[#e2a0b8]"
                                  : "inline-flex items-center rounded-full border border-[#d7eee6] bg-[#eaf9f5] px-3 py-1 text-xs font-bold text-[#4c9d8a] dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10 dark:text-[#8ed7c7]"
                              }
                            >
                              {isUnread ? (
                                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              {message.status}
                            </span>
                          </div>

                          <p className="mt-2 truncate text-sm font-semibold text-[#59657b] dark:text-[#c7cede]">
                            {message.fullname}
                            <span className="font-normal text-[#8a94a8] dark:text-[#939db3]">
                              {" "}
                              — {message.email}
                            </span>
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#758096] dark:text-[#a7b0c2]">
                            {message.message}
                          </p>

                          <p className="mt-3 text-xs font-semibold text-[#8174d2] dark:text-[#a99df0]">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openMessage(message)}
                        disabled={processing}
                        className="rounded-xl border-[#ddd8f7] bg-[#f5f3ff] text-[#776bc8] hover:bg-[#eeeaff] dark:border-white/10 dark:bg-white/6 dark:text-[#b7acf5] dark:hover:bg-white/10"
                      >
                        {isUnread ? (
                          <MailOpen className="mr-2 h-4 w-4" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        View Message
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => deleteMessage(message)}
                        disabled={processing || processingId !== null}
                        className="rounded-xl border-[#efdce5] bg-[#fbf3f7] text-[#ad6983] hover:bg-[#f8eaf1] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/8 dark:text-[#e2a0b8] dark:hover:bg-[#d48aa5]/12"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {processing ? "Processing..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-[#273149]/35 px-4 py-6 backdrop-blur-sm sm:py-10 dark:bg-black/60">
          <Card className="relative my-auto w-full max-w-2xl rounded-[30px] border border-[#dfe2ed] bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] p-7 shadow-[0_28px_80px_rgba(120,126,190,0.20)] dark:border-white/10 dark:from-[#252d43] dark:via-[#20283d] dark:to-[#1c263a] dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dddfea] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] shadow-soft dark:border-white/10 dark:bg-white/6 dark:text-[#b7acf5]">
                  <MailOpen className="h-4 w-4" />
                  Contact Message
                </span>

                <h2 className="mt-4 font-display text-3xl font-bold text-[#273149] dark:text-[#edf0fa]">
                  {selectedMessage.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#8174d2] shadow-soft transition hover:bg-white dark:bg-white/6 dark:text-[#a99df0] dark:hover:bg-white/10"
                aria-label="Close message"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#dfe2eb] bg-white/88 p-5 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/80">
              <div className="flex flex-col gap-2 text-sm text-[#59657b] sm:flex-row sm:items-center sm:justify-between dark:text-[#a7b0c2]">
                <div>
                  <p className="font-bold text-[#273149] dark:text-[#edf0fa]">
                    {selectedMessage.fullname}
                  </p>

                  <p className="mt-1 dark:text-[#939db3]">
                    {selectedMessage.email}
                  </p>
                </div>

                <p className="text-xs font-semibold text-[#8174d2] dark:text-[#a99df0]">
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-[#dfe2eb] bg-white/92 p-5 shadow-inner dark:border-white/8 dark:bg-white/5">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4f5b73] dark:text-[#c2c9d8]">
                {selectedMessage.message}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl border-[#ddd8f7] bg-white/80 dark:border-white/10 dark:bg-white/6 dark:text-[#c9cfdd] dark:hover:bg-white/10"
              >
                Close
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-5 text-sm font-semibold text-white shadow-soft"
                >
                  Reply by Email
                </a>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => deleteMessage(selectedMessage)}
                  disabled={processingId !== null}
                  className="rounded-xl border-[#efdce5] bg-[#fbf3f7] text-[#ad6983] hover:bg-[#f8eaf1] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/8 dark:text-[#e2a0b8] dark:hover:bg-[#d48aa5]/12"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Message
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}