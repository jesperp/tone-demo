import { Map, Marker } from "maplibre-gl"
import type { LngLatLike } from "maplibre-gl"

const home: LngLatLike = [2.536167, -72.013561]
const map = new Map({
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: home,
  zoom: 13.5,
  container: "map",
  attributionControl: false,
})
type G = GeoJSON.GeoJSON<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>

// NOTE Copy-pasted from troll API
const trollData: G = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [2.541167, -72.011861],
      },
      properties: {},
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [2.46662, -71.95685],
      },
      properties: {},
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [2.5337, -72.0115],
      },
      properties: {},
    },
  ],
}

map.on("load", function () {
  map.setProjection({
    type: "globe", // Set projection to globe
  })
  map.addSource("troll-data", {
    type: "geojson",
    data: trollData,
  })
  map.addLayer({
    id: "troll",
    source: "troll-data",
    type: "circle",
    //minzoom: 15,
    paint: {
      "circle-color": "#cc8888",
    },
    filter: ["==", "$type", "Point"],
  })
  function setPointerCursor(this: Map) {
    this.getCanvas().style.cursor = "pointer"
  }
  function unsetPointerCursor(this: Map) {
    this.getCanvas().style.cursor = ""
  }
  map.on("mouseenter", "troll", setPointerCursor)
  map.on("mouseleave", "troll", unsetPointerCursor)

  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point)
    console.log("[app.ts] features:", features)
  })
})
