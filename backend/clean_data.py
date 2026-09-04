import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "historical_tourist_visits_ap_telangana_2020_2024.csv"
)

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "historical_tourist_visits_clean.csv"
)

print("Loading Dataset 2...")

df = pd.read_csv(DATA_PATH)

print("Original rows:", len(df))
print("Original columns:")
print(df.columns.tolist())

# Remove duplicate rows
df = df.drop_duplicates()

# Convert numeric columns
numeric_columns = [
    "year",
    "domestic_visitors",
    "foreign_visitors",
    "total_visitors"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")

# Remove rows with missing important values
df = df.dropna(
    subset=[
        "state",
        "year",
        "domestic_visitors",
        "foreign_visitors",
        "total_visitors"
    ]
)

# Make sure visitor totals are consistent
df["total_visitors"] = (
    df["domestic_visitors"] + df["foreign_visitors"]
)

# Sort the data
df = df.sort_values(["state", "year"])

# Save cleaned dataset
df.to_csv(OUTPUT_PATH, index=False)

print()
print("-----------------------------")
print("DATASET 2 CLEANED")
print("-----------------------------")
print("Rows:", len(df))
print("Saved to:", OUTPUT_PATH)

print()
print(df)