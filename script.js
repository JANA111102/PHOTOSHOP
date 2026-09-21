/* ── LensArt Studio — App.js ── */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. NAVBAR — shrink on scroll + hamburger
  ───────────────────────────────────────── */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ─────────────────────────────────────────
     2. GALLERY FILTER
  ───────────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });


  /* ─────────────────────────────────────────
     3. LIGHTBOX
  ───────────────────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let visibleItems = [];

  function openLightbox(index) {
    visibleItems = [...galleryItems].filter(i => !i.classList.contains('hidden'));
    currentIndex = index;
    lightboxImg.src = visibleItems[currentIndex].querySelector('img').src;
    lightboxImg.alt = visibleItems[currentIndex].querySelector('img').alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    lightboxImg.src = visibleItems[currentIndex].querySelector('img').src;
    lightboxImg.alt = visibleItems[currentIndex].querySelector('img').alt;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    lightboxImg.src = visibleItems[currentIndex].querySelector('img').src;
    lightboxImg.alt = visibleItems[currentIndex].querySelector('img').alt;
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Close on backdrop click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape')     closeLightbox();
  });


  /* ─────────────────────────────────────────
     4. SCROLL REVEAL
  ───────────────────────────────────────── */
  const revealTargets = [
    '.service-card',
    '.gallery-item',
    '.testimonial-card',
    '.about-image',
    '.about-text',
    '.contact-info',
    '.contact-form',
    '.section-header',
  ];

  const revealEls = document.querySelectorAll(revealTargets.join(','));
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));


  /* ─────────────────────────────────────────
     5. CONTACT FORM — Formspree
  ───────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const FORMSPREE_URL = 'https://formspree.io/f/mgavazke';

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = contactForm.querySelector('#name').value.trim();
    const email   = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    // Validation
    let valid = true;
    [contactForm.querySelector('#name'), contactForm.querySelector('#email'), contactForm.querySelector('#message')]
      .forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#eb5757';
          valid = false;
        }
      });
    if (!valid) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Sending… <i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          service: contactForm.querySelector('#service').value,
          message,
        }),
      });

      if (response.ok) {
        contactForm.reset();
        formSuccess.style.display = 'block';
        setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
      } else {
        const data = await response.json();
        alert(data?.errors?.map(err => err.message).join(', ') || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
      submitBtn.disabled = false;
    }
  });

  // Clear red border on input
  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });


  /* ─────────────────────────────────────────
     6. ACTIVE NAV LINK on scroll
  ───────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const allLinks  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allLinks.forEach(link => link.classList.remove('active-link'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

});
