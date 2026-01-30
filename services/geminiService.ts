import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AttachedFile, Criterion, LearningOutcome, RubricRow } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Use 3-flash-preview as recommended for text, assuming it handles multimodal input for this scope. 
// If specific pdf support fails, user might need to rely on text extraction.
const modelName = 'gemini-3-flash-preview'; 

export const generateCriteriaSuggestions = async (
  topic: string,
  courseName: string,
  outcomes: LearningOutcome[],
  contextMaterial: string,
  attachedFile: AttachedFile | null
): Promise<Criterion[]> => {
  const outcomeText = outcomes.map(o => o.text).join("; ");
  
  const promptText = `
    Context: Creating a grading rubric for a university course: "${courseName}".
    Assignment: "${topic}".
    Learning Outcomes: ${outcomeText}
    
    Additional Course Context / Materials provided below:
    ${contextMaterial}

    Task: Analyze the context and materials (if provided) and generate 5 distinct assessment criteria that align with these outcomes and the specific assignment details.
    Each criterion should have a short title and a brief description of what is being assessed.
  `;

  const parts: any[] = [{ text: promptText }];
  if (attachedFile) {
    parts.push({
      inlineData: {
        mimeType: attachedFile.mimeType,
        data: attachedFile.data,
      }
    });
  }

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["title", "description"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert university-level pedagogical assistant helping a professor create a rubric.",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const rawData = JSON.parse(text);
    return rawData.map((item: any, index: number) => ({
      id: `crit-${Date.now()}-${index}`,
      title: item.title,
      description: item.description,
    }));
  } catch (error) {
    console.error("Error generating criteria:", error);
    throw error;
  }
};

export const generateRubricRows = async (
  topic: string,
  courseName: string,
  criteria: Criterion[],
  scaleLabels: string[],
  contextMaterial: string,
  attachedFile: AttachedFile | null
): Promise<RubricRow[]> => {
  const criteriaText = criteria.map(c => `${c.title}: ${c.description}`).join("\n");
  const scaleText = scaleLabels.join(", ");

  const promptText = `
    Context: University Course "${courseName}", Assignment: "${topic}".
    Scale: ${scaleText} (from lowest to highest proficiency).
    
    Additional Context: ${contextMaterial}
    
    Task: For each of the following criteria, generate a description for each performance level.
    The descriptions should be specific, observable, and distinct between levels, appropriate for university level assessment.
    
    Criteria:
    ${criteriaText}
  `;

  const parts: any[] = [{ text: promptText }];
  if (attachedFile) {
    parts.push({
      inlineData: {
        mimeType: attachedFile.mimeType,
        data: attachedFile.data,
      }
    });
  }

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        criterionTitle: { type: Type.STRING, description: "Must match one of the provided criteria titles exactly" },
        levels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              levelName: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["levelName", "description"],
          },
        },
      },
      required: ["criterionTitle", "levels"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];

    const rawData = JSON.parse(text);

    // Map back to our internal structure
    const rows: RubricRow[] = [];
    
    criteria.forEach((crit) => {
      const match = rawData.find((r: any) => r.criterionTitle.toLowerCase() === crit.title.toLowerCase());
      
      const levels = scaleLabels.map((label, idx) => {
        const aiLevel = match?.levels?.find((l: any) => l.levelName.toLowerCase() === label.toLowerCase()) 
                     || match?.levels?.[idx]; 
                     
        return {
          id: `lvl-${crit.id}-${idx}`,
          title: label,
          score: idx + 1,
          description: aiLevel?.description || "Description pending...",
        };
      });

      rows.push({
        id: `row-${crit.id}`,
        criterionId: crit.id,
        levels: levels,
      });
    });

    return rows;

  } catch (error) {
    console.error("Error generating rubric rows:", error);
    throw error;
  }
};
