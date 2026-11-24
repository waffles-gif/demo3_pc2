package edu.simulacros;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
class Api {
    private final Lab lab;

    Api(Lab lab) { this.lab = lab; }

    @GetMapping("/health")
    Map<String, String> health() { return Map.of("status", "UP"); }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    Map<String, String> register(@Valid @RequestBody Registration input) {
        return lab.register(input);
    }

    @PostMapping("/auth/login")
    Map<String, String> login(@Valid @RequestBody Login input) {
        return lab.login(input);
    }

    @GetMapping("/workshops")
    Listing list(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "1") int page,
                 @RequestParam(defaultValue = "5") int size) {
        return lab.list(jwt.getSubject(), page, size);
    }

    @GetMapping("/workshops/{id}")
    ObjectNode detail(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        return lab.detail(id, jwt.getSubject());
    }

    @PostMapping("/workshops/{id}/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    ObjectNode operate(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @RequestBody JsonNode input) {
        return lab.apply(id, jwt.getSubject(), input);
    }

    @Bean
    ApplicationRunner seed() { return args -> lab.seed(); }

    record Registration(@NotBlank @Size(max = 100) String name,
                        @NotBlank @Email @Size(max = 254) String email,
                        @NotNull @Pattern(regexp = "[ -~]{8,72}") String password) {}
    record Login(@NotBlank @Email String email, @NotBlank String password) {}
    record Listing(List<ObjectNode> items, int page, int size, long totalItems, int totalPages) {}
}

@Service
class Lab {
    static final String STUDENT = "estudiante@example.test";
    static final String PARTNER = "companero@example.test";
    private final Accounts accounts;
    private final Catalog catalog;
    private final EntityManager entityManager;
    private final BCryptPasswordEncoder passwords;
    private final JwtEncoder encoder;
    private final ObjectMapper json;

    Lab(Accounts accounts, Catalog catalog, EntityManager entityManager,
        BCryptPasswordEncoder passwords, JwtEncoder encoder, ObjectMapper json) {
        this.accounts = accounts;
        this.catalog = catalog;
        this.entityManager = entityManager;
        this.passwords = passwords;
        this.encoder = encoder;
        this.json = json;
    }

    @Transactional
    public void seed() {
        if (catalog.count() > 0) return;
        String hash = passwords.encode("Practica123");
        accounts.save(new Account(STUDENT, "Estudiante", hash));
        accounts.save(new Account(PARTNER, "Compañero", hash));
        for (int id = 1; id <= 12; id++) {
            catalog.save(new CatalogRecord(id, CaseRules.owner(id), CaseRules.seed(json, id).toString()));
        }
    }

    @Transactional
    public Map<String, String> register(Api.Registration input) {
        String email = normalize(input.email());
        if (accounts.existsById(email)) throw Failure.conflict("EMAIL_EXISTS", "El correo ya está registrado.");
        entityManager.persist(new Account(email, input.name().strip(), passwords.encode(input.password())));
        entityManager.flush();
        return Map.of("email", email, "name", input.name().strip());
    }

    Map<String, String> login(Api.Login input) {
        Account user = accounts.findById(normalize(input.email())).orElseThrow(Failure::unauthorized);
        if (input.password().length() > 72 || !passwords.matches(input.password(), user.passwordHash)) {
            throw Failure.unauthorized();
        }
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().subject(user.email).issuedAt(now)
            .expiresAt(now.plusSeconds(7200)).build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        return Map.of("token", encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue());
    }

    Api.Listing list(String email, int page, int size) {
        if (page < 1 || size < 1 || size > 50) throw Failure.invalid();
        Specification<CatalogRecord> visible = (row, query, cb) ->
            cb.or(cb.isNull(row.get("owner")), cb.equal(row.get("owner"), email));
        var results = catalog.findAll(visible, PageRequest.of(page - 1, size, Sort.by("id")));
        return new Api.Listing(results.map(row -> CaseRules.summary(read(row))).getContent(),
            page, size, results.getTotalElements(), results.getTotalPages());
    }

    ObjectNode detail(long id, String email) {
        return CaseRules.detail(read(visible(catalog.findById(id), email)));
    }

    @Transactional
    public ObjectNode apply(long id, String email, JsonNode input) {
        CatalogRecord row = visible(catalog.lock(id), email);
        ObjectNode state = read(row);
        ObjectNode result = CaseRules.apply(state, input, email);
        row.payload = state.toString();
        return result;
    }

    private CatalogRecord visible(Optional<CatalogRecord> result, String email) {
        return result.filter(row -> row.owner == null || row.owner.equals(email))
            .orElseThrow(() -> new Failure(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registro no encontrado."));
    }

    private ObjectNode read(CatalogRecord row) {
        try {
            return (ObjectNode) json.readTree(row.payload);
        } catch (com.fasterxml.jackson.core.JsonProcessingException failure) {
            throw new IllegalStateException("Datos del caso ilegibles", failure);
        }
    }

    private String normalize(String email) { return email.strip().toLowerCase(Locale.ROOT); }
}

class Failure extends RuntimeException {
    final HttpStatus status;
    final String code;

    Failure(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    static Failure invalid() {
        return new Failure(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "Revisa los campos de la solicitud.");
    }

    static Failure unauthorized() {
        return new Failure(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Credenciales incorrectas.");
    }

    static Failure conflict(String code, String message) {
        return new Failure(HttpStatus.CONFLICT, code, message);
    }
}

@RestControllerAdvice
class Errors {
    @ExceptionHandler(Failure.class)
    ResponseEntity<Map<String, String>> failure(Failure failure) {
        return ResponseEntity.status(failure.status)
            .body(Map.of("code", failure.code, "message", failure.getMessage()));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
        org.springframework.web.bind.MethodArgumentNotValidException.class})
    ResponseEntity<Map<String, String>> invalid() { return failure(Failure.invalid()); }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, String>> duplicate() {
        return failure(Failure.conflict("EMAIL_EXISTS", "El correo ya está registrado."));
    }
}
