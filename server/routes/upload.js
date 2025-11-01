import express from "express";
import { uploadRecord} from "../controllers/records/upload.js";

// Create a router
const router = express.Router();

// Route: POST /api/records/upload
router.post("/upload", uploadRecord);

// Export the router
export default router;