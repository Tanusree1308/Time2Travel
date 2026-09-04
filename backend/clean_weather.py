import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WEATHER_DIR = BASE_DIR / "data" / "weather"

files = list(WEATHER_DIR.glob("*.csv"))

for file in files:
    print()
    print("-----------------------------")
    print("Processing:", file.name)
    print("-----------------------------")

    df = pd.read_csv(file)

    print("Original rows:", len(df))

    # Remove completely duplicated rows
    df = df.drop_duplicates()

    # Convert timestamp
    df["Data Acquisition Time"] = pd.to_datetime(
        df["Data Acquisition Time"],
        errors="coerce",
        dayfirst=True
    )

    # Convert rainfall to number
    rainfall_column = "Telemetry Hourly Rainfall (mm)"

    df[rainfall_column] = pd.to_numeric(
        df[rainfall_column],
        errors="coerce"
    )

    # Remove invalid records
    df = df.dropna(
        subset=[
            "District",
            "Latitude",
            "Longitude",
            "Data Acquisition Time",
            rainfall_column
        ]
    )

    # Create simple date and hour columns
    df["date"] = df["Data Acquisition Time"].dt.date
    df["hour"] = df["Data Acquisition Time"].dt.hour

    # Rename rainfall column
    df = df.rename(
        columns={
            rainfall_column: "rainfall_mm"
        }
    )

    # Save cleaned file
    output_file = WEATHER_DIR / f"clean_{file.name}"

    df.to_csv(output_file, index=False)

    print("Clean rows:", len(df))
    print("Saved:", output_file.name)

print()
print("Weather cleaning completed!")