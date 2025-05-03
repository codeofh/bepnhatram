const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateOGImage() {
  console.log('Generating OG Image...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to OG image dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1
    });
    
    // Load the HTML template
    const htmlPath = path.join(process.cwd(), 'public', 'og-image.html');
    await page.goto(`file://${htmlPath}`);
    
    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take a screenshot
    const outputPath = path.join(process.cwd(), 'public', 'og-image.jpg');
    await page.screenshot({
      path: outputPath,
      type: 'jpeg',
      quality: 90
    });
    
    console.log(`OG Image generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating OG image:', error);
  } finally {
    await browser.close();
  }
}

generateOGImage();