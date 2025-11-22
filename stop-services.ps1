# Stop all microservices
Write-Host "=== Stopping EV Data Analytics Marketplace - Microservices ===" -ForegroundColor Yellow

docker-compose down

Write-Host "`n=== All services stopped ===" -ForegroundColor Green
