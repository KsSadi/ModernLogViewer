# 🚀 Modern Log Viewer

A powerful, modern log analysis tool built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Features advanced filtering, analytics, and visualization capabilities for analyzing log files efficiently.

![Modern Log Viewer](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark/Light Mode** with system preference detection
- **Responsive Design** that works on all devices  
- **Clean & Colorful** interface with smooth animations
- **Keyboard Shortcuts** for power users

### 📄 **Multi-Format Log Support**
- **Laravel Logs** - Standard Laravel log format parsing
- **JSON Lines** - Structured JSON logging
- **Apache/Nginx** - Web server logs
- **Custom Formats** - Flexible parsing for various log types

### 🔍 **Advanced Filtering**
- **Regex Search** - Powerful pattern matching
- **Multi-condition Filters** - Level, date range, channel, environment
- **Real-time Filtering** - Instant results as you type
- **Quick Filter Presets** - One-click common filters

### 📊 **Analytics Dashboard**
- **Interactive Charts** - Log levels, time series, channels
- **Statistics Overview** - Error rates, peak times, insights  
- **Trend Analysis** - Identify patterns and anomalies
- **Export Analytics** - Save insights as JSON/CSV

### ⭐ **Productivity Features**
- **Bookmarking System** - Mark important log entries
- **Multi-file Support** - Compare logs side-by-side
- **Bulk Selection** - Select and export multiple entries
- **Virtual Scrolling** - Handle large files efficiently

### 📤 **Export Options**
- **JSON Export** - Full data with metadata
- **CSV Export** - Spreadsheet-friendly format
- **Filtered Exports** - Export only what you need
- **Bulk Operations** - Process multiple files

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd modern-log-viewer
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or  
pnpm install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev  
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Uploading Logs
1. **Drag & Drop** log files onto the upload area
2. **Browse Files** using the file picker
3. **Paste Logs** directly into the text area

### Supported Formats
```log
# Laravel Format
[2024-01-15 10:30:45] production.ERROR: Database connection failed {"user_id":123}

# JSON Lines Format  
{"timestamp":"2024-01-15T10:30:45Z","level":"ERROR","message":"Connection failed"}

# Apache Format
127.0.0.1 - - [15/Jan/2024:10:30:45 +0000] "GET /api/users HTTP/1.1" 500 1234
```

### Filtering Logs
- **Search**: Use the search bar for text/regex queries
- **Level Filter**: Select specific log levels (DEBUG, INFO, ERROR, etc.)
- **Date Range**: Filter by time periods  
- **Advanced**: Combine multiple conditions

### Analytics
- Switch to **Analytics** tab for insights
- View **log level distribution** charts
- Analyze **activity patterns** over time
- Export analytics data

## 🎨 Customization

### Dark Mode
The app automatically detects your system preference and includes a manual toggle.

### Themes
Built with Tailwind CSS for easy customization. Modify `tailwind.config.js` and component styles.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand  
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Handling**: React Dropzone
- **Build Tool**: Turbopack (Next.js 15+)

## 📁 Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # Reusable UI components  
│   ├── Layout.tsx    # Main app layout
│   ├── FileUpload.tsx# File upload component
│   ├── LogViewer.tsx # Virtualized log viewer
│   ├── LogFilters.tsx# Advanced filtering
│   └── LogAnalytics.tsx# Charts & statistics
├── stores/           # State management
│   └── logStore.ts   # Zustand store  
├── utils/            # Utility functions
│   └── logParser.ts  # Log parsing logic
└── lib/              # Shared libraries
```

## 🚀 Deployment

### Vercel (Recommended)
This project is optimized for Vercel deployment:

1. **Push to GitHub**
2. **Import to Vercel** 
3. **Deploy** - It's that simple!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/modern-log-viewer)

### Other Platforms
```bash
# Build for production
npm run build

# Start production server  
npm start
```

## 🎯 Performance

- **Virtual Scrolling** for large files (10MB+)
- **Lazy Loading** of components
- **Optimized Parsing** with Web Workers
- **Responsive Design** with mobile optimization

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment
- **Tailwind CSS** for the utility-first CSS
- **Recharts** for beautiful charts

---

Made with ❤️ for developers who deal with logs daily.
