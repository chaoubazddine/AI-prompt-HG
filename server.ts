import "dotenv/config";
import express from "express";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { KnowledgeRetrievalService } from "./src/services/knowledgeBase/retrievalService";
import { CurriculumService } from "./src/services/knowledgeBase/curriculumService";
import { KnowledgeDocumentService } from "./src/services/knowledgeBase/documentService";
import { ComparisonService } from "./src/services/knowledgeBase/comparisonService";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Security configuration
const ADMIN_EMAILS = ["chaoub7@gmail.com"];
const PROJECT_ID = "gen-lang-client-0679844552";

// Cache for Google's public certificates used to verify Firebase ID tokens
interface GoogleCerts {
  certs: Record<string, string>;
  expiresAt: number;
}
let cachedCerts: GoogleCerts | null = null;

async function getGooglePublicKeys(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && cachedCerts.expiresAt > now) {
    return cachedCerts.certs;
  }
  try {
    const res = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    );
    if (!res.ok) throw new Error(`Failed to fetch Google certificates: ${res.statusText}`);
    const certs = (await res.json()) as Record<string, string>;
    const cacheControl = res.headers.get("cache-control");
    let maxAge = 3600;
    if (cacheControl) {
      const match = cacheControl.match(/max-age=(\d+)/);
      if (match) maxAge = parseInt(match[1], 10);
    }
    cachedCerts = { certs, expiresAt: now + maxAge * 1000 };
    return certs;
  } catch (err) {
    if (cachedCerts) return cachedCerts.certs;
    throw err;
  }
}

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedAuthToken> {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf-8"));
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Invalid token header algorithms");
  }

  const certs = await getGooglePublicKeys();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error("Unknown certificate key id");
  }

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${payloadB64}`);
  const signature = Buffer.from(signatureB64, "base64url");
  const isValid = verifier.verify(cert, signature);
  if (!isValid) {
    throw new Error("Token signature verification failed");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSec) {
    throw new Error("Token has expired");
  }
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) {
    throw new Error("Token issuer mismatch");
  }
  if (payload.aud !== PROJECT_ID) {
    throw new Error("Token audience mismatch");
  }
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Token subject missing");
  }

  return {
    uid: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    ...payload,
  };
}

// Middleware to enforce Admin privileges
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "مصادقة المشرف مطلوبة: يرجى تسجيل الدخول بحساب المشرف." });
    }
    const token = authHeader.slice(7).trim();
    const decoded = await verifyFirebaseToken(token);
    if (!decoded.email || !ADMIN_EMAILS.includes(decoded.email.toLowerCase())) {
      return res.status(403).json({ error: "تم رفض الوصول: هذا المسار مخصص لمدير المنصة فقط." });
    }
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: `جلسة المصادقة غير صالحة: ${err.message}` });
  }
}

// In-memory sliding window rate limiter
interface RateLimitEntry {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= limit) {
    return false;
  }
  entry.timestamps.push(now);
  rateLimitMap.set(key, entry);
  return true;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin Email Outreach Service Endpoint (Single) - Protected with requireAdminAuth
app.post("/api/admin/send-email", requireAdminAuth, async (req, res) => {
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

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const formattedHtml =
        html ||
        `
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

    return res.json({
      success: false,
      mode: "webmail_fallback",
      message: "SMTP is not configured in server environment; use direct Gmail/Webmail compose.",
    });
  } catch (error: any) {
    console.error("[Email Dispatch Error]:", error);
    return res.status(500).json({ success: false, error: error?.message || "Failed to dispatch email" });
  }
});

// Admin Bulk Email Outreach Endpoint - Protected with requireAdminAuth
app.post("/api/admin/send-bulk-email", requireAdminAuth, async (req, res) => {
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

      const formattedHtml =
        html ||
        `
        <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.8; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          ${body.replace(/\n/g, "<br/>")}
        </div>
      `;

      const info = await transporter.sendMail({
        from,
        to: from,
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
      message: "SMTP is not configured in server environment; use direct Gmail Web compose with BCC.",
    });
  } catch (error: any) {
    console.error("[Bulk Email Dispatch Error]:", error);
    return res.status(500).json({ success: false, error: error?.message || "Failed to dispatch bulk email" });
  }
});

// Full-Stack Server-Side Gemini AI Endpoint - Protected with authentication & rate limiting
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, responseMimeType = "application/json", temperature, systemInstruction, preferredModel } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt parameter." });
    }

    // 1. Length constraint to prevent token exhaustion attacks
    if (prompt.length > 25000) {
      return res.status(400).json({ error: "حجم الطلب يتجاوز الحد الأقصى المسموح به (25,000 حرف)." });
    }

    // 2. Authentication check: allow either custom client API key OR verified Firebase user
    const headerKey = req.headers["x-gemini-key"] as string | undefined;
    const authHeader = req.headers.authorization;
    let clientIdentifier = req.ip || "unknown";

    if (headerKey && headerKey.trim() && headerKey !== "YOUR_API_KEY") {
      clientIdentifier = `key_${headerKey.slice(-6)}`;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = await verifyFirebaseToken(authHeader.slice(7).trim());
        (req as any).user = decoded;
        clientIdentifier = `uid_${decoded.uid}`;
      } catch (authErr: any) {
        return res.status(401).json({ error: "جلسة المستخدم منتهية الصلاحية أو غير صالحة. يرجى تسجيل الدخول مجدداً." });
      }
    } else {
      return res.status(401).json({
        error: "يجب تسجيل الدخول في المنصة أو إدخال مفتاح Gemini API الشخصي لتوليد المحتوى بالذكاء الاصطناعي.",
      });
    }

    // 3. Sliding window rate limiter (15 requests / min per client)
    const isAllowed = checkRateLimit(clientIdentifier, 15, 60000);
    if (!isAllowed) {
      return res.status(429).json({
        error: "تجاوزت الحد المسموح به من الطلبات مؤقتاً (15 طلباً في الدقيقة). يرجى الانتظار دقيقة والمحاولة مجدداً.",
      });
    }

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

    const fallbackModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash",
    ];

    const candidateModels: string[] = [];
    if (preferredModel && fallbackModels.includes(preferredModel)) {
      candidateModels.push(preferredModel);
    }
    candidateModels.push(...fallbackModels);

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
        lastError = err;
        console.info(`[Server AI] Model '${modelName}' unavailable, proceeding to next fallback...`);
        continue;
      }
    }

    if (!generatedText) {
      console.error("[Server AI] All fallback models failed. Final error:", lastError?.message);
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
      subject: subject || "الاجتماعيات",
      schoolLevel: schoolLevel || "الثالثة إعدادي",
      component: component || "التاريخ",
      lesson: lesson || "درس الاجتماعيات",
      unit,
    });
    res.json(context);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error fetching grounded context" });
  }
});

// Curriculum Reference Endpoint
app.get("/api/knowledge-base/curriculum", async (req, res) => {
  try {
    const { subject, schoolLevel, component } = req.query as any;
    const refs = await CurriculumService.listReferences({ subject, schoolLevel, component, status: "ACTIVE" });
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

// Internal Benchmark Runner Endpoint - Admin Only
app.get("/api/benchmark", requireAdminAuth, async (req, res) => {
  try {
    const report = await ComparisonService.runBenchmark();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // In AI Studio, the dev server must always listen on port 3000
  // (PORT=8080 in environment is used by NGINX frontend reverse proxy)
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

export default app;
