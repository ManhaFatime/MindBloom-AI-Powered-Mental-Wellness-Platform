import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Clock,
  Loader2,
  MessageCircle,
  Sparkles,
  Trash2,
  TriangleAlert,
  User,
  X,
} from "lucide-react";

export const Route = createFileRoute("/chat-history")({
  head: () => ({
    meta: [{ title: "Chat History — MindBloom" }],
  }),
  component: ChatHistoryPage,
});

type Conversation = {
  id: number | string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  id: number | string;
  conversation_id: number | string;
  user_id: number | string;
  sender: "user" | "bot";
  message: string;
  created_at: string;
};

function ChatHistoryPage() {
  const [userId, setUserId] = useState<number | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [conversationError, setConversationError] = useState("");
  const [messageError, setMessageError] = useState("");

  // Delete modal states
  const [conversationToDelete, setConversationToDelete] =
    useState<Conversation | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setLoadingConversations(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const id = Number(user?.id);

      if (id && !Number.isNaN(id)) {
        setUserId(id);
      } else {
        setLoadingConversations(false);
      }
    } catch {
      setUserId(null);
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    async function loadConversations() {
      try {
        setLoadingConversations(true);
        setConversationError("");

        const response = await fetch(
          `http://localhost/api/chat/get_conversations.php?user_id=${userId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`,
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load conversations.",
          );
        }

        const loadedConversations: Conversation[] =
          data.conversations || [];

        setConversations(loadedConversations);

        if (loadedConversations.length === 0) {
          setSelectedConversationId(null);
          setMessages([]);
          return;
        }

        const selectedStillExists = loadedConversations.some(
          (conversation) =>
            Number(conversation.id) === selectedConversationId,
        );

        if (!selectedConversationId || !selectedStillExists) {
          setSelectedConversationId(
            Number(loadedConversations[0].id),
          );
        }
      } catch (error) {
        console.error("Conversation history error:", error);

        setConversationError(
          "Your previous conversations could not be loaded.",
        );
      } finally {
        setLoadingConversations(false);
      }
    }

    void loadConversations();
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedConversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setMessageError("");

        const response = await fetch(
          `http://localhost/api/chat/get_messages.php?user_id=${userId}&conversation_id=${selectedConversationId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`,
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load messages.",
          );
        }

        setMessages(data.messages || []);
      } catch (error) {
        console.error("Chat messages error:", error);

        setMessageError(
          "Messages from this conversation could not be loaded.",
        );

        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [userId, selectedConversationId]);

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) =>
          Number(conversation.id) === selectedConversationId,
      ) || null
    );
  }, [conversations, selectedConversationId]);

  function formatDate(value: string) {
    if (!value) {
      return "";
    }

    const normalizedValue = value.includes("T")
      ? value
      : value.replace(" ", "T");

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  function selectConversation(conversationId: number | string) {
    setSelectedConversationId(Number(conversationId));
  }

  function openDeleteModal(conversation: Conversation) {
    setDeleteError("");
    setConversationToDelete(conversation);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setConversationToDelete(null);
    setDeleteError("");
  }

  async function deleteConversation() {
    if (!userId || !conversationToDelete || deleting) {
      return;
    }

    const deleteId = Number(conversationToDelete.id);

    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch(
        "http://localhost/api/chat/delete_conversation.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            conversation_id: deleteId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Delete request failed with status ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to delete conversation.",
        );
      }

      const remainingConversations = conversations.filter(
        (conversation) => Number(conversation.id) !== deleteId,
      );

      setConversations(remainingConversations);

      // If the deleted conversation was currently open,
      // automatically open the next available conversation.
      if (selectedConversationId === deleteId) {
        if (remainingConversations.length > 0) {
          setSelectedConversationId(
            Number(remainingConversations[0].id),
          );
        } else {
          setSelectedConversationId(null);
          setMessages([]);
        }
      }

      setConversationToDelete(null);
    } catch (error) {
      console.error("Delete conversation error:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Conversation could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Bloom AI
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold text-foreground">
            Chat History
          </h1>

          <p className="mt-2 text-muted-foreground">
            Revisit your previous conversations with Bloom AI.
          </p>
        </div>

        {loadingConversations && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading your conversations...
            </div>
          </div>
        )}

        {!loadingConversations && conversationError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
            {conversationError}
          </div>
        )}

        {!loadingConversations &&
          !conversationError &&
          conversations.length === 0 && (
            <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-sm">
              <MessageCircle className="mx-auto h-12 w-12 text-primary/60" />

              <h2 className="mt-4 text-xl font-semibold text-foreground">
                No conversations yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Start chatting with Bloom AI and your conversations will
                appear here.
              </p>
            </div>
          )}

        {!loadingConversations &&
          !conversationError &&
          conversations.length > 0 && (
            <div className="grid min-h-[650px] gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
              {/* LEFT CONVERSATIONS */}
              <aside className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                <div className="border-b border-border/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MessageCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-foreground">
                        Conversations
                      </h2>

                      <p className="text-xs text-muted-foreground">
                        {conversations.length} saved chat
                        {conversations.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[590px] space-y-2 overflow-y-auto p-3">
                  {conversations.map((conversation) => {
                    const isSelected =
                      Number(conversation.id) ===
                      selectedConversationId;

                    return (
                      <div
                        key={conversation.id}
                        className={`group flex items-center gap-1 rounded-2xl border p-1 transition ${
                          isSelected
                            ? "border-primary/40 bg-primary/10 shadow-sm"
                            : "border-transparent hover:border-border hover:bg-muted/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            selectConversation(conversation.id)
                          }
                          className="min-w-0 flex-1 rounded-xl p-3 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold text-foreground">
                                {conversation.title ||
                                  "New Conversation"}
                              </h3>

                              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3 shrink-0" />

                                <span className="truncate">
                                  {formatDate(
                                    conversation.updated_at,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* DELETE ICON */}
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(conversation)
                          }
                          className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                          title="Delete conversation"
                          aria-label={`Delete ${conversation.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* RIGHT CHAT */}
              <section className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                <div className="border-b border-border/60 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-foreground">
                        {selectedConversation?.title ||
                          "Conversation"}
                      </h2>

                      {selectedConversation && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Last updated{" "}
                          {formatDate(
                            selectedConversation.updated_at,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-6 sm:px-6">
                  {loadingMessages && (
                    <div className="flex min-h-[420px] items-center justify-center">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        Loading messages...
                      </div>
                    </div>
                  )}

                  {!loadingMessages && messageError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                      {messageError}
                    </div>
                  )}

                  {!loadingMessages &&
                    !messageError &&
                    messages.length === 0 && (
                      <div className="flex min-h-[420px] items-center justify-center">
                        <div className="max-w-sm text-center">
                          <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground/50" />

                          <h3 className="mt-3 font-semibold text-foreground">
                            No messages found
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            This conversation does not contain any
                            saved messages yet.
                          </p>
                        </div>
                      </div>
                    )}

                  {!loadingMessages &&
                    !messageError &&
                    messages.length > 0 && (
                      <div className="mx-auto flex max-w-3xl flex-col gap-5">
                        {messages.map((message) => {
                          const isUser = message.sender === "user";

                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-2.5 ${
                                isUser
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {!isUser && (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <Bot className="h-4 w-4" />
                                </div>
                              )}

                              <div
                                className={`flex max-w-[82%] flex-col sm:max-w-[72%] ${
                                  isUser
                                    ? "items-end"
                                    : "items-start"
                                }`}
                              >
                                <div
                                  className={`whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-sm leading-6 ${
                                    isUser
                                      ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
                                      : "rounded-bl-md border border-border/60 bg-background text-foreground shadow-sm"
                                  }`}
                                >
                                  {message.message}
                                </div>

                                <span className="mt-1.5 px-1 text-[10px] text-muted-foreground">
                                  {formatDate(
                                    message.created_at,
                                  )}
                                </span>
                              </div>

                              {isUser && (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                  <User className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </section>
            </div>
          )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {conversationToDelete && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-2xl dark:border-white/10"
          >
            {/* Top decoration */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Close delete confirmation"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-7 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <TriangleAlert className="h-7 w-7" />
              </div>

              <h2
                id="delete-chat-title"
                className="mt-5 font-display text-2xl font-bold text-foreground"
              >
                Delete this chat?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You are about to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  “{conversationToDelete.title || "New Conversation"}”
                </span>
                .
              </p>

              <div className="mt-4 rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
                <p className="text-sm leading-6 text-red-600 dark:text-red-400">
                  This will permanently remove the conversation and all
                  messages inside it. This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {deleteError}
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void deleteConversation()}
                  disabled={deleting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Chat
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}