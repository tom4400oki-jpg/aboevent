# 古いnodeプロセスを終了
taskkill /F /IM node.exe
if ($LASTEXITCODE -eq 0) {
    Write-Host "Node processes terminated."
} else {
    Write-Host "No running Node processes found or failed to terminate."
}

# ロックファイルを削除
if (Test-Path ".next/dev/lock") {
    Remove-Item ".next/dev/lock" -Force
    Write-Host "Lock file removed."
} else {
    Write-Host "No lock file found."
}

# 開発サーバーを起動
npm run dev
