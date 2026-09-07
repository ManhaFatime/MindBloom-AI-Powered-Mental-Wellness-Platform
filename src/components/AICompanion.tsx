import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Smile,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function AICompanion() {
  const [open, setOpen] = useState(false);

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

  const scrollRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /*
    Logged-in user localStorage se get karte hain.
  */

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

  /*
    New conversation database mein create karta hai.
  */

  async function createConversation(
    firstMessage: string,
    userId: number
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
        }
      );

      if (!response.ok) {
        throw new Error(
          `Conversation request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success || !data.conversation_id) {
        console.error("Conversation creation failed:", data);
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

  /*
    User ya Bloom AI ka message database mein save karta hai.
  */

  async function saveMessage(
    currentConversationId: number,
    userId: number,
    sender: "user" | "bot",
    message: string
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
        }
      );

      if (!response.ok) {
        throw new Error(
          `Save message failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        console.error("Message database save failed:", data);
      }
    } catch (error) {
      console.error("Save message error:", error);
    }
  }

  /*
    Conversation ka updated_at refresh karta hai.
  */

  async function updateConversation(
    currentConversationId: number,
    userId: number
  ) {
    try {
      await fetch(
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
        }
      );
    } catch (error) {
      console.error("Update conversation error:", error);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);

      return;
    }

    const recognition = new SpeechRecognitionAPI();

    /*
      en-US English ke liye hai.
      Urdu ke liye isay "ur-PK" kar sakte hain.
    */

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);

      setVoiceError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);

      const lastResult =
        event.results[event.results.length - 1];

      if (lastResult?.isFinal) {
        const finalText = transcript.trim();

        setInput("");

        if (finalText) {
          send(finalText);
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission was blocked. Please allow microphone access."
        );
      } else if (event.error === "no-speech") {
        setVoiceError(
          "No voice was detected. Please speak again."
        );
      } else if (event.error === "audio-capture") {
        setVoiceError(
          "No microphone was found on this device."
        );
      } else if (event.error === "network") {
        setVoiceError(
          "Voice recognition needs an internet connection. Please try again."
        );
      } else {
        setVoiceError(
          "Voice recognition could not start. Please try again."
        );
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

  function detectSpeechLanguage(text: string) {
    const urduCharacters = /[\u0600-\u06FF]/;

    if (urduCharacters.test(text)) {
      return "ur-PK";
    }

    return "en-US";
  }

  function chooseVoice(language: string) {
    const voices =
      window.speechSynthesis.getVoices();

    if (!voices.length) {
      return null;
    }

    const exactLanguageVoice = voices.find(
      (voice) =>
        voice.lang.toLowerCase() ===
        language.toLowerCase()
    );

    if (exactLanguageVoice) {
      return exactLanguageVoice;
    }

    const languagePrefix =
      language.split("-")[0].toLowerCase();

    const matchingVoice = voices.find((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith(languagePrefix)
    );

    if (matchingVoice) {
      return matchingVoice;
    }

    return (
      voices.find((voice) =>
        voice.lang.startsWith("en")
      ) || voices[0]
    );
  }

  function speakText(text: string) {
    if (
      !voiceEnabled ||
      !text.trim() ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const speech =
      new SpeechSynthesisUtterance(cleanText);

    const language =
      detectSpeechLanguage(cleanText);

    const selectedVoice =
      chooseVoice(language);

    speech.lang = language;

    speech.rate = 0.95;

    speech.pitch = 0.85;

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
    if (
      !speechSupported ||
      !recognitionRef.current
    ) {
      setVoiceError(
        "Voice recognition is not supported in this browser. Please use Chrome or Edge."
      );

      return;
    }

    stopSpeaking();

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
            "Microphone is already active. Please wait and try again."
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

    const userId = getCurrentUserId();

    /*
      Agar user logged in nahi hai to chatbot
      current functionality ke saath still work karega,
      bas history DB mein save nahi hogi.
    */

    let activeConversationId =
      conversationId;

    if (userId && !activeConversationId) {
      activeConversationId =
        await createConversation(
          trimmedText,
          userId
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

    /*
      User message save
    */

    if (userId && activeConversationId) {
      await saveMessage(
        activeConversationId,
        userId,
        "user",
        trimmedText
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
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      const botReply =
        data.reply ||
        "I'm here for you. Please tell me more.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "bot",
          text: botReply,
        },
      ]);

      /*
        Bloom AI reply save
      */

      if (
        userId &&
        activeConversationId
      ) {
        await saveMessage(
          activeConversationId,
          userId,
          "bot",
          botReply
        );

        await updateConversation(
          activeConversationId,
          userId
        );
      }

      speakText(botReply);
    } catch (error) {
      console.error(
        "Bloom AI error:",
        error
      );

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

  function closeChat() {
    setOpen(false);

    stopSpeaking();

    stopListening();
  }

  return (
    <>
      {/* Floating chatbot button */}

      <button
        onClick={() => {
          if (open) {
            closeChat();
          } else {
            setOpen(true);
          }
        }}
        aria-label={
          open
            ? "Close AI Companion"
            : "Open AI Companion"
        }
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105 animate-pulse-soft"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </button>

      {/* Chat panel */}

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl glass-strong shadow-glass animate-fade-in-up sm:w-96 dark:border dark:border-white/10">
          {/* Header */}

          <div className="bg-gradient-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Bloom AI
                  </h3>

                  <p className="flex items-center gap-1 text-xs opacity-90">
                    <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />

                    {isListening
                      ? "Listening to you..."
                      : isSpeaking
                        ? "Bloom is speaking..."
                        : "Always here for you"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    title="Stop speaking"
                    aria-label="Stop Bloom voice"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleVoiceOutput}
                  title={
                    voiceEnabled
                      ? "Turn Bloom voice off"
                      : "Turn Bloom voice on"
                  }
                  aria-label={
                    voiceEnabled
                      ? "Turn Bloom voice off"
                      : "Turn Bloom voice on"
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white/40 dark:from-white/5 to-white/10 dark:to-transparent p-4"
          >
            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      message.role === "user"
                        ? "rounded-br-sm bg-gradient-primary text-primary-foreground"
                        : "rounded-bl-sm bg-white/90 dark:bg-white/10 text-foreground shadow-card"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            )}

            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white/90 dark:bg-white/10 px-3.5 py-3 shadow-card">
                  <span
                    className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                    style={{
                      animationDelay: "0ms",
                    }}
                  />

                  <span
                    className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                    style={{
                      animationDelay:
                        "150ms",
                    }}
                  />

                  <span
                    className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                    style={{
                      animationDelay:
                        "300ms",
                    }}
                  />
                </div>
              </div>
            )}

            {isListening && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-br-sm bg-red-50 dark:bg-red-900/30 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 shadow-card">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>

                  Listening...
                </div>
              </div>
            )}
          </div>

          {/* Voice error */}

          {voiceError && (
            <div className="border-t border-red-100 dark:border-red-800/30 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {voiceError}
            </div>
          )}

          {/* Quick replies */}

          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() =>
                  send(reply)
                }
                disabled={
                  typing || isListening
                }
                className="rounded-full bg-white/80 dark:bg-white/8 px-2.5 py-1 text-xs text-foreground/80 shadow-card transition hover:bg-white dark:hover:bg-white/12 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input area */}

          <form
            onSubmit={(event) => {
              event.preventDefault();

              send(input);

              setShowEmojiPicker(false);
            }}
            className="relative flex gap-2 border-t border-border/40 dark:border-white/8 bg-white/70 dark:bg-white/5 p-3"
          >
            {/* Emoji picker */}

            {showEmojiPicker && (
              <div className="absolute bottom-16 left-3 right-3 z-50 rounded-2xl border border-border/50 dark:border-white/10 bg-white dark:bg-[#1a2140] p-3 shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground/70">
                    Choose how you feel
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowEmojiPicker(
                        false
                      )
                    }
                    className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Close emoji picker"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInput(
                          (
                            currentInput
                          ) =>
                            currentInput +
                            emoji
                        );

                        setShowEmojiPicker(
                          false
                        );
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

            {/* Emoji button */}

            <button
              type="button"
              onClick={() =>
                setShowEmojiPicker(
                  (current) => !current
                )
              }
              className={`self-center rounded-full p-1 transition ${
                showEmojiPicker
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              aria-label="Open emoji picker"
              title="Choose an emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Message input */}

            <Input
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : "Share how you feel..."
              }
              disabled={typing}
              className="border-0 bg-white/80 dark:bg-white/8 focus-visible:ring-1 focus-visible:ring-primary"
            />

            {/* Microphone button */}

            <Button
              type="button"
              size="icon"
              onClick={
                isListening
                  ? stopListening
                  : startListening
              }
              disabled={typing}
              title={
                isListening
                  ? "Stop listening"
                  : "Speak to Bloom"
              }
              className={`shrink-0 transition-all ${
                isListening
                  ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                  : "bg-white dark:bg-white/8 text-primary shadow-card hover:bg-primary/10"
              }`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {/* Send button */}

            <Button
              type="submit"
              size="icon"
              disabled={
                !input.trim() ||
                typing ||
                isListening
              }
              className="shrink-0 bg-gradient-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}