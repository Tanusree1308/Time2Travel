import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

OUTPUT_PATH = DATA_DIR / "time2travel_real_ml_dataset.csv"

print("Building final ML dataset...")

# --------------------------------------------------
# 1. TOURIST PLACES
# --------------------------------------------------

places = pd.read_csv(
    DATA_DIR / "tourist_places_ap_telangana.csv"
)

print("Tourist places:", len(places))


# --------------------------------------------------
# 2. HISTORICAL TOURIST VISITS
# --------------------------------------------------

visits = pd.read_csv(
    DATA_DIR / "historical_tourist_visits_clean.csv"
)

# State-level historical tourism signal.
# This is NOT treated as a place-level visitor count.

state_average = (
    visits.groupby("state")["total_visitors"]
    .mean()
    .to_dict()
)

places["historical_tourism_index"] = (
    places["state"].map(state_average)
)


# --------------------------------------------------
# 3. CREATE DATE + TIME SLOTS
# --------------------------------------------------

dates = pd.date_range(
    start="2026-01-01",
    end="2026-12-31",
    freq="D"
)

time_slots = [
    9,
    12,
    15,
    18
]

rows = []

for _, place in places.iterrows():

    for date in dates:

        for hour in time_slots:

            rows.append({
                "date": date,
                "day_of_week": date.day_name(),
                "hour": hour,

                "place": place["place"],
                "state": place["state"],
                "district": place["district"],
                "category": place["category"],

                "historical_tourism_index":
                    place["historical_tourism_index"]
            })


df = pd.DataFrame(rows)

print("Base rows created:", len(df))


# --------------------------------------------------
# 4. WEEKEND SIGNAL
# --------------------------------------------------

df["weekend"] = (
    df["day_of_week"]
    .isin(["Saturday", "Sunday"])
    .astype(int)
)


# --------------------------------------------------
# 5. WEATHER SIGNAL
# --------------------------------------------------

weather_files = list(
    (DATA_DIR / "weather").glob("clean_*.csv")
)

weather_parts = []

for file in weather_files:

    print("Reading weather:", file.name)

    weather = pd.read_csv(file)

    weather["date"] = pd.to_datetime(
        weather["date"],
        errors="coerce"
    )

    weather["hour"] = pd.to_numeric(
        weather["hour"],
        errors="coerce"
    )

    weather["rainfall_mm"] = pd.to_numeric(
        weather["rainfall_mm"],
        errors="coerce"
    )

    weather = weather.dropna(
        subset=["date", "hour"]
    )

    weather_parts.append(
        weather[
            ["date", "hour", "State", "rainfall_mm"]
        ]
    )


if weather_parts:

    weather = pd.concat(
        weather_parts,
        ignore_index=True
    )

    # Average rainfall by state/date/hour
    weather = (
        weather
        .groupby(
            ["date", "hour", "State"],
            as_index=False
        )["rainfall_mm"]
        .mean()
    )

    weather = weather.rename(
        columns={"State": "state"}
    )

    df = df.merge(
        weather,
        on=["date", "hour", "state"],
        how="left"
    )

else:

    df["rainfall_mm"] = 0


df["rainfall_mm"] = (
    df["rainfall_mm"]
    .fillna(0)
)


# --------------------------------------------------
# 6. SCHOOL HOLIDAY SIGNAL
# --------------------------------------------------

school = pd.read_csv(
    DATA_DIR / "school_holidays_clean.csv"
)

school["date"] = pd.to_datetime(
    school["date"],
    errors="coerce"
)

school = school[
    ["date", "state", "school_holiday"]
].drop_duplicates()

df = df.merge(
    school,
    on=["date", "state"],
    how="left"
)

df["school_holiday"] = (
    df["school_holiday"]
    .fillna(0)
    .astype(int)
)


# --------------------------------------------------
# 7. PUBLIC HOLIDAY SIGNAL
# --------------------------------------------------

holidays = pd.read_csv(
    DATA_DIR / "holidays_festivals_clean.csv"
)

holidays["date"] = pd.to_datetime(
    holidays["date"],
    errors="coerce"
)

holiday_signal = (
    holidays[
        ["date", "state", "holiday"]
    ]
    .groupby(
        ["date", "state"],
        as_index=False
    )["holiday"]
    .max()
)

df = df.merge(
    holiday_signal,
    on=["date", "state"],
    how="left"
)

df["holiday"] = (
    df["holiday"]
    .fillna(0)
    .astype(int)
)


# --------------------------------------------------
# 8. LOCAL EVENT SIGNAL
# --------------------------------------------------

events = pd.read_csv(
    DATA_DIR / "local_events_clean.csv"
)

events["start_date"] = pd.to_datetime(
    events["start_date"],
    errors="coerce"
)

events["end_date"] = pd.to_datetime(
    events["end_date"],
    errors="coerce"
)

df["local_event"] = 0

for _, event in events.iterrows():

    mask = (
        (df["state"] == event["state"])
        &
        (df["date"] >= event["start_date"])
        &
        (df["date"] <= event["end_date"])
    )

    df.loc[mask, "local_event"] = 1


# --------------------------------------------------
# 9. WEATHER / TIME FEATURES
# --------------------------------------------------

df["rain_probability_proxy"] = (
    (df["rainfall_mm"] > 0)
    .astype(int)
)

df["morning"] = (
    (df["hour"] >= 6)
    &
    (df["hour"] < 12)
).astype(int)

df["afternoon"] = (
    (df["hour"] >= 12)
    &
    (df["hour"] < 17)
).astype(int)

df["evening"] = (
    (df["hour"] >= 17)
    &
    (df["hour"] <= 20)
).astype(int)


# --------------------------------------------------
# 10. SAVE FINAL DATASET
# --------------------------------------------------

df = df.sort_values(
    ["date", "state", "place", "hour"]
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# --------------------------------------------------
# 11. DISPLAY RESULTS
# --------------------------------------------------

print()
print("-----------------------------")
print("FINAL ML DATASET CREATED")
print("-----------------------------")

print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Places:", df["place"].nunique())
print("States:", df["state"].nunique())

print()
print("Columns:")
print(list(df.columns))

print()
print("Saved to:")
print(OUTPUT_PATH)

print()
print(df.head())