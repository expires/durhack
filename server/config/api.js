const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { uploadFile } = require("../controllers/records/uploadFile.js");
const { getFiles } = require("../controllers/records/getFiles.js");
const requireProviderToken = require("../middleware/providerAuth");
const { listRecords, downloadRecord } = require("../controllers/providers/providerRecords.js");
const { createConsent, revokeConsent, listConsents } = require("../controllers/consents/consents.js");


router.post("/signup", require("../controllers/auth/signup"));
router.post("/login", require("../controllers/auth/login"));
router.post("/code", require("../controllers/auth/sendCode"));
router.put("/reset", require("../controllers/auth/resetPassword"));
router.delete("/logout", auth, require("../controllers/auth/logout"));
router.get("/auth", auth, require("../controllers/auth/authToken"));
router.post("/files/upload", auth, uploadFile);
router.get("/files/get", auth, getFiles);
router.get("/provider/patients/:patientId/records", requireProviderToken, listRecords);
router.get("/provider/patients/:patientId/records/:recordId/download", requireProviderToken, downloadRecord);

// Consent management routes
router.post("/consents/create", auth, createConsent);
router.post("/consents/revoke", auth, revokeConsent);
router.get("/consents/list", auth, listConsents);

module.exports = router;
