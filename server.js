// Local development server
require("dotenv").config({ path: ".env.local" });
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Claude API proxy endpoint
app.post("/api/claude", async (req, res) => {
  try {
    console.log("Received Claude API request");
    const { messages, system } = req.body;

    console.log("Making Claude API request");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        messages,
        system,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log("Claude API response received");
    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Solana API endpoint
app.post("/api/solana", async (req, res) => {
  // Setup Solana connection using server-side env variable
  const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
  const SOLANA_RPC = HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : "https://api.mainnet-beta.solana.com";

  const connection = new Connection(SOLANA_RPC, {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
  });

  try {
    // Get action from request
    const { action, address, amount } = req.body;

    switch (action) {
      case "getSlot":
        const slot = await connection.getSlot();
        return res.status(200).json({ success: true, slot });

      case "getBalance":
        if (!address) {
          return res
            .status(400)
            .json({ success: false, error: "Address is required" });
        }
        try {
          const publicKey = new PublicKey(address);
          const balance = await connection.getBalance(publicKey);
          return res.status(200).json({
            success: true,
            balance: balance / LAMPORTS_PER_SOL,
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: `Invalid address: ${error.message}`,
          });
        }

      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid action" });
    }
  } catch (error) {
    console.error("Solana API error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API endpoints:`);
  console.log(`- Claude API: http://localhost:${port}/api/claude`);
  console.log(`- Solana API: http://localhost:${port}/api/solana`);
});
