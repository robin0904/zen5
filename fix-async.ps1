# Fix Script - Update all createClient() calls to await
# This script updates all files to properly await the async createClient() function

$filesToFix = @(
    'lib\tasks\completion-logic.ts',
    'lib\tasks\task-selection.ts',
    'lib\gamification\leaderboard.ts',
    'lib\gamification\badges.ts'
)

foreach ($file in $filesToFix) {
    $fullPath = "c:\Users\rohan\Downloads\zen5\$file"
    Write-Host "Fixing $file..."
    
    $content = Get-Content $fullPath -Raw
    $content = $content -replace '(\s+)const supabase = createClient\(\);', '$1const supabase = await createClient();'
    Set-Content -Path $fullPath -Value $content -NoNewline
    
    Write-Host "  ✓ Fixed $file"
}

Write-Host "`n✅ All files updated!"
