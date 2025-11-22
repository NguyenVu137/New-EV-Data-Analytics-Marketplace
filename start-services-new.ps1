# Start all microservices with docker-compose
Write-Host "=== Starting EV Data Analytics Marketplace - Microservices ===" -ForegroundColor Green

# Stop existing containers
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start all services (EXCEPT frontend - use npm start instead)
Write-Host "`nBuilding and starting backend services..." -ForegroundColor Yellow
Write-Host "Note: Frontend container is disabled. Run 'npm start' in frontend folder." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "`nChecking service health..." -ForegroundColor Yellow
$services = @(
    @{Name="MySQL"; Port=3307; Path=""},
    @{Name="Auth Service"; Port=8081; Path="/health"},
    @{Name="Dataset Service"; Port=8082; Path="/health"},
    @{Name="Transaction Service"; Port=8083; Path="/health"},
    @{Name="Analytics Service"; Port=8084; Path="/health"},
    @{Name="Provider Service"; Port=8085; Path="/health"},
    @{Name="Admin Service"; Port=8086; Path="/health"},
    @{Name="Allcode Service"; Port=8087; Path="/health"},
    @{Name="API Gateway"; Port=8080; Path="/health"}
)

foreach ($service in $services) {
    if ($service.Path) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)$($service.Path)" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
            }
        } catch {
            Write-Host "✗ $($service.Name) on port $($service.Port): NOT RESPONDING" -ForegroundColor Red
        }
    } else {
        Write-Host "- $($service.Name) is running on port $($service.Port)" -ForegroundColor Cyan
    }
}

Write-Host "`n=== All Services Started ===" -ForegroundColor Green
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "`nNext step: Run 'npm start' in frontend folder" -ForegroundColor Yellow
Write-Host "To view logs: docker-compose logs -f [service-name]" -ForegroundColor Yellow
Write-Host "To stop all services: docker-compose down" -ForegroundColor Yellow
