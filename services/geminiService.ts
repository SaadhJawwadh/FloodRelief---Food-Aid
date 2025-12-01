import { GoogleGenAI, Type } from "@google/genai";
import { FoodRequest, UrgencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for fast and cost-effective extraction
const MODEL_NAME = "gemini-2.5-flash";

export const extractFoodRequests = async (rawText: string): Promise<FoodRequest[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a disaster relief coordinator AI. Analyze the following unstructured text which contains various mixed requests (rescue, medical, food, shelter, etc.). 
      
      Task:
      1. Identify ONLY requests strictly related to FOOD, WATER, RATIONS, or BABY FORMULA.
      2. Ignore requests that are purely for boat rescue or medical aid unless food is also explicitly mentioned.
      3. Extract structured data for each request.
      4. Estimate the urgency based on keywords (e.g., "starving", "no water for 2 days" = Critical).
      5. If specific contact info or location is missing, put "Unknown".

      Input Text:
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              requesterName: { type: Type.STRING, description: "Name of person or group asking for help" },
              location: { type: Type.STRING, description: "Address, landmark, or coordinates" },
              contactNumber: { type: Type.STRING, description: "Phone number if available" },
              needs: { type: Type.STRING, description: "Short summary of specific food/water needs" },
              peopleCount: { type: Type.NUMBER, description: "Estimated number of people affecting, default to 1 if unknown" },
              urgency: { 
                type: Type.STRING, 
                enum: [UrgencyLevel.CRITICAL, UrgencyLevel.HIGH, UrgencyLevel.MODERATE, UrgencyLevel.LOW],
                description: "Urgency level assessment"
              },
              originalText: { type: Type.STRING, description: "The original snippet of text for reference" }
            },
            required: ["requesterName", "location", "needs", "urgency", "originalText"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsedData = JSON.parse(jsonText);
    
    // Add client-side IDs and timestamp
    return parsedData.map((item: any, index: number) => ({
      ...item,
      id: `req-${Date.now()}-${index}`,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to process requests using Gemini AI.");
  }
};

export const searchAndExtractFoodRequests = async (): Promise<FoodRequest[]> => {
  try {
    // Step 1: Search the web for specific data
    // We use gemini-2.5-flash with googleSearch tool as per documentation for text grounding
    const searchResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for the latest urgent food, water, and relief supply requests listed on 'floodsupport.org'. 
      Also find recent social media posts and news reports describing specific people or communities stranded without food in the current flood affected regions.
      Compile a detailed textual list of these requests, including location, contact numbers (if any), specific needs, and number of people.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const searchData = searchResponse.text;
    
    if (!searchData) {
      throw new Error("No data found from web search.");
    }

    // Step 2: Extract structured data from the search result text
    // We append a header to indicate the source
    const contextText = `[SOURCE: Web Search results for floodsupport.org and related feeds]\n\n${searchData}`;
    
    return await extractFoodRequests(contextText);

  } catch (error) {
    console.error("Web Search Error:", error);
    throw new Error("Failed to fetch and process data from the web.");
  }
};