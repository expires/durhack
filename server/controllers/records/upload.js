// crypto is a built-in Node.js module for cryptographic operations
import crypto from "crypto";

// Import necessary functions from googleService and solanaService
import { uploadFileToDrive } from "../../services/googleService.js";
import { storeHash } from "../../services/solanaService.js";

export const uploadRecord = async (req, res) => {
    try{
        // Extract ciphertext and fileName from the request body
        const { ciphertext, fileName } = req.body;

        // Hash the ciphertext using SHA-256
        const hash = crypto.createHash("sha256").update(ciphertext).digest("hex");

        // Upload the file to Google Drive
        const fileUrl = await uploadFileToDrive(fileName, ciphertext);
        
        // Store the hash on the Solana blockchain
        const tx = await storeHash(hash);

        res.json({
            message: "File uploaded and hash stored successfully",
            driveFileId: driveFile.id,
            solanaTx:
        })
    }