import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { KnowledgeRetrievalService } from "./src/services/knowledgeBase/retrievalService";
import { CurriculumService } from "./src/services/knowledgeBase/curriculumService";
import { KnowledgeDocumentService } from "./src/services/knowledgeBase/documentService";
import { ComparisonService } from "./src/services/knowledgeBase/comparisonService";

const app = express();
app.use(express.json({ limit: "10mb" }));

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin Email Outreach Service Endpoint (Single)
app.post("/api/admin/send-email", async (req, res) => {
  try {
    const { to, subject, body, html } = req.body;
    if (!to || !subject || (!body && !html)) {
      return res.status(400).json({ error: "Missing required fields (to, subject, body)" });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || "منصة الاجتماعيات الذكية <contact@jadha-ai.ma>";

    // If SMTP credentials exist, send directly via SMTP
    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const formattedHtml = html || `
        <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.8; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          ${body.replace(/\n/g, "<br/>")}
        </div>
      `;

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: body || "",
        html: formattedHtml,
      });

      return res.json({ success: true, mode: "smtp", messageId: info.messageId });
    }

    // If SMTP is not yet configured, return informative status so client uses direct 1-click Webmail
    return res.json({
      success: false,
      mode: "webmail_fallback",
      message: "SMTP is not configured in server environment; use direct Gmail/Webmail compose."
    });
  } catch (error: any) {
    console.error("[Email Dispatch Error]:", error);
    return res.status(500).json({ success: false, error: error?.message || "Failed to dispatch email" });
  }
});

// Admin Bulk Email Outreach Endpoint (for all registered users)
app.post("/api/admin/send-bulk-email", async (req, res) => {
  try {
    const { recipients, subject, body, html } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !subject || (!body && !html)) {
      return res.status(400).json({ error: "Missing required fields (recipients array, subject, body)" });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || "منصة الاجتماعيات الذكية <contact@jadha-ai.ma>";

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const formattedHtml = html || `
        <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.8; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          ${body.replace(/\n/g, "<br/>")}
        </div>
      `;

      // Send as BCC batch to preserve privacy and prevent recipient exposure
      const info = await transporter.sendMail({
        from,
        to: from, // Send to sender, BCC all recipients
        bcc: recipients,
        subject,
        text: body || "",
        html: formattedHtml,
      });

      return res.json({ success: true, mode: "smtp_bulk", count: recipients.length, messageId: info.messageId });
    }

    return res.json({
      success: false,
      mode: "webmail_fallback",
      count: recipients.length,
      message: "SMTP is not configured in server environment; use direct Gmail Web compose with BCC."
    });
  } catch (error: any) {
    console.error("[Bulk Email Dispatch Error]:", error);
    return res.status(500).json({ success: false, error: error?.message || "Failed to dispatch bulk email" });
  }
});


// Full-Stack Server-Side Gemini AI Endpoint
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, responseMimeType = "application/json", temperature, systemInstruction, preferredModel } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt parameter." });
    }

    const headerKey = req.headers["x-gemini-key"] as string | undefined;
    const apiKey = headerKey || process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.trim() === "" || apiKey.includes("TODO")) {
      return res.status(401).json({
        error: "مفتاح API غير متوفر على الخادم. يرجى التأكد من ضبط GEMINI_API_KEY في إعدادات المنصة أو إدخال مفتاحك يدوياً.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Valid production models across Gemini API generations
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-pro",
      "gemini-3.7-flash",
    ];
    const candidateModels = preferredModel
      ? [preferredModel, ...fallbackModels]
      : fallbackModels;

    const uniqueModels = Array.from(new Set(candidateModels));
    let generatedText = "";
    let lastError: any = null;

    for (const modelName of uniqueModels) {
      try {
        const config: any = {};
        if (responseMimeType) {
          config.responseMimeType = responseMimeType;
        }
        if (typeof temperature === "number") {
          config.temperature = temperature;
        }
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config,
        });

        if (response && response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Server AI] Model '${modelName}' attempt failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedText) {
      const errMsg = lastError?.message || "لم نتمكن من الحصول على رد من نماذج الذكاء الاصطناعي.";
      return res.status(500).json({ error: errMsg });
    }

    return res.json({ text: generatedText });
  } catch (error: any) {
    console.error("[Server AI] Fatal error during generate content:", error);
    return res.status(500).json({ error: error.message || "حدث خطأ غير متوقع في خادم الذكاء الاصطناعي." });
  }
});

// Grounded Context API Endpoint
app.post("/api/knowledge-base/grounded-context", async (req, res) => {
  try {
    const { subject, schoolLevel, component, lesson, unit } = req.body;
    const context = await KnowledgeRetrievalService.getGroundedContext({
      subject: subject || 'الاجتماعيات',
      schoolLevel: schoolLevel || 'الثالثة إعدادي',
      component: component || 'التاريخ',
      lesson: lesson || 'درس الاجتماعيات',
      unit
    });
    res.json(context);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching grounded context' });
  }
});

// Curriculum Reference Endpoint
app.get("/api/knowledge-base/curriculum", async (req, res) => {
  try {
    const { subject, schoolLevel, component } = req.query as any;
    const refs = await CurriculumService.listReferences({ subject, schoolLevel, component, status: 'ACTIVE' });
    res.json(refs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Documents Registry Endpoint
app.get("/api/knowledge-base/documents", async (req, res) => {
  try {
    const docs = await KnowledgeDocumentService.listDocuments();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Internal Benchmark Runner Endpoint
app.get("/api/benchmark", async (req, res) => {
  try {
    const report = await ComparisonService.runBenchmark();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();

export default app;
