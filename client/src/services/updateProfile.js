export default async (URI, bearer, data) => {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + bearer);

    const response = await fetch(`${URI}users/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    return { error: "Failed to update profile." };
  }
};
