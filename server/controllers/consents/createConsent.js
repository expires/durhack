const crypto = require("crypto");
const {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
} = require("@solana/web3.js");
const Consent = require("../../models/consent");
const Record = require("../../models/record");
const User = require("../../models/user");

const SOLANA_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
const connection = new Connection(SOLANA_URL, "confirmed");
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY))
);
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const hashConsent = (payload) => {
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

module.exports = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can create consents." });
    }

    const { hospitalId, recordIds = [], scopes = [], purpose, expiresAt } =
      req.body;

    if (!hospitalId) {
      return res.status(400).json({ error: "Hospital ID is required." });
    }

    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== "hospital") {
      return res.status(404).json({ error: "Hospital not found." });
    }

    let authorizedRecords = [];
    if (recordIds.length) {
      authorizedRecords = await Record.find({
        _id: { $in: recordIds },
        userId: req.user._id,
      }).select("_id fileName recordType solanaTx gcsFileUrl uploadedAt");

      if (authorizedRecords.length !== recordIds.length) {
        return res
          .status(400)
          .json({ error: "One or more records are invalid for this patient." });
      }
    }

    if (!authorizedRecords.length) {
      return res
        .status(400)
        .json({ error: "Select at least one record to authorize." });
    }

    const consentId = crypto.randomUUID();
    const consentDoc = {
      consentId,
      patientId: req.user._id,
      hospitalId,
      recordIds: authorizedRecords.map((r) => r._id),
      scopes: scopes.length ? scopes : ["records.read"],
      purpose: purpose || "care",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    const receiptHash = hashConsent({
      ...consentDoc,
      recordIds: consentDoc.recordIds.map((id) => id.toString()),
      patientId: consentDoc.patientId.toString(),
      hospitalId: consentDoc.hospitalId.toString(),
    });

    const memoPayload = `BRIDGEHEALTH_CONSENT:${consentId}:${receiptHash}`;
    const memoInstruction = {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, "utf8"),
    };

    const tx = new Transaction().add(memoInstruction);
    const signature = await connection.sendTransaction(tx, [payer]);

    const consent = await Consent.create({
      ...consentDoc,
      solanaTx: signature,
      receiptHash,
    });

    return res.status(201).json({
      success: true,
      consent,
    });
  } catch (err) {
    console.error("Error creating consent:", err);
    return res.status(500).json({ error: "Failed to create consent." });
  }
};
