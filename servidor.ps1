# Dedilhado Vivo - servidor local simples (nao precisa instalar nada)
$ErrorActionPreference = "Stop"
$raiz = Join-Path $PSScriptRoot "web"
$porta = 8080
$listener = New-Object System.Net.HttpListener
while ($true) {
  try { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add("http://localhost:$porta/"); $listener.Start(); break }
  catch { $porta++; if ($porta -gt 8100) { Write-Host "Nao achei uma porta livre."; Read-Host "Enter para sair"; exit 1 } }
}
$url = "http://localhost:$porta/"
Write-Host ""
Write-Host "  Dedilhado Vivo rodando em $url" -ForegroundColor Green
Write-Host "  Deixe esta janela aberta enquanto usa o app. Para parar, feche a janela."
Write-Host ""
Start-Process $url
$tipos = @{ ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".webmanifest"="application/manifest+json"; ".png"="image/png"; ".svg"="image/svg+xml";
  ".ico"="image/x-icon"; ".md"="text/plain; charset=utf-8"; ".musicxml"="application/xml"; ".xml"="application/xml"; ".mxl"="application/octet-stream" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $caminho = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  if ($caminho -eq "") { $caminho = "index.html" }
  $arquivo = [System.IO.Path]::GetFullPath((Join-Path $raiz $caminho))
  $res = $ctx.Response
  try {
    if ($arquivo.StartsWith([System.IO.Path]::GetFullPath($raiz)) -and (Test-Path $arquivo -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($arquivo).ToLower()
      $res.ContentType = $(if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { "application/octet-stream" })
      $res.Headers.Add("Cache-Control", "no-cache")
      $bytes = [System.IO.File]::ReadAllBytes($arquivo)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "200 /$caminho"
    } else { $res.StatusCode = 404; Write-Host "404 /$caminho" }
  } catch { $res.StatusCode = 500 }
  $res.OutputStream.Close()
}
