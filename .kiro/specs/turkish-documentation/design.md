# Turkish Documentation - Design

## Architecture

### File Structure
```
trdocs/
├── README.html
├── WHITEPAPER.html
├── ROADMAP.html
├── SECURITY.html
├── CONTRIBUTING.html
├── LAUNCH_PLAN.html
└── docs/
    ├── DOCUMENTATION_INDEX.html
    ├── API_REFERENCE.html
    ├── VESTING_LOCK_GUIDE.html
    ├── MULTISIG_WALLET_SETUP_GUIDE.html
    ├── EMERGENCY_PROCEDURES_GUIDE.html
    ├── MONITORING_SYSTEM_SETUP_GUIDE.html
    └── FREE_AUDIT_TOOLS_GUIDE.html
```

## Design Decisions

### HTML Format
- Standalone HTML files (no external dependencies)
- Embedded CSS for consistent styling
- No JavaScript required for basic viewing
- Print-friendly layout

### Styling Theme
- Primary color: Green (#2e7d32, #4caf50, #81c784)
- Background: Light gray (#f5f5f5)
- Text: Dark gray (#333)
- Code blocks: Dark background with syntax highlighting colors
- Responsive breakpoints for mobile devices

### Translation Approach
- Professional Turkish translation
- Technical terms preserved where appropriate
- BSC, BEP-20, Solidity terms kept in English
- Contract addresses and code examples unchanged
- Turkish date format where applicable

## Component Design

### HTML Template Structure
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Turkish Title] - Sylvan Token</title>
    <style>
        /* Embedded CSS */
    </style>
</head>
<body>
    <header>
        <h1>[Document Title]</h1>
        <p class="subtitle">[Subtitle]</p>
    </header>
    <main>
        <!-- Content sections -->
    </main>
    <footer>
        <p>© 2025 Sylvan Token. Tüm hakları saklıdır.</p>
    </footer>
</body>
</html>
```

### CSS Variables
```css
:root {
    --primary-color: #2e7d32;
    --primary-light: #4caf50;
    --primary-lighter: #81c784;
    --background: #f5f5f5;
    --text-color: #333;
    --code-bg: #1e1e1e;
}
```

## Quality Standards

### Translation Quality
- Native Turkish language quality
- Consistent terminology throughout
- Technical accuracy maintained
- Clear and professional tone

### Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for any images
- Sufficient color contrast

### Responsiveness
- Mobile-first approach
- Flexible layouts
- Readable on all screen sizes
- Touch-friendly navigation

## Archive Strategy

### ZIP Structure
```
trdocs.zip
├── README.html
├── WHITEPAPER.html
├── ROADMAP.html
├── SECURITY.html
├── CONTRIBUTING.html
├── LAUNCH_PLAN.html
└── docs/
    └── [7 documentation files]
```

### Compression
- Standard ZIP format
- No password protection
- Preserves folder structure
