package edu.simulacros;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;

final class CaseRules {
    private CaseRules() {}

    static String owner(int id) { return null; }

    static ObjectNode seed(ObjectMapper json, int id) {
        ObjectNode state = json.createObjectNode().put("id", id);
        state.put("name", "Taller " + id).put("discipline", id % 2 == 0 ? "Teatro" : "Cerámica")
            .put("date", "2026-12-01").put("vacancies", 8);
        state.putArray("sessions").addObject().put("id", 1).put("startsAt", "10:00").put("vacancies", 4);
        state.withArray("sessions").addObject().put("id", 2).put("startsAt", "14:00").put("vacancies", 4);
        state.putObject("enrollments");
        return state;
    }

    static ObjectNode detail(ObjectNode state) {
        state.remove("enrollments");
        return state;
    }

    static ObjectNode summary(ObjectNode state) {
        state.remove("sessions");
        return detail(state);
    }

    static ObjectNode apply(ObjectNode state, JsonNode input, String email) {
        int sessionId = integer(input, "sessionId", 1, 2);
        ObjectNode session = find(state, "sessions", sessionId);
        String level = choice(input, "experienceLevel", "BEGINNER", "INTERMEDIATE", "ADVANCED");
        ObjectNode enrollments = (ObjectNode) state.get("enrollments");
        String key = sessionId + ":" + email;
        if (enrollments.has(key)) throw Failure.conflict("ALREADY_ENROLLED", "Ya tienes una inscripción en esta sesión.");
        int vacancies = session.path("vacancies").asInt();
        if (vacancies == 0) throw Failure.conflict("SESSION_FULL", "La sesión está llena.");
        enrollments.put(key, level);
        session.put("vacancies", vacancies - 1);
        state.put("vacancies", state.path("vacancies").asInt() - 1);
        return state.objectNode().put("sessionId", sessionId).put("experienceLevel", level);
    }

    private static int integer(JsonNode input, String field, int min, int max) {
        JsonNode value = input.path(field);
        if (!value.isIntegralNumber() || !value.canConvertToInt()
            || value.intValue() < min || value.intValue() > max) throw Failure.invalid();
        return value.intValue();
    }

    private static ObjectNode find(ObjectNode state, String field, int id) {
        for (JsonNode option : state.path(field)) {
            if (option.path("id").asInt() == id) return (ObjectNode) option;
        }
        throw Failure.invalid();
    }

    private static String choice(JsonNode input, String field, String... choices) {
        String value = input.path(field).asText();
        if (!java.util.List.of(choices).contains(value)) throw Failure.invalid();
        return value;
    }
}
