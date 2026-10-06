# Regenerates public/og.png (1200x630) — the social preview card.
#
# The PNG is a committed design asset, not a build artifact: link unfurlers
# fetch it from a CDN, so it must exist whether or not anyone runs this.
# Requires Windows (System.Drawing). Run from the repository root:
#
#   powershell -File scripts/gen-og.ps1

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$out = Join-Path $PSScriptRoot '..\public\og.png'

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background: near-black with a blue wash in the top-left, matching tokens.css
$bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 4, 6, 11))
$g.FillRectangle($bg, 0, 0, $width, $height)

$wash = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new(0, 0),
  [System.Drawing.PointF]::new(900, 630),
  [System.Drawing.Color]::FromArgb(70, 79, 107, 255),
  [System.Drawing.Color]::FromArgb(0, 4, 6, 11)
)
$g.FillRectangle($wash, 0, 0, $width, 630)

# 64px grid, matching .bg-grid
$gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(16, 255, 255, 255), 1)
for ($x = 0; $x -le $width; $x += 64) { $g.DrawLine($gridPen, $x, 0, $x, $height) }
for ($y = 0; $y -le $height; $y += 64) { $g.DrawLine($gridPen, 0, $y, $width, $y) }

$ui = 'Segoe UI, Inter, Helvetica, sans-serif'
$mono = 'Consolas, Cascadia Mono, monospace'

# Keep this script pure ASCII: Windows PowerShell 5.1 reads .ps1 as ANSI unless
# the file carries a BOM, so a literal middle dot would be mangled.
$dot = [char]0x00B7
$join = "$dot  "

function Write-Text($text, $x, $y, $size, $color, $font = $ui, $style = 'Regular') {
  $f = [System.Drawing.Font]::new($font, $size, [System.Drawing.FontStyle]::$style, [System.Drawing.GraphicsUnit]::Pixel)
  $b = [System.Drawing.SolidBrush]::new($color)
  $g.DrawString($text, $f, $b, $x, $y)
  $b.Dispose()
  $f.Dispose()
}

$white = [System.Drawing.Color]::FromArgb(255, 232, 232, 237)
$dim = [System.Drawing.Color]::FromArgb(255, 154, 162, 181)
$blue = [System.Drawing.Color]::FromArgb(255, 79, 107, 255)
$gold = [System.Drawing.Color]::FromArgb(255, 240, 201, 76)
$green = [System.Drawing.Color]::FromArgb(255, 62, 207, 142)

# Eyebrow pill
$pillBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30, 79, 107, 255))
$g.FillEllipse($pillBrush, 80, 92, 14, 14)
$g.FillRectangle($pillBrush, 100, 86, 216, 34)
$pillBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(90, 79, 107, 255), 1)
$g.DrawRectangle($pillBorder, 100, 86, 216, 34)
Write-Text 'APEX ALIAS, FREE' 114 92 17 $blue $ui 'Bold'

# Headline
Write-Text 'Point your root' 80 168 84 $white $ui 'Bold'
Write-Text 'domain at a' 80 260 84 $white $ui 'Bold'
Write-Text 'hostname.' 80 352 84 $gold $ui 'Bold'

# Zone-file illustration: what a CNAME cannot do, and what ALIAS can
$panelX = 720
$panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 6, 7, 8))
$g.FillRectangle($panelBrush, $panelX, 168, 400, 300)
$panelBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 27, 34, 48), 1)
$g.DrawRectangle($panelBorder, $panelX, 168, 400, 300)

$stripe = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 92, 114))
$g.FillRectangle($stripe, $panelX, 168, 4, 300)

Write-Text 'zone example.com' ($panelX + 28) 196 20 $dim $mono
Write-Text '@   CNAME   project.onrender.com.' ($panelX + 28) 246 20 $dim $mono
Write-Text '     ^ rejected at the apex' ($panelX + 28) 280 18 ([System.Drawing.Color]::FromArgb(255, 255, 92, 114)) $mono
$g.DrawLine(
  [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 40, 48, 66), 1),
  ($panelX + 28), 322, ($panelX + 372), 322
)
Write-Text '@   ALIAS   project.onrender.com.' ($panelX + 28) 340 20 $gold $mono
Write-Text '@   NS      dns1.int.yt.' ($panelX + 28) 374 20 $green $mono
Write-Text '@   SOA     ns1.int.yt. ...' ($panelX + 28) 408 20 $green $mono

# Footer strip
$stripBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 10, 14, 20))
$g.FillRectangle($stripBrush, 0, 508, $width, 122)
$stripLine = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 27, 34, 48), 1)
$g.DrawLine($stripLine, 0, 508, $width, 508)

$g.FillEllipse([System.Drawing.SolidBrush]::new($green), 80, 552, 10, 10)
Write-Text 'dns1.int.yt + dns2.int.yt' 102 540 26 $white $mono
Write-Text ("anycast  {0}  REST API  {0}  1,000 records/domain" -f $join) 80 582 22 $dim $ui
Write-Text 'dns.int.yt' 980 546 30 $blue $mono 'Bold'

$bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$gridPen.Dispose(); $pillBrush.Dispose(); $pillBorder.Dispose()
$panelBrush.Dispose(); $panelBorder.Dispose(); $stripe.Dispose()
$stripBrush.Dispose(); $stripLine.Dispose(); $bg.Dispose(); $wash.Dispose()
$g.Dispose()
$bitmap.Dispose()

Write-Host "wrote $out"