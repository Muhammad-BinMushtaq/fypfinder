"use client";

import PasswordInput from "./PasswordInput";







export default function SignupForm() {
  return (
    <form className="space-y-6">
      <div>
        <label className="text-sm font-medium">University Email</label>
        <input
          type="email"
          placeholder="student@university.edu"
          className="w-full rounded-lg px-4 py-3 border"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PasswordInput id="password" label="Create Password" />
        <PasswordInput id="confirmPassword" label="Confirm Password" />
      </div>

      

      <label className="flex gap-2 text-sm text-text-muted">
        <input type="checkbox" />
        I agree to the Terms & Privacy Policy
      </label>

      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-lg font-bold"
      >
        Verify & Register
      </button>
    </form>
  );
}
