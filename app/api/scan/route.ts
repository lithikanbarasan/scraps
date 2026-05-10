import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ error: "No receipt uploaded" }, { status: 400 });
    }

    // 1. Convert the file to a format Veryfi understands (Base64)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 2. Call the Veryfi API
    const response = await axios.post(
      'https://api.veryfi.com/api/v8/partner/documents',
      {
        file_data: base64Image,
        file_name: file.name,
        categories: ["Grocery"]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'CLIENT-ID': process.env.VERYFI_CLIENT_ID,
          'Authorization': `apikey ${process.env.VERYFI_API_KEY}`
        }
      }
    );

    // 3. Extract the line items (the food!)
    const items = response.data.line_items.map((item: any) => ({
      name: item.description,
      price: item.total,
      category: item.category || "General"
    }));

    return NextResponse.json({ success: true, items });

  } catch (error: any) {
    console.error("AI Scan Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to read receipt" }, { status: 500 });
  }
}