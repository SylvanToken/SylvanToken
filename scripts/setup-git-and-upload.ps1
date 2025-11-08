# GitHub Otomatik Yükleme Script'i
# Bu script Git'i kontrol eder, gerekirse yükler ve GitHub'a yükler

Write-Host "`n🚀 GitHub Otomatik Yükleme Başlatılıyor...`n" -ForegroundColor Green

# Git kontrolü
Write-Host "📋 Git kontrolü yapılıyor..." -ForegroundColor Cyan
$gitInstalled = $false

try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git zaten yüklü: $gitVersion" -ForegroundColor Green
        $gitInstalled = $true
    }
} catch {
    Write-Host "❌ Git yüklü değil" -ForegroundColor Yellow
}

# Git yüklü değilse yükleme talimatları
if (-not $gitInstalled) {
    Write-Host "`n⚠️  Git yüklü değil. Lütfen şu adımları takip edin:`n" -ForegroundColor Yellow
    Write-Host "1. Git'i indirin: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. İndirilen dosyayı çalıştırın" -ForegroundColor White
    Write-Host "3. Varsayılan ayarlarla kurulumu tamamlayın" -ForegroundColor White
    Write-Host "4. PowerShell'i kapatıp yeniden açın" -ForegroundColor White
    Write-Host "5. Bu script'i tekrar çalıştırın`n" -ForegroundColor White
    
    Write-Host "Git'i şimdi indirmek ister misiniz? (E/H): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    
    if ($response -eq "E" -or $response -eq "e") {
        Write-Host "`n🌐 Git indirme sayfası açılıyor..." -ForegroundColor Green
        Start-Process "https://git-scm.com/download/win"
        Write-Host "`nGit'i yükledikten sonra bu script'i tekrar çalıştırın.`n" -ForegroundColor Yellow
    }
    
    exit 1
}

# Güvenlik kontrolü
Write-Host "`n🔒 Güvenlik kontrolü yapılıyor..." -ForegroundColor Cyan
npm run security:check

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Güvenlik kontrolü başarısız! Lütfen sorunları düzeltin.`n" -ForegroundColor Red
    exit 1
}

# Git yapılandırması kontrolü
Write-Host "`n⚙️  Git yapılandırması kontrol ediliyor..." -ForegroundColor Cyan

$gitUserName = git config --global user.name 2>$null
$gitUserEmail = git config --global user.email 2>$null

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "`n📝 Git kullanıcı bilgileri ayarlanmamış.`n" -ForegroundColor Yellow
    
    if (-not $gitUserName) {
        Write-Host "Adınızı girin: " -ForegroundColor Cyan -NoNewline
        $userName = Read-Host
        git config --global user.name "$userName"
        Write-Host "✅ Kullanıcı adı ayarlandı: $userName" -ForegroundColor Green
    }
    
    if (-not $gitUserEmail) {
        Write-Host "Email adresinizi girin: " -ForegroundColor Cyan -NoNewline
        $userEmail = Read-Host
        git config --global user.email "$userEmail"
        Write-Host "✅ Email ayarlandı: $userEmail" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Git kullanıcı bilgileri mevcut" -ForegroundColor Green
    Write-Host "   Kullanıcı: $gitUserName" -ForegroundColor White
    Write-Host "   Email: $gitUserEmail" -ForegroundColor White
}

# Git repository kontrolü
Write-Host "`n📦 Git repository kontrolü..." -ForegroundColor Cyan

$isGitRepo = Test-Path ".git"

if (-not $isGitRepo) {
    Write-Host "⚠️  Git repository başlatılmamış" -ForegroundColor Yellow
    Write-Host "`nGit repository'yi başlatmak ister misiniz? (E/H): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    
    if ($response -eq "E" -or $response -eq "e") {
        Write-Host "`n🔧 Git repository başlatılıyor..." -ForegroundColor Green
        git init
        Write-Host "✅ Git repository başlatıldı" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Git repository gerekli. İşlem iptal edildi.`n" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Git repository mevcut" -ForegroundColor Green
}

# Remote repository kontrolü
Write-Host "`n🔗 Remote repository kontrolü..." -ForegroundColor Cyan

$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Host "⚠️  Remote repository ayarlanmamış" -ForegroundColor Yellow
    Write-Host "`nGitHub repository URL'nizi girin (örn: https://github.com/username/repo.git):" -ForegroundColor Cyan
    Write-Host "URL: " -ForegroundColor Cyan -NoNewline
    $repoUrl = Read-Host
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote repository eklendi: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Remote repository URL'si gerekli. İşlem iptal edildi.`n" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Remote repository mevcut: $remoteUrl" -ForegroundColor Green
}

# Dosya durumu kontrolü
Write-Host "`n📊 Dosya durumu kontrol ediliyor..." -ForegroundColor Cyan
git status --short

# Commit ve push onayı
Write-Host "`n⚠️  ÖNEMLI KONTROL:" -ForegroundColor Yellow
Write-Host "Yukarıdaki listede .env dosyası VAR MI? (Olmamalı!)" -ForegroundColor Yellow
Write-Host "`nDevam etmek ister misiniz? (E/H): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -ne "E" -and $response -ne "e") {
    Write-Host "`n❌ İşlem iptal edildi.`n" -ForegroundColor Red
    exit 1
}

# Dosyaları ekle
Write-Host "`n📁 Dosyalar ekleniyor..." -ForegroundColor Cyan
git add .

# Commit message
Write-Host "`n📝 Commit message:" -ForegroundColor Cyan
$commitMessage = "feat: Add testnet deployment and token distribution"

Write-Host $commitMessage -ForegroundColor White

# Commit
Write-Host "`n💾 Commit yapılıyor..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Commit başarısız veya değişiklik yok" -ForegroundColor Yellow
    
    # Değişiklik var mı kontrol et
    $changes = git status --porcelain
    if (-not $changes) {
        Write-Host "ℹ️  Commit edilecek değişiklik yok" -ForegroundColor Cyan
    }
}

# Push
Write-Host "`n🚀 GitHub'a yükleniyor..." -ForegroundColor Cyan
Write-Host "⚠️  GitHub kullanıcı adı ve şifreniz istenebilir (veya Personal Access Token)" -ForegroundColor Yellow

# Branch kontrolü ve push
$currentBranch = git branch --show-current

if (-not $currentBranch) {
    Write-Host "⚠️  Branch bulunamadı, 'main' branch'i oluşturuluyor..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
}

Write-Host "📤 Branch: $currentBranch" -ForegroundColor Cyan

git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ✅ ✅ BAŞARILI! ✅ ✅ ✅`n" -ForegroundColor Green
    Write-Host "🎉 Dosyalar GitHub'a başarıyla yüklendi!`n" -ForegroundColor Green
    
    # Repository URL'sini göster
    $remoteUrl = git remote get-url origin
    $webUrl = $remoteUrl -replace "\.git$", "" -replace "git@github\.com:", "https://github.com/"
    
    Write-Host "🔗 Repository: $webUrl`n" -ForegroundColor Cyan
    
    Write-Host "📋 Sonraki adımlar:" -ForegroundColor Yellow
    Write-Host "1. GitHub'da repository'yi kontrol edin" -ForegroundColor White
    Write-Host "2. .env dosyasının OLMADIĞINI doğrulayın" -ForegroundColor White
    Write-Host "3. README.md'nin düzgün göründüğünü kontrol edin" -ForegroundColor White
    Write-Host "4. Repository ayarlarını yapılandırın (Settings > Security)`n" -ForegroundColor White
    
    # Repository'yi tarayıcıda aç
    Write-Host "Repository'yi tarayıcıda açmak ister misiniz? (E/H): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    
    if ($response -eq "E" -or $response -eq "e") {
        Start-Process $webUrl
    }
    
} else {
    Write-Host "`n❌ Push başarısız!`n" -ForegroundColor Red
    Write-Host "Olası nedenler:" -ForegroundColor Yellow
    Write-Host "1. GitHub kimlik doğrulaması gerekli" -ForegroundColor White
    Write-Host "2. Remote repository mevcut değil" -ForegroundColor White
    Write-Host "3. İnternet bağlantısı sorunu`n" -ForegroundColor White
    
    Write-Host "💡 Çözüm önerileri:" -ForegroundColor Cyan
    Write-Host "1. GitHub Personal Access Token oluşturun:" -ForegroundColor White
    Write-Host "   https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Token'ı kullanarak push yapın:" -ForegroundColor White
    Write-Host "   git push https://TOKEN@github.com/username/repo.git`n" -ForegroundColor White
    
    exit 1
}

Write-Host "`n✨ İşlem tamamlandı!`n" -ForegroundColor Green
