const crypto = require("crypto");
const {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
} = require("@solana/web3.js");
const ConsentModel = require("../../models/consent");
const Record = require("../../models/record");
const User = require("../../models/user");

const PURPOSES = ConsentModel.PURPOSES || [
  "care",
  "research",
  "audit",
  "billing",
  "referral",
  "emergency",
  "data_portability",
];

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

    const {
      providerId: providerIdFromBody,
      hospitalId: legacyHospitalId,
      recordIds = [],
      expiresAt,
    } = req.body;

    const providerId = providerIdFromBody || legacyHospitalId;

    if (!providerId) {
      return res.status(400).json({ error: "Provider ID is required." });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.role === "patient") {
      return res.status(404).json({ error: "Provider not found." });
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

    let purpose = "care";
    if (provider.role === "researcher") {
      purpose = "research";
    } else if (provider.role === "auditor") {
      purpose = "audit";
    } else if (provider.role === "insurance") {
      purpose = "billing";
    } else if (provider.role === "emergency") {
      purpose = "emergency";
    }
    if (!PURPOSES.includes(purpose)) {
      purpose = "care";
    }

    let scopes = ["records.read"];
    if (["doctor", "hospital"].includes(provider.role)) {
      scopes = ["records.read", "records.write", "labs.read", "labs.write"];
    } else if (provider.role === "researcher") {
      scopes = ["records.read", "labs.read"];
    }

    const consentId = crypto.randomUUID();
    const consentDoc = {
      consentId,
      patientId: req.user._id,
      providerId,
      recordIds: authorizedRecords.map((r) => r._id),
      scopes,
      purpose,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };
    if (provider.role === "hospital") {
      consentDoc.hospitalId = provider._id;
    }

    const receiptHash = hashConsent({
      ...consentDoc,
      recordIds: consentDoc.recordIds.map((id) => id.toString()),
      patientId: consentDoc.patientId.toString(),
      providerId: consentDoc.providerId.toString(),
    });

    const memoPayload = `BRIDGEHEALTH_CONSENT:${consentId}:${receiptHash}`;
    const memoInstruction = {
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, "utf8"),
    };

    const tx = new Transaction().add(memoInstruction);
    const signature = await connection.sendTransaction(tx, [payer]);

    const consent = await ConsentModel.create({
      ...consentDoc,
      solanaTx: signature,
      receiptHash,
    });

    const memoData = JSON.stringify({
      bridgeHealth: {
        action: "consent.create",
        patient: consent.patientId.toString(),
        provider: consent.providerId.toString(),
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

    const memoSignature = await connection.sendTransaction(memoTx, [payer]);

    consent.solanaTx = memoSignature;
    await consent.save();

    return res.status(201).json({
      success: true,
      solanaTx: memoSignature,
      consentId: consent.consentId,
    });
  } catch (err) {
    console.error("Error creating consent:", err);
    return res.status(500).json({ error: "Failed to create consent." });
  }
};
