// lib/industries.ts
/**
 * FYP Industry Categories
 * -----------------------
 * Comprehensive list of industry domains for Final Year Projects.
 * Used in profile forms and discovery filters.
 */

export interface Industry {
  value: string;  // Short code/value
  label: string;  // Display name
  category: string; // Industry category
}

export const FYP_INDUSTRIES: Industry[] = [
  // Artificial Intelligence & Machine Learning
  { value: "AI_ML", label: "Artificial Intelligence / Machine Learning", category: "AI & Data" },
  { value: "NLP", label: "Natural Language Processing (NLP)", category: "AI & Data" },
  { value: "COMPUTER_VISION", label: "Computer Vision", category: "AI & Data" },
  { value: "DATA_SCIENCE", label: "Data Science & Analytics", category: "AI & Data" },
  { value: "BIG_DATA", label: "Big Data", category: "AI & Data" },
  { value: "DEEP_LEARNING", label: "Deep Learning", category: "AI & Data" },
  { value: "ROBOTICS_AI", label: "Robotics & Automation", category: "AI & Data" },

  // Software & Web Development
  { value: "WEB_DEV", label: "Web Development", category: "Software Development" },
  { value: "MOBILE_DEV", label: "Mobile App Development", category: "Software Development" },
  { value: "CLOUD_COMPUTING", label: "Cloud Computing", category: "Software Development" },
  { value: "DEVOPS", label: "DevOps & CI/CD", category: "Software Development" },
  { value: "SAAS", label: "SaaS / Software Products", category: "Software Development" },
  { value: "API_DEV", label: "API Development & Integration", category: "Software Development" },
  { value: "MICROSERVICES", label: "Microservices Architecture", category: "Software Development" },

  // Cybersecurity
  { value: "CYBERSECURITY", label: "Cybersecurity", category: "Security" },
  { value: "NETWORK_SECURITY", label: "Network Security", category: "Security" },
  { value: "ETHICAL_HACKING", label: "Ethical Hacking & Penetration Testing", category: "Security" },
  { value: "CRYPTOGRAPHY", label: "Cryptography & Encryption", category: "Security" },
  { value: "BLOCKCHAIN", label: "Blockchain & Web3", category: "Security" },

  // Internet of Things & Embedded Systems
  { value: "IOT", label: "Internet of Things (IoT)", category: "Hardware & IoT" },
  { value: "EMBEDDED_SYSTEMS", label: "Embedded Systems", category: "Hardware & IoT" },
  { value: "SMART_HOME", label: "Smart Home / Home Automation", category: "Hardware & IoT" },
  { value: "WEARABLES", label: "Wearable Technology", category: "Hardware & IoT" },
  { value: "SENSOR_NETWORKS", label: "Sensor Networks", category: "Hardware & IoT" },

  // Healthcare & Biotech
  { value: "HEALTHTECH", label: "HealthTech / Digital Health", category: "Healthcare" },
  { value: "MEDTECH", label: "Medical Technology", category: "Healthcare" },
  { value: "BIOTECH", label: "Biotechnology", category: "Healthcare" },
  { value: "BIOINFORMATICS", label: "Bioinformatics", category: "Healthcare" },
  { value: "TELEMEDICINE", label: "Telemedicine / Remote Healthcare", category: "Healthcare" },
  { value: "PHARMATECH", label: "Pharmaceutical Technology", category: "Healthcare" },

  // Finance & Business
  { value: "FINTECH", label: "FinTech / Financial Technology", category: "Finance & Business" },
  { value: "ECOMMERCE", label: "E-Commerce", category: "Finance & Business" },
  { value: "DIGITAL_BANKING", label: "Digital Banking", category: "Finance & Business" },
  { value: "INSURTECH", label: "InsurTech", category: "Finance & Business" },
  { value: "REGTECH", label: "RegTech / Compliance", category: "Finance & Business" },
  { value: "SUPPLY_CHAIN", label: "Supply Chain Management", category: "Finance & Business" },

  // Education
  { value: "EDTECH", label: "EdTech / Educational Technology", category: "Education" },
  { value: "ELEARNING", label: "E-Learning Platforms", category: "Education" },
  { value: "LMS", label: "Learning Management Systems", category: "Education" },
  { value: "GAMIFICATION", label: "Gamification in Education", category: "Education" },

  // Entertainment & Media
  { value: "GAMING", label: "Gaming & Game Development", category: "Entertainment" },
  { value: "AR_VR", label: "AR/VR / Metaverse", category: "Entertainment" },
  { value: "MEDIA_STREAMING", label: "Media & Streaming", category: "Entertainment" },
  { value: "SOCIAL_MEDIA", label: "Social Media Platforms", category: "Entertainment" },
  { value: "CONTENT_CREATION", label: "Content Creation Tools", category: "Entertainment" },

  // Environment & Sustainability
  { value: "GREENTECH", label: "GreenTech / CleanTech", category: "Environment" },
  { value: "AGRITECH", label: "AgriTech / Agriculture Technology", category: "Environment" },
  { value: "RENEWABLE_ENERGY", label: "Renewable Energy", category: "Environment" },
  { value: "SMART_CITIES", label: "Smart Cities", category: "Environment" },
  { value: "WASTE_MANAGEMENT", label: "Waste Management", category: "Environment" },

  // Transportation & Logistics
  { value: "AUTONOMOUS_VEHICLES", label: "Autonomous Vehicles", category: "Transportation" },
  { value: "LOGISTICS", label: "Logistics & Fleet Management", category: "Transportation" },
  { value: "RIDE_SHARING", label: "Ride Sharing / Mobility", category: "Transportation" },
  { value: "DRONE_TECH", label: "Drone Technology", category: "Transportation" },

  // Government & Public Sector
  { value: "GOVTECH", label: "GovTech / E-Governance", category: "Public Sector" },
  { value: "CIVIC_TECH", label: "Civic Technology", category: "Public Sector" },
  { value: "DEFENSE", label: "Defense & Military Tech", category: "Public Sector" },

  // Other Emerging Technologies
  { value: "QUANTUM_COMPUTING", label: "Quantum Computing", category: "Emerging Tech" },
  { value: "EDGE_COMPUTING", label: "Edge Computing", category: "Emerging Tech" },
  { value: "5G_TECH", label: "5G & Telecommunications", category: "Emerging Tech" },
  { value: "DIGITAL_TWIN", label: "Digital Twin Technology", category: "Emerging Tech" },

  // General
  { value: "OTHER", label: "Other", category: "General" },
];

/**
 * Get industry label from value
 */
export function getIndustryLabel(value: string): string {
  const industry = FYP_INDUSTRIES.find((i) => i.value === value);
  return industry?.label || value;
}

/**
 * Get industries grouped by category
 */
export function getIndustriesByCategory(): Record<string, Industry[]> {
  return FYP_INDUSTRIES.reduce((acc, industry) => {
    if (!acc[industry.category]) {
      acc[industry.category] = [];
    }
    acc[industry.category].push(industry);
    return acc;
  }, {} as Record<string, Industry[]>);
}

/**
 * Get all unique categories
 */
export function getIndustryCategories(): string[] {
  return [...new Set(FYP_INDUSTRIES.map((i) => i.category))];
}
