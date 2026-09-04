import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_PATH = (
    BASE_DIR
    / "data"
    / "holidays_festivals_ap_telangana_2026.csv"
)

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "holidays_festivals_clean.csv"
)

print("Loading Dataset 4...")

# Read rows with different numbers of fields safely
df = pd.read_csv(
    INPUT_PATH,
    header=None,
    names=[
        "date",
        "state",
        "event_name",
        "event_type",
        "holiday",
        "source",
        "crowd_impact"
    ],
    engine="python"
)

print("Original rows:", len(df))

# Remove rows that do not contain a valid date
df["date"] = pd.to_datetime(
    df["date"],
    errors="coerce"
)

df = df.dropna(subset=["date"])

# Remove duplicate rows
df = df.drop_duplicates()

# Clean text
for column in ["state", "event_name", "event_type", "source", "crowd_impact"]:
    df[column] = df[column].astype(str).str.strip()

# Convert holiday flag
df["holiday"] = pd.to_numeric(
    df["holiday"],
    errors="coerce"
).fillna(0).astype(int)

# Save cleaned dataset
df.to_csv(
    OUTPUT_PATH,
    index=False
)

print()
print("-----------------------------")
print("DATASET 4 CLEANED")
print("-----------------------------")
print("Clean rows:", len(df))
print("Saved to:", OUTPUT_PATH)
print()
print(df.head())