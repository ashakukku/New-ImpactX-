document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainMenu.classList.toggle('active');
            if (!isExpanded) {
                menuToggle.innerHTML = '&times;'; // Change to X icon
            } else {
                menuToggle.innerHTML = '&#9776;'; // Change back to hamburger
            }
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        if (questionButton && answerDiv) {
            questionButton.addEventListener('click', () => {
                const isExpanded = questionButton.getAttribute('aria-expanded') === 'true' || false;
                
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherQuestionButton = otherItem.querySelector('.faq-question');
                        const otherAnswerDiv = otherItem.querySelector('.faq-answer');
                        if (otherQuestionButton && otherAnswerDiv) {
                            otherQuestionButton.setAttribute('aria-expanded', 'false');
                            otherQuestionButton.classList.remove('active');
                            otherAnswerDiv.style.display = 'none';
                        }
                    }
                });

                questionButton.setAttribute('aria-expanded', !isExpanded);
                questionButton.classList.toggle('active');
                
                if (!isExpanded) {
                    answerDiv.style.display = 'block';
                } else {
                    answerDiv.style.display = 'none';
                }
            });
        }
    });

    // Smooth Scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    if (mainMenu && mainMenu.classList.contains('active') && menuToggle) {
                         mainMenu.classList.remove('active');
                         menuToggle.setAttribute('aria-expanded', 'false');
                         menuToggle.innerHTML = '&#9776;';
                    }
                } else {
                    console.warn(`Smooth scroll target '${targetId}' not found on page ${window.location.pathname}`);
                }
            }
        });
    });

    function updateNavigationMenu() {
        const mainMenu = document.getElementById('main-menu');
        if (!mainMenu) {
            console.warn('Main menu (ul#main-menu) not found for Home link update.');
            return;
        }

        const navLinks = mainMenu.querySelectorAll('a');
        const currentPathname = window.location.pathname;
        let normalizedCurrentPathname = currentPathname.startsWith('/') ? currentPathname : '/' + currentPathname;
        if (normalizedCurrentPathname !== '/' && normalizedCurrentPathname.endsWith('/')) {
            normalizedCurrentPathname = normalizedCurrentPathname.slice(0, -1);
        }
        if (normalizedCurrentPathname === "") normalizedCurrentPathname = "/";

        const homepagePathnames = ['/', '/index.html'];

        const isHomepage = homepagePathnames.includes(normalizedCurrentPathname);

        if (isHomepage) {
            return;
        }

        let linkReplaced = false;
        navLinks.forEach(link => {
            if (linkReplaced) return;

            const linkUrl = new URL(link.href);
            let linkPathname = linkUrl.pathname;

            if (linkPathname !== '/' && linkPathname.endsWith('/')) {
                linkPathname = linkPathname.slice(0, -1);
            }
            if (linkPathname === "") linkPathname = "/";

            if (linkPathname === normalizedCurrentPathname && linkUrl.hash && link.getAttribute('href').startsWith('#')) {
                return;
            }

            if (linkPathname === normalizedCurrentPathname) {
                if (link.closest('#main-menu') === mainMenu) {
                    link.textContent = 'Home';
                    link.href = '/';

                    if (link.parentElement.classList.contains('menu-cta-button-item')) {
                        link.parentElement.classList.remove('menu-cta-button-item');
                        link.classList.remove('button');
                    }

                    linkReplaced = true;
                }
            }
        });
    }

    updateNavigationMenu();

    function renderFundingByCauseChart() {
        const canvasElement = document.getElementById('fundingByCauseChart');
        if (!canvasElement) {
            return;
        }
        const ctx = canvasElement.getContext('2d');

        const data = {
            labels: [
                'Education',
                'Healthcare',
                'Environment',
                'Livelihoods',
                'Arts & Culture'
            ],
            datasets: [{
                label: 'Funding Amount (₹)',
                data: [1250000, 900000, 750000, 600000, 450000],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1.5
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 12 },
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits:0 }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
            }
        };

        try {
            new Chart(ctx, config);
        } catch (error) {
            console.error('Error rendering Funding by Cause chart:', error);
        }
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker: Registered successfully with scope: ', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker: Registration failed: ', error);
                });
        });
    } else {
        console.log('Service Worker: Not supported by this browser.');
    }

    const backToTopButton = document.getElementById("back-to-top-btn");

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('stat-number')) {
                    animateNumbers(entry.target);
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    document.querySelectorAll('.stat-number').forEach(statNumber => {
        observer.observe(statNumber);
    });

    function animateNumbers(statNumber) {
        const target = +statNumber.getAttribute('data-target');
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            statNumber.innerText = current;
            if (current == target) {
                clearInterval(timer);
                if (statNumber.getAttribute('data-target') === '25') {
                    statNumber.innerText += '-50 Lakhs';
                } else if (statNumber.getAttribute('data-target') === '15') {
                    statNumber.innerText += '+ NGOs';
                } else if (statNumber.getAttribute('data-target') === '3') {
                    statNumber.innerText += '+ Corporate Partners';
                }
            }
        }, stepTime);
    }

    console.log("ImpactX Bridge interactive scripts loaded.");
});
