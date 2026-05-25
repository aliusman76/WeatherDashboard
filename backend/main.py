from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="hhhhhhWeather API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

API_KEY  = "b3268c762cb2c2812e30225e7fc4dd02"
BASE_URL = "https://api.openweathermap.org/data/2.5"
WORLD_CITIES = ["London", "Tokyo", "New York", "Dubai"]


async def owm_get(endpoint: str, city: str) -> dict:
    
    url = f"{BASE_URL}/{endpoint}"
    params = {"q": city, "appid": API_KEY, "units": "metric"}
    
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, params=params)
        
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Upstream weather API error.")
    
    return response.json()


@app.get("/weather/{city}")
async def get_current_weather(city: str):
    
    data = await owm_get("weather", city)
    
    return {
        "city":        data["name"],
        "country":     data["sys"]["country"],
        "temp":        round(data["main"]["temp"]),
        "feels_like":  round(data["main"]["feels_like"]),
        "temp_min":    round(data["main"]["temp_min"]),
        "temp_max":    round(data["main"]["temp_max"]),
        "humidity":    data["main"]["humidity"],
        "wind_speed":  round(data["wind"]["speed"], 1),
        "description": data["weather"][0]["description"],
        "icon":        data["weather"][0]["icon"].replace("n", "d"),
    }


@app.get("/forecast/{city}")
async def get_forecast(city: str):
    
    data = await owm_get("forecast", city)
    daily: dict = {}
    
    for item in data["list"]:
        date_key = item["dt_txt"].split(" ")[0]
        if date_key not in daily and len(daily) < 5:
            daily[date_key] = {
                "date":        date_key,
                "temp":        round(item["main"]["temp"]),
                "humidity":    item["main"]["humidity"],
                "description": item["weather"][0]["description"],
                "icon":        item["weather"][0]["icon"].replace("n", "d"),
            }
            
    return {
        "city":     data["city"]["name"],
        "country":  data["city"]["country"],
        "forecast": list(daily.values()),
    }


@app.get("/world")
async def get_world_weather():
    
    results = []
    async with httpx.AsyncClient(timeout=10) as client:
        
        for city in WORLD_CITIES:
            try:
                r = await client.get(f"{BASE_URL}/weather",params={"q": city, "appid": API_KEY, "units": "metric"})
                
                d = r.json()
                results.append({
                    "city":        d["name"],
                    "country":     d["sys"]["country"],
                    "temp":        round(d["main"]["temp"]),
                    "description": d["weather"][0]["description"],
                    "icon":        d["weather"][0]["icon"].replace("n", "d"),
                })
            except Exception:
                results.append({"city": city, "error": "unavailable"})
    return {"cities": results}
