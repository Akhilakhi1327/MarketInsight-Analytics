# Jarnox Fintech Analytics 📈

Hey there! This is my submission for the Jarnox Fintech Internship assignment. I built a simple dashboard and REST API to fetch and analyze stock market data. I had a lot of fun putting this together and tried to include a few interesting extra features.

## What it does

This project has a backend built with FastAPI and a clean vanilla JS dashboard on the frontend. 

Features include:
- **API Endpoints**: Fetching stock data, comparing two different stocks, and getting summaries like 52-week highs and lows.
- **Top Movers**: At the top left of the dashboard, you can see today's top gainers and losers dynamically calculated across my tracked companies.
- **Bonus Metrics**: I added a basic rolling 7-day moving average, a risk/volatility score, and a simple sentiment scoring logic.
- **Next Day Prediction**: I implemented a basic scikit-learn Linear Regression model to guess tomorrow's closing price based on the last 30 days of data.
- **Visualization**: An interactive line chart using Chart.js that toggles between different timeframes.

## Tech Used

- **Python, FastAPI, Pandas, yfinance** (Backend & Data)
- **HTML, Bootstrap 5, Chart.js** (Frontend)
- **Docker** (For easy setup)

## How to run it locally

1. Clone this repository to your machine.
2. Install the required Python packages:
   `pip install -r requirements.txt`
3. Start the FastAPI server:
   `uvicorn app:app --reload`
4. Open your browser and head to `http://localhost:8000` to see the dashboard.
5. If you want to test the raw API endpoints, you can view the Swagger UI at `http://localhost:8000/docs`.

## Docker Setup (Optional)

If you prefer using Docker:
1. Build it: `docker build -t jarnox-dashboard .`
2. Run it: `docker run -p 8000:8000 jarnox-dashboard`

Thanks for taking the time to review my assignment! I learned a lot while building this and hope you enjoy using the dashboard.
