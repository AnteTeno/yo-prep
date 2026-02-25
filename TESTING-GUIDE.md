# YOprep - Testausstrategia & Haastattelumateriaali

## 1. Testien rakenne

```
src/test/java/com/anteteno/yoprep/
├── YoprepApplicationTests.java          ← Smoke test (Spring context latautuu)
├── controller/
│   ├── QuestionControllerTest.java      ← API-integraatiotestit (7 testiä)
│   └── UserControllerTest.java          ← API-integraatiotestit (7 testiä)
├── service/
│   ├── QuestionServiceTest.java         ← Yksikkötestit Mockitolla (7 testiä)
│   └── UserServiceTest.java             ← Yksikkötestit Mockitolla (8 testiä)
├── repository/
│   ├── QuestionRepositoryTest.java      ← Tietokantatesit (6 testiä)
│   └── UserRepositoryTest.java          ← Tietokantatesit (6 testiä)
└── entity/
    └── QuestionEntityTest.java          ← Puhtaat yksikkötestit (8 testiä)
```

**Yhteensä: ~50 testiä** jaettuna neljään kategoriaan.

---

## 2. Testityypit ja miksi ne valittiin

### A) Controller-testit (Integraatiotestit)
**Tiedostot:** `QuestionControllerTest.java`, `UserControllerTest.java`
**Annotaatiot:** `@SpringBootTest` + `@AutoConfigureMockMvc`

**Mitä testaavat:**
- HTTP-endpointit kokonaisuutena (controller → service → repository → H2)
- Statuskoodit (200, 400, 404)
- JSON-vastauksen rakenne
- Virheidenkäsittely

**Miksi MockMvc eikä oikeaa HTTP:tä:**
- Ei tarvitse käynnistää oikeaa palvelinta
- Nopeampi suorittaa
- Spring konteksti ladataan kerran, testit jakavat sen
- Pääsee testaamaan koko ketjun controller → database

**Esimerkki selitettäväksi:**
```java
@Test
void createQuestion_returnsCreatedQuestion() throws Exception {
    // ARRANGE: Rakennetaan testikysymys
    Question question = Question.builder()
            .examCode("pmat_k2025")
            .subject("mathematics")
            .questionText("Laske 2 + 2")
            .correctAnswer("4")
            .build();

    // ACT & ASSERT: Lähetetään POST-pyyntö ja tarkistetaan vastaus
    mockMvc.perform(post("/api/questions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(question)))
            .andExpect(status().isOk())                          // HTTP 200
            .andExpect(jsonPath("$.id").isNotEmpty())             // ID generoitu
            .andExpect(jsonPath("$.examCode").value("pmat_k2025")); // Data oikein
}
```

### B) Service-testit (Yksikkötestit)
**Tiedostot:** `QuestionServiceTest.java`, `UserServiceTest.java`
**Annotaatiot:** `@ExtendWith(MockitoExtension.class)`

**Mitä testaavat:**
- Liiketoimintalogiikka eristettynä
- Poikkeustilanteet (404, duplikaatit)
- Salasanan hashaus
- Login-logiikka

**Miksi Mockito:**
- Testataan VAIN service-kerrosta, ei tietokantaa
- Repository mockataan → testi ei riipu tietokannasta
- Nopein testitype, millisekunteja per testi
- Paljastaa logiikkavirheet service-kerroksessa

**Esimerkki selitettäväksi:**
```java
@Mock
private UserRepository userRepository;      // Feikkirepo

@Mock
private PasswordEncoder passwordEncoder;    // Feikkihasher

@InjectMocks
private UserService userService;            // Oikea service, feikkiriippuvuudet

@Test
void createUser_hashesPasswordBeforeSaving() {
    // ARRANGE
    User input = User.builder().username("new").password("PlainText").build();
    when(userRepository.findUserByUsername("new")).thenReturn(null);     // Ei duplikaattia
    when(passwordEncoder.encode("PlainText")).thenReturn("$2a$hashed"); // Mock hashaus

    // ACT
    userService.createUser(input);

    // ASSERT: Varmistetaan että salasana hashattiin
    verify(passwordEncoder, times(1)).encode("PlainText");
    verify(userRepository, times(1)).save(any(User.class));
}
```

### C) Repository-testit
**Tiedostot:** `QuestionRepositoryTest.java`, `UserRepositoryTest.java`
**Annotaatiot:** `@DataJpaTest`

**Mitä testaavat:**
- CRUD-operaatiot (save, findById, delete)
- Custom query-metodit (findByUsername, findByEmail)
- Kenttien persistointi (kaikki kentät tallentuvat oikein)
- @PrePersist (createdAt asetetaan automaattisesti)

**Miksi @DataJpaTest eikä @SpringBootTest:**
- Lataa VAIN JPA-kerroksen (ei controllereita, ei securityä)
- Käyttää automaattisesti H2 in-memory -tietokantaa
- Jokainen testi on transaktiossa → rollback testin jälkeen
- Nopea ja eristetty

### D) Entity-testit (Puhtaat yksikkötestit)
**Tiedosto:** `QuestionEntityTest.java`
**Ei annotaatioita** (ei Spring-kontekstia)

**Mitä testaavat:**
- Builder-pattern toimii
- ExamCode-nimeämiskonventio (regex-validointi)
- Vaikeustasot
- Lombok @Data: equals/hashCode

**Miksi erillinen:**
- Nopein mahdollinen testi (ei Spring, ei tietokanta)
- Testaa domain-sääntöjä
- Parametrisoidut testit (@ParameterizedTest) näyttävät osaamista

---

## 3. Työkaluvalinnat ja perustelut

| Työkalu | Rooli | Miksi valitsin |
|---------|-------|---------------|
| **JUnit 5** | Testikehys | Java-testauksen standardi. Tukee @DisplayName, @ParameterizedTest, @Nested |
| **MockMvc** | API-testaus | Spring Bootin oma, ei erillistä HTTP-palvelinta, nopea |
| **Mockito** | Mockaus | Integroitu Spring Boot Testiin. @Mock + @InjectMocks riittää |
| **AssertJ** | Assertiot | Fluent API: `assertThat(x).isEqualTo(y)`. Paremmat virheilmoitukset kuin JUnit |
| **H2** | Testitietokanta | In-memory, ei vaadi asennusta. @DataJpaTest käyttää automaattisesti |
| **@DataJpaTest** | Repository-testit | Lataa vain JPA:n → nopea. Automaattinen rollback |
| **Maven Surefire** | Testien ajo | Standardi Maven-plugin. `./mvnw test` ajaa kaikki testit |

**Miksi en käyttänyt REST Assuredia:**
- MockMvc riittää Spring Boot -projektissa
- REST Assured olisi tuonut ylimääräisen riippuvuuden
- MockMvc testaa koko Spring-kontekstin (filtteriketju, virheidenkäsittely)

---

## 4. Testipyramidi tässä projektissa

```
         /\
        /  \     E2E-testit (ei vielä - tulevaisuudessa Selenium/Cypress)
       /    \
      /------\
     /        \   Integraatiotestit = Controller-testit (MockMvc)
    /          \                      14 testiä
   /------------\
  /              \ Yksikkötestit = Service + Entity + Repository
 /                \                 ~36 testiä
/------------------\
```

**Pyramidiprinsiippi:** Eniten yksikkötestejä (nopeita), vähemmän integraatiotestejä (hitaampia).

---

## 5. Bugiraportin kirjoittaminen

Kun testi löytää bugin, kirjoita raportti näin:

### Esimerkki bugiraportista:

```
BUGI-001: POST /api/users palauttaa salasanan selkotekstinä

Vakavuus: KRIITTINEN (tietoturva)
Ympäristö: Java 21, Spring Boot 3.4.1, H2 in-memory
Löytämistapa: Automatisoitu testi (UserControllerTest)

KUVAUS:
POST /api/users -endpoint palauttaa User-objektin joka sisältää
password-kentän. Vaikka salasana on hashattu, hashia ei pitäisi
palauttaa API-vastauksessa.

TOISTAMISOHJEET:
1. Lähetä POST http://localhost:8080/api/users
   Body: {"username":"test","email":"t@t.com","password":"salasana"}
2. Tarkista vastauksen JSON

ODOTETTU TULOS:
Vastaus EI sisällä password-kenttää:
  {"id":1, "username":"test", "email":"t@t.com", "createdAt":"..."}

TODELLINEN TULOS:
Vastaus sisältää hashatun salasanan:
  {"id":1, "username":"test", "email":"t@t.com",
   "password":"$2a$10$xyz...", "createdAt":"..."}

LÖYTÄNYT TESTI:
UserControllerTest.createUser_passwordIsHashed()

KORJAUSEHDOTUS:
- Luo erillinen UserResponseDTO joka ei sisällä password-kenttää
- Tai lisää @JsonIgnore-annotaatio User.password-kenttään
```

### Bugiraportin rakenne yleisesti:

1. **Otsikko** - Selkeä, yksirivinen kuvaus
2. **Vakavuus** - Kriittinen / Korkea / Keskitaso / Matala
3. **Ympäristö** - Versiot, käyttöjärjestelmä, tietokanta
4. **Toistamisohjeet** - Tarkat vaiheet (kuka tahansa voi toistaa)
5. **Odotettu tulos** - Mitä pitäisi tapahtua
6. **Todellinen tulos** - Mitä oikeasti tapahtui
7. **Liitteet** - Kuvakaappaus, logi, testikoodi
8. **Korjausehdotus** - Jos osaat ehdottaa

---

## 6. Miten selittää haastattelussa

### "Kerro projektin testausstrategiasta"

> "Rakensin testit kolmeen kerrokseen. Alimpana on yksikkötestit jotka
> testaavat service-kerrosta Mockitolla - ne ovat nopeimpia ja niitä on
> eniten. Keskellä on repository-testit @DataJpaTestillä jotka
> varmistavat tietokantakyselyjen toimivuuden. Päällimmäisenä on
> integraatiotestit MockMvc:llä jotka testaavat koko HTTP-ketjun."

### "Miten valitsit työkalut?"

> "Käytin Spring Bootin omia testityökaluja koska ne integroituvat
> saumattomasti: MockMvc API-testaukseen, @DataJpaTest repository-
> testaukseen, ja Mockito service-testaukseen. AssertJ assertioihin
> koska sen fluent API tekee testeistä luettavampia. H2 in-memory
> tietokannaksi koska se ei vaadi erillistä asennusta."

### "Miten kirjoitat bugiraportin?"

> "Käytän vakiomuotoista raporttia: otsikko, vakavuus, toistamisohjeet,
> odotettu vs. todellinen tulos. Tärkein osa on toistamisohjeet - ne
> pitää olla niin tarkat, että kuka tahansa tiimistä voi toistaa
> bugin. Liitän aina testin joka löysi bugin, se toimii samalla
> regressiotestinä korjauksen jälkeen."

### "Mitä testaisit seuraavaksi?"

> "Lisäisin validointitestit (tyhjät kentät, liian pitkät syötteet),
> suorituskykytestit vastausaikojen seurantaan, ja E2E-testit
> Cypress:llä jotka testaavat frontendin ja backendin yhdessä."

---

## 7. Pikakomennot testien ajoon

```bash
# Kaikki testit
./mvnw test

# Vain controller-testit
./mvnw test -Dtest="*ControllerTest"

# Vain service-testit
./mvnw test -Dtest="*ServiceTest"

# Vain repository-testit
./mvnw test -Dtest="*RepositoryTest"

# Yksittäinen metodi
./mvnw test -Dtest="UserServiceTest#login_wrongPassword_throwsUnauthorized"

# Verbose output
./mvnw test -Dtest="QuestionServiceTest" -X
```
