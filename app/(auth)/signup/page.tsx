import { redirect } from "next/navigation";

export default function SignupPage() {
  // Signup and login are now merged - redirect to login
  redirect("/login");
}
