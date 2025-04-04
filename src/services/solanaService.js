import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";

// Polyfill Buffer for browser environment
window.Buffer = window.Buffer || Buffer;

// Configure API URL based on environment
let apiUrl;
if (process.env.NODE_ENV === "production") {
  apiUrl = process.env.REACT_APP_API_URL || "/api";
} else {
  apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
}

// For direct connection (only used for operations that don't require API key)
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC, {
  commitment: "confirmed",
  disableRetryOnRateLimit: false,
  confirmTransactionInitialTimeout: 60000, // 60 seconds
});

/**
 * Get the current slot number on Solana
 */
export const getCurrentSlot = async () => {
  try {
    const response = await fetch(`${apiUrl}/solana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "getSlot" }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.slot;
  } catch (error) {
    console.error("Error getting current slot:", error.message);
    throw new Error(`Solana connection failed: ${error.message}`);
  }
};

/**
 * Get the balance of a Solana account
 * @param {string} address - Solana account address
 */
export const getAccountBalance = async (address) => {
  try {
    const response = await fetch(`${apiUrl}/solana`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "getBalance",
        address,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    return data.balance;
  } catch (error) {
    console.error("Error getting account balance:", error.message);
    throw error;
  }
};

/**
 * Get detailed account information
 * @param {string} address - Solana account address
 */
export const getAccountInfo = async (address) => {
  try {
    const publicKey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo;
  } catch (error) {
    console.error("Error getting account info:", error.message);
    throw error;
  }
};

/**
 * Transfer SOL between accounts
 * @param {string} secretKey - Sender's secret key as base58 string or Uint8Array
 * @param {string} toAddress - Recipient's public address
 * @param {number} amount - Amount of SOL to transfer
 */
export const transferSol = async (secretKey, toAddress, amount) => {
  try {
    // Create keypair from secret key
    let fromKeypair;
    if (typeof secretKey === "string") {
      // If secretKey is a base58 string
      const decodedKey = Uint8Array.from(Buffer.from(secretKey, "base58"));
      fromKeypair = Keypair.fromSecretKey(decodedKey);
    } else {
      // If secretKey is already a Uint8Array
      fromKeypair = Keypair.fromSecretKey(secretKey);
    }

    const toPublicKey = new PublicKey(toAddress);

    // Create a transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    // Sign and send the transaction
    const signature = await connection.sendTransaction(
      transaction,
      [fromKeypair],
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    // Confirm transaction with longer timeout for mainnet
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getBlockHeight()) + 150,
      },
      "confirmed"
    );

    return { signature, confirmation };
  } catch (error) {
    console.error("Error transferring SOL:", error.message);
    throw error;
  }
};

/**
 * Request airdrop of SOL to the specified address (devnet only)
 * @param {string} address - Solana account address
 * @param {number} amount - Amount of SOL to request (usually max 2 SOL)
 */
export const requestAirdrop = async (address, amount = 1) => {
  try {
    const publicKey = new PublicKey(address);
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

    const confirmation = await connection.confirmTransaction(signature);
    return { signature, confirmation };
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    throw error;
  }
};

// Export connection related info
export const currentEndpoint = "mainnet";
export { connection, SOLANA_RPC };
