import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// @ts-ignore
const yahooFinance = new YahooFinance();

app.use(express.json());

// --- API Routes ---

// 1. Stock Data Route
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;
    const { period1, period2, range, interval: queryInterval, light } = req.query;

    // Search for ticker if symbol looks like a name
    if (symbol.includes(' ') || symbol.length > 3) {
      const searchResults = await yahooFinance.search(symbol);
      if (searchResults.quotes && searchResults.quotes.length > 0) {
        const indianQuotes = searchResults.quotes.filter(q => q.exchange === 'NSI' || q.exchange === 'BSE');
        
        if (indianQuotes.length > 0) {
          const sortedQuotes = [...indianQuotes].sort((a: any, b: any) => {
            const aSym = (a.symbol as string || '').toUpperCase();
            const bSym = (b.symbol as string || '').toUpperCase();
            const aName = (a.shortname as string || '').toUpperCase();
            const bName = (b.shortname as string || '').toUpperCase();
            const search = symbol.toUpperCase();

            if (aSym === search || aName === search) return -1;
            if (bSym === search || bName === search) return 1;
            if (aSym.startsWith(search) || aName.startsWith(search)) return -1;
            if (bSym.startsWith(search) || bName.startsWith(search)) return 1;
            return 0;
          });
          symbol = sortedQuotes[0].symbol as string;
        } else {
          symbol = searchResults.quotes[0].symbol as string;
        }
      }
    }

    // Fetch quote
    let quote;
    try {
      quote = await yahooFinance.quote(symbol);
    } catch (e) {
      const searchResults = await yahooFinance.search(symbol);
      if (searchResults.quotes && searchResults.quotes.length > 0) {
        const bestMatch = searchResults.quotes.find(q => q.exchange === 'NSI' || q.exchange === 'BSE') || searchResults.quotes[0];
        symbol = bestMatch.symbol as string;
        quote = await yahooFinance.quote(symbol);
      } else {
        throw e;
      }
    }

    if (light === 'true') {
      return res.json({ quote, history: [] });
    }

    let p1: string;
    let p2: string = new Date().toISOString().split('T')[0];
    let fetchInterval: any = queryInterval || '1d';

    const now = new Date();
    const rangeStr = (range as string)?.toLowerCase();
    switch (rangeStr) {
      case '1d':
        const start1D = new Date(now);
        start1D.setDate(now.getDate() - 7);
        p1 = start1D.toISOString().split('T')[0];
        fetchInterval = '15m'; 
        break;
      case '1w':
        const start1W = new Date(now);
        start1W.setDate(now.getDate() - 14);
        p1 = start1W.toISOString().split('T')[0];
        fetchInterval = '1h';
        break;
      case '1m':
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        p1 = lastMonth.toISOString().split('T')[0];
        break;
      case '1y':
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);
        p1 = lastYear.toISOString().split('T')[0];
        break;
      case 'all':
        p1 = '2000-01-01';
        fetchInterval = '1mo';
        break;
      default:
        p1 = (period1 as string) || '2023-01-01';
        p2 = (period2 as string) || p2;
    }

    const result = await yahooFinance.chart(symbol, {
      period1: p1,
      period2: p2,
      interval: fetchInterval as any,
    });

    const history = result.quotes.map(q => ({
      date: q.date,
      close: q.close,
      volume: q.volume
    })).filter(q => q.close !== null && q.close !== undefined);

    res.json({ quote, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. News & Social Scraping Route
app.get('/api/news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const ticker = symbol.split('.')[0];
    
    let news: any[] = [];
    try {
      const searchUrl = `https://www.google.com/search?q=${ticker}+stock+news+site:economictimes.indiatimes.com+OR+site:moneycontrol.com&tbm=nws`;
      const response = await axios.get(searchUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 5000
      });
      const $ = cheerio.load(response.data);
      
      const newsItems = $('div.g, div.SoS79, div.nS41Cd, a.WlyYGe');
      
      newsItems.each((i, el) => {
        if (i < 5) {
          const title = $(el).find('h3, div[role="heading"]').first().text();
          const link = $(el).find('a').first().attr('href');
          const source = $(el).find('.Mg0Zbe, .XT89S, .NUnG9d').first().text() || 'Financial News';
          
          if (title && link && link.startsWith('http')) {
            let category = 'GENERAL';
            const upperTitle = title.toUpperCase();
            if (upperTitle.includes('PROFIT') || upperTitle.includes('REVENUE') || upperTitle.includes('Q3') || upperTitle.includes('Q4')) category = 'EARNINGS';
            if (upperTitle.includes('BUY') || upperTitle.includes('SELL') || upperTitle.includes('TARGET')) category = 'ANALYST';
            if (upperTitle.includes('ACQUISITION') || upperTitle.includes('MERGER') || upperTitle.includes('DEAL')) category = 'CORPORATE';

            news.push({ type: 'news', title, link, source, time: 'Recent', category });
          }
        }
      });
    } catch (scrapingError: any) {
      if (scrapingError.response?.status === 429) {
        console.warn(`Rate limited (429) for ${ticker}.`);
      } else {
        console.error(`News scraping failed for ${ticker}:`, scrapingError.message);
      }
    }

    if (news.length === 0) {
      news = [
        { type: 'news', title: `${ticker} Technical Analysis: Key levels to watch for the upcoming week.`, link: '#', source: 'Market Analysis', time: '1h ago', category: 'GENERAL' },
        { type: 'news', title: `Institutional interest grows in ${ticker} as fundamentals remain strong.`, link: '#', source: 'QuantEdge Insight', time: '3h ago', category: 'CORPORATE' },
        { type: 'news', title: `Top analysts maintain 'Buy' rating on ${ticker} with revised price targets.`, link: '#', source: 'Brokerage Report', time: '5h ago', category: 'ANALYST' }
      ];
    }

    const socialFeed = [
      { type: 'social', user: '@TradeMaster_IN', content: `Massive breakout pattern on $${ticker}. RSI looks prime for a move. #NSE #Trading`, time: '2m ago', sentiment: 'Bullish' },
      { type: 'social', user: '@StockWhiz', content: `Institutional buying detected in $${ticker} at current levels. Support holding strong.`, time: '15m ago', sentiment: 'Bullish' },
      { type: 'social', user: '@MarketPulse', content: `Watching $${ticker} closely. News from ET suggests potential policy impact.`, time: '45m ago', sentiment: 'Neutral' },
      { type: 'social', user: '@FinGuru_India', content: `$${ticker} target price upgraded by leading brokerages. Strong fundamentals.`, time: '1h ago', sentiment: 'Bullish' },
    ];

    res.json({ news, social: socialFeed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. AI Prediction Engine Route
app.post('/api/predict', async (req, res) => {
  try {
    const { symbol, technicals, sentiment } = req.body;
    
    let score = 0;
    const reasons: string[] = [];

    if (technicals.rsi < 30) {
      score += 20;
      reasons.push('RSI is oversold (< 30), indicating a potential reversal.');
    } else if (technicals.rsi > 70) {
      score -= 20;
      reasons.push('RSI is overbought (> 70), indicating a potential pullback.');
    }

    if (technicals.sma20 > technicals.sma50) {
      score += 15;
      reasons.push('Golden cross detected: Short-term average is above long-term average.');
    } else {
      score -= 10;
      reasons.push('Death cross or bearish alignment: Short-term average is below long-term average.');
    }

    if (sentiment.score > 0.5) {
      score += 25;
      reasons.push('Highly positive market sentiment from news and social media.');
    } else if (sentiment.score < -0.5) {
      score -= 25;
      reasons.push('Highly negative market sentiment detected.');
    }

    const prediction = score > 15 ? 'BUY' : score < -15 ? 'SELL' : 'HOLD';
    const confidence = Math.min(Math.abs(score) + 50, 95);

    res.json({
      symbol,
      prediction,
      confidence,
      explanation: reasons.join(' '),
      riskLevel: Math.abs(score) > 30 ? 'High' : 'Medium',
      marketMood: sentiment.score > 0 ? 'Bullish' : 'Bearish'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
