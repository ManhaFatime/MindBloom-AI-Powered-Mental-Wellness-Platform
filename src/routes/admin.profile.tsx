import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      {
        title: "Admin Profile — MindBloom",
      },
      {
        name: "description",
        content: "Update the MindBloom administrator profile.",
      },
    ],
  }),
  component: AdminProfilePage,
});

type AdminUser = {
  id: number;
  fullname: string;
  email: string;
  role: "admin";
  profile_image?: string;
};

function AdminProfilePage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [fullname, setFullname] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        await showError(
          "Login Required",
          "Please log in using your administrator account."
        );

        window.location.href = "/login";
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser.role !== "admin") {
          await showError(
            "Access Denied",
            "Only MindBloom administrators can access this page."
          );

          window.location.href = "/dashboard";
          return;
        }

        setAdmin(parsedUser);
        setFullname(parsedUser.fullname || "");
        setCheckingAccess(false);
      } catch (error) {
        console.error("Admin profile session error:", error);

        localStorage.removeItem("user");

        await showError(
          "Session Error",
          "Your login session is invalid. Please log in again."
        );

        window.location.href = "/login";
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profileImage]);

  const currentProfileImageUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (admin?.profile_image) {
      return `http://localhost/api/${admin.profile_image}`;
    }

    return "";
  }, [previewUrl, admin]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!admin) {
      return;
    }

    if (fullname.trim().length < 3) {
      await showError(
        "Invalid Name",
        "Administrator name must contain at least 3 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("admin_id", String(admin.id));
      formData.append("admin_email", admin.email);
      formData.append("fullname", fullname.trim());

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response = await fetch(
        "http://localhost/api/admin/update_profile.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        const updatedUser: AdminUser = data.user;

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setAdmin(updatedUser);
        setFullname(updatedUser.fullname);
        setProfileImage(null);
        setPreviewUrl("");

        await showSuccess(
          "Profile Updated 🌸",
          data.message ||
            "Your administrator profile was updated successfully."
        );

        window.location.reload();
      } else {
        await showError(
          "Update Failed",
          data.message ||
            "Administrator profile could not be updated."
        );
      }
    } catch (error) {
      console.error("Admin profile update error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[30px] border border-[#dfe2ef] bg-white/92 px-10 py-12 text-center shadow-[0_22px_60px_rgba(120,126,190,0.12)] backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_60px_rgba(0,0,0,0.3)]">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#ddd8f7] border-t-[#9589df] dark:border-white/10 dark:border-t-[#a99df0]" />

          <p className="mt-4 text-sm text-[#7b869a] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#ddd7fa]/30 blur-3xl dark:bg-[#7669d5]/8" />

      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#caedf5]/35 blur-3xl dark:bg-[#568fb3]/7" />

      <div className="relative mx-auto max-w-5xl">
        <Card className="relative overflow-hidden rounded-[36px] border border-[#dce0ed] bg-white/90 shadow-[0_26px_75px_rgba(120,126,190,0.13)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#efedff]/95 via-[#ebf5ff]/90 to-[#eaf9f4]/90 dark:from-[#272f45] dark:via-[#242c42] dark:to-[#212c42]" />

          <div className="relative p-7 sm:p-10">
            <Link to="/admin">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-[#d9dcea] bg-white/90 text-[#59657b] shadow-soft hover:bg-white hover:text-[#776bc8] dark:border-white/10 dark:bg-white/6 dark:text-[#b0b8c9] dark:hover:bg-white/10 dark:hover:text-[#b7acf5]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dddfea] bg-white/80 px-4 py-2 text-sm font-semibold text-[#8174d2] shadow-soft dark:border-white/10 dark:bg-white/6 dark:text-[#b1a7f1]">
                <ShieldCheck className="h-4 w-4" />
                Administrator Profile
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] sm:text-5xl dark:text-[#edf0fa]">
                Edit{" "}
                <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-[#65718a] dark:text-[#939db3]">
                Update your display name and profile picture. Your primary
                administrator email remains protected.
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-8 overflow-hidden rounded-[34px] border border-[#dce0ed] bg-white/92 p-6 shadow-[0_22px_65px_rgba(120,126,190,0.11)] backdrop-blur-2xl sm:p-8 dark:border-white/8 dark:bg-[#20283d]/94 dark:shadow-[0_22px_65px_rgba(0,0,0,0.26)]">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
              <div className="rounded-[28px] border border-[#dde1ed] bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] p-6 text-center shadow-soft dark:border-white/8 dark:from-[#2a3249] dark:via-[#263047] dark:to-[#233542]">
                <div className="relative mx-auto h-52 w-52">
                  {currentProfileImageUrl ? (
                    <img
                      src={currentProfileImageUrl}
                      alt={admin.fullname}
                      className="h-full w-full rounded-[34px] border-4 border-white object-cover shadow-[0_18px_45px_rgba(120,126,190,0.18)] dark:border-white/15 dark:shadow-[0_18px_45px_rgba(0,0,0,0.30)]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[34px] border-4 border-white bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-[0_18px_45px_rgba(120,126,190,0.18)] dark:border-white/15 dark:shadow-[0_18px_45px_rgba(0,0,0,0.30)]">
                      <UserRound className="h-20 w-20" />
                    </div>
                  )}

                  <label
                    htmlFor="admin-profile-image"
                    className="absolute -bottom-3 -right-3 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white shadow-[0_13px_28px_rgba(132,145,205,0.24)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <Camera className="h-6 w-6" />
                  </label>
                </div>

                <Input
                  id="admin-profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] || null;

                    setProfileImage(file);
                  }}
                  className="hidden"
                />

                <h2 className="mt-8 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
                  {fullname || admin.fullname}
                </h2>

                <p className="mt-1 text-sm text-[#7b869a] dark:text-[#939db3]">
                  Primary Administrator
                </p>

                <p className="mt-4 text-xs text-[#8791a4] dark:text-[#828ca3]">
                  JPG, PNG or WEBP. Maximum 5 MB.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="admin-fullname"
                    className="font-semibold text-[#4f5b73] dark:text-[#c9cfdd]"
                  >
                    Full Name
                  </Label>

                  <Input
                    id="admin-fullname"
                    value={fullname}
                    onChange={(event) =>
                      setFullname(event.target.value)
                    }
                    placeholder="Enter administrator name"
                    className="mt-2 h-14 rounded-2xl border-[#ddd8f7] bg-white/92 px-5 text-base text-[#273149] shadow-sm focus-visible:border-[#aaa0ea] focus-visible:ring-[#ddd8f7] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96] dark:focus-visible:border-[#a99df0]/50 dark:focus-visible:ring-[#a99df0]/15"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="admin-email"
                    className="font-semibold text-[#4f5b73] dark:text-[#c9cfdd]"
                  >
                    Protected Email Address
                  </Label>

                  <div className="relative mt-2">
                    <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9184dc] dark:text-[#a99df0]" />

                    <Input
                      id="admin-email"
                      value={admin.email}
                      readOnly
                      className="h-14 rounded-2xl border-[#e4e1ef] bg-[#f5f6fa]/95 pl-14 text-[#7b869a] dark:border-white/8 dark:bg-white/4 dark:text-[#939db3]"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#8791a4] dark:text-[#828ca3]">
                    The primary administrator email cannot be changed.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#d9eee7] bg-gradient-to-r from-[#effaf6] via-[#eef8fd] to-[#f3f1ff] p-5 dark:border-white/8 dark:from-[#253a38] dark:via-[#253342] dark:to-[#302e49]">
                  <p className="text-sm font-semibold text-[#4f5b73] dark:text-[#d6dce8]">
                    Protected account
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#758096] dark:text-[#a7b0c2]">
                    This administrator account cannot be deleted, demoted or
                    converted into a normal user.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Link to="/admin">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      className="w-full rounded-2xl border-[#ddd8f7] bg-white/80 text-[#65718a] hover:bg-[#f5f3ff] hover:text-[#776bc8] sm:w-auto dark:border-white/10 dark:bg-white/6 dark:text-[#b0b8c9] dark:hover:bg-white/10 dark:hover:text-[#b7acf5]"
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
    </main>
  );
}