import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fetch from "node-fetch";

export default async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle OPTIONS request (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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
};
