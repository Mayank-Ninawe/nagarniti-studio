/**
 * Manual development helpers for weather/geocode/context services. Do not import into production UI.
 */

import { fetchWeatherContext } from "./weatherService";
import { resolveLocationContext, geocodeAddressWithNominatim } from "./geocodeService";
import { getCachedLocation, saveCachedLocation } from "./firestoreService";
import { buildReportContext } from "./contextService";

export async function testWeatherPune() {
  console.log("Starting testWeatherPune...");
  const result = await fetchWeatherContext({ lat: 18.5204, lng: 73.8567 });
  console.log("testWeatherPune result:", result);
  return result;
}

export async function testReverseGeocodePune() {
  console.log("Starting testReverseGeocodePune...");
  const result = await resolveLocationContext({
    lat: 18.5204,
    lng: 73.8567,
    getCachedLocation,
    saveCachedLocation,
  });
  console.log("testReverseGeocodePune result:", result);
  return result;
}

export async function testGeocodeQuery() {
  console.log("Starting testGeocodeQuery...");
  const result = await geocodeAddressWithNominatim("FC Road Pune");
  console.log("testGeocodeQuery result:", result);
  return result;
}

export async function testBuildReportContext() {
  console.log("Starting testBuildReportContext...");
  const result = await buildReportContext({
    lat: 18.5204,
    lng: 73.8567,
    address: "FC Road",
    city: "Pune",
  });
  console.log("testBuildReportContext result:", result);
  return result;
}
