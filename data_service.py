import pandas as pd
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression
import warnings

warnings.filterwarnings('ignore')

cache_store = {}

def get_companies():
    return [
        {"name": "Reliance Industries", "symbol": "RELIANCE.NS"},
        {"name": "Tata Consultancy Services", "symbol": "TCS.NS"},
        {"name": "Infosys", "symbol": "INFY.NS"},
        {"name": "HDFC Bank", "symbol": "HDFCBANK.NS"},
        {"name": "State Bank of India", "symbol": "SBIN.NS"},
        {"name": "Apple Inc", "symbol": "AAPL"},
        {"name": "Microsoft Corp", "symbol": "MSFT"},
        {"name": "Tesla", "symbol": "TSLA"}
    ]

def fetch_data(symbol: str, period="1y"):
    cache_key = f"{symbol}_{period}"
    if cache_key in cache_store:
        return cache_store[cache_key]
        
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period)
    
    if hist.empty:
        raise ValueError(f"No stock data found for ticker symbol: {symbol}")
        
    hist.dropna(inplace=True)
    hist.index = pd.to_datetime(hist.index).tz_localize(None) 
    
    hist['Daily Return'] = (hist['Close'] - hist['Open']) / hist['Open']
    hist['7_Day_MA'] = hist['Close'].rolling(window=7).mean()
    hist['Volatility'] = hist['Daily Return'].rolling(window=30).std() * np.sqrt(252) * 100 
    hist['Mock_Sentiment'] = np.where(hist['Daily Return'] > 0, 
                                      np.random.randint(50, 100, size=len(hist)), 
                                      np.random.randint(0, 50, size=len(hist)))
    
    high_52 = hist['High'].max()
    low_52 = hist['Low'].min()
    
    prices = hist['Close'].values[-30:]
    if len(prices) >= 10:
        X = np.arange(len(prices)).reshape(-1, 1)
        y = prices
        model = LinearRegression().fit(X, y)
        next_days = np.arange(len(prices), len(prices) + 5).reshape(-1, 1)
        predictions = model.predict(next_days)
    else:
        predictions = []

    result = {
        "dates": hist.index.strftime('%Y-%m-%d').tolist(), 
        "close": hist['Close'].round(2).tolist(),
        "open": hist['Open'].round(2).tolist(),
        "high": hist['High'].round(2).tolist(),
        "low": hist['Low'].round(2).tolist(),
        "daily_return": (hist['Daily Return'] * 100).round(2).tolist(), 
        "ma_7": hist['7_Day_MA'].fillna(0).round(2).tolist(),
        "volatility": hist['Volatility'].fillna(0).round(2).tolist(),
        "sentiment": hist['Mock_Sentiment'].tolist(),
        "summary": {
            "52_week_high": round(high_52, 2),
            "52_week_low": round(low_52, 2),
            "average_close": round(hist['Close'].mean(), 2)
        },
        "ml_predictions": [round(p, 2) for p in predictions]
    }
    
    cache_store[cache_key] = result
    return result

def get_last_n_days(data, n=30):
    subset = {}
    for key, val in data.items():
        if isinstance(val, list) and len(val) == len(data['dates']):
            subset[key] = val[-n:]
        else:
            subset[key] = val
    return subset

def get_top_movers():
    companies = get_companies()
    movers = []
    for c in companies:
        try:
            data = fetch_data(c["symbol"], period="1y") 
            latest_return = data["daily_return"][-1]
            latest_close = data["close"][-1]
            movers.append({
                "symbol": c["symbol"].replace('.NS', ''),
                "name": c["name"],
                "daily_return": latest_return,
                "latest_close": latest_close
            })
        except:
            continue
    movers.sort(key=lambda x: x["daily_return"], reverse=True)
    return {
        "gainers": [m for m in movers if m["daily_return"] > 0][:3],
        "losers": [m for m in movers if m["daily_return"] < 0][::-1][:3]
    }
