export default async (URI, body) => {
  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  let options = {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(body),
  };

  const response = await fetch(URI + "reset", options);
  return await response.json();
};
