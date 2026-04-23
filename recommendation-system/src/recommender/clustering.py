import numpy as np 
import pandas as pd
import os
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.cluster import KMeans

class Clustering:
    def __init__(self, n_clusters=3):
        # กำหนดจำนวนกลุ่มเริ่มต้นที่ 3 (Growth, Value, Defensive)
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.n_growth = 0
        self.n_value = 0
        self.n_defensive = 0
        self.n_mixed = 0
        
    def fit_and_label(self, csv_path):
        """อ่านข้อมูล จัดกลุ่ม และวิเคราะห์เพื่อแปะป้ายชื่อให้แต่ละ Cluster"""
        print(f"กำลังโหลดข้อมูลจาก {csv_path}...")
        df = pd.read_csv(csv_path)
        
        features = ['PE_Ratio', 'PBV_Ratio', 'Beta', 'ROE', 'Debt_to_Equity']
        features = [f for f in features if f in df.columns]
        
        if not features:
            raise ValueError("ไม่พบคอลัมน์ Features สำหรับทำ Clustering")

        # ให้ K-Means จัดกลุ่ม
        print(f"กำลังรัน K-Means แบ่งหุ้นเป็น {self.n_clusters} กลุ่ม...")
        df['Cluster'] = self.model.fit_predict(df[features])
        
        # วิเคราะห์ค่าเฉลี่ย Centroids ของแต่ละกลุ่ม
        # ค่า > 0 คือสูงกว่าค่าเฉลี่ยตลาด, ค่า < 0 คือต่ำกว่าค่าเฉลี่ยตลาด
        cluster_summary = df.groupby('Cluster')[features].mean()
        
        print("\nZ-score ของแต่ละกลุ่ม:")
        print(cluster_summary.round(2))
        
        # Auto-Labeling
        cluster_labels = {}
        
        #  Growth ค่า P/E สูงที่สุดในตลาด
        growth_cluster = cluster_summary['PE_Ratio'].idxmax()
        cluster_labels[growth_cluster] = 'Growth'
        
        remaining_clusters = cluster_summary.index.drop(growth_cluster)
        
        # Defensive ผันผวนต่ำสุด
        defensive_cluster = cluster_summary.loc[remaining_clusters, 'Beta'].idxmin()
        cluster_labels[defensive_cluster] = 'Defensive'
        
        remaining_clusters = remaining_clusters.drop(defensive_cluster)
        
        # Value ของถูกสุด P/E หรือ P/BV ต่ำสุด
        if len(remaining_clusters) > 0:
            value_cluster = cluster_summary.loc[remaining_clusters, 'PE_Ratio'].idxmin()
            cluster_labels[value_cluster] = 'Value'
            
            remaining_clusters = remaining_clusters.drop(value_cluster)
        
        # Mixed/Neutral 
        for idx in remaining_clusters:
            cluster_labels[idx] = 'Mixed/Neutral'
            
        df['Style_Label'] = df['Cluster'].map(cluster_labels)
        
        print("\nสรุปจำนวนหุ้นในแต่ละสไตล์:")
        print(df['Style_Label'].value_counts())
        
        return df, cluster_summary
    
if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent
    input_file = BASE_DIR.parent.parent / "data" / "processed" / "recommendation_features.csv"
    
    clustering_engine = Clustering(n_clusters=3)
    
    try:
        df_clustered, summary = clustering_engine.fit_and_label(input_file)
        
        print("\nตัวอย่างหุ้นกลุ่ม Growth:")
        print(df_clustered[df_clustered['Style_Label'] == 'Growth'][['Ticker', 'PE_Ratio', 'Style_Label']].head())
        
        print("\nตัวอย่างหุ้นกลุ่ม Value:")
        print(df_clustered[df_clustered['Style_Label'] == 'Value'][['Ticker', 'PE_Ratio', 'Style_Label']].head())
        
        print("\nตัวอย่างหุ้นกลุ่ม Defensive:")
        print(df_clustered[df_clustered['Style_Label'] == 'Defensive'][['Ticker', 'PE_Ratio', 'Style_Label']].head())
        
    except FileNotFoundError:
        print("ไม่พบไฟล์ กรุณารัน FeatureEngineering เพื่อสร้าง recommendation_features.csv ก่อนครับ")