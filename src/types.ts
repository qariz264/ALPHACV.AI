export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  description: string[];
}

export interface Education {
  degree: string;
  school: string;
  duration: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

export type TemplateType =
  | "modern" | "ats_clean" | "executive" | "creative" | "corporate" | "academic" | "tech_developer" | "minimalist_flow" | "bold_accent"
  | "vintage_journal" | "emerald_forest" | "midnight_obsidian" | "aurora_nordic" | "royal_heritage" | "sleek_mono" | "warm_terracotta"
  | "cyber_teal" | "golden_ratio" | "cool_ocean" | "slate_compact" | "swiss_brutalist" | "editorial_chic" | "vanguard_impact"
  | "charcoal_bold" | "metro_transit" | "clean_canvas" | "sapphire_elite" | "rose_gold" | "eco_growth" | "apex_leader";

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  linkedin?: string;
  summary?: string;
  workExperienceText: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
  projects?: Project[];
  achievements?: string[];
  languages?: string[];
  references?: string;
  selectedTemplate: TemplateType;
  fontSize?: "small" | "medium" | "large" | "xlarge";
  hasPaid: boolean;
  createdAt: any;
  updatedAt: any;
}
