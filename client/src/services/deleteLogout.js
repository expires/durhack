export default async (URI, bearer) => {
  let headers = new Headers();
  headers.append("Authorization", "Bearer " + bearer);

  let options = {
    method: "DELETE",
    headers: headers,
  };

  const response = await fetch(URI + "logout", options);
  return await response.json();
};
