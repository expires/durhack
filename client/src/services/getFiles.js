export default async (URI, bearer) => {
    try {
        const headers = new Headers();
        headers.append("Authorization", "Bearer " + bearer);

        const response = await fetch(URI + "files/get", {
            method: "GET",
            headers,
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Fetch Records Error:", error);
        return { error: "Failed to retrieve records" };
    }
};
