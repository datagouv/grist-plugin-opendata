FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .

# Inlined into the bundle at build time.
ARG VUE_APP_VALIDATA_URL
ARG VUE_APP_DATAGOUV_CLIENT_ID
ARG VUE_APP_DATAGOUV_IMPORT_URL
ARG VUE_APP_DATAGOUV_TABULAR_API
ARG VUE_APP_GRIST_CHEAT_URL
ARG VUE_APP_GRIST_URL
ARG VUE_APP_DATAGOUV_PUBLISH_URL

# Require vars at build time
RUN set -e; \
    missing=""; \
    for name in VUE_APP_VALIDATA_URL VUE_APP_DATAGOUV_CLIENT_ID \
                VUE_APP_DATAGOUV_IMPORT_URL VUE_APP_DATAGOUV_TABULAR_API \
                VUE_APP_GRIST_CHEAT_URL VUE_APP_GRIST_URL \
                VUE_APP_DATAGOUV_PUBLISH_URL; do \
      eval "value=\${$name:-}"; \
      [ -n "$value" ] || missing="$missing $name"; \
    done; \
    if [ -n "$missing" ]; then \
      echo "Missing build args:$missing" >&2; \
      exit 1; \
    fi

# Build for production
RUN pnpm run build

FROM nginx:alpine-slim AS runtime

# Serve static files
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/cors-headers.conf /etc/nginx/cors-headers.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
