"use client";
import { useState } from "react";

export default function HomePage() {
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<{ email?: string; password?: string } | null>(null);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setError("");
            setStudent(null);

            const res = await fetch("/api/students/generate/email", {
                method: "GET",
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok) throw new Error(data.error || "Failed to generate email");

            // You can include password in your backend response for now
            setStudent({ email: data.data.institutionalEmail, password: data.data.password });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">LMS Student Portal</h1>
                <p className="text-gray-600 mb-6">
                    Click below to get your institutional email and temporary password.
                </p>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {loading ? "Generating..." : "Get My Email"}
                </button>

                {error && (
                    <p className="mt-4 text-red-600 text-sm">
                        {error}
                    </p>
                )}

                {student && (
                    <div className="mt-6 text-left bg-gray-100 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Account Details</h2>
                        <p className="text-gray-700">
                            <strong>Email:</strong> {student.email}
                        </p>
                        <p className="text-gray-700">
                            <strong>Password:</strong> {student.password}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Please save these credentials safely.</p>
                    </div>
                )}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a href="/" className="text-blue-600 hover:underline">
                        Login in to your account
                    </a>
                </p>
            </div>

            <footer className="mt-6 text-gray-500 text-sm">
                © {new Date().getFullYear()} LMS - All rights reserved.
            </footer>
        </main>
    );
}
