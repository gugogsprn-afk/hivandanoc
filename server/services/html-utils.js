/**
 * SSR templates use relative asset paths (css/, js/) which break on nested
 * clean URLs such as /conditions/back-pain-treatment. Normalize to root-relative.
 */
function normalizeRootAssetPaths(html) {
  return html
    .replace(/href="css\//g, 'href="/css/')
    .replace(/href='css\//g, "href='/css/")
    .replace(/src="js\//g, 'src="/js/')
    .replace(/src='js\//g, "src='/js/")
    .replace(/src="data\//g, 'src="/data/')
    .replace(/href="images\//g, 'href="/images/')
    .replace(/src="images\//g, 'src="/images/');
}

module.exports = { normalizeRootAssetPaths };
