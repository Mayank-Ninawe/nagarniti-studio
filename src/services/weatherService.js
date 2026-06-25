/**
 * Timeout wrapper using Promise.race.
 */
export function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

/**
 * Maps Open-Meteo weather codes to simple labels.
 */
export function mapWeatherCodeToCondition(code) {
  switch (code) {
    case 0:
      return "clear";
    case 1:
    case 2:
    case 3:
      return "cloudy";
    case 45:
    case 48:
      return "fog";
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "drizzle";
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "rain";
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "snow";
    case 95:
    case 96:
    case 99:
      return "storm";
    default:
      return "unknown";
  }
}

/**
 * Returns the exact fallback weather context object.
 */
export function getSafeWeatherFallback() {
  return {
    source: "fallback",
    condition: "unknown",
    rainfall_mm: 0,
    alert: "none",
    temperature_c: 0,
    weather_code: -1,
  };
}

/**
 * Fetches the current weather from Open-Meteo with safety guards and alerts.
 */
export async function fetchWeatherContext({ lat, lng }) {
  if (typeof lat !== "number" || typeof lng !== "number" || !isFinite(lat) || !isFinite(lng)) {
    return getSafeWeatherFallback();
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`;

  try {
    const fetchPromise = fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    const response = await withTimeout(fetchPromise, 7000);
    if (!response.ok) {
      return getSafeWeatherFallback();
    }

    const data = await response.json();
    if (!data || !data.current) {
      return getSafeWeatherFallback();
    }

    const temperature_c = Number(data.current.temperature_2m) || 0;
    const rainfall_mm = Number(data.current.precipitation) || 0;
    const weather_code = typeof data.current.weather_code === "number" ? data.current.weather_code : -1;
    const condition = mapWeatherCodeToCondition(weather_code);

    let alert = "none";
    if (rainfall_mm >= 50) {
      alert = "red";
    } else if (rainfall_mm >= 20) {
      alert = "orange";
    } else if (rainfall_mm > 0) {
      alert = "yellow";
    }

    return {
      source: "open-meteo",
      condition,
      rainfall_mm,
      alert,
      temperature_c,
      weather_code,
    };
  } catch (error) {
    // Graceful fallback on error, do not throw.
    return getSafeWeatherFallback();
  }
}
