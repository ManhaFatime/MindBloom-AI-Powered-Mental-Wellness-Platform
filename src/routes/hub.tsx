import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  LoaderCircle,
  Newspaper,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/SectionHeader";
import { showError } from "@/lib/sweetAlert";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Wellness Hub — MindBloom" },
      {
        name: "description",
        content:
          "Articles, meditation guides, and expert advice for anxiety, stress, sleep, and positive thinking.",
      },
    ],
  }),
  component: HubPage,
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

function HubPage() {
  const [posts, setPosts] = useState<WellnessPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

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
            "Unable to Load Wellness Hub",
            data.message || "Wellness Hub articles could not be loaded."
          );
          return;
        }

        const loadedPosts = Array.isArray(data.posts)
          ? data.posts
          : [];

        setPosts(loadedPosts);
        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : []
        );
      } catch (error) {
        console.error("Wellness Hub loading error:", error);

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

  const categoryOptions = useMemo(
    () => ["All", ...categories],
    [categories]
  );

  const filtered = useMemo(
    () =>
      active === "All"
        ? posts
        : posts.filter(
            (article) => article.category === active
          ),
    [active, posts]
  );

  const featured = filtered[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Wellness Hub"
        title={
          <>
            Read, learn,{" "}
            <span className="text-gradient">breathe deeper</span>
          </>
        }
        subtitle="Carefully curated guides, expert advice, and bite-sized reads to support your mental wellness."
      />

      {loading ? (
        <Card className="glass-strong mt-12 flex min-h-72 items-center justify-center rounded-3xl border-white/60 dark:border-white/8 shadow-glass">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-11 w-11 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Loading Wellness Hub articles...
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  active === category
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "glass border-white/60 dark:border-white/8 text-foreground/80 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {featured && (
            <Card className="glass-strong mt-10 overflow-hidden border-white/60 dark:border-white/8 shadow-glass">
              <div className="grid md:grid-cols-2">
                <div className="relative min-h-64 overflow-hidden">
                  {featured.image ? (
                    <img
                      src={`http://localhost/api/${featured.image}`}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lavender/50 via-sky/40 to-mint/40">
                      <Newspaper className="h-16 w-16 text-primary" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                  <div className="relative z-10 flex min-h-64 items-end p-10">
                    <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
                      Featured · {featured.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-8">
                  <h3 className="font-display text-2xl font-bold leading-tight lg:text-3xl">
                    {featured.title}
                  </h3>

                  <p className="mt-3 text-muted-foreground">
                    {featured.short_description}
                  </p>

                  <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featured.reading_time || "5 min"}
                    </span>

                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Article
                    </span>
                  </div>

                  <Link
                    to="/hub/$slug"
                    params={{ slug: featured.slug }}
                    className="mt-5 inline-flex w-fit items-center gap-1.5 font-semibold text-primary transition hover:gap-2.5"
                  >
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(1).map((article) => (
              <Link
                key={article.id}
                to="/hub/$slug"
                params={{ slug: article.slug }}
                className="group"
              >
                <Card className="glass h-full min-h-[430px] overflow-hidden border-white/60 dark:border-white/8 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
                  <div className="relative h-56 overflow-hidden sm:h-64">
                    {article.image ? (
                      <img
                        src={`http://localhost/api/${article.image}`}
                        alt={article.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-lavender/50 via-sky/40 to-mint/40">
                        <Newspaper className="h-14 w-14 text-primary" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    <span className="absolute bottom-5 left-5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {article.short_description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {article.reading_time || "5 min"}
                      </span>

                      <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card className="glass-strong mt-10 rounded-3xl border-white/60 dark:border-white/8 p-10 text-center shadow-glass">
              <h3 className="font-display text-2xl font-semibold">
                No articles found
              </h3>

              <p className="mt-2 text-muted-foreground">
                There are currently no published articles in this category.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}