import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextResponse } from "next/server";

// Schema including estimated unit price
const responseSchema: Schema = {
  type: Type.ARRAY,
  description: "List of grocery items with counts and average USD cost estimates",
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "Common English name of the ingredient (e.g., Apple, Onion, Tomato)",
      },
      count: {
        type: Type.INTEGER,
        description: "Exact visual count of this specific item in the photo",
      },
      estimatedUnitPrice: {
        type: Type.NUMBER,
        description: "Estimated average USD cost for a single unit of this item (e.g., 0.50 for an apple, 1.25 for a tomato)",
      },
    },
    required: ["name", "count", "estimatedUnitPrice"],
  },
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Image data (imageBase64) is required" },
        { status: 400 }
      );
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
        "Identify all distinct food items, raw produce, and grocery items visible in this photo. For each item type, count how many distinct instances are in the image, and provide a realistic estimated unit price in USD based on average US grocery prices.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ ingredients: [], labels: [] });
    }

    const detected = JSON.parse(text) as Array<{
      name: string;
      count: number;
      estimatedUnitPrice: number;
    }>;

    // Calculate total estimated value (count * unit price)
    const ingredients = detected.map((item) => {
      const count = item.count || 1;
      const unitPrice = item.estimatedUnitPrice || 0.5;
      return {
        name: item.name,
        count: count,
        estimatedValue: Number((count * unitPrice).toFixed(2)),
        confidence: 0.95,
      };
    });

    return NextResponse.json({
      ingredients,
      labels: ingredients.map((i) => i.name),
      detector: "gemini-2.5-flash",
    });
  } catch (err: any) {
    console.error("Gemini vision detection failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze image with Gemini" },
      { status: 500 }
    );
  }
}