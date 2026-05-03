param(
  [string]$Instance = "smarttaruna-495205:asia-southeast2:smart-taruna-mysql",
  [int]$Port = 3307
)

$proxy = Get-Command cloud-sql-proxy -ErrorAction SilentlyContinue
if (-not $proxy) {
  Write-Error "Cloud SQL Auth Proxy belum terinstall. Download dari https://cloud.google.com/sql/docs/mysql/connect-auth-proxy lalu pastikan command cloud-sql-proxy bisa dipanggil."
  exit 1
}

cloud-sql-proxy $Instance --port $Port
