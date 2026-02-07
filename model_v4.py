import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from pyproj import Transformer
from scipy.spatial import cKDTree
import joblib

# --- 1. LOAD DATASETS ---
print("Loading datasets...")
try:
    on_street = pd.read_csv('on-street-parking-bay-sensors.csv')
    off_street = pd.read_csv('off-street-car-parks-with-capacity-and-type.csv')
    traffic = pd.read_csv('Traffic_Lights.csv')
    landmarks = pd.read_csv('landmarks-and-places-of-interest-including-schools-theatres-health-services-spor.csv')
    pedestrian = pd.read_csv('pedestrian-counting-system-sensor-locations.csv')
except FileNotFoundError:
    print("Error: Missing CSV files. Please ensure all 5 files are in the folder.")
    exit()

# --- 2. CLEAN ON-STREET (The "Target") ---
print("Cleaning On-Street Data...")
on_street = on_street.dropna(subset=['zone_number', 'location'])
# Fix Location: "-37.8, 144.9" -> Lat, Lon
on_street[['Latitude', 'Longitude']] = on_street['location'].str.replace('"', '').str.split(',', expand=True).astype(float)

# Fix Time
on_street['status_timestamp'] = pd.to_datetime(on_street['status_timestamp'])
on_street['Hour'] = on_street['status_timestamp'].dt.hour
on_street['DayOfWeek'] = on_street['status_timestamp'].dt.dayofweek
on_street['Is_Weekend'] = on_street['DayOfWeek'].apply(lambda x: 1 if x >= 5 else 0)

# Create Target: 1 if Present, 0 if Unoccupied
on_street['is_occupied'] = on_street['status_description'].apply(lambda x: 1 if x == 'Present' else 0)

# --- 3. CLEAN OFF-STREET (The "Backup Plan") ---
print("Cleaning Off-Street Data...")
off_street = off_street.dropna(subset=['Latitude', 'Longitude', 'Parking spaces'])
off_street_coords = off_street[['Latitude', 'Longitude']].values
off_street_cap = off_street['Parking spaces'].values

# --- 4. CLEAN TRAFFIC (The "Congestion") ---
print("Cleaning Traffic Data (Converting Coordinates)...")
# Convert VicGrid94 (EPSG:3111) to Lat/Lon (EPSG:4326)
transformer = Transformer.from_crs("epsg:3111", "epsg:4326", always_xy=True)
t_lon, t_lat = transformer.transform(traffic['X'].values, traffic['Y'].values)
traffic['Latitude'] = t_lat
traffic['Longitude'] = t_lon
traffic = traffic.dropna(subset=['Latitude', 'Longitude'])
traffic_coords = traffic[['Latitude', 'Longitude']].values

# --- 5. CLEAN LANDMARKS & PEDESTRIAN (The "Crowds") ---
print("Cleaning Landmarks & Pedestrian Data...")
landmarks = landmarks.dropna(subset=['co_ordinates'])
landmarks[['Lat', 'Lon']] = landmarks['co_ordinates'].str.replace('"', '').str.split(',', expand=True).astype(float)
landmarks_coords = landmarks[['Lat', 'Lon']].values

pedestrian = pedestrian.dropna(subset=['Latitude', 'Longitude'])
pedestrian_coords = pedestrian[['Latitude', 'Longitude']].values

# --- 6. SPATIAL FUSION (The "Hard Part") ---
print("Merging Datasets (Calculating Distances)...")

def get_nearest_distance(target_coords, feature_coords):
    tree = cKDTree(feature_coords)
    # Query nearest 1 neighbor for every point
    dists, _ = tree.query(target_coords, k=1) 
    return dists # Returns distance in degrees (approx)

target_coords = on_street[['Latitude', 'Longitude']].values

# Calculate distances
on_street['Dist_OffStreet'] = get_nearest_distance(target_coords, off_street_coords)
on_street['Dist_Traffic'] = get_nearest_distance(target_coords, traffic_coords)
on_street['Dist_Landmark'] = get_nearest_distance(target_coords, landmarks_coords)
on_street['Dist_Pedestrian'] = get_nearest_distance(target_coords, pedestrian_coords)

# --- 7. TRAIN MODEL ---
print("Training Model on Merged Data...")
features = ['Hour', 'DayOfWeek', 'Is_Weekend', 'Latitude', 'Longitude', 
            'Dist_OffStreet', 'Dist_Traffic', 'Dist_Landmark', 'Dist_Pedestrian']

X = on_street[features]
y = on_street['is_occupied']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

acc = model.score(X_test, y_test)
print(f"Model Accuracy: {acc*100:.2f}%")

# --- 8. SAVE ASSETS ---
joblib.dump(model, 'model_v4.pkl')
# Save feature scaler to normalize distances in the App later
scaler = MinMaxScaler()
scaler.fit(on_street[['Dist_OffStreet', 'Dist_Traffic', 'Dist_Landmark', 'Dist_Pedestrian']])
joblib.dump(scaler, 'distance_scaler.pkl')

print("Model and Scaler Saved!")