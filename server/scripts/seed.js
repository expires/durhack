import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Record from "../models/record.js";
import Consent from "../models/consent.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB for seeding...");

// Clear existing data (optional for dev)
await User.deleteMany({});
await Record.deleteMany({});
await Consent.deleteMany({});

// --- Create Hospitals / Providers ---
const hospitals = [];
for (let i = 0; i < 3; i++) {
  const hospital = new User({
    name: `${faker.company.name()} Hospital`,
    email: faker.internet.email().toLowerCase(),
    password: await bcrypt.hash("password123", 10),
    role: "hospital",
  });
  await hospital.save();
  hospitals.push(hospital);
}
console.log(`🏥 Created ${hospitals.length} hospitals`);

// --- Create Patients ---
const patients = [];
for (let i = 0; i < 10; i++) {
  const patient = new User({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: await bcrypt.hash("password123", 10),
    role: "patient",
  });
  await patient.save();
  patients.push(patient);
}
console.log(`👤 Created ${patients.length} patients`);

// --- Create Records ---
const records = [];
for (let i = 0; i < 20; i++) {
  const patient = faker.helpers.arrayElement(patients);
  const record = new Record({
    userId: patient._id,
    fileName: faker.system.commonFileName("pdf"),
    recordType: faker.helpers.arrayElement(["Lab Report", "Scan Result", "Prescription"]),
    solanaTx: faker.string.alphanumeric(64),
    verified: true,
    uploadedAt: faker.date.recent(),
    downloadUrl: "https://storage.googleapis.com/dummy-file.pdf",
  });
  await record.save();
  records.push(record);
}
console.log(`📄 Created ${records.length} records`);

// --- Create Consents ---
for (const patient of patients) {
  const hospital = faker.helpers.arrayElement(hospitals);
  const consent = new Consent({
    patientId: patient._id,
    providerId: hospital._id,
    scopes: ["records.read"],
    purpose: faker.helpers.arrayElement(["care", "research", "audit"]),
    expiresAt: faker.date.soon({ days: 60 }),
    solanaTx: faker.string.alphanumeric(64),
  });
  await consent.save();
}
console.log("✅ Created consents between patients and hospitals.");

await mongoose.disconnect();
console.log("🌱 Seeding complete!");
process.exit();