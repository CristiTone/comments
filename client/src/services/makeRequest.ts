const BASE_URL = import.meta.env.VITE_SERVER_URL;
export async function makeRequest(
  url: string,
  options?: RequestInit | undefined,
) {
  try {
    const res = await fetch(BASE_URL + url, {
      ...options,
      credentials: 'include',
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}
