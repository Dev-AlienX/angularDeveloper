const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const browserTheme = window.matchMedia('(prefers-color-scheme: dark)');

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeButton?.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  themeButton?.setAttribute('title', `Switch to ${nextTheme} mode`);
  themeButton?.setAttribute('aria-pressed', String(theme === 'dark'));
};

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('portfolio-theme');
} catch {}

applyTheme(savedTheme === 'dark' || savedTheme === 'light'
  ? savedTheme
  : browserTheme.matches ? 'dark' : 'light');

browserTheme.addEventListener('change', (event) => {
  let hasManualPreference = false;
  try {
    hasManualPreference = localStorage.getItem('portfolio-theme') !== null;
  } catch {}
  if (!hasManualPreference) applyTheme(event.matches ? 'dark' : 'light');
});

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  try {
    localStorage.setItem('portfolio-theme', nextTheme);
  } catch {}
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const projectList = document.querySelector('#project-list');
const projectSources = ['json/projects.json', 'docs/json/projects.json'];

const resolveProjectImage = (imagePath, sourcePath) => {
  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:')) return imagePath;
  return sourcePath.startsWith('docs/')
    ? imagePath.replace(/^\/+/, '')
    : imagePath.replace(/^docs\//, '').replace(/^\/+/, '');
};

const createProjectCard = (project, index, sourcePath) => {
  const card = document.createElement('a');
  card.className = 'project-card reveal';
  card.href = project.link;
  card.target = '_blank';
  card.rel = 'noreferrer';
  card.setAttribute('aria-label', `Open ${project.name} project`);

  const visual = document.createElement('div');
  visual.className = 'project-visual';

  const image = document.createElement('img');
  image.src = resolveProjectImage(project.image, sourcePath);
  image.alt = `${project.name} project preview`;
  image.loading = index < 2 ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.remove());

  const number = document.createElement('span');
  number.className = 'project-number';
  number.textContent = String(index + 1).padStart(2, '0');
  visual.append(image, number);

  const main = document.createElement('div');
  main.className = 'project-main';

  const titleRow = document.createElement('div');
  titleRow.className = 'project-title-row';

  const title = document.createElement('h3');
  title.textContent = project.name;
  const arrow = document.createElement('span');
  arrow.className = 'project-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  titleRow.append(title, arrow);

  const description = document.createElement('p');
  description.textContent = project.description;

  const tags = document.createElement('div');
  tags.className = 'tags';
  (project.keywords ?? []).forEach((keyword) => {
    const tag = document.createElement('span');
    tag.textContent = keyword;
    tags.append(tag);
  });

  main.append(titleRow, description, tags);
  card.append(visual, main);
  return card;
};

const loadProjects = async () => {
  if (!projectList) return;

  for (const sourcePath of projectSources) {
    try {
      const response = await fetch(sourcePath);
      if (!response.ok) continue;
      const projects = await response.json();
      if (!Array.isArray(projects) || projects.length === 0) continue;

      projectList.replaceChildren();
      projects.forEach((project, index) => {
        const card = createProjectCard(project, index, sourcePath);
        projectList.append(card);
        revealObserver.observe(card);
      });
      return;
    } catch {}
  }

  projectList.innerHTML = '<p class="projects-error">Project archive is temporarily unavailable.</p>';
};

loadProjects();

const copyButton = document.querySelector('.copy-email');
const toast = document.querySelector('.toast');
copyButton?.addEventListener('click', async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.firstChild.textContent = 'Copied ';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
