param()
$ErrorActionPreference = "Stop"
$dest = Join-Path $PSScriptRoot "..\surplus-plate-link\public\images\cards"
$items = @(
  @{ key = "hero-main"; id = 71625747 }, @{ key = "mini-1"; id = 1020524 },
  @{ key = "mini-2"; id = 87111024 }, @{ key = "mini-3"; id = 546836 },
  @{ key = "mini-4"; id = 109990830 }, @{ key = "strip-1"; id = 30786767 },
  @{ key = "strip-2"; id = 112944744 }, @{ key = "strip-3"; id = 15890436 },
  @{ key = "strip-4"; id = 33630667 }, @{ key = "ground-1"; id = 72077075 },
  @{ key = "ground-2"; id = 105991591 }, @{ key = "ground-3"; id = 71672349 },
  @{ key = "ground-4"; id = 66489774 }, @{ key = "story-1"; id = 60050791 },
  @{ key = "story-2"; id = 62280658 }, @{ key = "story-3"; id = 89185216 },
  @{ key = "avatar-1"; id = 47848061 }, @{ key = "avatar-2"; id = 104864398 },
  @{ key = "avatar-3"; id = 57092922 }
)
$credits = @()
foreach ($it in $items) {
  $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&pageids=$($it.id)&prop=imageinfo&iiprop=url|extmetadata"
  $json = $null
  for ($try = 0; $try -lt 4 -and -not $json; $try++) {
    try {
      $raw = (curl.exe -s -m 30 -A "FoodLoopCardBot/1.0 (hackathon)" $url) -join ""
      $parsed = $raw | ConvertFrom-Json
      if ($parsed.query -and $parsed.query.pages) { $json = $parsed }
    } catch { }
    if (-not $json) { Start-Sleep -Seconds 5 }
  }
  if (-not $json) { Write-Output "$($it.key) metadata failed"; continue }
  $page = $json.query.pages.PSObject.Properties.Value
  $ii = $page.imageinfo[0]
  $em = $ii.extmetadata
  $credits += [pscustomobject]@{
    file    = "$($it.key).jpg"
    title   = ($page.title -replace '^File:', '')
    author  = if ($em.Artist) { (($em.Artist.value -replace '<[^>]+>', '') -replace '\s+', ' ').Trim() } else { "" }
    license = if ($em.LicenseShortName) { $em.LicenseShortName.value } else { "" }
    source  = $ii.descriptionurl
  }
  Write-Output "$($it.key) ok"
  Start-Sleep -Seconds 2
}
$credits | ConvertTo-Json | Out-File -FilePath (Join-Path $dest "credits.json") -Encoding utf8
$md = @("# Image credits", "", "All photos below come from Wikimedia Commons and are used under their respective free licenses.", "")
foreach ($c in $credits) { $md += "- **$($c.file)** - [$($c.title)]($($c.source)) - $($c.license) - $($c.author)" }
$md | Out-File -FilePath (Join-Path $dest "CREDITS.md") -Encoding utf8
Write-Output "credits written: $($credits.Count)"
