import pandas as pd
import numpy as np

class RiskModelEngine:
    def __init__(self, risk_data_path):
        print("โหลด Risk Engine...")
        self.df_risk = pd.read_csv(risk_data_path)
        
        if 'Date' in self.df_risk.columns:
            self.df_risk.set_index('Date', inplace=True)

    def calculate_diversification_score(self, current_portfolio, candidate_tickers, top_n=5):
        """
        คำนวณความสัมพันธ์ (Correlation) ระหว่างหุ้นในพอร์ต กับ หุ้น Candidate
        ยิ่งค่าน้อย (ติดลบ) ยิ่งดี เพราะแปลว่าคานความเสี่ยงกันได้
        """
        print(f"   > สแกนหาจิ๊กซอว์จาก Candidate {len(candidate_tickers)} ตัว...")
        
        valid_portfolio = [t for t in current_portfolio if t in self.df_risk.columns]
        valid_candidates = [t for t in candidate_tickers if t in self.df_risk.columns]
        
        if not valid_portfolio:
            print("หุ้นในพอร์ตเดิมของคุณไม่มีข้อมูลในระบบ")
            return valid_candidates[:top_n], pd.DataFrame()

        # คำนวณ Correlation Matrix เฉพาะกลุ่ม
        target_columns = list(set(valid_portfolio + valid_candidates))
        corr_matrix = self.df_risk[target_columns].corr()

        # ให้คะแนน Candidate แต่ละตัว
        candidate_scores = []
        for cand in valid_candidates:
            # หาค่าความสัมพันธ์เฉลี่ย ของ Candidate 1 ตัว เทียบกับทุกตัวในพอร์ตเดิม
            avg_corr = corr_matrix.loc[cand, valid_portfolio].mean()
            candidate_scores.append({
                'Ticker': cand, 
                'Risk_Score (Corr)': avg_corr
            })
            
        df_scores = pd.DataFrame(candidate_scores)
        
        # จัดอันดับ เรียงจากความสัมพันธ์ต่ำสุดไปสูงสุด
        df_scores = df_scores.sort_values(by='Risk_Score (Corr)', ascending=True).reset_index(drop=True)
        
        best_tickers = df_scores.head(top_n)['Ticker'].tolist()
        best_scores_df = df_scores.head(top_n)
        
        return best_tickers, best_scores_df