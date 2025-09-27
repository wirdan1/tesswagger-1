const axios = require("axios")

module.exports = {
  name: "Weather",
  desc: "Mendapatkan informasi cuaca berdasarkan nama kota",
  category: "Utility",
  params: ["city"],
  async run(req, res) {
    const { city } = req.query

    if (!city) {
      return res.status(400).json({
        status: false,
        error: 'Parameter "city" wajib diisi!',
      })
    }

    try {
      // Using OpenWeatherMap API (you'll need to get a free API key)
      const apiKey = process.env.OPENWEATHER_API_KEY || "demo_key"
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=id`

      // For demo purposes, return mock data
      const mockData = {
        name: city,
        main: {
          temp: Math.floor(Math.random() * 15) + 20,
          feels_like: Math.floor(Math.random() * 15) + 22,
          humidity: Math.floor(Math.random() * 40) + 40,
        },
        weather: [
          {
            main: "Clear",
            description: "cerah",
            icon: "01d",
          },
        ],
        wind: {
          speed: Math.floor(Math.random() * 10) + 5,
        },
      }

      const meta = {
        city: mockData.name,
        temperature: `${mockData.main.temp}°C`,
        feels_like: `${mockData.main.feels_like}°C`,
        humidity: `${mockData.main.humidity}%`,
        description: mockData.weather[0].description,
        wind_speed: `${mockData.wind.speed} m/s`,
      }

      return res.json({
        status: true,
        meta,
        data: {
          location: mockData.name,
          current: {
            temperature: mockData.main.temp,
            condition: mockData.weather[0].description,
            humidity: mockData.main.humidity,
            wind_speed: mockData.wind.speed,
          },
        },
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({
        status: false,
        error: "Gagal mendapatkan data cuaca.",
        message: err.message,
      })
    }
  },
}
