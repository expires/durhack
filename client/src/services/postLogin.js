export default async (URI, body) => {
  let headers = new Headers();
  headers.append("Content-Type", "application/json");

  let options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  };

  const response = await fetch(URI + "login", options);
  const result = await response.json();
  return result;
};
