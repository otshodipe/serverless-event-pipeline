const test = require("node:test");
const assert = require("node:assert/strict");

const { ingest } = require("../handler");

test("accepts a valid ingestion payload", async () => {
  const response = await ingest({
    requestContext: { requestId: "req-123" },
    body: JSON.stringify({
      source: "checkout-service",
      type: "order.created",
      timestamp: "2026-06-27T12:00:00.000Z",
      detail: {
        orderId: "ord_123",
        total: 4200,
      },
    }),
  });

  assert.equal(response.statusCode, 202);

  const body = JSON.parse(response.body);
  assert.equal(body.accepted, true);
  assert.equal(body.eventId, "req-123");
  assert.equal(body.target.tableName, "event-pipeline-events-dev");
});

test("rejects invalid JSON", async () => {
  const response = await ingest({
    body: "{bad json",
  });

  assert.equal(response.statusCode, 400);
  assert.match(response.body, /valid JSON/i);
});

test("rejects payloads missing required fields", async () => {
  const response = await ingest({
    body: JSON.stringify({
      source: "checkout-service",
      detail: {},
    }),
  });

  assert.equal(response.statusCode, 400);

  const body = JSON.parse(response.body);
  assert.equal(body.accepted, false);
  assert.ok(body.errors.length >= 2);
});
