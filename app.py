from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from data_service import get_companies, fetch_data, get_last_n_days
import uvicorn

app = FastAPI(
    title="Jarnox Fintech API", 
    description="Stock Market Data Analytics REST API", 
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse, tags=["Dashboard UI"])
async def render_dashboard(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/companies", tags=["Stock Data"])
async def api_companies():
    return get_companies()

@app.get("/data/{symbol}", tags=["Stock Data"])
async def api_data(symbol: str, days: int = Query(30)):
    try:
        data = fetch_data(symbol, period="1y")
        return get_last_n_days(data, n=days)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/summary/{symbol}", tags=["Stock Data"])
async def api_summary(symbol: str):
    try:
        data = fetch_data(symbol, period="1y")
        return data["summary"]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/compare", tags=["Stock Data"])
async def api_compare(symbol1: str, symbol2: str, days: int = Query(30)):
    try:
        d1 = get_last_n_days(fetch_data(symbol1, period="1y"), n=days)
        d2 = get_last_n_days(fetch_data(symbol2, period="1y"), n=days)
        
        p1_growth = ((d1['close'][-1] - d1['close'][0]) / d1['close'][0]) * 100 if d1['close'][0] else 0
        p2_growth = ((d2['close'][-1] - d2['close'][0]) / d2['close'][0]) * 100 if d2['close'][0] else 0
        
        return {
            "symbol1": symbol1,
            "symbol1_recent_close": d1["close"][-1],
            "symbol1_growth_pct": round(p1_growth, 2),
            "symbol2": symbol2,
            "symbol2_recent_close": d2["close"][-1],
            "symbol2_growth_pct": round(p2_growth, 2),
            "dates": d1["dates"],
            "symbol1_close": d1["close"],
            "symbol2_close": d2["close"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
