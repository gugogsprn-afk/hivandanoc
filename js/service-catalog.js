/**
 * Client-side service catalog helpers (mirrors server/services/service-catalog.js).
 */
const ServiceCatalog = (function () {
  function normalizeCategoryId(value) {
    if (value == null) return '';
    return String(value).trim().toLowerCase();
  }

  function serviceCategoryId(service) {
    if (!service || typeof service !== 'object') return '';
    return normalizeCategoryId(
      service.category ?? service.category_id ?? service.categoryId
    );
  }

  function filterServicesByCategory(services, categoryId) {
    const list = Array.isArray(services) ? services : [];
    const cat = normalizeCategoryId(categoryId);
    if (!cat) return list.slice();
    return list.filter((service) => serviceCategoryId(service) === cat);
  }

  function groupServicesByCategory(services, categories, categoryId) {
    const list = Array.isArray(services) ? services : [];
    const catList = Array.isArray(categories) ? categories : [];
    const filtered = filterServicesByCategory(list, categoryId);

    const buckets = new Map();
    for (const service of filtered) {
      const id = serviceCategoryId(service);
      if (!id) continue;
      if (!buckets.has(id)) buckets.set(id, []);
      buckets.get(id).push(service);
    }

    const pickCategories = categoryId
      ? catList.filter((c) => normalizeCategoryId(c.id) === normalizeCategoryId(categoryId))
      : catList;

    const groups = [];
    const seen = new Set();

    for (const category of pickCategories) {
      const id = normalizeCategoryId(category.id);
      const items = buckets.get(id) || [];
      if (!items.length) continue;
      seen.add(id);
      groups.push({ category, items });
    }

    for (const [id, items] of buckets) {
      if (seen.has(id) || !items.length) continue;
      groups.push({
        category: { id, name: id },
        items
      });
    }

    return groups;
  }

  return {
    normalizeCategoryId,
    serviceCategoryId,
    filterServicesByCategory,
    groupServicesByCategory
  };
})();
