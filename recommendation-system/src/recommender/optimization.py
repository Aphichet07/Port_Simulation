import pandas as pd
import numpy as np
from scipy.optimize import differential_evolution

class PortfolioOptimizer:
    def __init__(self, risk_data_path, risk_free_rate=0.02):
        # เพิ่ม Risk-Free rate (สมมติที่ 2% ต่อปี สำหรับคำนวณ Sharpe ให้ถูกต้อง)
        self.df_risk = pd.read_csv(risk_data_path)
        self.risk_free_rate = risk_free_rate
        if 'Date' in self.df_risk.columns:
            self.df_risk.set_index('Date', inplace=True)

    def _round_to_100(self, weights_dict):
        # Helper function ของคุณทำงานได้ดีแล้ว เป็นการจัดการ Integer constraints ตอนจบ
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

        # คำนวณน้ำหนักตั้งต้น
        original_weights = np.zeros(num_assets)
        for i, ticker in enumerate(final_tickers):
            if ticker in current_weights_dict:
                original_weights[i] = current_weights_dict[ticker]
                
        total_orig = np.sum(original_weights)
        if total_orig > 0:
            original_weights = original_weights / total_orig

        # FIX 2: ปรับสูตร Sharpe Ratio ตั้งต้น ให้หักลบ Risk Free Rate
        orig_return = np.sum(original_weights * mu)
        orig_volatility = np.sqrt(np.dot(original_weights.T, np.dot(cov_matrix, original_weights)))
        orig_sharpe = (orig_return - self.risk_free_rate) / orig_volatility if orig_volatility > 0 else 0

        # Objective Function สำหรับ Evolutionary Algorithm
        def fitness_function(weights):
            # Normalize ให้ผลรวมเท่ากับ 1 (Repair Mechanism)
            weights = weights / np.sum(weights)
            
            port_return = np.sum(weights * mu)
            port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            
            # FIX 2: ปรับสูตร Sharpe ใน Fitness 
            sharpe_ratio = (port_return - self.risk_free_rate) / port_volatility if port_volatility > 0 else 0
            
            # เราต้องการ Maximize Sharpe แต่ scipy DE เป็น Minimizer จึงต้องใส่เครื่องหมายลบ
            fitness_score = -sharpe_ratio 
            
            penalty = 0
            for i, ticker in enumerate(final_tickers):
                w = weights[i]
                
                # ข้อจำกัดที่ 1: Minimum Weight Constraint (กันพอร์ตเบี้ยหัวแตก)
                if 0 < w < 0.01: 
                    penalty += 2.0 # ปรับ Penalty ให้แรงพอที่จะข้ามพ้น -Sharpe ที่เพิ่มขึ้น
                    
                if ticker in current_weights_dict:
                    current_w = current_weights_dict[ticker]
                    # ข้อจำกัดที่ 2: Turnover Constraint
                    if w < (current_w * 0.2): 
                        penalty += 2.0 
                
                # ข้อจำกัดที่ 3: Maximum Weight Constraint
                if w > 0.70: 
                    penalty += 5.0

            # ข้อจำกัดที่ 4: Performance Constraint
            if sharpe_ratio < orig_sharpe:
                penalty += 10.0

            return fitness_score + penalty

        # ตัวแปรควบคุม Bounds ของ DE
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

        # ดึงคำตอบที่ดีที่สุดและ Normalize อีกครั้งเพื่อให้ชัวร์
        best_weights = result.x / np.sum(result.x)
        best_return = np.sum(best_weights * mu)
        best_volatility = np.sqrt(np.dot(best_weights.T, np.dot(cov_matrix, best_weights)))
        best_sharpe = (best_return - self.risk_free_rate) / best_volatility
        
        # แปลงเป็น % แบบจำนวนเต็ม
        raw_pct = {final_tickers[i]: best_weights[i] * 100 for i in range(num_assets)}
        target_weights_pct = self._round_to_100(raw_pct)
        current_weights_pct = {ticker: round(w * 100, 2) for ticker, w in current_weights_dict.items()}
        
        # สร้าง Rebalancing Plan
        action_plan = []
        filtered_target_weights = {} # สร้าง dict ใหม่เพื่อเก็บเฉพาะตัวที่ผ่านเงื่อนไข

        for ticker, target_w in target_weights_pct.items():
            current_w = current_weights_pct.get(ticker, 0.0) 
            delta = target_w - current_w
            
            # กำหนด Action
            if delta > 0.1: action = "BUY"
            elif delta < -0.1: action = "SELL"
            else: action = "HOLD"

            # Logic การกรอง: 
            # ถ้าเป้าหมายคือ 0% และเราไม่ได้ถือหุ้นตัวนี้อยู่เลย (0%) ให้ข้ามไปเลย ไม่ต้องโชว์
            if target_w == 0 and current_w == 0.0:
                continue
                
            # ถ้าผ่านเงื่อนไขด้านบนมาได้ ให้เก็บลง dict และ action_plan
            filtered_target_weights[ticker] = target_w
            action_plan.append({
                "ticker": ticker,
                "current_weight_pct": current_w,
                "target_weight_pct": target_w,
                "adjustment_pct": round(delta, 2),
                "action": action
            })
            
        return {
            "target_weights_pct": filtered_target_weights, # เปลี่ยนมาใช้ตัวที่กรองแล้ว
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