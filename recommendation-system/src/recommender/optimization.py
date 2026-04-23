import pandas as pd
from pypfopt import EfficientFrontier
from pypfopt import objective_functions

class PortfolioOptimizer:
    def __init__(self, risk_data_path):
        self.df_risk = pd.read_csv(risk_data_path)
        if 'Date' in self.df_risk.columns:
            self.df_risk.set_index('Date', inplace=True)

    def calculate_optimal_weights(self, final_tickers, current_weights_dict):
        """
        คำนวณสัดส่วนพอร์ตที่ดีที่สุด และสร้าง Action Plan เทียบกับพอร์ตเดิม
        """
        print(f"   > กำลังคำนวณสัดส่วน Optimization สำหรับหุ้น {len(final_tickers)} ตัว...")
        
        # ดึงข้อมูลเฉพาะหุ้นที่เข้ารอบ
        df_returns = self.df_risk[final_tickers].dropna()
        
        # คำนวณ Expected Returns และ Covariance Matrix (รายปี)
        mu = df_returns.mean() * 252
        S = df_returns.cov() * 252
        
        # สมการ Optimization 
        ef = EfficientFrontier(mu, S, weight_bounds=(0.05, 0.50))
        
        # เพิ่ม L2 Regularization ให้ AI กระจายน้ำหนักได้เนียนขึ้น
        ef.add_objective(objective_functions.L2_reg, gamma=1.0)
        
        # หาจุด Max Sharpe
        raw_weights = ef.max_sharpe()
        cleaned_weights = ef.clean_weights()
        performance = ef.portfolio_performance(verbose=False)
        
        #  Rebalancing Action Plan
        target_weights_pct = {ticker: round(w * 100, 2) for ticker, w in cleaned_weights.items()}
        
        current_weights_pct = {ticker: round(w * 100, 2) for ticker, w in current_weights_dict.items()}
        
        action_plan = []
        for ticker, target_w in target_weights_pct.items():
            current_w = current_weights_pct.get(ticker, 0.0) 
            delta = target_w - current_w
            
            if delta > 0.1:
                action = "BUY"
            elif delta < -0.1:
                action = "SELL"
            else:
                action = "HOLD"
                
            action_plan.append({
                "ticker": ticker,
                "current_weight_pct": current_w,
                "target_weight_pct": target_w,
                "adjustment_pct": round(delta, 2),
                "action": action
            })
            
        return {
            "target_weights_pct": target_weights_pct,
            "rebalancing_plan": action_plan,
            "expected_annual_return_pct": round(performance[0] * 100, 2),
            "annual_volatility_pct": round(performance[1] * 100, 2),
            "sharpe_ratio": round(performance[2], 2)
        }
        
        