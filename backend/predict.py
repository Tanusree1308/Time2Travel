import joblib
import pandas as pd
from pathlib import Path

# Find model
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

print("Loading trained model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")
print()


# Example input
data = pd.DataFrame([
    {
        "day_of_week": "Tuesday",
        "hour": 15,
        "place": "Kondapalli Fort",
        "category": "Fort",
        "temperature_c": 28.0,
        "rain_probability_pct": 10.0,
        "school_holiday": 0,
        "local_festival": 0,
        "historical_footfall_index": 55,
        "weekend": 0
    }
])


# Predict
prediction = model.predict(data)

print("-----------------------------")
print("TIME2TRAVEL PREDICTION")
print("-----------------------------")

print("Place:", data["place"].iloc[0])
print("Day:", data["day_of_week"].iloc[0])
print("Time:", data["hour"].iloc[0], ":00")

print("Predicted Footfall Index:", round(prediction[0], 2))