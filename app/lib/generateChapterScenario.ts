import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { ChapterScenario } from "./types";

// Every chapter needs a roleplay scenario (PitchScenario on the trainee
// side) but the admin app has no manual editor for it — it's generated
// automatically from the chapter's topic (title/description) whenever a
// chapter is created or renamed. Returns null on any failure so callers can
// fall back to the backend's placeholder rather than blocking the request.
const SCENARIO_SCHEMA = {
  type: "object",
  properties: {
    clientInitials: { type: "string", description: "1-2 letter initials for the client, in Bengali" },
    clientName: { type: "string", description: "Full name of the client (doctor/chemist), in Bengali" },
    clientTitle: { type: "string", description: "Their job title and workplace, in Bengali" },
    objection: { type: "string", description: "The objection or question the client raises, in Bengali, 1-2 sentences" },
    objective: { type: "string", description: "What the rep should accomplish in this roleplay, in Bengali, 1-2 sentences" },
    criteria: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
      description: "Evaluation criteria for grading the rep's response, in Bengali",
    },
  },
  required: ["clientInitials", "clientName", "clientTitle", "objection", "objective", "criteria"],
};

function buildPrompt(title: string, description?: string) {
  return `You are designing a sales-training roleplay scenario for a chapter in a pharmaceutical sales training course aimed at medical representatives in Bangladesh.

Chapter title: ${title}
Chapter description: ${description || "(none provided)"}

Create a realistic roleplay scenario (a doctor or chemist objection/question relevant to this chapter's topic) that a rep will practice responding to. Write it in Bengali (বাংলা), matching the style of a real doctor/chemist interaction. Return JSON matching the given schema exactly.`;
}

export async function generateChapterScenario(title: string, description?: string): Promise<ChapterScenario | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured — skipping chapter scenario generation.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: [{ type: "text", text: buildPrompt(title, description) }],
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: SCENARIO_SCHEMA,
      },
    });

    if (!interaction.output_text) {
      throw new Error("Gemini returned no output.");
    }

    return JSON.parse(interaction.output_text) as ChapterScenario;
  } catch (err) {
    console.error("Chapter scenario generation failed:", err);
    return null;
  }
}
