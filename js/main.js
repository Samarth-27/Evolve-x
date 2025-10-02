// PRAGATI-AI - Main JavaScript File

// Global Variables
let currentUser = null;
let demoInProgress = false;
let aiAnalysisData = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startCounterAnimations();
    initializeScrollAnimations();
});

// Initialize Application
function initializeApp() {
    console.log('🚀 PRAGATI-AI - System Initialized');
    console.log('🇮🇳 Predictive Real-time Allocation & Governance Assisted Talent Integrator');
    
    // Check for any saved demo data
    loadDemoData();
    
    // Start live dashboard updates
    startLiveDashboardUpdates();
    
    // Initialize tooltips and interactive elements
    initializeInteractiveElements();
    
    // Add loading animation class to body
    document.body.classList.add('loaded');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Portal Buttons
    const portalButtons = document.querySelectorAll('.portal-btn');
    portalButtons.forEach(button => {
        button.addEventListener('click', handlePortalNavigation);
    });

    // Feature Cards - Remove click functionality, keep hover animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', animateFeatureCard);
    });

    // Upload Area
    const uploadArea = document.getElementById('uploadArea');
    const resumeFile = document.getElementById('resumeFile');
    
    if (uploadArea && resumeFile) {
        uploadArea.addEventListener('dragover', handleMainPageDragOver);
        uploadArea.addEventListener('drop', handleMainPageFileDrop);
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Scroll handler for header effects
    window.addEventListener('scroll', handleScroll);
}

// Navigation Functions
function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    // Special handling for features link
    if (targetId === 'features') {
        toggleFeaturesSection();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');
        return;
    }
    
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');
    }
}

function smoothScroll(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 100;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Portal Navigation Functions
function openStudentPortal() {
    showNotification('🚀 Opening Student Portal...', 'info');
    setTimeout(() => {
        window.location.href = 'pages/student-portal.html';
    }, 1000);
}

function openEmployerPortal() {
    showNotification('🏢 Opening Employer Portal...', 'info');
    setTimeout(() => {
        window.location.href = 'pages/employer-portal.html';
    }, 1500);
}

function openAdminDemo() {
    showNotification('👨‍💼 Opening Admin Demo Portal...', 'info');
    setTimeout(() => {
        window.location.href = 'pages/admin-demo.html';
    }, 1500);
}

function openDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Highlight the demo section
        demoSection.style.animation = 'pulse 2s ease-in-out';
        setTimeout(() => {
            demoSection.style.animation = '';
        }, 2000);
    }
}

// Counter Animations
function startCounterAnimations() {
    const counters = [
        { id: 'students-count', target: 124789, suffix: '' },
        { id: 'companies-count', target: 2847, suffix: '' },
        { id: 'matches-count', target: 98456, suffix: '' },
        { id: 'success-rate', target: 94.7, suffix: '%' }
    ];

    counters.forEach(counter => {
        animateCounter(counter.id, counter.target, counter.suffix);
    });
}

function animateCounter(elementId, target, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (suffix === '%') {
            element.textContent = current.toFixed(1) + suffix;
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#8b5cf6';
    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
}

function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
    
    // Reset styles
    e.currentTarget.style.borderColor = '#6366f1';
    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('❌ Please upload a PDF, DOC, or DOCX file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('❌ File size should be less than 5MB', 'error');
        return;
    }

    // Show file selected and analyze button
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    uploadArea.innerHTML = `
        <i class="fas fa-file-check"></i>
        <h4>File Selected: ${file.name}</h4>
        <p>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
    
    analyzeBtn.style.display = 'inline-flex';
    
    showNotification('✅ File uploaded successfully! Click "Start AI Analysis" to continue.', 'success');
}

// AI Analysis Simulation
function startAIAnalysis() {
    if (demoInProgress) return;
    
    demoInProgress = true;
    const demoResults = document.getElementById('demoResults');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    // Hide analyze button and show results area
    analyzeBtn.style.display = 'none';
    demoResults.style.display = 'block';
    
    // Start the analysis simulation
    simulateAIAnalysis();
}

function simulateAIAnalysis() {
    const steps = [
        { name: 'Document Processing', duration: 1000 },
        { name: 'NLP Analysis', duration: 1500 },
        { name: 'Skill Inference', duration: 1200 },
        { name: 'Career Mapping', duration: 1000 }
    ];
    
    const analysisOutput = document.getElementById('analysisOutput');
    let currentStep = 0;
    
    function processStep(stepIndex) {
        if (stepIndex >= steps.length) {
            showFinalResults();
            return;
        }
        
        const step = steps[stepIndex];
        const stepElements = document.querySelectorAll('.step');
        
        // Activate current step
        stepElements[stepIndex].classList.add('active');
        
        // Show processing message
        analysisOutput.innerHTML = `
            <div class="processing-message">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Processing: ${step.name}...</p>
            </div>
        `;
        
        setTimeout(() => {
            // Show step completion
            stepElements[stepIndex].classList.add('completed');
            processStep(stepIndex + 1);
        }, step.duration);
    }
    
    processStep(0);
}

function showFinalResults() {
    const analysisOutput = document.getElementById('analysisOutput');
    
    const results = {
        skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning'],
        hiddenSkills: ['Leadership', 'Problem Solving', 'Team Collaboration'],
        careerPath: 'Full-Stack Developer / AI Engineer',
        confidence: 92
    };
    
    analysisOutput.innerHTML = `
        <div class="analysis-results">
            <h4><i class="fas fa-check-circle"></i> Analysis Complete!</h4>
            
            <div class="result-section">
                <h5>🎯 Skills Detected:</h5>
                <div class="skill-tags">
                    ${results.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="result-section">
                <h5>🔮 Hidden Abilities Inferred:</h5>
                <div class="skill-tags">
                    ${results.hiddenSkills.map(skill => `<span class="skill-tag hidden">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="result-section">
                <h5>📈 Career Path Recommendation:</h5>
                <p class="career-path">${results.careerPath}</p>
            </div>
            
            <div class="result-section">
                <h5>🎯 Profile Confidence:</h5>
                <div class="confidence-meter">
                    <div class="confidence-fill" style="width: ${results.confidence}%"></div>
                    <span class="confidence-text">${results.confidence}%</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="proceedToRegistration()">
                    <i class="fas fa-rocket"></i>
                    Create Full Profile
                </button>
                <button class="btn btn-secondary" onclick="resetDemo()">
                    <i class="fas fa-refresh"></i>
                    Try Another Resume
                </button>
            </div>
        </div>
    `;
    
    // Add styles for results
    addResultStyles();
    
    showNotification('🎉 AI Analysis completed! Your profile looks great!', 'success');
    demoInProgress = false;
}

function addResultStyles() {
    if (document.getElementById('result-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'result-styles';
    styles.textContent = `
        .analysis-results {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 2rem;
            border-radius: 1rem;
            margin-top: 1rem;
        }
        
        .analysis-results h4 {
            color: #10b981;
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
        }
        
        .result-section {
            margin-bottom: 1.5rem;
        }
        
        .result-section h5 {
            margin-bottom: 0.5rem;
            color: #1e293b;
        }
        
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .skill-tag {
            background: #6366f1;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .skill-tag.hidden {
            background: #f59e0b;
        }
        
        .career-path {
            background: rgba(99, 102, 241, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            color: #6366f1;
        }
        
        .confidence-meter {
            position: relative;
            background: #e2e8f0;
            height: 2rem;
            border-radius: 1rem;
            overflow: hidden;
        }
        
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #34d399);
            transition: width 2s ease-out;
        }
        
        .confidence-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: 600;
            color: white;
        }
        
        .action-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .processing-message {
            text-align: center;
            padding: 2rem;
            color: #6366f1;
        }
        
        .processing-message i {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .step.active {
            color: #6366f1;
            transform: scale(1.1);
        }
        
        .step.completed {
            color: #10b981;
        }
        
        .step.completed i::before {
            content: "\\f00c";
        }
    `;
    
    document.head.appendChild(styles);
}

function proceedToRegistration() {
    showNotification('🚀 Redirecting to Complete Student Portal...', 'info');
    setTimeout(() => {
        window.location.href = 'pages/student-portal.html';
    }, 1000);
}

function resetDemo() {
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const demoResults = document.getElementById('demoResults');
    const resumeFile = document.getElementById('resumeFile');
    
    // Reset upload area
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h4>Drop your resume here or click to browse</h4>
        <p>Supports PDF, DOC, DOCX formats</p>
    `;
    
    // Hide elements
    analyzeBtn.style.display = 'none';
    demoResults.style.display = 'none';
    
    // Reset file input
    resumeFile.value = '';
    
    // Reset steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.step').classList.add('active');
    
    demoInProgress = false;
    showNotification('🔄 Demo reset! Try uploading another resume.', 'info');
}

// Feature Card Interactions
function showModuleDetails(e) {
    const moduleNumber = e.currentTarget.getAttribute('data-module');
    const moduleNames = {
        '1': 'Intelligent Profile Builder',
        '2': 'Industry Intelligence Engine',
        '3': 'Multi-Objective Optimization Core',
        '4': 'Predictive Success Analytics',
        '5': 'Dynamic Feedback & Learning System',
        '6': 'Smart Communication & Transparency Engine'
    };
    
    const moduleName = moduleNames[moduleNumber];
    showNotification(`🤖 ${moduleName} - Click to learn more!`, 'info');
}

function animateFeatureCard(e) {
    const card = e.currentTarget;
    const icon = card.querySelector('.feature-icon');
    
    if (icon) {
        icon.style.transform = 'scale(1.1) rotateY(10deg)';
        icon.style.transition = 'transform 0.3s ease';
        
        card.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1) rotateY(0deg)';
        }, { once: true });
    }
}

// Live Dashboard Updates
function startLiveDashboardUpdates() {
    setInterval(() => {
        updateLiveMetrics();
    }, 5000); // Update every 5 seconds
}

function updateLiveMetrics() {
    // Simulate live data updates
    const metrics = [
        { id: 'students-count', increment: Math.floor(Math.random() * 5) + 1 },
        { id: 'companies-count', increment: Math.random() > 0.8 ? 1 : 0 },
        { id: 'matches-count', increment: Math.floor(Math.random() * 10) + 1 }
    ];
    
    metrics.forEach(metric => {
        const element = document.getElementById(metric.id);
        if (element) {
            const currentValue = parseInt(element.textContent.replace(/,/g, ''));
            const newValue = currentValue + metric.increment;
            element.textContent = newValue.toLocaleString();
            
            // Add update animation
            element.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards
    document.querySelectorAll('.dashboard-card, .feature-card, .portal-card').forEach(card => {
        observer.observe(card);
    });
}

// Header Scroll Effects
function handleScroll() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        header.style.background = 'rgba(102, 126, 234, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        header.style.backdropFilter = 'blur(10px)';
    }
}

// Window Resize Handler
function handleResize() {
    // Recalculate animations and layouts if needed
    console.log('Window resized');
}

// Interactive Elements
function initializeInteractiveElements() {
    // Add hover effects to dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(-4px) scale(1)';
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">&times;</button>
        </div>
    `;
    
    // Add notification styles
    const styles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .notification-success { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
        .notification-error { background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); }
        .notification-warning { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
        
        .notification-content {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notification-message {
            color: white;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Demo Data Management
function loadDemoData() {
    try {
        const savedData = localStorage.getItem('pragati-ai-demo-data');
        if (savedData) {
            aiAnalysisData = JSON.parse(savedData);
        }
    } catch (error) {
        console.log('No saved demo data found');
    }
}

function saveDemoData(data) {
    try {
        localStorage.setItem('pragati-ai-demo-data', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save demo data:', error);
    }
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Main Page File Upload Functions
function triggerMainPageFileUpload() {
    document.getElementById('resumeFile').click();
}

function handleMainPageFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processMainPageFile(files[0]);
    }
}

function handleMainPageDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#8b5cf6';
    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
}

function handleMainPageFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processMainPageFile(files[0]);
    }
    
    // Reset styles
    e.currentTarget.style.borderColor = '#6366f1';
    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
}

function processMainPageFile(file) {
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('❌ Please upload a PDF, DOC, or DOCX file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('❌ File size should be less than 5MB', 'error');
        return;
    }

    // Show file selected and analyze button
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    uploadArea.innerHTML = `
        <i class="fas fa-file-check"></i>
        <h4>File Selected: ${file.name}</h4>
        <p>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
    
    if (analyzeBtn) {
        analyzeBtn.style.display = 'inline-flex';
    }
    
    showNotification('✅ File uploaded successfully! Click "Start AI Analysis" to continue.', 'success');
}

// Role Selection Modal Functions
function showRoleSelectionModal() {
    const modal = document.getElementById('roleSelectionModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animate modal in
        setTimeout(() => {
            modal.classList.add('modal-show');
        }, 10);
    }
}

function closeRoleSelectionModal() {
    const modal = document.getElementById('roleSelectionModal');
    if (modal) {
        modal.classList.remove('modal-show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function selectRole(role) {
    closeRoleSelectionModal();
    
    switch(role) {
        case 'student':
            showNotification('🚀 Opening Student Portal...', 'info');
            setTimeout(() => {
                window.location.href = 'pages/student-portal.html';
            }, 1000);
            break;
        case 'employer':
            showNotification('🏢 Opening Employer Portal...', 'info');
            setTimeout(() => {
                window.location.href = 'pages/employer-portal.html';
            }, 1000);
            break;
        case 'admin':
            showNotification('👨‍💼 Opening Admin Demo Portal...', 'info');
            setTimeout(() => {
                window.location.href = 'pages/admin-demo.html';
            }, 1000);
            break;
    }
}

// Features Section Toggle
function toggleFeaturesSection() {
    const featuresSection = document.getElementById('features');
    const premiumSection = document.getElementById('premium-features');
    
    if (featuresSection && premiumSection) {
        const isVisible = featuresSection.style.display !== 'none';
        
        if (isVisible) {
            // Hide sections
            featuresSection.style.display = 'none';
            premiumSection.style.display = 'none';
        } else {
            // Show sections
            featuresSection.style.display = 'block';
            premiumSection.style.display = 'block';
            
            // Scroll to features section
            featuresSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            showNotification('✨ Exploring AI Features & Premium Options!', 'info');
        }
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('roleSelectionModal');
    if (e.target === modal) {
        closeRoleSelectionModal();
    }
});

// Export functions for global access
window.openStudentPortal = openStudentPortal;
window.openEmployerPortal = openEmployerPortal;
window.openAdminDemo = openAdminDemo;
window.openDemo = openDemo;
window.startAIAnalysis = startAIAnalysis;
window.proceedToRegistration = proceedToRegistration;
window.resetDemo = resetDemo;
window.closeNotification = closeNotification;
window.triggerMainPageFileUpload = triggerMainPageFileUpload;
window.handleMainPageFileSelect = handleMainPageFileSelect;
window.showRoleSelectionModal = showRoleSelectionModal;
window.closeRoleSelectionModal = closeRoleSelectionModal;
window.selectRole = selectRole;
window.toggleFeaturesSection = toggleFeaturesSection;

// Console welcome message
console.log(`
🚀 PRAGATI-AI - Predictive Real-time Allocation Engine
════════════════════════════════════════════════════════
🇮🇳 Predictive Real-time Allocation & Governance Assisted Talent Integrator
✨ Advanced AI-Powered Internship Allocation Platform
🎯 Ensuring Fair, Transparent & Efficient PM Internship Scheme
🤖 6 Cutting-edge AI Modules with Quota Compliance
⚖️ Built-in Bias Detection & Affirmative Action Support
📈 94.7% Match Accuracy with Real-time Learning

🌟 Developed for Smart India Hackathon 2024
🏛️ Ministry of Skill Development & Entrepreneurship
📧 Contact: team@pragati-ai.gov.in
`);
