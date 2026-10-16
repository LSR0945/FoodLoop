param()
$ErrorActionPreference = "Stop"
$queries = [ordered]@{
  "mini-1"   = "children eating plate India"
  "mini-1b"  = "poor children India food"
  "ground-1" = "India night shelter residents"
  "ground-1b"= "community kitchen India serving poor"
  "ground-2" = "ration distribution India"
  "ground-3" = "midday meal school India"
  "story-1"  = "cooked food distribution India poor"
  "story-1b" = "free food stall India people"
  "strip-3"  = "wasted food bin vegetables"
  "strip-3b" = "food waste India market"
}

foreach ($k in $queries.Keys) {
  $q = [uri]::EscapeDataString($queries[$k])
  $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=$q&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1400"
  $ok = $false
  for ($try = 0; $try -lt 4 -and -not $ok; $try++) {
    try {
      $raw = (curl.exe -s -m 30 -A "FoodLoopCardBot/1.0 (hackathon image research)" $url) -join ""
      $json = $raw | ConvertFrom-Json
      $ok = $true
      $pages = @()
      if ($json.query.pages) { $pages = $json.query.pages.PSObject.Properties.Value | Sort-Object index }
      Write-Output "=== $k :: $($queries[$k])"
      if ($pages.Count -eq 0) { Write-Output "   (no results)" }
      foreach ($p in $pages) {
        $ii = $p.imageinfo[0]
        if ($ii.mime -notin @("image/jpeg","image/png")) { continue }
        Write-Output ("   [{0}] {1}  ({2}x{3})" -f $p.pageid, $p.title, $ii.width, $ii.height)
      }
    } catch {
      if ($try -eq 3) { Write-Output "=== $k :: ERROR $raw" }
      Start-Sleep -Seconds 5
    }
  }
  Start-Sleep -Seconds 2
}
