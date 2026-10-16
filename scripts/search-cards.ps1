param()
$ErrorActionPreference = "Stop"
$queries = [ordered]@{
  "hero-main"        = "mid day meal children"
  "mini-1"           = "hungry children India"
  "mini-2"           = "food distribution India children"
  "mini-3"           = "children begging India"
  "mini-4"           = "food relief queue India"
  "strip-1"          = "malnutrition child India"
  "strip-2"          = "homeless India sleeping"
  "strip-3"          = "food waste vegetables"
  "strip-4"          = "school lunch India children"
  "ground-1"         = "soup kitchen serving"
  "ground-2"         = "ration distribution India"
  "ground-3"         = "midday meal India"
  "ground-4"         = "langar serving"
  "story-1"          = "food distribution volunteers India"
  "story-2"          = "bread loaves bakery"
  "story-3"          = "food relief packages volunteers"
  "avatar-1"         = "gurdwara India"
  "avatar-2"         = "India school children"
  "avatar-3"         = "food bank volunteers"
}

foreach ($k in $queries.Keys) {
  $q = [uri]::EscapeDataString($queries[$k])
  $url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=$q&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1400"
  $ok = $false
  for ($try = 0; $try -lt 3 -and -not $ok; $try++) {
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
      if ($try -eq 2) { Write-Output "=== $k :: ERROR raw=($($raw.Substring(0,[Math]::Min(120,$raw.Length))))" }
      Start-Sleep -Seconds 3
    }
  }
  Start-Sleep -Milliseconds 900
}
