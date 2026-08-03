const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'dark') root.dataset.theme = 'dark';

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme === 'dark' ? 'dark' : '';
  localStorage.setItem('portfolio-theme', nextTheme);
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
