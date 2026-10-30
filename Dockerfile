FROM node:22-bookworm-slim AS frontend
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /workspace/backend
COPY backend/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /workspace/dist /workspace/dist
RUN mvn -B -Pfrontend verify

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system blush && useradd --system --gid blush --home-dir /app blush
COPY --from=backend --chown=blush:blush /workspace/backend/target/blush-aura-api-0.1.0.jar /app/app.jar
USER blush
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/app.jar"]
