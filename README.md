# 📊 Jarnox Fintech Analytics (MarketInsight) 🚀

Welcome to my submission for the Jarnox Fintech Internship Assignment! This project is a feature-rich real-time stock market data exploration and analytics application built to provide actionable financial insights through an intuitive UI and a robust REST API.

## 🌟 Key Features & Highlights

This project goes above and beyond the required specifications, fully implementing all required endpoints as well as the proposed bonus components to ensure a premium user experience and efficient logic.

- **Real-Time API**: Powered by `FastAPI`, returning high-speed insights. Includes automatic OpenAPI/Swagger UI.
- **Data Engineering**: Data fetching and transformation utilizing `yfinance`, `pandas`, and `numpy`. Cached for rapid repeated access.
- **Actionable Metrics**: 7-Day Moving Average, 52-Week Highs/Lows, and structured JSON results for effortless client-side consumption.
- **Custom Creativity Metrics (Bonus)**
  - **Daily Top Movers**: Identifies and ranks daily Top Gainers and Losers on standard page load.
  - **Machine Learning AI Prediction**: Applies scikit-learn Linear Regression to standard 30-day trailing datasets to anticipate the next closing price.
  - **Volatility Score**: Calculates rolling standard deviation to determine risk associated with the specific asset.
  - **Sentiment Momentum**: An experimental simulated sentiment scoring system that analyzes favorable returns to display market confidence.
- **Comparison Engine**: Calculates relative percentage growth tracks the trajectory of two independent tickers.
- **Frontend Dashboard**: Beautifully styled UI utilizing Vanilla JS, Bootstrap 5, and Chart.js.

---

## ⚙️ Tech Stack

- **Backend / API Wrapper**: Python 3, FastAPI, Uvicorn
- **Data Processing & ML**: Pandas, NumPy, Scikit-learn
- **Data Sourcing**: yfinance
- **Frontend**: HTML5, Vanilla JavaScript, CSS3, Bootstrap 5
- **Charts**: Chart.js

---

## 🚀 Setup & Installation (Local Environment)

Follow these steps to spin up the local project in less than a minute.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akhilakhi1327/MarketInsight-Analytics.git
   cd MarketInsight-Analytics
   ```

2. **Setup your environment:**
   *(Optional but recommended)* Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Server:**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Explore:**
   - **Main UI:** http://localhost:8000
   - **Swagger Docs:** http://localhost:8000/docs
   - **Redoc:** http://localhost:8000/redoc

---

## 🐳 Docker Deployment (Optional Bonus)

You can containerize the backend seamlessly utilizing the included Dockerfile.

1. **Build the Image:**
   ```bash
   docker build -t jarnox-dashboard .
   ```

2. **Run the Container:**
   ```bash
   docker run -p 8000:8000 jarnox-dashboard
   ```

---

## 🌐 API Endpoint Reference

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | HTML Web Dashboard Entry Point |
| `/companies` | `GET` | Fetches a default array of supported active asset tickers. |
| `/data/{symbol}?days=30` | `GET` | Retrieve the historical price action arrays (close, high, etc). |
| `/summary/{symbol}` | `GET` | Returns an aggregate overview (52W H/L, Average). |
| `/compare?symbol1=TCS.NS&symbol2=AAPL` | `GET` | Returns normalized comparison statistics over requested days. |
| `/top-movers` | `GET` | Scans all configured assets and returns top gainers/losers dynamically. |

---

## 💡 Evaluation Criteria Breakdown

* **Python & Data Handling**: Implemented a comprehensive `data_service.py` to decouple business logic from API routing. All missing data paths handled gracefully. Standardized indexes explicitly configured.
* **API Design**: True decoupled REST endpoints utilized via FastAPI, adhering rigidly to standard HTTP paradigms. Endpoints are decorated cleanly with accurate tagging.
* **Creativity in Insights**: Aside from mapping 52W Highs and Lows efficiently, standard ML regression analysis is appended to the json packet predicting forward velocity.
* **Visualization**: Interactive hover tooltips via `Chart.js`, dynamic responsive layouts adjusting between 30D/90D/1Y timeframes without requiring page reloading.

---
*Created with ❤️ for Jarnox.*
