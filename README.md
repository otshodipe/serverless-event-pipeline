# Serverless Event Pipeline

API Gateway to Lambda event-ingestion service with a defined JSON contract, local tests, and packaging validation.

## Tools

- Serverless Framework
- AWS Lambda
- API Gateway HTTP API

## What It Does

- Accepts `POST /events` requests through API Gateway.
- Validates a minimal event envelope before acknowledging ingestion.
- Returns a stable `eventId` and the intended DynamoDB table name for the active stage.

## Event Contract

The request body must be valid JSON with these fields:

- `source`: non-empty string identifying the producer.
- `type`: non-empty string describing the event name.
- `timestamp`: ISO-8601 timestamp for when the producer emitted the event.
- `detail`: JSON object containing event-specific fields.

Example body:

```json
{
  "source": "billing-service",
  "type": "invoice.paid",
  "timestamp": "2026-06-27T12:00:00.000Z",
  "detail": {
    "invoiceId": "inv_123",
    "customerId": "cus_456",
    "amount": 1999
  }
}
```

## Local Validation

Install dependencies once:

```bash
npm install
```

Run the repo-local validation flow:

```bash
./scripts/validate.sh
```

That script:

- Runs `node --test` against the Lambda handler.
- Runs `serverless package` when `node_modules` is present.

## Packaging

Package the service manually when needed:

```bash
npx serverless package
```

The packaged artifact is written to `.serverless/`.

## Smoke Test Payload

A sample API Gateway v2 event is included at [`/Users/oladimejishodipe/cloud-devops-projects/serverless-event-pipeline/events/http-event.json`](/Users/oladimejishodipe/cloud-devops-projects/serverless-event-pipeline/events/http-event.json). Use it with `serverless invoke local` after installing dependencies:

```bash
npx serverless invoke local --function ingest --path events/http-event.json
```

## Deployment Notes

- Default stage is `dev`; override with `--stage`.
- The Lambda advertises its target table through `EVENTS_TABLE_NAME`, currently `${service}-events-${stage}`.
- This repo validates the contract and packaging path, but it does not yet provision DynamoDB resources.

## Field Notes

This is written like a project handoff, not a lab answer. The commands are direct, the assumptions are visible, and anything that needs a real cloud account is marked before it can surprise anyone.
