const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { uploadFile } = require("../controllers/records/uploadFile.js");
const { getFiles } = require("../controllers/records/getFiles.js");
const {
  createConsent,
  listPatientConsents,
  revokeConsent,
  listHospitalConsents,
} = require("../controllers/consents");
const listProviders = require("../controllers/hospital/listHospitals");

router.post("/signup", require("../controllers/auth/signup"));
router.post("/login", require("../controllers/auth/login"));
router.post("/code", require("../controllers/auth/sendCode"));
router.put("/reset", require("../controllers/auth/resetPassword"));
router.delete("/logout", auth, require("../controllers/auth/logout"));
router.get("/auth", auth, require("../controllers/auth/authToken"));
router.post("/files/upload", auth, uploadFile);
router.get("/files/get", auth, getFiles);

router.post("/consents/create", auth, createConsent);
router.get("/consents/list", auth, listPatientConsents);
router.post("/consents/revoke", auth, revokeConsent);

router.get("/hospital/patients", auth, listHospitalConsents);
router.get("/providers", auth, listProviders);

module.exports = router;
