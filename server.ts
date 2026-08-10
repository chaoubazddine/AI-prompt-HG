import express from "express";
import path from "path";
import { KnowledgeRetrievalService } from "./src/services/knowledgeBase/retrievalService";
import { CurriculumService } from "./src/services/knowledgeBase/curriculumService";
import { KnowledgeDocumentService } from "./src/services/knowledgeBase/documentService";
import { ComparisonService } from "./src/services/knowledgeBase/comparisonService";

const app = express();
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
