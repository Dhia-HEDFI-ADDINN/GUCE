FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source
COPY src src

# Build
RUN ./mvnw package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S guce && adduser -S guce -G guce
USER guce

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
