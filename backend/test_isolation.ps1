try {
    # 1. Register User A
    $regBodyA = '{"name":"User A","email":"usera@test.com","password":"password123"}'
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -ContentType "application/json" -Body $regBodyA -ErrorAction SilentlyContinue

    # 2. Login User A
    $loginBodyA = '{"email":"usera@test.com","password":"password123"}'
    $loginRespA = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBodyA -ErrorAction Stop
    $tokenA = $loginRespA.token
    $headersA = @{ "Authorization" = "Bearer $tokenA" }

    # 3. User A Creates a Task
    $taskBody = '{"title":"User A Secret Task", "plannedDate":"2026-09-24", "status":"TODO"}'
    $taskRespA = Invoke-RestMethod -Uri "http://localhost:8080/api/tasks" -Method POST -ContentType "application/json" -Headers $headersA -Body $taskBody -ErrorAction Stop
    $taskId = $taskRespA.id
    Write-Host "User A created task: $taskId"

    # 4. Register User B
    $regBodyB = '{"name":"User B","email":"userb@test.com","password":"password123"}'
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -ContentType "application/json" -Body $regBodyB -ErrorAction SilentlyContinue

    # 5. Login User B
    $loginBodyB = '{"email":"userb@test.com","password":"password123"}'
    $loginRespB = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBodyB -ErrorAction Stop
    $tokenB = $loginRespB.token
    $headersB = @{ "Authorization" = "Bearer $tokenB" }

    # 6. User B fetches tasks for the day
    $tasksB = Invoke-RestMethod -Uri "http://localhost:8080/api/tasks?date=2026-09-24" -Headers $headersB -ErrorAction Stop
    Write-Host "User B fetched  tasks"

    # 7. User B tries to update User A's task directly
    try {
        $updateBody = '{"title":"Hacked Task", "plannedDate":"2026-09-24", "status":"COMPLETED"}'
        Invoke-RestMethod -Uri "http://localhost:8080/api/tasks/$taskId" -Method PUT -ContentType "application/json" -Headers $headersB -Body $updateBody -ErrorAction Stop
        Write-Host "VULNERABILITY: User B updated User A's task!"
    } catch {
        Write-Host "SUCCESS: User B prevented from updating User A's task. (Expected 404 or 403) -> $($_.Exception.Message)"
    }
} catch {
    Write-Host "Test Error: $($_.Exception.Message)"
}
