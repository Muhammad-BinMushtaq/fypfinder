"use client";

import { useState } from "react";

export default function PasswordInput({
    label,
    id,
}: {
    label: string;
    id: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    className="w-full rounded-lg px-4 py-3 border bg-background-light dark:bg-background-dark"
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-3 text-sm text-text-muted"
                >
                    {visible ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );
}
