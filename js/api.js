const API_KEY = "32a94097e144fbded05a2537984eb315";
const BASE_URL = "https://v3.football.api-sports.io/";

const headers = { "x-apisports-key": API_KEY };

export async function apiFetch(endpoint) {
  try {
    const res = await fetch(BASE_URL + endpoint, { headers });
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.response;
  } catch (err) {
    throw err;
  }
}

export function getDateRange(days = 7) {
  const from = new Date();
  const to = new Date();
  to.setDate(from.getDate() + days);
  return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0] };
}
