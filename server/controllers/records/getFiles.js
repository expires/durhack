import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Record from "../../models/record.js";
import User from "../../models/user.js";
import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

dotenv.config();

// Google Cloud Storage setup
const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

export const getFiles = async (req, res) => {
    try {
        // 🔐 Verify auth token
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

        // 🧾 Fetch user's records
        const records = await Record.find({ userId }).sort({ createdAt: -1 });

        // 🔍 Generate signed download URLs + verify integrity
        const recordsWithVerification = await Promise.all(
            records.map(async (r) => {
                const fileName = r.gcsFileUrl.split("/").pop();
                const file = bucket.file(fileName);

                // Create signed URL (valid for 1 hour)
                const [url] = await file.getSignedUrl({
                    version: "v4",
                    action: "read",
                    expires: Date.now() + 60 * 60 * 1000,
                });

                let verified = false;
                try {
                    // Download the file from GCS
                    const [fileBuffer] = await file.download();

                    // Recalculate hash
                    const newHash = crypto
                        .createHash("sha256")
                        .update(fileBuffer)
                        .digest("hex");

                    // Compare with stored hash
                    verified = newHash === r.hash;
                } catch (err) {
                    console.warn(`⚠️ Verification failed for ${r.fileName}:`, err.message);
                }

                return {
                    _id: r._id,
                    fileName: r.fileName,
                    recordType: r.recordType,
                    hash: r.hash,
                    solanaTx: r.solanaTx,
                    uploadedAt: r.timestamp,
                    verified,
                    downloadUrl: url,
                };
            })
        );

        res.status(200).json({
            message: "Records retrieved successfully",
            user: user.username,
            records: recordsWithVerification,
        });
    } catch (error) {
        console.error("❌ Get User Records Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
