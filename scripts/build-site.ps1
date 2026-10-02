# Creates a reviewable deployment folder. Does not publish or change a remote.
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$output=[IO.Path]::GetFullPath((Join-Path $root 'dist'))
if($output -ne [IO.Path]::Combine($root,'dist') -or !$output.StartsWith($root+[IO.Path]::DirectorySeparatorChar)){throw 'Unexpected output path.'}
& (Join-Path $PSScriptRoot 'configure-site.ps1')
$files=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach($file in @('index.html','404.html','robots.txt','sitemap.xml','.nojekyll','_headers')){$null=$files.Add($file)}
foreach($folder in @('css','js')){
 Get-ChildItem (Join-Path $root $folder) -Recurse -File | Where-Object { $_.Extension -in @('.css','.js') -or $_.Name -match '^(LICENSE|COPYING|OFL)' } | ForEach-Object { $null=$files.Add($_.FullName.Substring($root.Length+1).Replace('\','/')) }
}
$manifest=Get-Content (Join-Path $root 'assets/responsive/manifest.json') -Raw -Encoding UTF8|ConvertFrom-Json
$originals=@($manifest.PSObject.Properties.Name)
$sources=@(Get-Item (Join-Path $root 'index.html'))+@(Get-ChildItem (Join-Path $root 'css') -File)+@(Get-ChildItem (Join-Path $root 'js') -File -Filter '*.js')
foreach($file in $sources){
 $text=Get-Content $file.FullName -Raw -Encoding UTF8
 foreach($match in [regex]::Matches($text,'assets/[^\s"''`<>\)\(,;]+')){
   $asset=($match.Value -split '[?#]')[0]
   if($asset.Contains('$') -or $asset -in $originals){continue}
   if(Test-Path -LiteralPath (Join-Path $root $asset) -PathType Leaf){$null=$files.Add($asset)}
 }
}
# These small families are addressed dynamically or contain required licences.
foreach($folder in @('assets/responsive','assets/graphic-props','assets/films','assets/tool-logos','assets/fonts','assets/interfaces/skin-60','games/ship-explorer')){
 Get-ChildItem (Join-Path $root $folder) -Recurse -File | Where-Object {
   $_.Extension -in @('.html','.js','.css','.png','.jpg','.jpeg','.svg','.webp','.gif','.woff','.woff2','.ttf','.otf','.mp3','.wav','.ogg','.txt') -and
   $_.FullName -notmatch '[\\/](\.git|node_modules|docs|tests)[\\/]'
 } | ForEach-Object {$null=$files.Add($_.FullName.Substring($root.Length+1).Replace('\','/'))}
}
# A custom-domain file is deliberately absent until the domain is owned/configured.
if(Test-Path -LiteralPath (Join-Path $root 'CNAME')){$null=$files.Add('CNAME')}
if(Test-Path -LiteralPath $output){
 if((Get-Item -LiteralPath $output).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Refusing to replace a linked output directory.'}
 Remove-Item -LiteralPath $output -Recurse -Force
}
New-Item -ItemType Directory -Path $output|Out-Null
foreach($relative in $files){
 $source=[IO.Path]::GetFullPath((Join-Path $root $relative))
 $target=[IO.Path]::GetFullPath((Join-Path $output $relative))
 if(!$source.StartsWith($root+[IO.Path]::DirectorySeparatorChar) -or !$target.StartsWith($output+[IO.Path]::DirectorySeparatorChar)){throw "Unsafe path: $relative"}
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent)|Out-Null
 Copy-Item -LiteralPath $source -Destination $target
}
$total=(Get-ChildItem -LiteralPath $output -Recurse -File|Measure-Object -Property Length -Sum).Sum
Write-Output "Deployment folder: $output / $($files.Count) files / $([math]::Round($total/1MB,2)) MiB"
Write-Output 'Excluded: audit reports, screenshots, local tools, credentials and unreferenced source artwork. No deployment was performed.'
