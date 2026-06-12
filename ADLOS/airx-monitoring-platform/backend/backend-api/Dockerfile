FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY airspace-service ./airspace-service
COPY violation-service ./violation-service
COPY alert-service ./alert-service
COPY backend-api ./backend-api
RUN mvn clean package -pl backend-api -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/backend-api/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
