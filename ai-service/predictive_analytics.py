import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import DBSCAN  # type: ignore
from sklearn.ensemble import RandomForestRegressor  # type: ignore
import psycopg2  # type: ignore
from psycopg2.extras import RealDictCursor  # type: ignore
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PredictiveAnalytics:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        if not self.conn or self.conn.closed:
            self.conn = psycopg2.connect(**self.db_config)
        return self.conn
    
    def close_db(self):
        """Close database connection"""
        if self.conn and not self.conn.closed:
            self.conn.close()
    
    def get_historical_issues(self, days=90):
        """Fetch historical issue data"""
        conn = self.connect_db()
        query = """
            SELECT 
                id, type, priority, status, latitude, longitude,
                ward_id, created_at, resolved_at,
                EXTRACT(DOW FROM created_at) as day_of_week,
                EXTRACT(HOUR FROM created_at) as hour_of_day,
                EXTRACT(MONTH FROM created_at) as month
            FROM issues
            WHERE created_at >= NOW() - INTERVAL '%s days'
            ORDER BY created_at
        """
        
        df = pd.read_sql_query(query, conn, params=(days,))
        return df
    
    def identify_hotspots(self, df, eps=0.01, min_samples=3):
        """
        Identify geographic hotspots using DBSCAN clustering
        eps: Maximum distance between points (in degrees, ~1km = 0.01)
        min_samples: Minimum points to form a cluster
        """
        logger.info("Identifying hotspots...")
        
        # Extract coordinates
        coords = df[['latitude', 'longitude']].values
        
        # Apply DBSCAN clustering
        clustering = DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        df['cluster'] = clustering.fit_predict(coords)
        
        # Analyze clusters (excluding noise points labeled -1)
        hotspots = []
        for cluster_id in df[df['cluster'] != -1]['cluster'].unique():
            cluster_data = df[df['cluster'] == cluster_id]
            
            hotspot = {
                'cluster_id': int(cluster_id),
                'center_lat': float(cluster_data['latitude'].mean()) if pd.notna(cluster_data['latitude'].mean()) else 0.0,
                'center_lng': float(cluster_data['longitude'].mean()) if pd.notna(cluster_data['longitude'].mean()) else 0.0,
                'issue_count': len(cluster_data),
                'issue_types': cluster_data['type'].value_counts().to_dict(),
                'priority_breakdown': cluster_data['priority'].value_counts().to_dict(),
                'ward_id': int(cluster_data['ward_id'].mode()[0]) if len(cluster_data['ward_id'].mode()) > 0 else 0,
                'radius_km': float(self._calculate_cluster_radius(cluster_data)),
                'avg_resolution_hours': float(self._calculate_avg_resolution_time(cluster_data))
            }
            hotspots.append(hotspot)
        
        # Sort by issue count
        hotspots = sorted(hotspots, key=lambda x: x['issue_count'], reverse=True)
        
        logger.info(f"Identified {len(hotspots)} hotspots")
        return hotspots
    
    def _calculate_cluster_radius(self, cluster_data):
        """Calculate approximate radius of cluster in km"""
        center_lat = cluster_data['latitude'].mean()
        center_lng = cluster_data['longitude'].mean()
        
        # Haversine distance approximation
        max_distance = 0
        for _, row in cluster_data.iterrows():
            dlat = row['latitude'] - center_lat
            dlng = row['longitude'] - center_lng
            distance = np.sqrt(dlat**2 + dlng**2) * 111  # Rough conversion to km
            max_distance = max(max_distance, distance)
        
        return max_distance
    
    def _calculate_avg_resolution_time(self, cluster_data):
        """Calculate average resolution time in hours"""
        resolved = cluster_data[cluster_data['resolved_at'].notna()]
        if len(resolved) == 0:
            return 0.0  # Return 0 instead of None for type safety
        
        resolution_times = (resolved['resolved_at'] - resolved['created_at']).dt.total_seconds() / 3600
        mean_time = resolution_times.mean()
        return float(mean_time) if pd.notna(mean_time) else 0.0
    
    def predict_future_issues(self, df, forecast_days=7):
        """
        Predict future issue volumes using time series analysis
        """
        logger.info(f"Predicting issues for next {forecast_days} days...")
        
        # Aggregate by day
        df['date'] = pd.to_datetime(df['created_at']).dt.date
        daily_counts = df.groupby(['date', 'type']).size().reset_index(name='count')
        
        predictions = []
        
        for issue_type in df['type'].unique():
            type_data = daily_counts[daily_counts['type'] == issue_type].copy()
            
            if len(type_data) < 7:  # Need minimum data
                continue
            
            # Prepare features
            type_data['day_of_week'] = pd.to_datetime(type_data['date']).dt.dayofweek
            type_data['day_of_month'] = pd.to_datetime(type_data['date']).dt.day
            type_data['week_of_year'] = pd.to_datetime(type_data['date']).dt.isocalendar().week
            
            # Create lag features
            type_data['count_lag1'] = type_data['count'].shift(1)
            type_data['count_lag7'] = type_data['count'].shift(7)
            type_data['rolling_mean_7'] = type_data['count'].rolling(window=7).mean()
            
            # Drop NaN rows
            type_data = type_data.dropna()
            
            if len(type_data) < 5:
                continue
            
            # Train Random Forest model
            features = ['day_of_week', 'day_of_month', 'week_of_year', 'count_lag1', 'count_lag7', 'rolling_mean_7']
            X = type_data[features].values
            y = type_data['count'].values
            
            model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
            model.fit(X, y)
            
            # Generate predictions
            last_date = pd.to_datetime(type_data['date'].max())
            future_predictions = []
            
            for i in range(1, forecast_days + 1):
                future_date = last_date + timedelta(days=i)
                
                # Create feature vector
                future_features = np.array([[
                    future_date.dayofweek,
                    future_date.day,
                    future_date.isocalendar()[1],
                    type_data['count'].iloc[-1] if i == 1 else future_predictions[-1]['predicted_count'],
                    type_data['count'].iloc[-7] if i <= 7 else type_data['count'].iloc[-1],
                    type_data['count'].tail(7).mean()
                ]])
                
                predicted_count = max(0, model.predict(future_features)[0])
                
                future_predictions.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'predicted_count': int(round(predicted_count))
                })
            
            predictions.append({
                'issue_type': issue_type,
                'predictions': future_predictions,
                'confidence': 'medium',  # Could calculate from model metrics
                'historical_avg': float(type_data['count'].mean())
            })
        
        logger.info(f"Generated predictions for {len(predictions)} issue types")
        return predictions
    
    def predict_ward_workload(self, df):
        """
        Predict workload for each ward based on historical patterns
        """
        logger.info("Predicting ward workloads...")
        
        ward_stats = df.groupby('ward_id').agg({
            'id': 'count',
            'latitude': 'first',  # Representative location
            'longitude': 'first'
        }).reset_index()
        
        ward_stats.columns = ['ward_id', 'total_issues', 'latitude', 'longitude']
        
        # Calculate average daily issues per ward
        date_range = (df['created_at'].max() - df['created_at'].min()).days
        ward_stats['avg_daily_issues'] = ward_stats['total_issues'] / max(date_range, 1)
        
        # Predict next 7 days workload
        ward_stats['predicted_weekly_issues'] = (ward_stats['avg_daily_issues'] * 7).round().astype(int)
        
        # Calculate priority distribution
        priority_dist = df.groupby('ward_id')['priority'].value_counts(normalize=True).unstack(fill_value=0)
        ward_stats = ward_stats.merge(priority_dist, left_on='ward_id', right_index=True, how='left')
        
        workload_predictions = []
        for _, row in ward_stats.iterrows():
            workload_predictions.append({
                'ward_id': int(row['ward_id']),
                'predicted_weekly_issues': int(row['predicted_weekly_issues']),
                'avg_daily_issues': float(row['avg_daily_issues']),
                'priority_distribution': {
                    'high': float(row.get('high', 0)),
                    'medium': float(row.get('medium', 0)),
                    'low': float(row.get('low', 0))
                },
                'location': {
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude'])
                }
            })
        
        return sorted(workload_predictions, key=lambda x: x['predicted_weekly_issues'], reverse=True)
    
    def analyze_seasonal_patterns(self, df):
        """
        Analyze seasonal and temporal patterns
        """
        logger.info("Analyzing seasonal patterns...")
        
        patterns = {
            'by_month': df.groupby('month')['id'].count().to_dict(),
            'by_day_of_week': df.groupby('day_of_week')['id'].count().to_dict(),
            'by_hour': df.groupby('hour_of_day')['id'].count().to_dict(),
            'by_type_and_month': df.groupby(['type', 'month']).size().to_dict()
        }
        
        # Find peak times
        patterns['peak_day'] = int(df['day_of_week'].mode()[0])
        patterns['peak_hour'] = int(df['hour_of_day'].mode()[0])
        patterns['peak_month'] = int(df['month'].mode()[0])
        
        return patterns
    
    def generate_analytics_report(self, output_file='analytics_report.json'):
        """
        Generate comprehensive predictive analytics report
        """
        logger.info("Generating analytics report...")
        
        # Fetch data
        df = self.get_historical_issues(days=90)
        
        if len(df) == 0:
            logger.warning("No historical data available")
            return None
        
        # Run all analytics
        report = {
            'generated_at': datetime.now().isoformat(),
            'data_period_days': 90,
            'total_issues_analyzed': len(df),
            'hotspots': self.identify_hotspots(df),
            'future_predictions': self.predict_future_issues(df, forecast_days=7),
            'ward_workload': self.predict_ward_workload(df),
            'seasonal_patterns': self.analyze_seasonal_patterns(df)
        }
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to {output_file}")
        return report

if __name__ == '__main__':
    import os
    
    # Database configuration
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', 5432),
        'database': os.getenv('DB_NAME', 'civic_issues'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }
    
    # Initialize analytics
    analytics = PredictiveAnalytics(db_config)
    
    try:
        # Generate report
        report = analytics.generate_analytics_report()
        
        if report:
            logger.info("Analytics report generated successfully")
            logger.info(f"Found {len(report['hotspots'])} hotspots")
            logger.info(f"Generated predictions for {len(report['future_predictions'])} issue types")
    finally:
        analytics.close_db()
