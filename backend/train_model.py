import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score


# ==================================================
# PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "time2travel_ml_final.csv"
)

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "model.pkl"
)


# ==================================================
# LOAD DATASET
# ==================================================

print("Loading final ML dataset...")

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ==================================================
# FEATURES
# ==================================================

features = [
    "day_of_week",
    "hour",
    "place",
    "state",
    "district",
    "category",
    "historical_tourism_index",
    "weekend",
    "rainfall_mm",
    "school_holiday",
    "holiday",
    "local_event",
    "rain_probability_proxy",
    "morning",
    "afternoon",
    "evening"
]

target = "footfall_index"


# ==================================================
# INPUT AND OUTPUT
# ==================================================

X = df[features]

y = df[target]


# ==================================================
# CATEGORICAL FEATURES
# ==================================================

categorical_features = [
    "day_of_week",
    "place",
    "state",
    "district",
    "category"
]


# ==================================================
# NUMERICAL FEATURES
# ==================================================

numerical_features = [
    "hour",
    "historical_tourism_index",
    "weekend",
    "rainfall_mm",
    "school_holiday",
    "holiday",
    "local_event",
    "rain_probability_proxy",
    "morning",
    "afternoon",
    "evening"
]


# ==================================================
# PREPROCESSING
# ==================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ==================================================
# RANDOM FOREST MODEL
# ==================================================

model = RandomForestRegressor(
    n_estimators=150,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)


# ==================================================
# CREATE PIPELINE
# ==================================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ==================================================
# TRAIN / TEST SPLIT
# ==================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print()
print("Training rows:", len(X_train))
print("Testing rows:", len(X_test))


# ==================================================
# TRAIN MODEL
# ==================================================

print()
print("Training Random Forest model...")

pipeline.fit(
    X_train,
    y_train
)

print("Training completed!")


# ==================================================
# TEST MODEL
# ==================================================

print()
print("Testing model...")

predictions = pipeline.predict(X_test)


# ==================================================
# MODEL PERFORMANCE
# ==================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

r2 = r2_score(
    y_test,
    predictions
)


print()
print("-----------------------------")
print("MODEL RESULTS")
print("-----------------------------")

print(
    "Mean Absolute Error:",
    round(mae, 2)
)

print(
    "R2 Score:",
    round(r2, 4)
)


# ==================================================
# SAVE MODEL
# ==================================================

joblib.dump(
    pipeline,
    MODEL_PATH
)

print()
print("-----------------------------")
print("MODEL SAVED")
print("-----------------------------")

print(
    "Model location:",
    MODEL_PATH
)

print()
print("Time2Travel ML model is ready!")