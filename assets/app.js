const categoriesEl = document.getElementById('categories');
const template = document.getElementById('recipeTemplate');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const sourceFilter = document.getElementById('sourceFilter');
const categoryFilter = document.getElementById('categoryFilter');
const typeFilter = document.getElementById('typeFilter');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const summary = document.getElementById('summary');

const LEARNED_KEY = 'wow-smith-learned-v1';

let recipes = [];
let learnedIds = new Set();

init();

async function init() {
  const [recipesData, learnedFile] = await Promise.all([
    fetch('data/recipes.json').then((r) => r.json()),
    fetch('data/learned.json').then((r) => r.json()).catch(() => ({ learned: [] }))
  ]);

  recipes = recipesData.recipes;

  const localLearned = JSON.parse(localStorage.getItem(LEARNED_KEY) || '[]');
  learnedIds = new Set([...learnedFile.learned, ...localLearned]);

  populateSourceFilter(recipes);
  populateTypeFilter(recipes, 'all');
  bindEvents();
  render();
}

function bindEvents() {
  [searchInput, statusFilter, sourceFilter, categoryFilter, typeFilter, sortBy].forEach((el) => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  categoryFilter.addEventListener('change', () => {
    populateTypeFilter(recipes, categoryFilter.value);
    render();
  });

  exportBtn.addEventListener('click', () => {
    const payload = JSON.stringify({ learned: [...learnedIds].sort() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'learned.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function populateSourceFilter(items) {
  const sources = [...new Set(items.map((r) => r.source))].sort((a, b) => a.localeCompare(b, 'de'));
  for (const source of sources) {
    const option = document.createElement('option');
    option.value = source;
    option.textContent = source;
    sourceFilter.append(option);
  }
}

function populateTypeFilter(items, category) {
  const current = typeFilter.value;
  typeFilter.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Alle';
  typeFilter.append(allOption);

  const inCategory = category === 'all' ? items : items.filter((r) => r.category === category);
  const types = [...new Set(inCategory.map((r) => r.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));

  for (const type of types) {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.append(option);
  }

  typeFilter.value = types.includes(current) ? current : 'all';
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const source = sourceFilter.value;
  const category = categoryFilter.value;
  const type = typeFilter.value;

  let filtered = recipes.filter((r) => {
    const isLearned = learnedIds.has(r.id);
    if (term && !r.name.toLowerCase().includes(term)) return false;
    if (status === 'learned' && !isLearned) return false;
    if (status === 'unlearned' && isLearned) return false;
    if (source !== 'all' && r.source !== source) return false;
    if (category !== 'all' && r.category !== category) return false;
    if (type !== 'all' && r.type !== type) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy.value === 'itemLevelDesc') {
      return (b.minLevel ?? -1) - (a.minLevel ?? -1) || a.name.localeCompare(b.name, 'de');
    }
    return a.name.localeCompare(b.name, 'de');
  });

  const grouped = groupBy(filtered, 'category');
  categoriesEl.innerHTML = '';

  for (const [category, items] of Object.entries(grouped)) {
    const section = document.createElement('section');
    section.className = 'category';

    const title = document.createElement('h2');
    title.textContent = `${category} (${items.length})`;
    section.append(title);

    const list = document.createElement('div');
    list.className = 'recipe-list';

    for (const recipe of items) {
      const node = template.content.firstElementChild.cloneNode(true);
      const isLearned = learnedIds.has(recipe.id);

      node.classList.toggle('learned', isLearned);
      node.querySelector('.learned-checkbox').checked = isLearned;
      node.querySelector('.recipe-name').textContent = recipe.name;
      node.querySelector('.min-level').textContent = `Item Lvl: ${recipe.minLevel ?? '–'}`;
      node.querySelector('.slot').textContent = `Slot: ${recipe.slot ?? '–'}`;
      node.querySelector('.type').textContent = `Art: ${recipe.type ?? '–'}`;
      node.querySelector('.source').textContent = recipe.source;

      const link = node.querySelector('.wowhead-link');
      link.href = recipe.wowheadUrl;

      node.querySelector('.learned-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) learnedIds.add(recipe.id);
        else learnedIds.delete(recipe.id);

        localStorage.setItem(LEARNED_KEY, JSON.stringify([...learnedIds]));
        render();
      });

      list.append(node);
    }

    section.append(list);
    categoriesEl.append(section);
  }

  const learnedCount = recipes.filter((r) => learnedIds.has(r.id)).length;
  summary.textContent = `Gelernt: ${learnedCount} / ${recipes.length}`;
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const group = item[key] || 'Sonstiges';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}
