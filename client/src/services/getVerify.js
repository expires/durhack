export default async (URI, bearer, recordId) => {
    try {
        const headers = new Headers();
        headers.append("Authorization", "Bearer " + bearer);

        const response = await fetch(`${URI}verify/${recordId}`, {
            method: "GET",
            headers,
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Verification Error:", error);
        return { error: "Failed to verify record" };
    }
};
