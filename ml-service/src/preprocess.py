import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

def load_and_preprocess(data_dir):
    # ── Load new dataset (4920 rows, 41 diseases) ──
    dataset_path     = os.path.join(data_dir, "dataset.csv")
    severity_path    = os.path.join(data_dir, "Symptom-severity.csv")
    description_path = os.path.join(data_dir, "symptom_Description.csv")
    precaution_path  = os.path.join(data_dir, "symptom_precaution.csv")

    df          = pd.read_csv(dataset_path)
    severity_df = pd.read_csv(severity_path)
    desc_df     = pd.read_csv(description_path)
    prec_df     = pd.read_csv(precaution_path)

    print(f"✅ New dataset loaded: {df.shape[0]} rows, {df['Disease'].nunique()} diseases")

    # Clean symptom columns from new dataset
    symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
    for col in symptom_cols:
        df[col] = df[col].str.strip().str.replace(" ", "_").str.lower()

    # Get all unique symptoms from new dataset
    all_symptoms = set()
    for col in symptom_cols:
        all_symptoms.update(df[col].dropna().unique())
    all_symptoms.discard("")
    all_symptoms.discard("nan")

    # ── Load old dataset (349 rows, 116 diseases) ──
    old_dataset_path = os.path.join(data_dir, "old_dataset.csv")
    if os.path.exists(old_dataset_path):
        old_df = pd.read_csv(old_dataset_path)
        print(f"✅ Old dataset loaded: {old_df.shape[0]} rows, {old_df['Disease'].nunique()} diseases")

        # Map old dataset columns to symptom names
        old_symptom_map = {
            "Fever":                "fever",
            "Cough":                "cough",
            "Fatigue":              "fatigue",
            "Difficulty Breathing": "breathlessness",
        }

        # Convert old dataset rows to new symptom format
        new_rows = []
        for _, row in old_df.iterrows():
            symptoms_list = []
            for old_col, new_symptom in old_symptom_map.items():
                if old_col in old_df.columns:
                    val = str(row[old_col]).strip().lower()
                    if val == "yes":
                        symptoms_list.append(new_symptom)
            new_row = {"Disease": str(row["Disease"]).strip()}
            for i, s in enumerate(symptoms_list[:17], 1):
                new_row[f"Symptom_{i}"] = s
            new_rows.append(new_row)

        old_converted = pd.DataFrame(new_rows)

        # Add old symptoms to symptom set
        for col in [c for c in old_converted.columns if c.startswith("Symptom_")]:
            all_symptoms.update(old_converted[col].dropna().unique())

        # Combine both datasets
        df = pd.concat([df, old_converted], ignore_index=True)
        print(f"✅ Combined dataset: {df.shape[0]} rows, {df['Disease'].nunique()} diseases")
    else:
        print("⚠️  Old dataset not found — using new dataset only.")

    all_symptoms.discard("")
    all_symptoms.discard("nan")
    all_symptoms = sorted(list(all_symptoms))
    print(f"✅ Total unique symptoms: {len(all_symptoms)}")

    # Re-identify all symptom columns after combine
    symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]

    # Create binary symptom matrix
    for symptom in all_symptoms:
        df[symptom] = df[symptom_cols].apply(
            lambda row: 1 if symptom in row.values else 0, axis=1
        )

    # Drop original symptom columns
    df = df.drop(columns=symptom_cols)

    # Encode Disease
    le = LabelEncoder()
    df["Disease"] = df["Disease"].str.strip()
    df["Disease_encoded"] = le.fit_transform(df["Disease"])

    feature_cols = all_symptoms
    X = df[feature_cols]
    y = df["Disease_encoded"]

    print(f"✅ Features: {len(feature_cols)} symptoms")
    print(f"✅ Classes: {len(le.classes_)} diseases")
    print(f"✅ Preprocessing complete!")

    return X, y, le, feature_cols, desc_df, prec_df, severity_df