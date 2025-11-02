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

export async function getHospitals(API_URI, bearer) {
  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + bearer);

    const response = await fetch(`${API_URI}hospitals`, {
      method: "GET",
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("❌ List Hospitals Error:", error);
    return { error: "Failed to fetch hospitals" };
  }
}
