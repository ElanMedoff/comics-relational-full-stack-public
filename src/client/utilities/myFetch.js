export default function myFetch(method, url, data) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const options = {
    method,
    headers: myHeaders,
    mode: "same-origin",
    cache: "default",
    body: data ? JSON.stringify(data) : undefined,
  };

  return fetch(url, options);
}
