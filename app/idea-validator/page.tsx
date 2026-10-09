import { Metadata } from "next";
import { IdeaValidatorWorkspace } from "@/components/fyp-ideas/IdeaValidatorWorkspace";

export const metadata: Metadata = {
  title: "AI FYP Idea Validator & Feasibility Report",
  description:
    "Evaluate your university Final Year Project proposal with instant AI validation. Check novelty, difficulty level, 2-semester defense timeline, and rubric scores.",
  alternates: {
    canonical: "/idea-validator",
  },
  openGraph: {
    title: "AI FYP Idea Validator | Free Project Feasibility Assessment",
    description:
      "Benchmark your Final Year Project proposal against novelty, complexity, and defense rubric scoring with AI.",
    url: "https://fypmate.com/idea-validator",
  },
};

export default function PublicIdeaValidatorPage() {
  return <IdeaValidatorWorkspace mode="public" />;
}
