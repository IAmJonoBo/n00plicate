# Token Orchestrator

Rust CLI and WebAssembly bindings that normalise Penpot DTCG exports, enforce the n00plicate token governance
contract, and generate multi-platform artefacts in `packages/tokens-outputs/`.

## Capabilities

- Parse Penpot DTCG JSON exports and flatten nested collections into a canonical graph.
- Run governance checks that verify token types, value presence, and path hygiene before generation.
- Emit CSS custom properties, TypeScript modules, Jetpack Compose constants, and Flutter/Dart constants.
- Stream outputs into `packages/tokens-outputs/` for downstream builds while exposing the same artefacts to
  wasm consumers as JSON strings.
- Instrument the pipeline with `tracing` + OpenTelemetry spans (ingest, governance, emit) with optional
  air-gapped execution.

## Installation

The orchestrator ships as part of the workspace. Ensure the Rust toolchain is installed and targets for
WASM (`wasm32-unknown-unknown`) are available when building bindings.

```bash
rustup target add wasm32-unknown-unknown
```

## Usage

```bash
# Run with defaults (reads ./tokens.json, writes to packages/tokens-outputs)
cargo run --manifest-path packages/token-orchestrator/Cargo.toml \
  --bin n00plicate-token-orchestrator

# Validate without emitting files
cargo run --manifest-path packages/token-orchestrator/Cargo.toml \
  --bin n00plicate-token-orchestrator -- --validate-only

# Force air-gapped mode (skips remote exporters, still records spans locally)
cargo run --manifest-path packages/token-orchestrator/Cargo.toml \
  --no-default-features --features airgap --bin n00plicate-token-orchestrator

# Build native + wasm artefacts
cargo build --manifest-path packages/token-orchestrator/Cargo.toml --release
cargo build --manifest-path packages/token-orchestrator/Cargo.toml --release --target wasm32-unknown-unknown
```

Generated files land in:

- `packages/tokens-outputs/css/tokens.css`
- `packages/tokens-outputs/ts/tokens.ts`
- `packages/tokens-outputs/compose/Tokens.kt`
- `packages/tokens-outputs/dart/tokens.dart`

### Nx / pnpm integration

`pnpm tokens:sync` now runs the Rust orchestrator before invoking the legacy Style Dictionary build.
`pnpm tokens:validate` executes the governance checks in Rust and then runs the existing contract validation
script to maintain parity during the transition.

## Telemetry

Telemetry is enabled by default via the `telemetry` feature and emits spans using `tracing` +
`opentelemetry-sdk`. Use `--no-telemetry` at runtime to disable instrumentation or compile with
`--no-default-features --features airgap` to opt into an air-gapped build where no exporters are registered.

Tests rely on `telemetry::init_test_tracer` to capture spans in-memory, ensuring the ingest, governance, and
emit stages remain observable.

## WebAssembly bindings

When compiled to `wasm32-unknown-unknown`, the crate exposes `orchestrate_to_json(json: &str)` via
`wasm-bindgen`. The function returns a JSON object with the generated artefacts instead of touching the file
system, enabling browsers and serverless runtimes to reuse the same pipeline.
