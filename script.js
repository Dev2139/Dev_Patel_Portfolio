// Smooth Page Transitions (SPA Style - No Reload)
function initPageTransitions() {
    const links = document.querySelectorAll('a[href$=".html"]');
    const mainContent = document.querySelector('.about.page, section.page');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Skip if it's an external link or has target="_blank"
            if (this.hasAttribute('target') || href.startsWith('http')) {
                return;
            }
            e.preventDefault();
            // Update active state in navigation
            document.querySelectorAll('.nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            // Add smooth transition out
            const currentPage = document.querySelector('section.page, .about.page');
            if (currentPage) {
                currentPage.classList.add('page-transition-out');
                currentPage.classList.remove('page-transition-in');
            }
            setTimeout(() => {
                fetch(href)
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const newContent = doc.querySelector('section.page, .about.page');
                        const currentContent = document.querySelector('section.page, .about.page');
                        if (newContent && currentContent) {
                            currentContent.innerHTML = newContent.innerHTML;
                            currentContent.id = newContent.id;
                            currentContent.className = newContent.className;
                            // Update page title
                            document.title = doc.title;
                            // Update URL without reload
                            history.pushState({page: href}, '', href);
                            // Animate in
                            setTimeout(() => {
                                currentContent.classList.remove('page-transition-out');
                                currentContent.classList.add('page-transition-in');
                                // Reinitialize page-specific scripts
                                initPageLoadAnimations();
                                initLazyImages();
                                initCertificateModalIfNeeded();
                                initProjectModal();
                                if (typeof initContactForm === 'function') initContactForm();
                            }, 50);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading page:', error);
                        window.location.href = href;
                    });
            }, 350);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            window.location.reload();
        }
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initPageTransitions);

// Page Load Animations
function initPageLoadAnimations() {
    // Auto-add animations to common elements
    const autoAnimateSelectors = [
        '.item',
        '.skill-item',
        '.service-item',
        '.project-item',
        '.certificate-item',
        '.timeline-item',
        '.contact-box',
        '.grid-item > *',
        '.hero-content',
        '.hero-img-box',
        'h2',
        '.about-inner > *',
        '.skill-box',
        '.certificate-items .certificate-item',
        '.projects-wrapper .project-item',
        '.certificate-box .item',
        '.project-box .item'
    ];

    autoAnimateSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            if (!el.classList.contains('scroll-animate')) {
                el.classList.add('scroll-animate');
                el.style.transitionDelay = `${index * 0.08}s`;
            }
        });
    });

    // Trigger animations for all elements on page load
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale');
        animateElements.forEach(el => {
            el.classList.add('animate-in');
        });
    }, 100);
}

// Initialize page load animations
window.addEventListener('DOMContentLoaded', initPageLoadAnimations);

// Lazy loading + skeletons for project and certificate images
function initLazyImages() {
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const images = document.querySelectorAll('.project-card-image img, .certificate-preview img');

    images.forEach(img => {
        const currentSrc = img.getAttribute('src');
        if (currentSrc && !img.dataset.src) {
            img.dataset.src = currentSrc;
            img.setAttribute('src', placeholder);
        }
        img.setAttribute('loading', 'lazy');
        img.classList.add('lazy-image');

        const parent = img.parentElement;
        if (parent) {
            parent.classList.add('skeleton');
        }
    });

    const onImageLoaded = (img) => {
        img.classList.add('is-loaded');
        const parent = img.parentElement;
        if (parent) {
            parent.classList.remove('skeleton');
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                const dataSrc = img.dataset.src;
                if (dataSrc) {
                    img.addEventListener('load', () => onImageLoaded(img), { once: true });
                    img.setAttribute('src', dataSrc);
                } else {
                    onImageLoaded(img);
                }
                obs.unobserve(img);
            });
        }, { rootMargin: '200px 0px' });

        images.forEach(img => observer.observe(img));
    } else {
        images.forEach(img => {
            const dataSrc = img.dataset.src;
            if (dataSrc) {
                img.addEventListener('load', () => onImageLoaded(img), { once: true });
                img.setAttribute('src', dataSrc);
            } else {
                onImageLoaded(img);
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', initLazyImages);

// Certificate modal (no storage)
function initCertificateModal() {
    const items = document.querySelectorAll('.certificate-item');
    const modal = document.querySelector('#certificateModal');
    if (!items.length || !modal) return;
    

    const modalImage = modal.querySelector('.certificate-modal-image img');
    const modalTitle = modal.querySelector('#certificateModalTitle');
    const modalIssuer = modal.querySelector('.certificate-issuer');
    const modalYear = modal.querySelector('.certificate-year');
    const modalDesc = modal.querySelector('.certificate-description');
    const modalCta = modal.querySelector('.certificate-cta');
    const closeBtn = modal.querySelector('.certificate-modal-close');

    const openModal = (item) => {
        const img = item.querySelector('img');
        const title = item.querySelector('.certificate-info h4');
        const issuer = item.querySelector('.certificate-info span');
        const year = item.querySelector('.certificate-badge');
        const customDescription = item.getAttribute('data-description');

        const imageSrc = img ? (img.getAttribute('data-src') || img.getAttribute('src')) : '';
        const titleText = title ? title.textContent.trim() : 'Certificate';
        const issuerText = issuer ? issuer.textContent.trim() : 'Issuer';
        const yearText = year ? year.textContent.trim() : '';
        const descriptionText = customDescription || `Certificate awarded for ${titleText} by ${issuerText}.`;

        if (modalImage) {
            modalImage.src = imageSrc;
            modalImage.alt = titleText;
        }
        if (modalTitle) modalTitle.textContent = titleText;
        if (modalIssuer) modalIssuer.textContent = issuerText;
        if (modalYear) modalYear.textContent = yearText || 'Year';
        if (modalDesc) modalDesc.textContent = descriptionText;
        if (modalCta) modalCta.setAttribute('href', imageSrc || '#');

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    items.forEach(item => {
        item.addEventListener('click', () => openModal(item));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize certificate modal if on certificate page
function initCertificateModalIfNeeded() {
    const items = document.querySelectorAll('.certificate-item');
    if (items.length > 0) {
        initCertificateModal();
    }
}

window.addEventListener('DOMContentLoaded', initCertificateModalIfNeeded);

const menuToggler = document.querySelector('.menu-toggler');
const sideBar = document.querySelector('.side-bar');
const navItemLinks = document.querySelectorAll('.nav li a');
const pages = document.querySelectorAll('.page');
const filterBtn = document.querySelectorAll('.filter-item');

/* Project Details Data */
const projectsData = [
    {
        id: 0,
        title: "Invoxa ERP",
        description: "Complete Invoice, Expense & Report Management System with comprehensive financial tracking and automated reporting features.",
        fullDescription: "A complete ERP solution designed for small to medium enterprises to manage invoices, expenses, and generate detailed reports. Features include multi-user support, role-based access, real-time dashboards, and export capabilities.",
        videoUrl: "https://www.youtube.com/embed/WjkbQZY-KKw?si=2s44jw1GGWVyPzKT",
        techStack: ["React", "Node.js", "MongoDB", "Express", "ANT Design", "Material-UI", "Bootstrap", "Tailwind CSS", "Chart.js", "Cloudinary"],
        features: [
            "Multi-user support with role-based access control",
            "Real-time dashboards and analytics",
            "Automated invoice generation and expense tracking",
            "Export capabilities for financial reports"
        ],
        liveDemo: "https://invoxa-erp.netlify.app/",
        github: ""
    },
    {
        id: 1,
        title: "Travel Diaries",
        description: "A MERN Stack Project for travel enthusiasts to share and explore travel experiences.",
        fullDescription: "A full-stack social platform where users can document their travel experiences, share photos, and discover travel routes. Features include real-time messaging, location tracking, and community features.",
        videoUrl: "https://www.youtube.com/embed/NHuRHLuBQTE?si=yfq2Ju7jYVQpz8Xg",
        techStack: ["React", "Node.js", "MongoDB", "Tailwind CSS", "Cloudinary", "React Router", "MUI"],
        features: [
            "Image upload and optimization with Cloudinary",
            "Real-time messaging and notifications with Socket.io",
            "Location tracking and mapping with Mapbox",
            "Community features for sharing travel experiences"
        ],
        liveDemo: "https://roammemoirs.netlify.app/",
        github: "https://github.com/Dev2139/travel_diaries"
    },
    {
        id: 2,
        title: "Home-Nest",
        description: "Home Rental and Management Platform with advanced search and booking features.",
        fullDescription: "A comprehensive platform for property listings and management. Features include advanced search filters, property management dashboard, booking system, and payment integration.",
        videoUrl: "https://www.youtube.com/embed/_t3rFtIa-lY?si=-18QVkRvHTuy1uQL",
        techStack: ["React", "Express", "Postgres", "Stripe", "Supabase", "JWT", "React Router", "Tailwind CSS", "Cloudinary", "React DOM", "MUI", "MapBox"],
        features: [
            "Advanced search filters for property discovery",
            "Secure payment integration with Stripe",
            "Automated property availability management",
            "Comprehensive property management dashboard"
        ],
        liveDemo: "https://rental-management-4l5m.vercel.app/",
        github: "https://github.com/Dev2139/Rental_Management"
    },
    {
        id: 3,
        title: "CodingGita College Predictor",
        description: "College Prediction Based on Exam Scores using Machine Learning.",
        fullDescription: "An ML-powered application that predicts suitable colleges based on student exam scores. Uses historical data and algorithms to provide accurate college recommendations.",
        videoUrl: "https://www.youtube.com/embed/eO0pg2DpbL8?si=SMm4XkdVCLSOKtFb",
        techStack: ["NextJs", "Tailwind CSS", "MUI", "JSON data"],
        features: [
            "Historical data analysis for recommendations",
            "Accurate scoring algorithm",
            "User-friendly interface for score input"
        ],
        liveDemo: "https://codinggita-collegepredictor.netlify.app/",
        github: "https://github.com/Dev2139/codinggita-collegepredictor"
    },
    {
        id: 4,
        title: "YOOM",
        description: "Interview Transforming Application with real-time video integration.",
        fullDescription: "A modern interview platform that helps candidates prepare and conduct interviews with real-time video, audio, code editor, and whiteboard features.",
        videoUrl: "https://www.youtube.com/embed/6NKHB6UhRHM?si=8xRj1HwS-RgjJoHa",
        techStack: ["Nextjs", "WebRTC", "Node.js", "Socket.io", "Tailwind CSS", "MUI", "React Router", "Clerk", ],
        features: [
            "Real-time video and audio communication",
            "Interactive code editor for technical interviews",
            "Virtual whiteboard for problem solving",
            "Screen sharing capabilities"
        ],
        liveDemo: "",
        github: "https://github.com/Dev2139/YOOM"
    },
    {
        id: 5,
        title: "Stripe Payment Gateway",
        description: "Stripe Integration POC for CarinaFashions e-commerce platform.",
        fullDescription: "A proof of concept demonstrating Stripe payment integration with comprehensive features including subscription handling, refunds, and payment history.",
        videoUrl: "https://www.youtube.com/embed/WvzmXDdLEx4?si=f_CzREOj-ODo9MHM",
        techStack: ["Stripe API", "Express", "React", "Node.js"],
        challenges: [
            "Secure payment processing",
            "Handling payment webhooks",
            "Transaction reconciliation"
        ],
        solutions: [
            "Implemented Stripe Webhook for event handling",
            "Built secure server-side payment processing",
            "Added comprehensive error handling"
        ],
        liveDemo: "https://carina-stripe-paymentgateway-integration.onrender.com/",
        github: "https://github.com/Dev2139/Carina-Stripe-PaymentGateway-Integration"
    },
    {
        id: 6,
        title: "MatchUpX Scoreboard",
        description: "Sports Scoreboard Application with real-time updates.",
        fullDescription: "A dynamic sports scoreboard application for tracking matches, scores, and player statistics in real-time with beautiful UI.",
        videoUrl: "https://www.youtube.com/embed/fY-sGNOUvb0?si=Rti_sA8aaOpV7kqU",
        techStack: ["React", "Tailwind CSS", "Firebase", "JavaScript"],
        challenges: [
            "Real-time score updates",
            "Responsive design for all devices",
            "Data persistence"
        ],
        solutions: [
            "Used Firebase Realtime Database for real-time updates",
            "Implemented Tailwind CSS for responsive design",
            "Utilized Cloud Firestore for data management"
        ],
        liveDemo: "https://matchupx-scoreboard-ui.netlify.app/",
        github: "https://github.com/Dev2139/MatchupX_Scorecard"
    },
    {
        id: 7,
        title: "MUI Integration POC",
        description: "Material-UI Integration POC for CarinaFashions with modern components.",
        fullDescription: "A proof of concept showcasing Material-UI (MUI) implementation with custom theming and component usage in a fashion e-commerce application.",
        videoUrl: "https://www.youtube.com/embed/a5VZ8gfOMlA?si=h5HnlqbY2HN0fZEe",
        techStack: ["MUI", "React", "Express", "JavaScript"],
        challenges: [
            "Custom theming with MUI",
            "Component optimization",
            "Performance with complex UI"
        ],
        solutions: [
            "Created custom MUI theme configuration",
            "Implemented component lazy loading",
            "Optimized CSS-in-JS rendering"
        ],
        liveDemo: "https://carina-mui-integration.onrender.com/",
        github: "https://github.com/Dev2139/Carina-MUI-Integration"
    },
    {
        id: 8,
        title: "Shiva Solar",
        description: "Solar Energy Company Website - Freelancing Project.",
        fullDescription: "A professional website for a solar energy company showcasing services, products, and customer testimonials with CMS integration.",
        videoUrl: "https://www.youtube.com/embed/CQHjRYD37fs?si=jBI6tImbpZ5vPZVr",
        techStack: ["React", "Tailwind CSS", "Node.js", "MongoDB"],
        challenges: [
            "Building SEO-friendly website",
            "Content management system",
            "Performance optimization"
        ],
        solutions: [
            "Implemented Server-Side Rendering (SSR)",
            "Built custom CMS for content management",
            "Optimized images and code splitting"
        ],
        liveDemo: "https://shiva-solar.netlify.app/",
        github: "https://github.com/Dev2139/Shiva_Solar"
    },
    {
        id: 9,
        title: "API Hub",
        description: "Public API Collection and Documentation Platform.",
        fullDescription: "A comprehensive platform for discovering, documenting, and testing public APIs with a beautiful UI and interactive features.",
        videoUrl: "https://www.youtube.com/embed/cxLJgF0EdFk?si=8aZP9FcEkQ-r91bR",
        techStack: ["React", "Node.js", "APIs", "Axios"],
        challenges: [
            "Integrating multiple APIs",
            "API documentation",
            "Error handling"
        ],
        solutions: [
            "Built unified API integration layer",
            "Created interactive API documentation",
            "Implemented comprehensive error handling"
        ],
        liveDemo: "https://api-hub-0jhw.onrender.com/",
        github: "https://github.com/Dev2139/react-api-clone"
    },
    {
        id: 10,
        title: "Social Media Blocker",
        description: "Chrome Extension to Block Social Media Websites.",
        fullDescription: "A powerful Chrome extension that helps users increase productivity by blocking social media websites during work hours.",
        videoUrl: "https://www.youtube.com/embed/K1FetyJ7-5s?si=J1YWHLLDNS5p5m8c",
        techStack: ["Chrome API", "JavaScript", "HTML", "CSS"],
        challenges: [
            "Chrome API compatibility",
            "Website pattern matching",
            "User preference storage"
        ],
        solutions: [
            "Used Chrome Storage API for preferences",
            "Implemented URL pattern matching",
            "Built whitelist/blacklist functionality"
        ],
        liveDemo: "",
        github: "https://github.com/Dev2139/SocialMedia-Blocker-Extension"
    },
    {
        id: 11,
        title: "YouTube Video Bookmark",
        description: "Chrome Extension for Bookmarking YouTube Videos.",
        fullDescription: "A handy Chrome extension that allows users to bookmark YouTube videos and organize them into custom collections.",
        videoUrl: "https://www.youtube.com/embed/7kGs3RLB7es?si=NLZXtMQW4PoMaLxz",
        techStack: ["Chrome API", "JavaScript", "Local Storage"],
        challenges: [
            "Content Script execution",
            "DOM manipulation",
            "Data persistence"
        ],
        solutions: [
            "Used Content Scripts for DOM access",
            "Implemented Local Storage for bookmarks",
            "Built clean UI interface"
        ],
        liveDemo: "",
        github: "https://github.com/Dev2139/YTvideo-Bookmark-Extension"
    },
    {
        id: 12,
        title: "Chrome Activity Tracker",
        description: "Chrome Extension to Track Chrome Activity.",
        fullDescription: "An extension that tracks user browsing activity, time spent on websites, and generates detailed reports.",
        videoUrl: "https://www.youtube.com/embed/dk8LqG7ja04?si=5zw_F-Xm-U13L-xz",
        techStack: ["Chrome API", "JavaScript", "Charts.js"],
        challenges: [
            "Tracking user activity ethically",
            "Data visualization",
            "Performance optimization"
        ],
        solutions: [
            "Used Chrome tabs API for tracking",
            "Integrated Charts.js for visualization",
            "Optimized data storage"
        ],
        liveDemo: "",
        github: "https://github.com/Dev2139/Activity-Tracker-Extension"
    },
    {
        id: 13,
        title: "Random Joke Generator",
        description: "Chrome Extension for Generating Random Jokes.",
        fullDescription: "A fun Chrome extension that displays random jokes to brighten your day with support for multiple joke categories.",
        videoUrl: "https://www.youtube.com/embed/hKX6j5NKAmM?si=ZjR0Eie1zhIWrjjP",
        techStack: ["Chrome API", "JavaScript", "Joke API"],
        challenges: [
            "API integration",
            "Joke caching",
            "UI responsiveness"
        ],
        solutions: [
            "Integrated JokeAPI for content",
            "Implemented caching for offline use",
            "Built clean and responsive popup UI"
        ],
        liveDemo: "",
        github: "https://github.com/Dev2139/Random-Joke-Extension"
    },
    {
        id: 14,
        title: "Hotstar Clone",
        description: "Streaming Platform Clone with Video Content.",
        fullDescription: "A clone of Hotstar streaming platform with video playback, recommendations, and user authentication.",
        videoUrl: "https://www.youtube.com/embed/hTtKOtX6AKc?si=mK6yllidhilPafsD",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Responsive video player",
            "Content recommendation UI",
            "User authentication interface"
        ],
        liveDemo: "https://hotstar-by-devpatel.netlify.app/",
        github: ""
    },
    {
        id: 15,
        title: "Amazon Clone",
        description: "E-commerce Platform Clone with Full Features.",
        fullDescription: "A fully functional Amazon clone with product listing, shopping cart, checkout, and order management features.",
        videoUrl: "https://www.youtube.com/embed/7yLnKHquUeY?si=nzadiAYmdOr0wu6x",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Product listing interface",
            "Shopping cart functionality",
            "Checkout process UI"
        ],
        liveDemo: "https://amazon-by-devpatel.netlify.app/",
        github: ""
    },
    {
        id: 16,
        title: "Flipkart Clone",
        description: "E-commerce Shopping Platform Clone.",
        fullDescription: "A feature-rich Flipkart clone with product search, filtering, reviews, and a complete checkout system.",
        videoUrl: "https://www.youtube.com/embed/LDHaIsArjqA?si=sGnF6ou3Moxn88BE",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Product search interface",
            "Filtering system",
            "Review and rating UI"
        ],
        liveDemo: "https://flip2139.netlify.app/",
        github: ""
    },
    {
        id: 17,
        title: "Netflix Clone",
        description: "Video Streaming Platform Clone with Content Library.",
        fullDescription: "A Netflix clone with streaming capability, user profiles, watchlist, and personalized recommendations.",
        videoUrl: "https://www.youtube.com/embed/A_2ut2xUbpw?si=hKGC81o_7NGTw-ZE",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Video streaming interface",
            "User profile UI",
            "Watchlist functionality"
        ],
        liveDemo: "https://project2139.netlify.app/",
        github: ""
    },
    {
        id: 18,
        title: "Spotify Clone",
        description: "Music Streaming Platform Clone with Playlist Management.",
        fullDescription: "A Spotify clone with music streaming, playlist creation, user authentication, and personalized recommendations.",
        videoUrl: "https://www.youtube.com/embed/KFASyLGTaQU?si=cPAFnkYYizvCZ3e_",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Music streaming interface",
            "Playlist management",
            "User profile UI"
        ],
        liveDemo: "https://spotify2139.netlify.app/",
        github: ""
    },
    {
        id: 19,
        title: "2048 Game",
        description: "Classic Puzzle Game Implementation.",
        fullDescription: "A fully functional 2048 game with smooth animations, score tracking, and game state management.",
        videoUrl: "https://www.youtube.com/embed/Xi5dOJkYX1s?si=kTbeI_5a5R3RnStx",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Smooth animations",
            "Score tracking",
            "Game state management"
        ],
        liveDemo: "https://2048-by-dev.netlify.app/",
        github: ""
    },
    {
        id: 20,
        title: "Stone-Paper-Scissor",
        description: "Classic Strategy Game with AI Opponent.",
        fullDescription: "An interactive Stone-Paper-Scissor game with AI opponent, score tracking, and game statistics.",
        videoUrl: "https://www.youtube.com/embed/nyXugDebnh0?si=bj3rfb7YFMuvvcUn",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "AI opponent",
            "Score tracking",
            "Game statistics"
        ],
        liveDemo: "https://sps2139.netlify.app/",
        github: ""
    },
    {
        id: 21, 
        title: "Hangman Game",
        description: "Word Guessing Game with Hint System.",
        fullDescription: "An interactive Hangman game with word difficulty levels, hints, score tracking, and game statistics.",
        videoUrl: "https://www.youtube.com/embed/zp9j6O1_-wg?si=s0NW_c2aIK9hOzf5",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Word difficulty levels",
            "Hint system",
            "Score tracking"
        ],
        liveDemo: "https://hangman2139.netlify.app/",
        github: ""
    },
    {
        id: 22,
        title: "Tic-Tac-Toe Game",
        description: "Interactive Board Game with AI and Multiplayer.",
        fullDescription: "A fully functional Tic-Tac-Toe game with AI opponent, multiplayer mode, and unbeatable algorithm.",
        videoUrl: "https://www.youtube.com/embed/dfFXS-s4U-Y?si=pPyiHu-AkD5A6rvJ",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "AI opponent",
            "Multiplayer mode",
            "Unbeatable algorithm"
        ],
        liveDemo: "https://xo2139.netlify.app/",
        github: ""
    },
    {
        id: 23,
        title: "Fighting Game",
        description: "Action Combat Game with Physics Engine.",
        fullDescription: "An interactive 2D fighting game with character animations, physics simulation, and multiplayer support.",
        videoUrl: "https://www.youtube.com/embed/ztJLe81nG1s?si=PzY_edszXya3quRh",
        techStack: ["HTML", "CSS", "JavaScript"],
        features: [
            "Character animations",
            "Physics simulation",
            "Multiplayer support"
        ],
        liveDemo: "https://fighting-game-by-dev.netlify.app/",
        github: ""
    },
    {
        id: 24,
        title: "Travel Diaries Design",
        description: "Figma Design Prototype for Travel Diaries App.",
        fullDescription: "Complete UI/UX design for the Travel Diaries application including wireframes, prototypes, and design system.",
        videoUrl: "https://www.youtube.com/embed/WjkbQZY-KKw?si=2s44jw1GGWVyPzKT",
        techStack: ["Figma", "UI/UX Design"],
        challenges: [
            "Design consistency",
            "User experience flow",
            "Component design"
        ],
        solutions: [
            "Created comprehensive design system",
            "Designed user flows",
            "Built reusable components"
        ],
        liveDemo: "https://www.figma.com/design/jheQXKCCha0dw4jVIDwjxu/Travel-Diaries",
        github: ""
    },
    {
        id: 25,
        title: "UrbanPulse Design",
        description: "Urban Living Platform UI/UX Design.",
        fullDescription: "Modern UI design for an urban living community platform with focus on user engagement and intuitive navigation.",
        videoUrl: "https://www.youtube.com/embed/NHuRHLuBQTE?si=yfq2Ju7jYVQpz8Xg",
        techStack: ["Figma", "UI/UX Design"],
        challenges: [
            "Information architecture",
            "Visual hierarchy",
            "Accessibility"
        ],
        solutions: [
            "Organized information effectively",
            "Used clear visual hierarchy",
            "Ensured WCAG compliance"
        ],
        liveDemo: "https://www.figma.com/design/2ynamSYhgcs7XWxASmQcaB/UrbanPulse",
        github: ""
    },
    {
        id: 26,
        title: "Coding Gita Design",
        description: "Learning Platform UI Design.",
        fullDescription: "Modern and engaging UI design for an online learning platform focused on coding education.",
        videoUrl: "https://www.youtube.com/embed/_t3rFtIa-lY?si=-18QVkRvHTuy1uQL",
        techStack: ["Figma", "UI/UX Design"],
        challenges: [
            "Course layout",
            "Progress tracking UI",
            "Engagement features"
        ],
        solutions: [
            "Designed intuitive course structure",
            "Created progress visualization",
            "Added gamification elements"
        ],
        liveDemo: "https://www.figma.com/design/srWyAdnfp1p9uWjMcqTdDI/coding-gita-final",
        github: ""
    },
    {
        id: 27,
        title: "Carina Fashion Design",
        description: "E-commerce Fashion Platform UI/UX Design.",
        fullDescription: "Luxury fashion e-commerce platform design with focus on product showcase and seamless shopping experience.",
        videoUrl: "https://www.youtube.com/embed/eO0pg2DpbL8?si=SMm4XkdVCLSOKtFb",
        techStack: ["Figma", "UI/UX Design"],
        challenges: [
            "Product showcase",
            "Browsing experience",
            "Conversion optimization"
        ],
        solutions: [
            "Created beautiful product gallery",
            "Designed intuitive filters",
            "Optimized checkout flow"
        ],
        liveDemo: "https://www.figma.com/design/AWgduCjaLH54UgJqF0gpGh/Carina-Fashion",
        github: ""
    },
    {
        id: 28,
        title: "Instagram Design",
        description: "Social Media Platform UI/UX Design.",
        fullDescription: "Modern social media platform design based on Instagram with focus on content discovery and user engagement.",
        videoUrl: "https://www.youtube.com/embed/6NKHB6UhRHM?si=8xRj1HwS-RgjJoHa",
        techStack: ["Figma", "UI/UX Design"],
        challenges: [
            "Feed design",
            "Stories interface",
            "Direct messaging"
        ],
        solutions: [
            "Designed engaging feed layout",
            "Created stories viewer",
            "Built messaging interface"
        ],
        liveDemo: "https://www.figma.com/design/tMxp3ckKOGBP8r1kNrYP83/Untitled",
        github: ""
    },
    {
        id: 29,
        title: "API Documentation",
        description: "Postman API Documentation for Travel Diaries Backend.",
        fullDescription: "Comprehensive API documentation with detailed endpoints, request/response examples, and authentication details.",
        videoUrl: "https://www.youtube.com/embed/WvzmXDdLEx4?si=f_CzREOj-ODo9MHM",
        techStack: ["Postman", "APIs"],
        challenges: [
            "Endpoint documentation",
            "Example creation",
            "Version management"
        ],
        solutions: [
            "Documented all API endpoints",
            "Created realistic examples",
            "Built comprehensive guides"
        ],
        liveDemo: "https://documenter.getpostman.com/view/39216487/2sAYQghTn7",
        github: "https://github.com/Dev2139/travel_diaries/tree/main/travel-diaries-backend"
    }
];

/* Slidebar Toggle */ 
if (menuToggler && sideBar) {
    menuToggler.addEventListener('click', function(){
        sideBar.classList.toggle('active');
    });
}

/* Page Navigation Functionality (hash-based SPA mode) */
navItemLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) {
        return;
    }

    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links and pages
        navItemLinks.forEach(l => l.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Get the target section ID from the href attribute
        const targetId = this.getAttribute('href').substring(1); // Remove the '#'
        
        // Find and activate the corresponding page
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Close sidebar if it's open (for mobile view)
            if (sideBar) {
                sideBar.classList.remove('active');
            }
        }
    });
});

const hasHashNavLinks = Array.from(navItemLinks).some(link => {
    const href = link.getAttribute('href') || '';
    return href.startsWith('#');
});

if (hasHashNavLinks && pages.length) {
    // Update active link based on current section when scrolling
    window.addEventListener('scroll', function() {
        let current = '';
        
        pages.forEach(page => {
            if (page.classList.contains('active')) {
                current = page.id;
            }
        });
        
        navItemLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#') && href.substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

/* Portfolio Filter Functionality */
filterBtn.forEach((btn, index) => {
    btn.addEventListener('click', function() {
        // Remove active class from all filter buttons
        filterBtn.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');

        // Filter portfolio items based on category
        const projectItems = document.querySelectorAll('.project .project-item');
        const filterText = this.textContent.trim();

        // Reset animation for all items
        projectItems.forEach(item => {
            item.style.animationDelay = '0s';
        });

        projectItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            // Hide Figma Designs and Documentation from "All" section
            if (filterText === 'All') {
                if (category === 'Figma Designs' || category === 'Documentation') {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            } else if (filterText === category) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Add staggered animation to visible items
        setTimeout(() => {
            const visibleItems = document.querySelectorAll('.project .project-item.active');
            visibleItems.forEach((item, idx) => {
                item.style.animationDelay = `${idx * 0.1}s`;
            });
        }, 50);
    });
});

/* Helper function to determine tech badge class based on technology name */
function getTechBadgeClass(techName) {
    if (techName.includes('react')) return 'react';
    if (techName.includes('node') || techName.includes('express')) return 'node';
    if (techName.includes('mongo') || techName.includes('database')) return 'mongo';
    if (techName.includes('python')) return 'python';
    if (techName.includes('ml') || techName.includes('machine learning')) return 'ml';
    return '';
}

/* Project Modal Functionality */
function initProjectModal() {
    const projectModal = document.getElementById('projectModal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const projectViewBtns = document.querySelectorAll('.project-view-btn');
    
    if (!projectModal || !modalCloseBtn || !projectViewBtns.length) return;
    projectViewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Project view button clicked!');
            const projectId = parseInt(this.getAttribute('data-project'));
            console.log('Project ID:', projectId);
            const project = projectsData[projectId];
            console.log('Project data found:', !!project);
            
            if (project) {
                // Populate modal with project data
                document.getElementById('modalTitle').textContent = project.title;
                document.getElementById('modalVideo').src = project.videoUrl;
                document.getElementById('modalFullDescription').textContent = project.fullDescription;
                
                // Populate tech stack
                const techStackContainer = document.getElementById('modalTechStack');
                techStackContainer.innerHTML = project.techStack.map(tech => {
                    // Get a class based on the technology
                    const techClass = getTechBadgeClass(tech.toLowerCase());
                    return `<span class="tech-badge ${techClass}">${tech}</span>`;
                }).join('');
                
                // Populate features
                const featuresContainer = document.getElementById('modalFeatures');
                if (featuresContainer) {
                    featuresContainer.innerHTML = project.features ? project.features.map(feature => 
                        `<li>${feature}</li>`
                    ).join('') : '<li>No specific features listed</li>';
                }
                
                // Set CTA buttons
                const liveDemoBtn = document.getElementById('modalLiveDemo');
                const githubBtn = document.getElementById('modalGithubRepo');
                
                if (project.liveDemo) {
                    liveDemoBtn.href = project.liveDemo;
                    liveDemoBtn.style.display = 'inline-flex';
                } else {
                    liveDemoBtn.style.display = 'none';
                }
                
                if (project.github) {
                    githubBtn.href = project.github;
                    githubBtn.style.display = 'inline-flex';
                } else {
                    githubBtn.style.display = 'none';
                }
                
                // Show modal
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            else {
                console.error(`Project with ID ${projectId} not found in projectsData array.`);
            }
        });
    });

    // Close modal when close button is clicked
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside of it
    projectModal.addEventListener('click', function(e) {
        if (e.target === projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (projectModal && e.key === 'Escape' && projectModal.classList.contains('active')) {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initProjectModal();
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors' // Allow cross-origin requests
                });

                // With no-cors mode, we can't check response.ok, so we assume success
                form.reset();
                submitBtn.textContent = 'Message Sent!';
                
                let msg = document.createElement('p');
                msg.className = 'form-success';
                msg.textContent = 'Thank you! Your message has been sent successfully.';
                form.parentElement.insertBefore(msg, form.nextSibling);
                
                setTimeout(() => {
                    msg.remove();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);

            } catch (error) {
                console.error('Form submission error:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('There was a problem submitting your form. Please try again.');
            }
        });
    }
});
// Skeleton Loading for Projects and Certificates
function initSkeletonLoading() {
    // Show skeleton loading when page loads
    const projectItems = document.querySelectorAll('.project-item');
    const certificateItems = document.querySelectorAll('.certificate-item');
    
    // Simulate loading delay (e.g., for images)
    const loadingDelay = 1500; // 1.5 seconds
    
    // Add skeleton class temporarily
    projectItems.forEach(item => {
        if (item.querySelector('img')) {
            item.classList.add('skeleton-loading');
        }
    });
    
    certificateItems.forEach(item => {
        if (item.querySelector('img')) {
            item.classList.add('skeleton-loading');
        }
    });
    
    // Remove skeleton class after images load
    const allImages = document.querySelectorAll('.project-thumb, .certificate-preview img');
    let imagesLoaded = 0;
    
    allImages.forEach(img => {
        img.addEventListener('load', () => {
            imagesLoaded++;
            if (imagesLoaded === allImages.length) {
                projectItems.forEach(item => item.classList.remove('skeleton-loading'));
                certificateItems.forEach(item => item.classList.remove('skeleton-loading'));
            }
        });
        
        // Fallback: remove skeleton after timeout even if images don't load
        setTimeout(() => {
            projectItems.forEach(item => item.classList.remove('skeleton-loading'));
            certificateItems.forEach(item => item.classList.remove('skeleton-loading'));
        }, loadingDelay);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initSkeletonLoading();
    
    // Auto-close sidebar functionality
    const sidebar = document.querySelector('.side-bar');
    const menuToggler = document.querySelector('.menu-toggler');
    const navLinks = document.querySelectorAll('.nav a');
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !menuToggler.contains(e.target)) {
                    sidebar.classList.remove('active');
                    if (menuToggler) menuToggler.classList.remove('active');
                }
            }
        }
    });
    
    // Close sidebar when navigating
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if (menuToggler) menuToggler.classList.remove('active');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            if (sidebar) sidebar.classList.remove('active');
            if (menuToggler) menuToggler.classList.remove('active');
        }
    });
});
