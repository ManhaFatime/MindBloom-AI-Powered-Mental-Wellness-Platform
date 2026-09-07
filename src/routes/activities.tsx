import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wind,
  BookHeart,
  Sparkles,
  Sun,
  Leaf,
  Activity,
  Trophy,
  CheckCircle2,
  Play,
  X,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — MindBloom" },
      {
        name: "description",
        content:
          "Breathing exercises, gratitude journaling, mindfulness, and daily wellness challenges.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const activities = [
  { id: "breath", icon: Wind, title: "Breathing Exercise", desc: "4-7-8 calming breath", progress: 80, mins: 3, color: "from-sky to-mint" },
  { id: "gratitude", icon: BookHeart, title: "Gratitude Journal", desc: "List 3 things you're thankful for", progress: 60, mins: 5, color: "from-peach to-lavender" },
  { id: "reflect", icon: Sparkles, title: "Daily Reflection", desc: "Review your day mindfully", progress: 45, mins: 4, color: "from-lavender to-sky" },
  { id: "positive", icon: Sun, title: "Positive Thinking", desc: "Reframe a tough thought", progress: 30, mins: 5, color: "from-peach to-mint" },
  { id: "mindful", icon: Leaf, title: "Mindfulness", desc: "5-sense grounding practice", progress: 70, mins: 6, color: "from-mint to-lavender" },
  { id: "mood", icon: Activity, title: "Mood Tracker", desc: "Log how you feel right now", progress: 100, mins: 1, color: "from-lavender to-mint" },
  { id: "challenge", icon: Trophy, title: "Daily Challenge", desc: "Complete today's wellness mission", progress: 0, mins: 2, color: "from-sky to-peach" },
];

function ActivitiesPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // ==================================================
  // BREATHING EXERCISE
  // ==================================================

  const [breathingPhase, setBreathingPhase] = useState<
    "ready" | "inhale" | "hold" | "exhale" | "complete"
  >("ready");

  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [breathingRound, setBreathingRound] = useState(1);
  const [breathingRunning, setBreathingRunning] = useState(false);

  const totalBreathingRounds = 3;

  // ==================================================
  // GRATITUDE JOURNAL
  // ==================================================

  const [gratitudeOne, setGratitudeOne] = useState("");
  const [gratitudeTwo, setGratitudeTwo] = useState("");
  const [gratitudeThree, setGratitudeThree] = useState("");

  const [gratitudeSaving, setGratitudeSaving] = useState(false);
  const [gratitudeMessage, setGratitudeMessage] = useState("");
  const [gratitudeSuccess, setGratitudeSuccess] = useState(false);

  // ==================================================
  // DAILY REFLECTION
  // ==================================================

  const reflectionMoods = [
    { value: "Happy", emoji: "😊" },
    { value: "Calm", emoji: "😌" },
    { value: "Neutral", emoji: "😐" },
    { value: "Sad", emoji: "😔" },
    { value: "Stressed", emoji: "😣" },
  ];

  const [reflectionMood, setReflectionMood] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionAiResponse, setReflectionAiResponse] = useState("");

  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionMessage, setReflectionMessage] = useState("");
  const [reflectionSuccess, setReflectionSuccess] = useState(false);

  // ==================================================
  // POSITIVE THINKING
  // ==================================================

  const [difficultThought, setDifficultThought] = useState("");
  const [positiveReframe, setPositiveReframe] = useState("");
  const [positiveLoading, setPositiveLoading] = useState(false);
  const [positiveSaving, setPositiveSaving] = useState(false);
  const [positiveMessage, setPositiveMessage] = useState("");
  const [positiveSuccess, setPositiveSuccess] = useState(false);

  // ==================================================
  // MINDFULNESS 5-4-3-2-1
  // ==================================================

  const [mindfulSeen, setMindfulSeen] = useState(["", "", "", "", ""]);
  const [mindfulFelt, setMindfulFelt] = useState(["", "", "", ""]);
  const [mindfulHeard, setMindfulHeard] = useState(["", "", ""]);
  const [mindfulSmelled, setMindfulSmelled] = useState(["", ""]);
  const [mindfulTasted, setMindfulTasted] = useState("");
  const [mindfulSaving, setMindfulSaving] = useState(false);
  const [mindfulMessage, setMindfulMessage] = useState("");
  const [mindfulSuccess, setMindfulSuccess] = useState(false);

  // ==================================================
  // MOOD TRACKER
  // ==================================================
  const moodOptions = [
    { mood: "Very Happy", emoji: "😁", score: 6 },
    { mood: "Happy", emoji: "😊", score: 5 },
    { mood: "Calm", emoji: "😌", score: 4 },
    { mood: "Neutral", emoji: "😐", score: 3 },
    { mood: "Sad", emoji: "😔", score: 2 },
    { mood: "Stressed", emoji: "😣", score: 1 },
  ];
  type MoodEntry = { id: number | string; mood: string; note: string | null; created_at: string };
  const [selectedMood, setSelectedMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodMessage, setMoodMessage] = useState("");
  const [moodSuccess, setMoodSuccess] = useState(false);


  // ==================================================
  // DAILY CHALLENGE
  // ==================================================

  const [dailyChallenge, setDailyChallenge] = useState("");
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeStreak, setChallengeStreak] = useState(0);
  const [challengeCompletedToday, setChallengeCompletedToday] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeCompleting, setChallengeCompleting] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState("");
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [savedChallengeAnswer, setSavedChallengeAnswer] = useState("");

  // ==================================================
  // BREATHING TIMER
  // ==================================================

  useEffect(() => {
    if (!breathingRunning || breathingPhase === "complete") {
      return;
    }

    const timer = window.setInterval(() => {
      setBreathingSeconds((currentSeconds) => {
        if (currentSeconds > 1) {
          return currentSeconds - 1;
        }

        if (breathingPhase === "inhale") {
          setBreathingPhase("hold");
          return 7;
        }

        if (breathingPhase === "hold") {
          setBreathingPhase("exhale");
          return 8;
        }

        if (breathingPhase === "exhale") {
          if (breathingRound >= totalBreathingRounds) {
            setBreathingPhase("complete");
            setBreathingRunning(false);

            setDone((currentDone) => ({
              ...currentDone,
              breath: true,
            }));

            return 0;
          }

          setBreathingRound((currentRound) => currentRound + 1);
          setBreathingPhase("inhale");

          return 4;
        }

        return currentSeconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [breathingRunning, breathingPhase, breathingRound]);

  // ==================================================
  // OPEN ACTIVITY
  // ==================================================

  const openActivity = (activityId: string) => {
    if (activityId === "breath") {
      setActiveActivity("breath");
      setBreathingPhase("ready");
      setBreathingSeconds(4);
      setBreathingRound(1);
      setBreathingRunning(false);
      return;
    }

    if (activityId === "gratitude") {
      setActiveActivity("gratitude");
      setGratitudeMessage("");
      setGratitudeSuccess(false);
      return;
    }

    if (activityId === "reflect") {
      setActiveActivity("reflect");
      setReflectionMessage("");
      setReflectionSuccess(false);
      setReflectionAiResponse("");
      return;
    }

    if (activityId === "positive") {
      setActiveActivity("positive");
      setPositiveMessage("");
      setPositiveSuccess(false);
      setPositiveReframe("");
      return;
    }

    if (activityId === "mindful") {
      setActiveActivity("mindful");
      setMindfulMessage("");
      setMindfulSuccess(false);
      return;
    }

    if (activityId === "mood") {
      setActiveActivity("mood");
      setMoodMessage("");
      setMoodSuccess(false);
      loadMoodHistory();
      return;
    }


    if (activityId === "challenge") {
      setActiveActivity("challenge");
      setChallengeMessage("");
      setChallengeSuccess(false);
      loadDailyChallenge();
      return;
    }

    // Remaining activities ka temporary behavior
    setDone((currentDone) => ({
      ...currentDone,
      [activityId]: !currentDone[activityId],
    }));
  };

  // ==================================================
  // BREATHING FUNCTIONS
  // ==================================================

  const startBreathingExercise = () => {
    setBreathingPhase("inhale");
    setBreathingSeconds(4);
    setBreathingRound(1);
    setBreathingRunning(true);
  };

  const restartBreathingExercise = () => {
    setBreathingPhase("ready");
    setBreathingSeconds(4);
    setBreathingRound(1);
    setBreathingRunning(false);
  };

  const closeBreathingExercise = () => {
    setBreathingRunning(false);
    setActiveActivity(null);
    setBreathingPhase("ready");
    setBreathingSeconds(4);
    setBreathingRound(1);
  };

  const getBreathingInstruction = () => {
    if (breathingPhase === "ready") {
      return "Get comfortable and prepare to relax.";
    }

    if (breathingPhase === "inhale") {
      return "Breathe in slowly through your nose";
    }

    if (breathingPhase === "hold") {
      return "Hold your breath gently";
    }

    if (breathingPhase === "exhale") {
      return "Exhale slowly through your mouth";
    }

    return "Wonderful! You completed the exercise.";
  };

  const getBreathingTitle = () => {
    if (breathingPhase === "ready") return "Ready?";
    if (breathingPhase === "inhale") return "Inhale";
    if (breathingPhase === "hold") return "Hold";
    if (breathingPhase === "exhale") return "Exhale";

    return "Complete";
  };

  const getCircleSize = () => {
    if (breathingPhase === "inhale") {
      return "scale-125";
    }

    if (breathingPhase === "hold") {
      return "scale-125";
    }

    if (breathingPhase === "exhale") {
      return "scale-90";
    }

    return "scale-100";
  };

  // ==================================================
  // GRATITUDE FUNCTIONS
  // ==================================================

  const closeGratitudeJournal = () => {
    if (gratitudeSaving) {
      return;
    }

    setActiveActivity(null);
    setGratitudeMessage("");
    setGratitudeSuccess(false);
  };

  const saveGratitudeJournal = async () => {
    setGratitudeMessage("");
    setGratitudeSuccess(false);

    if (
      !gratitudeOne.trim() ||
      !gratitudeTwo.trim() ||
      !gratitudeThree.trim()
    ) {
      setGratitudeMessage(
        "Please write all three things you are grateful for."
      );
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setGratitudeMessage(
        "Please login before saving your gratitude journal."
      );
      return;
    }

    let user: {
      id?: number | string;
    };

    try {
      user = JSON.parse(savedUser);
    } catch {
      setGratitudeMessage(
        "Your login information is invalid. Please login again."
      );
      return;
    }

    if (!user?.id) {
      setGratitudeMessage("User ID was not found. Please login again.");
      return;
    }

    try {
      setGratitudeSaving(true);

      const response = await fetch(
        "http://localhost/api/save_gratitude.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            entry_one: gratitudeOne.trim(),
            entry_two: gratitudeTwo.trim(),
            entry_three: gratitudeThree.trim(),
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid gratitude response:", responseText);

        setGratitudeMessage(
          "The server returned an invalid response."
        );
        return;
      }

      if (data.success) {
        setDone((currentDone) => ({
          ...currentDone,
          gratitude: true,
        }));

        setGratitudeSuccess(true);
        setGratitudeMessage(
          data.message ||
          "Your gratitude journal was saved successfully."
        );

        window.setTimeout(() => {
          setActiveActivity(null);
          setGratitudeOne("");
          setGratitudeTwo("");
          setGratitudeThree("");
          setGratitudeMessage("");
          setGratitudeSuccess(false);
        }, 1800);
      } else {
        setGratitudeMessage(
          data.message || "Failed to save your gratitude journal."
        );
      }
    } catch (error) {
      console.error("Gratitude save error:", error);

      setGratitudeMessage(
        "Server connection failed. Make sure Apache is running."
      );
    } finally {
      setGratitudeSaving(false);
    }
  };

  // ==================================================
  // DAILY REFLECTION FUNCTIONS
  // ==================================================

  const closeDailyReflection = () => {
    if (reflectionLoading) {
      return;
    }

    setActiveActivity(null);
    setReflectionMessage("");
    setReflectionSuccess(false);
    setReflectionAiResponse("");
  };

  const submitDailyReflection = async () => {
    setReflectionMessage("");
    setReflectionSuccess(false);
    setReflectionAiResponse("");

    if (!reflectionMood) {
      setReflectionMessage("Please select how you are feeling.");
      return;
    }

    if (!reflectionText.trim()) {
      setReflectionMessage("Please write something about your day.");
      return;
    }

    if (reflectionText.trim().length < 10) {
      setReflectionMessage(
        "Please write a little more about your day."
      );
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setReflectionMessage(
        "Please login before saving your daily reflection."
      );
      return;
    }

    let user: {
      id?: number | string;
      name?: string;
    };

    try {
      user = JSON.parse(savedUser);
    } catch {
      setReflectionMessage(
        "Your login information is invalid. Please login again."
      );
      return;
    }

    if (!user?.id) {
      setReflectionMessage("User ID was not found. Please login again.");
      return;
    }

    try {
      setReflectionLoading(true);

      const aiPrompt = `
The user is completing a daily mental wellness reflection.

Selected mood: ${reflectionMood}

User's reflection:
"${reflectionText.trim()}"

Give a short, warm, supportive reflection in 2 to 4 sentences.

Rules:
- Respond in the same language used by the user.
- Acknowledge their feelings.
- Mention one positive or thoughtful observation.
- Give one gentle wellness suggestion.
- Do not diagnose.
- Do not use a long introduction.
`;

      const aiResponseRequest = await fetch(
        "http://localhost/api/chat.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: aiPrompt,
            history: [],
          }),
        }
      );

      const aiResponseText = await aiResponseRequest.text();

      let aiData;

      try {
        aiData = JSON.parse(aiResponseText);
      } catch {
        console.error("Invalid AI response:", aiResponseText);

        setReflectionMessage(
          "AI returned an invalid response. Please check chat.php."
        );
        return;
      }

      const generatedReply = String(aiData.reply || "").trim();

      if (!generatedReply) {
        setReflectionMessage(
          "Bloom AI could not generate a reflection. Please try again."
        );
        return;
      }

      setReflectionAiResponse(generatedReply);

      const saveResponse = await fetch(
        "http://localhost/api/save_reflection.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            mood: reflectionMood,
            reflection: reflectionText.trim(),
            ai_response: generatedReply,
          }),
        }
      );

      const saveResponseText = await saveResponse.text();

      let saveData;

      try {
        saveData = JSON.parse(saveResponseText);
      } catch {
        console.error(
          "Invalid reflection save response:",
          saveResponseText
        );

        setReflectionMessage(
          "The reflection was generated, but the server returned an invalid save response."
        );
        return;
      }

      if (saveData.success) {
        setDone((currentDone) => ({
          ...currentDone,
          reflect: true,
        }));

        setReflectionSuccess(true);
        setReflectionMessage(
          saveData.message ||
          "Your daily reflection was saved successfully."
        );
      } else {
        setReflectionMessage(
          saveData.message || "Failed to save your daily reflection."
        );
      }
    } catch (error) {
      console.error("Daily reflection error:", error);

      setReflectionMessage(
        "Server connection failed. Make sure Apache and the internet are working."
      );
    } finally {
      setReflectionLoading(false);
    }
  };

  const finishDailyReflection = () => {
    setActiveActivity(null);
    setReflectionMood("");
    setReflectionText("");
    setReflectionAiResponse("");
    setReflectionMessage("");
    setReflectionSuccess(false);
  };

  // ==================================================
  // POSITIVE THINKING FUNCTIONS
  // ==================================================

  const closePositiveThinking = () => {
    if (positiveLoading || positiveSaving) return;

    setActiveActivity(null);
    setPositiveMessage("");
    setPositiveSuccess(false);
  };

  const generatePositiveReframe = async () => {
    setPositiveMessage("");
    setPositiveSuccess(false);
    setPositiveReframe("");

    if (!difficultThought.trim()) {
      setPositiveMessage("Please write the difficult thought you want to reframe.");
      return;
    }

    if (difficultThought.trim().length < 8) {
      setPositiveMessage("Please describe your thought in a little more detail.");
      return;
    }

    try {
      setPositiveLoading(true);

      const aiPrompt = `
The user is doing a positive-thinking exercise.

Difficult thought:
"${difficultThought.trim()}"

Reframe this thought in a realistic, compassionate and helpful way.

Rules:
- Reply in the same language used by the user.
- Do not introduce yourself.
- Do not dismiss the user's concern.
- Do not promise that everything will definitely be fine.
- First acknowledge the concern briefly.
- Then provide a balanced positive reframe.
- End with one small practical next step.
- Keep the response between 2 and 4 sentences.
`;

      const response = await fetch("http://localhost/api/chat.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: aiPrompt,
          history: [],
        }),
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid positive reframe response:", responseText);
        setPositiveMessage(
          "Bloom AI returned an invalid response. Please check chat.php."
        );
        return;
      }

      const generatedReframe = String(data.reply || "").trim();

      if (!generatedReframe) {
        setPositiveMessage(
          "Bloom AI could not create a reframe. Please try again."
        );
        return;
      }

      setPositiveReframe(generatedReframe);
    } catch (error) {
      console.error("Positive reframe error:", error);
      setPositiveMessage(
        "Server connection failed. Make sure Apache and the internet are working."
      );
    } finally {
      setPositiveLoading(false);
    }
  };

  const savePositiveThought = async () => {
    setPositiveMessage("");
    setPositiveSuccess(false);

    if (!difficultThought.trim()) {
      setPositiveMessage("Your original thought is missing.");
      return;
    }

    if (!positiveReframe.trim()) {
      setPositiveMessage("Please generate a positive reframe first.");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setPositiveMessage("Please login before saving this thought.");
      return;
    }

    let user: { id?: number | string };

    try {
      user = JSON.parse(savedUser);
    } catch {
      setPositiveMessage(
        "Your login information is invalid. Please login again."
      );
      return;
    }

    if (!user?.id) {
      setPositiveMessage("User ID was not found. Please login again.");
      return;
    }

    try {
      setPositiveSaving(true);

      const response = await fetch(
        "http://localhost/api/save_positive_thought.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            negative_thought: difficultThought.trim(),
            positive_thought: positiveReframe.trim(),
          }),
        }
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid positive thought save response:", responseText);
        setPositiveMessage(
          "The server returned an invalid response while saving."
        );
        return;
      }

      if (data.success) {
        setDone((currentDone) => ({
          ...currentDone,
          positive: true,
        }));

        setPositiveSuccess(true);
        setPositiveMessage(
          data.message || "Your positive reframe was saved successfully."
        );
      } else {
        setPositiveMessage(
          data.message || "Failed to save your positive thought."
        );
      }
    } catch (error) {
      console.error("Positive thought save error:", error);
      setPositiveMessage(
        "Server connection failed. Make sure Apache is running."
      );
    } finally {
      setPositiveSaving(false);
    }
  };

  const finishPositiveThinking = () => {
    setActiveActivity(null);
    setDifficultThought("");
    setPositiveReframe("");
    setPositiveMessage("");
    setPositiveSuccess(false);
  };

  const tryAnotherPositiveThought = () => {
    setDifficultThought("");
    setPositiveReframe("");
    setPositiveMessage("");
    setPositiveSuccess(false);
  };

  // ==================================================
  // MINDFULNESS FUNCTIONS
  // ==================================================

  const updateMindfulItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  const closeMindfulness = () => {
    if (mindfulSaving) return;
    setActiveActivity(null);
    setMindfulMessage("");
    setMindfulSuccess(false);
  };

  const resetMindfulness = () => {
    setMindfulSeen(["", "", "", "", ""]);
    setMindfulFelt(["", "", "", ""]);
    setMindfulHeard(["", "", ""]);
    setMindfulSmelled(["", ""]);
    setMindfulTasted("");
    setMindfulMessage("");
    setMindfulSuccess(false);
  };

  const saveMindfulness = async () => {
    setMindfulMessage("");
    setMindfulSuccess(false);

    if (
      !mindfulSeen.every((item) => item.trim()) ||
      !mindfulFelt.every((item) => item.trim()) ||
      !mindfulHeard.every((item) => item.trim()) ||
      !mindfulSmelled.every((item) => item.trim()) ||
      !mindfulTasted.trim()
    ) {
      setMindfulMessage("Please complete all 5-4-3-2-1 grounding steps.");
      return;
    }

    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setMindfulMessage("Please login before saving this exercise.");
      return;
    }

    let user: { id?: number | string };
    try {
      user = JSON.parse(savedUser);
    } catch {
      setMindfulMessage("Your login information is invalid. Please login again.");
      return;
    }

    if (!user?.id) {
      setMindfulMessage("User ID was not found. Please login again.");
      return;
    }

    try {
      setMindfulSaving(true);
      const response = await fetch("http://localhost/api/save_mindfulness.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          seen_items: mindfulSeen.join(" | "),
          felt_items: mindfulFelt.join(" | "),
          heard_items: mindfulHeard.join(" | "),
          smelled_items: mindfulSmelled.join(" | "),
          tasted_item: mindfulTasted.trim(),
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid mindfulness response:", responseText);
        setMindfulMessage("The server returned an invalid response.");
        return;
      }

      if (data.success) {
        setDone((currentDone) => ({ ...currentDone, mindful: true }));
        setMindfulSuccess(true);
        setMindfulMessage(data.message || "Mindfulness exercise saved successfully.");
      } else {
        setMindfulMessage(data.message || "Failed to save mindfulness exercise.");
      }
    } catch (error) {
      console.error("Mindfulness save error:", error);
      setMindfulMessage("Server connection failed. Make sure Apache is running.");
    } finally {
      setMindfulSaving(false);
    }
  };

  // ==================================================
  // MOOD TRACKER FUNCTIONS
  // ==================================================
  const getLoggedInUserId = () => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try { return (JSON.parse(saved) as { id?: number | string }).id ?? null; }
    catch { return null; }
  };

  const loadMoodHistory = async () => {
    const userId = getLoggedInUserId();
    if (!userId) { setMoodMessage("Please login before using the Mood Tracker."); return; }
    try {
      setMoodLoading(true);
      const response = await fetch("http://localhost/api/get_moods.php", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }),
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (data.success) setMoodHistory(Array.isArray(data.entries) ? data.entries : []);
      else setMoodMessage(data.message || "Failed to load mood history.");
    } catch (error) {
      console.error("Mood history error:", error);
      setMoodMessage("Could not load mood history. Make sure Apache is running.");
    } finally { setMoodLoading(false); }
  };

  const saveMood = async () => {
    setMoodMessage(""); setMoodSuccess(false);
    if (!selectedMood) { setMoodMessage("Please select how you are feeling."); return; }
    const userId = getLoggedInUserId();
    if (!userId) { setMoodMessage("Please login before saving your mood."); return; }
    try {
      setMoodSaving(true);
      const response = await fetch("http://localhost/api/save_mood.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, mood: selectedMood, note: moodNote.trim() }),
      });
      const data = JSON.parse(await response.text());
      if (data.success) {
        setDone((d) => ({ ...d, mood: true }));
        setMoodSuccess(true); setMoodMessage(data.message || "Mood saved successfully.");
        setSelectedMood(""); setMoodNote(""); await loadMoodHistory();
      } else setMoodMessage(data.message || "Failed to save mood.");
    } catch (error) {
      console.error("Mood save error:", error);
      setMoodMessage("Server connection failed. Make sure Apache is running.");
    } finally { setMoodSaving(false); }
  };

  const closeMoodTracker = () => {
    if (moodSaving) return;
    setActiveActivity(null); setMoodMessage(""); setMoodSuccess(false);
  };
  const getMoodEmoji = (mood: string) => moodOptions.find((m) => m.mood === mood)?.emoji || "🙂";
  const getMoodScore = (mood: string) => moodOptions.find((m) => m.mood === mood)?.score || 3;
  const getMoodInsight = () => {
    if (!moodHistory.length) return "Save a mood entry to see your recent pattern.";
    const avg = moodHistory.reduce((sum, e) => sum + getMoodScore(e.mood), 0) / moodHistory.length;
    const latest = moodHistory[0].mood;
    if (avg >= 4.5) return `Your recent mood pattern looks positive, with ${latest} as your latest check-in. Keep repeating one routine that supports you.`;
    if (avg >= 3) return `Your recent moods look mixed, with ${latest} as your latest check-in. A short walk or breathing break may help you reset.`;
    return `Your recent entries suggest things may have felt difficult, with ${latest} as your latest mood. Be gentle with yourself and consider grounding or talking to someone supportive.`;
  };


  // ==================================================
  // DAILY CHALLENGE FUNCTIONS
  // ==================================================

  const loadDailyChallenge = async () => {
    const userId = getLoggedInUserId();

    if (!userId) {
      setChallengeMessage("Please login before using Daily Challenge.");
      return;
    }

    try {
      setChallengeLoading(true);
      setChallengeMessage("");
      setChallengeSuccess(false);

      const response = await fetch(
        "http://localhost/api/daily_challenge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            action: "get",
          }),
        }
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Invalid daily challenge response:", responseText);
        setChallengeMessage(
          "The server returned an invalid response. Check daily_challenge.php."
        );
        return;
      }

      if (data.success) {
        setDailyChallenge(String(data.challenge || ""));
        setChallengeDate(String(data.challenge_date || ""));
        setChallengeStreak(Number(data.streak || 0));
        setChallengeCompletedToday(Boolean(data.completed_today));
        setSavedChallengeAnswer(String(data.answer || ""));

        if (data.completed_today) {
          setDone((currentDone) => ({
            ...currentDone,
            challenge: true,
          }));
        }
      } else {
        setChallengeMessage(
          data.message || "Failed to load today's challenge."
        );
      }
    } catch (error) {
      console.error("Daily challenge load error:", error);
      setChallengeMessage(
        "Server connection failed. Make sure Apache is running."
      );
    } finally {
      setChallengeLoading(false);
    }
  };

  const completeDailyChallenge = async () => {
    const userId = getLoggedInUserId();
    const answer = challengeAnswer.trim();

    if (!userId) {
      setChallengeMessage("Please login before completing the challenge.");
      return;
    }

    if (!answer) {
      setChallengeSuccess(false);
      setChallengeMessage("Please write your answer before completing the challenge.");
      return;
    }

    try {
      setChallengeCompleting(true);
      setChallengeMessage("");
      setChallengeSuccess(false);

      const response = await fetch(
        "http://localhost/api/daily_challenge.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            action: "complete",
            answer: answer,
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "Invalid daily challenge completion response:",
          responseText
        );

        setChallengeMessage(
          "The server returned an invalid response while completing the challenge."
        );

        return;
      }

      if (data.success) {
        setDailyChallenge(
          String(data.challenge || dailyChallenge)
        );

        setChallengeDate(
          String(data.challenge_date || challengeDate)
        );

        setChallengeStreak(
          Number(data.streak || 0)
        );

        setSavedChallengeAnswer(
          String(data.answer || answer)
        );

        setChallengeCompletedToday(true);
        setChallengeSuccess(true);
        setChallengeAnswer("");

        setChallengeMessage(
          data.already_completed
            ? "You already completed today's challenge."
            : data.message ||
            "Daily challenge completed successfully."
        );

        setDone((currentDone) => ({
          ...currentDone,
          challenge: true,
        }));
      } else {
        setChallengeSuccess(false);

        setChallengeMessage(
          data.message ||
          "Failed to complete today's challenge."
        );
      }
    } catch (error) {
      console.error(
        "Daily challenge completion error:",
        error
      );

      setChallengeSuccess(false);

      setChallengeMessage(
        "Server connection failed. Make sure Apache is running."
      );
    } finally {
      setChallengeCompleting(false);
    }
  };

  const closeDailyChallenge = () => {
    if (challengeLoading || challengeCompleting) return;

    setActiveActivity(null);
    setChallengeMessage("");
    setChallengeSuccess(false);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(
      window.location.search
    );

    const requestedActivity =
      searchParams.get("activity");

    const allowedActivities = [
      "breath",
      "gratitude",
      "reflect",
      "positive",
      "mindful",
      "mood",
      "challenge",
    ];

    if (
      requestedActivity &&
      allowedActivities.includes(requestedActivity)
    ) {
      openActivity(requestedActivity);
    }
  }, []);

  const formatChallengeDate = (dateValue: string) => {
    if (!dateValue) return "Today";

    const parsedDate = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return parsedDate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* ==================================================
          ACTIVITIES CARDS
      ================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/75 px-5 py-3 text-sm font-semibold text-[#65718a] shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#776bc8]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link> */}
        <SectionHeader
          eyebrow="Activities"
          title={
            <>
              Tiny actions,{" "}
              <span className="text-gradient">big shifts</span>
            </>
          }
          subtitle="Pick one. Just one. Small consistent steps build a beautiful wellness practice."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activityItem, index) => {
            const completed = !!done[activityItem.id];

            return (
              
              <Card
                key={activityItem.id}
                className="glass animate-fade-in-up border-white/60 dark:border-white/8 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activityItem.color} shadow-soft`}
                  >
                    <activityItem.icon className="h-7 w-7 text-white" />
                  </div>

                  {completed && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold">
                  {activityItem.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {activityItem.desc}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>

                    <span>
                      {completed ? 100 : activityItem.progress}%
                    </span>
                  </div>

                  <Progress
                    value={
                      completed ? 100 : activityItem.progress
                    }
                    className="h-1.5"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {activityItem.mins} min
                  </span>

                  <Button
                    size="sm"
                    variant={completed ? "outline" : "default"}
                    className={
                      completed
                        ? "rounded-full"
                        : "rounded-full bg-gradient-primary text-primary-foreground"
                    }
                    onClick={() => openActivity(activityItem.id)}
                  >
                    {completed ? (
                      "Done ✓"
                    ) : (
                      <>
                        <Play className="mr-1 h-3.5 w-3.5" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          BREATHING MODAL
      ================================================== */}

      {activeActivity === "breath" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-lg rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeBreathingExercise}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-mint shadow-soft">
                <Wind className="h-7 w-7 text-white" />
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold">
                4-7-8 Breathing
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Calm your body and mind with three gentle breathing
                rounds.
              </p>
            </div>

            <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center">
              <div
                className={`flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-sky/70 via-mint/60 to-lavender/70 shadow-glow transition-transform duration-1000 ease-in-out ${getCircleSize()}`}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-background/80 text-center backdrop-blur-md">
                  <span className="text-xl font-semibold">
                    {getBreathingTitle()}
                  </span>

                  {breathingPhase !== "ready" &&
                    breathingPhase !== "complete" && (
                      <span className="mt-1 text-4xl font-bold text-primary">
                        {breathingSeconds}
                      </span>
                    )}

                  {breathingPhase === "ready" && (
                    <Wind className="mt-2 h-8 w-8 text-primary" />
                  )}

                  {breathingPhase === "complete" && (
                    <CheckCircle2 className="mt-2 h-10 w-10 text-primary" />
                  )}
                </div>
              </div>

              <p className="mt-8 text-center text-base font-medium">
                {getBreathingInstruction()}
              </p>

              {breathingPhase !== "ready" &&
                breathingPhase !== "complete" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Round {breathingRound} of {totalBreathingRounds}
                  </p>
                )}

              <div className="mt-5 flex w-full max-w-xs gap-2">
                {[1, 2, 3].map((round) => (
                  <div
                    key={round}
                    className={`h-2 flex-1 rounded-full transition-all ${round < breathingRound ||
                      breathingPhase === "complete"
                      ? "bg-primary"
                      : round === breathingRound &&
                        breathingPhase !== "ready"
                        ? "bg-primary/60"
                        : "bg-muted"
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {breathingPhase === "ready" && (
                <Button
                  onClick={startBreathingExercise}
                  className="rounded-full bg-gradient-primary px-8 text-primary-foreground"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Begin Exercise
                </Button>
              )}

              {breathingPhase === "complete" && (
                <>
                  <Button
                    variant="outline"
                    onClick={restartBreathingExercise}
                    className="rounded-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>

                  <Button
                    onClick={closeBreathingExercise}
                    className="rounded-full bg-gradient-primary text-primary-foreground"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Finish
                  </Button>
                </>
              )}

              {breathingRunning &&
                breathingPhase !== "ready" &&
                breathingPhase !== "complete" && (
                  <Button
                    variant="outline"
                    onClick={restartBreathingExercise}
                    className="rounded-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          GRATITUDE MODAL
      ================================================== */}

      {activeActivity === "gratitude" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeGratitudeJournal}
              disabled={gratitudeSaving}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-peach to-lavender shadow-soft">
                <BookHeart className="h-7 w-7 text-white" />
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold">
                Gratitude Journal
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Write three things that made you feel thankful today.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {[
                {
                  id: "gratitude-one",
                  label: "1. I am grateful for...",
                  value: gratitudeOne,
                  setter: setGratitudeOne,
                },
                {
                  id: "gratitude-two",
                  label: "2. Something that made me smile...",
                  value: gratitudeTwo,
                  setter: setGratitudeTwo,
                },
                {
                  id: "gratitude-three",
                  label: "3. A person, place, or moment I appreciate...",
                  value: gratitudeThree,
                  setter: setGratitudeThree,
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-2 block text-sm font-semibold"
                  >
                    {field.label}
                  </label>

                  <textarea
                    id={field.id}
                    value={field.value}
                    onChange={(event) =>
                      field.setter(event.target.value)
                    }
                    disabled={gratitudeSaving || gratitudeSuccess}
                    maxLength={500}
                    rows={3}
                    placeholder="Write your thankful thought..."
                    className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                  />

                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {field.value.length}/500
                  </p>
                </div>
              ))}
            </div>

            {gratitudeMessage && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${gratitudeSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
                  }`}
              >
                {gratitudeMessage}
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeGratitudeJournal}
                disabled={gratitudeSaving}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                onClick={saveGratitudeJournal}
                disabled={gratitudeSaving || gratitudeSuccess}
                className="rounded-full bg-gradient-primary text-primary-foreground"
              >
                {gratitudeSaving ? "Saving..." : "Save Journal"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          DAILY REFLECTION MODAL
      ================================================== */}

      {activeActivity === "reflect" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeDailyReflection}
              disabled={reflectionLoading}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-sky shadow-soft">
                <Sparkles className="h-7 w-7 text-white" />
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold">
                Daily Reflection
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Reflect on your day and receive a gentle response from
                Bloom AI.
              </p>
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold">
                How are you feeling right now?
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {reflectionMoods.map((moodItem) => (
                  <button
                    key={moodItem.value}
                    type="button"
                    disabled={reflectionLoading || reflectionSuccess}
                    onClick={() =>
                      setReflectionMood(moodItem.value)
                    }
                    className={`rounded-2xl border p-3 text-center transition ${reflectionMood === moodItem.value
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="block text-2xl">
                      {moodItem.emoji}
                    </span>

                    <span className="mt-1 block text-xs font-medium">
                      {moodItem.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="daily-reflection"
                className="mb-2 block text-sm font-semibold"
              >
                How was your day today?
              </label>

              <textarea
                id="daily-reflection"
                value={reflectionText}
                onChange={(event) =>
                  setReflectionText(event.target.value)
                }
                disabled={reflectionLoading || reflectionSuccess}
                maxLength={1500}
                rows={7}
                placeholder="Write about what happened, how you felt, what went well, or what was difficult..."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
              />

              <p className="mt-1 text-right text-xs text-muted-foreground">
                {reflectionText.length}/1500
              </p>
            </div>

            {reflectionAiResponse && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Bloom's Reflection
                  </h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {reflectionAiResponse}
                </p>
              </div>
            )}

            {reflectionMessage && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${reflectionSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {reflectionSuccess && (
                    <CheckCircle2 className="h-5 w-5" />
                  )}

                  <span>{reflectionMessage}</span>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {!reflectionSuccess && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDailyReflection}
                  disabled={reflectionLoading}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
              )}

              {reflectionSuccess ? (
                <Button
                  type="button"
                  onClick={finishDailyReflection}
                  className="rounded-full bg-gradient-primary px-8 text-primary-foreground"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submitDailyReflection}
                  disabled={reflectionLoading}
                  className="rounded-full bg-gradient-primary px-7 text-primary-foreground"
                >
                  {reflectionLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Bloom is reflecting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Reflection
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          POSITIVE THINKING MODAL
      ================================================== */}

      {activeActivity === "positive" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closePositiveThinking}
              disabled={positiveLoading || positiveSaving}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close positive thinking exercise"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-peach to-mint shadow-soft">
                <Sun className="h-7 w-7 text-white" />
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold">
                Positive Thinking
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Write a difficult thought and let Bloom help you turn it into
                a more balanced and supportive perspective.
              </p>
            </div>

            <div className="mt-7">
              <label
                htmlFor="difficult-thought"
                className="mb-2 block text-sm font-semibold"
              >
                What difficult thought is on your mind?
              </label>

              <textarea
                id="difficult-thought"
                value={difficultThought}
                onChange={(event) => {
                  setDifficultThought(event.target.value);

                  if (positiveReframe) {
                    setPositiveReframe("");
                    setPositiveMessage("");
                    setPositiveSuccess(false);
                  }
                }}
                disabled={positiveLoading || positiveSaving || positiveSuccess}
                maxLength={1000}
                rows={6}
                placeholder="For example: I am worried that I will fail my exam..."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
              />

              <p className="mt-1 text-right text-xs text-muted-foreground">
                {difficultThought.length}/1000
              </p>
            </div>

            {positiveReframe && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Bloom's Positive Reframe</h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {positiveReframe}
                </p>
              </div>
            )}

            {positiveMessage && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${positiveSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {positiveSuccess && (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <span>{positiveMessage}</span>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {positiveSuccess ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={tryAnotherPositiveThought}
                    className="rounded-full px-6"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Another
                  </Button>

                  <Button
                    type="button"
                    onClick={finishPositiveThinking}
                    className="rounded-full bg-gradient-primary px-8 text-primary-foreground"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Finish
                  </Button>
                </>
              ) : positiveReframe ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPositiveReframe("");
                      setPositiveMessage("");
                    }}
                    disabled={positiveSaving}
                    className="rounded-full px-6"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reframe Again
                  </Button>

                  <Button
                    type="button"
                    onClick={savePositiveThought}
                    disabled={positiveSaving}
                    className="rounded-full bg-gradient-primary px-7 text-primary-foreground"
                  >
                    {positiveSaving ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save Thought
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePositiveThinking}
                    disabled={positiveLoading}
                    className="rounded-full px-6"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={generatePositiveReframe}
                    disabled={positiveLoading}
                    className="rounded-full bg-gradient-primary px-7 text-primary-foreground"
                  >
                    {positiveLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Bloom is reframing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Reframe with Bloom AI
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ==================================================
          MINDFULNESS MODAL
      ================================================== */}

      {activeActivity === "mindful" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-3xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeMindfulness}
              disabled={mindfulSaving}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-lavender shadow-soft">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">5-4-3-2-1 Grounding</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Notice your surroundings slowly and bring your attention back to the present moment.
              </p>
            </div>

            <div className="mt-7 space-y-6">
              {[
                { title: "5 things you can see", items: mindfulSeen, setter: setMindfulSeen, placeholder: "Something you can see" },
                { title: "4 things you can feel or touch", items: mindfulFelt, setter: setMindfulFelt, placeholder: "Something you can feel" },
                { title: "3 things you can hear", items: mindfulHeard, setter: setMindfulHeard, placeholder: "Something you can hear" },
                { title: "2 things you can smell", items: mindfulSmelled, setter: setMindfulSmelled, placeholder: "Something you can smell" },
              ].map((group) => (
                <div key={group.title} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <h3 className="font-semibold">{group.title}</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.items.map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        value={value}
                        onChange={(event) => updateMindfulItem(group.setter, index, event.target.value)}
                        disabled={mindfulSaving || mindfulSuccess}
                        maxLength={150}
                        placeholder={`${index + 1}. ${group.placeholder}`}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <h3 className="font-semibold">1 thing you can taste</h3>
                <input
                  type="text"
                  value={mindfulTasted}
                  onChange={(event) => setMindfulTasted(event.target.value)}
                  disabled={mindfulSaving || mindfulSuccess}
                  maxLength={150}
                  placeholder="1. Something you can taste"
                  className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                />
              </div>
            </div>

            {mindfulMessage && (
              <div className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${mindfulSuccess ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                <div className="flex items-center justify-center gap-2">
                  {mindfulSuccess && <CheckCircle2 className="h-5 w-5" />}
                  <span>{mindfulMessage}</span>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {mindfulSuccess ? (
                <>
                  <Button type="button" variant="outline" onClick={resetMindfulness} className="rounded-full px-6">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                  <Button type="button" onClick={() => { resetMindfulness(); setActiveActivity(null); }} className="rounded-full bg-gradient-primary px-8 text-primary-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Finish
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={closeMindfulness} disabled={mindfulSaving} className="rounded-full px-6">Cancel</Button>
                  <Button type="button" onClick={saveMindfulness} disabled={mindfulSaving} className="rounded-full bg-gradient-primary px-7 text-primary-foreground">
                    {mindfulSaving ? (<>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving...
                    </>) : (<>
                      <Leaf className="mr-2 h-4 w-4" /> Complete Exercise
                    </>)}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* MOOD TRACKER MODAL */}
      {activeActivity === "mood" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-3xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={closeMoodTracker} disabled={moodSaving} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-mint shadow-soft"><Activity className="h-7 w-7 text-white" /></div>
              <h2 className="mt-4 font-display text-2xl font-bold">Mood Tracker</h2>
              <p className="mt-2 text-sm text-muted-foreground">Check in with yourself and view your seven most recent moods.</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {moodOptions.map((option) => (
                <button key={option.mood} type="button" onClick={() => { setSelectedMood(option.mood); setMoodMessage(""); setMoodSuccess(false); }} disabled={moodSaving}
                  className={`rounded-2xl border p-3 text-center transition ${selectedMood === option.mood ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                  <span className="block text-3xl">{option.emoji}</span><span className="mt-1 block text-xs font-medium">{option.mood}</span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label htmlFor="mood-note" className="mb-2 block text-sm font-semibold">Add a note <span className="font-normal text-muted-foreground">(optional)</span></label>
              <textarea id="mood-note" value={moodNote} onChange={(e) => setMoodNote(e.target.value)} disabled={moodSaving} maxLength={1000} rows={4} placeholder="What is influencing your mood today?" className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <p className="mt-1 text-right text-xs text-muted-foreground">{moodNote.length}/1000</p>
            </div>
            {moodMessage && <div className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${moodSuccess ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{moodMessage}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeMoodTracker} disabled={moodSaving} className="rounded-full">Close</Button>
              <Button onClick={saveMood} disabled={moodSaving} className="rounded-full bg-gradient-primary text-primary-foreground">{moodSaving ? "Saving..." : "Save Mood"}</Button>
            </div>
            <div className="mt-8 border-t border-border pt-7">
              <div className="flex items-center justify-between"><div><h3 className="font-display text-lg font-semibold">Recent Mood History</h3><p className="text-xs text-muted-foreground">Latest seven check-ins</p></div><Button size="sm" variant="outline" onClick={loadMoodHistory} disabled={moodLoading} className="rounded-full">{moodLoading ? "Loading..." : "Refresh"}</Button></div>
              {moodLoading ? <p className="mt-5 text-center text-sm text-muted-foreground">Loading mood history...</p> : !moodHistory.length ? <p className="mt-5 rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">No mood entries yet.</p> : <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{moodHistory.map((entry) => <div key={entry.id} className="rounded-2xl border border-border bg-muted/20 p-4"><div className="flex items-center gap-3"><span className="text-3xl">{getMoodEmoji(entry.mood)}</span><div><p className="font-semibold">{entry.mood}</p><p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p></div></div>{entry.note && <p className="mt-3 text-sm text-foreground/80">{entry.note}</p>}</div>)}</div>
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-semibold">Mood Insight</h3></div><p className="mt-2 text-sm leading-6">{getMoodInsight()}</p></div>
              </>}
            </div>
          </div>
        </div>
      )}


      {/* ==================================================
    DAILY CHALLENGE MODAL
================================================== */}

      {activeActivity === "challenge" && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="relative my-auto w-full max-w-xl rounded-3xl border border-white/60 dark:border-white/8 bg-background p-6 shadow-2xl sm:p-8">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                closeDailyChallenge();

                if (!challengeCompletedToday) {
                  setChallengeAnswer("");
                }
              }}
              disabled={challengeLoading || challengeCompleting}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close daily challenge"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-peach shadow-soft">
                <Trophy className="h-8 w-8 text-white" />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {formatChallengeDate(challengeDate)}
              </p>

              <h2 className="mt-2 font-display text-2xl font-bold">
                Daily Challenge
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                One small action today can strengthen your wellness routine.
              </p>
            </div>

            {/* Challenge */}
            <div className="mt-7 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center">
              {challengeLoading ? (
                <div className="flex min-h-36 flex-col items-center justify-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />

                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading today's challenge...
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-4xl">
                    {challengeCompletedToday ? "🏆" : "🌱"}
                  </span>

                  <p className="mx-auto mt-4 max-w-md text-lg font-semibold leading-7">
                    {dailyChallenge ||
                      "Your daily challenge could not be loaded yet."}
                  </p>

                  {challengeCompletedToday && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed today
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Answer box */}
            {!challengeLoading && dailyChallenge && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="daily-challenge-answer"
                    className="text-sm font-semibold text-foreground"
                  >
                    {challengeCompletedToday
                      ? "Your answer"
                      : "Write your answer"}
                  </label>

                  {!challengeCompletedToday && (
                    <span className="text-xs text-muted-foreground">
                      {challengeAnswer.length}/500
                    </span>
                  )}
                </div>

                {challengeCompletedToday ? (
                  <div className="min-h-28 rounded-2xl border border-green-200 bg-green-50/70 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {savedChallengeAnswer ||
                        challengeAnswer ||
                        "Challenge completed successfully."}
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      id="daily-challenge-answer"
                      value={challengeAnswer}
                      onChange={(event) =>
                        setChallengeAnswer(event.target.value.slice(0, 500))
                      }
                      disabled={challengeCompleting}
                      placeholder="Write your thoughts here..."
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-border bg-white/80 dark:bg-white/5 px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Your answer helps you reflect on today's challenge.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <p className="text-2xl">🔥</p>

                <p className="mt-1 text-2xl font-bold text-primary">
                  {challengeStreak}
                </p>

                <p className="text-xs text-muted-foreground">
                  Day streak
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
                <p className="text-2xl">
                  {challengeCompletedToday ? "✅" : "⏳"}
                </p>

                <p className="mt-1 font-semibold">
                  {challengeCompletedToday ? "Finished" : "In progress"}
                </p>

                <p className="text-xs text-muted-foreground">
                  Today's status
                </p>
              </div>
            </div>

            {/* Success or error message */}
            {challengeMessage && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${challengeSuccess || challengeCompletedToday
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {(challengeSuccess || challengeCompletedToday) && (
                    <CheckCircle2 className="h-5 w-5" />
                  )}

                  <span>{challengeMessage}</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeDailyChallenge();

                  if (!challengeCompletedToday) {
                    setChallengeAnswer("");
                  }
                }}
                disabled={challengeLoading || challengeCompleting}
                className="rounded-full px-6"
              >
                Close
              </Button>

              {!challengeCompletedToday && (
                <Button
                  type="button"
                  onClick={() => {
                    if (!challengeAnswer.trim()) {
                      return;
                    }

                    completeDailyChallenge();
                  }}
                  disabled={
                    challengeLoading ||
                    challengeCompleting ||
                    !dailyChallenge ||
                    !challengeAnswer.trim()
                  }
                  className="rounded-full bg-gradient-primary px-7 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {challengeCompleting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" />
                      Complete Challenge
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}