import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/lib/sweetAlert";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
    await showError(
        "Missing Information",
        "Please enter both your email address and password."
    );
    return;
}

        try {
            const response = await fetch(
                "http://localhost/api/login.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();
            if (data.success) {
                await showSuccess(
    "Welcome Back 🌸",
    data.message || "Login successful"
);

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                if (data.user.role === "admin") {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/dashboard";
                }
            } else {
                await showError(
    "Login Failed",
    data.message || "Invalid email or password"
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
                        Welcome Back 🌸
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Login to continue your wellness journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                        <Label>Password</Label>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-primary text-primary-foreground"
                    >
                        Login
                    </Button>
                </form>

                <p className="text-center text-sm mt-6 text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-primary font-medium hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </Card>
        </div>
    );
}
