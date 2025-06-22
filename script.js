document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainMenu.classList.toggle('active');
            // Optional: Change icon text or class
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
                
                // Close all other FAQ items first for a cleaner accordion effect
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherQuestionButton = otherItem.querySelector('.faq-question');
                        const otherAnswerDiv = otherItem.querySelector('.faq-answer');
                        if (otherQuestionButton && otherAnswerDiv) {
                            otherQuestionButton.setAttribute('aria-expanded', 'false');
                            otherQuestionButton.classList.remove('active');
                            otherAnswerDiv.style.display = 'none';
                            // otherAnswerDiv.style.maxHeight = null; // If using max-height transition
                        }
                    }
                });

                questionButton.setAttribute('aria-expanded', !isExpanded);
                questionButton.classList.toggle('active'); // For styling the question button itself if needed
                
                if (!isExpanded) {
                    answerDiv.style.display = 'block';
                    // For smoother transition, you might use max-height in CSS:
                    // answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
                } else {
                    answerDiv.style.display = 'none';
                    // answerDiv.style.maxHeight = null;
                }
            });
        }
    });

    // Smooth Scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Ensure it's a valid ID selector and not just "#"
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

                    // If it's a nav link and mobile menu is open, close it
                    if (mainMenu && mainMenu.classList.contains('active') && menuToggle) {
                         mainMenu.classList.remove('active');
                         menuToggle.setAttribute('aria-expanded', 'false');
                         menuToggle.innerHTML = '&#9776;';
                    }
                } else {
                    // Log if the target element for a hash link is not found on the current page
                    console.warn(`Smooth scroll target '${targetId}' not found on page ${window.location.pathname}`);
                }
            }
        });
    });

    // Optional: Add active class to nav links based on scroll position
    // This is more complex and might be added if requested.

    console.log("ImpactX Bridge interactive scripts loaded.");
});
