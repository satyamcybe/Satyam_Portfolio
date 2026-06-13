
    // ==========================================================
    // 1. DYNAMIC REVERSED GRAVITY CANVAS BACKGROUND
    // ==========================================================
    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 45;
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 2.5 + 1.2;
        this.speedY = -(Math.random() * 0.7 + 0.25); // Slow upward float
        this.speedX = Math.random() * 0.4 - 0.2;
        this.alpha = Math.random() * 0.35 + 0.15;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Repel from mouse cursor (Antigravity repulsion physics)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            // Push away
            this.x += (dx / dist) * force * 2.8;
            this.y += (dy / dist) * force * 2.8;
          }
        }

        // Reset if offscreen
        if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }
      draw() {
        // Read accent rgb dynamically from theme settings
        const isLight = document.documentElement.classList.contains('light-mode');
        const rgb = isLight ? '5, 150, 105' : '16, 185, 129';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${this.alpha})`;
        ctx.shadowColor = `rgba(${rgb}, 0.2)`;
        ctx.shadowBlur = this.size * 2;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for efficiency
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();


    // ==========================================================
    // 2. INERTIAL CUSTOM CURSOR
    // ==========================================================
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    let cursorX = 0, cursorY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Update quick dot immediately
      cursorDot.style.left = `${targetX}px`;
      cursorDot.style.top = `${targetY}px`;
    });

    function updateCursor() {
      // Lerp (Linear Interpolation) for sluggish weight/gravity look
      cursorX += (targetX - cursorX) * 0.12;
      cursorY += (targetY - cursorY) * 0.12;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover scales on links/interactive items
    const hoverables = document.querySelectorAll('a, button, .accordion-header, .filter-btn, .experience-item, .form-input');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hovered');
      });
      item.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hovered');
      });
    });


    // ==========================================================
    // 3. DARK/LIGHT THEME CONTROLLER & SYSTEM RECON
    // ==========================================================
    const themeBtn = document.getElementById('theme-btn');

    // Check initial preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-mode');
      const currentTheme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('portfolio-theme', currentTheme);
    });


    // ==========================================================
    // 4. KINETIC TEXT SPLITTING & GRAVITY BOUNCE
    // ==========================================================
    const heroTitle = document.getElementById('hero-title');
    const nameRows = heroTitle.querySelectorAll('.name-row');

    nameRows.forEach(row => {
      const text = row.innerText;
      row.innerHTML = '';

      // Split characters and warp each in spans
      [...text].forEach(char => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s';
        span.innerText = char === ' ' ? '\u00A0' : char; // Keep NBSP for spaces

        span.addEventListener('mouseenter', () => {
          // Floating rise, scale, rotation
          span.style.transform = 'translateY(-14px) scale(1.2) rotate(6deg)';
          span.style.color = 'var(--accent-color)';
        });
        span.addEventListener('mouseleave', () => {
          span.style.transform = 'translateY(0) scale(1) rotate(0)';
          span.style.color = '';
        });

        row.appendChild(span);
      });
    });


    // ==========================================================
    // 5. ACCORDION LOGIC (SKILLS DRAWER)
    // ==========================================================
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const panel = item.querySelector('.accordion-panel');

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other panels
        accordionItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-panel').style.maxHeight = null;
        });

        // Toggle active one
        if (!isActive) {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          panel.style.maxHeight = null;
        }
      });
    });


    // ==========================================================
    // 6. PORTFOLIO FILTER SYSTEM
    // ==========================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const categories = card.getAttribute('data-category').split(' ');
          if (filterVal === 'all' || categories.includes(filterVal)) {
            card.classList.remove('hide');
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.opacity = '1';
            }, 50);
          } else {
            card.classList.add('hide');
          }
        });
      });
    });


    // ==========================================================
    // 7. 3D CARD TILT INTERACTION
    // ==========================================================
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        // Don't trigger if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // relative cursor coordinate
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Tilt bounds: 10deg
        const rotateX = (centerY - y) / 12;
        const rotateY = (x - centerX) / 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        card.style.boxShadow = `0 20px 45px rgba(0,0,0,0.3), 0 0 20px rgba(var(--accent-rgb), 0.15)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        card.style.boxShadow = '';
      });
    });


    // ==========================================================
    // 8. EXPERIENCE CURSOR PREVIEW TRACKER (UI IDEA 4.webp STYLE)
    // ==========================================================
    const expItems = document.querySelectorAll('.experience-item');
    const previewContainer = document.getElementById('experience-preview-container');

    expItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const roleType = item.getAttribute('data-role');
        let cardContent = '';

        if (roleType === 'gssoc') {
          cardContent = `
            <div class="preview-card-floating">
              <span class="preview-badge">Ambassador & Open Source</span>
              <h4>GSSoC 2026</h4>
              <p>Peer outreach and review work. Contributed to repository maintenance, codebase audits, and mentorship programs.</p>
              <div class="preview-tech">Git · GitHub · Markdown · Devops</div>
            </div>
          `;
        } else if (roleType === 'hacklab') {
          cardContent = `
            <div class="preview-card-floating">
              <span class="preview-badge">Community Management</span>
              <h4>HackLab TCET</h4>
              <p>Managed registration campaigns, led promotion operations, and mentored first-time hackers in TCET hackathons.</p>
              <div class="preview-tech">Community Operations · Event PR</div>
            </div>
          `;
        } else if (roleType === 'iste') {
          cardContent = `
            <div class="preview-card-floating">
              <span class="preview-badge">Working Committee</span>
              <h4>TCET ISTE</h4>
              <p>Designed and managed interactive offline math games for AC-STEM. Handled logistics, registrations, and operations for FIESTA.</p>
              <div class="preview-tech">Teamwork · Operations · Public Relations</div>
            </div>
          `;
        } else if (roleType === 'cr') {
          cardContent = `
            <div class="preview-card-floating">
              <span class="preview-badge">Student Leadership</span>
              <h4>Class Representative</h4>
              <p>Elected CR for FE Comp-A, Sem 1. Represented 70+ students to department faculty. Promoted student collaborative learning.</p>
              <div class="preview-tech">Leadership · Conflict Resolution · Management</div>
            </div>
          `;
        }

        previewContainer.innerHTML = cardContent;
        previewContainer.style.opacity = '1';
        previewContainer.style.transform = 'scale(1)';
      });

      item.addEventListener('mousemove', (e) => {
        // Offset card slightly away from actual pointer to prevent flickering
        const cardWidth = 280;
        let xPos = e.clientX + 20;

        // Prevent viewport overflow on right
        if (xPos + cardWidth > window.innerWidth) {
          xPos = e.clientX - cardWidth - 20;
        }

        previewContainer.style.left = `${xPos}px`;
        previewContainer.style.top = `${e.clientY - 60}px`;
      });

      item.addEventListener('mouseleave', () => {
        previewContainer.style.opacity = '0';
        previewContainer.style.transform = 'scale(0.9)';
      });
    });


    // ==========================================================
    // 9. SCROLL REVEALS & ACTIVE NAVBAR HIGHLIGHTING
    // ==========================================================
    const revealElements = document.querySelectorAll('.reveal');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add slide-in class
          entry.target.classList.add('active');

          // Highlight Nav Links
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => {
      sectionObserver.observe(sec);
    });

    // Observe specific reveal items
    revealElements.forEach(el => {
      sectionObserver.observe(el);
    });

    // Shrink header on scroll
    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });


    // ==========================================================
    // 10. MOBILE NAV MENU
    // ==========================================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');

    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });


    // ==========================================================
    // 11. CONTACT FORM TOAST FEEDBACK
    // ==========================================================
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    const supabaseUrl = "https://ftguogfdgbtsivlfbthv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z3VvZ2ZkZ2J0c2l2bGZidGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDQ3NjksImV4cCI6MjA5NjkyMDc2OX0.Vg7yTaVj2aB3Yyjtu3yRsgLO1Xzk2E89aKRU4OsiRFA";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Insert into Supabase
      const { error } = await supabase
        .from("contacts")
        .insert([{ full_name: name, email: email, message_details: message }]);

      if (error) {
        console.error("Error inserting data:", error);
        alert("Something went wrong saving to the database.");
      } else {
        // Reset form
        contactForm.reset();

        // Show success toast
        toastText.innerText = `Thanks ${name}, your message has been sent!`;
        toast.classList.add('show');

        setTimeout(() => {
          toast.classList.remove('show');
        }, 4000);
      }
    });

    // Handle CSV export
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", async () => {
        exportCsvBtn.innerHTML = "Exporting...";
        const { data, error } = await supabase
          .from("contacts")
          .select("*");
          
        if (error) {
          console.error("Error fetching data for export:", error);
          alert("Failed to fetch data for export.");
          exportCsvBtn.innerHTML = "Export CSV";
          return;
        }
        
        if (!data || data.length === 0) {
          alert("No contacts found to export.");
          exportCsvBtn.innerHTML = "Export CSV";
          return;
        }

        // Convert data to CSV
        const headers = Object.keys(data[0]).join(",");
        const csvRows = data.map(row => {
          return Object.values(row).map(value => {
            const escaped = ('' + (value || '')).replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(",");
        });
        
        const csvString = [headers, ...csvRows].join("\n");
        
        // Trigger download
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "contacts_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        exportCsvBtn.innerHTML = "Export CSV";
      });
    }
  
