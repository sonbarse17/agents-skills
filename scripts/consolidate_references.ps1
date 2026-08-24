$rootDir = "c:\Users\SUSHANT-SONBARSE\Desktop\skills\unified_skills"
$globalRefDir = "$rootDir\Global_References"

if (-not (Test-Path $globalRefDir)) {
    New-Item -Path $globalRefDir -ItemType Directory | Out-Null
}

$hashMap = @{}
$fileMap = @{}

Write-Host "Scanning references..."
$refFiles = Get-ChildItem -Path $rootDir -File -Recurse | Where-Object { $_.DirectoryName -match '\\references$' }

$count = 0
foreach ($file in $refFiles) {
    $hash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash
    
    $globalFileName = $file.Name
    if ($hashMap.ContainsKey($hash)) {
        # Duplicate exists
        $targetName = $hashMap[$hash]
    } else {
        # New unique file
        if (Test-Path "$globalRefDir\$globalFileName") {
            # Name collision, prefix with folder name
            $skillName = $file.Directory.Parent.Name
            $globalFileName = "${skillName}_${globalFileName}"
        }
        Copy-Item -Path $file.FullName -Destination "$globalRefDir\$globalFileName"
        $hashMap[$hash] = $globalFileName
        $targetName = $globalFileName
    }
    
    # Map the old path to the new global file name for rewriting
    $fileMap[$file.FullName] = $targetName
    
    $count++
    if ($count % 100 -eq 0) { Write-Host "Processed $count reference files..." }
}

Write-Host "Consolidated $count reference files into $($hashMap.Count) unique files in Global_References."

Write-Host "Rewriting SKILL.md links..."
$skills = Get-ChildItem -Path $rootDir -Filter "SKILL.md" -Recurse
foreach ($skill in $skills) {
    $content = Get-Content $skill.FullName -Raw
    $modified = $false
    
    # Depth calculation for relative path to root (unified_skills)
    $relativePath = $skill.Directory.FullName.Substring($rootDir.Length + 1)
    $depth = ($relativePath -split '\\').Count
    $prefix = ""
    for ($i=0; $i -lt $depth; $i++) { $prefix += "../" }
    $globalLinkPrefix = "${prefix}Global_References/"
    
    $localRefs = Get-ChildItem -Path "$($skill.Directory.FullName)\references" -File -ErrorAction SilentlyContinue
    if ($localRefs) {
        foreach ($localRef in $localRefs) {
            $globalName = $fileMap[$localRef.FullName]
            if ($globalName) {
                # Simple replacement for typical markdown links: references/filename.md or ./references/filename.md
                $oldLink1 = "references/$($localRef.Name)"
                $oldLink2 = "./references/$($localRef.Name)"
                $newLink = "$globalLinkPrefix$globalName"
                
                if ($content -match [regex]::Escape($oldLink1)) {
                    $content = $content -replace [regex]::Escape($oldLink1), $newLink
                    $modified = $true
                }
                if ($content -match [regex]::Escape($oldLink2)) {
                    $content = $content -replace [regex]::Escape($oldLink2), $newLink
                    $modified = $true
                }
            }
        }
        
        # After rewriting, delete the local references folder
        Remove-Item -Path "$($skill.Directory.FullName)\references" -Recurse -Force
    }
    
    if ($modified) {
        Set-Content -Path $skill.FullName -Value $content
    }
}

Write-Host "Link rewriting and cleanup complete."
