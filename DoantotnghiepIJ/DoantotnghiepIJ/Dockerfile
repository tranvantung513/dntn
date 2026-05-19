#FROM openjdk:17-jdk-slim
#
#WORKDIR /app
#
#COPY app.jar app.jar
#
#ENTRYPOINT ["java","-jar","app.jar"]


# Sử dụng Java 21 (nhẹ + ổn định)
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy file jar đã build
COPY target/*.jar app.jar

# Expose port (không bắt buộc nhưng nên có)
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java","-jar","app.jar"]