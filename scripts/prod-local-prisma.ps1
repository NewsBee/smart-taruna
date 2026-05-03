param(
  [switch]$Seed
)

$envFile = Join-Path $PSScriptRoot "..\.env.production.local"
if (-not (Test-Path $envFile)) {
  Write-Error ".env.production.local tidak ditemukan."
  exit 1
}

Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
    return
  }

  $key, $value = $line.Split("=", 2)
  $value = $value.Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  [Environment]::SetEnvironmentVariable($key.Trim(), $value, "Process")
}

npx prisma db push
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if ($Seed) {
  npm run seed
}
