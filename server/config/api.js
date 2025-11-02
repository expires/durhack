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
const hospitalDashboard = require("../controllers/hospitals/dashboard");
const getConsentTimeline = require("../controllers/consents/timeline");
const updateProfile = require("../controllers/users/updateProfile");
const { createProviderHandler } = require("../controllers/admin/addProvider");
const addHospital = createProviderHandler("hospital");
const addDoctor = createProviderHandler("doctor");
const addResearcher = createProviderHandler("researcher");
const addAuditor = createProviderHandler("auditor");
const addInsurance = createProviderHandler("insurance");
const addEmergency = createProviderHandler("emergency");

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
router.get("/consents/timeline", auth, getConsentTimeline);

router.get("/hospital/patients", auth, listHospitalConsents);
router.get("/providers", auth, listProviders);
router.get("/hospitals/dashboard", auth, hospitalDashboard);

router.put("/users/profile", auth, updateProfile);
router.post("/add-hospital", addHospital);
router.post("/add-doctor", addDoctor);
router.post("/add-researcher", addResearcher);
router.post("/add-auditor", addAuditor);
router.post("/add-insurance", addInsurance);
router.post("/add-emergency", addEmergency);

module.exports = router;
