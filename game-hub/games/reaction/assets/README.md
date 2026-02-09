# Assets Directory

This directory contains all media assets for the Reaction Test game.

## Directory Structure

```
assets/
├── icons/          # SVG icons and favicon
│   ├── lightning.svg
│   ├── reset.svg
│   ├── trophy.svg
│   ├── target.svg
│   └── favicon.svg
├── sounds/         # Audio files (placeholder)
│   └── README.md
├── images/         # Images and graphics (placeholder)
│   └── README.md
├── assets.json     # Asset configuration and documentation
└── README.md       # This file
```

## Asset Guidelines

### Icons
- All icons are SVG format for scalability
- Use consistent styling and colors
- Optimize for small file sizes
- Maintain accessibility with proper alt text

### Sounds
- Keep audio files small (< 50KB)
- Use MP3 format for compatibility
- Short duration sounds (0.1-0.5s)
- Consistent volume levels

### Images
- Optimize for web delivery
- Use appropriate formats (SVG, PNG, WebP)
- Provide fallbacks for older browsers
- Consider responsive image needs

## Usage

Assets are referenced in the HTML and CSS files using relative paths from the project root:

```html
<img src="assets/icons/lightning.svg" alt="Lightning">
```

```css
background-image: url('assets/images/pattern.png');
```