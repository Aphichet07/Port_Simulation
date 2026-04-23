import numpy as np
import pandas as pd
import glob
import os
import json
import warnings
import time
import requests
import yfinance as yf
import pandas_datareader.data as web
from datetime import datetime, timedelta
import io
warnings.filterwarnings('ignore')

OUTPUT = "../../data/processed/optimuzation_portfolio.csv"

def get_sp500_tickers():
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    response = requests.get(url, headers=headers)

    df_list = pd.read_html(io.StringIO(response.text))

    tickers = df_list[0]['Symbol'].tolist()
    print(tickers)
    tickers = [ticker.replace('.', '-') for ticker in tickers]
    return tickers

class DataMiner:
    def __init__(self, start_date, end_date):
        self.start_date = start_date
        self.end_date = end_date

    def mine_stock_data(self, ticker_symbol):
        print(f"กำลังดึงข้อมูลหุ้น: {ticker_symbol}...")
        stock = yf.Ticker(ticker_symbol)
        df_ohlcv = stock.history(start=self.start_date, end=self.end_date)

        if df_ohlcv.empty:
            return pd.DataFrame()

        df_ohlcv.reset_index(inplace=True)
        df_ohlcv['Date'] = df_ohlcv['Date'].dt.tz_localize(None)

        info = stock.info

        df_ohlcv['Ticker'] = ticker_symbol
        df_ohlcv['Sector'] = info.get('sector', 'N/A')
        df_ohlcv['Industry'] = info.get('industry', 'N/A')

        df_ohlcv['PE_Ratio'] = info.get('trailingPE', None)
        df_ohlcv['Forward_PE'] = info.get('forwardPE', None)
        df_ohlcv['PBV_Ratio'] = info.get('priceToBook', None)
        df_ohlcv['PEG_Ratio'] = info.get('pegRatio', None)

        df_ohlcv['Beta'] = info.get('beta', None)
        df_ohlcv['Debt_to_Equity'] = info.get('debtToEquity', None)
        df_ohlcv['Current_Ratio'] = info.get('currentRatio', None)

        df_ohlcv['ROE'] = info.get('returnOnEquity', None)
        df_ohlcv['Profit_Margin'] = info.get('profitMargins', None)
        df_ohlcv['Earnings_Growth'] = info.get('earningsQuarterlyGrowth', None)
        df_ohlcv['Revenue_Growth'] = info.get('revenueGrowth', None)

        df_ohlcv['Dividend_Yield'] = info.get('dividendYield', None)
        df_ohlcv['Payout_Ratio'] = info.get('payoutRatio', None)

        df_ohlcv['Analyst_Rec_Mean'] = info.get('recommendationMean', None)
        df_ohlcv['Target_Mean_Price'] = info.get('targetMeanPrice', None)

        cols = [
            'Date', 'Ticker', 'Sector', 'Industry',
            'Open', 'High', 'Low', 'Close', 'Volume',
            'PE_Ratio', 'Forward_PE', 'PBV_Ratio', 'PEG_Ratio',
            'Beta', 'Debt_to_Equity', 'Current_Ratio',
            'ROE', 'Profit_Margin', 'Earnings_Growth', 'Revenue_Growth',
            'Dividend_Yield', 'Payout_Ratio',
            'Analyst_Rec_Mean', 'Target_Mean_Price'
        ]

        return df_ohlcv[cols]

    def mine_macro_data(self):
        print("กำลังดึงข้อมูล Macroeconomic...")
        series_dict = {
            'GDP_Growth': 'GDP',
            'CPI_Inflation': 'CPIAUCSL',
            'Policy_Rate': 'FEDFUNDS'
        }

        df_macro = pd.DataFrame()

        # ดึงข้อมูลจาก FRED
        for col_name, series_id in series_dict.items():
            data = web.DataReader(series_id, 'fred', self.start_date, self.end_date)
            df_macro = pd.concat([df_macro, data], axis=1)

        df_macro.columns = series_dict.keys()
        df_macro.reset_index(inplace=True)
        df_macro.rename(columns={'DATE': 'Date'}, inplace=True)

        # ดึงข้อมูล VIX จาก yfinance
        vix_ticker = yf.Ticker('^VIX')
        vix_data = vix_ticker.history(start=self.start_date, end=self.end_date)
        vix_data.reset_index(inplace=True)
        vix_data['Date'] = vix_data['Date'].dt.tz_localize(None)
        vix_data = vix_data[['Date', 'Close']].rename(columns={'Close': 'VIX_Index'})

        # Missing Values (Forward Fill)
        df_macro_merged = pd.merge(vix_data, df_macro, on='Date', how='outer')
        df_macro_merged.sort_values('Date', inplace=True)

        df_macro_merged = df_macro_merged.ffill()
        df_macro_merged.dropna(subset=['VIX_Index'], inplace=True)

        return df_macro_merged
    
    
if __name__ == "__main__":
    end_date = datetime.today()
    start_date = end_date - timedelta(days=3650)
    
    miner = DataMiner(
        start_date=start_date.strftime('%Y-%m-%d'),
        end_date=end_date.strftime('%Y-%m-%d')
    )
    
    df_macro = miner.mine_macro_data()
    
    all_tickers = get_sp500_tickers()
    
    all_stocks_data = pd.DataFrame()
    for ticker in all_tickers:
        
        try:
            df_stock = miner.mine_stock_data(ticker)

            if not df_stock.empty:
                all_stocks_data = pd.concat([all_stocks_data, df_stock], ignore_index=True)

            time.sleep(1)

        except Exception as e:
            print(f"เกิดข้อผิดพลาดในการดึงข้อมูล {ticker}: {e}")
            continue
        
    final_panel_dataset = pd.merge(all_stocks_data, df_macro, on='Date', how='left')
    final_panel_dataset.to_csv(OUTPUT, index=False)