param()
$ErrorActionPreference = "Stop"
$queries = [ordered]@{
  "g1" = "India people eating community meal"
  "g1b"= "homeless shelter India food"
  "g1c"= "annadanam India serving food"
  "g2" = "food packets distribution India"
  "g2b"= "grocery kits distribution poor India"
  "s1" = "volunteers serving hot meals India"
  "s1b"= "India charity kitchen serving food"
  "s1c"= "food distribution India slum people"
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
