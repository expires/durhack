export default async (URI, bearer) => {
  let headers = new Headers();
  headers.append("Authorization", "Bearer " + bearer);

  let options = {
    method: "GET",
    headers: headers,
  };

  const response = await fetch(URI + "auth", options);
  return await response.json();
};
