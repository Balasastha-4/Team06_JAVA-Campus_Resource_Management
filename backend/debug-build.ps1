$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$PWD\.maven\apache-maven-3.9.6\bin;$env:PATH"
Write-Host "Java Version:"
java -version
Write-Host "Maven Version:"
mvn -version
mvn clean package -DskipTests -e
