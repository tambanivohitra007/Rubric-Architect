import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AttachedFile, Criterion, LearningOutcome, RubricRow, RubricType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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
    Context: Creating a university assessment rubric for course: "${courseName}".
    Assignment: "${topic}".
    Learning Outcomes: ${outcomeText}
    
    Additional Context:
    ${contextMaterial}

    Task: Generate 5 distinct assessment criteria (dimensions) that align with these outcomes.
    Even if the rubric type is holistic, please list the key dimensions that should be considered in the overall score.
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
        systemInstruction: "You are an expert university-level pedagogical assistant.",
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
  attachedFile: AttachedFile | null,
  rubricType: RubricType
): Promise<RubricRow[]> => {
  const criteriaText = criteria.map(c => `${c.title}: ${c.description}`).join("\n");
  const scaleText = scaleLabels.join(", ");

  let taskInstruction = "";

  if (rubricType === 'Holistic') {
    taskInstruction = `
      Create a HOLISTIC rubric.
      You should generate ONE single row. The 'criterionTitle' for this row must be "Overall Performance".
      For each level in the scale (${scaleText}), provide a comprehensive paragraph description that integrates ALL the provided criteria dimensions (${criteria.map(c => c.title).join(', ')}).
      Do not generate separate rows for each criterion. Synthesize them.
    `;
  } else if (rubricType === 'SinglePoint') {
    taskInstruction = `
      Create a SINGLE-POINT rubric.
      For each criterion, generate descriptions for 3 columns:
      1. "Concerns / Areas for Improvement": Describe what falls short.
      2. "Target Standard": Describe the proficient level meeting the criteria.
      3. "Evidence of Exceeding": Describe what goes beyond.
      Map these to the scale labels provided: ${scaleText}.
    `;
  } else if (rubricType === 'Checklist') {
    taskInstruction = `
      Create a CHECKLIST rubric.
      Scale: ${scaleText} (likely Yes/No or Met/Not Met).
      For each criterion, the "Met" (or positive) level should describe the requirement being satisfied. The "Not Met" level can be brief (e.g. "Requirement not met").
    `;
  } else {
    // Analytic, Developmental, etc.
    taskInstruction = `
      Create a standard grid rubric (${rubricType}).
      For each criterion, generate a description for each performance level in the scale: ${scaleText}.
      Ensure descriptions are distinct and observable.
    `;
  }

  const promptText = `
    Context: University Course "${courseName}", Assignment: "${topic}".
    Additional Context: ${contextMaterial}
    
    Task: ${taskInstruction}
    
    Criteria to assess:
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
        criterionTitle: { type: Type.STRING },
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

    // Map back to internal structure
    const rows: RubricRow[] = [];
    
    if (rubricType === 'Holistic') {
      // Expecting 1 row from AI usually, or we merge if it failed to obey
      const holisticData = rawData[0]; // Take the first one which should be "Overall Performance"
      if (holisticData) {
        const levels = scaleLabels.map((label, idx) => {
           const aiLevel = holisticData.levels?.find((l: any) => l.levelName.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(l.levelName.toLowerCase()))
                        || holisticData.levels?.[idx];
           return {
             id: `lvl-holistic-${idx}`,
             title: label,
             score: idx + 1,
             description: aiLevel?.description || "Description pending...",
           };
        });
        
        // We need a dummy criterion for the UI to render the title "Overall Performance"
        // But we won't add it to the 'criteria' state, just the row.
        // Actually, the UI in Step3 uses 'criterionId' to look up title. 
        // We will handle this in Step3 or just add a fake criterion here if we could, 
        // but 'rows' link to 'criteria'.
        // Better: We assume the UI will render the row's criterionTitle if we store it?
        // Current RubricRow only stores criterionId.
        // Let's stick to matching existing criteria if possible, or use a special ID.
        
        rows.push({
          id: 'row-holistic',
          criterionId: 'holistic-overall', // Special ID
          levels: levels
        });
      }
    } else {
      // Standard matching for other types
      criteria.forEach((crit) => {
        const match = rawData.find((r: any) => r.criterionTitle.toLowerCase() === crit.title.toLowerCase());
        
        const levels = scaleLabels.map((label, idx) => {
          // fuzzy match level name
          const aiLevel = match?.levels?.find((l: any) => l.levelName.toLowerCase() === label.toLowerCase()) 
                       || match?.levels?.find((l: any) => label.toLowerCase().includes(l.levelName.toLowerCase()))
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
    }

    return rows;

  } catch (error) {
    console.error("Error generating rubric rows:", error);
    throw error;
  }
};
