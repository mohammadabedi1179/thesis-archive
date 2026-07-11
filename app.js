/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — app logic
   To add a new document later:
     1. Drop the exported .html file into /diagrams
     2. Add one object to ITEMS below (copy an existing one as a template)
   That's it — no build step, no other file needs to change.
   ══════════════════════════════════════════════════════════════ */

const ITEMS = [
  {
    id: 'apriltag-cube',
    title: 'مکعب برچسب‌های AprilTag',
    subtitle: 'رمزگذاری هدف با برچسب‌های سه‌بعدی روی جعبه — نگاشت وجه به شناسه',
    file: 'diagrams/apriltag-goal-cube.html',
    category: 'بینایی سه‌بعدی و حسگرها',
    lang: 'fa'
  },
  {
    id: 'acquisition-pipeline',
    title: 'خط لوله دریافت تصویر استریو',
    subtitle: 'از دوربین تا شبکه — مسیر داده تصویر خام دو دوربینه',
    file: 'diagrams/acquisition-pipeline-diagram.html',
    category: 'بینایی سه‌بعدی و حسگرها',
    lang: 'fa'
  },
  {
    id: 'depth-accuracy',
    title: 'دقت نقشهٔ عمق',
    subtitle: 'Depth Accuracy — تحلیل تعاملی خطای برآورد عمق استریو',
    file: 'diagrams/depth-accuracy-interactive.html',
    category: 'بینایی سه‌بعدی و حسگرها',
    lang: 'en'
  }
];

const waypointListEl = document.getElementById('waypoint-list');
const viewerEl       = document.getElementById('viewer');
const emptyStateEl   = document.getElementById('empty-state');
const itemCountEl    = document.getElementById('itemCount');
const openNewTabBtn  = document.getElementById('openNewTab');
const fullscreenBtn  = document.getElementById('fullscreenBtn');
const menuToggleBtn  = document.getElementById('menuToggle');
const sidebarEl      = document.getElementById('sidebar');
const scrimEl        = document.getElementById('scrim');
const viewerPaneEl   = document.getElementById('viewer-pane');

let activeId = null;

function groupByCategory(items){
  const order = [];
  const map = new Map();
  items.forEach(item => {
    if (!map.has(item.category)) { map.set(item.category, []); order.push(item.category); }
    map.get(item.category).push(item);
  });
  return order.map(cat => ({ category: cat, items: map.get(cat) }));
}

function renderSidebar(){
  const groups = groupByCategory(ITEMS);
  waypointListEl.innerHTML = '';

  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'wp-group';

    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = group.category;
    groupEl.appendChild(label);

    group.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'waypoint-item';
      btn.type = 'button';
      btn.setAttribute('data-id', item.id);
      btn.setAttribute('aria-current', 'false');

      btn.innerHTML = `
        <span class="wp-rail"><span class="wp-dot"></span></span>
        <span class="wp-body">
          <span class="wp-title">${item.title}</span>
          <span class="wp-sub">${item.subtitle}</span>
          <span class="wp-tags"><span class="wp-tag">${item.lang === 'fa' ? 'فارسی' : 'EN'}</span></span>
        </span>
      `;
      btn.addEventListener('click', () => selectItem(item.id));
      groupEl.appendChild(btn);
    });

    waypointListEl.appendChild(groupEl);
  });

  itemCountEl.textContent = `${toPersianDigits(ITEMS.length)} سند تعاملی`;
}

function toPersianDigits(n){
  const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => map[d]);
}

function selectItem(id){
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;
  activeId = id;

  viewerEl.src = item.file;
  viewerEl.hidden = false;
  emptyStateEl.style.display = 'none';

  document.querySelectorAll('.waypoint-item').forEach(btn => {
    const isActive = btn.getAttribute('data-id') === id;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', String(isActive));
  });

  openNewTabBtn.disabled = false;
  fullscreenBtn.disabled = false;

  closeSidebarOnMobile();
}

openNewTabBtn.addEventListener('click', () => {
  const item = ITEMS.find(i => i.id === activeId);
  if (item) window.open(item.file, '_blank', 'noopener');
});

fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    viewerPaneEl.requestFullscreen?.();
  }
});

function isMobileLayout(){
  return window.matchMedia('(max-width: 880px)').matches;
}

function openSidebar(){
  sidebarEl.classList.add('open');
  scrimEl.classList.add('open');
  menuToggleBtn.setAttribute('aria-expanded', 'true');
}
function closeSidebar(){
  sidebarEl.classList.remove('open');
  scrimEl.classList.remove('open');
  menuToggleBtn.setAttribute('aria-expanded', 'false');
}
function closeSidebarOnMobile(){
  if (isMobileLayout()) closeSidebar();
}

menuToggleBtn.addEventListener('click', () => {
  sidebarEl.classList.contains('open') ? closeSidebar() : openSidebar();
});
scrimEl.addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

renderSidebar();

// On desktop widths the sidebar is always visible; make sure a resize
// out of mobile mode doesn't leave the scrim stuck open.
window.addEventListener('resize', () => {
  if (!isMobileLayout()) closeSidebar();
});
