const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";
const MAPBOX_STYLE_OWNER = process.env.REACT_APP_MAPBOX_STYLE_OWNER || "mapbox";
const MAPBOX_STYLE_ID = process.env.REACT_APP_MAPBOX_STYLE_ID || "streets-v12";

export const hasMapboxToken = Boolean(MAPBOX_ACCESS_TOKEN);

export const MAPBOX_TILE_URL = hasMapboxToken
  ? `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_OWNER}/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`
  : "";

export const MAPBOX_ATTRIBUTION =
  '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

export const buildMapboxReverseGeocodeUrl = (latitude, longitude) =>
  `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&limit=1&access_token=${MAPBOX_ACCESS_TOKEN}`;

export const buildMapboxForwardGeocodeUrl = query =>
  `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&limit=1&country=PH&access_token=${MAPBOX_ACCESS_TOKEN}`;
