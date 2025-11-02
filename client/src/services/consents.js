export async function createConsent(API_URI, bearer, data) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);
    headers.append("Content-Type", "application/json");

    const response = await fetch(`${API_URI}consents/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Create Consent Error:", error);
    return { error: "Failed to create consent" };
  }
}

export async function getConsents(API_URI, bearer) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);

    const response = await fetch(`${API_URI}consents/list`, {
      method: "GET",
      headers,
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Get Consents Error:", error);
    return { error: "Failed to fetch consents" };
  }
}

export async function revokeConsent(API_URI, bearer, consentId) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);
    headers.append("Content-Type", "application/json");

    const response = await fetch(`${API_URI}consents/revoke`, {
      method: "POST",
      headers,
      body: JSON.stringify({ consentId }),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Revoke Consent Error:", error);
    return { error: "Failed to revoke consent" };
  }
}
