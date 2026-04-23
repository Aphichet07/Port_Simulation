import pandas as pd

class MarketContextEngine:
    def __init__(self, forecast_data_path):
        print("โหลด Context Engine (Macro & VIX)...")
        self.df_macro = pd.read_csv(forecast_data_path)
        
        if 'Date' in self.df_macro.columns:
            self.df_macro['Date'] = pd.to_datetime(self.df_macro['Date'])

    def analyze_current_regime(self):
        """
        วิเคราะห์สภาวะตลาดล่าสุด เพื่อกำหนดโหมด (Regime) และสไตล์หุ้นที่อนุญาต
        """
        # ดึงข้อมูลวันล่าสุด 
        latest_data = self.df_macro.sort_values('Date').iloc[-1]
        
        current_date = latest_data['Date'].strftime('%Y-%m-%d')
        vix_current = latest_data.get('VIX_Index', 20) 
        cpi_current = latest_data.get('CPI_Inflation', 0)
        
        print(f"\nวิเคราะห์สภาวะตลาดล่าสุด (ณ วันที่ {current_date}):")
        print(f"   > VIX Index: {vix_current:.2f}")
        print(f"   > CPI เงินเฟ้อ: {cpi_current:.2f}") 
        
        # Regime Rule-based
        if vix_current >= 25:
            regime = "Risk-Off"
            description = "ตลาดอยู่ในภาวะหวาดกลัว (Panic) / ความผันผวนสูง"
            allowed_styles = ['Defensive', 'Value'] 
            
        elif vix_current <= 15:
            regime = "Risk-On"
            description = "ตลาดคึกคัก (Greed) / นักลงทุนกล้าเสี่ยง"
            allowed_styles = ['Growth', 'Value', 'Defensive']
            
        else:
            regime = "Neutral"
            description = "ตลาดอยู่ในสภาวะปกติ (Sideway / Cautious)"
            allowed_styles = ['Value', 'Defensive', 'Growth'] 
            
        print(f"สรุปสภาวะตลาด: [{regime}] {description}")
        print(f"สไตล์หุ้นที่อนุญาตให้ระบบแนะนำ: {allowed_styles}\n")
        
        return {
            'regime': regime,
            'vix_index': vix_current,
            'allowed_styles': allowed_styles
        }
        
