# GitHub Otomatik Yükleme Script'i
Write-Host "`n=== GitHub Otomatik Yükleme ===" -ForegroundColor Green

# 1. Git kontrolü
Write-Host "`n1. Git kontrolü..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>&1
    Write-Host "   Git bulundu: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   Git bulunamadı!" -ForegroundColor Red
    Write-Host "   Lütfen Git'i yükleyin: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 2. Güvenlik kontrolü
Write-Host "`n2. Güvenlik kontrolü..." -ForegroundColor Cyan
npm run security:check
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Güvenlik kontrolü başarısız!" -ForegroundColor Red
    exit 1
}

# 3. Git yapılandırması
Write-Host "`n3. Git yapılandırması..." -ForegroundColor Cyan
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    Write-Host "   Git kullanıcı adı giriniz: " -NoNewline
    $userName = Read-Host
    git config --global user.name $userName
}

if (-not $userEmail) {
    Write-Host "   Git email giriniz: " -NoNewline
    $userEmail = Read-Host
    git config --global user.email $userEmail
}

Write-Host "   Kullanıcı: $userName <$userEmail>" -ForegroundColor Green

# 4. Git repository başlat
Write-Host "`n4. Git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
    Write-Host "   Repository başlatıldı" -ForegroundColor Green
} else {
    Write-Host "   Repository mevcut" -ForegroundColor Green
}

# 5. Remote repository
Write-Host "`n5. Remote repository..." -ForegroundColor Cyan
$remote = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   GitHub repository URL'nizi giriniz:" -ForegroundColor Yellow
    Write-Host "   (örn: https://github.com/username/SylvanToken.git)" -ForegroundColor Gray
    Write-Host "   URL: " -NoNewline
    $repoUrl = Read-Host
    git remote add origin $repoUrl
    Write-Host "   Remote eklendi: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "   Remote mevcut: $remote" -ForegroundColor Green
}

# 6. Dosya durumu
Write-Host "`n6. Dosya durumu..." -ForegroundColor Cyan
git status --short | Select-Object -First 20
Write-Host "   ..." -ForegroundColor Gray

# 7. Onay
Write-Host "`n7. ÖNEMLI: .env dosyası listede VAR MI?" -ForegroundColor Yellow
Write-Host "   (Olmamalı! Varsa HAYIR deyin)" -ForegroundColor Yellow
Write-Host "`n   Devam etmek istiyor musunuz? (E/H): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -ne "E" -and $response -ne "e") {
    Write-Host "`n   İşlem iptal edildi." -ForegroundColor Red
    exit 1
}

# 8. Add, Commit, Push
Write-Host "`n8. Dosyalar ekleniyor..." -ForegroundColor Cyan
git add .

Write-Host "`n9. Commit yapılıyor..." -ForegroundColor Cyan
git commit -m "feat: Add testnet deployment and distribution"

Write-Host "`n10. GitHub'a yükleniyor..." -ForegroundColor Cyan
Write-Host "    (Kullanıcı adı/şifre veya token istenebilir)" -ForegroundColor Yellow

$branch = git branch --show-current
if (-not $branch) {
    git branch -M main
    $branch = "main"
}

git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== BAŞARILI! ===" -ForegroundColor Green
    Write-Host "Dosyalar GitHub'a yüklendi!" -ForegroundColor Green
    
    $repoUrl = git remote get-url origin
    $webUrl = $repoUrl -replace "\.git$", ""
    Write-Host "`nRepository: $webUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n=== HATA! ===" -ForegroundColor Red
    Write-Host "Push başarısız. Kimlik doğrulaması gerekebilir." -ForegroundColor Yellow
    Write-Host "GitHub Personal Access Token oluşturun:" -ForegroundColor Yellow
    Write-Host "https://github.com/settings/tokens" -ForegroundColor Cyan
}

Write-Host ""
