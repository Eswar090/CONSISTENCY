# CONSISTENCY - "Plan it. Do it. Track it."

A full-stack personal productivity and consistency tracking application built with React, Spring Boot, and MySQL.

## Features

- **Daily Planner:** Date-based task management with completion tracking.
- **Habit Tracker:** Weekly habit matrix, flexible scheduling (daily, selected days).
- **Consistency Engine:** Calculates daily, weekly, and monthly consistency scores and streaks.
- **Analytics:** Data visualizations, heatmaps, and historical productivity tracking.
- **Focus Mode:** Customizable Pomodoro timer and focus session history.
- **Smart Notifications:** In-app reminders for tasks, habits, and focus sessions.
- **Smart Goals:** Set deadlines and let the app track required pace automatically.
- **AI Productivity Assistant:** Uses real user data to provide personalized productivity insights and smart planning recommendations (via Gemini API).
- **User Data Isolation:** Secure, authenticated environment with JWT.

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS (implicit in standard utility classes), Lucide React (Icons)
- **HTTP Client:** Axios
- **Date Parsing:** date-fns

### Backend
- **Framework:** Java 21, Spring Boot 3
- **Data Access:** Spring Data JPA, Hibernate
- **Database:** MySQL
- **Security:** Spring Security, JWT (JSON Web Tokens), BCrypt Password Hashing
- **Build Tool:** Gradle

## Project Structure

- /frontend - React single-page application
- /backend - Spring Boot REST API
- /.env.example - Template environment variables for frontend and backend

## Setup & Running Locally

### 1. Database Setup
Ensure you have MySQL running on port 3306.
Create a database named consistency:
\\\sql
CREATE DATABASE consistency;
\\\

### 2. Backend Configuration
Navigate to the /backend directory.
Copy .env.example to .env and fill in your credentials:
\\\ash
cp .env.example .env
\\\
*(Make sure you provide a secure 256-bit JWT secret and your Gemini AI API key)*

Run the backend:
\\\ash
./gradlew bootRun
\\\

### 3. Frontend Configuration
Navigate to the /frontend directory.
Copy .env.example to .env:
\\\ash
cp .env.example .env
\\\

Install dependencies and run:
\\\ash
npm install
npm run dev
\\\

## Deployment Preparation

- **Database:** Ensure your production MySQL URL is injected via the DATABASE_URL environment variable.
- **Backend:** Package the app into a JAR (./gradlew build) and deploy to AWS Elastic Beanstalk, Heroku, or a Dockerized environment. Make sure to set APP_CORS_ALLOWED_ORIGINS to your production frontend domain.
- **Frontend:** Build the app (
pm run build) and deploy the dist folder to Vercel, Netlify, or AWS S3/CloudFront. Ensure VITE_API_URL points to your production backend domain.

## API Documentation
Refer to API_DOCS.md for a comprehensive overview of the REST endpoints.
