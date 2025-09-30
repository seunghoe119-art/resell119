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

    console.log("Preparing axios request...");
    
    const requestData = {
      model: "gpt-5",
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
    
    console.log("Request data prepared, making axios call...");

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    // Clean API key: remove all non-printable and non-ASCII characters
    const apiKey = (process.env.OPENAI_API_KEY || '')
      .replace(/[\r\n\t\f\v]/g, '') // Remove all whitespace control characters
      .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII characters
      .trim();
    
    console.log("API Key length after cleaning:", apiKey.length);
    console.log("API Key starts with:", apiKey.substring(0, 7));
    
    const response = await axios.post("https://api.openai.com/v1/chat/completions", requestData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    console.log("Axios call completed, status:", response.status);

    const result = JSON.parse(response.data.choices[0].message.content || "{}");
    console.log("Draft generated successfully");
    return result as GeneratedDraft;
  } catch (error: any) {
    console.error("Error in generateListingDraft:", error);
    console.error("Error stack:", error.stack);
    throw new Error("AI draft generation failed: " + error.message);
  }
}
