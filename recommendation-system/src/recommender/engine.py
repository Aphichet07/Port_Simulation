import pandas as pd
from .clustering import Clustering
from .context_model import MarketContextEngine
from .risk_model import RiskModelEngine
from .optimization import PortfolioOptimizer
from pathlib import Path

class Engine:
    def __init__(self, rec_data_path=None, forecast_data_path=None, risk_data_path=None):
        
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        DATA_DIR = BASE_DIR / "data" / "processed"

        self.rec_data_path = rec_data_path or str(DATA_DIR / "recommendation_features.csv")
        self.forecast_data_path = forecast_data_path or str(DATA_DIR / "forecast_features.csv")
        self.risk_data_path = risk_data_path or str(DATA_DIR / "risk_returns.csv")
        
        self.clustering_engine = Clustering(n_clusters=3)
        self.context_engine = MarketContextEngine(self.forecast_data_path)
        self.risk_engine = RiskModelEngine(self.risk_data_path)
        self.optimizer = PortfolioOptimizer(self.risk_data_path)

    def run(self, payload):
        """
        รับ Payload จาก API แล้วรัน Pipeline คืนค่ากลับเป็น JSON-ready dictionary
        """
        current_portfolio_dict = payload.get('user_portfolio', {})
        current_tickers = list(current_portfolio_dict.keys())
        top_n = payload.get('top_n_recommendations', 3)
        
        print(f"\nวิเคราะห์พอร์ตสำหรับ: {current_tickers}")
        
        # ตรวจสภาวะตลาด และ กรองหุ้นตามสไตล์
        market_status = self.context_engine.analyze_current_regime()
        df_clustered, _ = self.clustering_engine.fit_and_label(self.rec_data_path)
        
        df_filtered = df_clustered[df_clustered['Style_Label'].isin(market_status['allowed_styles'])]
        candidate_tickers = df_filtered[~df_filtered['Ticker'].isin(current_tickers)]['Ticker'].tolist()
        
        # หาหุ้นคานความเสี่ยง
        best_tickers, df_scores = self.risk_engine.calculate_diversification_score(
            current_portfolio=current_tickers, 
            candidate_tickers=candidate_tickers, 
            top_n=top_n
        )
        
        # Optimization
        final_portfolio_tickers = current_tickers + best_tickers
        optimization_result = self.optimizer.calculate_optimal_weights(
            final_tickers=final_portfolio_tickers,
            current_weights_dict=current_portfolio_dict
        )
        
        rec_details = df_clustered[df_clustered['Ticker'].isin(best_tickers)].merge(df_scores, on='Ticker')
        rec_details = rec_details.sort_values(by='Risk_Score (Corr)')
        
        response_data = {
            "market_context": {
                "regime": market_status['regime'],
                "vix_index": round(market_status['vix_index'], 2),
                "description": f"อนุญาตสไตล์: {market_status['allowed_styles']}"
            },
            "original_portfolio": current_portfolio_dict,
            "recommended_candidates": rec_details[['Ticker', 'Style_Label', 'Risk_Score (Corr)']].to_dict(orient='records'),
            
                "portfolio_optimization": {
                "target_weights_pct": optimization_result['target_weights_pct'],
                "rebalancing_plan": optimization_result['rebalancing_plan'],
                "projected_performance": optimization_result['projected_performance'] 
            
            }
        }
        
        return response_data
    
    
if __name__ == "__main__":
    api_payload = {
        "user_portfolio": {
            "ED": 0.60,  
            "DUK": 0.20,
            "NVDA": 0.20   
        },
        "top_n_recommendations": 3
    }
    
    pipeline = Engine(
        rec_data_path="../../data/processed/recommendation_features.csv",
        forecast_data_path="../../data/processed/forecast_features.csv",
        risk_data_path="../../data/processed/risk_returns.csv"
    )
    
    final_result = pipeline.run(payload=api_payload)
    
    import json
    print("\nผลลัพธ์ :")
    print(json.dumps(final_result, indent=4, ensure_ascii=False))