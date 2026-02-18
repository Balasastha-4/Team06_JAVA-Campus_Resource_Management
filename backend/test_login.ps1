
# Test script for login endpoint
$baseUrl = "http://localhost:8080/api/auth/signin"

function Test-Login {
    [CmdletBinding()]
    param(
        [string]$email,
        [SecureString]$password
    )

    # Decode SecureString for API call (Test only)
    $passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    $body = @{ email = $email; password = $passwordPlain } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    }
    catch {
        Write-Host "Error Response for $email / $password :"
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}

Write-Host "--- Test 1: Non-existent User ---"
Test-Login "nonexistent@crms.com" ("password" | ConvertTo-SecureString -AsPlainText -Force)

Write-Host "`n--- Test 2: Wrong Password ---"
Test-Login "admin@crms.com" ("wrongpassword" | ConvertTo-SecureString -AsPlainText -Force)
