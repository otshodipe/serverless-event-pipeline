const { randomUUID } = require("node:crypto");

function parseBody(event) {
  if (!event || typeof event.body !== "string" || event.body.trim() === "") {
    throw new Error("Request body is required.");
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return ["Payload must be a JSON object."];
  }

  if (typeof payload.source !== "string" || payload.source.trim() === "") {
    errors.push("Field 'source' is required and must be a non-empty string.");
  }

  if (typeof payload.type !== "string" || payload.type.trim() === "") {
    errors.push("Field 'type' is required and must be a non-empty string.");
  }

  if (typeof payload.timestamp !== "string" || Number.isNaN(Date.parse(payload.timestamp))) {
    errors.push("Field 'timestamp' is required and must be an ISO-8601 timestamp.");
  }

  if (!payload.detail || typeof payload.detail !== "object" || Array.isArray(payload.detail)) {
    errors.push("Field 'detail' is required and must be a JSON object.");
  }

  return errors;
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

exports.ingest = async (event = {}) => {
  try {
    const payload = parseBody(event);
    const errors = validatePayload(payload);

    if (errors.length > 0) {
      return buildResponse(400, {
        accepted: false,
        errors,
      });
    }

    const eventId = payload.id || event.requestContext?.requestId || randomUUID();
    const acceptedAt = new Date().toISOString();

    console.log(
      JSON.stringify({
        level: "info",
        message: "Accepted event for ingestion.",
        eventId,
        source: payload.source,
        type: payload.type,
      }),
    );

    return buildResponse(202, {
      accepted: true,
      eventId,
      acceptedAt,
      target: {
        tableName: process.env.EVENTS_TABLE_NAME || "event-pipeline-events-dev",
      },
    });
  } catch (error) {
    return buildResponse(400, {
      accepted: false,
      errors: [error.message],
    });
  }
};
