/**
 * Muhammad Umar — Portfolio Website
 * High-performance, modular vanilla JavaScript engine.
 * Pure Vanilla JS: Zero external runtime dependencies.
 */

'use strict';

// ==========================================================================
// 1. THEME ENGINE (Dark / Light Mode)
// ==========================================================================
const ThemeManager = {
  storageKey: 'mu_theme',

  init() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    // Initial theme check
    const currentTheme = this.getCurrentTheme();
    this.applyTheme(currentTheme);

    // Event listeners
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // System preference change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  getCurrentTheme() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#07080c' : '#f8fafc');
    }
    if (window.bgCanvasInstance) {
      window.bgCanvasInstance.updateThemeColors();
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, next);
    this.applyTheme(next);
    showToast(`Switched to ${next.charAt(0).toUpperCase() + next.slice(1)} Mode`);
  }
};

// ==========================================================================
// 2. INTERACTIVE PARTICLES & CONSTELLATION CANVAS
// ==========================================================================
class BackgroundCanvas {
  constructor() {
    this.canvas = document.getElementById('bgCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 120 };
    this.animationFrameId = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.isReducedMotion) return;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
    window.bgCanvasInstance = this;
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      particle: isDark ? 'rgba(0, 240, 255, ' : 'rgba(2, 132, 199, ',
      line: isDark ? 'rgba(0, 240, 255, ' : 'rgba(2, 132, 199, '
    };
  }

  updateThemeColors() {
    this.colors = this.getColors();
  }

  createParticles() {
    this.colors = this.getColors();
    this.particles = [];
    // Adjust density based on screen size
    const count = Math.floor((this.width * this.height) / (window.innerWidth < 768 ? 22000 : 15000));
    const safeCount = Math.min(Math.max(count, 25), 90);

    for (let i = 0; i < safeCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const connectionDist = window.innerWidth < 768 ? 90 : 130;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce at boundaries
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Subtle mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${this.colors.particle}${p.alpha})`;
      this.ctx.fill();

      // Connect particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

        if (dist < connectionDist) {
          const opacity = (1 - dist / connectionDist) * 0.18;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `${this.colors.line}${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================================
// 3. CUSTOM MOUSE CURSOR
// ==========================================================================
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('cursorFollower');
  
  if (!cursor || !follower) return;

  const isTouch = window.matchMedia('(hover: none) or (max-width: 1024px)').matches;
  if (isTouch) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.14;
    followerY += (mouseY - followerY) * 0.14;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Hover state detection on interactive items
  const interactiveTargets = 'a, button, input, textarea, .glass-card, .skill-pill, .filter-btn, .copy-btn, .project-card';
  document.querySelectorAll(interactiveTargets).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      follower.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      follower.classList.remove('cursor-hover');
    });
  });
}

// ==========================================================================
// 4. HEADER SHRINK & SCROLL SPY
// ==========================================================================
function initNavigationEngine() {
  const header = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobLinks = document.querySelectorAll('.mobile-nav-links .mob-link');

  function onScroll() {
    const scrollY = window.scrollY;

    // Header scroll appearance
    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }

    // Back to top visibility
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollY > 400);
    }

    // Scroll spy active link detection
    let currentActiveId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentActiveId = section.getAttribute('id');
      }
    });

    if (currentActiveId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === currentActiveId);
      });
      mobLinks.forEach((link) => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === currentActiveId);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ==========================================================================
// 5. MOBILE DRAWER NAVIGATION
// ==========================================================================
function initMobileDrawer() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  if (!hamburgerBtn || !mobileDrawer || !drawerBackdrop) return;

  function openMenu() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  window.closeMobileMenu = closeMenu;

  hamburgerBtn.addEventListener('click', openMenu);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMenu);
  drawerBackdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

// ==========================================================================
// 6. DYNAMIC TERMINAL / ROLE TYPEWRITER
// ==========================================================================
function initTypewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;

  const roles = [
    'Full Stack Developer',
    'Software Engineer',
    'CS Undergraduate',
    'C++ & Algorithmic Problem Solver',
    'React & Node.js Builder'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function tick() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2200; // Pause at end of text
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pause before typing next
    }

    setTimeout(tick, typingSpeed);
  }

  tick();
}

// ==========================================================================
// 7. ANIMATED NUMBER COUNTERS & SKILL BARS
// ==========================================================================
function initStatsAndProgressCounters() {
  // Stat numbers observer
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'), 10);
        if (!isNaN(target)) {
          animateCount(entry.target, target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach((stat) => statsObserver.observe(stat));

  function animateCount(element, target) {
    let count = 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      count = Math.floor(easeProgress * target);
      element.innerHTML = `${count}<span class="stat-plus">+</span>`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.innerHTML = `${target}<span class="stat-plus">+</span>`;
      }
    }
    requestAnimationFrame(update);
  }

  // Skill progress bars observer
  const progressBars = document.querySelectorAll('.bar-progress');
  const barObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const progress = entry.target.getAttribute('data-progress');
        entry.target.style.width = `${progress}%`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  progressBars.forEach((bar) => barObserver.observe(bar));
}

// ==========================================================================
// 8. SCROLL REVEAL (IntersectionObserver)
// ==========================================================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el) => revealObserver.observe(el));
}

// ==========================================================================
// 9. PROJECT FILTERING & DETAIL MODAL
// ==========================================================================
const projectData = {
  cinema: {
    title: 'Cinema Ticket Reservation System',
    category: 'System Software & C++',
    description: 'A complete terminal-based reservation management software built in modern C++. It implements an intuitive interactive seat booking layout, real-time movie scheduling, ticket generation, concessions inventory billing, and persistent file-based record storage.',
    features: [
      'Interactive matrix seat visualization with real-time seat locks and validation.',
      'File-based I/O persistence preserving customer reservations and show schedules.',
      'Robust Object-Oriented Architecture with encapsulated seat, movie, and transaction classes.',
      'Food & beverage order processing with integrated digital invoice generation.'
    ],
    tech: ['C++', 'Object-Oriented Design', 'File I/O', 'Data Structures', 'Console Graphics'],
    github: 'https://github.com/'
  },
  uncut: {
    title: 'UNCUT Cinema Management Desktop System',
    category: 'Desktop & Database Application',
    description: 'An enterprise desktop application engineered in C# (.NET) and Microsoft SQL Server. Provides cinema theatre managers with comprehensive CRUD operations for movie inventories, hall schedules, ticket printing, and sales revenue analytics.',
    features: [
      'Multi-hall scheduling and automated conflict detection algorithms.',
      'SQL Server database schema with relational integrity and parameterized queries.',
      'Custom Windows Forms UI with responsive controls and custom theme styling.',
      'Customer profile management, booking history tracking, and printable receipts.'
    ],
    tech: ['C#', '.NET Framework', 'SQL Server', 'Windows Forms', 'ADO.NET', 'Database Normalization'],
    github: 'https://github.com/'
  },
  avl: {
    title: 'Student Record Management System (AVL Tree)',
    category: 'Algorithms & Data Structures',
    description: 'A high-performance algorithmic database utility utilizing a self-balancing AVL Binary Search Tree. Guarantees logarithmic O(log n) worst-case time complexity for student record searches, insertions, deletions, and AVL rotation rebalancing.',
    features: [
      'Implementation of Left-Left, Right-Right, Left-Right, and Right-Left AVL rotations.',
      'Depth and height balance factor recalculations on every record modification.',
      'In-order, pre-order, and post-order tree traversals for formatted transcript generation.',
      'Memory-efficient dynamic pointer management with zero memory leaks.'
    ],
    tech: ['C++', 'AVL Trees', 'Binary Search Trees', 'Pointers & Dynamic Memory', 'Time Complexity Optimization'],
    github: 'https://github.com/'
  },
  greenchain: {
    title: 'GreenChain Smart Eco-Reward Ecosystem',
    category: 'Full-Stack Web Platform',
    description: 'A responsive smart recycling and incentive platform that rewards users with digital points and money withdrawals in PKR for depositing recyclable materials. Built with modern web standards and backend processing.',
    features: [
      'User authentication with role-based access for eco-citizens and recycling hub admins.',
      'Integrated payment gateway system supporting digital wallet withdrawals in PKR.',
      'Real-time deposit tracker with dynamic reward calculation algorithms.',
      'Mobile-first responsive dashboard designed with modern CSS and JavaScript.'
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'PHP', 'MySQL', 'Payment Gateway Integration'],
    github: 'https://github.com/'
  },
  academic: {
    title: 'Academic & Course Management Portal',
    category: 'Enterprise Academic Web Suite',
    description: 'A university management suite designed for automated student course enrollments, instructor curriculum workflows, grade submissions, and administrative academic auditing with enterprise security standards.',
    features: [
      'Secure role-based authorization for Students, Professors, and University Admin.',
      'Real-time GPA/CGPA computational engine with transcript generation.',
      'Course prerequisite validation engine preventing invalid enrollment chains.',
      'Scalable relational database structure with optimized indexing and relational tables.'
    ],
    tech: ['Full-Stack Web', 'PHP / Node.js', 'MySQL Database', 'REST APIs', 'Role-Based Security'],
    github: 'https://github.com/'
  },
  portfolio: {
    title: 'Personal Developer Portfolio Website',
    category: 'Modern Frontend & Design Engine',
    description: 'A futuristic developer portfolio website engineered with clean semantic HTML5, dual-theme CSS custom property engine, interactive background particle canvas, and vanilla JavaScript micro-interactions.',
    features: [
      'Dual Dark/Light mode theme engine with localStorage persistence and zero flicker.',
      '60fps interactive particle network canvas reacting to user mouse coordinates.',
      'WCAG AA accessible component structures, focus states, and keyboard navigation.',
      'Pure vanilla JavaScript with zero external runtime dependencies or bloat.'
    ],
    tech: ['HTML5', 'CSS3 Variables', 'Vanilla JavaScript (ES6+)', 'Canvas 2D API', 'Responsive Design'],
    github: 'https://github.com/'
  }
};

function initProjectEngine() {
  // Filter tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  // Modal dialog setup
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeProjectModal();
      }
    });

    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeProjectModal();
    });
  }
}

window.openProjectModal = function(projectId) {
  const data = projectData[projectId];
  const modal = document.getElementById('projectModal');
  if (!data || !modal) return;

  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalCategory').textContent = data.category;
  document.getElementById('modalDescription').textContent = data.description;

  const featuresList = document.getElementById('modalFeatures');
  featuresList.innerHTML = data.features.map(f => `<li><i class="fas fa-check-circle"></i> <span>${f}</span></li>`).join('');

  const techPills = document.getElementById('modalTechPills');
  techPills.innerHTML = data.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

  const githubBtn = document.getElementById('modalGithubLink');
  if (githubBtn) githubBtn.href = data.github;

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  if (typeof modal.close === 'function') {
    modal.close();
  } else {
    modal.removeAttribute('open');
  }
  document.body.style.overflow = '';
};

// ==========================================================================
// 10. CLIPBOARD HELPER & TOAST NOTIFICATION
// ==========================================================================
window.copyToClipboard = function(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || 'Copied to clipboard!');
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
};

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || 'Copied to clipboard!');
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-circle-check"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2600);
}

// ==========================================================================
// 11. CONTACT FORM HANDLER
// ==========================================================================
window.handleFormSubmit = function(event) {
  event.preventDefault();

  const nameInput = document.getElementById('senderName');
  const emailInput = document.getElementById('senderEmail');
  const subjectInput = document.getElementById('senderSubject');
  const messageInput = document.getElementById('senderMessage');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('formSuccessAlert');

  let isValid = true;

  // Validate Name
  const nameGroup = nameInput.closest('.form-group');
  if (!nameInput.value.trim()) {
    nameGroup.classList.add('has-error');
    isValid = false;
  } else {
    nameGroup.classList.remove('has-error');
  }

  // Validate Email
  const emailGroup = emailInput.closest('.form-group');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
    emailGroup.classList.add('has-error');
    isValid = false;
  } else {
    emailGroup.classList.remove('has-error');
  }

  // Validate Message
  const messageGroup = messageInput.closest('.form-group');
  if (!messageInput.value.trim()) {
    messageGroup.classList.add('has-error');
    isValid = false;
  } else {
    messageGroup.classList.remove('has-error');
  }

  if (!isValid) return;

  // Animate submit button
  const originalHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Sending Message...</span>`;

  setTimeout(() => {
    submitBtn.innerHTML = `<i class="fas fa-check"></i> <span>Message Sent!</span>`;
    submitBtn.style.background = '#10b981';
    submitBtn.style.borderColor = '#10b981';
    submitBtn.style.color = '#ffffff';

    if (successAlert) {
      successAlert.style.display = 'flex';
    }

    showToast('Your message has been sent successfully!');

    // Reset Form
    setTimeout(() => {
      document.getElementById('contactForm').reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
      submitBtn.style.color = '';
      if (successAlert) {
        setTimeout(() => { successAlert.style.display = 'none'; }, 4000);
      }
    }, 2500);
  }, 1000);
};

// ==========================================================================
// 12. SCROLL TO TOP & SMOOTH INTERNAL LINK ENGINE
// ==========================================================================
window.scrollToTop = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 76;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Update current year dynamically
function initDynamicYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ==========================================================================
// DOM READY INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  new BackgroundCanvas();
  initCustomCursor();
  initNavigationEngine();
  initMobileDrawer();
  initTypewriter();
  initStatsAndProgressCounters();
  initScrollReveal();
  initProjectEngine();
  initSmoothScrolling();
  initDynamicYear();

  console.log('%c Muhammad Umar · Full Stack Developer ', 'background: #00f0ff; color: #000; font-family: monospace; font-size: 13px; font-weight: bold; padding: 5px 12px; border-radius: 4px;');
  console.log('%c Code with Purpose · Design with Passion · Build for the Future', 'color: #3b82f6; font-family: monospace; font-size: 11px;');
});

