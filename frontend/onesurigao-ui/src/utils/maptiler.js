const MAPTILER_API_KEY = process.env.REACT_APP_MAPTILER_API_KEY || "";
const MAPTILER_STYLE_ID = process.env.REACT_APP_MAPTILER_STYLE_ID || "streets-v2";

export const hasMapTilerKey = Boolean(MAPTILER_API_KEY);

export const MAPTILER_TILE_URL = hasMapTilerKey
  ? `https://api.maptiler.com/maps/${MAPTILER_STYLE_ID}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`
  : "";

export const MAPTILER_TILE_LAYER_OPTIONS = {
  tileSize: 512,
  zoomOffset: -1,
  minZoom: 1,
  crossOrigin: true,
};

export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>';

export const buildMapTilerReverseGeocodeUrl = (latitude, longitude) =>
  `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?limit=1&language=en&key=${MAPTILER_API_KEY}`;

export const buildMapTilerForwardGeocodeUrl = query =>
  `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?limit=1&language=en&country=ph&key=${MAPTILER_API_KEY}`;
