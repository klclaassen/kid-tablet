# convert_pages.ps1
# Converts all PDFs in ./pages to crisp PNG coloring pages

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pages = Join-Path $projectRoot "pages"

# Ensure Ghostscript is available
$gsbin = "C:\Program Files\gs\gs9.09\bin"
if (Test-Path $gsbin) {
    $env:Path = "$gsbin;$env:Path"
}

Write-Host "Converting PDFs in $pages ..."

Get-ChildItem "$pages\*.pdf" | ForEach-Object {
    $out = Join-Path $pages ($_.BaseName + ".png")

    Write-Host " -> $($_.Name) -> $($_.BaseName).png"

    magick -density 300 $_.FullName `
        -colorspace Gray `
        -threshold 60% `
        $out
}

Write-Host ""
Write-Host "Done! PNG coloring pages are ready."