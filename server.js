const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/convert', async (req, res) => {
  let browser;
  try {
    const { html, css, width = 800, height = 600 } = req.body;
    
    // Lancer un navigateur headless
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configurer la taille de la page
    await page.setViewport({ width, height });
    
    // Créer le contenu HTML avec le CSS
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>${html}</body>
      </html>
    `;
    
    // Charger le contenu HTML
    await page.setContent(content, { waitUntil: 'networkidle0' });
    
    // Prendre une capture d'écran
    const screenshot = await page.screenshot({ 
      type: 'png',
      encoding: 'base64'
    });
    
    // Renvoyer l'image en base64
    res.send({ 
      imageUrl: `data:image/png;base64,${screenshot}` 
    });
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
    res.status(500).send({ error: error.message });
  } finally {
    // Fermer le navigateur pour libérer les ressources
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Service de conversion HTML/CSS en image lancé sur le port ${port}`);
});
