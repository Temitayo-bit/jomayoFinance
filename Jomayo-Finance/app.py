from flask import Flask, render_template, request, jsonify
import yfinance as yf
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def calculate_rsi(symbol):
    data = yf.download(symbol, period='14d', interval='1d')['Close']
    delta = data.diff()
    gains = delta.copy()
    losses = delta.copy()
    gains[gains < 0] = 0
    losses[losses > 0] = 0
    avg_gain = gains.rolling(window=14, min_periods=1).mean()
    avg_loss = abs(losses.rolling(window=14, min_periods=1).mean())
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs[-1]))
    return rsi

def fetch_news(symbol):
    url = f'https://news.google.com/rss/search?q={symbol}'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'xml')
    items = soup.findAll('item')
    news = []
    for item in items[:3]: 
        news.append({'title': item.title.text, 'link': item.link.text})
    return news

def generate_investment_plan(amount, symbols):
    plans = {}
    for symbol in symbols:
        rsi = calculate_rsi(symbol)
        if rsi < 30:
            allocation = {'stocks': 60, 'bonds': 20, 'cash': 20}
        else:
            allocation = {'stocks': 40, 'bonds': 40, 'cash': 20}
        plan = {key: round(amount * (value / 100), 2) for key, value in allocation.items()}
        news = fetch_news(symbol)
        recommendation = "Good investment" if rsi < 30 else "Not a good investment"
        plans[symbol] = {
            'plan': plan,
            'news': news,
            'recommendation': recommendation
        }
    return plans

@app.route('/')
def index():
    return render_template('investment.html')

@app.route('/invest', methods=['POST'])
def invest():
    data = request.get_json()
    amount = float(data['amount'])
    symbols = data['symbols']
    plans = generate_investment_plan(amount, symbols)
    return jsonify(plans)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
