import pandas as pd
import numpy as np
from scipy.optimize import differential_evolution

class PortfolioOptimizer:
    def __init__(self, risk_data_path):
        self.df_risk = pd.read_csv(risk_data_path)
        if 'Date' in self.df_risk.columns:
            self.df_risk.set_index('Date', inplace=True)

    def _round_to_100(self, weights_dict):
        floored_weights = {k: int(v) for k, v in weights_dict.items()}
        shortfall = int(100 - sum(floored_weights.values()))
        remainders = {k: v - floored_weights[k] for k, v in weights_dict.items()}
        sorted_by_remainder = sorted(remainders.items(), key=lambda x: x[1], reverse=True)
        shortfall = min(shortfall, len(sorted_by_remainder))
        for i in range(shortfall):
            key_to_increment = sorted_by_remainder[i][0]
            floored_weights[key_to_increment] += 1
        return floored_weights

    def calculate_optimal_weights(self, final_tickers, current_weights_dict):
        
        df_returns = self.df_risk[final_tickers].dropna()
        mu = df_returns.mean().values * 252
        cov_matrix = (df_returns.cov() * 252).values
        num_assets = len(final_tickers)

        original_weights = np.zeros(num_assets)
        for i, ticker in enumerate(final_tickers):
            if ticker in current_weights_dict:
                original_weights[i] = current_weights_dict[ticker]
                
        total_orig = np.sum(original_weights)
        if total_orig > 0:
            original_weights = original_weights / total_orig

        orig_return = np.sum(original_weights * mu)
        orig_volatility = np.sqrt(np.dot(original_weights.T, np.dot(cov_matrix, original_weights)))
        orig_sharpe = orig_return / orig_volatility if orig_volatility > 0 else 0

        def fitness_function(weights):
            weights = weights / np.sum(weights)
            port_return = np.sum(weights * mu)
            port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            
            sharpe_ratio = port_return / port_volatility if port_volatility > 0 else 0
            
            fitness_score = -sharpe_ratio 
            
            penalty = 0
            for i, ticker in enumerate(final_tickers):
                w = weights[i]
                
                # กฎ 1: ถ้าจะซื้อ ก็ไม่ควรซื้อหยุมหยิมต่ำกว่า 1% 
                if 0 < w < 0.01: 
                    penalty += 1.0 
                    
                if ticker in current_weights_dict:
                    current_w = current_weights_dict[ticker]
                    # กฎ 2: อนุญาตให้ลดน้ำหนักหุ้นเดิมได้เยอะ
                    if w < (current_w * 0.2): 
                        penalty += 2.0 
                
                # กฎ 3: ป้องกันทุ่มหมดตัว
                if w > 0.70: 
                    penalty += 5.0

            if sharpe_ratio < orig_sharpe:
                penalty += 10.0

            return fitness_score + penalty

        bounds = [(0, 1) for _ in range(num_assets)]
        result = differential_evolution(
            fitness_function, 
            bounds, 
            strategy='best1bin', 
            maxiter=100,         
            popsize=15,          
            tol=0.01,
            seed=42              
        )

        best_weights = result.x / np.sum(result.x)
        best_return = np.sum(best_weights * mu)
        best_volatility = np.sqrt(np.dot(best_weights.T, np.dot(cov_matrix, best_weights)))
        best_sharpe = best_return / best_volatility
        
        raw_pct = {final_tickers[i]: best_weights[i] * 100 for i in range(num_assets)}
        target_weights_pct = self._round_to_100(raw_pct)
        current_weights_pct = {ticker: round(w * 100, 2) for ticker, w in current_weights_dict.items()}
        
        action_plan = []
        for ticker, target_w in target_weights_pct.items():
            current_w = current_weights_pct.get(ticker, 0.0) 
            delta = target_w - current_w
            
            if delta > 0.1: action = "BUY"
            elif delta < -0.1: action = "SELL"
            else: action = "HOLD"
                
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
            "projected_performance": {
                "original": {
                    "expected_return_pct": round(orig_return * 100, 2),
                    "volatility_pct": round(orig_volatility * 100, 2),
                    "sharpe_ratio": round(orig_sharpe, 2)
                },
                "optimized": {
                    "expected_return_pct": round(best_return * 100, 2),
                    "volatility_pct": round(best_volatility * 100, 2),
                    "sharpe_ratio": round(best_sharpe, 2)
                }
            }
        }