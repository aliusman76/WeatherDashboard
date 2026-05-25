import { useState, useEffect } from 'react'

const WORLD_CITIES = ["London", "Tokyo", "New York", "Dubai"]

function getWeatherEmoji(description = '') {

  const d = description.toLowerCase()
  if (d.includes('thunder'))               return '⛈️'
  if (d.includes('drizzle'))               return '🌦️'
  if (d.includes('heavy rain'))            return '🌧️'
  if (d.includes('rain'))                  return '🌧️'
  if (d.includes('snow'))                  return '❄️'
  if (d.includes('sleet'))                 return '🌨️'
  if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '🌫️'
  if (d.includes('smoke') || d.includes('dust') || d.includes('sand')) return '🌪️'
  if (d.includes('clear'))                 return '☀️'
  if (d.includes('few clouds'))            return '🌤️'
  if (d.includes('scattered clouds'))      return '⛅'
  if (d.includes('broken clouds'))         return '🌥️'
  if (d.includes('overcast'))              return '☁️'
  if (d.includes('cloud'))                 return '☁️'
  return '🌡️'
}

async function apiFetch(path) {
  
  const res = await fetch('/api' + path)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Something went wrong')
  }
  return res.json()
}

export default function App() {

  const [cityInput,    setCityInput]    = useState('')
  const [weather,      setWeather]      = useState(null)
  const [forecast,     setForecast]     = useState([])
  const [worldCities,  setWorldCities]  = useState([])
  const [errorMsg,     setErrorMsg]     = useState('')
  const [showWeather,  setShowWeather]  = useState(false)
  const [showForecast, setShowForecast] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [history,      setHistory]      = useState(
    () => JSON.parse(localStorage.getItem('weatherHistory') || '[]')
  )

  useEffect(() => {

    async function loadWorldCities() {
      const results = []
      for (const city of WORLD_CITIES) {

        try {
          const d = await apiFetch(`/weather/${encodeURIComponent(city)}`)
          results.push(d)
        } catch {
          results.push({ city, error: true })
        }
      }

      setWorldCities(results)
    }

    loadWorldCities()
  }, [])

  function saveHistory(city) {
    
    setHistory(prev => {

      if (prev.includes(city)){
         return prev
      }

      const next = [city, ...prev].slice(0, 8)
      localStorage.setItem('weatherHistory', JSON.stringify(next))
      return next
    })
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem('weatherHistory')
  }

  async function fetchWeather(city) {

    if (!city.trim()) { 
      setErrorMsg('Please enter a city name.'); return
     }
    setErrorMsg('')
    setShowWeather(false)
    setShowForecast(false)
    setLoading(true)
    try {
      const [w, f] = await Promise.all([
        apiFetch(`/weather/${encodeURIComponent(city)}`),
        apiFetch(`/forecast/${encodeURIComponent(city)}`)
      ])
      setWeather(w)
      setForecast(f.forecast)
      setShowWeather(true)
      setShowForecast(true)
      saveHistory(w.city)
    } catch (e) {
      setErrorMsg(
        e.message.includes('not found')
          ? 'City not found. Please check the spelling and try again.'
          : 'Something went wrong. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Weather Dashboard</h1>

      <div className="search-container">
        <input
          id="cityIn"
          type="text"
          placeholder="Search city... (e.g. Islamabad)"
          autoComplete="off"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && fetchWeather(cityInput)}
        />

        <button id="searchBtn" onClick={() => fetchWeather(cityInput)}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        <button id="clearBtn" onClick={clearHistory}>Clear History</button>
      </div>

      <div className="history">
        <h3>Recent Searches</h3>
        <ul id="histList">
          {history.length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>No recent searches</p>
            : history.map(city => (
                <li key={city} onClick={() => { setCityInput(city); fetchWeather(city) }}>
                  {city}
                </li>
              ))
          }
        </ul>
      </div>

      <div id="currWeather" className={`current-weather ${showWeather ? '' : 'hidden'}`}>
        {weather && (
          <>
            <h2 id="cityName">{weather.city}, {weather.country}</h2>
            <div className="weather-main">
              <img
                id="currentIcon"
                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt="weather icon"
              />
              <div>
                <span id="temperature" className="temp">{weather.temp}°C</span>
                <span id="description" className="desc">
                  {getWeatherEmoji(weather.description)} {weather.description}
                </span>
              </div>
            </div>
            <hr />
            <div className="details">
              <div className="detail-item">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind</span>
                <span className="detail-value">{weather.wind_speed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Min / Max</span>
                <span className="detail-value">{weather.temp_min}° / {weather.temp_max}°</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{weather.feels_like}°C</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`error ${errorMsg ? '' : 'hidden'}`}>{errorMsg}</div>

      <div className={showForecast ? '' : 'hidden'}>
        <p className="section-title">5-Day Forecast</p>
        <div id="forecastCards" className="forecast-cards">
          {forecast.map(day => (
            <div key={day.date} className="card">
              <span className="card-day">
                {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'short', day: 'numeric'
                })}
              </span>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
              />
              <span className="card-temp">{day.temp}°C</span>
              <span className="card-desc">{getWeatherEmoji(day.description)} {day.description}</span>
              <span className="card-humidity">💧 {day.humidity}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="world-title">Around the World</p>
        <div id="worldCities" className="world-cards">
          {worldCities.length === 0
            ? ['London','Tokyo','New York','Dubai'].map(c => (
                <div key={c} className="world-card">
                  <div className="world-city-name" style={{ color: 'rgba(255,255,255,0.3)' }}>{c}</div>
                </div>
              ))
            : worldCities.map(c => (
                c.error
                  ? (
                    <div key={c.city} className="world-card">
                      <div className="world-city-name">{c.city}</div>
                      <div className="world-desc">unavailable</div>
                    </div>
                  ) : (
                    <div key={c.city} className="world-card">
                      <img src={`https://openweathermap.org/img/wn/${c.icon}@2x.png`} alt={c.description} />
                      <div className="world-city-name">{c.city}</div>
                      <div className="world-country">{c.country}</div>
                      <div className="world-temp">{c.temp}°C</div>
                      <div className="world-desc">{getWeatherEmoji(c.description)} {c.description}</div>
                    </div>
                  )
              ))
          }
        </div>
      </div>

    </div>
  )
}
