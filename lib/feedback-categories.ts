// lib/feedback-categories.ts

export interface FeedbackCategory {
  id: string;
  label: string;
  description: string;
  iconName: "Bug" | "Lightbulb" | "Users" | "Sparkles" | "Palette" | "MessageSquare";
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  {
    id: "bug_issue",
    label: "Bug or Issue Report",
    description: "Something is broken, glitched, or not working as expected",
    iconName: "Bug",
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-900/60",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    },
  },
  {
    id: "feature_request",
    label: "Feature Request",
    description: "Suggest a new tool, capability, or workflow improvement",
    iconName: "Lightbulb",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/60",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    },
  },
  {
    id: "partner_matching",
    label: "Partner Finding & Teammates",
    description: "Feedback on partner filters, profiles, or FYP team matching",
    iconName: "Users",
    color: {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/60",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    },
  },
  {
    id: "fyp_validation",
    label: "FYP Ideas & AI Validator",
    description: "Feedback on AI validation scores, proposals, or past catalogs",
    iconName: "Sparkles",
    color: {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/60",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    },
  },
  {
    id: "ui_ux_design",
    label: "UI / UX & Mobile Usability",
    description: "Visual styling, mobile keyboard, layout, or navigation feedback",
    iconName: "Palette",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/60",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  },
  {
    id: "other_general",
    label: "Other / General Feedback",
    description: "Questions, custom thoughts, appreciation, or other feedback",
    iconName: "MessageSquare",
    color: {
      bg: "bg-slate-100 dark:bg-slate-800/60",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      badge: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    },
  },
];

export const ALL_CATEGORY_LABELS = FEEDBACK_CATEGORIES.map((c) => c.label);
