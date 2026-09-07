import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  Brain,
  CalendarCheck2,
  Heart,
  Leaf,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  Users,
  WandSparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About — MindBloom",
      },
      {
        name: "description",
        content:
          "Learn about MindBloom, its purpose, features, values and approach to supporting everyday mental wellness.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description:
      "MindBloom is designed to feel gentle, supportive and encouraging during everyday wellness activities.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible Support",
    description:
      "The platform encourages healthy routines while clearly explaining that it is not a replacement for professional care.",
  },
  {
    icon: UserRoundCheck,
    title: "Personal Experience",
    description:
      "Each registered user receives a private dashboard, personal progress records, reminders and achievements.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy Mindset",
    description:
      "Personal account information and wellness records are stored through protected user-based database access.",
  },
];

const features = [
  {
    icon: Bot,
    title: "AI Wellness Companion",
    description:
      "A friendly conversational space where users can reflect, receive gentle encouragement and explore wellness ideas.",
  },
  {
    icon: Activity,
    title: "Wellness Activities",
    description:
      "Breathing, mindfulness, gratitude, mood check-ins and other simple activities support healthier daily routines.",
  },
  {
    icon: CalendarCheck2,
    title: "Personal Reminders",
    description:
      "Administrators can assign exercises, assessments and general reminders that appear in each user's wellness plan.",
  },
  {
    icon: Brain,
    title: "Mood & Assessment Tools",
    description:
      "Users can record feelings, complete assessments and review their personal wellness journey over time.",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description:
      "Dashboard statistics help users understand completed activities, streaks, mood records and overall engagement.",
  },
  {
    icon: Sparkles,
    title: "Achievements",
    description:
      "Personal achievements and certificates celebrate meaningful progress and encourage users to continue.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description:
      "The user signs up securely and receives access to a personal MindBloom dashboard.",
  },
  {
    number: "02",
    title: "Explore Wellness Tools",
    description:
      "The user completes activities, records moods, uses the companion and follows assigned reminders.",
  },
  {
    number: "03",
    title: "Build Healthy Consistency",
    description:
      "Progress records, streaks and dashboard summaries encourage a regular wellness routine.",
  },
  {
    number: "04",
    title: "Celebrate Progress",
    description:
      "Achievements and personalized certificates recognize completed milestones.",
  },
];

function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#ddd7fa]/30 dark:bg-[#3d2d7a]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-[34rem] h-96 w-96 rounded-full bg-[#caedf5]/35 dark:bg-[#1a3d5c]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#d9f3e8]/30 dark:bg-[#1a3d4c]/15 blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About MindBloom"
          title={
            <>
              Helping every mind{" "}
              <span className="text-gradient">
                grow with care
              </span>
            </>
          }
          subtitle="MindBloom is a digital mental wellness platform that brings personal activities, mood tracking, reminders, progress insights and supportive tools together in one calm and welcoming experience."
        />

        <Card className="mt-12 overflow-hidden rounded-[36px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 shadow-[0_28px_80px_rgba(120,126,190,0.13)] backdrop-blur-2xl">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] dark:text-[#a99df0]">
                <Leaf className="h-4 w-4" />
                Our Purpose
              </span>

              <h2 className="mt-5 font-display text-3xl font-extrabold text-[#273149] dark:text-[#e8eaf5] sm:text-4xl">
                A thoughtful space for everyday wellness
              </h2>

              <p className="mt-5 text-base leading-8 text-[#65718a] dark:text-[#8892a8]">
                MindBloom was created to make daily mental wellness easier to understand and practice. Instead of placing every feature on a separate platform, it gives users one organized place to check their mood, complete calming activities, receive reminders, view progress and celebrate achievements.
              </p>

              <p className="mt-4 text-base leading-8 text-[#65718a] dark:text-[#8892a8]">
                The platform focuses on simple, positive and manageable steps. Its purpose is not to diagnose or treat mental health conditions. It supports everyday self-care and encourages users to seek qualified professional help whenever deeper support is needed.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/activities">
                  <Button className="min-h-12 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow">
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Explore Activities
                  </Button>
                </Link>

                <Link to="/contact">
                  <Button
                    variant="outline"
                    className="min-h-12 rounded-full border-[#ddd8f7] dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 text-[#776bc8] dark:text-[#a99df0]"
                  >
                    <MessageCircleHeart className="mr-2 h-4 w-4" />
                    Contact MindBloom
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-br from-[#ece9ff] via-[#e7f5ff] to-[#e4f8ef] dark:from-white/6 dark:via-white/4 dark:to-white/6 p-8 sm:p-10">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/50 dark:bg-white/5 blur-2xl" />
              <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[#c9eadd]/50 dark:bg-[#1a3d4c]/20 blur-2xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                  <Brain className="h-8 w-8" />
                </div>

                <div className="mt-12 space-y-4">
                  <Card className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/72 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#a99df0]">
                      Our Mission
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#59657b] dark:text-[#8892a8]">
                      To help users build healthier emotional habits through accessible digital tools, gentle guidance and meaningful progress tracking.
                    </p>
                  </Card>

                  <Card className="rounded-[24px] border border-white/90 dark:border-white/8 bg-white/72 dark:bg-white/5 p-5 shadow-soft backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4c9d8a] dark:text-[#6fc5ad]">
                      Our Vision
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#59657b] dark:text-[#8892a8]">
                      A future where everyday mental wellness support feels approachable, organized and available without judgment.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <section className="mt-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#a99df0] shadow-soft">
              <Heart className="h-4 w-4" />
              What We Value
            </span>

            <h2 className="mt-5 font-display text-3xl font-extrabold text-[#273149] dark:text-[#e8eaf5] sm:text-4xl">
              Designed around people, not pressure
            </h2>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#65718a] dark:text-[#8892a8]">
              Every MindBloom feature is intended to feel understandable, respectful and encouraging.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <Card
                  key={value.title}
                  className="group rounded-[28px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(120,126,190,0.14)] dark:hover:shadow-[0_24px_58px_rgba(80,70,160,0.2)]"
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#758096] dark:text-[#8892a8]">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5f8fc7] dark:text-[#7ab3e0]">
                <Sparkles className="h-4 w-4" />
                Platform Features
              </span>

              <h2 className="mt-5 font-display text-3xl font-extrabold text-[#273149] dark:text-[#e8eaf5] sm:text-4xl">
                One connected wellness experience
              </h2>

              <p className="mt-4 leading-8 text-[#65718a] dark:text-[#8892a8]">
                MindBloom combines user tools and administrative support so progress, reminders and records remain connected to the correct account.
              </p>

              <Card className="mt-7 rounded-[28px] border border-white/85 dark:border-white/8 bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] dark:from-white/6 dark:via-white/4 dark:to-white/6 p-6 shadow-soft">
                <Users className="h-8 w-8 text-[#8174d2]" />

                <h3 className="mt-4 font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                  User and Admin Roles
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#65718a] dark:text-[#8892a8]">
                  Users manage their personal wellness journey, while administrators manage users, activities, reminders, mood records and contact messages.
                </p>
              </Card>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card
                    key={feature.title}
                    className="rounded-[28px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0edff] dark:bg-white/8 text-[#8174d2] dark:text-[#a99df0]">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#758096] dark:text-[#8892a8]">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf9f4] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4c9d8a] dark:text-[#6fc5ad]">
              <Target className="h-4 w-4" />
              How MindBloom Works
            </span>

            <h2 className="mt-5 font-display text-3xl font-extrabold text-[#273149] dark:text-[#e8eaf5] sm:text-4xl">
              Small actions, meaningful progress
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="flex gap-5 rounded-[28px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] font-display text-lg font-extrabold text-white shadow-soft">
                  {step.number}
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#758096] dark:text-[#8892a8]">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="mt-20 overflow-hidden rounded-[34px] border border-white/85 dark:border-white/8 bg-gradient-to-br from-[#fff8f5] via-[#f5f2ff] to-[#edf7ff] dark:from-white/5 dark:via-white/3 dark:to-white/5 p-8 shadow-[0_22px_65px_rgba(120,126,190,0.11)] sm:p-10">
          <div className="grid gap-7 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/85 dark:bg-white/8 text-[#ad6983] dark:text-[#d48aa5] shadow-soft">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ad6983] dark:text-[#d48aa5]">
                Important Wellness Notice
              </p>

              <h2 className="mt-3 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5] sm:text-3xl">
                MindBloom supports wellness, not medical diagnosis
              </h2>

              <p className="mt-4 max-w-4xl leading-8 text-[#65718a] dark:text-[#8892a8]">
                MindBloom is an educational and self-care platform. It does not provide medical advice, diagnosis, emergency intervention or professional therapy. Users experiencing severe distress, immediate danger or thoughts of self-harm should contact local emergency services or a qualified mental health professional immediately.
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-10 rounded-[34px] border border-white/85 dark:border-white/8 bg-gradient-to-r from-[#eeeaff] via-[#eaf5ff] to-[#e5f7ef] dark:from-white/5 dark:via-white/3 dark:to-white/5 p-8 text-center shadow-[0_22px_65px_rgba(120,126,190,0.11)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/80 dark:bg-white/8 text-[#8174d2] dark:text-[#a99df0] shadow-soft">
            <Heart className="h-8 w-8" />
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold text-[#273149] dark:text-[#e8eaf5]">
            Your wellness journey matters
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#65718a] dark:text-[#8892a8]">
            MindBloom is here to make daily reflection, healthy routines and personal progress feel easier to manage.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button className="min-h-12 rounded-full bg-gradient-primary px-7 text-primary-foreground shadow-glow">
                Start Your Journey
              </Button>
            </Link>

            <Link to="/contact">
              <Button
                variant="outline"
                className="min-h-12 rounded-full border-white/90 dark:border-white/10 bg-white/75 dark:bg-white/5 px-7 text-[#776bc8] dark:text-[#a99df0]"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}