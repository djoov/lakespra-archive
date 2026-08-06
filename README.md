# 🗄️ Enterprise Archive Management System

A modern, high-performance web application designed for secure and efficient management of physical archives and documents. Built with **Next.js 14**, **Tailwind CSS**, and **Firebase**, this system bridges the gap between physical storage and digital accessibility.

*(Note: Sensitive institutional branding and data have been anonymized for this portfolio showcase).*

## ✨ Key Features

- 🔐 **Secure Authentication**: Protected dashboard routes utilizing Firebase Auth.
- ⚡ **Real-time Search Engine**: Instant, client-side filtering and pagination of thousands of documents.
- 🖨️ **QR Code & Barcode Integration**: Built-in physical label generator. Scanning the generated QR codes instantly opens the specific document's digital detail page.
- 📂 **Bulk Import System (CSV)**: Robust CSV parsing with automatic duplicate detection, data validation, and real-time progress tracking.
- 💅 **Premium UI/UX**: Designed with modern *Bento-box* layouts, glassmorphism effects, loading skeletons (shimmer), and elegant toast notifications.
- 📱 **Fully Responsive**: Optimized for desktop monitors in administrative offices as well as mobile devices for on-the-go physical archive retrieval.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server/Client Components)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Firebase Authentication)
- **UI Components**: `react-hot-toast` (Notifications), `qrcode.react` (QR Generation), Google Material Symbols

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/archive-management-system.git
cd archive-management-system
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup Firebase Configuration
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📸 Screenshots
*(Coming Soon - Add screenshots of your Dashboard, Search Page, and QR Label Generator here)*

## 📄 License
This project is for portfolio and demonstration purposes.
