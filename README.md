# Yoprep

**Backend application for practicing Finnish matriculation exams**

Yoprep is a Spring Boot REST API that helps students prepare for Finnish matriculation exams (ylioppilaskirjoitukset) by providing a structured collection of past exam questions.

## Features

- **User Management**: REST API for user registration and authentication
- **Question Database**: Structured storage of exam questions with metadata
- **HTML Parser**: Automated extraction of questions from YLE Abitreenit using JSoup
- **Flexible Data Model**: JSON-based question storage for handling various question types
- **Progress Tracking**: (Planned) Track user progress and performance

## Tech Stack

**Backend Framework**
- Java 21
- Spring Boot 4.0.0
- Spring Data JPA
- Spring Security

**Database**
- H2 (Development)
- PostgreSQL (Planned for production)

**Libraries & Tools**
- Maven - Build tool
- Lombok - Boilerplate reduction
- JSoup - HTML parsing
- Jackson - JSON processing

## Architecture

The application follows a layered architecture pattern:

```
Controller Layer (REST endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Database
```

### Key Design Patterns
- **Dependency Injection**: Constructor-based injection for better testability
- **Repository Pattern**: Spring Data JPA repositories for database operations
- **DTO Pattern**: Separation of database entities and API responses (planned)

## Project Structure

```
src/main/java/com/anteteno/yoprep/
├── controller/          # REST API endpoints
├── service/             # Business logic
├── repository/          # Data access layer
├── model/               # JPA entities
└── config/              # Spring configuration

src/main/resources/
└── application.properties
```

## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `DELETE /api/users/{id}` - Delete user

### Questions (Planned)
- `POST /api/questions` - Create question
- `GET /api/questions` - Get all questions
- `GET /api/questions/exam/{examCode}` - Get questions by exam code
- `GET /api/questions/subject/{subject}` - Get questions by subject

## Getting Started

### Prerequisites
- Java 21 or higher
- Maven 3.6+

### Running the Application

```bash
# Clone the repository
git clone https://github.com/yourusername/yoprep.git
cd yoprep

# Run with Maven Wrapper
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/yoprep-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

### Database Console

H2 console is available at `http://localhost:8080/h2-console`

**Connection details:**
- JDBC URL: `jdbc:h2:mem:yoprepdb`
- Username: `sa`
- Password: (empty)

## Development

### Running Tests
```bash
./mvnw test
```

### Building
```bash
./mvnw clean install
```

## Data Source

Exam questions are sourced from [YLE Abitreenit](https://yle.fi/aihe/abitreenit), a public service by Finnish Broadcasting Company (YLE) for exam preparation.

## Roadmap

- [x] User entity and REST API
- [x] Question entity and database model
- [x] HTML parser for YLE Abitreenit
- [ ] Question REST API (CRUD operations)
- [ ] User progress tracking
- [ ] Authentication & Authorization (JWT)
- [ ] Question search and filtering
- [ ] PostgreSQL migration
- [ ] Frontend (React planned)

## Learning Outcomes

This project demonstrates:
- Modern Spring Boot application development
- RESTful API design
- Layered architecture and separation of concerns
- Dependency injection patterns
- JPA/Hibernate for data persistence
- Web scraping and data extraction
- JSON data modeling

## License

This project is for educational purposes.

## Author

Ante Tenoranta - [GitHub](https://github.com/antetenoranta)
