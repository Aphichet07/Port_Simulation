import argparse
from src.predictor import predictor
from src.config import Config

def parse_args():
    parser = argparse.ArgumentParser(description="Stock Price Prediction Inference")
    parser.add_argument("--ticker", type=str, default=Config.DEFAULT_TICKER, help="Ticker to predict")
    return parser.parse_args()

def run_command_line_predict(ticker: str):
    print(f"\nAnalyzing {ticker} trends for tomorrow via CLI...")
    
    result = predictor.predict(ticker)
    
    if not result["success"]:
        print(f"❌ Error: {result['error']}")
        return

    # แสดงผลสวยๆ แบบเดิม
    border = "=" * 45
    print(f"\n{border}")
    print(f" STOCK PREDICTION REPORT: {result['ticker']}")
    print(f"{border}")
    print(f" Current Price       : {result['current_price']}")
    print(f" Predicted Direction : {result['prediction']}")
    print(f" Confidence Score    : {result['confidence']}%")
    print(f" Analysis Timestamp  : {result['timestamp']}")
    print(f"{border}\n")

if __name__ == "__main__":
    args = parse_args()
    run_command_line_predict(args.ticker)