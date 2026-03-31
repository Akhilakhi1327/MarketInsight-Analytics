let stockChart = null;
let currentSymbol = null;
let isComparing = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/companies");
        const companies = await res.json();
        
        const list = document.getElementById("company-list");
        const sel1 = document.getElementById("compare1");
        const sel2 = document.getElementById("compare2");

        list.innerHTML = "";
        
        companies.forEach((c, index) => {
            const a = document.createElement("a");
            a.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
            a.innerHTML = `
                <span class="fw-bold">${c.symbol.replace('.NS', '')}</span>
                <span class="text-muted small">${c.name}</span>
            `;
            a.onclick = (e) => {
                document.querySelectorAll("#company-list .list-group-item").forEach(el => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
                
                if(isComparing) {
                    document.getElementById("compare-result").classList.add("d-none");
                    document.getElementById("chart-controls").classList.remove("d-none");
                    isComparing = false;
                }
                
                const days = document.querySelector('input[name="btnradio"]:checked')?.id.replace('btn', '') || 30;
                loadData(c.symbol, parseInt(days));
            };
            list.appendChild(a);

            sel1.innerHTML += `<option value="${c.symbol}" ${index===0 ? 'selected':''}>${c.symbol}</option>`;
            sel2.innerHTML += `<option value="${c.symbol}" ${index===1 ? 'selected':''}>${c.symbol}</option>`;
        });

        if (companies.length > 0) {
            list.firstChild.classList.add("active");
            loadData(companies[0].symbol, 30);
        }
        loadMovers();
    } catch (e) {
        document.getElementById("company-list").innerHTML = `<div class="p-3 text-danger"><small>Failed to load API.</small></div>`;
    }
});

async function loadData(symbol, days) {
    if (!symbol) return;
    currentSymbol = symbol;
    
    document.getElementById("chart-loader").classList.remove("d-none");
    document.getElementById("chart-title").innerHTML = `<span class="badge bg-primary text-white p-2 rounded">${symbol}</span> Overview`;
    document.getElementById("chart-controls").classList.remove("d-none");
    
    try {
        const res = await fetch(`/data/${symbol}?days=${days}`);
        const data = await res.json();

        document.getElementById("summary-cards").classList.remove("opacity-0");
        document.getElementById("s-high").innerText = "₹" + data.summary["52_week_high"];
        document.getElementById("s-low").innerText = "₹" + data.summary["52_week_low"];
        document.getElementById("s-avg").innerText = "₹" + data.summary["average_close"];
        
        let predVal = data.ml_predictions && data.ml_predictions.length > 0 ? data.ml_predictions[0] : null;
        if(predVal) {
            let color = predVal >= data.close[data.close.length-1] ? 'text-success' : 'text-danger';
            document.getElementById("s-ai").innerHTML = `<span class="${color}">₹${predVal}</span>`;
        } else {
            document.getElementById("s-ai").innerText = "N/A";
        }

        document.getElementById("secondary-metrics").classList.remove("d-none");
        document.getElementById("s-volatility").innerText = data.volatility[data.volatility.length-1].toFixed(2);
        
        let recentSent = data.sentiment.slice(-3).reduce((a,b)=>a+b, 0) / 3;
        const sentEl = document.getElementById("s-sentiment");
        sentEl.innerText = recentSent.toFixed(0);
        sentEl.className = "fs-5 " + (recentSent > 50 ? 'text-success' : 'text-danger');

        drawChart(data.dates, [
            { 
                label: 'Close Price', 
                data: data.close, 
                borderColor: '#0d6efd', 
                backgroundColor: 'rgba(13, 110, 253, 0.1)', 
                fill: true, 
                tension: 0.3, 
                pointRadius: days > 60 ? 0 : 3
            },
            { 
                label: '7-Day Moving Average', 
                data: data.ma_7, 
                borderColor: '#ffc107', 
                borderDash: [5, 5], 
                borderWidth: 2,
                tension: 0.3, 
                fill: false,
                pointRadius: 0
            }
        ]);
        
    } catch(e) {
        console.error(e);
        alert("Error fetching stock data!");
    } finally {
        document.getElementById("chart-loader").classList.add("d-none");
    }
}

async function compareStocks() {
    const s1 = document.getElementById("compare1").value;
    const s2 = document.getElementById("compare2").value;
    
    if (s1 === s2) return alert("Select distinct stocks to compare.");

    document.getElementById("chart-loader").classList.remove("d-none");
    
    isComparing = true;
    document.getElementById("summary-cards").classList.add("opacity-0");
    document.getElementById("secondary-metrics").classList.add("d-none");
    document.getElementById("chart-controls").classList.add("d-none");

    document.querySelectorAll("#company-list .list-group-item").forEach(el => el.classList.remove("active"));

    document.getElementById("chart-title").innerHTML = `<span class="badge bg-secondary p-2 rounded">Comparison</span> ${s1} vs ${s2} (30 Days)`;

    try {
        const res = await fetch(`/compare?symbol1=${s1}&symbol2=${s2}&days=${30}`);
        const data = await res.json();

        const resDiv = document.getElementById("compare-result");
        resDiv.classList.remove("d-none");
        resDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-1 border-bottom pb-1">
                <strong>${s1} Growth</strong> 
                <span class="badge ${data.symbol1_growth_pct >= 0 ? 'bg-success':'bg-danger'}">${data.symbol1_growth_pct}%</span>
            </div>
            <div class="d-flex justify-content-between pt-1">
                <strong>${s2} Growth</strong> 
                <span class="badge ${data.symbol2_growth_pct >= 0 ? 'bg-success':'bg-danger'}">${data.symbol2_growth_pct}%</span>
            </div>
        `;

        drawChart(data.dates, [
            { 
                label: s1 + ' Price', 
                data: data.symbol1_close, 
                borderColor: '#0d6efd',
                backgroundColor: '#0d6efd',
                tension: 0.3,
                pointRadius: 2
            },
            { 
                label: s2 + ' Price', 
                data: data.symbol2_close, 
                borderColor: '#dc3545', 
                backgroundColor: '#dc3545',
                tension: 0.3,
                pointRadius: 2
            }
        ]);
    } catch(e) {
        console.error(e);
        alert("Error calculating comparison.");
    } finally {
         document.getElementById("chart-loader").classList.add("d-none");
    }
}

function drawChart(labels, datasets) {
    const ctx = document.getElementById("stockChart").getContext("2d");
    if (stockChart) stockChart.destroy();
    
    stockChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: { 
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }, 
                tooltip: { mode: 'index', intersect: false } 
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
                y: { grid: { borderDash: [4, 4], color: '#f0f0f0' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } }
            }
        }
    });
}

async function loadMovers() {
    try {
        const res = await fetch("/top-movers");
        const data = await res.json();
        
        const gList = document.getElementById("gainers-list");
        const lList = document.getElementById("losers-list");
        
        if(data.gainers && data.gainers.length > 0) {
            document.getElementById("movers-card").classList.remove("d-none");
            data.gainers.forEach(g => {
                gList.innerHTML += `<div class="list-group-item d-flex justify-content-between px-3 py-2 bg-light border-0 border-bottom">
                    <span class="fw-bold small text-dark">${g.symbol}</span>
                    <span class="small fw-bold text-success">+${g.daily_return}%</span>
                </div>`;
            });
        }
        
        if(data.losers && data.losers.length > 0) {
            document.getElementById("movers-card").classList.remove("d-none");
            data.losers.forEach(l => {
                lList.innerHTML += `<div class="list-group-item d-flex justify-content-between px-3 py-2 bg-light border-0 border-bottom">
                    <span class="fw-bold small text-dark">${l.symbol}</span>
                    <span class="small fw-bold text-danger">${l.daily_return}%</span>
                </div>`;
            });
        }
    } catch(e) {
        console.error("Failed to load movers", e);
    }
}
