import type { TaskPriority } from "@/services/workspace.service";

export interface StarterChecklistPack {
  id: string;
  title: string;
  subtitle: string;
  defaultMilestoneIndex: number;
  items: Array<{
    title: string;
    description: string;
    priority: TaskPriority;
  }>;
}

/** Suggested starting points only. Students should adapt them to their own project and department requirements. */
export const STARTER_CHECKLIST_PACKS: StarterChecklistPack[] = [
  {
    id: "pack-proposal",
    title: "Proposal & Literature Review",
    subtitle: "Problem scoping, literature matrix, supervisor alignment",
    defaultMilestoneIndex: 0,
    items: [
      {
        title: "Define Problem Statement, Objectives & Scope",
        description:
          "Document the core problem, target users, measurable objectives, and explicit project boundaries.",
        priority: "HIGH",
      },
      {
        title: "Literature Review & Comparative Matrix (10–15 Papers)",
        description:
          "Summarize recent research papers/existing systems, their limitations, and how our FYP addresses the gap.",
        priority: "HIGH",
      },
      {
        title: "Select Tech Stack, Dataset & Hardware/Cloud Tools",
        description:
          "Finalize frameworks, database, APIs, or datasets required for feasibility.",
        priority: "MEDIUM",
      },
      {
        title: "Prepare Proposal Document & Defense Slides",
        description:
          "Draft the proposal report and presentation deck for supervisor and committee review.",
        priority: "HIGH",
      },
    ],
  },
  {
    id: "pack-srs",
    title: "SRS & System Design",
    subtitle: "Requirements, architecture diagrams, database schema",
    defaultMilestoneIndex: 1,
    items: [
      {
        title: "Functional & Non-Functional Requirements Specification",
        description:
          "List user roles, user stories, functional modules, and performance/security constraints.",
        priority: "HIGH",
      },
      {
        title: "System Architecture & Data Flow Diagrams",
        description:
          "Create high-level architecture, use case diagrams, and sequence/activity diagrams.",
        priority: "HIGH",
      },
      {
        title: "Database Schema (ERD) & API Route Contracts",
        description:
          "Design entity relationships, tables, and backend API request/response schemas.",
        priority: "MEDIUM",
      },
      {
        title: "UI Wireframes & Interactive Prototype",
        description:
          "Design key user screens and navigation flows before full implementation.",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "pack-prototype",
    title: "Prototype & Midterm Evaluation",
    subtitle: "Core implementation, integration, midterm demo",
    defaultMilestoneIndex: 2,
    items: [
      {
        title: "Setup GitHub Repository, Branch Rules & Environment",
        description:
          "Initialize project repository, README, environment variables, and base project structure.",
        priority: "HIGH",
      },
      {
        title: "Build Core Backend / AI Model Pipeline",
        description:
          "Implement primary business logic, database operations, or model training/inference pipeline.",
        priority: "HIGH",
      },
      {
        title: "Integrate Frontend UI with Core Workflows",
        description:
          "Connect primary user-facing screens with live data for the end-to-end prototype.",
        priority: "HIGH",
      },
      {
        title: "Midterm Demo Rehearsal & Progress Presentation",
        description:
          "Test end-to-end demo scenario and prepare midterm evaluation slides.",
        priority: "MEDIUM",
      },
    ],
  },
  {
    id: "pack-final",
    title: "Final Thesis & Defense",
    subtitle: "Testing, evaluation, report chapters, defense",
    defaultMilestoneIndex: 3,
    items: [
      {
        title: "End-to-End Testing, Bug Fixing & Performance Benchmarks",
        description:
          "Execute test cases, record accuracy/latency metrics, and resolve edge-case bugs.",
        priority: "HIGH",
      },
      {
        title: "Write Final Thesis / Report Chapters (Methodology & Results)",
        description:
          "Complete all thesis chapters, figures, tables, and IEEE/APA citations.",
        priority: "HIGH",
      },
      {
        title: "Supervisor Thesis Review & Plagiarism Check",
        description:
          "Incorporate final supervisor corrections and verify formatting/similarity compliance.",
        priority: "MEDIUM",
      },
      {
        title: "Final Defense Presentation, Live Demo & Code Handover",
        description:
          "Prepare final defense deck, backup demo video, and clean repository documentation.",
        priority: "HIGH",
      },
    ],
  },
];
