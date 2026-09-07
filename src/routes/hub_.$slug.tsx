import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clock,
  Heart,
  LoaderCircle,
  Newspaper,
  Share2,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/hub_/$slug")({
  component: ArticlePage,
});

type WellnessPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  content: string;
  image: string;
  author: string;
  reading_time: string;
  status: "published" | "draft";
  published_at: string | null;
  created_at: string;
};

type SavedUser = {
  id: number;
  fullname: string;
  email: string;
  role?: "user" | "admin";
};

function ArticlePage() {
  const { slug } = Route.useParams();

  const [posts, setPosts] =
    useState<WellnessPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [liked, setLiked] =
    useState(false);

  const [bookmarked, setBookmarked] =
    useState(false);

  const [likeCount, setLikeCount] =
    useState(0);

  const [interactionLoading, setInteractionLoading] =
    useState(false);

  const [shareMessage, setShareMessage] =
    useState("");

  const currentUser = useMemo<SavedUser | null>(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost/api/get_wellness_posts.php",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!data.success) {
          await showError(
            "Unable to Load Article",
            data.message ||
              "The Wellness Hub article could not be loaded."
          );
          return;
        }

        setPosts(
          Array.isArray(data.posts)
            ? data.posts
            : []
        );
      } catch (error) {
        console.error(
          "Wellness article loading error:",
          error
        );

        await showError(
          "Connection Error",
          "MindBloom could not connect to the Wellness Hub service."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const article = useMemo(
    () =>
      posts.find(
        (item) => item.slug === slug
      ),
    [posts, slug]
  );

  useEffect(() => {
    if (!article) {
      return;
    }

    const loadInteractions = async () => {
      try {
        const response = await fetch(
          "http://localhost/api/user/get_wellness_interactions.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id:
                currentUser?.role === "user"
                  ? currentUser.id
                  : 0,
              post_id: article.id,
            }),
          }
        );

        const data = await response.json();

        if (!data.success) {
          console.error(
            "Interaction loading failed:",
            data.message
          );
          return;
        }

        setLiked(Boolean(data.liked));
        setBookmarked(
          Boolean(data.bookmarked)
        );
        setLikeCount(
          Number(data.like_count) || 0
        );
      } catch (error) {
        console.error(
          "Interaction loading error:",
          error
        );
      }
    };

    loadInteractions();
  }, [article, currentUser]);

  const relatedArticles = useMemo(() => {
    if (!article) {
      return [];
    }

    return posts
      .filter(
        (item) =>
          item.slug !== article.slug &&
          item.category === article.category
      )
      .slice(0, 3);
  }, [article, posts]);

  const paragraphs = useMemo(() => {
    if (!article?.content) {
      return [];
    }

    return article.content
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) =>
        paragraph.trim()
      )
      .filter(Boolean);
  }, [article]);

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(
      value.replace(" ", "T")
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return value;
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

  const requireUserLogin = async (
    action: string
  ) => {
    if (
      currentUser &&
      currentUser.role === "user"
    ) {
      return true;
    }

    await showError(
      "Login Required",
      `Please login with a user account to ${action} this article.`
    );

    window.location.href = "/login";
    return false;
  };

  async function handleLike() {
    if (!article || interactionLoading) {
      return;
    }

    const allowed =
      await requireUserLogin("like");

    if (!allowed || !currentUser) {
      return;
    }

    try {
      setInteractionLoading(true);

      const response = await fetch(
        "http://localhost/api/user/toggle_wellness_like.php",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            post_id: article.id,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Update Like",
          data.message ||
            "The article like could not be updated."
        );
        return;
      }

      setLiked(Boolean(data.liked));
      setLikeCount(
        Number(data.like_count) || 0
      );
    } catch (error) {
      console.error(
        "Like update error:",
        error
      );

      await showError(
        "Connection Error",
        "Could not update this article like."
      );
    } finally {
      setInteractionLoading(false);
    }
  }

  async function handleBookmark() {
    if (!article || interactionLoading) {
      return;
    }

    const allowed =
      await requireUserLogin("save");

    if (!allowed || !currentUser) {
      return;
    }

    try {
      setInteractionLoading(true);

      const response = await fetch(
        "http://localhost/api/user/toggle_wellness_bookmark.php",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            post_id: article.id,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Save Article",
          data.message ||
            "The article could not be saved."
        );
        return;
      }

      setBookmarked(
        Boolean(data.bookmarked)
      );

      await showSuccess(
        data.bookmarked
          ? "Article Saved"
          : "Article Removed",
        data.message
      );
    } catch (error) {
      console.error(
        "Bookmark update error:",
        error
      );

      await showError(
        "Connection Error",
        "Could not update the saved article."
      );
    } finally {
      setInteractionLoading(false);
    }
  }

  async function handleShare() {
    if (!article) {
      return;
    }

    const shareData = {
      title: article.title,
      text: article.short_description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );

        setShareMessage(
          "Article shared successfully."
        );
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setShareMessage(
          "Article link copied."
        );
      }
    } catch (error) {
      console.error(
        "Share error:",
        error
      );

      setShareMessage(
        "Article could not be shared."
      );
    }

    window.setTimeout(() => {
      setShareMessage("");
    }, 2500);
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />

          <p className="mt-4 text-muted-foreground">
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="glass-strong rounded-3xl border-white/60 dark:border-white/8 p-10 text-center shadow-glass">
          <h1 className="font-display text-3xl font-bold">
            Article not found
          </h1>

          <p className="mt-3 text-muted-foreground">
            The article you are looking for may have been moved, unpublished or removed.
          </p>

          <Link
            to="/hub"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wellness Hub
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/hub"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Wellness Hub
      </Link>

      <article className="mt-7">
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-glass">
          {article.image ? (
            <img
              src={`http://localhost/api/${article.image}`}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lavender/50 via-sky/40 to-mint/40">
              <Newspaper className="h-20 w-20 text-primary" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 flex min-h-[420px] items-end p-6 sm:p-10 lg:p-14">
            <div className="max-w-4xl text-white">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
                {article.category}
              </span>

              <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
                {article.title}
              </h1>

              <p className="mt-4 max-w-3xl text-base text-white/85 sm:text-lg">
                {article.short_description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Card className="glass-strong rounded-3xl border-white/60 dark:border-white/8 p-6 shadow-glass sm:p-9">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border/50 pb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                {article.author ||
                  "MindBloom Wellness Team"}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDate(
                  article.published_at ||
                    article.created_at
                )}
              </span>

              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {article.reading_time ||
                  "5 min"}{" "}
                read
              </span>
            </div>

            <div className="mt-8 space-y-6">
              {paragraphs.map(
                (paragraph, index) => (
                  <p
                    key={`${article.slug}-${index}`}
                    className="text-base leading-8 text-foreground/85 sm:text-lg"
                  >
                    {paragraph}
                  </p>
                )
              )}
            </div>

            <div className="mt-10 border-t border-border/50 pt-7">
              <p className="text-sm leading-6 text-muted-foreground">
                This article is for general wellness education only and is not a replacement for professional medical or mental health care.
              </p>
            </div>
          </Card>

          <aside className="space-y-5">
            <Card className="glass rounded-3xl border-white/60 dark:border-white/8 p-5 shadow-card">
              <h2 className="font-display text-xl font-semibold">
                Article actions
              </h2>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={
                    interactionLoading
                  }
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    liked
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-border/60 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart
                      className={`h-5 w-5 ${
                        liked
                          ? "fill-current"
                          : ""
                      }`}
                    />

                    {liked
                      ? "Liked"
                      : "Like article"}
                  </span>

                  <span>{likeCount}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookmark}
                  disabled={
                    interactionLoading
                  }
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    bookmarked
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/60 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10"
                  }`}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}

                  {bookmarked
                    ? "Saved"
                    : "Save article"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-2xl border border-border/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white dark:hover:bg-white/10"
                >
                  <Share2 className="h-5 w-5" />
                  Share article
                </button>
              </div>

              {shareMessage && (
                <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
                  {shareMessage}
                </p>
              )}
            </Card>

            <Card className="glass rounded-3xl border-white/60 dark:border-white/8 p-5 shadow-card">
              <h2 className="font-display text-xl font-semibold">
                Quick reminder
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Take your time while reading. Pause, breathe, and return later whenever you need.
              </p>
            </Card>
          </aside>
        </div>

        {relatedArticles.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Keep exploring
                </p>

                <h2 className="mt-2 font-display text-3xl font-bold">
                  Related articles
                </h2>
              </div>

              <Link
                to="/hub"
                className="hidden text-sm font-semibold text-primary sm:inline-flex"
              >
                View all articles
              </Link>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map(
                (related) => (
                  <Link
                    key={related.id}
                    to="/hub/$slug"
                    params={{
                      slug: related.slug,
                    }}
                    className="group"
                  >
                    <Card className="glass h-full overflow-hidden border-white/60 dark:border-white/8 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
                      <div className="h-44 overflow-hidden">
                        {related.image ? (
                          <img
                            src={`http://localhost/api/${related.image}`}
                            alt={related.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-lavender/50 via-sky/40 to-mint/40">
                            <Newspaper className="h-12 w-12 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                          {related.category}
                        </span>

                        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                          {related.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {
                            related.short_description
                          }
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />

                          {related.reading_time ||
                            "5 min"}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              )}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}