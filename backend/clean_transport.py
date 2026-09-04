import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

TRANSPORT_DIR = BASE_DIR / "data" / "transport"
OUTPUT_PATH = BASE_DIR / "data" / "transport_summary_clean.csv"

print("Loading Dataset 7...")

routes = pd.read_csv(TRANSPORT_DIR / "routes.txt")
trips = pd.read_csv(TRANSPORT_DIR / "trips.txt")
stops = pd.read_csv(TRANSPORT_DIR / "stops.txt")

print("Routes:", len(routes))
print("Trips:", len(trips))
print("Stops:", len(stops))

# Count trips for each route
trip_counts = (
    trips.groupby("route_id")
    .size()
    .reset_index(name="trip_count")
)

# Count stops for each route using trips
route_stop_counts = (
    trips[["route_id", "trip_id"]]
    .drop_duplicates()
)

# Merge trip count with route information
summary = routes.merge(
    trip_counts,
    on="route_id",
    how="left"
)

summary["trip_count"] = summary["trip_count"].fillna(0).astype(int)

# Add total available stops
summary["total_stops_available"] = len(stops)

# Keep useful columns
summary = summary[
    [
        "route_id",
        "route_long_name",
        "agency_id",
        "route_type",
        "trip_count",
        "total_stops_available"
    ]
]

# Remove duplicates
summary = summary.drop_duplicates()

# Save
summary.to_csv(
    OUTPUT_PATH,
    index=False
)

print()
print("-----------------------------")
print("DATASET 7 CLEANED")
print("-----------------------------")
print("Routes in summary:", len(summary))
print("Saved to:", OUTPUT_PATH)
print()
print(summary.head())