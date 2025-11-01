import { Storage } from "@google-cloud/storage";
import { Connection, Keypair, Transaction, PublicKey } from "@solana/web3.js";
import multer from "multer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Record from "../../models/record.js";
import User from "../../models/user.js";

dotenv.config();

// ---------- GOOGLE CLOUD ----------
const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

// ---------- SOLANA ----------
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const secret = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(Uint8Array.from(secret));
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// ---------- MULTER ----------
const upload = multer({ storage: multer.memoryStorage() });

// ---------- CONTROLLER ----------
export const uploadFile = async (req, res) => {
    upload.single("file")(req, res, async (err) => {
        try {
            if (err) return res.status(400).json({ error: "File upload failed" });

            const { recordType, timestamp } = req.body;
            const file = req.file;
            if (!file) return res.status(400).json({ error: "No file uploaded" });

            // 🔐 Verify user via JWT
            const authHeader = req.headers["authorization"];
            if (!authHeader)
                return res.status(401).json({ error: "Missing authorization header" });

            const token = authHeader.split(" ")[1];
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.TOKEN);
            } catch {
                return res.status(401).json({ error: "Invalid or expired token" });
            }

            const userId = decoded.user_id;
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            console.log(`📄 Uploading file for user: ${user.username}`);

            // 1️⃣ Hash file
            const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
            console.log("🔐 File hash:", hash);

            // 2️⃣ Upload to Google Cloud
            const gcsFileName = `${Date.now()}_${file.originalname}`;
            const blob = bucket.file(gcsFileName);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: file.mimetype,
                metadata: { metadata: { hash, recordType, timestamp } },
            });

            blobStream.on("error", (err) => {
                console.error("❌ GCS Upload Error:", err);
                return res.status(500).json({ error: "Upload to Google Cloud failed" });
            });

            blobStream.on("finish", async () => {
                console.log("✅ Uploaded to Google Cloud:", gcsFileName);

                // 3️⃣ Store metadata on Solana
                const memoData = `BRIDGEHEALTH:${JSON.stringify({
                    file: file.originalname,
                    hash,
                    recordType,
                    timestamp,
                })}`;

                const tx = new Transaction().add({
                    keys: [],
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(memoData, "utf8"),
                });

                const signature = await connection.sendTransaction(tx, [payer]);
                console.log("✅ Solana TX:", signature);

                // 4️⃣ Save record to MongoDB
                const newRecord = new Record({
                    userId,
                    fileName: file.originalname,
                    recordType,
                    hash,
                    solanaTx: signature,
                    gcsFileUrl: `gs://${process.env.GOOGLE_BUCKET_NAME}/${gcsFileName}`,
                    timestamp,
                });

                await newRecord.save();
                console.log("💾 Record saved to MongoDB:", newRecord._id);

                // 5️⃣ Respond to client
                res.json({
                    message: "File uploaded & verified successfully",
                    record: {
                        id: newRecord._id,
                        fileName: newRecord.fileName,
                        recordType: newRecord.recordType,
                        solanaTx: newRecord.solanaTx,
                        gcsFileUrl: newRecord.gcsFileUrl,
                        timestamp: newRecord.timestamp,
                    },
                    user: user.username,
                });
            });

            blobStream.end(file.buffer);
        } catch (error) {
            console.error("❌ Upload Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};
