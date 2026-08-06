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
