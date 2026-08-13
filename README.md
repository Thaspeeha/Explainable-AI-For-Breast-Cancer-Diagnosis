# 🧬 Explainable-AI-For-Breast-Cancer-Diagnosis

An **Explainable Artificial Intelligence (XAI) decision-support prototype** for breast cancer diagnosis using machine learning and SHAP-based explanations.

The system combines a **FastAPI backend**, **Next.js + TypeScript frontend**, trained machine-learning models, **SHAP explainability**, and **MongoDB Atlas authentication** into an interactive web application.

> ⚠️ **Disclaimer:** This project is an academic research prototype and is **not intended for real clinical diagnosis or medical decision-making**. Predictions should not be used as a substitute for professional clinical judgement.

---

## 📌 Overview

Machine-learning models can achieve high classification performance on breast cancer datasets, but their predictions can be difficult to interpret.

This project explores how **Explainable AI (XAI)** can make machine-learning predictions more transparent by showing **which features contributed to a prediction and in which direction**.

The application uses the **Breast Cancer Wisconsin (Diagnostic) — WDBC dataset**, which contains:

- 569 cases
- 357 benign cases
- 212 malignant cases
- 30 numerical predictive features
- Features derived from measurements of cell nuclei obtained from digitised FNA samples

The prototype evaluates three machine-learning models:

- 🌲 Random Forest
- 🚀 XGBoost
- 📈 Logistic Regression

SHAP is used to provide both **global feature importance** and **individual case-level explanations**.

---

## ✨ Features

### 🤖 Machine Learning

- Breast tumour classification
- Benign vs malignant prediction
- Random Forest
- XGBoost
- Logistic Regression
- Model comparison
- Multiple evaluation metrics
- Serialized models loaded through the FastAPI backend

### 🔍 Explainable AI

The application uses **SHAP (SHapley Additive exPlanations)** to explain model predictions.

It provides:

- Global feature importance
- Local/case-level explanations
- Feature contribution values
- Prediction-driving features
- Malignancy vs benignity contribution direction
- Human-readable explanation summaries

### 📊 Prediction Dashboard

The frontend provides:

- Feature input controls
- Prediction results
- Malignancy probability
- Benign probability
- Multiple explanation modes
- Feature importance analysis
- Model confidence analysis
- Model comparison
- Report export

### 📈 Model Confidence

The Model Confidence section provides:

- Accuracy
- Sensitivity
- Specificity
- AUC-ROC
- Brier Score
- False Negative Rate
- Confusion matrices
- Model agreement/disagreement

### 📄 Report Export

Users can generate a structured diagnosis report containing:

- Primary model
- Predicted classification
- Malignancy probability
- Benign probability
- Generated explanation summary
- Decision-support disclaimer

### 🔐 Authentication

The application includes:

- User signup
- User login
- Protected dashboard routes
- MongoDB Atlas authentication storage
- IP access restrictions
- TLS-secured database connections

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │      Next.js Frontend    │
                    │     TypeScript / CSS     │
                    └────────────┬─────────────┘
                                 │
                              JSON API
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      FastAPI Backend     │
                    │         Python           │
                    ├──────────────────────────┤
                    │ Prediction API           │
                    │ Model Selection          │
                    │ Preprocessing             │
                    │ SHAP Explanations        │
                    │ Summary Generation       │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       Random Forest          XGBoost        Logistic Regression
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
                                 ▼
                           SHAP Explainer
                                 │
                                 ▼
                    Feature Contributions
                                 │
                                 ▼
                    Human-readable Summary

                    ┌──────────────────────────┐
                    │      MongoDB Atlas       │
                    │ Authentication / Config  │
                    └──────────────────────────┘