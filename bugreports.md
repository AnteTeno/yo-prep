# YO-PREP BUG REPORTS
---

## BUG #1: Duplicate Email Registration Accepted

**Status:** RESOLVED
**Severity:** CRITICAL
**Component:** User Management / UserService
**Reported Date:** 2026-02-25
**Resolved Date:** 2026-02-25
**Detection Method:** UserServiceTest

### Summary
User registration endpoint accepts duplicate email addresses, causing data integrity violation and potential user account conflicts.

### Description
The `POST /api/users` endpoint does not validate whether an email address is already registered in the system. This allows multiple user accounts to be created with the same email, which violates data integrity constraints and breaks the "unique email per user" business rule.

### Steps to Reproduce
1. Start the application
2. Create first user:

   ```
   POST /api/users
   {
     "username": "user_a",
     "email": "same@example.com",
     "password": "Password123"
   }
   ```
   **Response:** 200 OK 

3. Create second user with same email:
   ```
   POST /api/users
   {
     "username": "user_b",
     "email": "same@example.com",
     "password": "Password456"
   }
   ```
   **Response:** 200 OK  (SHOULD BE 400 Bad Request)

### Expected Result
Should return **HTTP 400 Bad Request**, Error message: "Email already in use"

### Actual Result
Second registration is accepted (HTTP 200). Database contains TWO users with same email


---

## BUG #2: Duplicate Username Registration Accepted

**Status:** RESOLVED
**Severity:** CRITICAL
**Component:** User Management / UserService
**Reported Date:** 2026-02-25
**Detection Method:** UserServiceTest

### Summary
User registration accepts duplicate usernames, causing authentication failures.

### Description
Multiple users can be created with the same username. This breaks login and user identification.

### Steps to Reproduce
1. Create user with username "duplicate_user" → Success
2. Create another user with same username → Success [SHOULD FAIL]

### Expected Result
Second registration returns HTTP 400 Bad Request: "Username already exists"

### Actual Result
Both users created with same username. Login broken.

### Root Cause
`UserService.createUser()` missing username uniqueness validation

### Resolution
Added validation:
```
if (userRepository.findUserByUsername(user.getUsername()) != null) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
}
```

---

## BUG #3: Plaintext Password Storage - Security Vulnerability

**Status:** RESOLVED
**Severity:** CRITICAL
**Component:** User Authentication / Security
**Reported Date:** 2026-02-25
**Detection Method:** UserServiceTest

### Summary
User passwords stored in plaintext instead of hashed. Critical security vulnerability.

### Description
Passwords must be hashed using BCrypt before storage. If database is compromised, all user passwords are exposed. Violates OWASP and GDPR requirements.

### Steps to Reproduce
1. Register user with password "MyPassword123"
2. Query database: `SELECT password FROM users` → Returns plaintext password

### Expected Result
Password stored as BCrypt hash (e.g., `$2a$10$...`)

### Actual Result
Password stored as plaintext "MyPassword123"

### Root Cause
`UserService.createUser()` not calling `passwordEncoder.encode()`

### Resolution
Added password hashing:
```
user.setPassword(passwordEncoder.encode(user.getPassword()));
```

---

## BUG #4: Random Question Returns NullPointerException

**Status:** RESOLVED
**Severity:** HIGH
**Component:** Question Service / Practice Mode
**Reported Date:** 2026-02-25
**Detection Method:** QuestionControllerTest

### Summary
`GET /api/questions/random` crashes with 500 error when database is empty, instead of returning 404.

### Description
When database has no questions, endpoint throws `NullPointerException` instead of handling gracefully.

### Steps to Reproduce
1. Start application with empty questions database
2. Call `GET /api/questions/random`
3. Response: HTTP 500 with NullPointerException

### Expected Result
HTTP 404 Not Found with message: "No questions available"

### Actual Result
HTTP 500 Internal Server Error with stack trace

### Root Cause
`QuestionService.getRandomQuestion()` not checking if list is empty before accessing

### Resolution
Added empty check:
```
List<Question> questions = questionRepository.findAll();
if (questions.isEmpty()) {
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No questions available");
}
```

---

## BUG #5: Invalid Difficulty Levels Accepted

**Status:** RESOLVED
**Severity:** MEDIUM
**Component:** Question Entity / Data Validation
**Reported Date:** 2026-02-25
**Detection Method:** QuestionRepositoryTest

### Summary
Question `difficulty` field accepts invalid values like "super_hard", "trivial", breaking frontend.

### Description
Field should only accept: "easy", "medium", "hard". System accepts any string, corrupting database.

### Steps to Reproduce
Create question with difficulty "super_hard" → HTTP 200 OK [SHOULD FAIL]

### Expected Result
HTTP 400 Bad Request: "Difficulty must be easy, medium, or hard"

### Actual Result
HTTP 200 OK, database stores "super_hard"

### Root Cause
No validation on `difficulty` field

### Resolution
Changed to Enum:
```
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private DifficultyLevel difficulty;

public enum DifficultyLevel { EASY, MEDIUM, HARD }
```

---

## BUG #6: User CreatedAt Timestamp Not Set

**Status:** RESOLVED
**Severity:** MEDIUM
**Component:** User Entity / Data Persistence
**Reported Date:** 2026-02-25
**Detection Method:** UserRepositoryTest

### Summary
User `createdAt` field not set automatically, breaking tracking and analytics.

### Description
`@PrePersist` should set timestamp when user created. Without this, analytics break.

### Steps to Reproduce
Create user without setting `createdAt` → Query database: `createdAt` is null

### Expected Result
`createdAt` automatically set to current time

### Actual Result
`createdAt` is null, analytics broken

### Root Cause
`@PrePersist` method not implemented

### Resolution
Added to User entity:
```java
@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
}
```

---

## BUG #7: Exam Code Format Not Validated

**Status:** RESOLVED
**Severity:** MEDIUM
**Component:** Question Entity / Data Validation
**Reported Date:** 2026-02-25
**Detection Method:** Integration Test

### Summary
`examCode` field accepts invalid formats, breaking filtering and reporting.

### Description
Exam codes must follow format: `subject_Xyear` (e.g., "english_k2024"). System accepts malformed codes.

### Steps to Reproduce
Create question with examCode "invalid_xyz" → HTTP 200 OK [SHOULD FAIL]

### Expected Result
Code must match: `^[a-z]+_(k|s)[0-9]{4}$`
Valid: "english_k2024", "math_s2023"

### Actual Result
Any string accepted, database corrupted

### Root Cause
No validation on `examCode` field

### Resolution
Added @Pattern:
```java
@Pattern(regexp = "^[a-z]+_(k|s)[0-9]{4}$",
    message = "Exam code format: subject_Xyear (e.g., english_k2024)")
private String examCode;
```

---

## BUG #8: Question Points Can Be Negative

**Status:** RESOLVED
**Severity:** MEDIUM
**Component:** Question Entity / Data Validation
**Reported Date:** 2026-02-25
**Detection Method:** Unit Test

### Summary
`points` field accepts negative values, breaking scoring logic.

### Description
Questions created with negative points (-5, -100) make student scores negative and break analytics.

### Steps to Reproduce
Create question with points -5 → HTTP 200 OK [SHOULD FAIL]

### Expected Result
Points must be: 0 < points ≤ 100, invalid values rejected

### Actual Result
Negative points accepted, scoring system broken

### Root Cause
No @Positive or @Min validation on `points` field

### Resolution
Added validation:
```java
@Positive(message = "Points must be greater than 0")
@Max(value = 100, message = "Points cannot exceed 100")
private Integer points;
```

---



