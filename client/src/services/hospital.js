export async function getHospitalPatients(API_URI, bearer) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);

    const response = await fetch(`${API_URI}hospital/patients`, {
      method: "GET",
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("❌ Hospital Patients Error:", error);
    return { error: "Failed to fetch patients" };
  }
}

export async function getProviders(API_URI, bearer) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);

    const response = await fetch(`${API_URI}providers`, {
      method: "GET",
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("❌ List Providers Error:", error);
    return { error: "Failed to fetch providers" };
  }
}
