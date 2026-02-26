// lib/skills.ts
// Predefined skills list for FYP students - categorized by domain

export interface SkillOption {
  value: string;
  label: string;
  category: string;
}

export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  "Frontend Development": [
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "Svelte",
    "HTML/CSS",
    "Tailwind CSS",
    "Bootstrap",
    "Material UI",
    "Chakra UI",
    "Redux",
    "TypeScript",
    "JavaScript",
    "jQuery",
    "SASS/SCSS",
  ],
  "Backend Development": [
    "Node.js",
    "Express.js",
    "NestJS",
    "Python",
    "Django",
    "FastAPI",
    "Flask",
    "Java",
    "Spring Boot",
    "C#",
    ".NET",
    "PHP",
    "Laravel",
    "Ruby on Rails",
    "Go",
    "Rust",
  ],
  "Mobile Development": [
    "React Native",
    "Flutter",
    "Swift",
    "SwiftUI",
    "Kotlin",
    "Android Development",
    "iOS Development",
    "Xamarin",
    "Ionic",
    "Expo",
  ],
  "AI & Machine Learning": [
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Scikit-learn",
    "Computer Vision",
    "Natural Language Processing",
    "OpenAI API",
    "LangChain",
    "Hugging Face",
    "YOLO",
    "OpenCV",
    "Pandas",
    "NumPy",
    "Data Science",
  ],
  "Database & Storage": [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Firebase",
    "Supabase",
    "Prisma",
    "SQL",
    "NoSQL",
    "Elasticsearch",
    "DynamoDB",
    "GraphQL",
  ],
  "Cloud & DevOps": [
    "AWS",
    "Google Cloud",
    "Microsoft Azure",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "GitHub Actions",
    "Jenkins",
    "Terraform",
    "Linux",
    "Nginx",
    "Vercel",
    "Netlify",
    "Heroku",
  ],
  "Cybersecurity": [
    "Network Security",
    "Penetration Testing",
    "Ethical Hacking",
    "Cryptography",
    "OWASP",
    "Security Auditing",
    "Malware Analysis",
    "Incident Response",
    "SOC Analysis",
    "Vulnerability Assessment",
  ],
  "Data & Analytics": [
    "Data Analysis",
    "Data Visualization",
    "Power BI",
    "Tableau",
    "Excel",
    "R Programming",
    "Statistics",
    "Big Data",
    "Apache Spark",
    "ETL",
  ],
  "Design & UI/UX": [
    "UI Design",
    "UX Design",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Prototyping",
    "User Research",
    "Wireframing",
    "Adobe Photoshop",
    "Adobe Illustrator",
  ],
  "Blockchain & Web3": [
    "Blockchain",
    "Solidity",
    "Smart Contracts",
    "Ethereum",
    "Web3.js",
    "NFTs",
    "DeFi",
    "Cryptocurrency",
  ],
  "IoT & Embedded": [
    "Arduino",
    "Raspberry Pi",
    "IoT",
    "Embedded Systems",
    "MQTT",
    "Sensor Integration",
    "ESP32",
    "Microcontrollers",
  ],
  "Game Development": [
    "Unity",
    "Unreal Engine",
    "Game Design",
    "C++",
    "Godot",
    "3D Modeling",
    "Blender",
  ],
  "Other Technical": [
    "Git",
    "REST APIs",
    "WebSockets",
    "OAuth",
    "JWT",
    "Agile/Scrum",
    "Technical Writing",
    "API Design",
    "Microservices",
    "System Design",
  ],
};

// Flatten all skills into a single array with category info
export const ALL_SKILLS: SkillOption[] = Object.entries(SKILLS_BY_CATEGORY).flatMap(
  ([category, skills]) =>
    skills.map((skill) => ({
      value: skill,
      label: skill,
      category,
    }))
);

// Get all skill names as a flat array
export const SKILL_NAMES: string[] = ALL_SKILLS.map((s) => s.label);

// Get skills by category
export function getSkillsByCategory(category: string): string[] {
  return SKILLS_BY_CATEGORY[category] || [];
}

// Get all categories
export function getSkillCategories(): string[] {
  return Object.keys(SKILLS_BY_CATEGORY);
}

// Search skills by name (fuzzy match)
export function searchSkills(query: string, limit: number = 10): SkillOption[] {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact start match first, then contains match
  const startMatches: SkillOption[] = [];
  const containsMatches: SkillOption[] = [];
  
  for (const skill of ALL_SKILLS) {
    const normalizedLabel = skill.label.toLowerCase();
    if (normalizedLabel.startsWith(normalizedQuery)) {
      startMatches.push(skill);
    } else if (normalizedLabel.includes(normalizedQuery)) {
      containsMatches.push(skill);
    }
  }
  
  return [...startMatches, ...containsMatches].slice(0, limit);
}

// Check if a skill exists in predefined list
export function isPreDefinedSkill(skillName: string): boolean {
  return SKILL_NAMES.some(
    (name) => name.toLowerCase() === skillName.toLowerCase()
  );
}

// Get the proper cased version of a skill name
export function normalizeSkillName(skillName: string): string {
  const found = ALL_SKILLS.find(
    (s) => s.label.toLowerCase() === skillName.toLowerCase()
  );
  return found ? found.label : skillName;
}

// Popular skills (commonly used in FYPs)
export const POPULAR_SKILLS: string[] = [
  "React",
  "Python",
  "Node.js",
  "Flutter",
  "Machine Learning",
  "PostgreSQL",
  "TypeScript",
  "Next.js",
  "TensorFlow",
  "Docker",
  "Firebase",
  "MongoDB",
];
