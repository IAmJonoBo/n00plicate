FROM mcr.microsoft.com/devcontainers/base:bookworm

ARG NODE_VERSION=24.11.0
ENV NVM_DIR=/usr/local/share/nvm
ENV PNPM_STORE_PATH=/opt/pnpm-store
ENV PATH="${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:${PATH}"
# Legacy Nx environment variables removed — Nx is no longer part of the workspace toolchain

# Install OS-level dependencies for mobile development prior to dropping root
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    git \
    openjdk-17-jdk=17.0.11+9-1~deb12u1 \
    android-sdk=25.2.5+6 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 24.11.0 via nvm and activate pnpm 10.21.0
RUN mkdir -p ${NVM_DIR} \
    && curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && bash -lc ". ${NVM_DIR}/nvm.sh \
        && nvm install ${NODE_VERSION} \
        && nvm alias default ${NODE_VERSION} \
        && nvm use ${NODE_VERSION} \
        && corepack enable \
        && corepack prepare pnpm@10.21.0 --activate"

# Configure a shared pnpm store to act as the workspace wheelhouse and prefetch all dependencies
RUN mkdir -p ${PNPM_STORE_PATH} \
    && corepack prepare pnpm@10.21.0 --activate \
    && pnpm config set store-dir ${PNPM_STORE_PATH} --global

# Copy dependency manifests and hydrate the pnpm store for offline installs
WORKDIR /tmp/wheelhouse
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
RUN pnpm fetch --workspace-root --prod --dev \
    && rm -f package.json pnpm-workspace.yaml pnpm-lock.yaml*

# Create a non-root user for development and grant access to the shared pnpm store
RUN useradd -m appuser \
    && chown -R appuser:appuser ${PNPM_STORE_PATH}
RUN echo '#!/bin/bash\nollama pull llama3:8b &' > /usr/local/bin/setup-ollama.sh && \
    chmod +x /usr/local/bin/setup-ollama.sh

USER appuser

# Ensure pnpm binaries resolve for the non-root user
ENV PNPM_HOME="/home/appuser/.local/share/pnpm"
ENV PATH="$PNPM_HOME:${PATH}"
RUN mkdir -p "${PNPM_HOME}" \
    && corepack prepare pnpm@10.21.0 --activate

# Install Rust and Cargo (for Tauri) as the non-root user
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
SHELL ["/bin/sh", "-c"]
ENV PATH="/home/appuser/.cargo/bin:${PATH}"

# Set JAVA_HOME and Android SDK environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_SDK_ROOT=/usr/lib/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Install Node.js development helpers with pnpm
# Nx removed from the workspace; global `@nx/cli` is not installed anymore

# Create workspace directory and set as working directory
WORKDIR /workspace

# Add a simple healthcheck (checks if node is available)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node --version || exit 1
