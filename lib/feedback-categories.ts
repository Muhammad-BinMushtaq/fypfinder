// lib/feedback-categories.ts

export interface FeedbackCategoryGroup {
  group: string;
  items: {
    id: string;
    label: string;
    description: string;
  }[];
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryGroup[] = [
  {
    group: "Bugs & Issues",
    items: [
      {
        id: "chat_sync",
        label: "Chat & Realtime Sync",
        description: "Messages delayed or not showing in real time",
      },
      {
        id: "push_notifications",
        label: "Push Notifications",
        description: "Notification counter or permission banners glitching",
      },
      {
        id: "partner_requests",
        label: "Partner Request Bug",
        description: "Issues sending, receiving, or accepting requests",
      },
      {
        id: "fyp_validation_error",
        label: "FYP Validation Error",
        description: "AI evaluation stuck or failing during analysis",
      },
      {
        id: "profile_upload",
        label: "Profile Picture / Upload",
        description: "Avatar upload fails or displays improperly",
      },
      {
        id: "project_embeds",
        label: "Project Embeds",
        description: "GitHub repository cards, PDF or Demo link issues",
      },
      {
        id: "auth_session",
        label: "Login / Session Issue",
        description: "Unexpected logouts or session expiry problems",
      },
      {
        id: "dark_mode_glitch",
        label: "Dark Mode / Visual Glitch",
        description: "Text contrast, color overriding or styling glitches",
      },
      {
        id: "mobile_keyboard",
        label: "Mobile Keyboard Issue",
        description: "Keyboard overlaps inputs or jumps screen positions",
      },
      {
        id: "performance_lag",
        label: "Slow Performance / Lag",
        description: "Pages take too long to load or feel sluggish",
      },
    ],
  },
  {
    group: "Partner Discovery & Team",
    items: [
      {
        id: "filter_accuracy",
        label: "Filter Accuracy",
        description: "Department, semester, or skill filters mismatching",
      },
      {
        id: "profile_data",
        label: "Student Profile Data",
        description: "Incorrect semester or academic details shown",
      },
      {
        id: "group_formation",
        label: "Group Formation Confusion",
        description: "Confusing FYP team creation or member invites",
      },
      {
        id: "inactive_profiles",
        label: "Inactive Profiles",
        description: "Inactive or duplicate accounts cluttering discovery",
      },
      {
        id: "search_improvements",
        label: "Search Improvements",
        description: "Need better keyword, tech-stack or name search",
      },
    ],
  },
  {
    group: "FYP Ideas & AI Validator",
    items: [
      {
        id: "ai_quality",
        label: "AI Feedback Quality",
        description: "Scores or feasibility feedback needs better accuracy",
      },
      {
        id: "idea_form",
        label: "Idea Submission Form",
        description: "Form fields need more flexibility or clearer guidelines",
      },
      {
        id: "past_catalog",
        label: "Past FYP Catalog",
        description: "Missing past projects or archive search accuracy",
      },
      {
        id: "export_roadmap",
        label: "Export / Roadmap PDF",
        description: "Want downloadable PDF or clean roadmap exports",
      },
      {
        id: "supervisor_matching",
        label: "Supervisor Matching",
        description: "Want faculty advisor recommendations for ideas",
      },
    ],
  },
  {
    group: "Feature Requests & Enhancements",
    items: [
      {
        id: "voice_notes",
        label: "Audio / Voice Notes",
        description: "Want audio voice clips in peer messaging",
      },
      {
        id: "file_attachments",
        label: "File & Code Attachments",
        description: "Ability to share code snippets or ZIP documents in chat",
      },
      {
        id: "task_management",
        label: "Group Task Management",
        description: "Kanban board or milestone tracker improvements",
      },
      {
        id: "alumni_mentorship",
        label: "Alumni & Seniors Mentorship",
        description: "Direct connection to seniors who completed similar FYPs",
      },
      {
        id: "meeting_scheduler",
        label: "Meeting Scheduler",
        description: "Built-in Google Meet or sync meeting calendar",
      },
      {
        id: "email_digest",
        label: "Email Digest",
        description: "Weekly email summary of requests and new partners",
      },
    ],
  },
  {
    group: "UI/UX & General Experience",
    items: [
      {
        id: "navigation_ux",
        label: "Navigation & Usability",
        description: "Certain views or links felt confusing or hard to find",
      },
      {
        id: "form_clarity",
        label: "Form Clarity & Instructions",
        description: "Input fields could use clearer tooltips or examples",
      },
      {
        id: "safety_moderation",
        label: "Spam & Safety Report",
        description: "Report inappropriate behavior or suspicious profile",
      },
      {
        id: "compliment",
        label: "Appreciation & Compliments",
        description: "Sharing love and kudos with the FYP Finder team!",
      },
      {
        id: "other",
        label: "Other (Custom Topic)",
        description: "Anything else not covered in the list above",
      },
    ],
  },
];

// Flat array of all valid category labels
export const ALL_CATEGORY_LABELS = FEEDBACK_CATEGORIES.flatMap((g) =>
  g.items.map((i) => i.label)
);
