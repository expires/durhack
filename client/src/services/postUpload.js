export default async (URI, bearer, file, recordType, timestamp) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("recordType", recordType);
        formData.append("timestamp", timestamp);

        const headers = new Headers();
        headers.append("Authorization", "Bearer " + bearer);

        const options = {
            method: "POST",
            headers, // no "Content-Type" → browser sets multipart automatically
            body: formData,
        };

        const response = await fetch(URI + "files/upload", options);
        return await response.json();
    } catch (error) {
        console.error("❌ Upload Service Error:", error);
        return { error: "Failed to upload file." };
    }
};
