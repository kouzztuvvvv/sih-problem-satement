# 🦴 ArthroScan NER — AI-Assisted Early Osteoarthritis Detection System

> **Problem Statement ID:** PS26004 | **Organization:** Ministry of Development of North Eastern Region (MDoNER)  
> **Category:** MedTech / BioTech / HealthTech  

ArthroScan NER is an offline-first, AI-assisted healthcare screening platform designed for primary healthcare workers (ASHAs, ANMs) in the North Eastern Region (NER) of India. It enables early identification of Osteoarthritis (OA) risk markers through non-invasive computer vision gait analysis, joint flexion tracking, and standardized clinical assessment scoring (WOMAC & KOOS).

---

## 🌟 Key Features

- 🎥 **Computer Vision Gait & Kinematic Analysis:** Real-time pose tracking via tablet or webcam feeds to assess joint flexion angles, stance duration, and gait asymmetry.
- 📶 **Offline-First & P2P Synchronization:** Operates seamlessly in low-connectivity rural environments; local records sync automatically to central server databases upon re-establishing connection.
- 🗣️ **Multilingual Field Accessibility:** Supports regional languages (Assamese, Khasi, Garo, Mizo, Nagamese, Bengali, Bodo, Hindi, and English) for low-literacy field deployment.
- 🩺 **Automated Triage & Risk Matrix:** Generates instant 3-tier risk cards (Low, Moderate, High Risk) with integrated referral triggers for tele-consultations or district orthopaedic specialists.
- 🌓 **Adaptive Light/Dark Theme System:** High-contrast, eye-friendly design tailored for handheld field devices in high-glare or low-light field conditions.
- 📜 **Print & Share Patient Reports:** One-click PDF generation via `jspdf` for printing or sharing patient diagnostic summaries directly in the field.

---

## 🛠️ Tech Stack

### **Frontend & UI**
- **Framework:** React / Next.js
- **Styling:** Tailwind CSS (Custom Calming HealthTech Palette)
- **Icons:** Lucide React
- **Document Generation:** `jspdf` & `jspdf-autotable`

### **AI & Computer Vision**
- **Pose Tracking:** MediaPipe / OpenPose / Edge YOLO Pose
- **Runtime:** Quantized ONNX / WebGL Edge Inference

### **Backend & Database Integration**
- **API Server:** Node.js / Express
- **Database Support:** SQLite / PostgreSQL / MongoDB
- **Offline Storage:** IndexedDB / PouchDB

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [Bun](https://bun.sh/) or `npm` / `yarn` package manager

### Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/kouzztuvvv/sih-problem-satement.git](https://github.com/kouzztuvvv/sih-problem-satement.git)
   cd sih-problem-satement
