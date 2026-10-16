param()
$ErrorActionPreference = "Stop"
$dest = Join-Path $PSScriptRoot "..\surplus-plate-link\public\images\cards"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$items = @(
  @{ key = "hero-main"; id = 71625747 },
  @{ key = "mini-1";    id = 1020524 },
  @{ key = "mini-2";    id = 87111024 },
  @{ key = "mini-3";    id = 546836 },
  @{ key = "mini-4";    id = 109990830 },
  @{ key = "strip-1";   id = 30786767 },
  @{ key = "strip-2";   id = 112944744 },
  @{ key = "strip-3";   id = 15890436 },
  @{ key = "strip-4";   id = 33630667 },
  @{ key = "ground-1";  id = 72077075 },
  @{ key = "ground-2";  id = 105991591 },
  @{ key = "ground-3";  id = 71672349 },
  @{ key = "ground-4";  id = 66489774 },
  @{ key = "story-1";   id = 60050791 },
  @{ key = "story-2";   id = 62280658 },
  @{ key = "story-3";   id = 89185216 },
  @{ key = "avatar-1";  id = 47848061 },
  @{ key = "avatar-2";  id = 104864398 },
  @{ key = "avatar-3";  id = 57092922 }
)

$credits = @()
foreach ($it in $items) {
  $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&pageids=$($it.id)&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=1400"
  $json = $null
  for ($try = 0; $try -lt 4 -and -not $json; $try++) {
    try {
      $raw = (curl.exe -s -m 30 -A "FoodLoopCardBot/1.0 (hackathon)" $url) -join ""
      $json = $raw | ConvertFrom-Json
    } catch { Start-Sleep -Seconds 5 }
  }
  $page = $json.query.pages.PSObject.Properties.Value
  $ii = $page.imageinfo[0]
  $src = $ii.thumburl
  if (-not $src) { $src = $ii.url }
  $ext = [System.IO.Path]::GetExtension(([uri]$src).AbsolutePath).ToLower()
  if ($ext -notin @(".jpg", ".jpeg", ".png")) { $ext = ".jpg" }
  $out = Join-Path $dest "$($it.key)$ext"
  curl.exe -s -m 60 -A "FoodLoopCardBot/1.0 (hackathon)" -o $out $src
  $size = (Get-Item $out).Length
  $head = ([System.IO.File]::ReadAllBytes($out)[0..2] | ForEach-Object { $_.ToString('X2') }) -join ' '
  Write-Output ("{0,-10} {1,8} bytes  head={2}  <- {3}" -f $it.key, $size, $head, $ii.descriptionurl)
  $em = $ii.extmetadata
  $license = if ($em.LicenseShortName) { $em.LicenseShortName.value } else { "" }
  $artist = if ($em.Artist) { ($em.Artist.value -replace '<[^>]+>', '') } else { "" }
  $credits += [pscustomobject]@{ Key = $it.key; Title = $page.title; Page = $ii.descriptionurl; License = $license; Artist = $artist }
  Start-Sleep -Seconds 1
}

$credits | ConvertTo-Json | Out-File -FilePath (Join-Path $dest "credits.json") -Encoding utf8
Write-Output "DONE -> $dest"
