'use strict';

const isHomePage = window.location.pathname.split('/').pop().toLowerCase() === 'index.html'
  || window.location.pathname.endsWith('/');

window.siteLayoutReady = (async () => {
  if (isHomePage) return;

  const indexUrl = new URL('../index.html', window.location.href);
  const response = await fetch(indexUrl);
  if (!response.ok) {
    throw new Error(`Unable to load shared layout from index.html (${response.status}).`);
  }

  const source = new DOMParser().parseFromString(await response.text(), 'text/html');
  const sharedElements = [
    [document.querySelector('[data-shared-header]'), source.querySelector('#navbar')],
    [document.querySelector('[data-shared-mobile-nav]'), source.querySelector('#mobileNav')],
    [document.querySelector('[data-shared-footer]'), source.querySelector('.footer')]
  ];

  if (!source.head || sharedElements.some(([placeholder, element]) => !placeholder || !element)) {
    throw new Error('index.html is missing a required shared layout element.');
  }

  source.head.querySelectorAll('[href], [src]').forEach(element => {
    for (const attribute of ['href', 'src']) {
      const value = element.getAttribute(attribute);
      if (value && !/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(value)) {
        element.setAttribute(attribute, `../${value.replace(/^(?:\.\/)+/, '')}`);
      }
    }
  });

  document.documentElement.lang = source.documentElement.lang;
  document.head.replaceChildren(...Array.from(source.head.childNodes, node => node.cloneNode(true)));

  for (const [placeholder, element] of sharedElements) {
    const sharedElement = element.cloneNode(true);
    sharedElement.querySelectorAll('a[href^="#"]').forEach(link => {
      link.setAttribute('href', `${indexUrl.pathname}${link.getAttribute('href')}`);
    });
    placeholder.replaceWith(sharedElement);
  }
})();
