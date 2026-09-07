import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/lib/sweetAlert";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!fullname || !email || !password || !confirmPassword) {
    await showError(
      "Missing Information",
      "Please complete all required fields before creating your account."
    );
    return;
  }

  if (fullname.trim().length < 3) {
    await showError(
      "Invalid Name",
      "Your full name must contain at least 3 characters."
    );
    return;
  }

  if (password.length < 6) {
    await showError(
      "Weak Password",
      "Your password must contain at least 6 characters."
    );
    return;
  }

  if (password !== confirmPassword) {
    await showError(
      "Passwords Do Not Match",
      "Please enter the same password in both password fields."
    );
    return;
  }

  const formData = new FormData();

  formData.append("fullname", fullname.trim());
  formData.append("email", email.trim());
  formData.append("password", password);

  if (profileImage) {
    formData.append("profile_image", profileImage);
  }

  try {
    const response = await fetch(
      "http://localhost/api/register.php",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      await showSuccess(
        "Account Created 🌸",
        data.message ||
          "Your MindBloom account has been created successfully."
      );

      setFullname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setProfileImage(null);

      window.location.href = "/login";
    } else {
      await showError(
        "Registration Failed",
        data.message || "Unable to create your account."
      );
    }
  } catch (error) {
    console.error(error);

    await showError(
      "Connection Error",
      "MindBloom could not connect to the server. Please make sure Apache and MySQL are running."
    );
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 glass-strong border-white/60 dark:border-white/10 shadow-glass animate-fade-in-up">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">
            Create Your Account 🌸
          </h1>

          <p className="text-muted-foreground mt-2">
            Start your wellness journey with MindBloom
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>
            <Label>Full Name</Label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Profile Picture</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setProfileImage(e.target.files[0]);
                }
              }}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground"
          >
            Create Account
          </Button>

        </form>

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Login
          </Link>
        </p>

      </Card>
    </div>
  );
}