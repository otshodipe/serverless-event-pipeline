# Roadmap

## Next

- Persist accepted events into DynamoDB instead of returning an acceptance envelope only.
- Add dead-letter handling for malformed downstream writes and replay guidance.
- Add CI to run `./scripts/validate.sh` on pull requests before packaging or deployment.
