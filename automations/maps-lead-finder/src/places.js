// Google Places API (New) — Text Search client.
//
// One request returns up to 20 places; Google allows up to 3 pages (60
// places) per query. Every request counts against a budget so a run can never
// burn through more than MAX_REQUESTS calls (protects the free allowance).
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const MAX_PAGES_PER_QUERY = 3;
const REQUEST_TIMEOUT_MS = 15000;

// Only the fields we use. The field mask decides what Google bills for.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "nextPageToken",
].join(",");

export class BudgetExhaustedError extends Error {}

export function createBudget(maxRequests) {
  let used = 0;
  return {
    take() {
      if (used >= maxRequests) throw new BudgetExhaustedError(`Request cap reached (${maxRequests}).`);
      used += 1;
    },
    get used() {
      return used;
    },
    get max() {
      return maxRequests;
    },
  };
}

async function fetchPage({ apiKey, textQuery, pageToken }) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery, pageSize: 20, languageCode: "en", regionCode: "IN", ...(pageToken ? { pageToken } : {}) }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Google's error body explains billing/key problems; it never contains the key.
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Places API ${response.status} for "${textQuery}": ${detail}`);
  }
  return response.json();
}

// Returns every place Google gives for one query (up to 60), respecting the budget.
export async function searchPlaces({ apiKey, textQuery, budget }) {
  const places = [];
  let pageToken;

  for (let page = 0; page < MAX_PAGES_PER_QUERY; page++) {
    budget.take();
    const data = await fetchPage({ apiKey, textQuery, pageToken });
    places.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return places;
}
