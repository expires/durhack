import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import Record from "../../models/record.js";

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

export const getFiles = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not Authenticated." });
    }

    const records = await Record.find({ userId: req.user._id }).sort({
      uploadedAt: -1,
    });

    const recordsWithVerification = await Promise.all(
      records.map(async (r) => {
        const fileName = r.gcsFileUrl.split("/").pop();
        const file = bucket.file(fileName);

        const [url] = await file.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 60 * 60 * 1000,
        });

        let verified = false;
        try {
          const [fileBuffer] = await file.download();
          const newHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");
          verified = newHash === r.hash;
        } catch (err) {
          console.warn(
            `⚠️ Verification failed for ${r.fileName}:`,
            err.message
          );
        }

        return {
          _id: r._id,
          fileName: r.fileName,
          recordType: r.recordType,
          hash: r.hash,
          solanaTx: r.solanaTx,
          uploadedAt: r.uploadedAt || r.timestamp,
          verified,
          downloadUrl: url,
          previewUrl: url,
        };
      })
    );

    res.status(200).json({
      message: "Records retrieved successfully",
      user: req.user.username,
      records: recordsWithVerification,
    });
  } catch (error) {
    console.error("❌ Get User Records Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
