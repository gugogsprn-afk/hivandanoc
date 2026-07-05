const express = require('express');
const { ROUTES, serveSeoPage } = require('../services/seo-pages');
const { serveServicesHub, serveServicePage } = require('../services/service-pages');
const { serveConditionsHub, serveConditionPage } = require('../services/condition-pages');
const { serveKnowledgeHub, serveKnowledgeArticle } = require('../services/knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS, servePage } = require('../services/local-authority-pages');

const router = express.Router();

Object.keys(ROUTES).forEach((routePath) => {
  router.get(routePath, (req, res) => {
    const html = serveSeoPage(routePath, req.query.lang);
    if (!html) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  });
});

LAUNCHED_AUTHORITY_SLUGS.forEach((routePath) => {
  router.get(routePath, (req, res) => {
    const html = servePage(routePath);
    if (!html) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  });
});

router.get('/services', (req, res) => {
  const html = serveServicesHub();
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/services/:slug', (req, res) => {
  const html = serveServicePage(req.params.slug);
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/conditions', (req, res) => {
  const html = serveConditionsHub();
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/conditions/:slug', (req, res) => {
  const html = serveConditionPage(req.params.slug);
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/knowledge', (req, res) => {
  const html = serveKnowledgeHub();
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/knowledge/:slug', (req, res) => {
  const html = serveKnowledgeArticle(req.params.slug);
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

module.exports = router;
