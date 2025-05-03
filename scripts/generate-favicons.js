const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateFavicons() {
  console.log('Generating favicon files...');
  
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
    const sizes = [
      { name: 'favicon-16x16.png', width: 16, height: 16 },
      { name: 'favicon-32x32.png', width: 32, height: 32 },
      { name: 'apple-touch-icon.png', width: 180, height: 180 },
      { name: 'android-chrome-192x192.png', width: 192, height: 192 },
      { name: 'android-chrome-512x512.png', width: 512, height: 512 },
      { name: 'mstile-150x150.png', width: 150, height: 150 }
    ];
    
    for (const size of sizes) {
      await page.setViewport({
        width: size.width,
        height: size.height,
        deviceScaleFactor: 1
      });
      
      const outputPath = path.join(process.cwd(), 'public', size.name);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: true
      });
      
      console.log(`Generated ${size.name}`);
    }
    
    // Clean up the temporary file
    fs.unlinkSync(tempHtmlPath);
    
    console.log('Favicon generation completed successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  } finally {
    await browser.close();
  }
}

generateFavicons();