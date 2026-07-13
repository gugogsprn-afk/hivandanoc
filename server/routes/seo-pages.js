const express = require('express');
const { ROUTES, serveSeoPage } = require('../services/seo-pages');
const { serveServicesHub, serveServicePage } = require('../services/service-pages');
const { serveConditionsHub, serveConditionPage } = require('../services/condition-pages');
const { serveKnowledgeHub, serveKnowledgeArticle } = require('../services/knowledge-pages');
const { LAUNCHED_AUTHORITY_SLUGS, servePage } = require('../services/local-authority-pages');
const { serveDoctorPage } = require('../services/doctor-pages');
const { parseLangParam } = require('../services/i18n-ssr');

const router = express.Router();

function requestLang(req) {
  return parseLangParam(req.query.lang) || 'hy';
}

Object.keys(ROUTES).forEach((routePath) => {
  router.get(routePath, (req, res) => {
    const html = serveSeoPage(routePath, requestLang(req));
    if (!html) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  });
});

LAUNCHED_AUTHORITY_SLUGS.forEach((routePath) => {
  router.get(routePath, (req, res) => {
    const html = servePage(routePath, requestLang(req));
    if (!html) return res.status(404).send('Not found');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(html);
  });
});

router.get('/services', (req, res) => {
  const html = serveServicesHub(requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/services/:slug', (req, res) => {
  const html = serveServicePage(req.params.slug, requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/conditions', (req, res) => {
  const html = serveConditionsHub(requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/conditions/:slug', (req, res) => {
  const html = serveConditionPage(req.params.slug, requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/knowledge', (req, res) => {
  const html = serveKnowledgeHub(requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/knowledge/:slug', (req, res) => {
  const html = serveKnowledgeArticle(req.params.slug, requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/doctors/:slug', (req, res) => {
  const html = serveDoctorPage(req.params.slug, requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

router.get('/find-a-doctor/:slug', (req, res) => {
  const html = serveDoctorPage(req.params.slug, requestLang(req));
  if (!html) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

module.exports = router;
