import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Sparkles,
  Heart,
  Brain,
  Moon,
  Sun,
  Wind,
  Star,
  Quote,
  Shield,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "MindBloom — Your Personal Mental Wellness Companion",
      },
      {
        name: "description",
        content:
          "Reduce anxiety, manage stress, and bloom into your best self with guided activities, AI support, and personalized wellness tracking.",
      },
    ],
  }),
  component: Home,
});

const heroMedia = [
  {
    type: "video",
    src: "/videos/mindbloom-hero.mp4",
    label: "MindBloom Experience",
  },
  {
    type: "image",
    src: "/images/hero-1.png",
    label: "Mindful Reset",
  },
  {
    type: "image",
    src: "/images/hero-2.png",
    label: "Gentle Movement",
  },
  {
    type: "image",
    src: "/images/hero-3.png",
    label: "Calm Reflection",
  },
  {
    type: "image",
    src: "/images/hero-4.png",
    label: "Inner Balance",
  },
  {
    type: "image",
    src: "/images/hero-5.png",
    label: "Wellness Journey",
  },
] as const;

const stats = [
  { value: "2.4M+", label: "Lives touched" },
  { value: "94%", label: "Feel calmer" },
  { value: "180+", label: "Activities" },
  { value: "4.9★", label: "User rating" },
];

const benefits = [
  {
    icon: Brain,
    title: "Anxiety Relief",
    desc: "Evidence-based techniques to calm your mind in moments.",
  },
  {
    icon: Heart,
    title: "Mood Tracking",
    desc: "Visualize your emotional patterns and celebrate growth.",
  },
  {
    icon: Moon,
    title: "Better Sleep",
    desc: "Wind-down routines and guided meditations for deep rest.",
  },
  {
    icon: Wind,
    title: "Breathing Tools",
    desc: "Box, 4-7-8, and coherent breathing in your pocket.",
  },
  {
    icon: Sun,
    title: "Daily Habits",
    desc: "Build a wellness streak with tiny, joyful actions.",
  },
  {
    icon: Bot,
    title: "AI Companion",
    desc: "A friendly voice to listen, motivate, and guide — anytime.",
  },
];

const testimonials = [
  {
    name: "Aisha Khan",
    role: "Designer",
    quote:
      "MindBloom became my morning ritual. My anxiety dropped within weeks.",
    rating: 5,
  },
  {
    name: "Daniel Rivera",
    role: "Teacher",
    quote:
      "The AI companion feels like a friend who actually understands.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Engineer",
    quote: "Sleep quality up, stress down. Beautifully designed too.",
    rating: 5,
  },
];

const journeySteps = [
  {
    step: "01",
    title: "Take Assessment",
    desc: "Discover where you are emotionally with science-backed checks.",
  },
  {
    step: "02",
    title: "Personalized Plan",
    desc: "Receive a wellness path tuned to your goals and lifestyle.",
  },
  {
    step: "03",
    title: "Daily Practice",
    desc: "Engage with bite-sized activities and your AI companion.",
  },
  {
    step: "04",
    title: "Bloom & Grow",
    desc: "Track progress, unlock achievements, and celebrate wins.",
  },
];

const faqs = [
  {
    q: "Is MindBloom a substitute for therapy?",
    a: "No. MindBloom complements professional support. If you're in crisis, please contact emergency services or a licensed professional.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your wellness data is encrypted and never sold. You're in control of what you share.",
  },
  {
    q: "Is it free to use?",
    a: "Core features including assessments, activities, and the AI companion are free. Premium content is available.",
  },
  {
    q: "Which languages are supported?",
    a: "MindBloom supports English, Urdu, Hindi, and Roman Urdu — with more coming soon.",
  },
];

function Home() {
  const [currentMedia, setCurrentMedia] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const changeSlide = (index: number) => {
    setCurrentMedia(index);
    setAnimationKey((prev) => prev + 1);
  };

  const goNext = () => {
    changeSlide((currentMedia + 1) % heroMedia.length);
  };

  const goPrevious = () => {
    changeSlide(
      (currentMedia - 1 + heroMedia.length) % heroMedia.length
    );
  };

  useEffect(() => {
    const currentItem = heroMedia[currentMedia];

    if (currentItem.type === "video") {
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentMedia((prev) => (prev + 1) % heroMedia.length);
      setAnimationKey((prev) => prev + 1);
    }, 4800);

    return () => window.clearTimeout(timer);
  }, [currentMedia]);

  const currentItem = heroMedia[currentMedia];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-20 right-[10%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-[110px] animate-blob" />

        <div
          className="pointer-events-none absolute bottom-[5%] left-[20%] h-[320px] w-[320px] rounded-full bg-lavender/10 blur-[100px] animate-drift"
          style={{ animationDelay: "6s" }}
        />

        <div className="pointer-events-none absolute top-[45%] right-[35%] h-40 w-40 rounded-full bg-sky/10 blur-[70px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* LEFT */}
            <div>
              <div className="hero-enter-1">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Introducing MindBloom 1.0
                </span>
              </div>

              <h1 className="hero-enter-2 mt-6 font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight">
                Your Personal Mental{" "}
                <span className="text-gradient">
                  Wellness Companion
                </span>
              </h1>

              <p className="hero-enter-3 mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Reduce anxiety, manage stress, and bloom into your best self
                with guided activities, AI support, and personalized wellness
                tracking.
              </p>

              <div className="hero-enter-4 mt-8 flex flex-wrap gap-3">
                <Link to="/assessment">
                  <Button
                    size="lg"
                    className="bg-gradient-primary text-primary-foreground shadow-glow rounded-full px-7 h-12 text-base group hero-btn-shimmer"
                  >
                    Start Your Check-In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>

                <Link to="/companion">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-7 h-12 text-base border-border hover:bg-surface-hover hero-btn-shimmer"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Talk to Bloom AI
                  </Button>
                </Link>
              </div>

              <div className="hero-enter-5 mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[
                    "bg-lavender",
                    "bg-mint",
                    "bg-sky",
                    "bg-peach",
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`h-9 w-9 rounded-full ${c} ring-2 ring-background`}
                    />
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    Loved by 2.4M+ wellness seekers
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — PREMIUM CAROUSEL */}
            <div className="hero-enter-3 relative">
              {/* Large soft glow behind carousel */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -inset-8
                  rounded-[3rem]
                  bg-gradient-to-br
                  from-violet-400/30
                  via-sky-300/20
                  to-cyan-300/25
                  blur-[35px]
                  opacity-80
                "
              />

              {/* Secondary deep shadow/glow layer */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -inset-3
                  rounded-[2.5rem]
                  bg-gradient-to-br
                  from-white/50
                  via-violet-300/20
                  to-sky-300/30
                  blur-xl
                  opacity-80
                "
              />

              {/* Premium outer border */}
              <div
                className="
                  relative
                  rounded-[2.2rem]
                  p-[3px]
                  bg-gradient-to-br
                  from-white
                  via-violet-300/80
                  to-sky-300/90
                  shadow-[0_28px_75px_rgba(76,81,150,0.28),0_12px_35px_rgba(110,120,220,0.22),0_0_0_1px_rgba(255,255,255,0.65)]
                "
              >
                {/* Glass shell */}
                <div
                  className="
                    relative
                    rounded-[2.05rem]
                    border
                    border-white/80
                    dark:border-white/15
                    bg-white/65
                    dark:bg-slate-950/45
                    backdrop-blur-2xl
                    p-2.5
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(115,125,210,0.14)]
                  "
                >
                  {/* Inner highlight border */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-2
                      z-20
                      rounded-[1.65rem]
                      border
                      border-white/35
                      shadow-[inset_0_0_18px_rgba(255,255,255,0.18)]
                    "
                  />

                  <div
                    className="
                      relative
                      aspect-[16/9]
                      overflow-hidden
                      rounded-[1.55rem]
                      border
                      border-white/50
                      bg-black/10
                      group
                      shadow-[0_14px_36px_rgba(27,33,88,0.20),inset_0_0_0_1px_rgba(255,255,255,0.28)]
                    "
                  >
                    {/* Media */}
                    <div
                      key={`${currentMedia}-${animationKey}`}
                      className="absolute inset-0 animate-[heroLuxuryIn_900ms_cubic-bezier(0.22,1,0.36,1)]"
                    >
                      {currentItem.type === "image" ? (
                        <img
                          src={currentItem.src}
                          alt={currentItem.label}
                          className="h-full w-full object-cover transition-transform duration-[6500ms] ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <video
                          src={currentItem.src}
                          autoPlay
                          muted
                          playsInline
                          onEnded={goNext}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    {/* Cinematic overlays */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/5" />

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Elegant edge shine */}
                    <div className="pointer-events-none absolute inset-0 rounded-[1.55rem] ring-1 ring-inset ring-white/30" />

                    {/* Slide label */}
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/40 bg-black/20 px-3.5 py-2 text-white backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.18)]">
                      {currentItem.type === "video" ? (
                        <Play className="h-3.5 w-3.5 fill-white" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}

                      <span className="text-[11px] font-medium tracking-wide">
                        {currentItem.label}
                      </span>
                    </div>

                    {/* Previous */}
                    <button
                      type="button"
                      onClick={goPrevious}
                      aria-label="Previous slide"
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/50
                        bg-slate-950/35
                        text-white
                        backdrop-blur-xl
                        shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]
                        transition-all
                        duration-300
                        hover:scale-110
                        hover:bg-white/25
                        hover:border-white/80
                      "
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Next */}
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next slide"
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/50
                        bg-slate-950/35
                        text-white
                        backdrop-blur-xl
                        shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]
                        transition-all
                        duration-300
                        hover:scale-110
                        hover:bg-white/25
                        hover:border-white/80
                      "
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Premium bottom control */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-white/40
                          bg-black/30
                          px-3
                          py-2
                          backdrop-blur-xl
                          shadow-[0_8px_25px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.16)]
                        "
                      >
                        {heroMedia.map((item, index) => {
                          const active = currentMedia === index;

                          return (
                            <button
                              key={index}
                              type="button"
                              aria-label={`Go to slide ${index + 1}`}
                              onClick={() => changeSlide(index)}
                              className="group/dot relative"
                            >
                              <span
                                className={`block h-[6px] rounded-full transition-all duration-500 ${
                                  active
                                    ? "w-10 bg-white shadow-[0_0_12px_rgba(255,255,255,0.65)]"
                                    : "w-2 bg-white/40 group-hover/dot:bg-white/70"
                                }`}
                              />

                              {active && item.type === "image" && (
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                  <span className="block h-full w-full origin-left animate-[heroProgress_4800ms_linear_forwards] bg-primary/70" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wellness badge */}
              <div
                className="
                  absolute
                  -top-4
                  -right-3
                  glass-strong
                  rounded-2xl
                  px-4
                  py-3
                  animate-float
                  border
                  border-white/70
                  dark:border-white/15
                  shadow-[0_18px_45px_rgba(79,87,170,0.24),0_6px_18px_rgba(100,120,220,0.16),inset_0_1px_0_rgba(255,255,255,0.75)]
                "
              >
                <p className="text-xs text-muted-foreground">
                  Wellness Score
                </p>

                <p className="font-display text-lg font-bold text-gradient">
                  87 / 100
                </p>
              </div>

              {/* Mood badge */}
              <div
                className="
                  absolute
                  -bottom-4
                  -left-3
                  glass-strong
                  rounded-2xl
                  px-4
                  py-3
                  animate-float
                  border
                  border-white/70
                  dark:border-white/15
                  shadow-[0_18px_45px_rgba(79,87,170,0.22),0_6px_18px_rgba(100,120,220,0.14),inset_0_1px_0_rgba(255,255,255,0.75)]
                "
                style={{ animationDelay: "3s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-[0_6px_18px_rgba(99,102,241,0.32)]">
                    <Heart className="h-4 w-4 text-primary-foreground" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Feeling Calm
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      Hopeful & centered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-enter-5 mt-12">
            <div className="glass-strong rounded-2xl p-5 shadow-glass">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-xl sm:text-2xl font-bold text-gradient">
                      {s.value}
                    </p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeader
          eyebrow="Why MindBloom"
          title={
            <>
              Everything you need to{" "}
              <span className="text-gradient">
                feel better
              </span>
            </>
          }
          subtitle="Tools, content, and gentle nudges — all designed with care to support your unique journey."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <Card
              key={b.title}
              className="p-6 glass border-white/60 dark:border-white/8 hover:shadow-glow transition-all hover:-translate-y-1 duration-300 animate-fade-in-up dark:hover:border-white/15"
              style={{
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <b.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold">
                {b.title}
              </h3>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {b.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          eyebrow="Your journey"
          title="A path that meets you where you are"
        />

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {journeySteps.map((s, i) => (
            <div
              key={s.step}
              className="relative p-6 rounded-3xl glass border-white/60 dark:border-white/8 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <span className="font-display text-5xl font-bold text-gradient opacity-80">
                {s.step}
              </span>

              <h3 className="mt-3 font-semibold text-lg">
                {s.title}
              </h3>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {s.desc}
              </p>

              {i < journeySteps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 h-5 w-5 text-primary/50" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeader
          eyebrow="Loved by many"
          title="Stories of growth"
        />

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="p-6 glass-strong border-white/60 dark:border-white/8 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <Quote className="h-7 w-7 text-primary/40" />

              <p className="mt-3 text-foreground/90">
                "{t.quote}"
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {t.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t.role}
                  </p>
                </div>

                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Shield,
              title: "Private & secure",
              desc: "End-to-end encryption on personal data.",
            },
            {
              icon: Users,
              title: "Community support",
              desc: "Anonymous peer circles and group activities.",
            },
            {
              icon: TrendingUp,
              title: "Measurable progress",
              desc: "Beautiful charts that show real growth.",
            },
          ].map((t) => (
            <div
              key={t.title}
              className="flex gap-4 p-6 rounded-3xl glass border-white/60 dark:border-white/8 hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <t.icon className="h-8 w-8 text-primary shrink-0" />

              <div>
                <h4 className="font-semibold">
                  {t.title}
                </h4>

                <p className="text-sm text-muted-foreground mt-1">
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, gently answered"
        />

        <Accordion
          type="single"
          collapsible
          className="mt-10 space-y-3"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`f-${i}`}
              className="glass border-white/60 dark:border-white/8 rounded-2xl px-5 border hover:shadow-soft transition-shadow duration-300"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>

              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 lg:p-16 bg-gradient-aurora shadow-glass dark:shadow-[0_24px_80px_rgba(80,70,160,0.25)]">
          <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
              Start your wellness journey today
            </h2>

            <p className="mt-4 text-foreground/80 text-lg">
              Take a 3-minute assessment and receive a personalized plan,
              free.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/assessment">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
                >
                  Get Started Free
                </Button>
              </Link>

              <Link to="/hub">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 glass border-white/70"
                >
                  Explore Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel animations */}
      <style>{`
        @keyframes heroLuxuryIn {
          0% {
            opacity: 0;
            transform: scale(1.08) translateX(26px);
            filter: blur(12px);
          }

          45% {
            opacity: 1;
            filter: blur(2px);
          }

          100% {
            opacity: 1;
            transform: scale(1) translateX(0);
            filter: blur(0);
          }
        }

        @keyframes heroProgress {
          0% {
            transform: scaleX(0);
          }

          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  );
}