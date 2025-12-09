import * as d3 from "d3"

import type { WeatherData } from "./pages/api/latest-weather-data.json.ts"

const trolldata = await d3.json<WeatherData[]>("/api/latest-weather-data.json")

if (trolldata) {
  let maxTemp = -Infinity
  let minTemp = Infinity

  trolldata.forEach((data) => {
    if (data.temp_c > maxTemp) {
      maxTemp = data.temp_c
    }

    if (data.temp_c < minTemp) {
      minTemp = data.temp_c
    }
  })

  // Select the SVG container.
  const svg = d3
    .select("svg.plot")
    .on("pointerenter pointermove", moved)
    .on("pointerleave", leftChart)

  // Dimensions set in HTML to prevent layoutshift
  const width = parseInt(svg.attr("width"))
  const height = parseInt(svg.attr("height"))
  const marginTop = 20
  const marginRight = 70
  const marginBottom = 100
  const marginLeft = 60
  //
  // X axis is time-series
  const x = d3.scaleUtc(
    [
      new Date(trolldata[0].date),
      new Date(trolldata[trolldata.length - 1].date),
    ],
    [marginLeft, width - marginRight],
  )

  //
  // Update current conditions with latest data element
  //
  const lastDataElement = trolldata[trolldata.length - 1]
  const currentHumidity = document.getElementById("current-humidity")
  const currentTemp = document.getElementById("current-temperature")
  const currentPressure = document.getElementById("current-pressure")
  const currentWind = document.getElementById("current-wind-speed")
  const currentWindDirection = document.getElementById("current-wind-direction")
  if (currentHumidity) {
    currentHumidity.textContent = lastDataElement.rel_humidity.toString()
  }
  if (currentTemp) {
    currentTemp.textContent = lastDataElement.temp_c.toString()
  }
  if (currentPressure) {
    currentPressure.textContent = lastDataElement.pressure.toString()
  }
  if (currentWind) {
    currentWind.textContent = lastDataElement.wind_speed.toString()
  }
  if (currentWindDirection) {
    currentWindDirection.style.setProperty(
      "rotate",
      `${lastDataElement.wind_direction_deg}deg`,
    )
  }
  currentPressure?.classList.remove("skeleton")
  currentTemp?.classList.remove("skeleton")
  currentHumidity?.classList.remove("skeleton")
  currentWind?.classList.remove("skeleton")

  // Y-axis for temperature
  const yTemp = d3
    .scaleLinear()
    .domain([Math.round(minTemp - 1), Math.round(maxTemp + 1)])
    .range([height - marginBottom, marginTop])

  const yHumidity = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop])

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x))
  svg
    .append("text")
    .attr("class", "text-sm")
    .text("Relative humidity [%]")
    .attr("transform", "rotate(90)")
    .attr("x", height / 6)
    .attr("y", -(width - 30))

  // Add the temperature axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yTemp))

  // Add the humidity axis
  svg
    .append("g")
    .attr("transform", `translate(${width - marginRight},0)`)
    .call(d3.axisRight(yHumidity))
  svg
    .append("text")
    .attr("class", "text-sm")
    .text("Temperature [℃]")
    .attr("transform", "rotate(-90)")
    .attr("x", height / -2)
    .attr("y", marginTop)

  const temperatureData: [number, number][] = trolldata.map((d) => [
    new Date(d.date).valueOf(),
    d.temp_c,
  ])

  const humidityData: [number, number][] = trolldata.map((d) => [
    new Date(d.date).valueOf(),
    d.rel_humidity,
  ])

  //
  // Axis units
  //
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 20)
    .text("X axis title")

  const temperatureLine = d3
    .line()
    .x((d) => {
      return x(d[0])
    })
    .y((d) => yTemp(d[1]))

  const humidityLine = d3
    .line()
    .x((d) => {
      return x(d[0])
    })
    .y((d) => yHumidity(d[1]))

  svg
    .append("path")
    .attr("fill", "none")
    .attr("class", "text-blue-500")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 0.8)
    .attr("d", temperatureLine(temperatureData))

  svg
    .append("path")
    .attr("fill", "none")
    .attr("class", "text-green-700")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 0.8)
    .attr("d", humidityLine(humidityData))

  //
  // Tooltip related
  //
  const tooltipGuide = svg
    .append("line")
    .attr("x1", 0)
    .attr("y1", yHumidity(100))
    .attr("x2", 0)
    .attr("y2", yHumidity(0))
    .attr("class", "text-slate-300")
    .attr("stroke-width", 0.8)
    .attr("stroke", "currentColor")
    .style("display", "none")

  const tooltip = d3.select(".tooltip").style("display", "none").raise()
  const bisect = d3.bisector((d: [number, number]) => d[0]).center

  function leftChart(e: Event) {
    tooltip.style("display", "none")
    tooltipGuide.style("display", "none")
  }

  function moved(e: Event) {
    const pointerX = d3.pointer(e)[0]
    if (pointerX > width - marginRight || pointerX < marginLeft) {
      tooltip.style("display", "none")
      tooltipGuide.style("display", "none")
    } else {
      tooltip.style("display", null)
      tooltipGuide.style("display", null)
    }
    tooltipGuide.attr("x1", pointerX).attr("x2", pointerX)
    tooltip.attr(
      "x",
      pointerX > width / 2
        ? pointerX - parseInt(tooltip.attr("width")) - 10
        : pointerX + 10,
    )
    const date = x.invert(d3.pointer(e)[0])
    const dateIndex = bisect(temperatureData, date)
    const numberFormatter = Intl.NumberFormat(undefined, {
      minimumFractionDigits: 1,
    })
    tooltip
      .select(".temp")
      .text(numberFormatter.format(temperatureData[dateIndex][1]))
    tooltip
      .select(".humid")
      .text(numberFormatter.format(humidityData[dateIndex][1]))
    tooltip.select(".date").text(date.toUTCString())
  }

  //
  // TODO Make a brush area
  //
  //const focusHeight = 100
  //const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  //const brush = d3
  //  .brushX()
  //  .extent([
  //    [margin.left, 0.5],
  //    [width - margin.right, focusHeight - margin.bottom + 0.5],
  //  ])
  //  .on("brush", function () {
  //    console.log("BRUSH")
  //  })
  //  .on("end", function () {
  //    console.log("BRUSH END")
  //  })
  //const defaultSelection = [x(x.domain()[0]), x.range()[1]]
  //const gb = svg.append("g").call(brush)
  //.call(brush.move, defaultSelection)
} else {
  // TODO Error handling
}
