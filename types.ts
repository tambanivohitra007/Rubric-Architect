export interface LearningOutcome {
  id: string;
  text: string;
}

export interface Criterion {
  id: string;
  title: string;
  description: string;
}

export interface PerformanceLevel {
  id: string;
  title: string; // e.g. "Emerging", "Proficient"
  score: number;
  description: string;
}

export interface RubricRow {
  id: string;
  criterionId: string;
  levels: PerformanceLevel[];
}

export interface AttachedFile {
  name: string;
  mimeType: string;
  data: string; // Base64 string without prefix
}

export type RubricType = 
  | 'Analytic' 
  | 'Holistic' 
  | 'SinglePoint' 
  | 'Developmental' 
  | 'Checklist' 
  | 'CriterionReferenced' 
  | 'NormReferenced' 
  | 'TaskSpecific';

export interface RubricData {
  topic: string; // Assignment Title
  courseName: string; // e.g. "Advanced Macroeconomics"
  contextMaterial: string; // Typed/Pasted text
  attachedFile: AttachedFile | null; // Uploaded file
  rubricType: RubricType;
  outcomes: LearningOutcome[];
  criteria: Criterion[];
  rows: RubricRow[];
  scale: string[]; // e.g., ["Needs Improvement", "Developing", "Proficient", "Advanced"]
}

export enum AppStep {
  CONTEXT = 0,
  CRITERIA = 1,
  LEVELS = 2,
  REVIEW = 3,
}
