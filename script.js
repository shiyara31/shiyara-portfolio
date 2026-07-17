document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Custom Loading Screen ---
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            // Let the progress bar animation finish, then fade out
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 1200);
        });

        // Safety fallback: Hide loader after 4 seconds anyway if load event doesn't fire
        setTimeout(() => {
            if (!loader.classList.contains('fade-out')) {
                loader.classList.add('fade-out');
            }
        }, 4000);
    }

    // --- 2. Theme Toggle State Management ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Toggle theme
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
            updateParticleColorTheme(false); // Update particles color to light mode
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
            updateParticleColorTheme(true); // Update particles color to dark mode
        }
    });

    // --- 3. Interactive Particles Canvas Background ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let particleCount = 60;
    let particleColor = 'rgba(0, 242, 254, 0.6)';
    let lineColor = 'rgba(0, 242, 254, 0.15)';
    let mouse = { x: null, y: null, radius: 150 };

    // Function to adapt particle colors to active theme
    function updateParticleColorTheme(isDark) {
        if (isDark) {
            particleColor = 'rgba(0, 242, 254, 0.6)';
            lineColor = 'rgba(0, 242, 254, 0.15)';
        } else {
            particleColor = 'rgba(8, 145, 178, 0.5)';
            lineColor = 'rgba(8, 145, 178, 0.12)';
        }
        particles.forEach(p => {
            p.color = particleColor;
        });
    }

    // Initialize color based on current layout
    updateParticleColorTheme(body.classList.contains('dark-theme'));

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object Blueprint
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.dx = (Math.random() - 0.5) * 1.2;
            this.dy = (Math.random() - 0.5) * 1.2;
            this.radius = Math.random() * 2.5 + 1;
            this.color = particleColor;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = body.classList.contains('dark-theme') ? 8 : 0;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
        }

        update() {
            // Check boundary collisions
            if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
            if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

            this.x += this.dx;
            this.y += this.dy;
            this.draw();
        }
    }

    // Initialize particle pool
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    // Redraw and connect nodes
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => p.update());
        connectParticles();
        
        requestAnimationFrame(animateParticles);
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dist = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y);
                if (dist < 120) {
                    let opacity = (1 - (dist / 120)) * 0.75;
                    ctx.strokeStyle = lineColor.replace('0.1', opacity.toString());
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }

            // Connection with mouse
            if (mouse.x !== null && mouse.y !== null) {
                let mDist = Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y);
                if (mDist < mouse.radius) {
                    let opacity = (1 - (mDist / mouse.radius)) * 0.6;
                    ctx.strokeStyle = lineColor.replace('0.1', opacity.toString());
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }
    animateParticles();


    // --- 4. Typing Effect in Hero ---
    const typingElement = document.getElementById('typing-effect');
    const roles = ["Cybersecurity Analyst", "IoT Specialist", "Blockchain Developer", "Full-Stack Web Developer"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function handleTyping() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // faster deletion
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // standard writing speed
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 1500; // pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // brief pause before next word
        }

        setTimeout(handleTyping, typingSpeed);
    }
    
    // Start Typing Effect
    if (typingElement) {
        setTimeout(handleTyping, 1000);
    }


    // --- 5. Mobile Navbar and Scroll Behaviors ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    const scrollTopBtn = document.getElementById('scroll-top');

    // Toggle menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Window scroll functions
    window.addEventListener('scroll', () => {
        // Sticky Header scroll styling
        if (window.scrollY > 50) {
            header.classList.add('glass');
        } else {
            header.classList.remove('glass');
        }

        // Show/hide scroll-to-top button
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove('hidden');
        } else {
            scrollTopBtn.classList.add('hidden');
        }

        // Active link dynamic scroll highlight
        let fromTop = window.scrollY + 100;
        navLinks.forEach(link => {
            let section = document.querySelector(link.getAttribute('href'));
            if (section) {
                if (
                    section.offsetTop <= fromTop &&
                    section.offsetTop + section.offsetHeight > fromTop
                ) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // Scroll to Top action
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // --- 6. Scroll Reveal and Skills Progress Bars ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const progressFills = document.querySelectorAll('.progress-fill');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it is the skills section, animate progress bars
                if (entry.target.id === 'skills') {
                    animateProgressBars();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    function animateProgressBars() {
        progressFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width;
        });
    }


    // --- 7. Timeline Tab Switching ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const timelineContainers = document.querySelectorAll('.timeline-container');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Set active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Set active timeline panel
            timelineContainers.forEach(container => {
                if (container.id === targetTab) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            });
        });
    });


    // --- 8. Simulated GitHub Activity Grid ---
    const contribGrid = document.getElementById('contrib-grid');
    if (contribGrid) {
        // Generate grid squares (7 rows, 35 columns)
        const totalSquares = 7 * 35;
        for (let i = 0; i < totalSquares; i++) {
            const square = document.createElement('div');
            square.classList.add('contrib-box');
            
            // Random distribution to make the mockup look real
            const rand = Math.random();
            let colorClass = 'color-0';
            if (rand > 0.85) colorClass = 'color-4';
            else if (rand > 0.7) colorClass = 'color-3';
            else if (rand > 0.5) colorClass = 'color-2';
            else if (rand > 0.3) colorClass = 'color-1';
            
            square.classList.add(colorClass);
            contribGrid.appendChild(square);
        }
    }


    // --- 9. Visitor Counter ---
    const visitorCountEl = document.getElementById('visitor-count');
    if (visitorCountEl) {
        let visits = localStorage.getItem('portfolio_visits') || 0;
        // Randomly set a baseline on first load so it looks realistic
        if (visits == 0) {
            visits = Math.floor(Math.random() * 150) + 75;
        } else {
            visits = parseInt(visits) + 1;
        }
        localStorage.setItem('portfolio_visits', visits);
        visitorCountEl.textContent = visits;
    }


    // --- 10. Form Validation & Cybersecurity Captcha ---
    const contactForm = document.getElementById('contact-form');
    const captchaQuestion = document.getElementById('captcha-question');
    const captchaInput = document.getElementById('captcha');
    const formFeedback = document.getElementById('form-feedback');

    let captchaAnswer = 0;

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 12) + 4;
        const num2 = Math.floor(Math.random() * 8) + 2;
        captchaAnswer = num1 + num2;
        if (captchaQuestion) {
            captchaQuestion.textContent = `${num1} + ${num2} =`;
        }
    }
    generateCaptcha();

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const userAnswer = parseInt(captchaInput.value);

            formFeedback.className = 'form-feedback'; // reset classes

            // Validate Captcha
            if (userAnswer !== captchaAnswer) {
                e.preventDefault(); // Stop form submission only if validation fails
                formFeedback.classList.add('error');
                formFeedback.textContent = "Security validation failed. Please solve the calculation again.";
                formFeedback.classList.remove('hidden');
                generateCaptcha();
                captchaInput.value = '';
                return;
            }

            // Captcha passed! Change submit button text to sending state
            const submitBtn = contactForm.querySelector('.btn-submit');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitting...';
            // Do not call e.preventDefault() or disable button here to allow native form submission
        });
    }


    // --- 11. Certifications Verification Modal Modal System ---
    const modal = document.getElementById('cert-modal');
    const closeBtn = document.querySelector('.modal-close');
    const viewCertButtons = document.querySelectorAll('.btn-cert');

    const certData = {
        'AWS Certified Developer – Associate': {
            issuer: 'Infosys',
            hash: 'SHA256-AW5C-7D9B-F23A-8C1E-6C4E',
            verifyUrl: 'assets/aws_certified_developer.png',
            images: ['assets/aws_certified_developer.png'],
            modules: [
                'AWS Core Services (EC2, S3, RDS, DynamoDB, Lambda, API Gateway)',
                'Cloud App Security, Deployment, and Monitoring',
                'Serverless Application Design & Microservices'
            ]
        },
        'Microsoft Security, Identity & Compliance': {
            issuer: 'Microsoft (Satya Nadella)',
            hash: 'SHA256-MS7S-9F5C-B2D8-4E3A-9E5F',
            verifyUrl: 'assets/microsoft_security_1.png',
            images: [
                'assets/microsoft_security_1.png',
                'assets/microsoft_security_2.png',
                'assets/microsoft_security_3.png',
                'assets/microsoft_security_4.png',
                'assets/microsoft_security_5.png'
            ],
            modules: [
                'Describe core infrastructure security services in Azure',
                'Describe security capabilities of Microsoft Sentinel',
                'Describe security management capabilities in Azure',
                'Describe threat protection with Microsoft Defender XDR',
                'Describe access management & authentication capabilities of Microsoft Entra ID',
                'Describe function & identity types of Microsoft Entra ID',
                'Describe Microsoft Security Copilot & AI Security Concepts',
                'Describe identity protection and governance capabilities of Microsoft Entra',
                'Describe data security, governance, and compliance solutions of Microsoft Purview',
                'Describe Microsoft\'s Service Trust portal and privacy capabilities',
                'Introduction to generative AI security concepts'
            ]
        },
        'IIT Bombay Spoken Tutorials': {
            issuer: 'IIT Bombay (Prof. Kannan M Moudgalya)',
            hash: 'SHA256-DK9R-6C5B-4A3D-1F0E-8E7F',
            verifyUrl: 'assets/iitb_docker.png',
            images: [
                'assets/iitb_docker.png',
                'assets/iitb_arduino.png',
                'assets/iitb_latex.png'
            ],
            modules: [
                'Docker Training (Containers, Networking, Volumes, Compose & Registry)',
                'Arduino Training (IoT Architectures, Sensors, Analog & Digital Interfacing)',
                'Java Training (OOP Concepts, Multi-threading, File handling & SQL connection)',
                'LaTeX Training (Technical typesetting, Mathematical formatting, Document styles)'
            ]
        },
        'Rapid Development for AI Services': {
            issuer: 'IBM (Jagadisha Bhat)',
            hash: 'SHA256-IB9M-4D3C-2A5F-8E7C-5B4A',
            verifyUrl: 'assets/ibm_ai_services.png',
            images: ['assets/ibm_ai_services.png'],
            modules: [
                'AI Application Architecture and Integration',
                'IBM Cloud AI tools & Software Services',
                'Model Integration & API Development'
            ]
        },
        'C++ & C# Development Series': {
            issuer: 'LinkedIn Learning',
            hash: 'SHA256-AZ5F-8E4B-A9D7-3C2B-1F2B',
            verifyUrl: 'assets/linkedin_cpp_csharp.pdf',
            modules: [
                'C# Essential Training 1 & 2 (Types, Control Flow, Collections, LINQ)',
                'C# Interfaces, Generics, Delegates, Events, and Lambdas',
                'C# Algorithms and Object Oriented Design Patterns (Part 1 & 2)',
                'C++ Getting Started & C++ Templates and the STL',
                'C++ Best Practices for Developers & Code Clinic: C++',
                'Introducing Functional Programming in C++',
                'Web Servers and APIs using C++'
            ]
        },
        'Coursera Professional Development': {
            issuer: 'Coursera Partner Programs',
            hash: 'SHA256-CR6C-5B4A-3D1F-0E8E-7F8A',
            verifyUrl: 'assets/coursera_wordpress.png',
            images: [
                'assets/coursera_wordpress.png',
                'assets/coursera_excel_pm.png',
                'assets/coursera_excel_data.png'
            ],
            modules: [
                'Build a free website with WordPress',
                'Create a Project Management Tracker using Microsoft Excel',
                'Getting Started with Microsoft Excel',
                'Introduction to Data Analysis using Microsoft Excel'
            ]
        }
    };

    viewCertButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const certCard = btn.closest('.cert-details');
            const certTitle = certCard.querySelector('h3').textContent.trim();
            const details = certData[certTitle] || {
                issuer: 'External Issuer',
                hash: 'SHA256-GENERIC...CREDENTIAL',
                verifyUrl: '#',
                modules: []
            };

            // Set modal values
            document.getElementById('modal-cert-title').textContent = certTitle;
            document.getElementById('modal-cert-issuer').textContent = `Issued by ${details.issuer}`;
            document.getElementById('modal-cert-hash').textContent = `VERIFIED HASH: ${details.hash}`;
            document.getElementById('modal-verify-link').setAttribute('href', details.verifyUrl);

            // Populate modules list
            const modulesList = document.getElementById('modal-cert-modules');
            if (modulesList) {
                modulesList.innerHTML = '';
                if (details.modules && details.modules.length > 0) {
                    details.modules.forEach(mod => {
                        const li = document.createElement('li');
                        li.textContent = mod;
                        modulesList.appendChild(li);
                    });
                }
            }

            // Image Carousel / Fallback Handling
            const viewerContainer = document.getElementById('modal-cert-viewer');
            const fallbackContainer = document.getElementById('modal-cert-fallback');

            if (details.images && details.images.length > 0) {
                fallbackContainer.classList.add('hidden');
                viewerContainer.classList.remove('hidden');

                let currentImageIndex = 0;
                const images = details.images;

                const certImg = document.getElementById('modal-cert-img');
                certImg.setAttribute('src', images[0]);

                const prevBtn = document.getElementById('modal-prev-btn');
                const nextBtn = document.getElementById('modal-next-btn');
                const dotsContainer = document.getElementById('modal-carousel-dots');

                dotsContainer.innerHTML = '';

                function updateCarouselImage() {
                    certImg.style.opacity = '0.3';
                    setTimeout(() => {
                        certImg.setAttribute('src', images[currentImageIndex]);
                        certImg.style.opacity = '1';
                    }, 150);

                    // Update dot indicators
                    const dots = dotsContainer.querySelectorAll('.carousel-dot');
                    dots.forEach((dot, index) => {
                        if (index === currentImageIndex) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });

                    // Update verification link to current slide
                    document.getElementById('modal-verify-link').setAttribute('href', images[currentImageIndex]);
                }

                if (images.length > 1) {
                    prevBtn.classList.remove('hidden');
                    nextBtn.classList.remove('hidden');

                    // Create dots
                    images.forEach((_, idx) => {
                        const dot = document.createElement('div');
                        dot.classList.add('carousel-dot');
                        if (idx === 0) dot.classList.add('active');
                        dot.addEventListener('click', () => {
                            currentImageIndex = idx;
                            updateCarouselImage();
                        });
                        dotsContainer.appendChild(dot);
                    });

                    // Reset button event listeners via cloning to avoid duplication
                    const newPrevBtn = prevBtn.cloneNode(true);
                    const newNextBtn = nextBtn.cloneNode(true);

                    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
                    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

                    newPrevBtn.addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                        updateCarouselImage();
                    });

                    newNextBtn.addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex + 1) % images.length;
                        updateCarouselImage();
                    });
                } else {
                    prevBtn.classList.add('hidden');
                    nextBtn.classList.add('hidden');
                }
            } else {
                viewerContainer.classList.add('hidden');
                fallbackContainer.classList.remove('hidden');
            }

            // Open Modal
            modal.classList.add('active');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close on outside window click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
