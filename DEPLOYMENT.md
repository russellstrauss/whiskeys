# Deployment Guide

This project builds a self-contained static folder that can be deployed as a subdirectory in another project.

## Building for Production

Run the production build:

```bash
npm run build
```

This will create a `dist` folder with all necessary files.

## Folder Structure

After building, the `dist` folder will contain:

```
dist/
├── index.html          # Main HTML file
├── js/
│   ├── bundle.js       # Bundled JavaScript (includes all dependencies)
│   └── d3.v5.min.js    # D3.js library
├── css/
│   └── main.css        # Compiled CSS
├── img/                # Image assets
├── data/               # Data files (CSV)
└── obj/                # 3D model files
```

## Deployment

### Option 1: Deploy as a Subdirectory

1. Copy the entire `dist` folder to your target project
2. Rename it to your desired subdirectory name (e.g., `whiskeys`)
3. Access it via: `https://yourdomain.com/whiskeys/`

### Option 2: Deploy to Root

1. Copy all contents of the `dist` folder to your web server root
2. Access it via: `https://yourdomain.com/`

## Important Notes

- **All paths are relative**: The build uses relative paths, so it will work from any subdirectory
- **Self-contained**: All dependencies (Three.js, etc.) are bundled into `bundle.js`
- **External dependencies**: The HTML still references CDN resources for:
  - Google Fonts (Roboto)
  - D3.js color, interpolate, and scale-chromatic libraries

## Testing Locally

You can test the production build locally:

```bash
# Using Python
cd dist
python -m http.server 8000

# Using Node.js http-server
npx http-server dist -p 8000

# Using PHP
cd dist
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Customization

If you need to change the base path or modify asset paths, edit `webpack.config.js` and update the `publicPath` option in the `output` section.

