try {
    $loginBody = '{"email":"test4@test.com","password":"password123"}'
    $loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $token = $loginResp.token
    Write-Host "Token OK"
    $headers = @{ "Authorization" = "Bearer $token" }

    Write-Host "
--- Creating Goal ---"
    $goalBody = '{"title":"Test Manual Goal", "goalType":"MANUAL", "targetValue":100, "unit":"%", "startDate":"2026-09-01", "targetDate":"2026-12-31"}'
    $goalResp = Invoke-RestMethod -Uri "http://localhost:8080/api/goals" -Method POST -ContentType "application/json" -Headers $headers -Body $goalBody -ErrorAction Stop
    Write-Host ($goalResp | ConvertTo-Json)

    Write-Host "
--- Fetching Smart Plan ---"
    $spResp = Invoke-RestMethod -Uri "http://localhost:8080/api/smart-plan" -Headers $headers -ErrorAction Stop
    Write-Host ($spResp | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
