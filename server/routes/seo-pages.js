const express = require('express');
const { ROUTES, serveSeoPage } = require('../services/seo-pages');

const router = express.Router();

Object.keys(ROUTES).forEach((routePath) => {
  router.get(routePath, (req, res) => {
    const html = serveSeoPage(routePath);
    if (!html) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  });
});

module.exports = router;
