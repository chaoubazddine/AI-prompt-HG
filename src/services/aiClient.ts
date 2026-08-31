import { GoogleGenAI } from "@google/genai";

interface GenerateAIOptions {
  prompt: string;
  responseMimeType?: string;
  temperature?: number;
  systemInstruction?: string;
  preferredModel?: string;
}

/**
 * Robust full-stack AI content generator.
 * Tries server-side /api/ai/generate first (where process.env.GEMINI_API_KEY is securely held).
 * Falls back to client-side GoogleGenAI if a custom key is provided in localStorage.
 */
export async function generateAIContent(options: GenerateAIOptions): Promise<string> {
  const { prompt, responseMimeType = "application/json", temperature, systemInstruction, preferredModel } = options;

  // Retrieve optional user-entered key from localStorage
  const manualKey = typeof window !== "undefined" ? localStorage.getItem("user_gemini_key") : null;

  // 1. Try server-side API proxy route
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (manualKey) {
      headers["x-gemini-key"] = manualKey;
    }

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        responseMimeType,
        temperature,
        systemInstruction,
        preferredModel: preferredModel || "gemini-3.7-flash",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return data.text;
      }
    } else {
      const errData = await res.json().catch(() => null);
      console.warn("Server AI route returned non-OK status:", res.status, errData);
      
      // If server returned specific error message, propagate it
      if (errData && errData.error && res.status !== 404 && res.status !== 502 && !manualKey) {
        throw new Error(errData.error);
      }
    }
  } catch (serverErr: any) {
    console.warn("Fetch to /api/ai/generate failed or threw error:", serverErr?.message);
    // If it's a specific API key / permission error that already has a message, throw it
    if (serverErr?.message && !serverErr.message.includes("fetch") && !serverErr.message.includes("network")) {
      throw serverErr;
    }
  }

  // 2. Client-side fallback (if user entered a custom key or in standalone environment)
  const clientKey = manualKey || (typeof process !== "undefined" ? (process.env.API_KEY || process.env.GEMINI_API_KEY) : null);
  if (!clientKey || clientKey === "YOUR_API_KEY" || clientKey.trim() === "" || clientKey.includes("TODO")) {
    throw new Error("تعذر الاتصال بخدمة الذكاء الاصطناعي. يرجى التأكد من اتصال الإنترنت أو إدخال مفتاح API في الإعدادات.");
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: clientKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-pro",
      "gemini-3.7-flash",
    ];
    const modelsToTry = preferredModel ? [preferredModel, ...fallbackModels] : fallbackModels;
    let lastErr: any = null;

    for (const model of Array.from(new Set(modelsToTry))) {
      try {
        const config: any = {};
        if (responseMimeType) config.responseMimeType = responseMimeType;
        if (typeof temperature === "number") config.temperature = temperature;
        if (systemInstruction) config.systemInstruction = systemInstruction;

        const res = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        if (res && res.text) {
          return res.text;
        }
      } catch (err: any) {
        console.warn(`[Client AI Fallback] Model '${model}' failed:`, err?.message || err);
        lastErr = err;
      }
    }

    throw lastErr || new Error("فشل في توليد المحتوى بالذكاء الاصطناعي.");
  } catch (clientErr: any) {
    console.error("Client AI generation failed:", clientErr);
    throw new Error(clientErr?.message || "حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي.");
  }
}
