# Yoprep

**Backend application for practicing Finnish matriculation exams**

Yoprep is a Spring Boot REST API that helps students prepare for Finnish matriculation exams (ylioppilaskirjoitukset) by providing a structured collection of past exam questions.


## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `DELETE /api/users/{id}` - Delete user

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

## License

This project is for educational purposes.

## Author

Ante Tenoranta - [GitHub](https://github.com/antetenoranta)

