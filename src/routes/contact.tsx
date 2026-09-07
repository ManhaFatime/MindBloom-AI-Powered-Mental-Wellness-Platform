import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  ShieldCheck,
  MessageCircleHeart,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/SectionHeader";

import {
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact — MindBloom",
      },
      {
        name: "description",
        content:
          "Send a message to the MindBloom team for support, feedback or general enquiries.",
      },
    ],
  }),
  component: ContactPage,
});

type SavedUser = {
  id: number;
  fullname: string;
  email: string;
  role?: "user" | "admin";
};

function ContactPage() {
  const [user, setUser] =
    useState<SavedUser | null>(null);

  const [fullname, setFullname] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return;
    }

    try {
      const parsedUser: SavedUser =
        JSON.parse(savedUser);

      setUser(parsedUser);
      setFullname(
        parsedUser.fullname || ""
      );
      setEmail(
        parsedUser.email || ""
      );
    } catch (error) {
      console.error(
        "Contact user session error:",
        error
      );
    }
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      fullname.trim() === "" ||
      email.trim() === "" ||
      subject.trim() === "" ||
      message.trim() === ""
    ) {
      await showError(
        "Missing Information",
        "Please complete all contact form fields."
      );

      return;
    }

    if (
      message.trim().length < 10
    ) {
      await showError(
        "Message Too Short",
        "Please enter at least 10 characters in your message."
      );

      return;
    }

    try {
      setSending(true);

      const response = await fetch(
        "http://localhost/api/submit_contact.php",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id || 0,
            fullname: fullname.trim(),
            email: email
              .trim()
              .toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        await showError(
          "Unable to Send Message",
          data.message ||
            "Your message could not be sent."
        );

        return;
      }

      setSubject("");
      setMessage("");

      if (!user) {
        setFullname("");
        setEmail("");
      }

      await showSuccess(
        "Message Sent Successfully 🌸",
        data.email_sent
          ? "Your message was saved and delivered to the MindBloom team."
          : "Your message was saved successfully. The MindBloom team can review it from the admin dashboard."
      );
    } catch (error) {
      console.error(
        "Contact submit error:",
        error
      );

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server. Please check Apache and MySQL."
      );
    } finally {
      setSending(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      label: "Email",
      value:
        "mindbloomaichatbot@gmail.com",
      description:
        "For support, feedback and general questions.",
    },
    {
      icon: Phone,
      label: "Support",
      value:
        "Online assistance",
      description:
        "Use the contact form and our team will review your message.",
    },
    {
      icon: MapPin,
      label: "Availability",
      value:
        "Remote-first",
      description:
        "MindBloom support is available online for registered users and visitors.",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#ddd7fa]/25 dark:bg-[#3d2d7a]/15 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#caedf5]/30 dark:bg-[#1a3d5c]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Contact MindBloom"
          title={
            <>
              Let&apos;s{" "}
              <span className="text-gradient">
                connect
              </span>
            </>
          }
          subtitle="Send us your questions, feedback or support request. Every message is securely saved for the MindBloom administration team."
        />

        <div className="mt-12 grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            {contactCards.map(
              (contactCard) => {
                const Icon =
                  contactCard.icon;

                return (
                  <Card
                    key={contactCard.label}
                    className="group flex items-start gap-4 rounded-[26px] border border-white/80 dark:border-white/8 bg-white/70 dark:bg-white/4 p-5 shadow-[0_16px_42px_rgba(120,126,190,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(120,126,190,0.14)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-soft">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7fd8] dark:text-[#a99df0]">
                        {contactCard.label}
                      </p>

                      <p className="mt-1 font-semibold text-[#273149] dark:text-[#e8eaf5]">
                        {contactCard.value}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                        {
                          contactCard.description
                        }
                      </p>
                    </div>
                  </Card>
                );
              }
            )}

            <Card className="overflow-hidden rounded-[28px] border border-white/85 dark:border-white/8 bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] dark:from-white/6 dark:via-white/4 dark:to-white/6 p-6 shadow-[0_18px_48px_rgba(120,126,190,0.10)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/8 text-[#8174d2] dark:text-[#a99df0] shadow-soft">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h3 className="mt-5 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                Your message is secure
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#65718a] dark:text-[#8892a8]">
                Contact submissions are stored in the MindBloom database and made available only to the administrator.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#4c9d8a] dark:text-[#6fc5ad]">
                <MessageCircleHeart className="h-4 w-4" />
                Secure support communication
              </div>
            </Card>
          </div>

          <Card className="rounded-[32px] border border-white/85 dark:border-white/8 bg-white/75 dark:bg-white/4 p-7 shadow-[0_24px_65px_rgba(120,126,190,0.13)] backdrop-blur-2xl sm:p-9">
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f0edff] dark:bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] dark:text-[#a99df0]">
                <Sparkles className="h-4 w-4" />
                Send a Message
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                How can we help?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                Fill out the form and your message will be saved in the MindBloom admin dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">
                    Full Name
                  </Label>

                  <Input
                    id="contact-name"
                    value={fullname}
                    onChange={(event) =>
                      setFullname(
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                    disabled={sending}
                    className="h-12 rounded-xl border-[#ddd8f7] dark:border-white/10 bg-white/82 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    Email Address
                  </Label>

                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    disabled={sending}
                    className="h-12 rounded-xl border-[#ddd8f7] dark:border-white/10 bg-white/82 dark:bg-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject">
                  Subject
                </Label>

                <Input
                  id="contact-subject"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  placeholder="How can we help?"
                  disabled={sending}
                  maxLength={180}
                  className="h-12 rounded-xl border-[#ddd8f7] dark:border-white/10 bg-white/82 dark:bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">
                  Message
                </Label>

                <Textarea
                  id="contact-message"
                  rows={7}
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Tell us what's on your mind..."
                  disabled={sending}
                  className="resize-none rounded-xl border-[#ddd8f7] dark:border-white/10 bg-white/82 dark:bg-white/5"
                />

                <p className="text-right text-xs text-[#8a94a8] dark:text-[#6b7590]">
                  {
                    message.trim()
                      .length
                  }{" "}
                  characters
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className="min-h-12 rounded-full bg-gradient-primary px-7 text-primary-foreground shadow-glow"
              >
                <Send className="mr-2 h-4 w-4" />

                {sending
                  ? "Sending Message..."
                  : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}