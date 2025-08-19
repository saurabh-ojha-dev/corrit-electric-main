# Bike Rental Management System

A full-stack web application for managing bike rentals with admin authentication and management features.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Project Structure

```
bike-rental-management-system/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── package.json       # Root package.json with workspaces
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update with your MongoDB connection string and JWT secret

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers concurrently.

## Development

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Login**: http://localhost:3000/admin/auth/login

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both applications
- `npm run start` - Start production backend server

## Features

- 🔐 Secure admin authentication
- 🚲 Bike rental management
- 📊 Dashboard and analytics
- 👥 User management
- �� Responsive design
