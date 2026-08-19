# 🧬 Explainable AI for Breast Cancer Diagnosis

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=2500&pause=800&color=00D9FF&center=true&vCenter=true&width=850&lines=Machine+Learning+%C3%97+Explainable+AI+%C3%97+Fullstack+Development;SHAP+%C3%97+FastAPI+%C3%97+Next.js;Predict.+Explain.+Understand.;Building+Transparent+AI+Systems." alt="Animated project tagline">
</p>

<p align="center">
  An interactive clinical decision-support prototype that combines ML predictions with human-readable SHAP explanations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Machine%20Learning-00D9FF?style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/Explainable%20AI-7B61FF?style=for-the-badge">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white">
</p>

## 🧠 The Problem

### Traditional ML

**Prediction**

`Patient Features → Model → Malignant`

But...

**Why?**

---

### Explainable AI

`Patient Features`
↓
`ML Model`
↓
`Prediction`
↓
`SHAP`
↓
`Feature Contributions`
↓
`Human-readable Explanation`

> ⚠️ **Important:** This is an academic proof-of-concept and is **not intended for clinical diagnosis or medical decision-making**.

---

## ⚡ Project at a Glance

| 🧠 Intelligence | 🔎 Explainability | ⚙️ Backend | 🎨 Interface | 🗄️ Data | 🐳 Infrastructure |
|---|---|---|---|---|---|
| XGBoost · RF · LR | SHAP · LIME | FastAPI · Python | Next.js · TypeScript | MongoDB Atlas | Docker |

---

## ✨ Features

- 🤖 **Machine Learning** — Random Forest, XGBoost & Logistic Regression
- 🔍 **Explainable AI** — Global & local SHAP explanations
- 📊 **Interactive Dashboard** — Predictions, probabilities & feature analysis
- 📈 **Model Evaluation** — Accuracy, Sensitivity, Specificity, AUC-ROC & Brier Score
- 📄 **Report Export** — Prediction, explanation & decision-support summary
- 🔐 **Authentication** — Protected routes with MongoDB Atlas

---

## 🏗️ System Architecture

~~~text
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
                    │ Prediction API            │
                    │ Model Selection           │
                    │ Preprocessing             │
                    │ SHAP Explanations        │
                    │ Summary Generation        │
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
~~~

---

## 🧰 Tech Stack

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

### Backend

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=flat-square)](https://www.uvicorn.org/)

### Machine Learning & XAI

[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-EC5C2E?style=flat-square)](https://xgboost.readthedocs.io/)
[![Random Forest](https://img.shields.io/badge/Random%20Forest-2E8B57?style=flat-square)](https://scikit-learn.org/stable/modules/ensemble.html#random-forests)
[![Logistic Regression](https://img.shields.io/badge/Logistic%20Regression-6A5ACD?style=flat-square)](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression)
[![SHAP](https://img.shields.io/badge/SHAP-Explainable_AI-purple?style=flat-square)](https://shap.readthedocs.io/)
[![LIME](https://img.shields.io/badge/LIME-Explainable_AI-blue?style=flat-square)](https://lime-ml.readthedocs.io/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)](https://numpy.org/)

### Database & Infrastructure

[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)](https://git-scm.com/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/)

---

## 🏆 Model Performance

<p align="center">

| Model | Accuracy | Sensitivity | Specificity | AUC |
|---|---:|---:|---:|---:|
| Random Forest | 94.74% | 95.83% | 92.86% | 0.992 |
| **XGBoost** | **97.37%** | **98.61%** | **95.24%** | **0.994** |
| Logistic Regression | 93.86% | 93.06% | 95.24% | 0.993 |

</p>

### 🥇 Best Test-Set Performance

**XGBoost**

`97.37% Accuracy` · `98.61% Sensitivity` · `0.994 AUC-ROC`

---

## 🔎 Explainability with SHAP

### Why did the model make this prediction?

<p align="center">
  <img src="my-frontend/public/hero-section-prediction.png" width="850">
</p>

The model doesn't simply return:

> **Malignant — 56.3%**

It also identifies the features contributing to that prediction.

| Feature | Influence |
|---|---|
| Radius | ↑ Malignant |
| Concavity | ↑ Malignant |
| Perimeter | ↑ Malignant |
| Texture | ↓ Lower influence |

If you already have SHAP plots from your notebook, absolutely put them here.
---

## 🔎 SHAP Explainability

SHAP is used at two levels.

### Global Explainability

Global SHAP analysis identifies the features that have the greatest influence across the test dataset.

Important feature groups include:

- Cell size
- Radius
- Perimeter
- Area
- Concavity
- Concave points
- Shape irregularity

### Local Explainability

For an individual case, SHAP identifies which features:

- Push the prediction towards **malignant**
- Push the prediction towards **benign**
- Contribute strongly to the prediction
- Create competing signals in borderline cases

This allows users to understand **why** a prediction was produced instead of seeing only a classification label.

---

## ✨ Feature Gallery

| Malignant/Benign Prediction | Explainability |
|---|---|
| ![Hero section prediction dashboard](my-frontend/public/hero-section-prediction.png) | ![Explainability section](my-frontend/public/Explainability.png) |

| Model Confidence | Export Diagnostic Reports |
|---|---|
| ![Model Confidence section](my-frontend/public/model-confidence.png) | ![Diagnosis Export Report](my-frontend/public/diagnosis-report.png) |

---

## 🔄 Application Workflow

~~~text
User Login
     │
     ▼
Enter WDBC Feature Values
     │
     ▼
Select ML Model
     │
     ▼
Next.js sends JSON request
     │
     ▼
FastAPI Prediction Endpoint
     │
     ├── Preprocessing
     │
     ├── Model Prediction
     │
     └── SHAP Calculation
     │
     ▼
Prediction + Probabilities
     │
     ▼
SHAP Explanation
     │
     ├── Text Summary
     ├── Feature Influence
     └── Feature Impact
     │
     ▼
Model Confidence
     │
     ▼
Export Diagnosis Report
~~~

---

## ⚙️ Backend

The backend is implemented as a REST-style FastAPI service.

Core functionality includes:

~~~text
FastAPI
│
├── Request Validation
│   └── Pydantic
│
├── Model Loading
│   └── Joblib
│
├── Prediction
│   ├── Random Forest
│   ├── XGBoost
│   └── Logistic Regression
│
├── Explainability
│   └── SHAP
│
└── Explanation Summary
    └── summary_generator
~~~

The trained models and preprocessing components are loaded by the backend when the application starts.

---

## 📂 Project Structure

~~~text
explainable-ai-breast-cancer/
│
├── backend/
│   ├── main.py
│   ├── summary_generator.py
│   ├── requirements.txt
│   ├── models/
│   ├── preprocessing/
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── notebooks/
│   └── model_training.ipynb
│
├── reports/
│
└── README.md
~~~

> Adjust this structure to match your actual repository.

---

## 🔒 Design Approach and Security

Designed to go beyond a conventional ML classification system and incorporated security measures using MongoDB Atlas.

<p align="center">
  <img src="my-frontend/public/uniqueness-security.png" width="850">
</p>

The application is currently intended for a controlled local development environment rather than a live internet-facing clinical service.

---

## ⚠️ Limitations

This project is a **prototype**, not a clinically validated diagnostic system.

Key limitations include:

- Based on a single benchmark dataset
- Does not process raw medical images
- Uses FNA-derived tabular features
- Does not include additional clinical variables
- No external clinical validation
- No formal clinician usability study
- Not integrated with hospital information systems
- Not deployed as a live clinical service

---

## 🔮 Future Improvements

Potential future improvements include:

- 🔬 Additional clinical and imaging features
- 🔄 Automated model retraining
- 📦 Model versioning and model registry
- 🧪 Development, staging and production deployment
- 🔐 Role-based access control
- 👩‍⚕️ Formal clinician usability studies
- 🔎 Similar-case retrieval
- 🎯 What-if analysis
- 👥 Role-specific interfaces
- 📊 Additional explainability techniques

---

## 🎓 Academic Project

**Project:** Explainable AI for Breast Cancer Diagnosis  
**Student:** Thaspeeha Vahithu  
**Programme:** BSc (Hons) Computer Science  
**University:** University of West London – RAK Branch

---

## 🎯 What I Built

- 🧠 ML model training & evaluation
- 🔎 SHAP-based explainability
- ⚙️ FastAPI REST API
- 🎨 Next.js dashboard
- 🗄️ MongoDB authentication
- 🐳 Docker containerization
- 📄 Automated report generation

---

## 📜 Disclaimer

This software is an **academic proof-of-concept** developed for educational and research purposes.

It has not undergone clinical validation, regulatory approval, or formal clinician usability evaluation.

**The predictions and explanations generated by this application must not be used as a substitute for professional medical diagnosis or clinical judgement.**

<p align="center">
  ──────────────── ✦ ────────────────
</p>
