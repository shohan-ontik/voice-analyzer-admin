import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ApiClientError, getAdminModule } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";
import type { AdminModuleDetail } from "@/app/lib/types";

function describeChapters(chapters: AdminModuleDetail["chapters"]) {
  return [...chapters]
    .sort((a, b) => a.order - b.order)
    .map((chapter, index) => {
      const lessons = chapter.materials.length
        ? chapter.materials
            .map((m) => `   - [${m.type}] ${m.title}${m.meta ? ` (${m.meta})` : ""}`)
            .join("\n")
        : "   - (no lessons yet)";
      return `${index + 1}. ${chapter.title}${chapter.description ? `: ${chapter.description}` : ""}\n${lessons}`;
    })
    .join("\n");
}

function buildPrompt(trainingModule: AdminModuleDetail) {
  return `You are helping a sales-training admin write a realistic roleplay scenario question for a training module's final exam. The exam is taken after the trainee completes every chapter, so it should test what the chapters and lessons below actually teach.

Module title: ${trainingModule.title}
Module description: ${trainingModule.description || "(none provided)"}

Chapters and lessons:
${describeChapters(trainingModule.chapters)}

Write ONE scenario question (2-4 sentences) that puts a sales rep in a realistic client conversation drawing on the key topics across these chapters and lessons, ending with a specific objection or question the rep must respond to. Write it in the same language as the module content above. Return only the scenario text itself — no title, labels, or markdown formatting.`;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured.");
    return NextResponse.json({ error: { message: "AI scenario generation is not configured." } }, { status: 502 });
  }

  let trainingModule: AdminModuleDetail;
  try {
    trainingModule = await getAdminModule(token, id);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Load module for scenario generation failed:", err);
    return NextResponse.json({ error: { message: "Failed to load this module." } }, { status: 502 });
  }

  if (trainingModule.chapters.length === 0) {
    return NextResponse.json(
      { error: { message: "Add at least one chapter to this module before generating a scenario." } },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: [{ type: "text", text: buildPrompt(trainingModule) }],
    });

    if (!interaction.output_text) {
      throw new Error("Gemini returned no output.");
    }

    return NextResponse.json({ scenario: interaction.output_text.trim() });
  } catch (err) {
    console.error("Generate scenario failed:", err);
    return NextResponse.json({ error: { message: "Failed to generate a scenario." } }, { status: 502 });
  }
}
