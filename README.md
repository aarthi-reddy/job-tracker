# JobTracker — AI-Powered Job Application Tracker

A full-stack job application tracking platform with AI-powered career coaching, built with Spring Boot and React.

**Live Demo:** [http://13.218.88.170:8080](http://13.218.88.170:8080)

## Features

### Core Application
- **Kanban Board** — Track jobs across 6 status columns (Applied, Phone Screen, Technical, Onsite, Offer, Rejected)
- **Smart Add** — Paste a job URL or description and AI automatically extracts company, role, and details
- **Document Management** — Upload resume and cover letter PDFs per job with in-app PDF viewer
- **Email Notifications** — Automatic email alerts on new applications and status changes, sent to the logged-in user's email
- **Email OTP Verification** — 6-digit OTP sent to email during signup, with resend and expiry support
- **Multi-User Support** — JWT authentication with BCrypt password hashing and user-specific data isolation
- **Responsive Design** — Fully responsive UI optimized for desktop, tablet, and mobile devices

### AI Career Coach (Groq API — Llama 3.3 70B)
- **Interview Prep** — Generates role-specific interview questions (technical, behavioral, system design)
- **Resume Review** — AI-powered resume feedback tailored to the target role (supports PDF upload)
- **Cover Letter Generator** — Customized cover letters based on your resume and the job
- **Smart Job Search** — AI analyzes your resume and suggests matching jobs with filtered links to LinkedIn, Indeed, Google Jobs, and Glassdoor
- **Skill Gap Analysis** — Compare your resume against a job description to identify missing skills and get recommendations
- **Resume Score** — Resume scored out of 100 with category breakdowns and actionable improvement tips

### Admin Dashboard
- Platform usage statistics (total users, applications, documents)
- Application status breakdown chart
- User registration details and activity metrics
- Access restricted to admin email only

## Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.5**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **Spring WebFlux** (WebClient for external API calls)
- **Spring Mail** for async email notifications and OTP verification
- **Apache PDFBox 3.0** for PDF text extraction
- **Groq API** (Llama 3.3 70B) for all AI features

### Frontend
- **React 18** with functional components and hooks
- **Axios** for API communication
- **CSS3** with custom responsive design (desktop, tablet, mobile)

### Infrastructure
- **PostgreSQL 17** database
- **Docker** multi-stage containerized build
- **AWS EC2** (Amazon Linux 2023) production deployment

## Architecture

```
React Frontend (Responsive — Desktop / Tablet / Mobile)
    |
    | Axios HTTP + JWT Bearer Token
    v
Spring Boot REST API (port 8080)
    ├── AuthController         -> Registration, Login, OTP Verification
    ├── JobApplicationController -> CRUD operations
    ├── AIController           -> AI career coach features
    ├── ResumeController       -> Document upload/download
    ├── AdminController        -> Platform statistics
    |
    ├── JobApplicationService  -> Business logic + email triggers
    ├── AIService              -> Groq API integration
    ├── ResumeService          -> PDF processing with PDFBox
    ├── EmailService           -> Async email, OTP, notifications
    |
    ├── SecurityConfig         -> JWT filter chain
    ├── JwtUtil                -> Token generation/validation
    └── JwtAuthFilter          -> Request authentication
```

## Project Structure

```
job-tracker/
├── src/main/java/com/aarthi/jobtracker/
│   ├── config/          # Security, JWT, Web configuration
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Request/Response objects
│   ├── entity/          # JPA entities (User, JobApplication, Resume)
│   ├── repository/      # Data access layer
│   └── service/         # Business logic, AI, Email services
├── frontend/
│   └── src/
│       ├── components/  # AuthPage, JobBoard, JobForm, AITools, AdminPage
│       ├── App.js       # Main application with routing
│       └── App.css      # Complete responsive styles
├── Dockerfile           # Multi-stage Docker build
└── pom.xml              # Maven dependencies
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (sends OTP) |
| POST | `/api/auth/verify-otp` | Verify email with OTP |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| POST | `/api/auth/login` | Login and get JWT token |

### Job Applications (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | Get all user applications |
| POST | `/api/applications` | Create new application |
| PUT | `/api/applications/{id}` | Update application |
| DELETE | `/api/applications/{id}` | Delete application |
| GET | `/api/applications/status/{status}` | Filter by status |
| GET | `/api/applications/search?company=` | Search by company |

### AI Features (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/interview-questions` | Generate interview questions |
| POST | `/api/ai/resume-feedback` | Get resume feedback (text) |
| POST | `/api/ai/upload-resume` | Upload resume PDF for feedback |
| POST | `/api/ai/cover-letter` | Generate cover letter |
| POST | `/api/ai/upload-resume-cover-letter` | Cover letter from PDF |
| POST | `/api/ai/job-match` | Find matching jobs from resume |
| POST | `/api/ai/skill-gap` | Analyze skill gaps |
| POST | `/api/ai/resume-score` | Score resume out of 100 |
| POST | `/api/ai/extract-job-url` | Extract job details from URL |

### Documents (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload/{appId}` | Upload document |
| GET | `/api/documents/download/{id}` | Download/view document |
| DELETE | `/api/documents/{id}` | Delete document |

### Admin (requires JWT + admin email)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get platform statistics |

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 17
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/aarthi-reddy/job-tracker.git
cd job-tracker
```

2. Create the database
```bash
createdb jobtracker
```

3. Create `src/main/resources/application.properties`
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/jobtracker
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
groq.api.key=YOUR_GROQ_API_KEY
jwt.secret=YOUR_JWT_SECRET_AT_LEAST_256_BITS
jwt.expiration=86400000
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
resume.upload.dir=uploads/resumes
```

4. Build the frontend
```bash
cd frontend
npm install
npm run build
cp -r build/* ../src/main/resources/static/
cd ..
```

5. Run the application
```bash
./mvnw spring-boot:run
```

6. Open [http://localhost:8080](http://localhost:8080)

### Docker Deployment

```bash
docker build -t jobtracker-api .

docker network create jobtracker-net

docker run -d --name jobtracker-db --network jobtracker-net \
  -e POSTGRES_DB=jobtracker \
  -e POSTGRES_USER=YOUR_USER \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD \
  postgres:17

docker run -d --name jobtracker-api --network jobtracker-net \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://jobtracker-db:5432/jobtracker \
  -e SPRING_DATASOURCE_USERNAME=YOUR_USER \
  -e SPRING_DATASOURCE_PASSWORD=YOUR_PASSWORD \
  -e GROQ_API_KEY=YOUR_GROQ_KEY \
  jobtracker-api
```

## Design Decisions

- **DTOs over Entities in API** — Decouples database schema from API contract. Adding a database column won't break the API.
- **Multi-stage Docker build** — Build stage compiles the JAR, runtime stage only includes the JRE. Keeps the image small and secure.
- **Groq API over OpenAI** — Free tier with generous rate limits, uses Llama 3.3 70B which performs comparably for this use case.
- **Async email with @Async** — Email sending runs in a background thread so API responses are not delayed.
- **User email passed to async service** — SecurityContext doesn't propagate to async threads, so the user email is passed directly to the email service.
- **Email OTP verification** — New accounts require a 6-digit code sent via email, preventing fake signups and verifying email ownership.
- **JWT stored in localStorage** — Simple approach for SPA authentication with axios default headers.
- **Static files served from Spring Boot** — React build is copied into `src/main/resources/static/` so a single JAR serves both frontend and API.
- **Responsive CSS with media queries** — Three breakpoints (1024px, 768px, 480px) ensure the app works on all screen sizes without a CSS framework.

## Author

**Aarthi Reddy** — [GitHub](https://github.com/aarthi-reddy)

Built as a portfolio project demonstrating full-stack development with AI integration, cloud deployment, and production-ready architecture.