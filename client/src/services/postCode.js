export default async (URI, email) => {
  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  let options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ email: email }),
  };

  const response = await fetch(URI + "code", options);
  return await response.json();
};
