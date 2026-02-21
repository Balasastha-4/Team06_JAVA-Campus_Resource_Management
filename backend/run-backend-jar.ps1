# Script to build and run the backend JAR
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:PATH = "$PWD\.maven\apache-maven-3.9.6\bin;$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Killing existing Java processes..."
taskkill /F /IM java.exe 2>$null

Write-Host "--- Diagnostics ---"
Write-Host "Java Path: $(where.exe java.exe)"
Write-Host "Javac Path: $(where.exe javac.exe)"
java -version
javac -version
mvn -version
Write-Host "-------------------"

Write-Host "Building project..."
mvn clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!"
    exit 1
}

Write-Host "Starting Backend JAR..."
java -jar target/crms-backend-0.0.1-SNAPSHOT.jar
