# Script to build and run the backend JAR
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:PATH = "$PWD\.maven\apache-maven-3.9.6\bin;$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Killing existing Java processes..."
taskkill /F /IM java.exe 2>$null

Write-Host "Building project..."
mvn clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!"
    exit 1
}

Write-Host "Java Version:"
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "Starting Backend JAR..."
& "$env:JAVA_HOME\bin\java.exe" -jar target/crms-backend-0.0.1-SNAPSHOT.jar
