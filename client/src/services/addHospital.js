const endpointMap = {
  hospital: "add-hospital",
  doctor: "add-doctor",
  researcher: "add-researcher",
  auditor: "add-auditor",
  insurance: "add-insurance",
  emergency: "add-emergency",
};

export default async (API_URI, payload) => {
  try {
    const role = (payload.role || "hospital").toLowerCase();
    const endpoint = endpointMap[role] || endpointMap.hospital;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const response = await fetch(`${API_URI}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Add Hospital Error:", error);
    return { error: "Failed to create hospital." };
  }
};
