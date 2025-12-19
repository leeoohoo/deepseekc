# Deepseek CLI Website

Official website for [Deepseek CLI](https://github.com/leeoohoo/deepseek-cli) - AI-powered terminal assistant with sub-agent marketplace, task tracking, and MCP tools.

## Features

- 🏠 **Landing Page**: Product showcase with animated terminal, feature highlights, and quick start guide
- 📚 **Documentation**: Comprehensive docs with installation, configuration, commands reference
- 🔐 **Authentication**: Email verification code based login/registration with referral codes
- 🎨 **Modern Design**: Dark theme with glassmorphism, animations, and responsive layout
- 🔍 **SEO Optimized**: React Helmet for meta tags, Open Graph, Twitter Cards, and JSON-LD

## Tech Stack

### Frontend (client/)
- React 18 + Vite
- React Router DOM
- React Helmet Async (SEO)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

### Backend (server/)
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (email)
- Express Validator

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or remote URI

### Installation

1. Clone and install dependencies:
```bash
cd deepseek_cli_website

# Install server dependencies
cd server
npm install
cp .env.example .env
# Edit .env with your configuration

# Install client dependencies
cd ../client
npm install
```

2. Configure environment variables in `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/deepseek_cli_website
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

3. Start development servers:
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

4. Open http://localhost:3000

## Project Structure

```
deepseek_cli_website/
├── client/                  # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components (SEO, Header, Footer, Layout)
│   │   ├── pages/          # Page components (Home, Docs, Login, Register)
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   ├── utils/          # Utility functions (API client)
│   │   └── styles/         # CSS with Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Mongoose models (User, VerificationCode)
│   │   ├── routes/         # API routes (auth)
│   │   ├── middleware/     # JWT authentication
│   │   ├── services/       # Email service
│   │   └── app.js          # Express application
│   └── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/send-code` - Send verification code to email
- `POST /api/auth/register` - Register with email, code, and optional referral code
- `POST /api/auth/login` - Login with email and code
- `GET /api/auth/me` - Get current user (protected)

## License

MIT
```