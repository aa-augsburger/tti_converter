const express = require('express');
const bodyParser = require('body-parser');
const htmlToImage = require('html-to-image');
const { JSDOM } = require('jsdom');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/convert', async (req, res) => {
  try {
    const { html, css, width = 800, height = 600 } = req.body;
    
    // Créer un DOM virtuel
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${css}
            body {
              width: ${width}px;
              height: ${height}px;
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    
    const node = dom.window.document.querySelector('body');
    
    // Convertir en PNG avec dimensions spécifiées
    const dataUrl = await htmlToImage.toPng(node, {
      width: width,
      height: height
    });
    
    // Renvoyer l'image
    res.send({ imageUrl: dataUrl });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Service de conversion HTML/CSS en image lancé sur le port ${port}`);
});