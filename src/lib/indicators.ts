export function calculateSMA(data: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEma: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
      continue;
    }
    if (prevEma === null) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      prevEma = sum / period;
    } else {
      prevEma = data[i] * k + prevEma * (1 - k);
    }
    ema.push(prevEma);
  }
  return ema;
}

export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff > 0) gains += diff;
      else losses -= diff;
      
      if (i === period) {
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      } else {
        rsi.push(null);
      }
    } else {
      const diff = data[i] - data[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      
      // Wilder's smoothing
      const prevRsi = rsi[i - 2] as number;
      // This is a simplified RSI for display
      const rs = gain / (loss || 1);
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  // Pad the first null
  return [null, ...rsi];
}

export function calculateMACD(data: number[]) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine = ema12.map((val, i) => (val !== null && ema26[i] !== null ? val! - ema26[i]! : null));
  
  const validMacd = macdLine.filter(v => v !== null) as number[];
  const signalLineRaw = calculateEMA(validMacd, 9);
  
  // Pad signal line to match macdLine length
  const padding = macdLine.length - signalLineRaw.length;
  const signalLine = [...Array(padding).fill(null), ...signalLineRaw];
  
  const histogram = macdLine.map((val, i) => (val !== null && signalLine[i] !== null ? val! - signalLine[i]! : null));
  
  return { macdLine, signalLine, histogram };
}
