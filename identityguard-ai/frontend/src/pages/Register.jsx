import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import { useNotifications } from "../components/NotificationsProvider";
import { apiRequest } from "../lib/api";
import { persistSession } from "../lib/auth";

const initialState = { name: "", email: "", password: "" };

export default function Register() {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { notify } = useNotifications();

    function validateForm() {
        if (!form.name || !form.email || !form.password) {
            notify("All fields are required", "error");
            return false;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

        if (!passwordRegex.test(form.password)) {
            notify(
                "Password must include uppercase, lowercase, number, and special character",
                "error"
            );
            return false;
        }

        if (form.password.length < 8) {
            notify("Password must be at least 8 characters", "error");
            return false;
        }

        return true;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const loginPayload = await apiRequest("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            });

            persistSession(loginPayload);

            notify("Account created successfully 🎉", "success");
            navigate("/dashboard");
        } catch (error) {
            console.error("Register Error:", error);
            notify(error.message || "Registration failed", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="app-shell flex min-h-[calc(100vh-160px)] items-center justify-center py-16">
            <AuthForm
                title="Create a secure account"
                subtitle="Register your account to start face verification."
                fields={[
                    {
                        name: "name",
                        type: "text",
                        label: "Full name",
                        placeholder: "Aarav Sharma",
                    },
                    {
                        name: "email",
                        type: "email",
                        label: "Email",
                        placeholder: "aarav@identityguard.ai",
                    },
                    {
                        name: "password",
                        type: "password",
                        label: "Password",
                        placeholder: "Strong password required",
                    },
                ]}
                values={form}
                onChange={(event) =>
                    setForm((current) => ({
                        ...current,
                        [event.target.name]: event.target.value,
                    }))
                }
                onSubmit={handleSubmit}
                loading={loading}
                actionLabel="Create account"
                footer={
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-sky-700">
                            Sign in
                        </Link>
                        .
                    </p>
                }
            />
        </section>
    );
}