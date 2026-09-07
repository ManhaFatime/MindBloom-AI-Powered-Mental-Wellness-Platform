import {
    createFileRoute,
    Link,
    useNavigate,
} from "@tanstack/react-router";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    Brain,
    CalendarDays,
    ChevronDown,
    ClipboardList,
    History,
    Loader2,
    Minus,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute(
    "/assessment-history"
)({
    component: AssessmentHistoryPage,
    head: () => ({
        meta: [
            {
                title:
                    "Assessment History — MindBloom",
            },
            {
                name: "description",
                content:
                    "Review your wellness assessment history and progress.",
            },
        ],
    }),
});

const HISTORY_API =
    "http://localhost/api/user/get_assessment_history.php";

const PROGRESS_API =
    "http://localhost/api/user/get_assessment_progress.php";

type StoredUser = {
    id: number | string;
    fullname?: string;
    email?: string;
    role?: string;
};

type AssessmentAnswer = {
    question: string;
    answer: string;
    value: number;
};

type AssessmentRecord = {
    id: number;
    user_id: number;
    category: string;
    category_name: string;
    score: number;
    wellness_level: string;
    level_key: string | null;
    answers: AssessmentAnswer[];
    ai_summary: string;
    recommendations: string[];
    recommendation_source:
    | "ai"
    | "fallback";
    created_at: string;
};

type CategoryOption = {
    key: string;
    name: string;
};

type HistoryResponse = {
    success: boolean;
    message: string;
    total: number;
    latest_assessment:
    | AssessmentRecord
    | null;
    categories: CategoryOption[];
    history: AssessmentRecord[];
};

type ProgressRecord = {
    id: number;
    category: string;
    category_name: string;
    score: number;
    wellness_level: string;
    created_at: string;
    date_label: string;
};

type CategoryProgress = {
    category: string;
    category_name: string;
    total_assessments: number;
    first_score: number;
    previous_score: number | null;
    latest_score: number;
    overall_change: number;
    latest_change: number;
    trend:
    | "improved"
    | "declined"
    | "stable";
    records: ProgressRecord[];
};

type ProgressResponse = {
    success: boolean;
    message: string;
    progress_message: string;
    latest_assessment:
    | ProgressRecord
    | null;
    total_records: number;
    categories: CategoryProgress[];
    chart_data: ProgressRecord[];
};

function AssessmentHistoryPage() {
    const navigate = useNavigate();

    const [user, setUser] =
        useState<StoredUser | null>(null);

    const [history, setHistory] = useState<
        AssessmentRecord[]
    >([]);

    const [categories, setCategories] =
        useState<CategoryOption[]>([]);

    const [progress, setProgress] =
        useState<CategoryProgress | null>(null);

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState("all");

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Check Logged-in User
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            navigate({
                to: "/login",
            });

            return;
        }

        try {
            const parsedUser: StoredUser =
                JSON.parse(storedUser);

            const userId = Number(parsedUser.id);

            if (!userId || userId <= 0) {
                localStorage.removeItem("user");

                navigate({
                    to: "/login",
                });

                return;
            }

            setUser(parsedUser);
        } catch (error) {
            console.error(
                "User parsing error:",
                error
            );

            localStorage.removeItem("user");

            navigate({
                to: "/login",
            });
        }
    }, [navigate]);

    /*
    |--------------------------------------------------------------------------
    | Load History and Progress
    |--------------------------------------------------------------------------
    */

    const loadAssessmentData =
        useCallback(async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setErrorMessage("");

                const userId = Number(user.id);

                const category =
                    selectedCategory === "all"
                        ? ""
                        : selectedCategory;

                console.log(
                    "Loading assessment history for user:",
                    userId
                );

                const [
                    historyResponse,
                    progressResponse,
                ] = await Promise.all([
                    fetch(HISTORY_API, {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            category,
                            limit: 100,
                        }),
                    }),

                    fetch(PROGRESS_API, {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            category,
                            limit: 100,
                        }),
                    }),
                ]);

                const historyData: HistoryResponse =
                    await historyResponse.json();

                const progressData: ProgressResponse =
                    await progressResponse.json();

                console.log(
                    "Assessment history response:",
                    historyData
                );

                console.log(
                    "Assessment progress response:",
                    progressData
                );

                if (
                    !historyResponse.ok ||
                    !historyData.success
                ) {
                    throw new Error(
                        historyData.message ||
                        "Assessment history could not be loaded."
                    );
                }

                if (
                    !progressResponse.ok ||
                    !progressData.success
                ) {
                    throw new Error(
                        progressData.message ||
                        "Assessment progress could not be loaded."
                    );
                }

                const loadedHistory =
                    historyData.history ?? [];

                setHistory(loadedHistory);

                /*
                 * Categories sirf unfiltered request
                 * par update hongi.
                 */
                if (selectedCategory === "all") {
                    setCategories(
                        historyData.categories ?? []
                    );
                }

                if (
                    progressData.categories?.length >
                    0
                ) {
                    if (
                        selectedCategory === "all"
                    ) {
                        const latestCategory =
                            historyData.latest_assessment
                                ?.category;

                        const latestProgress =
                            progressData.categories.find(
                                (item) =>
                                    item.category ===
                                    latestCategory
                            ) ??
                            progressData.categories[0];

                        setProgress(latestProgress);
                    } else {
                        setProgress(
                            progressData.categories[0]
                        );
                    }
                } else {
                    setProgress(null);
                }
            } catch (error) {
                console.error(
                    "Assessment data error:",
                    error
                );

                setHistory([]);
                setProgress(null);

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while loading your assessment history."
                );
            } finally {
                setLoading(false);
            }
        }, [user, selectedCategory]);

    useEffect(() => {
        if (!user?.id) return;

        loadAssessmentData();
    }, [user, loadAssessmentData]);

    /*
    |--------------------------------------------------------------------------
    | Chart Data
    |--------------------------------------------------------------------------
    */

    const chartData = useMemo(() => {
        if (!progress?.records) {
            return [];
        }

        return progress.records.map(
            (record, index) => ({
                assessmentNumber: index + 1,
                date: record.date_label,
                score: Number(record.score),
                fullDate: record.created_at,
                level: record.wellness_level,
            })
        );
    }, [progress]);

    const selectedCategoryName =
        selectedCategory === "all"
            ? "All Categories"
            : categories.find(
                (category) =>
                    category.key ===
                    selectedCategory
            )?.name ?? selectedCategory;

    /*
    |--------------------------------------------------------------------------
    | Helper Functions
    |--------------------------------------------------------------------------
    */

    function formatDate(dateValue: string) {
        const normalizedDate =
            dateValue.includes("T")
                ? dateValue
                : dateValue.replace(" ", "T");

        const date = new Date(normalizedDate);

        if (
            Number.isNaN(date.getTime())
        ) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    function getScoreStyle(
        score: number
    ) {
        if (score >= 80) {
            return {
                container:
                    "border-emerald-200/70 dark:border-white/8 bg-emerald-50/80 dark:bg-white/5",
                text: "text-emerald-600 dark:text-[#6fc5ad]",
                badge:
                    "bg-emerald-100 dark:bg-white/8 text-emerald-700 dark:text-[#6fc5ad]",
            };
        }

        if (score >= 60) {
            return {
                container:
                    "border-sky-200/70 dark:border-white/8 bg-sky-50/80 dark:bg-white/5",
                text: "text-sky-600 dark:text-[#7ab3e0]",
                badge:
                    "bg-sky-100 dark:bg-white/8 text-sky-700 dark:text-[#7ab3e0]",
            };
        }

        if (score >= 40) {
            return {
                container:
                    "border-amber-200/70 dark:border-white/8 bg-amber-50/80 dark:bg-white/5",
                text: "text-amber-600 dark:text-[#e0b86a]",
                badge:
                    "bg-amber-100 dark:bg-white/8 text-amber-700 dark:text-[#e0b86a]",
            };
        }

        return {
            container:
                "border-rose-200/70 dark:border-white/8 bg-rose-50/80 dark:bg-white/5",
            text: "text-rose-600 dark:text-[#d48aa5]",
            badge:
                "bg-rose-100 dark:bg-white/8 text-rose-700 dark:text-[#d48aa5]",
        };
    }

    function getTrendIcon(
        trend?: CategoryProgress["trend"]
    ) {
        if (trend === "improved") {
            return (
                <TrendingUp className="h-5 w-5 text-emerald-500" />
            );
        }

        if (trend === "declined") {
            return (
                <TrendingDown className="h-5 w-5 text-rose-500" />
            );
        }

        return (
            <Minus className="h-5 w-5 text-muted-foreground" />
        );
    }

    function getProgressMessage() {
        if (!progress) {
            return "Complete an assessment to begin tracking your wellness progress.";
        }

        if (
            progress.total_assessments === 1
        ) {
            return `This is your first ${progress.category_name} assessment. Complete the same assessment again later to see your progress chart.`;
        }

        if (
            progress.overall_change > 0
        ) {
            return `Your ${progress.category_name.toLowerCase()} wellness score improved by ${Math.abs(
                progress.overall_change
            )} points. Keep continuing the habits that are helping you.`;
        }

        if (
            progress.overall_change < 0
        ) {
            return `Your ${progress.category_name.toLowerCase()} wellness score changed by ${Math.abs(
                progress.overall_change
            )} points. Consider focusing on your personalized recommendations.`;
        }

        return `Your ${progress.category_name.toLowerCase()} wellness score is currently stable.`;
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="glass flex flex-col items-center rounded-3xl border border-white/60 dark:border-white/8 px-10 py-8 shadow-card">
                    <Loader2 className="h-9 w-9 animate-spin text-primary" />

                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                        Preparing your wellness
                        history...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-20 pt-28 sm:px-6 lg:px-8">
            {/* Soft Background Decoration */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-primary/10 dark:bg-[#3d2d7a]/15 blur-3xl" />

                <div className="absolute -right-32 top-72 h-80 w-80 rounded-full bg-secondary/20 dark:bg-[#1a3d5c]/15 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/10 dark:bg-[#1a3d4c]/15 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}

                <section className="mb-8">


                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow sm:h-16 sm:w-16">
                                <History className="h-7 w-7" />
                            </div>

                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Your Wellness Journey
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    Assessment{" "}
                                    <span className="text-gradient">
                                        History
                                    </span>
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    Review your previous
                                    results, understand your
                                    patterns and track your
                                    wellness progress over
                                    time.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/assessment"
                            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition duration-300 hover:-translate-y-1 hover:shadow-card lg:self-center"
                        >
                            <Brain className="h-5 w-5" />
                            Take New Assessment
                        </Link>
                    </div>
                </section>

                {/* Filter */}

                <section className="glass-strong mb-8 rounded-3xl border border-white/60 dark:border-white/8 p-5 shadow-card sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Filter assessment
                                category
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Select a category to
                                review its individual
                                score history.
                            </p>
                        </div>

                        <div className="w-full sm:w-80">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="group flex h-12 w-full items-center justify-between rounded-2xl border border-[#d9d3f4] dark:border-white/10 bg-white/85 dark:bg-white/5 px-4 text-left text-sm font-semibold text-[#33405a] dark:text-[#e8eaf5] shadow-soft transition-all duration-300 hover:border-[#b9afea] dark:hover:border-white/15 hover:bg-white dark:hover:bg-white/8 focus:outline-none focus:ring-4 focus:ring-[#a99deb]/15"
                                    >
                                        <span className="truncate">
                                            {selectedCategory === "all"
                                                ? "All Assessments"
                                                : categories.find(
                                                    (category) =>
                                                        category.key === selectedCategory
                                                )?.name ?? selectedCategory}
                                        </span>

                                        <ChevronDown className="h-4 w-4 shrink-0 text-[#8b7fd8] dark:text-[#a99df0] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    sideOffset={8}
                                    className="z-[220] w-[var(--radix-dropdown-menu-trigger-width)] rounded-[22px] border border-[#ded9f4] dark:border-white/10 bg-white/95 dark:bg-[#1c1f3a]/95 p-2 shadow-[0_22px_55px_rgba(112,116,175,0.18)] backdrop-blur-xl"
                                >
                                    <div className="mb-2 rounded-2xl bg-gradient-to-r from-[#f1efff] via-[#edf7ff] to-[#edf9f5] dark:from-white/5 dark:via-white/3 dark:to-white/5 px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7fd8] dark:text-[#a99df0]">
                                            Assessment Category
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#7b869a] dark:text-[#8892a8]">
                                            Choose a category to view its progress.
                                        </p>
                                    </div>

                                    <DropdownMenuItem
                                        onSelect={() =>
                                            setSelectedCategory("all")
                                        }
                                        className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition focus:bg-[#f3f1ff] dark:focus:bg-white/10 focus:text-[#776bc8] dark:focus:text-[#a99df0] ${selectedCategory === "all"
                                            ? "bg-gradient-to-r from-[#eeeaff] to-[#edf7ff] dark:from-white/10 dark:to-white/5 text-[#776bc8] dark:text-[#a99df0]"
                                            : "text-[#536078] dark:text-[#8892a8]"
                                            }`}
                                    >
                                        <div className="flex w-full items-center justify-between gap-3">
                                            <span>
                                                All Assessments
                                            </span>

                                            {selectedCategory === "all" && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8f82dd] text-xs text-white">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    </DropdownMenuItem>

                                    {categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category.key}
                                            onSelect={() =>
                                                setSelectedCategory(
                                                    category.key
                                                )
                                            }
                                            className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition focus:bg-[#f3f1ff] dark:focus:bg-white/10 focus:text-[#776bc8] dark:focus:text-[#a99df0] ${selectedCategory ===
                                                category.key
                                                ? "bg-gradient-to-r from-[#eeeaff] to-[#edf7ff] dark:from-white/10 dark:to-white/5 text-[#776bc8] dark:text-[#a99df0]"
                                                : "text-[#536078] dark:text-[#8892a8]"
                                                }`}
                                        >
                                            <div className="flex w-full items-center justify-between gap-3">
                                                <span>{category.name}</span>

                                                {selectedCategory ===
                                                    category.key && (
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8f82dd] text-xs text-white">
                                                            ✓
                                                        </span>
                                                    )}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>

                {/* Loading */}

                {loading ? (
                    <section className="glass-strong flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/60 dark:border-white/8 p-8 shadow-card">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Loader2 className="h-9 w-9 animate-spin text-primary" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-foreground">
                            Loading your journey
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Please wait while we prepare
                            your assessment progress.
                        </p>
                    </section>
                ) : errorMessage ? (
                    /* Error */

                    <section className="glass-strong rounded-3xl border border-rose-200/70 dark:border-white/8 p-8 text-center shadow-card">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-white/10 text-rose-600 dark:text-[#d48aa5]">
                            <RefreshCw className="h-7 w-7" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-foreground">
                            History could not be loaded
                        </h2>

                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                            {errorMessage}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadAssessmentData
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </section>
                ) : history.length === 0 ? (
                    /* Empty State */

                    <section className="glass-strong relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/8 px-6 py-16 text-center shadow-card sm:py-20">
                        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

                        <div className="relative">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow">
                                <ClipboardList className="h-11 w-11" />
                            </div>

                            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                Start Your Progress
                            </div>

                            <h2 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
                                No assessment history yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                                Complete your first
                                wellness assessment to
                                receive personalized
                                guidance and begin tracking
                                your improvement.
                            </p>

                            <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground">
                                Current logged-in user ID:{" "}
                                <span className="font-bold text-foreground">
                                    {String(user.id)}
                                </span>
                            </p>

                            <Link
                                to="/assessment"
                                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-1"
                            >
                                <Brain className="h-5 w-5" />
                                Start Assessment
                            </Link>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Summary Cards */}

                        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                title="Selected Category"
                                value={
                                    selectedCategoryName
                                }
                                subtitle="Currently displayed progress"
                                icon={
                                    <Brain className="h-5 w-5" />
                                }
                            />

                            <SummaryCard
                                title="Total Assessments"
                                value={String(
                                    selectedCategory === "all"
                                        ? history.length
                                        : progress?.total_assessments ?? 0
                                )}
                                subtitle={
                                    selectedCategory === "all"
                                        ? "Completed across all categories"
                                        : "Completed in this category"
                                }
                                icon={
                                    <ClipboardList className="h-5 w-5" />
                                }
                            />

                            <SummaryCard
                                title="Latest Score"
                                value={`${selectedCategory === "all"
                                    ? Math.round(
                                        Number(history[0]?.score ?? 0)
                                    )
                                    : Math.round(
                                        Number(
                                            progress?.latest_score ?? 0
                                        )
                                    )
                                    }/100`}
                                subtitle={
                                    selectedCategory === "all"
                                        ? `Latest overall result${history[0]?.category_name
                                            ? ` — ${history[0].category_name}`
                                            : ""
                                        }`
                                        : "Latest result in this category"
                                }
                                icon={
                                    <Sparkles className="h-5 w-5" />
                                }
                            />

                            <SummaryCard
                                title="Overall Change"
                                value={
                                    selectedCategory === "all"
                                        ? "Select Category"
                                        : progress
                                            ? `${progress.overall_change > 0
                                                ? "+"
                                                : ""
                                            }${progress.overall_change}`
                                            : "0"
                                }
                                subtitle={
                                    selectedCategory === "all"
                                        ? "Choose one category to compare progress"
                                        : progress?.trend === "improved"
                                            ? "Your score improved"
                                            : progress?.trend === "declined"
                                                ? "Needs more attention"
                                                : "Currently stable"
                                }
                                icon={
                                    selectedCategory === "all"
                                        ? <Brain className="h-5 w-5" />
                                        : getTrendIcon(progress?.trend)
                                }
                            />
                        </section>

                        {/* Chart and Insight */}

                        <section className="mt-8 grid gap-7 xl:grid-cols-[1.5fr_0.7fr]">
                            <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/8 p-5 shadow-card sm:p-7">
                                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                            Progress Analytics
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold text-foreground">
                                            {
                                                selectedCategoryName
                                            }{" "}
                                            Progress
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Higher scores represent
                                            stronger wellness.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
                                        {
                                            chartData.length
                                        }{" "}
                                        recorded result
                                        {chartData.length === 1
                                            ? ""
                                            : "s"}
                                    </div>
                                </div>

                                {chartData.length > 1 ? (
                                    <div className="h-[340px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <AreaChart
                                                data={chartData}
                                                margin={{
                                                    top: 20,
                                                    right: 24,
                                                    left: -12,
                                                    bottom: 8,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="assessmentLineGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="1"
                                                        y2="0"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#9f93eb"
                                                        />

                                                        <stop
                                                            offset="55%"
                                                            stopColor="#82aceb"
                                                        />

                                                        <stop
                                                            offset="100%"
                                                            stopColor="#55bce2"
                                                        />
                                                    </linearGradient>

                                                    <linearGradient
                                                        id="assessmentAreaGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#9f93eb"
                                                            stopOpacity={0.32}
                                                        />

                                                        <stop
                                                            offset="55%"
                                                            stopColor="#82aceb"
                                                            stopOpacity={0.15}
                                                        />

                                                        <stop
                                                            offset="100%"
                                                            stopColor="#55bce2"
                                                            stopOpacity={0.02}
                                                        />
                                                    </linearGradient>
                                                </defs>

                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="#dcd8ee"
                                                    strokeDasharray="5 7"
                                                    opacity={0.55}
                                                />

                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: "#7b869a",
                                                        fontWeight: 600,
                                                    }}
                                                    dy={12}
                                                />

                                                <YAxis
                                                    domain={[0, 100]}
                                                    ticks={[0, 20, 40, 60, 80, 100]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: "#8b94a7",
                                                        fontWeight: 600,
                                                    }}
                                                    width={42}
                                                />

                                                <ReferenceLine
                                                    y={80}
                                                    stroke="#79c9aa"
                                                    strokeDasharray="4 5"
                                                    strokeOpacity={0.65}
                                                    label={{
                                                        value: "Strong",
                                                        position: "insideTopRight",
                                                        fill: "#62a58d",
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <ReferenceLine
                                                    y={60}
                                                    stroke="#7fb9dd"
                                                    strokeDasharray="4 5"
                                                    strokeOpacity={0.55}
                                                    label={{
                                                        value: "Stable",
                                                        position: "insideTopRight",
                                                        fill: "#6697b6",
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <ReferenceLine
                                                    y={40}
                                                    stroke="#e6bb72"
                                                    strokeDasharray="4 5"
                                                    strokeOpacity={0.55}
                                                    label={{
                                                        value: "Concern",
                                                        position: "insideTopRight",
                                                        fill: "#b88c45",
                                                        fontSize: 11,
                                                    }}
                                                />

                                                <Tooltip
                                                    cursor={{
                                                        stroke: "#aaa0eb",
                                                        strokeWidth: 1,
                                                        strokeDasharray: "4 4",
                                                    }}
                                                    content={<ProgressTooltip />}
                                                />

                                                <Area
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="url(#assessmentLineGradient)"
                                                    strokeWidth={4}
                                                    fill="url(#assessmentAreaGradient)"
                                                    animationDuration={1100}
                                                    connectNulls
                                                    dot={{
                                                        r: 5,
                                                        fill: "#ffffff",
                                                        stroke: "#9185df",
                                                        strokeWidth: 3,
                                                    }}
                                                    activeDot={{
                                                        r: 8,
                                                        fill: "#ffffff",
                                                        stroke: "#68b7df",
                                                        strokeWidth: 4,
                                                    }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-primary/10 dark:border-white/8 bg-primary/5 dark:bg-white/5 px-6 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background dark:bg-white/8 text-primary shadow-sm">
                                            <TrendingUp className="h-7 w-7" />
                                        </div>

                                        <h3 className="mt-5 text-xl font-bold text-foreground">
                                            One more result needed
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                            Complete the same
                                            assessment category
                                            again later to generate
                                            your progress line
                                            chart.
                                        </p>

                                        <Link
                                            to="/assessment"
                                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                                        >
                                            Take Assessment
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Insight Card */}

                            <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-glow sm:p-7">
                                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                        {getTrendIcon(
                                            progress?.trend
                                        )}
                                    </div>

                                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground/80">
                                        Progress Insight
                                    </p>

                                    <h2 className="mt-3 text-2xl font-bold">
                                        Your wellness journey
                                    </h2>

                                    <p className="mt-4 text-sm leading-7 text-primary-foreground/85">
                                        {getProgressMessage()}
                                    </p>

                                    {progress && (
                                        <div className="mt-7 space-y-3 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                                            <InsightRow
                                                label="First score"
                                                value={`${progress.first_score}/100`}
                                            />

                                            <InsightRow
                                                label="Previous score"
                                                value={
                                                    progress.previous_score !==
                                                        null
                                                        ? `${progress.previous_score}/100`
                                                        : "Not available"
                                                }
                                            />

                                            <InsightRow
                                                label="Latest score"
                                                value={`${progress.latest_score}/100`}
                                            />

                                            <InsightRow
                                                label="Overall change"
                                                value={`${progress.overall_change >
                                                    0
                                                    ? "+"
                                                    : ""
                                                    }${progress.overall_change
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* History List */}

                        <section className="mt-10">
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                    Previous Results
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                                    Your assessment records
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your most recent
                                    assessment appears first.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {history.map(
                                    (assessment) => {
                                        const scoreStyle =
                                            getScoreStyle(
                                                Number(
                                                    assessment.score
                                                )
                                            );

                                        return (
                                            <article
                                                key={
                                                    assessment.id
                                                }
                                                className="glass-strong group overflow-hidden rounded-3xl border border-white/60 dark:border-white/8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow"
                                            >
                                                <div className="grid gap-6 p-5 md:grid-cols-[155px_1fr] md:p-7">
                                                    <div
                                                        className={`flex min-h-40 flex-col items-center justify-center rounded-3xl border ${scoreStyle.container}`}
                                                    >
                                                        <span
                                                            className={`text-5xl font-black ${scoreStyle.text}`}
                                                        >
                                                            {Math.round(
                                                                Number(
                                                                    assessment.score
                                                                )
                                                            )}
                                                        </span>

                                                        <span className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                                            out of 100
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                                                        {
                                                                            assessment.category_name
                                                                        }
                                                                    </span>

                                                                    <span
                                                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${scoreStyle.badge}`}
                                                                    >
                                                                        {
                                                                            assessment.wellness_level
                                                                        }
                                                                    </span>

                                                                    {assessment.recommendation_source ===
                                                                        "ai" && (
                                                                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                                                                                <Sparkles className="h-3.5 w-3.5" />
                                                                                AI Personalized
                                                                            </span>
                                                                        )}
                                                                </div>

                                                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <CalendarDays className="h-4 w-4 text-primary" />

                                                                    {formatDate(
                                                                        assessment.created_at
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="mt-5 text-sm leading-7 text-muted-foreground">
                                                            {assessment.ai_summary ||
                                                                "Your personalized assessment summary is not available."}
                                                        </p>

                                                        {assessment
                                                            .recommendations
                                                            ?.length > 0 && (
                                                                <div className="mt-6">
                                                                    <h3 className="text-sm font-bold text-foreground">
                                                                        Your recommended
                                                                        focus
                                                                    </h3>

                                                                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                                                        {assessment.recommendations
                                                                            .slice(
                                                                                0,
                                                                                4
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    recommendation,
                                                                                    index
                                                                                ) => (
                                                                                    <div
                                                                                        key={`${assessment.id}-${index}`}
                                                                                        className="flex gap-3 rounded-2xl border border-primary/10 dark:border-white/8 bg-primary/5 dark:bg-white/5 p-3.5"
                                                                                    >
                                                                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                                                                                            {index +
                                                                                                1}
                                                                                        </span>

                                                                                        <p className="text-xs leading-5 text-muted-foreground">
                                                                                            {
                                                                                                recommendation
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
}) {
    return (
        <article className="glass-strong group rounded-3xl border border-white/60 dark:border-white/8 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-muted-foreground">
                    {title}
                </p>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </div>
            </div>

            <p className="mt-5 truncate text-2xl font-black text-foreground">
                {value}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {subtitle}
            </p>
        </article>
    );
}

/*
|--------------------------------------------------------------------------
| Insight Row
|--------------------------------------------------------------------------
*/

function InsightRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-primary-foreground/75">
                {label}
            </span>

            <span className="text-sm font-bold text-primary-foreground">
                {value}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Chart Tooltip
|--------------------------------------------------------------------------
*/

function ProgressTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{
        payload: {
            date: string;
            score: number;
            level: string;
        };
    }>;
}) {
    if (
        !active ||
        !payload?.length
    ) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="glass-strong rounded-2xl border border-white/60 dark:border-white/8 p-4 shadow-card">
            <p className="text-xs font-semibold text-muted-foreground">
                {item.date}
            </p>

            <p className="mt-1 text-xl font-black text-primary">
                {item.score}/100
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                {item.level}
            </p>
        </div>
    );
}