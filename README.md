# Weather Dashboard (React + FastAPI)

A full-stack Weather Dashboard application built using **React (frontend)** and **FastAPI (backend)** that provides real-time weather information for any city using a weather API.

---

## Features
- Search weather by city name  
- Real-time temperature display  
- Wind speed and humidity tracking  
- Weather condition updates (sunny, cloudy, rainy, etc.)  
- Fast and lightweight backend using FastAPI  
- Responsive UI for all devices  

---

## Tech Stack
**Frontend:**
- React.js
- CSS
- Axios

**Backend:**
- FastAPI (Python)
- Uvicorn

**API:**
- OpenWeatherMap API (or any weather API used)

---

## Project Structure

WeatherDashboard/
├── backend/
│ ├── main.py
│ └── ...
├── frontend/
│ ├── src/
│ └── ...
└── README.md


---

## How to Run Locally

### Clone the repository
```bash
git clone https://github.com/aliusman76/WeatherDashboard.git
cd WeatherDashboard
Backend Setup (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs on:

http://127.0.0.1:8000
Frontend Setup (React)
cd frontend
npm install
npm start

Frontend runs on:

http://localhost:3000
API Used
OpenWeatherMap API
https://openweathermap.org/api

Future Improvements
7-day weather forecast
Location auto-detection
Dark mode UI
Weather alerts system
Better UI animations
Author

Ali Usman
GitHub: @aliusman76

