import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Sparkles,
  Sun,
  Heart,
  Wind,
  Quote,
  Send,
  Smile,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  X,
  History,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/companion")({
  head: () => ({
    meta: [{ title: "AI Companion — MindBloom" }],
  }),
  component: CompanionPage,
});

type Msg = {
  role: "bot" | "user";
  text: string;
};

interface SpeechRecognitionEventResult extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventResult extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventResult) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventResult) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const starterMessages: Msg[] = [
  {
    role: "bot",
    text: "Hi, I'm Bloom 🌸 your wellness companion. How are you feeling today?",
  },
];

const quickReplies = [
  "I feel anxious",
  "I'm doing okay",
  "Need motivation",
  "Help me relax",
];

const emojis = [
  "😀",
  "😊",
  "🥰",
  "😍",
  "😂",
  "🙂",
  "😔",
  "😢",
  "😭",
  "🥺",
  "😞",
  "💔",
  "😰",
  "😟",
  "😨",
  "😴",
  "😡",
  "🤯",
  "❤️",
  "🤗",
  "🙏",
  "✨",
  "🌸",
  "💙",
];

const features = [
  {
    icon: MessageCircle,
    title: "Empathetic chat",
    desc: "Conversations that feel warm and human.",
  },
  {
    icon: Sun,
    title: "Daily motivation",
    desc: "Personalized boosts to start your day right.",
  },
  {
    icon: Heart,
    title: "Mood check-ins",
    desc: "Quick prompts to track how you're feeling.",
  },
  {
    icon: Wind,
    title: "Calm techniques",
    desc: "Guided breathwork and grounding on demand.",
  },
];

const dailyQuotes = [
  "Small steps every day lead to big changes.",
  "You are allowed to be both a masterpiece and a work in progress.",
  "Breathe. You are exactly where you need to be.",
];

function CompanionPage() {
  const navigate = useNavigate();

  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(starterMessages);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  function getCurrentUserId(): number | null {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      const id = Number(user?.id);

      if (!id || Number.isNaN(id)) {
        return null;
      }

      return id;
    } catch {
      return null;
    }
  }

  async function createConversation(
    firstMessage: string,
    userId: number,
  ): Promise<number | null> {
    try {
      const title =
        firstMessage.length > 45
          ? `${firstMessage.slice(0, 45)}...`
          : firstMessage;

      const response = await fetch(
        "http://localhost/api/chat/create_conversation.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            title,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Create conversation failed: ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.success || !data.conversation_id) {
        console.error("Create conversation response:", data);
        return null;
      }

      const newConversationId = Number(data.conversation_id);

      setConversationId(newConversationId);

      return newConversationId;
    } catch (error) {
      console.error("Create conversation error:", error);
      return null;
    }
  }

  async function saveMessage(
    currentConversationId: number,
    userId: number,
    sender: "user" | "bot",
    message: string,
  ) {
    try {
      const response = await fetch(
        "http://localhost/api/chat/save_message.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: currentConversationId,
            user_id: userId,
            sender,
            message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Save message failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        console.error("Save message response:", data);
      }
    } catch (error) {
      console.error("Save message error:", error);
    }
  }

  async function updateConversation(
    currentConversationId: number,
    userId: number,
  ) {
    try {
      const response = await fetch(
        "http://localhost/api/chat/update_conversation.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: currentConversationId,
            user_id: userId,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          "Update conversation failed:",
          response.status,
        );
      }
    } catch (error) {
      console.error("Update conversation error:", error);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, isListening]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
      setShowEmojiPicker(false);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);

      const lastResult = event.results[event.results.length - 1];

      if (lastResult?.isFinal) {
        const finalText = transcript.trim();

        setInput("");

        if (finalText) {
          void send(finalText);
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission blocked hai. Browser settings se microphone allow karein.",
        );
      } else if (event.error === "no-speech") {
        setVoiceError(
          "Koi awaaz detect nahi hui. Dobara bol kar try karein.",
        );
      } else if (event.error === "audio-capture") {
        setVoiceError("Microphone detect nahi hua.");
      } else if (event.error === "network") {
        setVoiceError(
          "Voice recognition ke liye internet connection required hai.",
        );
      } else {
        setVoiceError("Voice recognition start nahi ho saki.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startConversation = () => {
    setChatStarted(true);

    window.setTimeout(() => {
      const y =
        (chatRef.current?.getBoundingClientRect().top || 0) +
        window.scrollY -
        110;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 100);
  };

  function detectSpeechLanguage(text: string) {
    const urduCharacters = /[\u0600-\u06ff]/;

    if (urduCharacters.test(text)) {
      return "ur-PK";
    }

    return "en-US";
  }

  function chooseVoice(language: string) {
    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) {
      return null;
    }

    const normalizedLanguage = language.toLowerCase();

    const exactVoice = voices.find(
      (voice) => voice.lang.toLowerCase() === normalizedLanguage,
    );

    if (exactVoice) {
      return exactVoice;
    }

    const languagePrefix = normalizedLanguage.split("-")[0];

    const matchingVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(languagePrefix),
    );

    if (matchingVoice) {
      return matchingVoice;
    }

    return (
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("en"),
      ) || voices[0]
    );
  }

  function speakText(text: string) {
    if (!voiceEnabled || !text.trim() || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const speech = new SpeechSynthesisUtterance(cleanText);

    const language = detectSpeechLanguage(cleanText);

    const selectedVoice = chooseVoice(language);

    speech.lang = language;
    speech.rate = language.startsWith("ur") ? 0.82 : 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    if (selectedVoice) {
      speech.voice = selectedVoice;
    }

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function toggleVoiceOutput() {
    setVoiceEnabled((current) => {
      const nextValue = !current;

      if (!nextValue) {
        stopSpeaking();
      }

      return nextValue;
    });
  }

  function startListening() {
    if (!speechSupported || !recognitionRef.current) {
      setVoiceError(
        "Voice recognition is browser mein supported nahi. Chrome ya Edge use karein.",
      );

      return;
    }

    stopSpeaking();
    setShowEmojiPicker(false);
    setVoiceError("");

    try {
      recognitionRef.current.start();
    } catch {
      recognitionRef.current.stop();

      window.setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch {
          setVoiceError(
            "Microphone pehle se active hai. Thori dair baad try karein.",
          );
        }
      }, 200);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function send(text: string) {
    const trimmedText = text.trim();

    if (!trimmedText || typing) {
      return;
    }

    stopSpeaking();
    setShowEmojiPicker(false);

    const userId = getCurrentUserId();

    let activeConversationId = conversationId;

    if (userId && !activeConversationId) {
      activeConversationId = await createConversation(
        trimmedText,
        userId,
      );
    }

    const newMessages: Msg[] = [
      ...messages,
      {
        role: "user",
        text: trimmedText,
      },
    ];

    setMessages(newMessages);
    setInput("");
    setTyping(true);
    setVoiceError("");

    if (userId && activeConversationId) {
      await saveMessage(
        activeConversationId,
        userId,
        "user",
        trimmedText,
      );
    }

    try {
      const response = await fetch(
        "http://localhost/api/chat.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedText,
            history: newMessages,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      const botReply =
        data.reply || "I'm here for you. Please tell me more.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "bot",
          text: botReply,
        },
      ]);

      if (userId && activeConversationId) {
        await saveMessage(
          activeConversationId,
          userId,
          "bot",
          botReply,
        );

        await updateConversation(
          activeConversationId,
          userId,
        );
      }

      speakText(botReply);
    } catch (error) {
      console.error("Bloom AI error:", error);

      const errorMessage =
        "Sorry, I couldn't connect to Bloom AI. Please try again.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "bot",
          text: errorMessage,
        },
      ]);

      speakText(errorMessage);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {!chatStarted && (
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Bot className="h-3.5 w-3.5" />
              Meet Bloom
            </span>

            <h1 className="mt-4 font-display text-4xl font-bold leading-tight lg:text-6xl">
              A <span className="text-gradient">friendly companion</span>
              <br />
              always by your side
            </h1>

            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Bloom listens without judgment, offers gentle guidance, and helps
              you build a kinder inner voice — anytime you need it.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                onClick={startConversation}
                size="lg"
                className="rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Start a Conversation
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() =>
                  navigate({
                    to: "/chat-history",
                  })
                }
                className="rounded-full border-primary/25 bg-background/50 px-6 shadow-card backdrop-blur-md transition hover:border-primary/50 hover:bg-primary/10"
              >
                <History className="mr-2 h-4 w-4" />
                Chat History
              </Button>
            </div>
          </div>

          <Card className="glass-strong rounded-3xl border-white/60 p-6 shadow-glass dark:border-white/10">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>

              <div>
                <p className="font-semibold">Bloom AI</p>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  Online
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {starterMessages.map((message, index) => (
                <div key={index} className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/90 px-4 py-2.5 text-sm shadow-card dark:bg-white/10">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {chatStarted && (
        <Card
          ref={chatRef}
          className="glass-strong flex min-h-[90vh] flex-col overflow-hidden rounded-3xl border-white/60 shadow-glass dark:border-white/10"
        >
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25">
                  <Sparkles className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="font-display text-3xl font-bold">
                    Bloom AI
                  </h2>

                  <p className="flex items-center gap-2 text-sm opacity-90">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-300" />

                    {isListening
                      ? "Listening to you..."
                      : isSpeaking
                        ? "Bloom is speaking..."
                        : "Your full-screen wellness companion"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/chat-history",
                    })
                  }
                  className="flex h-10 items-center gap-2 rounded-full bg-white/20 px-4 text-sm font-medium transition hover:bg-white/30"
                  title="View chat history"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </button>

                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                    title="Stop speaking"
                    aria-label="Stop speaking"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleVoiceOutput}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                  title={
                    voiceEnabled
                      ? "Turn voice off"
                      : "Turn voice on"
                  }
                  aria-label={
                    voiceEnabled
                      ? "Turn voice off"
                      : "Turn voice on"
                  }
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white/50 to-sky/10 p-6 dark:from-white/5 dark:to-transparent"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-3xl px-5 py-3 text-base shadow-card ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-primary text-primary-foreground"
                      : "rounded-bl-md bg-white/95 text-foreground dark:bg-white/10"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-3xl rounded-bl-md bg-white/95 px-5 py-4 shadow-card dark:bg-white/10">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/60" />

                  <span
                    className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/60"
                    style={{ animationDelay: "150ms" }}
                  />

                  <span
                    className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/60"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            {isListening && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-3xl rounded-br-md bg-red-50 px-5 py-3 text-sm text-red-600 shadow-card dark:bg-red-900/30 dark:text-red-400">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>

                  Listening...
                </div>
              </div>
            )}
          </div>

          {voiceError && (
            <div className="border-t border-red-100 bg-red-50 px-5 py-2 text-sm text-red-600 dark:border-red-800/30 dark:bg-red-900/30 dark:text-red-400">
              {voiceError}
            </div>
          )}

          <div className="flex flex-wrap gap-2 bg-white/60 px-5 py-3 dark:bg-white/5">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void send(reply)}
                disabled={typing || isListening}
                className="rounded-full bg-white px-4 py-2 text-sm shadow-card transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/8 dark:hover:bg-white/12"
              >
                {reply}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="relative flex gap-3 border-t border-border/40 bg-white/80 p-5 dark:border-white/8 dark:bg-white/5"
          >
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-5 z-50 w-80 rounded-2xl border border-border/50 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#1a2140]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground/70">
                    Choose how you feel
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Close emoji picker"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid max-h-52 grid-cols-6 gap-1 overflow-y-auto">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInput((currentInput) => currentInput + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="rounded-lg p-2 text-2xl transition hover:scale-110 hover:bg-primary/10"
                      aria-label={`Add ${emoji} emoji`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setShowEmojiPicker((current) => !current)
              }
              className={`self-center rounded-full p-2 transition ${
                showEmojiPicker
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              aria-label="Open emoji picker"
              title="Choose an emoji"
            >
              <Smile className="h-6 w-6" />
            </button>

            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : "Share how you feel..."
              }
              disabled={typing}
              className="h-12 border-0 bg-white focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/8"
            />

            <Button
              type="button"
              size="icon"
              onClick={
                isListening ? stopListening : startListening
              }
              disabled={typing}
              className={`h-12 w-12 shrink-0 transition-all ${
                isListening
                  ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-primary shadow-card hover:bg-primary/10 dark:bg-white/8"
              }`}
              title={
                isListening
                  ? "Stop listening"
                  : "Speak to Bloom"
              }
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || typing || isListening}
              className="h-12 bg-gradient-primary px-5"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </Card>
      )}

      {!chatStarted && (
        <>
          <div className="mt-24">
            <SectionHeader
              eyebrow="Capabilities"
              title="What Bloom can do for you"
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="glass border-white/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-white/8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-mint-sky">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-24 grid gap-5 md:grid-cols-3">
            {dailyQuotes.map((quote, index) => (
              <Card
                key={index}
                className="glass-strong border-white/60 p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-white/8"
              >
                <Quote className="h-7 w-7 text-primary/40" />

                <p className="mt-3 font-display text-lg">
                  {quote}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}