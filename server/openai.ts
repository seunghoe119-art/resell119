import axios from 'axios';

export interface GenerateDraftInput {
  productName: string;
  brand?: string;
  briefDescription?: string;
}

export interface GeneratedDraft {
  productName: string;
  brand: string;
  condition: string;
  additionalDescription: string;
  basicAccessories: string[];
  otherAccessories: string;
  features: string;
  originalPrice: number;
  sellingPrice: number;
  negotiable: string;
  transactionMethods: string[];
  directLocation: string;
}

export async function generateListingDraft(input: GenerateDraftInput): Promise<GeneratedDraft> {
  console.log("Starting draft generation for:", input.productName);
  
  try {
    const prompt = `Create a used goods listing draft in Korean language based on:
Product: ${input.productName}
${input.brand ? `Brand: ${input.brand}` : ''}
${input.briefDescription ? `Brief: ${input.briefDescription}` : ''}

Return JSON with Korean text values:
{
  "productName": "exact product name",
  "brand": "brand name",
  "condition": "excellent/good/fair/poor in Korean",
  "additionalDescription": "2-3 Korean sentences about condition",
  "basicAccessories": ["Korean accessory names"],
  "otherAccessories": "Korean text",
  "features": "newline-separated Korean features",
  "originalPrice": estimated_number,
  "sellingPrice": number_60_to_80_percent_of_original,
  "negotiable": "negotiable status in Korean",
  "transactionMethods": ["Korean transaction methods"],
  "directLocation": "Korean location"
}`;

    // Clean API key: remove all non-printable and non-ASCII characters
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const requestData = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You create Korean used goods listings. Respond with JSON containing Korean text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", requestData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    const result = JSON.parse(response.data.choices[0].message.content || "{}");
    return result as GeneratedDraft;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const code = error.code;
      console.error(`OpenAI API error: status=${status}, code=${code}`);
      
      const newError: any = new Error("AI draft generation failed");
      newError.status = status;
      newError.code = code;
      throw newError;
    }
    
    console.error("AI draft generation error:", error.message);
    throw new Error("AI draft generation failed");
  }
}
