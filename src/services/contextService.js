import { fetchWeatherContext, getSafeWeatherFallback } from "./weatherService";
import { resolveLocationContext, getSafeGeocodeFallback } from "./geocodeService";
import { getCachedLocation, saveCachedLocation } from "./firestoreService";

/**
 * Builds the complete atmospheric and geographical context for a report.
 * Resolves weather and location in parallel when coordinates are available.
 */
export async function buildReportContext(input = {}) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  const hasValidCoords = typeof input.lat === "number" && typeof input.lng === "number" && !isNaN(lat) && !isNaN(lng);

  try {
    if (hasValidCoords) {
      const [weather, location] = await Promise.all([
        fetchWeatherContext({ lat, lng }),
        resolveLocationContext({
          lat,
          lng,
          address: input.address,
          city: input.city,
          getCachedLocation,
          saveCachedLocation,
        }),
      ]);

      return {
        weather,
        location,
      };
    } else {
      // No coordinates, only resolve location based on address/city lines, and return fallback weather
      const location = await resolveLocationContext({
        address: input.address,
        city: input.city,
        getCachedLocation,
        saveCachedLocation,
      });

      return {
        weather: getSafeWeatherFallback(),
        location,
      };
    }
  } catch (error) {
    console.error("[contextService] Error building report context:", error);
    return {
      weather: getSafeWeatherFallback(),
      location: getSafeGeocodeFallback({ lat: input.lat || 0, lng: input.lng || 0 }),
    };
  }
}
