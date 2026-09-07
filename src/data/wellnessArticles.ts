import groundingImage from "../assets/wellness/grounding.jpg";
import stressImage from "../assets/wellness/stress.jpg";
import sleepRoutineImage from "../assets/wellness/sleep-routine.jpg";
import meditationImage from "../assets/wellness/meditation.jpg";
import positivityImage from "../assets/wellness/positivity.jpg";
import selfCompassionImage from "../assets/wellness/self-compassion.jpg";
import boxBreathingImage from "../assets/wellness/box-breathing.jpg";
import betterMorningsImage from "../assets/wellness/better-mornings.jpg";

export type WellnessArticle = {
  slug: string;
  cat: string;
  title: string;
  excerpt: string;
  time: string;
  image: string;
  author: string;
  date: string;
  content: string[];
};

export const wellnessArticles: WellnessArticle[] = [
  {
    slug: "grounding-techniques",
    cat: "Anxiety",
    title: "5 Grounding Techniques That Work in Under a Minute",
    excerpt:
      "Calm a racing mind anywhere — from a packed subway to your office chair.",
    time: "5 min",
    image: groundingImage,
    author: "MindBloom Wellness Team",
    date: "July 12, 2026",
    content: [
      "Grounding techniques help bring your attention back to the present moment when anxiety feels overwhelming.",
      "The first technique is the 5-4-3-2-1 method. Notice five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.",
      "The second technique is slow breathing. Inhale gently for four seconds, hold for four seconds, and exhale for four seconds.",
      "The third technique is touching a nearby object and noticing its texture, temperature, shape, and weight.",
      "The fourth technique is naming your current location, the date, and three things you know are true right now.",
      "The fifth technique is pressing both feet firmly into the floor and noticing the support beneath you.",
      "These techniques do not remove every anxious feeling, but they can help your body and mind feel safer in the moment.",
    ],
  },
  {
    slug: "stress-recovery-loop",
    cat: "Stress",
    title: "The Science of the Stress-Recovery Loop",
    excerpt:
      "Why your nervous system needs rest as deliberately as effort.",
    time: "8 min",
    image: stressImage,
    author: "Dr. Emma Clarke",
    date: "July 10, 2026",
    content: [
      "Stress is a natural response that helps the body react to challenges.",
      "The problem begins when the body stays in a stressed state without enough time to recover.",
      "Recovery can include sleep, slow breathing, movement, quiet time, supportive conversations, and enjoyable activities.",
      "Short recovery breaks during the day can help reduce physical tension and improve concentration.",
      "Try working for a focused period and then taking a few minutes to stretch, breathe, or step outside.",
      "Rest is not laziness. It is part of the process that allows the mind and body to function well.",
    ],
  },
  {
    slug: "wind-down-routine",
    cat: "Sleep",
    title: "Your Wind-Down Routine, Designed by a Sleep Coach",
    excerpt:
      "A 30-minute ritual to slip into deeper rest, naturally.",
    time: "6 min",
    image: sleepRoutineImage,
    author: "Sophia Reed",
    date: "July 8, 2026",
    content: [
      "A consistent wind-down routine tells your body that the active part of the day is ending.",
      "Start by lowering bright lights and reducing screen use around thirty minutes before bed.",
      "Prepare your room by keeping it quiet, comfortable, and slightly cool.",
      "Choose one calming activity such as reading, stretching, journaling, or listening to soft audio.",
      "Try to avoid heavy meals and caffeine close to bedtime.",
      "A routine does not need to be perfect. Repeating a few simple steps every night can gradually improve sleep.",
    ],
  },
  {
    slug: "loving-kindness-meditation",
    cat: "Meditation",
    title: "A Beginner's Guide to Loving-Kindness",
    excerpt:
      "How to befriend yourself in five guided steps.",
    time: "7 min",
    image: meditationImage,
    author: "Maya Bennett",
    date: "July 6, 2026",
    content: [
      "Loving-kindness meditation is a gentle practice that encourages compassion toward yourself and others.",
      "Sit comfortably and take a few slow breaths.",
      "Begin by silently repeating: May I be safe. May I be peaceful. May I be healthy. May I live with ease.",
      "Next, think of someone you care about and repeat the same wishes for them.",
      "You can slowly expand the practice to include neutral people and even people with whom you have difficulty.",
      "The goal is not to force a feeling. The goal is to practice a kinder direction of attention.",
    ],
  },
  {
    slug: "reframing-negative-thoughts",
    cat: "Positivity",
    title: "Reframing: Turning 'I Can't' into 'I'm Learning'",
    excerpt:
      "Small language shifts that rewire how you feel.",
    time: "4 min",
    image: positivityImage,
    author: "MindBloom Wellness Team",
    date: "July 5, 2026",
    content: [
      "The words we use can influence how we understand difficult situations.",
      "Instead of saying, 'I cannot do this,' try saying, 'I am still learning how to do this.'",
      "Instead of saying, 'I always fail,' try saying, 'This attempt did not work, and I can learn from it.'",
      "Reframing does not mean ignoring real problems.",
      "It means describing the situation in a way that leaves room for growth, support, and future change.",
    ],
  },
  {
    slug: "self-compassion",
    cat: "Expert",
    title: "Why Self-Compassion Beats Self-Discipline",
    excerpt:
      "A closer look at the science of being kind to yourself.",
    time: "10 min",
    image: selfCompassionImage,
    author: "Dr. Daniel Foster",
    date: "July 3, 2026",
    content: [
      "Self-discipline can be useful, but harsh self-criticism often increases shame and stress.",
      "Self-compassion means responding to your own difficulty with kindness, honesty, and support.",
      "It does not mean avoiding responsibility or giving up.",
      "A self-compassionate response might sound like: This is difficult, but I can take one small step and ask for help if I need it.",
      "People often become more consistent when they feel supported rather than attacked by their own inner voice.",
      "Kindness and accountability can exist together.",
    ],
  },
  {
    slug: "box-breathing",
    cat: "Anxiety",
    title: "Box Breathing: The Navy SEAL Calm Trick",
    excerpt:
      "A 4-4-4-4 pattern used by performers under pressure.",
    time: "3 min",
    image: boxBreathingImage,
    author: "MindBloom Wellness Team",
    date: "July 2, 2026",
    content: [
      "Box breathing is a simple breathing pattern that can help slow down the stress response.",
      "Inhale through your nose for four seconds.",
      "Hold your breath gently for four seconds.",
      "Exhale slowly for four seconds.",
      "Pause for four seconds before beginning again.",
      "Repeat the cycle three or four times without forcing your breath.",
      "Stop if you feel dizzy or uncomfortable and return to normal breathing.",
    ],
  },
  {
    slug: "better-mornings",
    cat: "Sleep",
    title: "The Light & Dark of Better Mornings",
    excerpt:
      "How your circadian rhythm shapes your mood — and what to do.",
    time: "6 min",
    image: betterMorningsImage,
    author: "Olivia Hart",
    date: "June 30, 2026",
    content: [
      "Your body uses light and darkness to help regulate sleep and wakefulness.",
      "Morning light can help your brain understand that the day has started.",
      "Try opening the curtains or spending a few minutes outside after waking.",
      "At night, reducing bright light and screen exposure can make it easier for your body to prepare for sleep.",
      "A regular wake-up time can also support a more stable sleep rhythm.",
      "Small changes made consistently are usually more helpful than a perfect routine followed only occasionally.",
    ],
  },
];