from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import pandas as pd
import joblib


# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

DATA_DIR = BASE_DIR / "data"

WEATHER_DIR = DATA_DIR / "weather"

HOLIDAY_FILE = DATA_DIR / "holidays_festivals_clean.csv"

SCHOOL_FILE = DATA_DIR / "school_holidays_clean.csv"

EVENT_FILE = DATA_DIR / "local_events_clean.csv"

HISTORICAL_FILE = DATA_DIR / "historical_tourist_visits_clean.csv"


# ==================================================
# FASTAPI
# ==================================================

app = FastAPI(
    title="Time2Travel API",
    version="3.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==================================================
# LOAD ML MODEL
# ==================================================

print("Loading Time2Travel ML model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")


# ==================================================
# LOAD DATASETS
# ==================================================

print("Loading Time2Travel datasets...")


# Historical tourism
historical_df = pd.read_csv(HISTORICAL_FILE)


# Government holidays
holiday_df = pd.read_csv(HOLIDAY_FILE)


# School holidays
school_df = pd.read_csv(SCHOOL_FILE)


# Local events
event_df = pd.read_csv(EVENT_FILE)


# ==================================================
# WEATHER DATA
# ==================================================

weather_files = list(
    WEATHER_DIR.glob("clean_*.csv")
)

weather_frames = []

for file in weather_files:

    try:

        temp = pd.read_csv(file)

        weather_frames.append(temp)

        print(
            "Loaded weather:",
            file.name,
            len(temp),
            "rows"
        )

    except Exception as error:

        print(
            "Could not load weather file:",
            file.name,
            error
        )


if weather_frames:

    weather_df = pd.concat(
        weather_frames,
        ignore_index=True
    )

else:

    weather_df = pd.DataFrame()


print(
    "Weather rows:",
    len(weather_df)
)


# ==================================================
# DATE CLEANING
# ==================================================

if "date" in holiday_df.columns:

    holiday_df["date"] = pd.to_datetime(
        holiday_df["date"],
        errors="coerce"
    )


if "date" in school_df.columns:

    school_df["date"] = pd.to_datetime(
        school_df["date"],
        errors="coerce"
    )


if "start_date" in event_df.columns:

    event_df["start_date"] = pd.to_datetime(
        event_df["start_date"],
        errors="coerce"
    )


if "end_date" in event_df.columns:

    event_df["end_date"] = pd.to_datetime(
        event_df["end_date"],
        errors="coerce"
    )


if "year" in historical_df.columns:

    historical_df["year"] = pd.to_numeric(
        historical_df["year"],
        errors="coerce"
    )


# ==================================================
# PREDICTION REQUEST
# ==================================================

class PredictionRequest(BaseModel):

    date: str

    hour: int

    place: str

    state: str

    district: str

    category: str


# ==================================================
# HELPER:
# HISTORICAL TOURISM INDEX
# ==================================================

def get_historical_index(state, date):

    year = date.year

    state_data = historical_df[
        historical_df["state"]
        .str.lower()
        ==
        state.lower()
    ]

    if state_data.empty:

        return 0

    # Prefer matching year
    year_data = state_data[
        state_data["year"] == year
    ]

    if not year_data.empty:

        value = year_data.iloc[0][
            "total_visitors"
        ]

        return float(value)

    # Otherwise use latest available year
    latest = state_data.sort_values(
        "year"
    ).iloc[-1]

    return float(
        latest["total_visitors"]
    )


# ==================================================
# HELPER:
# SCHOOL HOLIDAY
# ==================================================

def get_school_holiday(state, date):

    if school_df.empty:

        return 0

    rows = school_df[
        (
            school_df["state"]
            .str.lower()
            ==
            state.lower()
        )
        &
        (
            school_df["date"] == date
        )
    ]

    if rows.empty:

        return 0

    return int(
        rows["school_holiday"]
        .max()
    )


# ==================================================
# HELPER:
# PUBLIC HOLIDAY
# ==================================================

def get_public_holiday(state, date):

    if holiday_df.empty:

        return 0

    rows = holiday_df[
        (
            holiday_df["state"]
            .str.lower()
            ==
            state.lower()
        )
        &
        (
            holiday_df["date"] == date
        )
    ]

    if rows.empty:

        return 0

    return int(
        rows["holiday"]
        .max()
    )


# ==================================================
# HELPER:
# LOCAL EVENT
# ==================================================

def get_local_event(state, date):

    if event_df.empty:

        return 0

    rows = event_df[
        (
            event_df["state"]
            .str.lower()
            ==
            state.lower()
        )
        &
        (
            event_df["start_date"]
            <= date
        )
        &
        (
            event_df["end_date"]
            >= date
        )
    ]

    if rows.empty:

        return 0

    return 1


# ==================================================
# HELPER:
# WEATHER
# ==================================================

def get_rainfall(state, date, hour):

    if weather_df.empty:

        return 0.0

    if "date" not in weather_df.columns:

        return 0.0

    weather_df["date"] = pd.to_datetime(
        weather_df["date"],
        errors="coerce"
    )

    rows = weather_df[
        (
            weather_df["State"]
            .str.lower()
            ==
            state.lower()
        )
        &
        (
            weather_df["date"].dt.date
            == date.date()
        )
    ]

    if rows.empty:

        return 0.0

    if "hour" in rows.columns:

        hour_rows = rows[
            rows["hour"] == hour
        ]

        if not hour_rows.empty:

            rows = hour_rows

    if "rainfall_mm" not in rows.columns:

        return 0.0

    rainfall = pd.to_numeric(
        rows["rainfall_mm"],
        errors="coerce"
    ).fillna(0)

    return float(
        rainfall.mean()
    )


# ==================================================
# PREDICT
# ==================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    date = pd.to_datetime(
        request.date
    )

    day = date.day_name()

    # ----------------------------------------------
    # DATASET LOOKUPS
    # ----------------------------------------------

    historical_index = (
        get_historical_index(
            request.state,
            date
        )
    )

    school_holiday = (
        get_school_holiday(
            request.state,
            date
        )
    )

    public_holiday = (
        get_public_holiday(
            request.state,
            date
        )
    )

    local_event = (
        get_local_event(
            request.state,
            date
        )
    )

    rainfall = (
        get_rainfall(
            request.state,
            date,
            request.hour
        )
    )

    # ----------------------------------------------
    # TIME FLAGS
    # ----------------------------------------------

    weekend = (
        1
        if day in ["Saturday", "Sunday"]
        else 0
    )

    morning = (
        1
        if 9 <= request.hour < 12
        else 0
    )

    afternoon = (
        1
        if 12 <= request.hour < 17
        else 0
    )

    evening = (
        1
        if 17 <= request.hour <= 20
        else 0
    )

    rain_probability_proxy = (
        1
        if rainfall > 0
        else 0
    )

    # ----------------------------------------------
    # CREATE MODEL INPUT
    # ----------------------------------------------

    input_data = pd.DataFrame([
        {
            "day_of_week": day,

            "hour": request.hour,

            "place": request.place,

            "state": request.state,

            "district": request.district,

            "category": request.category,

            "historical_tourism_index":
                historical_index,

            "weekend":
                weekend,

            "rainfall_mm":
                rainfall,

            "school_holiday":
                school_holiday,

            "holiday":
                public_holiday,

            "local_event":
                local_event,

            "rain_probability_proxy":
                rain_probability_proxy,

            "morning":
                morning,

            "afternoon":
                afternoon,

            "evening":
                evening
        }
    ])

    # ----------------------------------------------
    # ML PREDICTION
    # ----------------------------------------------

    predicted = model.predict(
        input_data
    )[0]

    predicted = round(
        float(predicted)
    )

    predicted = max(
        0,
        min(100, predicted)
    )

    # ----------------------------------------------
    # CROWD LEVEL
    # ----------------------------------------------

    if predicted <= 30:

        crowd_level = "Very Low"

    elif predicted <= 50:

        crowd_level = "Low"

    elif predicted <= 70:

        crowd_level = "Moderate"

    elif predicted <= 85:

        crowd_level = "High"

    else:

        crowd_level = "Very High"

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return {

        "place":
            request.place,

        "state":
            request.state,

        "district":
            request.district,

        "date":
            request.date,

        "day":
            day,

        "hour":
            request.hour,

        "predicted_footfall_index":
            predicted,

        "crowd_level":
            crowd_level,

        # These prove that the backend
        # actually used the datasets.

        "signals": {

            "historical_tourism_index":
                historical_index,

            "rainfall_mm":
                rainfall,

            "school_holiday":
                school_holiday,

            "public_holiday":
                public_holiday,

            "local_event":
                local_event,

            "weekend":
                weekend
        }
    }


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():

    return {
        "message":
            "Time2Travel API is running!",

        "version":
            "3.0"
    }