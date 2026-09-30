// C9fy — melhorias progressivas. O site funciona sem este arquivo.
(function () {
  // Menu mobile
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle.click();
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cards que viram: com mouse, vira ao passar por cima (CSS :hover / tilt abaixo);
  // no toque, o toque alterna a face. O clique do mouse não prende o card virado.
  var flips = document.querySelectorAll('.flip');
  for (var i = 0; i < flips.length; i++) {
    flips[i].addEventListener('pointerdown', function (e) { this.__touch = e.pointerType !== 'mouse'; });
    flips[i].addEventListener('click', function (e) {
      if (!this.__touch || e.target.closest('a')) return;
      this.classList.toggle('is-flipped');
    });
  }

  // Inclinação 3D (tilt) ao passar o mouse — só com mouse e sem redução de movimento
  if (reduce) return;
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  function inner(card) { return card.querySelector('[data-tilt-inner]') || card; }
  function baseRy(card) { return card.classList.contains('flip') && card.__over ? 180 : 0; }
  function setT(card, rx, ry, dur) {
    var el = inner(card);
    el.style.transition = 'transform ' + dur + ' ' + EASE;
    el.style.transform = 'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
  }
  function move(card, e) {
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    var max = +card.getAttribute('data-tilt') || 10;
    setT(card, -py * max, px * max + baseRy(card), card.__settling ? '.7s' : '.16s');
    var g = card.querySelector('[data-glare]');
    if (g) {
      g.style.opacity = '1';
      g.style.background = 'radial-gradient(circle at ' + (px + .5) * 100 + '% ' + (py + .5) * 100 + '%, rgba(255,255,255,.42), rgba(255,255,255,0) 62%)';
    }
  }
  // Ao sair, devolve o transform ao CSS (card desvirado, ou virado se estiver em foco/toque)
  function reset(card) {
    setT(card, 0, 0, '.7s');
    card.__t = setTimeout(function () {
      if (card.__over) return;
      var el = inner(card); el.style.transition = 'none'; el.style.transform = '';
    }, 720);
    var g = card.querySelector('[data-glare]'); if (g) g.style.opacity = '0';
  }
  var cards = document.querySelectorAll('[data-tilt]');
  for (var j = 0; j < cards.length; j++) {
    (function (card) {
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        card.__over = true; card.__settling = true; clearTimeout(card.__t);
        card.__t = setTimeout(function () { card.__settling = false; }, 700);
        move(card, e);
      });
      card.addEventListener('pointermove', function (e) { if (card.__over) move(card, e); });
      card.addEventListener('pointerleave', function (e) {
        if (!card.__over) return;
        card.__over = false; clearTimeout(card.__t); reset(card);
      });
    })(card);
  }
})();
