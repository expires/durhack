import { Connection } from "@solana/web3.js";
import crypto from "crypto";
import fetch from "node-fetch";
import Record from "../../models/record.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export const verifyRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ error: "Not found" });

        // Recompute hash from GCS file
        const publicUrl = record.gcsFileUrl.replace("gs://bridgehealth-records", "https://storage.googleapis.com/bridgehealth-records");
        const fileRes = await fetch(publicUrl);
        const buf = Buffer.from(await fileRes.arrayBuffer());
        const computedHash = crypto.createHash("sha256").update(buf).digest("hex");

        // Fetch on-chain memo
        const tx = await connection.getTransaction(record.solanaTx, { maxSupportedTransactionVersion: 0 });
        const memo = tx.transaction.message.instructions[0].data.toString("utf8");

        const solanaMatch = memo.includes(record.hash);
        const gcsMatch = record.hash === computedHash;

        const verified = solanaMatch && gcsMatch;

        res.json({
            verified,
            details: {
                dbHash: record.hash,
                gcsHash: computedHash,
                solanaMemo: memo,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification failed" });
    }
};
