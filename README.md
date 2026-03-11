# JobTracker — AI-Powered Job Application Tracker

A full-stack job application tracking system with AI-powered interview preparation, resume feedback, and cover letter generation. Built with Spring Boot, React, and PostgreSQL.

**Live Demo:** Track your job applications through a Kanban-style dashboard and get AI-generated interview questions tailored to each company.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.5, Spring Data JPA |
| Frontend | React 18, Axios |
| Database | PostgreSQL 17 |
| AI | Groq API (Llama 3.3 70B) |
| DevOps | Docker, Docker Compose |

## Features

**Application Management**
- Add, edit, and delete job applications
- Track status across pipeline stages: Applied → Phone Screen → Technical → Onsite → Offer / Rejected
- Search applications by company name
- Filter applications by status
- Kanban board with real-time status updates

**AI-Powered Tools**
- **Interview Prep** — Generate company-specific behavioral, technical, and system design questions
- **Resume Review** — Get AI feedback on your resume tailored to a specific role
- **Cover Letter Generator** — Create personalized cover letters for each application

## Screenshots

### Dashboard
The Kanban board shows all applications organized by status with drag-dropdown functionality.

### AI Tools
Click the AI icon on any card to access interview prep, resume review, and cover letter generation.

## Architecture

```
React Frontend (port 3000)
    ↓ Axios HTTP
Spring Boot REST API (port 8080)
    ├── JobApplicationController  →  CRUD operations
    ├── AIController              →  AI-powered features
    ├── JobApplicationService     →  Business logic
    ├── AIService                 →  Groq API integration
    └── JobApplicationRepository  →  PostgreSQL via JPA
```

## API Endpoints

### Job Applications
```
POST   /api/applications                → Create application
GET    /api/applications                → List all (sorted by recent)
GET    /api/applications/{id}           → Get by ID
PUT    /api/applications/{id}           → Update application
DELETE /api/applications/{id}           → Delete application
GET    /api/applications/status/{status} → Filter by status
GET    /api/applications/search?company= → Search by company
```

### AI Features
```
POST   /api/ai/interview-questions  → Generate interview questions
POST   /api/ai/resume-feedback      → Get resume feedback
POST   /api/ai/cover-letter         → Generate cover letter
```

## Getting Started

### Prerequisites
- Java 17
- Node.js 18+
- PostgreSQL 17 (or Docker)

### Option 1 — Docker (Recommended)
```bash
git clone https://github.com/aarthi-reddy/job-tracker.git
cd job-tracker
GROQ_API_KEY="your_key_here" docker-compose up --build
```
App runs at `http://localhost:8080`. No local database setup needed.

### Option 2 — Run Locally
```bash
# Backend
git clone https://github.com/aarthi-reddy/job-tracker.git
cd job-tracker
createdb jobtracker
./mvnw spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm start
```
Backend: `http://localhost:8080` | Frontend: `http://localhost:3000`

### Environment Variables
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) (free) |

## Project Structure

```
job-tracker/
├── src/main/java/com/aarthi/jobtracker/
│   ├── config/          # AI API configuration
│   ├── controller/      # REST endpoints
│   ├── dto/             # Request/Response objects
│   ├── entity/          # JPA entities
│   ├── repository/      # Database queries
│   └── service/         # Business logic + AI integration
├── frontend/
│   └── src/
│       ├── components/  # React components
│       ├── App.js       # Main application
│       └── App.css      # Styling
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Full stack orchestration
└── pom.xml              # Maven dependencies
```

## Design Decisions

- **DTOs over Entities in API** — Decouples database schema from API contract. Adding a database column won't break the API.
- **Multi-stage Docker build** — Build stage compiles the JAR, runtime stage only includes the JRE. Keeps the image small and secure.
- **Groq API over OpenAI** — Free tier with generous rate limits, uses Llama 3.3 70B which performs comparably for this use case.
- **JPA Lifecycle Hooks** — `@PrePersist` and `@PreUpdate` automatically manage timestamps instead of manual setter calls.
- **Spring Data JPA query derivation** — Method names like `findByCompanyContainingIgnoreCase` auto-generate SQL queries at startup.

## Roadmap

- [ ] Kafka for async AI processing
- [ ] Redis caching for AI responses
- [ ] Resume PDF upload and parsing
- [ ] Email notifications for status changes
- [ ] AWS deployment with CI/CD pipeline
- [ ] Analytics dashboard with application trends

## Author

**Aarthi Reddy** — [GitHub](https://github.com/aarthi-reddy)

Built as a portfolio project to demonstrate full-stack development with AI integration.
