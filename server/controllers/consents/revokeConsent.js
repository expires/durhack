const Consent = require("../../models/consent");
const { Connection, Keypair, Transaction, PublicKey } = require("@solana/web3.js");
const dotenv = require("dotenv");

dotenv.config();

const SOLANA_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
const connection = new Connection(SOLANA_URL, "confirmed");
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY))
);
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can revoke consents." });
    }

    const { consentId } = req.body;
    if (!consentId) {
      return res.status(400).json({ error: "Consent ID is required." });
    }

    const consent = await Consent.findOne({
      consentId,
      patientId: req.user._id,
    });

    if (!consent) {
      return res.status(404).json({ error: "Consent not found." });
    }

    if (!consent.providerId && consent.hospitalId) {
      consent.providerId = consent.hospitalId;
    }

    consent.revokedAt = new Date();

    const memoData = JSON.stringify({
      bridgeHealth: {
        action: "consent.revoke",
        patient: consent.patientId.toString(),
        provider: consent.providerId?.toString() || "",
        scopes: consent.scopes,
        purpose: consent.purpose,
        timestamp: new Date().toISOString(),
      },
    });

    const memoTx = new Transaction().add({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData),
    });

    const signature = await connection.sendTransaction(memoTx, [payer]);

    consent.solanaTx = signature;
    await consent.save();

    return res.json({ success: true, solanaTx: signature });
  } catch (err) {
    console.error("Error revoking consent:", err);
    return res.status(500).json({ error: "Failed to revoke consent." });
  }
};
