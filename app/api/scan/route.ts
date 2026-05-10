import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    // We use GPT-4o because it is rock-solid for image extraction
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract grocery items as a JSON array with 'name', 'price', and 'category'. Return ONLY the JSON." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    // GPT-4o returns a clean object, we just need the items inside
    const result = JSON.parse(data.choices[0].message.content);
    const items = result.items || result.grocery_items || Object.values(result)[0];

    return NextResponse.json({ success: true, items });

  } catch (error: any) {
    console.error("OPENAI ERROR:", error.message);
    return NextResponse.json({ error: "Scan failed", details: error.message }, { status: 500 });
  }
}