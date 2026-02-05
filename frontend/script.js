/* ===================================
   PROJECTS DATA
   Add your projects to this array to automatically display them
   =================================== */
const projectsData = [
    // CAD / Architecture Projects
    {
        id: 1,
        title: "Modern Residential Design",
        category: "cad",
        description: "A contemporary 3-bedroom house design featuring sustainable architecture principles and open floor planning.",
        image: "", // Add image URL or leave empty for icon
        icon: "fa-home",
        links: [
            { text: "View PDF", url: "#", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 2,
        title: "Commercial Building CAD",
        category: "cad",
        description: "Complete architectural drawings for a 5-story commercial complex with retail and office spaces.",
        image: "",
        icon: "fa-building",
        links: [
            { text: "View Plans", url: "#", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 3,
        title: "Urban Park Redesign",
        category: "cad",
        description: "Landscape architecture project redesigning a 2-hectare urban park with sustainable features.",
        image: "",
        icon: "fa-tree",
        links: [
            { text: "Portfolio", url: "#", icon: "fa-external-link-alt" }
        ]
    },
    
    // Arduino / Electronics Projects
    {
        id: 4,
        title: "Smart Home Automation System",
        category: "arduino",
        description: "IoT-based home automation using Arduino and ESP32, controlling lights, temperature, and security.",
        image: "",
        icon: "fa-microchip",
        links: [
            { text: "GitHub", url: "#", icon: "fa-github" },
            { text: "Demo", url: "#", icon: "fa-video" }
        ]
    },
    {
        id: 5,
        title: "Weather Monitoring Station",
        category: "arduino",
        description: "Arduino-based weather station measuring temperature, humidity, pressure, and displaying data on LCD.",
        image: "",
        icon: "fa-cloud-sun",
        links: [
            { text: "GitHub", url: "#", icon: "fa-github" }
        ]
    },
    {
        id: 6,
        title: "Gesture-Controlled Robot",
        category: "arduino",
        description: "Robot controlled by hand gestures using accelerometer and Arduino for natural interaction.",
        image: "",
        icon: "fa-robot",
        links: [
            { text: "GitHub", url: "#", icon: "fa-github" },
            { text: "Video", url: "#", icon: "fa-youtube" }
        ]
    },
    
    // Web Development Projects
    {
        id: 7,
        title: "E-Commerce Platform",
        category: "web",
        description: "Full-stack e-commerce website with React, Node.js, MongoDB, featuring cart, payments, and admin panel.",
        image: "",
        icon: "fa-shopping-cart",
        links: [
            { text: "Live Site", url: "#", icon: "fa-external-link-alt" },
            { text: "GitHub", url: "#", icon: "fa-github" }
        ]
    },
    {
        id: 8,
        title: "Task Management App",
        category: "web",
        description: "Responsive web app for project management with real-time collaboration using React and Firebase.",
        image: "",
        icon: "fa-tasks",
        links: [
            { text: "Live Demo", url: "#", icon: "fa-external-link-alt" },
            { text: "GitHub", url: "#", icon: "fa-github" }
        ]
    },
    {
        id: 9,
        title: "Portfolio Website Builder",
        category: "web",
        description: "Dynamic website builder allowing users to create custom portfolios with drag-and-drop interface.",
        image: "",
        icon: "fa-palette",
        links: [
            { text: "Try It", url: "#", icon: "fa-external-link-alt" }
        ]
    },
    
    // Research Papers
    {
        id: 10,
        title: "IoT in Smart Cities",
        category: "research",
        description: "Research paper on implementing IoT infrastructure for sustainable urban development and management.",
        image: "",
        icon: "fa-city",
        links: [
            { text: "Read Paper", url: "#", icon: "fa-file-pdf" }
        ]
    },
    {
        id: 11,
        title: "Machine Learning in Architecture",
        category: "research",
        description: "Study on using ML algorithms for optimizing building energy efficiency and structural design.",
        image: "",
        icon: "fa-brain",
        links: [
            { text: "Download", url: "#", icon: "fa-download" }
        ]
    },
    {
        id: 12,
        title: "Renewable Energy Integration",
        category: "research",
        description: "Analysis of solar and wind energy integration in residential building designs.",
        image: "",
        icon: "fa-solar-panel",
        links: [
            { text: "View PDF", url: "#", icon: "fa-file-pdf" }
        ]
    }
];

/* ===================================
   DOM CONTENT LOADED
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functionality
    initNavigation();
    initThemeToggle();
    initProjects();
    initProjectFilter();
    initChatbot();
    initContactForm();
    initScrollAnimations();
    initSmoothScroll();
});

/* ===================================
   NAVIGATION FUNCTIONALITY
   =================================== */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Active link on scroll
    window.addEventListener('scroll', () => {
        // Add shadow to navbar on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        let current = '';
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

/* ===================================
   THEME TOGGLE (LIGHT/DARK MODE)
   =================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

/* ===================================
   PROJECTS DISPLAY
   =================================== */
function initProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Clear existing content
    projectsGrid.innerHTML = '';
    
    // Create and append project cards
    projectsData.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
    
    // Add scroll animations to project cards
    addScrollAnimation('.project-card');
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card scroll-fade-in';
    card.setAttribute('data-category', project.category);
    
    // Create project image/icon
    const imageHTML = project.image 
        ? `<img src="${project.image}" alt="${project.title}">`
        : `<i class="fas ${project.icon}"></i>`;
    
    // Create links HTML
    const linksHTML = project.links.map(link => 
        `<a href="${link.url}" class="project-link" target="_blank" rel="noopener">
            <i class="fas ${link.icon}"></i>
            ${link.text}
        </a>`
    ).join('');
    
    // Build card HTML
    card.innerHTML = `
        <div class="project-image">
            ${imageHTML}
        </div>
        <div class="project-content">
            <span class="project-category">${getCategoryName(project.category)}</span>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-links">
                ${linksHTML}
            </div>
        </div>
    `;
    
    return card;
}

function getCategoryName(category) {
    const categories = {
        'cad': 'CAD / Architecture',
        'arduino': 'Arduino / Electronics',
        'web': 'Web Development',
        'research': 'Research'
    };
    return categories[category] || category;
}

/* ===================================
   PROJECT FILTERING
   =================================== */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    // Re-trigger animation
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, 100);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });
        });
    });
}

/* ===================================
   CHATBOT FUNCTIONALITY
   =================================== */
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotModal = document.getElementById('chatbotModal');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    // Toggle chatbot modal
    chatbotToggle.addEventListener('click', () => {
        chatbotModal.classList.toggle('active');
    });
    
    // Close chatbot
    chatbotClose.addEventListener('click', () => {
        chatbotModal.classList.remove('active');
    });
    
    // Send message on button click
    chatbotSend.addEventListener('click', () => {
        sendChatMessage();
    });
    
    // Send message on Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    function sendChatMessage() {
        const message = chatbotInput.value.trim();
        
        if (message === '') return;
        
        // Add user message to chat
        addChatMessage(message, 'user');
        
        // Clear input
        chatbotInput.value = '';
        
        // Simulate bot response (placeholder)
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            addChatMessage(botResponse, 'bot');
        }, 1000);
    }
    
    function addChatMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        const messagePara = document.createElement('p');
        messagePara.textContent = text;
        
        messageDiv.appendChild(messagePara);
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Placeholder bot response generator
    function generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Simple keyword-based responses (placeholder)
        if (message.includes('project')) {
            return "I have experience in CAD design, Arduino projects, web development, and research. Which area interests you?";
        } else if (message.includes('contact') || message.includes('email')) {
            return "You can reach me at your.email@example.com or use the contact form below!";
        } else if (message.includes('skill')) {
            return "My skills include AutoCAD, Arduino, React, Node.js, Python, and more. Check out my projects to see them in action!";
        } else if (message.includes('hello') || message.includes('hi')) {
            return "Hello! How can I help you today?";
        } else {
            return "Thanks for your message! Feel free to explore my projects or reach out through the contact form.";
        }
        
        // TODO: Integrate with actual chatbot API or AI service
    }
}

/* ===================================
   CONTACT FORM
   =================================== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        // Here you would typically send the data to a server
        console.log('Form submitted:', formData);
        
        // Show success message (placeholder)
        alert('Thank you for your message! I will get back to you soon.');
        
        // Reset form
        contactForm.reset();
        
        // TODO: Integrate with email service (EmailJS, Formspree, etc.)
    });
}

/* ===================================
   SMOOTH SCROLLING
   =================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href === '#' || href.length === 1) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for navbar height
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ===================================
   SCROLL ANIMATIONS
   =================================== */
function initScrollAnimations() {
    addScrollAnimation('.scroll-fade-in');
    
    // Initial check for elements already in view
    window.dispatchEvent(new Event('scroll'));
}

function addScrollAnimation(selector) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll(selector).forEach(element => {
        observer.observe(element);
    });
}

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

// Function to add a new project dynamically
function addProject(projectData) {
    projectsData.push(projectData);
    initProjects(); // Refresh the projects display
}

// Function to get projects by category
function getProjectsByCategory(category) {
    if (category === 'all') {
        return projectsData;
    }
    return projectsData.filter(project => project.category === category);
}

// Export functions for external use if needed
window.portfolioFunctions = {
    addProject,
    getProjectsByCategory,
    projectsData
};