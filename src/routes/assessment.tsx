import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  HeartPulse,
  LoaderCircle,
  Moon,
  Smile,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Wellness Assessment — MindBloom" },
      {
        name: "description",
        content:
          "Take a wellness assessment for anxiety, stress, mood, sleep, and self-esteem.",
      },
    ],
  }),
  component: AssessmentPage,
});

const categories = [
  { id: "anxiety", icon: Brain, name: "Anxiety", color: "bg-lavender", desc: "Anxiety wellness check-in" },
  { id: "stress", icon: Activity, name: "Stress", color: "bg-sky", desc: "Daily stress review" },
  { id: "mood", icon: Smile, name: "Mood", color: "bg-peach", desc: "Emotional check-in" },
  { id: "sleep", icon: Moon, name: "Sleep Quality", color: "bg-mint", desc: "Restfulness audit" },
  { id: "esteem", icon: HeartPulse, name: "Self-Esteem", color: "bg-lavender", desc: "Inner voice review" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const assessmentData: Record<CategoryId, { questions: string[]; options: string[] }> = {
  anxiety: {
    questions: [
      "I feel a sense of worry or unease that I cannot easily explain.",
      "My heart races or I notice physical tension when I am not doing anything strenuous.",
      "I find it hard to stop thinking about things that might go wrong.",
      "I feel on edge or easily startled by small things.",
      "I avoid situations or activities because of feelings of nervousness or fear.",
      "I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.",
      "I notice my mind going blank or having difficulty concentrating due to worry.",
      "I feel a sense of dread about upcoming events or situations, even minor ones.",
      "I find it difficult to relax, even when I have free time.",
      "I feel that something bad is about to happen, without a clear reason.",
      "Worrying thoughts get in the way of my daily tasks or activities.",
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
  },
  stress: {
    questions: [
      "I feel overwhelmed by the demands placed on me each day.",
      "I find it hard to keep up with my responsibilities or obligations.",
      "I feel irritable or short-tempered when things do not go as planned.",
      "I feel like I do not have enough time to get things done.",
      "I notice tension in my body, such as tight shoulders, a clenched jaw, or headaches.",
      "I feel like I am unable to unwind after a stressful day.",
      "I find it difficult to make decisions because of how much I have on my mind.",
      "Small problems or setbacks feel much bigger than they probably are.",
      "I feel mentally exhausted even when I have not done much physical activity.",
      "My mood is negatively affected by the demands or pressures in my life.",
      "I feel that I am losing control over how I manage things in my life.",
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
  },
  mood: {
    questions: [
      "I feel sad, empty, or low without a clear reason.",
      "I have lost interest in activities or hobbies that I used to enjoy.",
      "I feel hopeless about the future.",
      "I feel disconnected from the people around me.",
      "I notice that it takes extra effort to do basic daily tasks.",
      "I feel that I am a burden to the people in my life.",
      "I find little or nothing to look forward to during my week.",
      "My mood changes noticeably from one part of the day to another.",
      "I feel emotionally numb or flat, neither happy nor sad.",
      "Positive events or good news have little effect on how I feel.",
      "I feel tearful or on the verge of crying without a specific trigger.",
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
  },
  sleep: {
    questions: [
      "I have difficulty falling asleep at night.",
      "I wake up during the night and find it hard to get back to sleep.",
      "I wake up earlier than I want to and cannot return to sleep.",
      "I feel unrefreshed or tired in the morning, even after sleeping.",
      "My sleep is disturbed by racing thoughts or worry.",
      "I feel sleepy or low on energy during the day because of poor sleep.",
      "I find that my mood or ability to concentrate is affected by how well I slept.",
      "I rely on caffeine or sleep aids to manage my sleep.",
      "My sleep schedule is irregular, and I go to bed or wake up at very different times.",
      "I have vivid, distressing, or unusual dreams that interfere with my rest.",
      "I feel anxious or worried about not getting enough sleep.",
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
  },
  esteem: {
    questions: [
      "I feel that I am not as capable or competent as the people around me.",
      "I am critical or harsh toward myself when I make mistakes.",
      "I doubt my ability to handle challenges or new situations.",
      "I feel uncomfortable receiving compliments or positive feedback.",
      "I compare myself negatively to others.",
      "I feel that my opinions or contributions are less valuable than those of others.",
      "I find it hard to stand up for myself or express my needs.",
      "I feel a sense of shame or embarrassment about who I am.",
      "I seek approval from others before feeling confident in my choices.",
      "I feel that I do not deserve good things that happen to me.",
      "I feel uncomfortable in social situations because I worry about being judged.",
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Almost Always"],
  },
};

type WellnessLevel = {
  key: "strong" | "stable" | "moderate" | "high" | "very_high";
  title: string;
  message: string;
};

function getWellnessLevel(score: number): WellnessLevel {
  if (score >= 80) return { key: "strong", title: "Strong Wellness", message: "Your responses suggest that you are managing this area well." };
  if (score >= 60) return { key: "stable", title: "Generally Stable", message: "Your responses suggest a mostly stable condition with a few areas that may need attention." };
  if (score >= 40) return { key: "moderate", title: "Moderate Concern", message: "Your responses suggest that this area may currently need regular attention." };
  if (score >= 20) return { key: "high", title: "High Concern", message: "Your responses suggest that this area may be affecting your daily wellness." };
  return { key: "very_high", title: "Very High Concern", message: "Your responses suggest that additional support may be helpful at this time." };
}

function getFallbackRecommendations(category: CategoryId, score: number): string[] {
  const categoryRecommendations: Record<CategoryId, string[]> = {
    anxiety: [
      "Practice slow breathing for five minutes when worry feels intense.",
      "Use the 5-4-3-2-1 grounding technique to reconnect with the present moment.",
      "Write down repeated worries and separate what you can control from what you cannot.",
    ],
    stress: [
      "Break large responsibilities into smaller and manageable tasks.",
      "Take a short pause between demanding activities.",
      "Relax tense muscles through gentle stretching or slow breathing.",
    ],
    mood: [
      "Plan one small activity that usually gives you comfort or enjoyment.",
      "Record your mood and one possible trigger each day.",
      "Stay connected with a trusted friend or family member.",
    ],
    sleep: [
      "Keep a regular sleep and wake-up time for the next seven days.",
      "Avoid screens and bright light during the final 30 minutes before bed.",
      "Reduce caffeine later in the day and create a quiet bedtime routine.",
    ],
    esteem: [
      "Replace one harsh self-critical thought with a fair and supportive response.",
      "Set one small goal that you can realistically complete this week.",
      "Write down one strength or positive action each day.",
    ],
  };

  const recommendations = [...categoryRecommendations[category]];

  if (score < 40) {
    recommendations.push(
      "Share how you are feeling with someone you trust.",
      "Consider speaking with a qualified mental health professional."
    );
  } else {
    recommendations.push(
      "Choose one recommendation and practice it consistently this week.",
      "Track your progress and notice any small positive changes."
    );
  }

  return recommendations.slice(0, 5);
}

function AssessmentPage() {
  const [selected, setSelected] = useState<CategoryId | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationSource, setRecommendationSource] = useState<"ai" | "fallback" | null>(null);

  const currentAssessment = selected ? assessmentData[selected] : null;

  const score = answers.length > 0
    ? Math.round(100 - (answers.reduce((total, value) => total + value, 0) / (answers.length * 4)) * 100)
    : 0;

  const wellnessLevel = getWellnessLevel(score);

  async function saveAssessmentResult({
    finalScore,
    level,
    detailedAnswers,
    summary,
    finalRecommendations,
    source,
  }: {
    finalScore: number;
    level: WellnessLevel;
    detailedAnswers: {
      question: string;
      answer: string;
      value: number;
    }[];
    summary: string;
    finalRecommendations: string[];
    source: "ai" | "fallback";
  }) {
    if (!selected) return;

    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        console.log(
          "Assessment was not saved because the user is not logged in."
        );
        return;
      }

      const user = JSON.parse(storedUser);

      const userId = Number(user?.id);

      if (!userId || userId <= 0) {
        console.log(
          "Assessment was not saved because a valid user ID was not found."
        );
        return;
      }

      const categoryName =
        categories.find((item) => item.id === selected)?.name ??
        selected;

      const response = await fetch(
        "http://localhost/api/user/save_assessment.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            category: selected,
            category_name: categoryName,
            score: finalScore,
            wellness_level: level.title,
            level_key: level.key,
            answers: detailedAnswers,
            ai_summary: summary,
            recommendations: finalRecommendations,
            recommendation_source: source,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Assessment result could not be saved."
        );
      }

      console.log(
        "Assessment saved successfully:",
        data.assessment_id
      );
    } catch (error) {
      console.error("Assessment save error:", error);
    }
  }

  async function generateRecommendations(finalAnswers: number[]) {
    if (
      !selected ||
      !currentAssessment ||
      finalAnswers.length === 0
    ) {
      return;
    }

    const finalScore = Math.round(
      100 -
        (finalAnswers.reduce(
          (total, value) => total + value,
          0
        ) /
          (finalAnswers.length * 4)) *
          100
    );

    const level = getWellnessLevel(finalScore);

    const detailedAnswers =
      currentAssessment.questions.map(
        (question, index) => ({
          question,
          answer:
            currentAssessment.options[
              finalAnswers[index]
            ] ?? "Not answered",
          value: finalAnswers[index] ?? 0,
        })
      );

    try {
      setRecommendationLoading(true);
      setRecommendations([]);
      setAiSummary("");
      setRecommendationSource(null);

      const response = await fetch(
        "http://localhost/api/assessment_recommendations.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: selected,
            category_name:
              categories.find(
                (item) => item.id === selected
              )?.name ?? selected,
            score: finalScore,
            level: level.key,
            answers: detailedAnswers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned status ${response.status}.`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Recommendations could not be generated."
        );
      }

      const receivedRecommendations =
        Array.isArray(data.recommendations)
          ? data.recommendations
              .filter(
                (item: unknown): item is string =>
                  typeof item === "string" &&
                  item.trim() !== ""
              )
              .slice(0, 5)
          : [];

      if (receivedRecommendations.length === 0) {
        throw new Error(
          "The recommendation list was empty."
        );
      }

      const finalSummary =
        typeof data.summary === "string" &&
        data.summary.trim()
          ? data.summary.trim()
          : level.message;

      const finalSource: "ai" | "fallback" =
        data.source === "ai" ? "ai" : "fallback";

      setAiSummary(finalSummary);
      setRecommendations(receivedRecommendations);
      setRecommendationSource(finalSource);

      await saveAssessmentResult({
        finalScore,
        level,
        detailedAnswers,
        summary: finalSummary,
        finalRecommendations:
          receivedRecommendations,
        source: finalSource,
      });
    } catch (error) {
      console.error(
        "Assessment recommendation error:",
        error
      );

      const fallbackSummary = level.message;

      const fallbackRecommendations =
        getFallbackRecommendations(
          selected,
          finalScore
        );

      setAiSummary(fallbackSummary);
      setRecommendations(
        fallbackRecommendations
      );
      setRecommendationSource("fallback");

      await saveAssessmentResult({
        finalScore,
        level,
        detailedAnswers,
        summary: fallbackSummary,
        finalRecommendations:
          fallbackRecommendations,
        source: "fallback",
      });
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function next(value: number) {
    if (!currentAssessment || recommendationLoading) return;

    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step + 1 < currentAssessment.questions.length) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    setDone(true);
    await generateRecommendations(newAnswers);
  }

  function goBack() {
    if (step === 0 || recommendationLoading) return;
    setStep((currentStep) => currentStep - 1);
    setAnswers((currentAnswers) => currentAnswers.slice(0, -1));
  }

  function reset() {
    setSelected(null);
    setStep(0);
    setAnswers([]);
    setDone(false);
    setRecommendations([]);
    setAiSummary("");
    setRecommendationLoading(false);
    setRecommendationSource(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {!selected && (
        <>
          <SectionHeader
            eyebrow="Wellness Assessment"
            title={<>Discover your <span className="text-gradient">wellness baseline</span></>}
            subtitle="Choose a focus area. Each assessment takes 2–4 minutes and is completely private."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Card
                key={category.id}
                onClick={() => setSelected(category.id)}
                className="glass cursor-pointer border-white/60 dark:border-white/8 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up dark:hover:border-white/15"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.color} shadow-soft`}>
                  <category.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.desc}</p>
                <div className="mt-5 flex items-center text-sm font-medium text-primary">
                  Start <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {selected && !done && currentAssessment && (
        <Card className="glass-strong mx-auto max-w-2xl border-white/60 dark:border-white/10 p-8 shadow-glass">
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categories.find((category) => category.id === selected)?.name} · Question {step + 1} of {currentAssessment.questions.length}
            </span>
            <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
          </div>

          <Progress value={((step + 1) / currentAssessment.questions.length) * 100} className="mb-8 h-2" />

          <h2 className="font-display text-2xl font-semibold leading-snug">
            {currentAssessment.questions[step]}
          </h2>

          <div className="mt-8 space-y-3">
            {currentAssessment.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => next(index)}
                disabled={recommendationLoading}
                className="group w-full rounded-2xl border border-border dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 text-left shadow-card transition-all hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          {step > 0 && (
            <Button variant="ghost" size="sm" className="mt-6" onClick={goBack} disabled={recommendationLoading}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
        </Card>
      )}

      {done && selected && (
        <div className="mx-auto max-w-3xl animate-fade-in-up">
          <Card className="glass-strong border-white/60 dark:border-white/10 p-10 text-center shadow-glass">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>

            <h2 className="mt-6 font-display text-3xl font-bold">Your Wellness Score</h2>
            <p className="mt-2 text-muted-foreground">Based on your responses today.</p>

            <div className="relative mt-8 inline-flex items-center justify-center">
              <svg viewBox="0 0 192 192" className="h-48 w-48 -rotate-90" aria-label={`Wellness score ${score} out of 100`}>
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="14" fill="none" className="text-muted/40 dark:text-white/10" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#wellness-score-gradient)"
                  strokeWidth="14"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 502.65} 502.65`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="wellness-score-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.13 290)" />
                    <stop offset="100%" stopColor="oklch(0.75 0.13 230)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-bold text-gradient">{score}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">out of 100</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-display text-xl font-semibold text-primary">{wellnessLevel.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {score >= 80
                  ? "You appear to be managing this area well. 🌸"
                  : score >= 60
                    ? "You are generally steady, with a few areas to support. 🌿"
                    : score >= 40
                      ? "This area may benefit from regular care and attention. 💜"
                      : "Let us gently support this area together. 💜"}
              </p>
            </div>
          </Card>

          <Card className="glass mt-6 border-white/60 dark:border-white/10 p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold">Personalized Recommendations</h3>
              {!recommendationLoading && recommendationSource && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {recommendationSource === "ai" ? "AI personalized" : "Safe recommendations"}
                </span>
              )}
            </div>

            {recommendationLoading ? (
              <div className="py-10 text-center">
                <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Analyzing your responses and preparing personalized recommendations...
                </p>
              </div>
            ) : (
              <>
                {aiSummary && <p className="mt-4 text-sm leading-7 text-muted-foreground">{aiSummary}</p>}

                <ul className="mt-5 space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <li key={`${recommendation}-${index}`} className="flex gap-3 rounded-2xl bg-white/55 dark:bg-white/5 p-4 text-sm">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-6 rounded-2xl border border-border/60 dark:border-white/8 bg-white/50 dark:bg-white/5 p-4">
              <p className="text-xs leading-6 text-muted-foreground">
                This assessment provides general wellness guidance only. It is not a medical diagnosis and does not replace support from a qualified mental health professional.
              </p>
            </div>

            <Button
              className="mt-6 rounded-full bg-gradient-primary text-primary-foreground"
              onClick={reset}
              disabled={recommendationLoading}
            >
              Take Another Assessment
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}