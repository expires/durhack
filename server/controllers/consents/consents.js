const crypto = require('crypto');
const { Connection, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const Consent = require('../../models/consent');
const Provider = require('../../models/provider');
const User = require('../../models/user');

// Helper function to hash consent object consistently
const hashConsent = (obj) => {
  const normalized = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

const SOLANA_URL = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_URL, 'confirmed');
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY))
);

exports.createConsent = async (req, res) => {
  try {
    const { providerId, scopes, purpose, expiresAt } = req.body;
    const patientId = req.user?._id; // Automatically set from auth middleware

    const provider = await Provider.findById(providerId);
    if (!provider || !provider.active) {
      return res.status(400).json({ error: 'Invalid or inactive provider' });
    }

    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ error: 'Patient not found' });

    const consentId = crypto.randomUUID();
    const consentDoc = {
      consentId,
      patientId,
      providerId,
      scopes,
      purpose,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    const receiptHash = hashConsent(consentDoc);

    // anchor hash on Solana (memo-like approach)
    const memoData = `BRIDGEHEALTH_CONSENT:${consentId}:${receiptHash}`;
    const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payer.publicKey,
        lamports: 0
      })
    );
    tx.add({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData),
    });

    const signature = await connection.sendTransaction(tx, [payer]);

    const consent = await Consent.create({
      ...consentDoc,
      solanaTx: signature,
      receiptHash,
    });

    res.json({ success: true, consent });
  } catch (err) {
    console.error('Error creating consent:', err);
    res.status(500).json({ error: 'Failed to create consent' });
  }
};

exports.revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.body;
    const consent = await Consent.findOne({ consentId });
    if (!consent) return res.status(404).json({ error: 'Consent not found' });
    consent.revokedAt = new Date();
    await consent.save();
    res.json({ success: true, message: 'Consent revoked successfully' });
  } catch (err) {
    console.error('Error revoking consent:', err);
    res.status(500).json({ error: 'Failed to revoke consent' });
  }
};

exports.listConsents = async (req, res) => {
  try {
    const patientId = req.user?._id || req.body.patientId;
    if (!patientId) return res.status(400).json({ error: 'Missing patient ID' });

    const consents = await Consent.find({ patientId });
    res.json({ consents });
  } catch (err) {
    console.error('Error listing consents:', err);
    res.status(500).json({ error: 'Failed to list consents' });
  }
};
