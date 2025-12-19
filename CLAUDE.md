# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yoprep is a Spring Boot application (version 4.0.0) for practicing exams. The project uses Java 25 and Maven as the build tool.

## Build System

This project uses Maven with the Maven Wrapper included. Always use the Maven Wrapper (`./mvnw`) instead of a system-installed Maven to ensure consistent builds.

### Common Commands

```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run

# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=YoprepApplicationTests

# Run a specific test method
./mvnw test -Dtest=YoprepApplicationTests#contextLoads

# Package the application (creates JAR in target/)
./mvnw package

# Skip tests during build
./mvnw clean install -DskipTests
```

## Project Structure

```
src/
├── main/
│   ├── java/com/anteteno/yoprep/
│   │   └── YoprepApplication.java (main Spring Boot entry point)
│   └── resources/
│       └── application.properties (Spring configuration)
└── test/
    └── java/com/anteteno/yoprep/
        └── YoprepApplicationTests.java (test suite)
```

## Architecture

- **Framework**: Spring Boot 4.0.0 with Spring Boot Starter
- **Main Application**: `YoprepApplication.java` contains the `@SpringBootApplication` annotation and main method
- **Package Structure**: All code resides under `com.anteteno.yoprep`
- **Testing**: Uses JUnit 5 (Jupiter) with Spring Boot Test support

## Configuration

Application configuration is in `src/main/resources/application.properties`. Currently only defines the application name as "yoprep".

## Development Notes

- Java version: 25
- The project follows standard Spring Boot conventions
- Maven parent POM elements are explicitly overridden (licenses, developers) as per Spring Boot Maven design
