const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function generateSafariPinnedTab() {
  console.log('Generating safari-pinned-tab.svg...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Create HTML for SVG generation
    const svgHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Safari Pinned Tab Generator</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
        }
        .svg-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 512px;
          height: 512px;
        }
        .svg-container img {
          width: 80%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="svg-container">
        <img src="file://${path.join(process.cwd(), 'public', 'logo-removebg.png')}" alt="Logo">
      </div>
    </body>
    </html>
    `;
    
    // Write the HTML to a temporary file
    const tempHtmlPath = path.join(process.cwd(), 'public', 'safari-pinned-tab-temp.html');
    fs.writeFileSync(tempHtmlPath, svgHtml);
    
    // Load the HTML
    await page.goto(`file://${tempHtmlPath}`);
    
    // Wait for the image to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set viewport
    await page.setViewport({
      width: 512,
      height: 512,
      deviceScaleFactor: 1
    });
    
    // Take a screenshot
    const screenshotPath = path.join(process.cwd(), 'public', 'safari-pinned-tab-temp.png');
    await page.screenshot({
      path: screenshotPath,
      type: 'png',
      omitBackground: true
    });
    
    // Install ImageMagick if not already installed
    try {
      execSync('which convert');
    } catch (error) {
      console.log('Installing ImageMagick...');
      execSync('apt-get update && apt-get install -y imagemagick');
    }
    
    // Convert PNG to SVG
    const svgPath = path.join(process.cwd(), 'public', 'safari-pinned-tab.svg');
    const convertCommand = `convert ${screenshotPath} -negate -threshold 0 -fill black -opaque white -bordercolor white -border 0 ${svgPath}`;
    execSync(convertCommand);
    
    console.log(`Generated safari-pinned-tab.svg`);
    
    // Clean up temporary files
    fs.unlinkSync(tempHtmlPath);
    fs.unlinkSync(screenshotPath);
    
    console.log('Safari pinned tab generation completed successfully!');
  } catch (error) {
    console.error('Error generating safari-pinned-tab.svg:', error);
  } finally {
    await browser.close();
  }
}

generateSafariPinnedTab();