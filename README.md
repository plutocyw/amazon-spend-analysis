# Amazon Spend Analysis

A modern, privacy-focused web app to analyze your Amazon order history. Upload your CSV export and get interactive visualizations of your spending patterns.

> 🔒 **100% Local & Private** — This app runs entirely in your browser. Your data is never uploaded to any server. Everything stays on your machine.

## 🚀 Try It Now

**[Launch App →](https://plutocyw.github.io/amazon-spend-analysis/)**

Even when using the hosted version, all data processing happens locally in your browser. Your CSV file is never sent to any server.

## Features

- 📊 **Interactive Charts**: Bar charts for spending over time, breakdown by category/payment method
- 🔍 **Advanced Filtering**: Multi-column filters with search, date range presets
- 📈 **Metrics Toggle**: Switch between Amount Spent and Quantity views
- 🎨 **Modern UI**: Dark mode, glassmorphism design, responsive layout
- 🔒 **Privacy First**: All data stays in your browser — nothing is uploaded anywhere

## How to Get Your Amazon Order History

### Step 1: Request Your Data
1. Go to [Amazon Privacy Central - Data Request](https://www.amazon.com/hz/privacy-central/data-requests/preview.html)
2. Sign in to your Amazon account
3. Select **"Your Orders"** from the available data categories
4. Submit your request

### Step 2: Download Your Data
1. Wait for an email from Amazon (usually arrives within a few days)
2. Click the download link in the email
3. Extract the ZIP file

### Step 3: Find the Right File
Look for a file named:
```
Retail.OrderHistory.1.csv
```
(The number may vary: `Retail.OrderHistory.2.csv`, etc.)

### Step 4: Upload to This App
1. Open this web app
2. Drag and drop your `Retail.OrderHistory.X.csv` file
3. Start exploring your spending!

## Getting Started (Development)

### Prerequisites
- Node.js 20.19+ or 22.12+ (recommended)
- npm or yarn

### Installation

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 19** + TypeScript
- **Vite** for fast development
- **Recharts** for visualizations
- **date-fns** for date handling
- **PapaParse** for CSV parsing
- **Lucide React** for icons

## Credits

Developed using [Google's Antigravity IDE](https://developers.google.com/gemini).

## License

MIT
