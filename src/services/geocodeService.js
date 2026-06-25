import { withTimeout } from "./weatherService";

/**
 * Normalizes coordinate to fixed precision.
 */
export function normalizeCoordinate(value, precision = 4) {
  const num = Number(value);
  if (isNaN(num)) {
    return "0.0000";
  }
  return num.toFixed(precision);
}

/**
 * Standardized geocache key.
 */
export function buildGeoCacheKey(lat, lng) {
  return `${normalizeCoordinate(lat)}_${normalizeCoordinate(lng)}`;
}

/**
 * Hardcoded fallback routing table for Indian cities based on bounding boxes.
 */
export function getFallbackCityFromCoordinates(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { city: "Unknown", state: "Unknown", source: "fallback-routing" };
  }

  // Pune approx area
  if (latitude >= 18.4 && latitude <= 18.7 && longitude >= 73.7 && longitude <= 74.0) {
    return { city: "Pune", state: "Maharashtra", source: "fallback-routing" };
  }
  // Mumbai approx area
  if (latitude >= 18.8 && latitude <= 19.4 && longitude >= 72.7 && longitude <= 73.1) {
    return { city: "Mumbai", state: "Maharashtra", source: "fallback-routing" };
  }
  // Nagpur approx area
  if (latitude >= 21.0 && latitude <= 21.3 && longitude >= 78.9 && longitude <= 79.3) {
    return { city: "Nagpur", state: "Maharashtra", source: "fallback-routing" };
  }
  // Delhi/NCR approx area
  if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.4) {
    return { city: "New Delhi", state: "Delhi", source: "fallback-routing" };
  }
  // Bangalore approx area
  if (latitude >= 12.8 && latitude <= 13.1 && longitude >= 77.4 && longitude <= 77.8) {
    return { city: "Bengaluru", state: "Karnataka", source: "fallback-routing" };
  }

  return { city: "Unknown", state: "Unknown", source: "fallback-routing" };
}

/**
 * Constructs a safe fallback geocode object.
 */
export function getSafeGeocodeFallback({ lat, lng }) {
  const fallback = getFallbackCityFromCoordinates(lat, lng);
  return {
    source: "fallback",
    display_name: "",
    address: "",
    city: fallback.city,
    state: fallback.state,
    country: "India",
    lat: Number(lat) || 0,
    lng: Number(lng) || 0,
    cacheKey: buildGeoCacheKey(lat, lng),
  };
}

/**
 * Reverse geocodes coordinates to address details using Nominatim API.
 */
export async function reverseGeocodeWithNominatim({ lat, lng }) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return getSafeGeocodeFallback({ lat, lng });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

  try {
    const fetchPromise = fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "NagarNiti/1.0",
      },
    });

    const response = await withTimeout(fetchPromise, 7000);
    if (!response.ok) {
      return getSafeGeocodeFallback({ lat, lng });
    }

    const data = await response.json();
    if (!data) {
      return getSafeGeocodeFallback({ lat, lng });
    }

    const addressData = data.address || {};
    const fallback = getFallbackCityFromCoordinates(latitude, longitude);

    const city = addressData.city || addressData.town || addressData.village || fallback.city;
    const state = addressData.state || fallback.state;
    const country = addressData.country || "India";

    const road = addressData.road || "";
    const suburb = addressData.suburb || "";
    let addressStr = "";
    if (road || suburb) {
      addressStr = [road, suburb].filter(Boolean).join(", ");
    } else {
      addressStr = data.display_name || "";
    }

    return {
      source: "nominatim",
      display_name: data.display_name || "",
      address: addressStr,
      city,
      state,
      country,
      lat: latitude,
      lng: longitude,
      cacheKey: buildGeoCacheKey(latitude, longitude),
    };
  } catch (error) {
    return getSafeGeocodeFallback({ lat, lng });
  }
}

/**
 * Geocodes an address or query string to coordinates using Nominatim search API.
 */
export async function geocodeAddressWithNominatim(query) {
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    return null;
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodedQuery}&limit=1&addressdetails=1`;

  try {
    const fetchPromise = fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "NagarNiti/1.0",
      },
    });

    const response = await withTimeout(fetchPromise, 7000);
    if (!response.ok) {
      return null;
    }

    const results = await response.json();
    if (!results || results.length === 0) {
      return null;
    }

    const firstResult = results[0];
    const derivedLat = Number(firstResult.lat);
    const derivedLng = Number(firstResult.lon || firstResult.lng);

    const addressData = firstResult.address || {};
    const fallback = getFallbackCityFromCoordinates(derivedLat, derivedLng);

    const city = addressData.city || addressData.town || addressData.village || fallback.city;
    const state = addressData.state || fallback.state;
    const country = addressData.country || "India";

    const road = addressData.road || "";
    const suburb = addressData.suburb || "";
    let addressStr = "";
    if (road || suburb) {
      addressStr = [road, suburb].filter(Boolean).join(", ");
    } else {
      addressStr = firstResult.display_name || "";
    }

    return {
      source: "nominatim-search",
      display_name: firstResult.display_name || "",
      address: addressStr,
      city,
      state,
      country,
      lat: derivedLat,
      lng: derivedLng,
      cacheKey: buildGeoCacheKey(derivedLat, derivedLng),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Orchestrates location resolution, checking Firestore cache before calling external APIs.
 */
export async function resolveLocationContext({
  lat,
  lng,
  address,
  city,
  getCachedLocation,
  saveCachedLocation,
}) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const hasValidCoords = typeof lat === "number" && typeof lng === "number" && !isNaN(parsedLat) && !isNaN(parsedLng);

  if (hasValidCoords) {
    const key = buildGeoCacheKey(parsedLat, parsedLng);
    
    // Attempt cache check
    if (typeof getCachedLocation === "function") {
      try {
        const cached = await getCachedLocation(key);
        if (cached) {
          return {
            ...cached,
            source: "geocache",
          };
        }
      } catch (cacheError) {
        // Silently default on cache read errors
      }
    }

    // Cache miss or cache check bypassed: call Nominatim
    const resolved = await reverseGeocodeWithNominatim({ lat: parsedLat, lng: parsedLng });

    // Save back to cache if resolved successfully
    if (resolved && resolved.source === "nominatim" && typeof saveCachedLocation === "function") {
      try {
        await saveCachedLocation(key, resolved);
      } catch (cacheSaveError) {
        // Silently default on cache write errors
      }
    }

    return resolved;
  }

  // Coords missing, try parsing address / city query
  const queryParts = [];
  if (address) queryParts.push(address);
  if (city) queryParts.push(city);

  if (queryParts.length > 0) {
    const queryStr = queryParts.join(", ");
    const searchResolved = await geocodeAddressWithNominatim(queryStr);
    if (searchResolved) {
      return searchResolved;
    }
  }

  // Complete fallback
  return getSafeGeocodeFallback({ lat: 0, lng: 0 });
}
