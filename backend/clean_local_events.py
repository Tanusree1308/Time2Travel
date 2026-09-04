import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_PATH = BASE_DIR / "data" / "local_events_ap_telangana_2026.csv"
OUTPUT_PATH = BASE_DIR / "data" / "local_events_clean.csv"

print("Loading Dataset 6...")

df = pd.read_csv(INPUT_PATH)

print("Original rows:", len(df))

# Clean column names
df.columns = df.columns.str.strip()

# Convert dates
df["start_date"] = pd.to_datetime(df["start_date"], errors="coerce")
df["end_date"] = pd.to_datetime(df["end_date"], errors="coerce")

# Remove rows with invalid dates
df = df.dropna(subset=["start_date", "end_date"])

# Clean text columns
for column in [
    "state",
    "district",
    "event_name",
    "event_type",
    "crowd_impact",
    "source"
]:
    df[column] = df[column].astype(str).str.strip()

# Remove duplicates
df = df.drop_duplicates()

# Sort by start date
df = df.sort_values(["start_date", "state"])

# Save cleaned dataset
df.to_csv(OUTPUT_PATH, index=False)

print()
print("-----------------------------")
print("DATASET 6 CLEANED")
print("-----------------------------")
print("Clean rows:", len(df))
print("Saved to:", OUTPUT_PATH)
print()
print(df.head())