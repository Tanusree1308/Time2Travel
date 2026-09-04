import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "time2travel_real_ml_dataset.csv"
OUTPUT_PATH = BASE_DIR / "data" / "time2travel_ml_final.csv"

print("Loading final ML dataset...")

df = pd.read_csv(DATA_PATH)

print("Rows:", len(df))


# --------------------------------------------------
# 1. NORMALIZE HISTORICAL TOURISM LEVEL
# --------------------------------------------------

min_value = df["historical_tourism_index"].min()
max_value = df["historical_tourism_index"].max()

if max_value != min_value:
    df["historical_level"] = (
        (df["historical_tourism_index"] - min_value)
        / (max_value - min_value)
    )
else:
    df["historical_level"] = 0.5


# --------------------------------------------------
# 2. START WITH BASE CROWD PRESSURE
# --------------------------------------------------

df["crowd_pressure"] = (
    35
    + (df["historical_level"] * 25)
)


# --------------------------------------------------
# 3. WEEKEND EFFECT
# --------------------------------------------------

df["crowd_pressure"] += (
    df["weekend"] * 15
)


# --------------------------------------------------
# 4. SCHOOL HOLIDAY EFFECT
# --------------------------------------------------

df["crowd_pressure"] += (
    df["school_holiday"] * 10
)


# --------------------------------------------------
# 5. PUBLIC HOLIDAY EFFECT
# --------------------------------------------------

df["crowd_pressure"] += (
    df["holiday"] * 12
)


# --------------------------------------------------
# 6. LOCAL EVENT EFFECT
# --------------------------------------------------

df["crowd_pressure"] += (
    df["local_event"] * 15
)


# --------------------------------------------------
# 7. TIME-OF-DAY EFFECT
# --------------------------------------------------

# Morning generally receives a smaller crowd
df.loc[df["morning"] == 1, "crowd_pressure"] += 0

# Afternoon receives moderate crowd
df.loc[df["afternoon"] == 1, "crowd_pressure"] += 5

# Evening can have higher recreational traffic
df.loc[df["evening"] == 1, "crowd_pressure"] += 8


# --------------------------------------------------
# 8. RAINFALL EFFECT
# --------------------------------------------------

# Rain can reduce outdoor tourist visits.
# Cap the effect so extreme rainfall doesn't dominate.

rain_effect = (
    df["rainfall_mm"]
    .clip(lower=0, upper=20)
    / 20
) * 15

df["crowd_pressure"] -= rain_effect


# --------------------------------------------------
# 9. LIMIT INDEX TO 0-100
# --------------------------------------------------

df["footfall_index"] = (
    df["crowd_pressure"]
    .clip(lower=0, upper=100)
    .round(2)
)


# --------------------------------------------------
# 10. CROWD CATEGORY
# --------------------------------------------------

def crowd_category(value):

    if value <= 30:
        return "Very Low"

    elif value <= 50:
        return "Low"

    elif value <= 70:
        return "Moderate"

    elif value <= 85:
        return "High"

    else:
        return "Very High"


df["crowd_level"] = (
    df["footfall_index"]
    .apply(crowd_category)
)


# --------------------------------------------------
# 11. RECOMMENDED WINDOW
# --------------------------------------------------

def get_window(hour):

    if hour == 9:
        return "9 AM - 11 AM"

    elif hour == 12:
        return "12 PM - 2 PM"

    elif hour == 15:
        return "3 PM - 5 PM"

    elif hour == 18:
        return "6 PM - 8 PM"

    return "Unknown"


df["time_window"] = (
    df["hour"].apply(get_window)
)


# --------------------------------------------------
# 12. REMOVE INTERMEDIATE COLUMNS
# --------------------------------------------------

df = df.drop(
    columns=[
        "historical_level",
        "crowd_pressure"
    ]
)


# --------------------------------------------------
# 13. SAVE FINAL ML DATASET
# --------------------------------------------------

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# --------------------------------------------------
# 14. RESULTS
# --------------------------------------------------

print()
print("-----------------------------")
print("FINAL ML TARGET CREATED")
print("-----------------------------")

print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Places:", df["place"].nunique())

print()
print("Crowd distribution:")
print(df["crowd_level"].value_counts())

print()
print("Footfall range:")
print(
    df["footfall_index"].min(),
    "to",
    df["footfall_index"].max()
)

print()
print("Saved to:")
print(OUTPUT_PATH)

print()
print(df.head())