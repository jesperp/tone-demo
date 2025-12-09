import type { APIRoute } from "astro"

export interface WeatherData {
  date: Date
  temp_c: number
  rel_humidity: number
  wind_speed: number
  wind_direction_deg: number
  pressure: number
}

export const GET: APIRoute = async () => {
  let result: WeatherData[] = []

  const baseURL = `https://next.api.npolar.no/dataset/79d4b7c7-3bee-40a6-975f-f9ed4d253c44/record/`
  const searchParams = new URLSearchParams({
    parentId: "6ab940f6-6571-4ba8-84db-2c62b440f3e2",
    count: "true",
    from: "2025-12-07",
    until: "2025-12-09",
  })

  //
  // No pagination support in npolar API? Use skip parameter...
  //
  let i = 0
  while (true) {
    searchParams.set("skip", (i++ * 50).toString())
    const url = `${baseURL}?${searchParams.toString()}`
    const response = await fetch(url)
    const json = await response.json()
    if (json.items.length !== 0) {
      result.push(
        ...json.items.map(({ content }: any) => ({
          date: content.measured,
          temp_c: content.TA0_0,
          rel_humidity: content.UU0_0,
          wind_speed: content.FF0_0,
          wind_direction_deg: content.DD0_0,
          pressure: content.PO0_0,
        })),
      )
    } else break
  }

  // Npolar data is not properly sorted, sort by date here
  result.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Client-side cache only for now...
    },
  })
}
