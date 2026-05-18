import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Route: Simulator Faucet
  app.post("/api/faucet", (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Address required" });
    
    // In a real app, this would hit the Testnet Faucet API
    res.json({ 
      success: true, 
      message: `Transferred 10 GEN to ${address}`,
      txHash: `0x${Math.random().toString(16).slice(2)}` 
    });
  });

  // API Route: Secure Oracle Simulator (Intelligent Contracts)
  // Maintains API keys private while providing weather/price data to simulated contracts
  app.post("/api/simulate/oracle", async (req, res) => {
    const { type, params } = req.body;
    
    try {
      if (type === "weather") {
        // Mocking an external API call that would normally use an API key from process.env
        res.json({ temp: 22, condition: "Sunny", location: params.location });
      } else if (type === "price") {
        res.json({ price: 65230.45, asset: params.asset });
      } else {
        res.json({ status: "Unknown oracle type" });
      }
    } catch (error) {
      res.status(500).json({ error: "Oracle simulation failed" });
    }
  });

  // API Route: AI Assistant (Gemini)
  app.post("/api/ai/assistant", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }
    
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const result = await model.generateContent(prompt);
      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GenLayer Studio Server running on http://localhost:${PORT}`);
  });
}

startServer();
