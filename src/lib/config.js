const config = {
  locateTimeout: 60 * 60 * 1000,
  defaultStartCenter: [51.505, -0.09],
  maxZoom: 19,
  minZoomWithSetCategory: 13,
  minZoomWithoutSetCategory: 16,
  mapboxTileUrl: `https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
  wheelmapApiKey: process.env.REACT_APP_WHEELMAP_API_KEY,
  accessibilityCloudAppToken: process.env.REACT_APP_ACCESSIBILITY_CLOUD_APP_TOKEN,
  accessibilityCloudTileUrl: `https://www.accessibility.cloud/place-infos?excludeSourceIds=LiBTS67TjmBcXdEmX&x={x}&y={y}&z={z}&appToken=${process.env.REACT_APP_ACCESSIBILITY_CLOUD_APP_TOKEN}`,
  wheelmapApiBaseUrl: '',  // don't prefix anything - use relative urls, make request to server that hosts the page
};

export default config;
