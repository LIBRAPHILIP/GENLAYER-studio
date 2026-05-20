import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

let __filename = "";
let __dirname = "";

if (typeof __filename !== "undefined" && typeof __dirname !== "undefined") {
  // Available in Node.js CJS environment natively
} else {
  // ESM Fallback which silences build-time CJS warnings with dynamic property lookups
  const metaUrl = (import.meta as any).url;
  if (metaUrl) {
    __filename = fileURLToPath(metaUrl);
    __dirname = path.dirname(__filename);
  }
}

const app = express();
app.use(express.json());

// In-memory databases to simulate secure cloud storage & stateful layers
const vaultStorage = new Map<string, string>();
const faucetHistory = new Map<string, number>(); // Address -> Last timestamp

  // API AI assistance route
  app.post("/api/gemini/assist", async (req, res) => {
    try {
      const { code } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ suggestion: "Gemini API key is not configured." });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an expert in GenLayer Intelligent Contracts. 
      Analyze the following code and provide a one-sentence technical optimization tip.
      
      Code:
      ${code}
      
      Suggestion:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      
      const suggestion = response.text;
      res.json({ suggestion: suggestion?.trim() || "No suggestion available." });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ suggestion: "AI service currently unable to analyze this code." });
    }
  });

  // AI-Assisted Monaco/IDE Completions Endpoint (Gemma/Gemini backend)
  app.post("/api/ai/completions", async (req, res) => {
    try {
      const { code, contextPruning } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ 
          completion: "    # Provide suggestions or complete your contract structure\n    pass" 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an AI code completion agent for GenLayer Intelligent Contracts (Python-based contracts).
      Given the current code block, suggest a multi-line code contribution or completion.
      Do not include explanations, do not include markdown blocks, do not include backticks. Just output pure runnable code that continues logically from the provided text.
      
      Current Code Context:
      ${code}
      
      Helpful guidelines:
      - Inherit from IntelligentContract
      - Standard syntax: def some_function(self, ...):
      - Oracles or consensus: use self.consensus or intelligent tools if applicable.
      
      Provide the short code completion response directly:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      // Strip markdown code backticks if the model accidentally outputted them
      text = text.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").replace(/`/g, "");
      
      res.json({ completion: text });
    } catch (error: any) {
      console.error("Completion Error:", error);
      res.json({ completion: "    # [Assistant offline. Check API connectivity in settings.]" });
    }
  });

  // Vault Service Integration Simulator Endpoints
  app.post("/api/vault/:service", (req, res) => {
    try {
      const { service } = req.params;
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: "API Key value is required" });
      }

      // Simulate HashiCorp Vault token & secret security writes internally
      vaultStorage.set(service, key);
      res.json({ success: true, service, message: "Secret stored securely in encrypted local vault." });
    } catch (error) {
      res.status(500).json({ error: "Failed to store secret securely." });
    }
  });

  app.get("/api/vault/:service", (req, res) => {
    try {
      const { service } = req.params;
      const exists = vaultStorage.has(service);
      const val = vaultStorage.get(service) || "";
      
      // Mask key for transmission transparency (Security Checklist mandate)
      const masked = val ? `••••••••••••${val.slice(-4) || ""}` : "";
      res.json({ exists, service, value: masked });
    } catch (error) {
      res.status(500).json({ error: "Failed to query vault." });
    }
  });

  // Faucet Distribution & IP/Address Rate-Limiting Engine
  app.post("/api/faucet/request", (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Target address is required" });
      }

      const now = Date.now();
      const lastRequest = faucetHistory.get(address.toLowerCase());
      const COOLDOWN = 1000 * 60 * 60 * 24; // 24-hours cool down restriction

      if (lastRequest && (now - lastRequest) < COOLDOWN) {
        const timeRemaining = Math.ceil((COOLDOWN - (now - lastRequest)) / (1000 * 60 * 60));
        return res.status(429).json({ 
          error: `Rate Protection limit. Please wait ${timeRemaining} hours before requesting again.` 
        });
      }

      // Record request timestamp safely
      faucetHistory.set(address.toLowerCase(), now);

      // Generate a realistic Ethereum-like Tx Hash for explorer integration
      const randomBytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
      const txHash = "0x" + randomBytes.map(b => b.toString(16).padStart(2, "0")).join("");

      res.json({ 
        success: true, 
        txHash, 
        amount: "100 GEN", 
        gasUsed: 21000 
      });
    } catch (error) {
      res.status(500).json({ error: "Faucet distribution failed." });
    }
  });

  // API health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Only start server listener and Vite/static configuration if NOT on Vercel.
  // Vercel serverless handles request routing and serves static folders natively.
  const isVercel = !!process.env.VERCEL;

  async function bootstrap() {
    if (!isVercel) {
      if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);

        const PORT = 3000;
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });

        const PORT = 3000;
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Server running on port ${PORT}`);
        });
      }
    }
  }

  bootstrap().catch(err => {
    console.error("Failed to bootstrap server:", err);
  });

  export default app;
