# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yoprep is a Spring Boot REST API for practicing Finnish matriculation exams (ylioppilaskirjoitukset). It scrapes past exam questions from YLE Abitreenit using JSoup, stores them in a database with JSON-based flexible storage, and provides APIs for user management and question access.

**Tech Stack**: Java 21, Spring Boot 4.0.0, Spring Data JPA, Spring Security, H2 (dev), Maven, Lombok, JSoup, Jackson

## Build & Run Commands

```bash
# Run application
./mvnw spring-boot:run

# Build JAR
./mvnw clean package

# Run tests
./mvnw test

# Run single test class
./mvnw test -Dtest=ClassName

# Run single test method
./mvnw test -Dtest=ClassName#methodName

# Clean and install
./mvnw clean install
```

**Application starts on**: `http://localhost:8080`

**H2 Console**: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:yoprepdb`
- Username: `sa`
- Password: (empty)

## Architecture

Standard layered Spring Boot architecture:
- **Controller Layer** (`controller/`): REST endpoints, request/response handling
- **Service Layer** (`service/`): Business logic, validation, transformation
- **Repository Layer** (`repository/`): Spring Data JPA repositories
- **Model Layer** (`model/`): JPA entities with Lombok

Constructor-based dependency injection is used throughout (via `@RequiredArgsConstructor` or explicit constructors).

## Key Design Patterns

### JSON Storage for Questions
The `Question` entity stores question data as JSON strings (`questionJson` and `hvpJson` fields) rather than normalized tables. This provides flexibility for various question formats (multiple choice, open-ended, multi-part) without schema migrations.

### Password Hashing
`UserService` uses BCrypt via Spring Security's `PasswordEncoder` bean (configured in `SecurityConfig`). Raw passwords are hashed before saving to database.

### Security Configuration
`SecurityConfig.java` currently permits all requests and disables CSRF **for development only**. This is intentional for the current phase but should be secured before production:
- JWT/session-based authentication needs implementation
- CSRF should be re-enabled for state-changing operations
- Endpoint-level authorization needs configuration

### HTML Parsing with JSoup
`HtmlParserService` extracts question data from YLE Abitreenit HTML files:
1. Parses HTML structure looking for specific CSS classes (`.e-exam-question`, `.e-level-0`, etc.)
2. Extracts question numbers from `data-toc-id` or `id` attributes
3. Parses point values using regex from `.e-score` elements
4. Structures data as nested JSON (main questions contain sub-questions in `parts` array)
5. Uses Jackson `ObjectMapper` to build JSON structure programmatically

## Database Notes

### Development Database
- H2 in-memory database configured in `application.properties`
- Schema is recreated on each restart (`ddl-auto=create-drop`)
- SQL logging enabled for debugging (`show-sql=true`, `format_sql=true`)

### Entity Lifecycle
- `User` entity uses `@PrePersist` to auto-set `createdAt` timestamp
- Both `User` and `Question` use auto-incrementing IDs (`@GeneratedValue(strategy = GenerationType.IDENTITY)`)

## Current API Endpoints

### Users
- `POST /api/users` - Register new user (password auto-hashed)
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `DELETE /api/users/{id}` - Delete user

Note: Authentication endpoints exist in `UserService.login()` but are not yet exposed via REST controller.

## Code Patterns to Follow

### Exception Handling
Use `ResponseStatusException` for REST errors (see `UserService` for examples):
```java
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
```

### Lombok Usage
- `@Data` on entities for getters/setters/toString/equals/hashCode
- `@Builder` for test data and complex object creation
- `@RequiredArgsConstructor` for constructor injection
- `@NoArgsConstructor` and `@AllArgsConstructor` for JPA compatibility

### Jackson for JSON
Use `ObjectMapper` for JSON operations:
- `objectMapper.createObjectNode()` for building JSON
- `objectMapper.readTree()` for parsing JSON strings
- `objectMapper.writerWithDefaultPrettyPrinter()` for formatted output

## Incomplete Features

### HtmlParserService.parseAndSaveQuestions()
Located at `src/main/java/com/anteteno/yoprep/service/HtmlParserService.java:182-206`, this method is partially implemented:
- Parses HTML and creates exam JSON structure
- Creates `Question` entities but doesn't fully populate all fields
- Returns `null` instead of saved questions
- Missing proper JSON string conversion for database storage

When working on this, note that `Question.questionJson` should be stored as a JSON string, not a Jackson `JsonNode` object.

## Future Roadmap Context

The following are planned but not yet implemented:
- Question CRUD REST API endpoints
- User progress tracking
- JWT-based authentication
- PostgreSQL migration for production
- Frontend (React planned)
