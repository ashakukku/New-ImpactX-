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

    // START: Dynamic "Home" Link in Navigation
    // -----------------------------------------
    // This function updates the main navigation menu (#main-menu).
    // On internal pages (not the homepage), it finds the link in the menu
    // that points to the current page and replaces its text and href
    // to become a "Home" link pointing to the site root (/).
    // This provides a clear way back to the homepage and avoids showing
    // a redundant link to the page the user is already viewing.
    // The function does not alter the menu when the user is on the homepage.
    function updateNavigationMenu() {
        const mainMenu = document.getElementById('main-menu');
        if (!mainMenu) {
            console.warn('Main menu (ul#main-menu) not found for Home link update.');
            return;
        }

        const navLinks = mainMenu.querySelectorAll('a');
        const currentPathname = window.location.pathname;
        // Normalize currentPathname to ensure it has a leading slash and no trailing slash (unless it's just "/")
        // for more consistent comparisons, though URL object pathnames are usually good.
        let normalizedCurrentPathname = currentPathname.startsWith('/') ? currentPathname : '/' + currentPathname;
        if (normalizedCurrentPathname !== '/' && normalizedCurrentPathname.endsWith('/')) {
            normalizedCurrentPathname = normalizedCurrentPathname.slice(0, -1);
        }
        if (normalizedCurrentPathname === "") normalizedCurrentPathname = "/"; // case where initial path is empty

        const homepagePathnames = ['/', '/index.html'];

        const isHomepage = homepagePathnames.includes(normalizedCurrentPathname);

        if (isHomepage) {
            return; // On the homepage, no changes needed by this script
        }

        let linkReplaced = false;
        navLinks.forEach(link => {
            if (linkReplaced) return;

            // Resolve link's href to its pathname component
            // new URL(link.href) works because link.href is already absolute
            const linkUrl = new URL(link.href);
            let linkPathname = linkUrl.pathname;

            // Normalize linkPathname like we did currentPathname
            if (linkPathname !== '/' && linkPathname.endsWith('/')) {
                linkPathname = linkPathname.slice(0, -1);
            }
            if (linkPathname === "") linkPathname = "/";


            // Exclude anchor links on the current page from being considered for replacement
            if (linkPathname === normalizedCurrentPathname && linkUrl.hash && link.getAttribute('href').startsWith('#')) {
                return;
            }

            // Check if the link's pathname matches the current page's pathname
            // This comparison should be robust for various forms of hrefs (relative, absolute)
            if (linkPathname === normalizedCurrentPathname) {
                 // Check if this link is part of the main-menu directly (not a sub-menu if any)
                if (link.closest('#main-menu') === mainMenu) {
                    // This is the link to the current page. Replace it with "Home".
                    link.textContent = 'Home';
                    link.href = '/'; // Point to the root/homepage

                    // If the original link's parent <li> had specific classes like 'menu-cta-button-item',
                    // we might want to remove them if 'Home' shouldn't be a button.
                    if (link.parentElement.classList.contains('menu-cta-button-item')) {
                        link.parentElement.classList.remove('menu-cta-button-item');
                        // Also remove 'button' class from the link itself if it had one
                        link.classList.remove('button');
                    }

                    linkReplaced = true;
                }
            }
        });

        // console.log(`Dynamic 'Home' link update: current page is ${normalizedCurrentPathname}, replaced status: ${linkReplaced}`);
    }

    // Call the function to update navigation
    updateNavigationMenu();

    console.log("ImpactX Bridge interactive scripts loaded.");
});
