$rootDir = "c:\Users\SUSHANT-SONBARSE\Desktop\skills\unified_skills"

Write-Host "Standardizing SKILL.md frontmatter..."

$skills = Get-ChildItem -Path $rootDir -Filter "SKILL.md" -Recurse
$count = 0

foreach ($skill in $skills) {
    $content = Get-Content $skill.FullName -Raw
    $folderName = $skill.Directory.Name
    $categoryPath = $skill.Directory.Parent.FullName.Substring($rootDir.Length + 1) -replace '\\', '/'
    $categoryParts = $categoryPath -split '/'
    $tags = @($categoryParts) + @($folderName) | Sort-Object -Unique | ForEach-Object { $_.ToLower() }
    
    $frontmatter = @{}
    $body = $content
    
    if ($content -match '(?s)^---\r?\n(.*?)\r?\n---\r?\n(.*)$') {
        $yamlStr = $matches[1]
        $body = $matches[2]
        
        $lines = $yamlStr -split '\r?\n'
        foreach ($line in $lines) {
            if ($line -match '^([^:]+):\s*(.*)$') {
                $frontmatter[$matches[1].Trim()] = $matches[2].Trim()
            }
        }
    }
    
    if (-not $frontmatter.ContainsKey('name')) { $frontmatter['name'] = "`"$folderName`"" }
    if (-not $frontmatter.ContainsKey('version')) { $frontmatter['version'] = "`"1.0.0`"" }
    if (-not $frontmatter.ContainsKey('author')) { $frontmatter['author'] = "`"agent-admin`"" }
    if (-not $frontmatter.ContainsKey('negative_triggers')) { $frontmatter['negative_triggers'] = "[]" }
    
    if (-not $frontmatter.ContainsKey('tags')) {
        $frontmatter['tags'] = "[" + ($tags -join ", ") + "]"
    }
    
    $newYaml = "---`n"
    foreach ($key in $frontmatter.Keys) {
        $newYaml += "$key: $($frontmatter[$key])`n"
    }
    $newYaml += "---`n`n"
    
    $newContent = $newYaml + $body.TrimStart()
    
    Set-Content -Path $skill.FullName -Value $newContent
    
    $count++
    if ($count % 100 -eq 0) { Write-Host "Processed $count skills..." }
}

Write-Host "Standardized $count SKILL.md files successfully."
