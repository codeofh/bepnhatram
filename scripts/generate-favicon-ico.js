const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function generateFaviconIco() {
  console.log('Generating favicon.ico...');
  
  // First, create PNG files for each size
  const sizes = [16, 32, 48, 64];
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Create HTML for favicon generation
    const faviconHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Favicon Generator</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
        }
        .favicon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 512px;
          height: 512px;
          background-color: #ffffff;
          overflow: hidden;
        }
        .favicon-container img {
          width: 80%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="favicon-container">
        <img src="file://${path.join(process.cwd(), 'public', 'logo-removebg.png')}" alt="Logo">
      </div>
    </body>
    </html>
    `;
    
    // Write the HTML to a temporary file
    const tempHtmlPath = path.join(process.cwd(), 'public', 'favicon-temp.html');
    fs.writeFileSync(tempHtmlPath, faviconHtml);
    
    // Load the HTML
    await page.goto(`file://${tempHtmlPath}`);
    
    // Wait for the image to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate different sizes
    const pngFiles = [];
    for (const size of sizes) {
      await page.setViewport({
        width: size,
        height: size,
        deviceScaleFactor: 1
      });
      
      const outputPath = path.join(process.cwd(), 'public', `favicon-${size}x${size}.png`);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: true
      });
      
      pngFiles.push(outputPath);
      console.log(`Generated ${path.basename(outputPath)}`);
    }
    
    // Clean up the temporary file
    fs.unlinkSync(tempHtmlPath);
    
    // Use ImageMagick to convert the PNG files to ICO
    const icoPath = path.join(process.cwd(), 'public', 'favicon.ico');
    
    // Install ImageMagick if not already installed
    try {
      execSync('which convert');
    } catch (error) {
      console.log('Installing ImageMagick...');
      execSync('apt-get update && apt-get install -y imagemagick');
    }
    
    // Convert PNG files to ICO
    const convertCommand = `convert ${pngFiles.join(' ')} ${icoPath}`;
    execSync(convertCommand);
    
    console.log(`Generated favicon.ico with multiple sizes`);
    
    // Clean up the temporary PNG files
    for (const pngFile of pngFiles) {
      if (pngFile.includes('favicon-') && !pngFile.includes('favicon-16x16') && !pngFile.includes('favicon-32x32')) {
        fs.unlinkSync(pngFile);
      }
    }
    
    console.log('Favicon generation completed successfully!');
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
  } finally {
    await browser.close();
  }
}

generateFaviconIco();