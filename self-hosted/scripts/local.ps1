<#
  Teste local de «MyShelf» no Windows (PowerShell 5.1 ou 7).
  Usa só o docker-compose.local.yml: volume, rede e containers próprios.
  Nunca toca no servidor nem nos dados de produção.

  Como correr (na pasta do projeto, numa janela do PowerShell):
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\scripts\local.ps1 iniciar

  Ações:
    iniciar        constrói as imagens com o código deste PC e arranca tudo
    estado         mostra os containers e testa a app e o PocketBase
    registos       mostra os últimos registos (ex.: registos nginx)
    parar          para tudo; os dados de teste ficam guardados
    apagar-dados   para tudo e apaga SÓ o volume de teste (pede confirmação)
#>
param(
  [Parameter(Position = 0)]
  [ValidateSet('iniciar', 'estado', 'registos', 'parar', 'apagar-dados', 'ajuda')]
  [string]$Acao = 'ajuda',
  [Parameter(Position = 1)]
  [string]$Servico = ''
)

# 'Continue' de propósito: no PowerShell 5.1, com 'Stop', qualquer aviso que o
# docker escreva no stderr seria tratado como erro fatal. Os erros reais são
# apanhados pelo código de saída ($LASTEXITCODE).
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz
$compose = 'docker-compose.local.yml'
$volume = 'myshelf_pb_data_local'

function Escrever($texto, $cor = 'Gray') { Write-Host $texto -ForegroundColor $cor }
function Falhar($texto) { Escrever "✗ $texto" 'Red'; exit 1 }

function Testar-Docker {
  docker info 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Falhar "O Docker não está a correr. Abre o Docker Desktop, espera por «Engine running» e tenta outra vez."
  }
}

function Testar-Endereco($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400)
  } catch { return $false }
}

switch ($Acao) {
  'iniciar' {
    Testar-Docker
    if (-not (Test-Path $compose)) { Falhar "Não encontrei $compose. Corre o script a partir da pasta do projeto." }

    # As imagens constroem-se com «docker build» e o compose arranca com
    # --no-build: evita o erro do Docker Desktop «additional privileges
    # requested: --allow=fs.read=…» que o «up --build» dá no Windows.
    Escrever '1/3  A construir o PocketBase (servidor e base de dados)…' 'Cyan'
    docker build -t myshelf-local-pocketbase ./pocketbase
    if ($LASTEXITCODE -ne 0) { Falhar 'A construção do PocketBase falhou. Copia as últimas linhas acima e envia-mas.' }

    Escrever '2/3  A construir o nginx com a app deste PC…' 'Cyan'
    docker build -t myshelf-local-nginx -f nginx/Dockerfile .
    if ($LASTEXITCODE -ne 0) { Falhar 'A construção do nginx falhou. Copia as últimas linhas acima e envia-mas.' }

    Escrever '3/3  A arrancar os serviços…' 'Cyan'
    docker compose -f $compose up -d --no-build
    if ($LASTEXITCODE -ne 0) { Falhar 'O arranque falhou. Corre: .\scripts\local.ps1 registos' }

    Escrever 'À espera que a app responda (até 90 segundos)…'
    $pronto = $false
    for ($i = 0; $i -lt 45; $i++) {
      if (Testar-Endereco 'http://localhost:8080/api/health') { $pronto = $true; break }
      Start-Sleep -Seconds 2
    }
    if (-not $pronto) { Falhar 'A app não respondeu a tempo. Vê os registos: scripts\local.ps1 registos' }

    Escrever ''
    Escrever '✓ Pronto.' 'Green'
    Escrever '  App:               http://localhost:8080'
    Escrever '  Painel PocketBase: http://localhost:8090/_/'
    Escrever '  Para entrar com a Google, vê o passo 6 de docs\testar-localmente.md. Para parar: scripts\local.ps1 parar'
    Start-Process 'http://localhost:8080'
  }

  'estado' {
    Testar-Docker
    docker compose -f $compose ps -a   # -a: mostra também os containers parados
    Escrever ''
    $app = Testar-Endereco 'http://localhost:8080/'
    $pb = Testar-Endereco 'http://localhost:8090/api/health'
    if ($app) { Escrever '✓ App em http://localhost:8080' 'Green' } else { Escrever '✗ A app não responde em http://localhost:8080' 'Red' }
    if ($pb) { Escrever '✓ PocketBase em http://localhost:8090/_/' 'Green' } else { Escrever '✗ O PocketBase não responde em http://localhost:8090' 'Red' }
  }

  'registos' {
    Testar-Docker
    Escrever 'Últimos registos (Ctrl+C para sair)…' 'Cyan'
    if ($Servico) { docker compose -f $compose logs --tail 100 -f $Servico }
    else { docker compose -f $compose logs --tail 100 -f }
  }

  'parar' {
    Testar-Docker
    docker compose -f $compose down
    if ($LASTEXITCODE -eq 0) { Escrever '✓ Parado. Os dados de teste continuam guardados para a próxima vez.' 'Green' }
  }

  'apagar-dados' {
    Testar-Docker
    Escrever "Isto apaga SÓ os dados de teste deste PC (volume «$volume»)." 'Yellow'
    Escrever 'A produção no servidor não é tocada.' 'Yellow'
    $resposta = Read-Host 'Escreve APAGAR para confirmar'
    if ($resposta -cne 'APAGAR') { Escrever 'Cancelado. Nada foi apagado.'; exit 0 }
    docker compose -f $compose down -v
    if ($LASTEXITCODE -eq 0) { Escrever '✓ Dados de teste apagados.' 'Green' }
  }

  default {
    Escrever 'Uso: .\scripts\local.ps1 <ação>   (antes, uma vez por janela: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)' 'Cyan'
    Escrever '  iniciar        constrói com o código deste PC e arranca (abre o browser)'
    Escrever '  estado         mostra se a app e o PocketBase estão a responder'
    Escrever '  registos       mostra os registos (ex.: registos nginx)'
    Escrever '  parar          para tudo, mantém os dados de teste'
    Escrever '  apagar-dados   apaga só os dados de teste (pede confirmação)'
  }
}
