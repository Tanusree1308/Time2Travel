import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_PATH = BASE_DIR / "data" / "school_holidays_ap_telangana_2026_27.csv"
OUTPUT_PATH = BASE_DIR / "data" / "school_holidays_clean.csv"

print("Loading Dataset 5...")

df = pd.read_csv(INPUT_PATH)

print("Original rows:", len(df))

# Clean column names
df.columns = df.columns.str.strip()

# Convert date
df["date"] = pd.to_datetime(
    df["date"],
    errors="coerce"
)

# Remove invalid dates
df = df.dropna(subset=["date"])

# Clean text columns
for column in ["state", "event_name", "event_type", "district", "source"]:
    df[column] = df[column].astype(str).str.strip()

# Convert school holiday flag
df["school_holiday"] = pd.to_numeric(
    df["school_holiday"],
    errors="coerce"
).fillna(0).astype(int)

# School reopening is NOT a holiday
df.loc[
    df["event_name"].str.lower() == "school reopening",
    "school_holiday"
] = 0

# Remove duplicate rows
df = df.drop_duplicates()

# Sort by date and state
df = df.sort_values(["date", "state"])

# Save
df.to_csv(
    OUTPUT_PATH,
    index=False
)

print()
print("-----------------------------")
print("DATASET 5 CLEANED")
print("-----------------------------")
print("Clean rows:", len(df))
print("Saved to:", OUTPUT_PATH)
print()
print(df.head())