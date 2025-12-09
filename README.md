# TONe demo project

Demo project for [Norsk Polarinstitutt](https://npolar.no/), showcasing weather data 
from [Troll Research station](https://docs.data.npolar.no/api/#/record/get_dataset__datasetID__record_)


<img width="728" height="408" alt="Screenshot 2025-12-09 at 12 11 37" src="https://github.com/user-attachments/assets/1524afac-6a0c-4880-86a7-8b7a61b5f3a5" />

Technologies used

* [Astro](https://astro.build/) web framework
* [D3js](https://d3js.org/) for graphs
* [Tailwind](https://tailwindcss.com/) for styling
* [Maplibre](https://maplibre.org/maplibre-gl-js/docs/) for maps

## 🧞 Commands

The project was created using bun but supports npm as well:

```
# NPM
npm install && npm run dev

# Bun
bun install && bun dev
```

## Limitations

* Fetches weather data from hard coded dates
* Client-side cache only (ie. slow first request)
* Showing only plot/graph view (no table view)
* Happy-path programming (not much error handling)

## TODO

* It would be nice to have a calendar picker to view historic data and not just last 3 days
* NPolar data includes station data (ventilation status, battery voltage) that could be used (currently only showing placeholder icons.
* Auto-update current conditions every minute
* Graph features
  - Zooming specific areas
  - Picking which values to display (not just temp./humidity) 
