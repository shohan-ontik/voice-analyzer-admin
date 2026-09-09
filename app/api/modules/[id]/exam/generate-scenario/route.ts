import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSessionToken } from "@/app/lib/session";

function buildPrompt(title: string, description?: string) {
  return `You are helping a sales-training admin write a realistic roleplay scenario question for a training module's final exam.

Module title: ${title}
Module description: ${description || "(none provided)"}

Write ONE scenario question (2-4 sentences) that puts a sales rep in a realistic client conversation relevant to this module's topic, ending with a specific objection or question the rep must respond to. Return only the scenario text itself — no title, labels, or markdown formatting.`;
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { title, description } = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
  };
  if (!title) {
    return NextResponse.json({ error: { message: "Module title is required." } }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured.");
    return NextResponse.json({ error: { message: "AI scenario generation is not configured." } }, { status: 502 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: [{ type: "text", text: buildPrompt(title, description) }],
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
