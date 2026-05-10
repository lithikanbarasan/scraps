import { NextResponse } from "next/server";
import {
  DetectLabelsCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";
import {
  isLikelyGroceryLabel,
  toDetectedIngredients,
} from "@/lib/rekognitionIngredients";

export const runtime = "nodejs";

type Body = {
  imageBase64?: string;
};

const FOOD_PARENT_HINTS = new Set([
  "food and beverage",
  "food",
  "produce",
  "fruit",
  "vegetable",
  "meal",
  "dish",
  "drink",
]);

function getRekognitionClient() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region) {
    return null;
  }

  if (!accessKeyId || !secretAccessKey) {
    // Fall back to AWS default credential provider chain:
    // env vars, shared config/credentials files, IAM role, etc.
    return new RekognitionClient({ region });
  }

  return new RekognitionClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const imageBase64 = body.imageBase64?.trim();
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Expected { imageBase64: string }" },
        { status: 400 }
      );
    }

    const client = getRekognitionClient();
    if (!client) {
      return NextResponse.json(
        { error: "AWS_REGION is missing on the server." },
        { status: 500 }
      );
    }

    const command = new DetectLabelsCommand({
      Image: {
        Bytes: Buffer.from(imageBase64, "base64"),
      },
      MaxLabels: 60,
      MinConfidence: 45,
    });

    const response = await client.send(command);
    const allLabels = response.Labels ?? [];
    const foodLikely = allLabels
      .filter((label) => {
        const parents = label.Parents ?? [];
        return parents.some((parent) =>
          FOOD_PARENT_HINTS.has((parent.Name ?? "").toLowerCase())
        );
      })
      .map((label) => ({
        name: label.Name ?? "",
        instanceCount: label.Instances?.length ?? 0,
      }));

    const base = allLabels.map((label) => ({
      name: label.Name ?? "",
      instanceCount: label.Instances?.length ?? 0,
    }));

    let ingredients = toDetectedIngredients(foodLikely).slice(0, 12);
    if (ingredients.length === 0) {
      ingredients = toDetectedIngredients(base)
        .filter((item) => isLikelyGroceryLabel(item.name))
        .slice(0, 12);
    }

    return NextResponse.json({
      ingredients,
      labels: ingredients.map((item) => item.name),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Detection failed";
    console.error("Rekognition ingredient detection failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
