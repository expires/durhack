export default async (URI, body) => {
  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  let options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  };

  const response = await fetch(URI + "signup", options);
  return await response.json();
};
