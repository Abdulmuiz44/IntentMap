import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import { AnalysisResult, AnalysisResultSchema } from "./utils/schemas";
import { logger } from "./utils/logger";
import { withRetry } from "./utils/retry";

export class IntentEngine {
  private geminiModel: GenerativeModel;
  private mistralClient: Mistral;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!geminiKey || !mistralKey) {
      logger.warn("Missing API Keys for AI Engine. Ensure .env is set.");
    }

    const genAI = new GoogleGenerativeAI(geminiKey || "");
    this.geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.mistralClient = new Mistral({ apiKey: mistralKey || "" });
  }

  private constructPrompt(text: string): string {
    return `
      Analyze the following Reddit post content for business validation signals.
      
      Post Content: "${text.substring(0, 5000)}" 

      Your goal is to identify "Hard Pain" (losing money, losing time, deep frustration with competitors) versus "Polite Feedback" or general noise.

      Return a JSON object with the following fields:
      - "pain_score": (integer 1-10) How acute is the pain? 10 is immediate crisis.
      - "wtp_signal": (boolean) Is there a signal they might pay for a solution? (e.g., "I'd pay for...", "hiring", "expensive")
      - "hard_pain_summary": (string) A concise summary of the specific pain point.
      - "mom_test_question": (string) A "Mom Test" style question to ask the user in a DM to validate the problem without pitching (e.g., "How are you currently handling [X]?").
      - "is_high_intent": (boolean) True if pain_score >= 7 OR wtp_signal is true.

      Output ONLY valid JSON.
    `;
  }

  async analyze(text: string): Promise<AnalysisResult> {
    try {
      return await withRetry(() => this.analyzeWithGemini(text), 3, 1000, "Gemini Analysis");
    } catch (error) {
      logger.warn("Gemini failed, switching to Mistral...", { error });
      try {
        return await withRetry(() => this.analyzeWithMistral(text), 3, 1000, "Mistral Analysis");
      } catch (mistralError) {
          logger.error("Both AI engines failed.", { mistralError });
          return {
            pain_score: 0,
            wtp_signal: false,
            hard_pain_summary: "AI Analysis Failed",
            mom_test_question: null,
            is_high_intent: false,
          };
      }
    }
  }

  private async analyzeWithGemini(text: string): Promise<AnalysisResult> {
    const prompt = this.constructPrompt(text);
    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    return this.parseResponse(textResponse);
  }

  private async analyzeWithMistral(text: string): Promise<AnalysisResult> {
    const prompt = this.constructPrompt(text);
    const result = await this.mistralClient.chat.complete({
      model: "mistral-tiny",
      messages: [{ role: "user", content: prompt }],
    });

    if (!result.choices || result.choices.length === 0 || !result.choices[0].message.content) {
        throw new Error("Mistral returned an empty response.");
    }

    const content = result.choices[0].message.content;
    const textContent = typeof content === 'string' ? content : JSON.stringify(content);

    return this.parseResponse(textContent);
  }

  private parseResponse(responseText: string): AnalysisResult {
    try {
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const json = JSON.parse(cleanedText);
      const parsed = AnalysisResultSchema.safeParse(json);
      
      if (!parsed.success) {
          // Log specific validation errors
          logger.warn("AI response validation failed, returning fallback.", { errors: parsed.error.format() });
          throw new Error("AI response validation failed");
      }
      
      return parsed.data;
    } catch (e) {
      throw e; // Re-throw to trigger retry
    }
  }
}