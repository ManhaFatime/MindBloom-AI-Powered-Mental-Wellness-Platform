import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      {
        title: "My Profile — MindBloom",
      },
      {
        name: "description",
        content:
          "Update your MindBloom profile information.",
      },
    ],
  }),
  component: UserProfilePage,
});

type LoggedInUser = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  profile_image?: string;
};

function UserProfilePage() {
  const [user, setUser] =
    useState<LoggedInUser | null>(null);

  const [fullname, setFullname] =
    useState("");

  const [profileImage, setProfileImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser: LoggedInUser =
        JSON.parse(savedUser);

      if (parsedUser.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setUser(parsedUser);
      setFullname(parsedUser.fullname || "");
      setLoading(false);
    } catch (error) {
      console.error(
        "Profile session error:",
        error
      );

      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl("");
      return;
    }

    const objectUrl =
      URL.createObjectURL(profileImage);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profileImage]);

  const profileImageUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (user?.profile_image) {
      return `http://localhost/api/${user.profile_image}`;
    }

    return "";
  }, [previewUrl, user]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (fullname.trim().length < 3) {
      await showError(
        "Invalid Name",
        "Full name must contain at least 3 characters."
      );

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "user_id",
        String(user.id)
      );

      formData.append(
        "email",
        user.email
      );

      formData.append(
        "fullname",
        fullname.trim()
      );

      if (profileImage) {
        formData.append(
          "profile_image",
          profileImage
        );
      }

      const response = await fetch(
        "http://localhost/api/user/update_profile.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Update Failed",
          data.message ||
            "Your profile could not be updated."
        );

        return;
      }

      const updatedUser: LoggedInUser =
        data.user;

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
      setFullname(updatedUser.fullname);
      setProfileImage(null);
      setPreviewUrl("");

      await showSuccess(
        "Profile Updated 🌸",
        data.message ||
          "Your profile was updated successfully."
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8f7] dark:border-white/10 border-t-[#9589df] dark:border-t-[#a99df0]" />

          <p className="mt-4 text-[#7b869a] dark:text-[#8892a8]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#ddd7fa]/30 dark:bg-[#3d2d7a]/15 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#caedf5]/35 dark:bg-[#1a3d5c]/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        {/* Profile heading */}
        <Card className="overflow-hidden rounded-[36px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 shadow-[0_26px_75px_rgba(120,126,190,0.13)] backdrop-blur-2xl">
          <div className="relative bg-gradient-to-br from-[#efedff]/90 dark:from-white/6 via-[#ebf5ff]/85 dark:via-white/4 to-[#eaf9f4]/85 dark:to-white/6 p-7 sm:p-10">
            
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 dark:border-white/10 bg-white/68 dark:bg-white/8 px-4 py-2 text-sm font-semibold text-[#8174d2] dark:text-[#a99df0] shadow-soft">
                <ShieldCheck className="h-4 w-4" />
                MindBloom Member
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] dark:text-[#e8eaf5] sm:text-5xl">
                Edit{" "}
                <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-[#65718a] dark:text-[#8892a8]">
                Update your display name and
                profile picture. Your email address
                remains protected.
              </p>
            </div>
          </div>
        </Card>

        {/* Profile form */}
        <Card className="mt-8 overflow-hidden rounded-[34px] border border-white/85 dark:border-white/8 bg-white/72 dark:bg-white/4 p-6 shadow-[0_22px_65px_rgba(120,126,190,0.11)] backdrop-blur-2xl sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
              {/* Image section */}
              <div className="rounded-[28px] border border-white/90 dark:border-white/8 bg-gradient-to-br from-[#f0edff] dark:from-white/5 via-[#edf7ff] dark:via-white/3 to-[#eaf9f4] dark:to-white/5 p-6 text-center shadow-soft">
                <div className="relative mx-auto h-52 w-52">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.fullname}
                      className="h-full w-full rounded-[34px] border-4 border-white dark:border-white/15 object-cover shadow-[0_18px_45px_rgba(120,126,190,0.18)]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[34px] border-4 border-white dark:border-white/15 bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-[0_18px_45px_rgba(120,126,190,0.18)]">
                      <UserRound className="h-20 w-20" />
                    </div>
                  )}

                  <label
                    htmlFor="user-profile-image"
                    className="absolute -bottom-3 -right-3 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white shadow-[0_13px_28px_rgba(132,145,205,0.24)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <Camera className="h-6 w-6" />
                  </label>
                </div>

                <Input
                  id="user-profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] ||
                      null;

                    setProfileImage(file);
                  }}
                  className="hidden"
                />

                <h2 className="mt-8 font-display text-2xl font-bold text-[#273149] dark:text-[#e8eaf5]">
                  {fullname || user.fullname}
                </h2>

                <p className="mt-1 text-sm text-[#7b869a] dark:text-[#8892a8]">
                  MindBloom Member
                </p>

                <p className="mt-4 text-xs text-[#8791a4] dark:text-[#6b7590]">
                  JPG, PNG or WEBP. Maximum 5 MB.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="user-fullname"
                    className="font-semibold text-[#4f5b73] dark:text-[#c0c6d4]"
                  >
                    Full Name
                  </Label>

                  <Input
                    id="user-fullname"
                    value={fullname}
                    onChange={(event) =>
                      setFullname(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="mt-2 h-14 rounded-2xl border-[#ddd8f7] dark:border-white/10 bg-white/82 dark:bg-white/5 px-5 text-base text-[#273149] dark:text-[#e8eaf5] shadow-sm outline-none focus-visible:border-[#aaa0ea] dark:focus-visible:border-[#a99df0] focus-visible:ring-[#ddd8f7] dark:focus-visible:ring-white/10"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="user-email"
                    className="font-semibold text-[#4f5b73] dark:text-[#c0c6d4]"
                  >
                    Protected Email Address
                  </Label>

                  <div className="relative mt-2">
                    <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9184dc] dark:text-[#a99df0]" />

                    <Input
                      id="user-email"
                      value={user.email}
                      readOnly
                      className="h-14 rounded-2xl border-[#e4e1ef] dark:border-white/10 bg-[#f5f6fa]/90 dark:bg-white/5 pl-14 text-[#7b869a] dark:text-[#8892a8]"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#8791a4] dark:text-[#6b7590]">
                    Your email address cannot be
                    changed from this page.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#d9eee7] dark:border-white/8 bg-gradient-to-r from-[#effaf6] dark:from-white/5 via-[#eef8fd] dark:via-white/3 to-[#f3f1ff] dark:to-white/5 p-5">
                  <p className="text-sm font-semibold text-[#4f5b73] dark:text-[#c0c6d4]">
                    Your wellness data is safe
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#8892a8]">
                    Updating your profile will not
                    remove your mood records,
                    journals or completed
                    activities.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Link to="/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      className="w-full rounded-2xl border-[#ddd8f7] dark:border-white/10 bg-white/78 dark:bg-white/5 text-[#65718a] dark:text-[#8892a8] hover:bg-[#f5f3ff] dark:hover:bg-white/10 hover:text-[#776bc8] dark:hover:text-[#a99df0] sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white shadow-[0_13px_28px_rgba(132,145,205,0.22)] hover:opacity-95"
                  >
                    <Save className="mr-2 h-5 w-5" />

                    {saving
                      ? "Saving Profile..."
                      : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}