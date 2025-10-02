// PRAGATI-AI Student Portal JavaScript - Complete 12-Step Workflow
// Enhancements: Authentication gating, stricter validation, custom skills, rich details modal

// Global Variables
let currentStep = 1;
let maxStep = 1;
let studentData = {};
let uploadedFile = null;
let analysisComplete = false;
let matchedInternships = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
});

function initializePortal() {
    console.log('🎓 Student Portal Initialized');
    
    // Configure PDF.js worker if available
    try {
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    } catch (e) { /* ignore */ }
    
    // Check if user is already logged in (demo purposes)
    const savedUser = localStorage.getItem('student-user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        loginUser(userData);
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    // File upload drag and drop
    setupFileUpload();
    
    // Form validations
    setupFormValidations();
    
    // Auto-save functionality
    setupAutoSave();
}

// Authentication Functions
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Demo authentication
    if (email === 'demo@student.com' && password === 'password123') {
        const userData = {
            email: email,
            name: 'Demo Student',
            firstName: 'Demo',
            lastName: 'Student'
        };
        
        localStorage.setItem('student-user', JSON.stringify(userData));
        loginUser(userData);
        showNotification('✅ Login successful! Welcome to PRAGATI-AI', 'success');
    } else {
        showNotification('❌ Invalid credentials. Use demo@student.com / password123', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (password !== confirm) {
        showNotification('❌ Passwords do not match', 'error');
        return;
    }
    
    const userData = {
        email: email,
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName
    };
    
    localStorage.setItem('student-user', JSON.stringify(userData));
    loginUser(userData);
    showNotification('🎉 Registration successful! Welcome to PRAGATI-AI', 'success');
}

function loginUser(userData) {
    // Hide auth section, show portal content
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('portal-content').style.display = 'block';
    
    // Update user info
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('user-avatar').textContent = userData.firstName.charAt(0).toUpperCase();
    
    studentData.user = userData;
    
    // Load saved progress if exists
    loadSavedProgress();
}

function handleLogout() {
    localStorage.removeItem('student-user');
    localStorage.removeItem('student-progress');
    
    // Reset everything
    currentStep = 1;
    maxStep = 1;
    studentData = {};
    uploadedFile = null;
    analysisComplete = false;
    
    // Show auth section, hide portal
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('portal-content').style.display = 'none';
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => form.reset());
    
    showNotification('👋 Logged out successfully', 'info');
}

// Step Navigation Functions
function isAuthenticated() {
    try {
        return !!localStorage.getItem('student-user');
    } catch { return false; }
}

function nextStep(step) {
    if (!isAuthenticated()) {
        showNotification('🔒 Please login to continue.', 'warning');
        showLogin();
        return;
    }

    if (!validateCurrentStep()) {
        return;
    }
    
    if (step === 2) {
        createEducationStep();
    } else if (step === 3) {
        createSkillsStep();
    } else if (step === 4) {
        createAIAnalysisStep();
    } else if (step === 5) {
        // Ensure AI analysis done before showing matches
        if (!analysisComplete) {
            showNotification('🧠 Please complete AI analysis before viewing matches.', 'warning');
            return;
        }
        createMatchingStep();
    }
    
    showStep(step);
    saveProgress();
}

function previousStep(step) {
    showStep(step);
}

function showStep(step) {
    // Hide all step contents
    for (let i = 1; i <= 5; i++) {
        const stepContent = document.getElementById(`step-${i}-content`);
        if (stepContent) {
            stepContent.style.display = 'none';
        }
    }
    
    // Show current step content
    const currentStepContent = document.getElementById(`step-${step}-content`);
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
    }
    
    // Update step indicator
    updateStepIndicator(step);
    
    currentStep = step;
    maxStep = Math.max(maxStep, step);
}

function updateStepIndicator(activeStep) {
    for (let i = 1; i <= 5; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            
            if (i === activeStep) {
                stepElement.classList.add('active');
            } else if (i < activeStep) {
                stepElement.classList.add('completed');
                // Change icon to checkmark
                const stepNumber = stepElement.querySelector('.step-number');
                stepNumber.innerHTML = '<i class="fas fa-check" style="font-size: 0.7rem;"></i>';
            } else {
                const stepNumber = stepElement.querySelector('.step-number');
                stepNumber.textContent = i;
            }
        }
    }
}

function validateCurrentStep() {
    const currentForm = document.querySelector(`#step-${currentStep}-content form`);
    if (currentForm) {
        if (!currentForm.checkValidity()) {
            currentForm.reportValidity();
            return false;
        }
        
        // Extra validations per step
        if (currentStep === 1) {
            // Phone validation (India)
            const phone = document.getElementById('phone')?.value || '';
            const phoneOk = /^(\+91\s?)?[6-9]\d{9}$/.test(phone);
            if (!phoneOk) {
                showNotification('📱 Enter a valid Indian mobile number.', 'error');
                return false;
            }
            // Age validation (16-60)
            const dob = document.getElementById('dob')?.value;
            if (dob) {
                const years = (Date.now() - new Date(dob).getTime()) / (365.25*24*3600*1000);
                if (years < 16 || years > 60) {
                    showNotification('🎂 Age must be between 16 and 60 years.', 'error');
                    return false;
                }
            }
            // Pincode validation (6 digits)
            const pincode = document.getElementById('pincode')?.value || '';
            if (!/^\d{6}$/.test(pincode)) {
                showNotification('📮 Enter a valid 6-digit pincode.', 'error');
                return false;
            }
        }
        if (currentStep === 3) {
            // At least one skill (including custom)
            const selected = document.querySelectorAll('input[name="tech-skills"]:checked, input[name="prog-skills"]:checked, input[name="other-skills"]:checked');
            const hasCustom = (window.__customSkills && window.__customSkills.length > 0);
            if (selected.length === 0 && !hasCustom) {
                showNotification('🧩 Select at least one skill or add a custom skill.', 'error');
                return false;
            }
            // URL validations
            const gh = document.getElementById('github')?.value?.trim();
            const ln = document.getElementById('linkedin')?.value?.trim();
            const urlOk = (v, re) => !v || re.test(v);
            const ghOk = urlOk(gh, /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+(\/.+)?$/);
            const lnOk = urlOk(ln, /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+(\/.+)?$/);
            if (!ghOk) { showNotification('🔗 Enter a valid GitHub URL.', 'error'); return false; }
            if (!lnOk) { showNotification('🔗 Enter a valid LinkedIn URL.', 'error'); return false; }
        }
        
        // Save form data
        const formData = new FormData(currentForm);
        for (let [key, value] of formData.entries()) {
            studentData[key] = value;
        }
    }
    
    return true;
}

// Dynamic Content Creation Functions
function createEducationStep() {
    const existingContent = document.getElementById('step-2-content');
    if (existingContent) return;
    
    const stepContent = document.createElement('div');
    stepContent.id = 'step-2-content';
    stepContent.className = 'portal-card';
    stepContent.style.display = 'none';
    
    stepContent.innerHTML = `
        <h3 style="color: #1e293b; margin-bottom: 1.5rem;">🎓 Education Details</h3>
        
        <form id="education-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="education-level">Current Education Level</label>
                    <select id="education-level" class="form-control" required>
                        <option value="">Select Level</option>
                        <option value="12th">12th Grade</option>
                        <option value="diploma">Diploma</option>
                        <option value="graduation">Graduation</option>
                        <option value="post-graduation">Post Graduation</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="course">Course/Stream</label>
                    <select id="course" class="form-control" required>
                        <option value="">Select Course</option>
                        <option value="btech-cse">B.Tech - Computer Science</option>
                        <option value="btech-it">B.Tech - Information Technology</option>
                        <option value="btech-ece">B.Tech - Electronics & Communication</option>
                        <option value="btech-mech">B.Tech - Mechanical</option>
                        <option value="bca">Bachelor of Computer Applications</option>
                        <option value="bcom">B.Com</option>
                        <option value="bba">Bachelor of Business Administration</option>
                        <option value="mca">Master of Computer Applications</option>
                        <option value="mtech">M.Tech</option>
                        <option value="mba">MBA</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="college">College/Institution Name</label>
                    <input type="text" id="college" name="college" class="form-control" required placeholder="Enter your college name">
                </div>
                <div class="form-group">
                    <label for="year">Current Year/Semester</label>
                    <select id="year" name="year" class="form-control" required>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="final">Final Year</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="cgpa">CGPA/Percentage</label>
                    <input type="number" id="cgpa" name="cgpa" class="form-control" required step="0.01" min="0" max="10" placeholder="8.5">
                </div>
                <div class="form-group">
                    <label for="passing-year">Expected Passing Year</label>
                    <select id="passing-year" name="passing-year" class="form-control" required>
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>Language Proficiency</label>
                <div class="checkbox-group">
                    <div class="checkbox-option">
                        <input type="checkbox" id="english" name="languages" value="english">
                        <label for="english">English</label>
                    </div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="hindi" name="languages" value="hindi">
                        <label for="hindi">Hindi</label>
                    </div>
                    <div class="checkbox-option">
                        <input type="checkbox" id="regional" name="languages" value="regional">
                        <label for="regional">Regional Language</label>
                    </div>
                </div>
            </div>
        </form>
        
        <div class="navigation-buttons">
            <button class="btn btn-outline" onclick="previousStep(1)">
                <i class="fas fa-arrow-left"></i>
                Previous
            </button>
            <button class="btn btn-primary" onclick="nextStep(3)">
                Next: Skills & Interests
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    document.getElementById('portal-content').appendChild(stepContent);
}

function createSkillsStep() {
    const existingContent = document.getElementById('step-3-content');
    if (existingContent) return;
    
    const stepContent = document.createElement('div');
    stepContent.id = 'step-3-content';
    stepContent.className = 'portal-card';
    stepContent.style.display = 'none';
    
    stepContent.innerHTML = `
        <h3 style="color: #1e293b; margin-bottom: 1.5rem;">🎯 Skills & Career Interests</h3>
        
        <form id="skills-form">
            <div class="form-group">
                <label>Technical Skills</label>
                <div class="checkbox-group" id="tech-skill-group">
                    ${['Python','Java','JavaScript','React','Node.js','SQL','Machine Learning','Artificial Intelligence','C++','C#','Django','Flask','Spring','Docker','Kubernetes','AWS','Azure','GCP','HTML','CSS','TypeScript'].map((s, i) => `
                        <div class="checkbox-option">
                            <input type="checkbox" id="tech-${i}" name="tech-skills" value="${s}">
                            <label for="tech-${i}">${s}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="form-row" style="margin-top: 0.75rem;">
                    <input type="text" id="custom-skill-input" class="form-control" placeholder="Add custom skill (e.g., Rust, Tableau)">
                    <button type="button" class="btn btn-secondary" onclick="addCustomSkill()" style="min-width: 180px;">
                        <i class="fas fa-plus"></i> Add Skill
                    </button>
                </div>
                <div id="custom-skills-list" class="skill-tags" style="margin-top: 0.5rem;"></div>
            </div>
            
            <div class="form-group">
                <label>Preferred Industries</label>
                <div class="checkbox-group">
                    ${['Information Technology','FinTech','Healthcare','E-commerce','Manufacturing','Consulting','EdTech','GovTech','Telecom','Automotive'].map((s, i) => `
                        <div class="checkbox-option">
                            <input type="checkbox" id="ind-${i}" name="industries" value="${s}">
                            <label for="ind-${i}">${s}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label for="location1">1st Choice Location</label>
                <select id="location1" name="location1" class="form-control" required>
                    ${['','Bangalore','Mumbai','Delhi/NCR','Pune','Hyderabad','Chennai','Kolkata','Ahmedabad','Remote'].map((c) => 
                        `<option value="${c.toLowerCase()}">${c || 'Select Location'}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="location2">2nd Choice Location</label>
                    <select id="location2" name="location2" class="form-control">
                        ${['','Bangalore','Mumbai','Delhi/NCR','Pune','Hyderabad','Chennai','Kolkata','Ahmedabad','Remote'].map((c) => 
                            `<option value="${c.toLowerCase()}">${c || 'Select Location'}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="location3">3rd Choice Location</label>
                    <select id="location3" name="location3" class="form-control">
                        ${['','Bangalore','Mumbai','Delhi/NCR','Pune','Hyderabad','Chennai','Kolkata','Ahmedabad','Remote'].map((c) => 
                            `<option value="${c.toLowerCase()}">${c || 'Select Location'}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="career-goal">Career Aspiration (AI will analyze this)</label>
                <textarea id="career-goal" name="career-goal" class="form-control" rows="4" required 
                    placeholder="Describe your career goals, interests, and what you want to achieve through this internship. Be as detailed as possible - our AI will analyze your aspirations to find perfect matches!"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="github">GitHub Profile (Optional)</label>
                    <input type="url" id="github" class="form-control" placeholder="https://github.com/your-username">
                </div>
                <div class="form-group">
                    <label for="linkedin">LinkedIn Profile (Optional)</label>
                    <input type="url" id="linkedin" class="form-control" placeholder="https://linkedin.com/in/your-profile">
                </div>
            </div>
        </form>
        
        <div class="navigation-buttons">
            <button class="btn btn-outline" onclick="previousStep(2)">
                <i class="fas fa-arrow-left"></i>
                Previous
            </button>
            <button class="btn btn-primary" onclick="nextStep(4)">
                Next: AI Analysis
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    document.getElementById('portal-content').appendChild(stepContent);

    // Initialize custom skills array
    window.__customSkills = window.__customSkills || [];
}

function createAIAnalysisStep() {
    const existingContent = document.getElementById('step-4-content');
    if (existingContent) return;
    
    const stepContent = document.createElement('div');
    stepContent.id = 'step-4-content';
    stepContent.className = 'portal-card';
    stepContent.style.display = 'none';
    
    stepContent.innerHTML = `
        <h3 style=\"color: #1e293b; margin-bottom: 1.5rem;\">🤖 AI Analysis</h3>
        
        <div id=\"ai-analysis-section\" style=\"display: block;\">
            <button id="autofill-from-resume-btn" class="btn btn-secondary" onclick="autofillFromResume()" style="width: 100%; margin-bottom: 1rem; display: none;">
                <i class="fas fa-wand-magic-sparkles"></i>
                Auto-fill Forms from Resume
            </button>
            <button class="btn btn-primary" onclick="startAIAnalysis()" style="width: 100%; margin: 1rem 0;">
                <i class="fas fa-brain"></i>
                Start AI Analysis
            </button>
            
            <div id="analysis-progress" style="display: none;">
                <div class="matching-animation">
                    <div class="spinner"></div>
                    <h4 id="analysis-status">Starting AI Analysis...</h4>
                    <p id="analysis-detail">Preparing your profile for processing</p>
                </div>
            </div>
            
            <div id="analysis-results" class="analysis-results" style="display: none;">
                <h4 style="color: #10b981; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i> AI Analysis Complete!
                </h4>
                
                <div style="margin-bottom: 1.5rem;">
                    <h5>🎯 Direct Skills Detected:</h5>
                    <div class="skill-tags" id="detected-skills"></div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h5>🔮 Hidden Skills Inferred:</h5>
                    <div class="skill-tags" id="hidden-skills"></div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h5>📈 Career Path Recommendation:</h5>
                    <div id="career-path" style="background: rgba(99, 102, 241, 0.1); padding: 1rem; border-radius: 0.5rem; font-weight: 600; color: #6366f1;"></div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h5>🎯 Profile Confidence:</h5>
                    <div style="position: relative; background: #e2e8f0; height: 2rem; border-radius: 1rem; overflow: hidden;">
                        <div id="confidence-fill" style="height: 100%; background: linear-gradient(90deg, #10b981, #34d399); width: 0%; transition: width 2s ease-out;"></div>
                        <span id="confidence-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 600; color: white;"></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="navigation-buttons">
            <button class="btn btn-outline" onclick="previousStep(3)">
                <i class="fas fa-arrow-left"></i>
                Previous
            </button>
            <button id="find-matches-btn" class="btn btn-primary" onclick="nextStep(5)" style="display: none;">
                Find My Matches
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    document.getElementById('portal-content').appendChild(stepContent);
    
    // No upload UI in this step anymore; using the resume uploaded in Step 1
}

function createMatchingStep() {
    const existingContent = document.getElementById('step-5-content');
    if (existingContent) return;
    
    const stepContent = document.createElement('div');
    stepContent.id = 'step-5-content';
    stepContent.className = 'portal-card';
    stepContent.style.display = 'none';
    
    stepContent.innerHTML = `
        <h3 style="color: #1e293b; margin-bottom: 1.5rem;">🎯 Your Perfect Internship Matches</h3>
        
        <div id="matching-process" class="matching-animation">
            <div class="spinner"></div>
            <h4>Finding Your Perfect Matches...</h4>
            <p>Our AI is analyzing 2,847 companies and 15,632 opportunities</p>
        </div>
        
        <div id="matches-results" style="display: none;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h4 style="color: #10b981;">🎉 Found 8 Perfect Matches!</h4>
                <p>AI analyzed your profile and found these opportunities with high success probability</p>
            </div>
            
            <div id="matches-list">
                <!-- Matches will be dynamically inserted here -->
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="applyToSelected()">
                    <i class="fas fa-paper-plane"></i>
                    Apply to Selected Matches
                </button>
                <button class="btn btn-outline" onclick="refineMatches()" style="margin-left: 1rem;">
                    <i class="fas fa-filter"></i>
                    Refine Matches
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('portal-content').appendChild(stepContent);
    
    // Start matching process
    setTimeout(() => {
        startMatchingProcess();
    }, 1000);
}

// File Upload Functions
function setupFileUpload() {
    const uploadArea = document.getElementById('resume-upload-area');
    const fileInput = document.getElementById('resume-file');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function setupFileUploadForStep() {
    const uploadArea = document.getElementById('resume-upload-area');
    const fileInput = document.getElementById('resume-file');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function triggerFileUpload() {
    document.getElementById('resume-file').click();
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processUploadedFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processUploadedFile(files[0]);
    }
}

function processUploadedFile(file) {
    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('❌ Please upload a PDF, DOC, or DOCX file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('❌ File size should be less than 5MB', 'error');
        return;
    }
    
    uploadedFile = file;
    
    // Show file info
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    document.getElementById('file-info').style.display = 'flex';
    const aiSect = document.getElementById('ai-analysis-section');
    if (aiSect) aiSect.style.display = 'block';
    
    const autoBtn = document.getElementById('autofill-from-resume-btn');
    if (autoBtn) autoBtn.style.display = 'block';
    
    // Simulate upload progress
    simulateUploadProgress();
}

function simulateUploadProgress() {
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressDiv.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                progressDiv.style.display = 'none';
                showNotification('✅ Resume uploaded successfully!', 'success');
                // Auto-run auto-fill right after successful upload
                try { autofillFromResume(); } catch (e) { /* ignore */ }
            }, 500);
        }
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
    }, 200);
}

function removeFile() {
    uploadedFile = null;
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('ai-analysis-section').style.display = 'none';
    document.getElementById('resume-file').value = '';
    document.getElementById('upload-progress').style.display = 'none';
}

// Resume Auto-fill Functions
const KNOWN_SKILLS = ['Python','Java','JavaScript','React','Node.js','SQL','Machine Learning','Artificial Intelligence','C++','C#','Django','Flask','Spring','Docker','Kubernetes','AWS','Azure','GCP','HTML','CSS','TypeScript'];

async function autofillFromResume() {
    try {
        if (!uploadedFile) {
            showNotification('❌ Please upload your resume first', 'error');
            return;
        }
        // Extract text
        const text = await extractTextFromFile(uploadedFile);
        if (!text || text.trim().length < 20) {
            showNotification('⚠️ Could not read text from the resume. Try PDF or DOCX.', 'warning');
            return;
        }
        // Parse
        const parsed = parseResumeText(text);
        // Apply to forms
        applyAutoFill(parsed);
        saveProgress();
        showNotification('✨ Auto-filled details from your resume. Please review and complete any missing fields.', 'success');
    } catch (err) {
        console.error(err);
        showNotification('❌ Auto-fill failed. Please ensure the file is PDF or DOCX.', 'error');
    }
}

async function extractTextFromFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const type = (file.type || '').toLowerCase();
    if (type.includes('pdf')) {
        return await extractTextFromPDF(arrayBuffer);
    }
    if (type.includes('wordprocessingml.document') || file.name.toLowerCase().endsWith('.docx')) {
        return await extractTextFromDocx(arrayBuffer);
    }
    // Legacy .doc not supported reliably in-browser
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
}

async function extractTextFromPDF(arrayBuffer) {
    if (!(window.pdfjsLib && window.pdfjsLib.getDocument)) {
        throw new Error('PDF.js not loaded');
    }
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(it => it.str);
        fullText += strings.join(' ') + '\n';
    }
    return fullText;
}

async function extractTextFromDocx(arrayBuffer) {
    if (!(window.mammoth && window.mammoth.extractRawText)) {
        throw new Error('Mammoth (DOCX parser) not loaded');
    }
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return (result && result.value) ? result.value : '';
}

function parseResumeText(text) {
    const lower = text.toLowerCase();
    const out = {};

    // Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/);
    if (emailMatch) out.email = emailMatch[0];

    // Phone (India)
    const phoneMatch = text.match(/(\+91[-\s])?[6-9]\d{9}/);
    if (phoneMatch) out.phone = phoneMatch[0].replace(/\s|-/g, '');

    // DOB
    const dob = extractDOB(text);
    if (dob) out.dob = dob; // yyyy-mm-dd

    // Gender (only if explicitly stated)
    const genderMatch = text.match(/\bGender\s*[:\-]?\s*(Male|Female|Other)\b/i);
    if (genderMatch) out.gender = genderMatch[1].toLowerCase();

    // Address / State / District / Pincode
    const addr = detectAddress(text);
    Object.assign(out, addr);

    // Links
    const ghMatch = text.match(/https?:\/\/(www\.)?github\.com\/[^\s)]+/i);
    if (ghMatch) out.github = ghMatch[0];
    const lnMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i);
    if (lnMatch) out.linkedin = lnMatch[0];

    // CGPA / GPA
    const cgpaMatch = text.match(/(CGPA|GPA)[:\s]*([0-9]+(\.[0-9]{1,2})?)/i);
    if (cgpaMatch) out.cgpa = parseFloat(cgpaMatch[2]);

    // Passing year (pick most recent plausible year 2023-2030)
    const yearMatches = text.match(/20(2[3-9]|3[0])\b/g);
    if (yearMatches && yearMatches.length) {
        out.passingYear = yearMatches.sort().slice(-1)[0];
    }

    // Education level + course heuristic
    if (/\b(m\.?tech|m\.e\.|master of technology|mca|mba)\b/i.test(text)) {
        out.educationLevel = 'post-graduation';
    } else if (/\b(b\.?tech|b\.e\.|bachelor of (engineering|technology)|bca)\b/i.test(text)) {
        out.educationLevel = 'graduation';
    } else if (/\b(diploma)\b/i.test(text)) {
        out.educationLevel = 'diploma';
    } else if (/\b(12th|xii)\b/i.test(text)) {
        out.educationLevel = '12th';
    }

    // Course mapping heuristic
    if (/computer(\s|-)science|cse|it\b/i.test(text)) out.course = 'btech-cse';
    else if (/electronics|ece\b/i.test(text)) out.course = 'btech-ece';
    else if (/mechanical\b/i.test(text)) out.course = 'btech-mech';
    else if (/bca\b/i.test(text)) out.course = 'bca';
    else if (/mca\b/i.test(text)) out.course = 'mca';
    else if (/m\.tech|mtech\b/i.test(text)) out.course = 'mtech';
    else if (/mba\b/i.test(text)) out.course = 'mba';

    // College name heuristic (first line containing college/university/institute)
    const collegeLine = text.split(/\r?\n/).find(l => /college|university|institute/i.test(l));
    if (collegeLine) out.college = collegeLine.trim();

    // Year/Semester heuristic
    if (/\b1st year\b/i.test(text)) out.year = '1';
    else if (/\b2nd year\b/i.test(text)) out.year = '2';
    else if (/\b3rd year\b/i.test(text)) out.year = '3';
    else if (/\b4th year\b/i.test(text)) out.year = '4';
    else if (/\bfinal year\b/i.test(text)) out.year = 'final';

    // Languages
    const langs = [];
    if (/\benglish\b/i.test(lower)) langs.push('english');
    if (/\bhindi\b/i.test(lower)) langs.push('hindi');
    out.languages = langs;

    // Skills detection
    const skills = [];
    KNOWN_SKILLS.forEach(s => { if (lower.includes(s.toLowerCase())) skills.push(s); });
    // Try to parse explicit Skills section
    const skillsSectionMatch = text.match(/skills\s*[:\-]?\s*([\s\S]{0,400})/i);
    if (skillsSectionMatch) {
        const section = skillsSectionMatch[1].replace(/\n/g, ', ');
        section.split(/[,•|]/).map(t => t.trim()).forEach(t => {
            if (t.length > 0 && !skills.some(k => k.toLowerCase() === t.toLowerCase())) skills.push(t);
        });
    }
    out.skills = Array.from(new Set(skills)).slice(0, 25);

    // Career objective / summary
    const objMatch = text.match(/(objective|summary|career objective)\s*[:\-]?\s*([\s\S]{0,400})/i);
    if (objMatch) out.careerGoal = objMatch[2].trim();

    return out;
}

function extractDOB(text) {
    // Look for lines like "DOB: 12/03/2003" or "Date of Birth - 2002-07-15"
    const m = text.match(/(DOB|D\.O\.B\.|Date of Birth)\s*[:\-]?\s*((?:\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:19|20)\d{2})|(?:(?:19|20)\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}))/i);
    if (!m) return null;
    const raw = m[2].replace(/\./g, '-').replace(/\//g, '-');
    // Normalize to yyyy-mm-dd
    let parts = raw.split('-');
    if (parts[0].length === 4) {
        // yyyy-mm-dd
        const [y, mm, dd] = parts.map(p => p.padStart(2, '0'));
        return `${y}-${mm}-${dd}`;
    } else {
        // dd-mm-yyyy
        const [dd, mm, y] = parts.map(p => p.padStart(2, '0'));
        return `${y}-${mm}-${dd}`;
    }
}

function detectAddress(text) {
    const lower = text.toLowerCase();
    const STATE_KEYWORDS = {
        'maharashtra': ['maharashtra','mumbai','pune','nagpur','nashik','aurangabad'],
        'karnataka': ['karnataka','bengaluru','bangalore','mysore','mangalore','hubli','belgaum'],
        'delhi': ['delhi','new delhi','south delhi','central delhi','east delhi','west delhi'],
        'gujarat': ['gujarat','ahmedabad','surat','vadodara','rajkot','gandhinagar'],
        'rajasthan': ['rajasthan','jaipur','jodhpur','udaipur','kota','ajmer'],
        'punjab': ['punjab','chandigarh','ludhiana','amritsar','jalandhar','patiala'],
        'haryana': ['haryana','gurgaon','gurugram','faridabad','panipat','ambala','karnal']
    };
    const CITY_TO_DISTRICT = {
        'mumbai':'mumbai','pune':'pune','nagpur':'nagpur','nashik':'nashik','aurangabad':'aurangabad',
        'bangalore':'bangalore','bengaluru':'bangalore','mysore':'mysore','mangalore':'mangalore','hubli':'hubli','belgaum':'belgaum',
        'new delhi':'new delhi','south delhi':'south delhi','central delhi':'central delhi','east delhi':'east delhi','west delhi':'west delhi',
        'ahmedabad':'ahmedabad','surat':'surat','vadodara':'vadodara','rajkot':'rajkot','gandhinagar':'gandhinagar',
        'jaipur':'jaipur','jodhpur':'jodhpur','udaipur':'udaipur','kota':'kota','ajmer':'ajmer',
        'chandigarh':'chandigarh','ludhiana':'ludhiana','amritsar':'amritsar','jalandhar':'jalandhar','patiala':'patiala',
        'gurgaon':'gurgaon','gurugram':'gurgaon','faridabad':'faridabad','panipat':'panipat','ambala':'ambala','karnal':'karnal'
    };

    const out = {};

    // Pincode: prefer ones near address keywords, else first plausible
    const pinAll = Array.from(text.matchAll(/\b[1-9][0-9]{5}\b/g)).map(m => ({v: m[0], idx: m.index||0}));
    const pinNear = pinAll.find(m => {
        const slice = lower.slice(Math.max(0, m.idx-40), Math.min(lower.length, m.idx+40));
        return /pin|pincode|postal|zip|address|addr\b/.test(slice);
    });
    if (pinNear) out.pincode = pinNear.v; else if (pinAll.length) out.pincode = pinAll[0].v;

    // State and district by keywords
    for (const [state, keys] of Object.entries(STATE_KEYWORDS)) {
        if (keys.some(k => lower.includes(k))) {
            out.state = state; // matches select value
            // Try to pick district using specific city keyword
            const cityKey = keys.find(k => lower.includes(k) && CITY_TO_DISTRICT[k]);
            if (cityKey) out.district = CITY_TO_DISTRICT[cityKey];
            break;
        }
    }

    // Area type heuristic: mark urban if big metro detected
    const URBAN_HINTS = ['mumbai','pune','bangalore','bengaluru','delhi','new delhi','hyderabad','chennai','kolkata','ahmedabad','jaipur'];
    if (URBAN_HINTS.some(c => lower.includes(c))) out.areaType = 'urban';

    // Category (only when explicitly present)
    const cat = text.match(/\b(Category|Caste)\s*[:\-]?\s*(General|OBC|SC|ST|EWS)\b/i);
    if (cat) out.category = cat[2].toLowerCase();

    return out;
}

function applyAutoFill(d) {
    // Step 1: Basic
    const phoneEl = document.getElementById('phone');
    if (d.phone && phoneEl && !phoneEl.value) { phoneEl.value = d.phone; highlightField(phoneEl); }

    const dobEl = document.getElementById('dob');
    if (d.dob && dobEl && !dobEl.value) { dobEl.value = d.dob; highlightField(dobEl); }

    if (d.gender) {
        const gId = d.gender === 'male' ? 'male' : d.gender === 'female' ? 'female' : 'other';
        const gEl = document.getElementById(gId);
        if (gEl && !gEl.checked) { gEl.checked = true; highlightField(gEl); }
    }

    if (d.state) {
        const stateEl = document.getElementById('state');
        if (stateEl) {
            if (!stateEl.value) { stateEl.value = d.state; highlightField(stateEl); }
            // Populate districts then set
            try { updateDistricts(); } catch {}
            if (d.district) {
                const distEl = document.getElementById('district');
                if (distEl) {
                    const val = d.district.toLowerCase();
                    const opt = Array.from(distEl.options).find(o => o.value === val);
                    if (opt) { distEl.value = val; highlightField(distEl); }
                }
            }
        }
    }

    const pinEl = document.getElementById('pincode');
    if (d.pincode && pinEl && !pinEl.value) { pinEl.value = d.pincode; highlightField(pinEl); }

    if (d.areaType) {
        const areaEl = document.getElementById(d.areaType);
        if (areaEl && !areaEl.checked) { areaEl.checked = true; highlightField(areaEl); }
    }

    if (d.category) {
        const catEl = document.getElementById(d.category);
        if (catEl && !catEl.checked) { catEl.checked = true; highlightField(catEl); }
    }

    // Step 2: Education – ensure exists
    if (!document.getElementById('step-2-content')) { try { createEducationStep(); } catch(e){} }
    const levelEl = document.getElementById('education-level');
    if (d.educationLevel && levelEl && !levelEl.value) { levelEl.value = d.educationLevel; highlightField(levelEl); }
    const courseEl = document.getElementById('course');
    if (d.course && courseEl && !courseEl.value) { courseEl.value = d.course; highlightField(courseEl); }
    const collegeEl = document.getElementById('college');
    if (d.college && collegeEl && !collegeEl.value) { collegeEl.value = d.college; highlightField(collegeEl); }
    const yearEl = document.getElementById('year');
    if (d.year && yearEl && !yearEl.value) { yearEl.value = d.year; highlightField(yearEl); }
    const cgpaEl = document.getElementById('cgpa');
    if (typeof d.cgpa === 'number' && cgpaEl && !cgpaEl.value) { cgpaEl.value = String(d.cgpa); highlightField(cgpaEl); }
    const passEl = document.getElementById('passing-year');
    if (d.passingYear && passEl && !passEl.value) { passEl.value = d.passingYear; highlightField(passEl); }
    // Languages
    (d.languages || []).forEach(l => {
        const langEl = document.getElementById(l);
        if (langEl && !langEl.checked) { langEl.checked = true; highlightField(langEl); }
    });

    // Step 3: Skills – ensure exists
    if (!document.getElementById('step-3-content')) { try { createSkillsStep(); } catch(e){} }
    const ghEl = document.getElementById('github');
    if (d.github && ghEl && !ghEl.value) { ghEl.value = d.github; highlightField(ghEl); }
    const lnEl = document.getElementById('linkedin');
    if (d.linkedin && lnEl && !lnEl.value) { lnEl.value = d.linkedin; highlightField(lnEl); }
    const goalEl = document.getElementById('career-goal');
    if (d.careerGoal && goalEl && !goalEl.value) { goalEl.value = d.careerGoal; highlightField(goalEl); }

    // Skills checkboxes and custom
    const inputs = Array.from(document.querySelectorAll('input[name="tech-skills"]'));
    const existingValues = new Set(inputs.map(i => (i.value || i.nextElementSibling?.textContent || '').toLowerCase()));

    (d.skills || []).forEach(skill => {
        if (!skill) return;
        const target = inputs.find(i => (i.value || i.nextElementSibling?.textContent || '').toLowerCase() === skill.toLowerCase());
        if (target && !target.checked) { target.checked = true; highlightField(target); }
        else if (!existingValues.has(skill.toLowerCase())) {
            // Add as custom skill tag
            window.__customSkills = window.__customSkills || [];
            if (!window.__customSkills.includes(skill)) {
                window.__customSkills.push(skill);
                const list = document.getElementById('custom-skills-list');
                if (list) {
                    const tag = document.createElement('span');
                    tag.className = 'skill-tag';
                    tag.textContent = skill;
                    list.appendChild(tag);
                }
            }
        }
    });
}

function highlightField(el) {
    try {
        const prev = el.style.boxShadow;
        el.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.35)';
        setTimeout(() => { el.style.boxShadow = prev; }, 1200);
    } catch {}
}

// AI Analysis Functions
function startAIAnalysis() {
    if (!uploadedFile) {
        showNotification('❌ Please upload your resume first', 'error');
        return;
    }
    
    document.getElementById('analysis-progress').style.display = 'block';
    
    // Simulate AI analysis steps
    const steps = [
        { status: 'Document Processing...', detail: 'Extracting text and formatting from your resume', duration: 1500 },
        { status: 'NLP Analysis...', detail: 'Understanding your experience and skills', duration: 2000 },
        { status: 'Skill Inference...', detail: 'Identifying hidden skills and abilities', duration: 1800 },
        { status: 'Career Mapping...', detail: 'Analyzing your career aspirations', duration: 1200 },
        { status: 'Profile Building...', detail: 'Creating your comprehensive profile', duration: 1000 }
    ];
    
    let currentStepIndex = 0;
    
    function processStep() {
        if (currentStepIndex >= steps.length) {
            showAnalysisResults();
            return;
        }
        
        const step = steps[currentStepIndex];
        document.getElementById('analysis-status').textContent = step.status;
        document.getElementById('analysis-detail').textContent = step.detail;
        
        setTimeout(() => {
            currentStepIndex++;
            processStep();
        }, step.duration);
    }
    
    processStep();
}

function showAnalysisResults() {
    document.getElementById('analysis-progress').style.display = 'none';
    document.getElementById('analysis-results').style.display = 'block';
    
    // Simulate AI analysis results based on selected skills and career goals
    const selectedSkills = getSelectedSkills();
    const careerGoal = document.getElementById('career-goal')?.value || '';
    
    const detectedSkills = selectedSkills.slice(0, 5);
    const hiddenSkills = ['Leadership', 'Problem Solving', 'Team Collaboration', 'Communication', 'Analytical Thinking'];
    const careerPath = inferCareerPath(selectedSkills, careerGoal);
    const confidence = Math.floor(Math.random() * 15) + 85; // 85-99%
    
    // Display detected skills
    const detectedSkillsContainer = document.getElementById('detected-skills');
    detectedSkillsContainer.innerHTML = detectedSkills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Display hidden skills
    const hiddenSkillsContainer = document.getElementById('hidden-skills');
    hiddenSkillsContainer.innerHTML = hiddenSkills.map(skill => 
        `<span class="skill-tag hidden">${skill}</span>`
    ).join('');
    
    // Display career path
    document.getElementById('career-path').textContent = careerPath;
    
    // Animate confidence meter
    setTimeout(() => {
        document.getElementById('confidence-fill').style.width = confidence + '%';
        document.getElementById('confidence-text').textContent = confidence + '%';
    }, 500);
    
    // Show find matches button
    document.getElementById('find-matches-btn').style.display = 'inline-flex';
    
    analysisComplete = true;
    showNotification('🎉 AI analysis completed! Your profile looks amazing!', 'success');
}

function addCustomSkill() {
    const input = document.getElementById('custom-skill-input');
    const val = (input?.value || '').trim();
    if (!val) return;
    window.__customSkills = window.__customSkills || [];
    if (window.__customSkills.includes(val)) { showNotification('Skill already added.', 'warning'); return; }
    window.__customSkills.push(val);
    const list = document.getElementById('custom-skills-list');
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = val;
    tag.style.cursor = 'pointer';
    tag.title = 'Click to remove';
    tag.onclick = () => {
        window.__customSkills = window.__customSkills.filter(s => s !== val);
        tag.remove();
    };
    list.appendChild(tag);
    input.value = '';
}

function getSelectedSkills() {
    const skills = [];
    document.querySelectorAll('input[name="tech-skills"]:checked').forEach(input => {
        const label = input.nextElementSibling?.textContent || input.value;
        skills.push(label);
    });
    if (window.__customSkills && window.__customSkills.length) {
        skills.push(...window.__customSkills);
    }
    return skills.length > 0 ? skills : ['JavaScript', 'Python', 'React', 'SQL', 'Node.js'];
}

function inferCareerPath(skills, careerGoal) {
    if (skills.includes('Python') && skills.includes('Machine Learning')) {
        return 'AI/ML Engineer & Data Scientist';
    } else if (skills.includes('React') && skills.includes('JavaScript')) {
        return 'Full-Stack Web Developer';
    } else if (careerGoal.toLowerCase().includes('data')) {
        return 'Data Analyst & Business Intelligence';
    } else if (careerGoal.toLowerCase().includes('mobile')) {
        return 'Mobile App Developer';
    } else {
        return 'Software Developer & Technical Consultant';
    }
}

// Matching Process Functions
function startMatchingProcess() {
    const steps = [
        { text: 'Analyzing your profile...', duration: 1500 },
        { text: 'Scanning 2,847 companies...', duration: 2000 },
        { text: 'Running optimization algorithms...', duration: 1800 },
        { text: 'Calculating success probabilities...', duration: 1200 },
        { text: 'Finalizing matches...', duration: 1000 }
    ];
    
    let stepIndex = 0;
    const processingElement = document.querySelector('#matching-process p');
    
    function processMatchingStep() {
        if (stepIndex >= steps.length) {
            showMatchingResults();
            return;
        }
        
        processingElement.textContent = steps[stepIndex].text;
        
        setTimeout(() => {
            stepIndex++;
            processMatchingStep();
        }, steps[stepIndex].duration);
    }
    
    processMatchingStep();
}

function showMatchingResults() {
    document.getElementById('matching-process').style.display = 'none';
    document.getElementById('matches-results').style.display = 'block';
    
    const matches = generateMatches();
    matchedInternships = matches; // Store for details modal
    const matchesList = document.getElementById('matches-list');
    
    matchesList.innerHTML = matches.map(match => `
        <div class="match-card">
            <div class="match-header">
                <div>
                    <h4>${match.company}</h4>
                    <p style="color: #64748b; margin: 0.5rem 0;">${match.position}</p>
                </div>
                <div class="match-score">${match.score}% Match</div>
            </div>
            
            <div class="match-details">
                <div class="match-detail">
                    <div class="value">${match.location}</div>
                    <div class="label">Location</div>
                </div>
                <div class="match-detail">
                    <div class="value">${match.duration}</div>
                    <div class="label">Duration</div>
                </div>
                <div class="match-detail">
                    <div class="value">${match.stipend}</div>
                    <div class="label">Stipend</div>
                </div>
                <div class="match-detail">
                    <div class="value">${match.successRate}%</div>
                    <div class="label">Success Rate</div>
                </div>
            </div>
            
            <div style="margin: 1rem 0;">
                <h5>🤖 Why this match?</h5>
                <p style="color: #64748b; font-size: 0.9rem;">${match.reason}</p>
            </div>
            
            <div style="display: flex; gap: 1rem; align-items: center;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" name="selected-matches" value="${match.id}">
                    Select for application
                </label>
                <button class="btn btn-outline" style="margin-left: auto;" onclick="viewMatchDetails('${match.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function generateMatches() {
    const companies = [
        { name: 'Microsoft', positions: ['Software Development Intern', 'AI Research Intern'], locations: ['Bangalore', 'Hyderabad'] },
        { name: 'Google', positions: ['Software Engineering Intern', 'Product Manager Intern'], locations: ['Bangalore', 'Mumbai'] },
        { name: 'TCS', positions: ['Digital Technology Intern', 'Innovation Lab Intern'], locations: ['Mumbai', 'Chennai'] },
        { name: 'Infosys', positions: ['Technology Analyst Intern', 'Digital Specialist Intern'], locations: ['Bangalore', 'Pune'] },
        { name: 'Flipkart', positions: ['Product Development Intern', 'Data Science Intern'], locations: ['Bangalore'] },
        { name: 'Amazon', positions: ['Software Development Intern', 'Cloud Solutions Intern'], locations: ['Bangalore', 'Chennai'] },
        { name: 'Accenture', positions: ['Technology Consulting Intern', 'Innovation Intern'], locations: ['Mumbai', 'Delhi'] },
        { name: 'Wipro', positions: ['Software Engineering Intern', 'Digital Transformation Intern'], locations: ['Bangalore', 'Hyderabad'] }
    ];
    
    return companies.slice(0, 8).map((company, index) => ({
        id: index + 1,
        title: company.positions[Math.floor(Math.random() * company.positions.length)],
        company: company.name,
        position: company.positions[Math.floor(Math.random() * company.positions.length)],
        location: company.locations[Math.floor(Math.random() * company.locations.length)],
        duration: ['3 months', '6 months', '4 months'][Math.floor(Math.random() * 3)],
        stipend: Math.floor(Math.random() * 20) + 15,
        capacity: Math.floor(Math.random() * 8) + 3,
        remote: Math.random() > 0.7,
        skills: getSelectedSkills().slice(0, Math.floor(Math.random() * 3) + 2),
        matchScore: Math.floor(Math.random() * 15) + 85,
        successRate: Math.floor(Math.random() * 20) + 80,
        score: Math.floor(Math.random() * 15) + 85,
        whyMatch: [`Strong ${getSelectedSkills().slice(0,2).join(' & ')} skills match`, 'Career goals alignment', 'Location preference match'],
        quotaFilled: {
            rural: Math.floor(Math.random() * 3),
            sc: Math.floor(Math.random() * 2),
            st: Math.floor(Math.random() * 2),
            obc: Math.floor(Math.random() * 3),
            female: Math.floor(Math.random() * 4)
        },
        reason: `Perfect skill match with your ${getSelectedSkills().slice(0, 2).join(' and ')} expertise. Company culture aligns with your career goals.`
    }));
}

// Utility Functions
function updateDistricts() {
    const state = document.getElementById('state').value;
    const districtSelect = document.getElementById('district');
    
    const districts = {
        'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
        'karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
        'delhi': ['New Delhi', 'Central Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
        'gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
        'rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
        'punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
        'haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal']
    };
    
    districtSelect.innerHTML = '<option value="">Select District</option>';
    
    if (state && districts[state]) {
        districts[state].forEach(district => {
            districtSelect.innerHTML += `<option value="${district.toLowerCase()}">${district}</option>`;
        });
    }
}

function setupFormValidations() {
    // Add real-time form validation
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('form-control')) {
            validateField(e.target);
        }
    });
}

function validateField(field) {
    if (field.checkValidity()) {
        field.style.borderColor = '#10b981';
    } else {
        field.style.borderColor = '#ef4444';
    }
}

function setupAutoSave() {
    // Auto-save form data every 30 seconds
    setInterval(() => {
        saveProgress();
    }, 30000);
}

function saveProgress() {
    const progress = {
        currentStep: currentStep,
        maxStep: maxStep,
        studentData: studentData,
        uploadedFileName: uploadedFile ? uploadedFile.name : null,
        analysisComplete: analysisComplete
    };
    
    localStorage.setItem('student-progress', JSON.stringify(progress));
}

function loadSavedProgress() {
    const savedProgress = localStorage.getItem('student-progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        currentStep = progress.currentStep || 1;
        maxStep = progress.maxStep || 1;
        studentData = progress.studentData || {};
        analysisComplete = progress.analysisComplete || false;
        
        // Restore form data
        restoreFormData();
        
        // Navigate to saved step if beyond step 1
        if (currentStep > 1) {
            for (let i = 2; i <= currentStep; i++) {
                if (i === 2) createEducationStep();
                else if (i === 3) createSkillsStep();
                else if (i === 4) createAIAnalysisStep();
                else if (i === 5) createMatchingStep();
            }
            showStep(currentStep);
        }
    }
}

function restoreFormData() {
    Object.keys(studentData).forEach(key => {
        const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = field.value === studentData[key];
            } else {
                field.value = studentData[key];
            }
        }
    });
}

// Action Functions
function applyToSelected() {
    const selectedMatches = document.querySelectorAll('input[name="selected-matches"]:checked');
    
    if (selectedMatches.length === 0) {
        showNotification('❌ Please select at least one internship to apply', 'error');
        return;
    }
    
    showNotification(`🚀 Applied to ${selectedMatches.length} internships successfully!`, 'success');
    
    setTimeout(() => {
        showNotification('📧 Application confirmation emails sent!', 'info');
    }, 2000);
}

function refineMatches() {
    showNotification('🔄 Feature coming soon! You can refine matches based on preferences.', 'info');
}

function viewInternshipDetails(internshipId) {
    const internship = matchedInternships.find(i => i.id === internshipId);
    if (!internship) return;

    const overlay = document.getElementById('details-modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    titleEl.innerHTML = `
        <i class="fas fa-briefcase" style="color: #6366f1; margin-right: 0.5rem;"></i>
        ${internship.title} <span style="color: #6b7280;">•</span> ${internship.company}
    `;

    const skillsHTML = internship.skills.map(s => `<span class="skill-tag"><i class="fas fa-code"></i> ${s}</span>`).join('');
    const quota = internship.quotaFilled || { rural: 0, sc: 0, st: 0, obc: 0, female: 0 };
    
    // Enhanced location display
    const locationIcon = internship.remote ? 'fas fa-globe' : 'fas fa-map-marker-alt';
    const remoteStatus = internship.remote ? 
        '<span class="badge-soft" style="background: #dcfce7; color: #166534;"><i class="fas fa-wifi"></i> Remote Available</span>' : 
        '<span class="badge-soft" style="background: #fef3c7; color: #92400e;"><i class="fas fa-building"></i> On-site Only</span>';
    
    // Calculate additional match factors
    const skillMatch = internship.whyMatch?.[0]?.match || 85;
    const locationMatch = internship.remote ? 95 : 70;
    const experienceMatch = 80;

    bodyEl.innerHTML = `
        <!-- Company Overview -->
        <div class="detail-section">
            <div class="section-header">
                <h4><i class="fas fa-building" style="color: #6366f1;"></i> Company Overview</h4>
            </div>
            <div class="detail-grid">
                <div class="detail-row">
                    <div class="detail-label"><i class="${locationIcon}"></i> Location</div>
                    <div class="detail-value">${internship.location}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-clock"></i> Duration</div>
                    <div class="detail-value">${internship.duration}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-rupee-sign"></i> Stipend</div>
                    <div class="detail-value">₹${(internship.stipend||0).toLocaleString()}/month</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-users"></i> Positions</div>
                    <div class="detail-value">${internship.capacity} seats available</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-laptop"></i> Work Mode</div>
                    <div class="detail-value">${remoteStatus}</div>
                </div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Required Skills -->
        <div class="detail-section">
            <div class="section-header">
                <h4><i class="fas fa-cogs" style="color: #10b981;"></i> Required Skills</h4>
            </div>
            <div class="skill-tags">${skillsHTML}</div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Match Analysis -->
        <div class="detail-section">
            <div class="section-header">
                <h4><i class="fas fa-chart-line" style="color: #f59e0b;"></i> Match Analysis</h4>
                <div class="overall-match">
                    <span class="match-percentage">${internship.matchScore}%</span>
                    <span class="match-label">Overall Match</span>
                </div>
            </div>
            <div class="match-breakdown">
                <div class="breakdown-card">
                    <div class="breakdown-icon"><i class="fas fa-code"></i></div>
                    <div class="value">${skillMatch}%</div>
                    <div class="label">Skills Match</div>
                    <div class="progress-mini">
                        <div class="progress-fill" style="width: ${skillMatch}%;"></div>
                    </div>
                </div>
                <div class="breakdown-card">
                    <div class="breakdown-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div class="value">${locationMatch}%</div>
                    <div class="label">Location</div>
                    <div class="progress-mini">
                        <div class="progress-fill" style="width: ${locationMatch}%;"></div>
                    </div>
                </div>
                <div class="breakdown-card">
                    <div class="breakdown-icon"><i class="fas fa-graduation-cap"></i></div>
                    <div class="value">${experienceMatch}%</div>
                    <div class="label">Experience</div>
                    <div class="progress-mini">
                        <div class="progress-fill" style="width: ${experienceMatch}%;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Quota Information -->
        <div class="detail-section">
            <div class="section-header">
                <h4><i class="fas fa-balance-scale" style="color: #8b5cf6;"></i> Affirmative Action Status</h4>
            </div>
            <div class="quota-grid">
                <div class="quota-item">
                    <div class="quota-icon"><i class="fas fa-seedling"></i></div>
                    <div class="quota-info">
                        <span class="quota-label">Rural Quota</span>
                        <span class="quota-value">${quota.rural || 0} filled</span>
                    </div>
                </div>
                <div class="quota-item">
                    <div class="quota-icon"><i class="fas fa-hands-helping"></i></div>
                    <div class="quota-info">
                        <span class="quota-label">SC Quota</span>
                        <span class="quota-value">${quota.sc || 0} filled</span>
                    </div>
                </div>
                <div class="quota-item">
                    <div class="quota-icon"><i class="fas fa-mountain"></i></div>
                    <div class="quota-info">
                        <span class="quota-label">ST Quota</span>
                        <span class="quota-value">${quota.st || 0} filled</span>
                    </div>
                </div>
                <div class="quota-item">
                    <div class="quota-icon"><i class="fas fa-users"></i></div>
                    <div class="quota-info">
                        <span class="quota-label">OBC Quota</span>
                        <span class="quota-value">${quota.obc || 0} filled</span>
                    </div>
                </div>
                <div class="quota-item">
                    <div class="quota-icon"><i class="fas fa-venus"></i></div>
                    <div class="quota-info">
                        <span class="quota-label">Female Quota</span>
                        <span class="quota-value">${quota.female || 0} filled</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="closeDetailsModal(event)">
                <i class="fas fa-times"></i> Close
            </button>
            <button class="btn btn-shortlist" onclick="showActionModal('shortlist', ${internship.id}, '${internship.title} • ${internship.company}')">
                <i class="fas fa-bookmark"></i> Shortlist
            </button>
            <button class="btn btn-accept" onclick="showActionModal('apply', ${internship.id}, '${internship.title} • ${internship.company}')">
                <i class="fas fa-paper-plane"></i> Apply Now
            </button>
            <button class="btn btn-outline" onclick="showFeedbackModal(${internship.id}, '${internship.title} • ${internship.company}', 'matching')">
                <i class="fas fa-comment-dots"></i> Feedback
            </button>
        </div>
    `;

    overlay.classList.add('active');
}

function closeDetailsModal(e) {
    document.getElementById('details-modal-overlay').classList.remove('active');
}

function applyToInternship(internshipId) {
    showNotification('🚀 Application submitted successfully!', 'success');
    closeDetailsModal();
}

function shortlistInternship(internshipId) {
    showNotification('🔖 Internship added to shortlist!', 'success');
    // You could add logic here to store shortlisted internships
    setTimeout(() => {
        showNotification('✨ You can view your shortlist in the dashboard', 'info');
    }, 1500);
}

// Action Confirmation Modal Functions
function showActionModal(actionType, internshipId, internshipTitle) {
    const overlay = document.getElementById('action-modal-overlay');
    const titleEl = document.getElementById('action-modal-title');
    const bodyEl = document.getElementById('action-modal-body');
    
    let actionIcon, actionText, actionColor, confirmButton;
    
    switch(actionType) {
        case 'apply':
            actionIcon = 'fas fa-paper-plane';
            actionText = 'Apply to this internship';
            actionColor = '#10b981';
            confirmButton = `<button class="btn btn-accept" onclick="confirmApply(${internshipId})"><i class="fas fa-check"></i> Confirm Application</button>`;
            break;
        case 'reject':
            actionIcon = 'fas fa-times-circle';
            actionText = 'Reject this internship';
            actionColor = '#ef4444';
            confirmButton = `<button class="btn btn-reject" onclick="confirmReject(${internshipId})"><i class="fas fa-times"></i> Confirm Rejection</button>`;
            break;
        case 'shortlist':
            actionIcon = 'fas fa-bookmark';
            actionText = 'Add to shortlist';
            actionColor = '#f59e0b';
            confirmButton = `<button class="btn btn-shortlist" onclick="confirmShortlist(${internshipId})"><i class="fas fa-bookmark"></i> Add to Shortlist</button>`;
            break;
        default:
            actionIcon = 'fas fa-question-circle';
            actionText = 'Confirm this action';
            actionColor = '#6366f1';
            confirmButton = `<button class="btn btn-primary" onclick="closeActionModal()"><i class="fas fa-check"></i> Confirm</button>`;
    }
    
    titleEl.innerHTML = `
        <i class="${actionIcon}" style="color: ${actionColor}; margin-right: 0.5rem;"></i>
        Confirm Action
    `;
    
    bodyEl.innerHTML = `
        <div class="action-confirmation">
            <div class="confirmation-icon">
                <i class="${actionIcon}" style="color: ${actionColor};"></i>
            </div>
            <div class="confirmation-content">
                <h4>Are you sure you want to ${actionText}?</h4>
                <p class="internship-name">
                    <i class="fas fa-briefcase"></i>
                    <strong>${internshipTitle}</strong>
                </p>
                <div class="confirmation-details">
                    ${actionType === 'apply' ? 
                        '<div class="detail-item"><i class="fas fa-info-circle"></i> Your profile will be submitted to the employer</div>' +
                        '<div class="detail-item"><i class="fas fa-bell"></i> You will receive updates about your application status</div>'
                        : actionType === 'reject' ?
                        '<div class="detail-item"><i class="fas fa-eye-slash"></i> This internship will be hidden from your matches</div>' +
                        '<div class="detail-item"><i class="fas fa-undo"></i> You can undo this action from settings</div>'
                        : actionType === 'shortlist' ?
                        '<div class="detail-item"><i class="fas fa-star"></i> This internship will be saved to your favorites</div>' +
                        '<div class="detail-item"><i class="fas fa-clock"></i> You can apply to shortlisted internships later</div>'
                        : '<div class="detail-item"><i class="fas fa-cog"></i> This action will be processed</div>'
                    }
                </div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeActionModal()">
                <i class="fas fa-times"></i> Cancel
            </button>
            ${confirmButton}
        </div>
    `;
    
    overlay.classList.add('active');
}

function closeActionModal() {
    document.getElementById('action-modal-overlay').classList.remove('active');
}

function confirmApply(internshipId) {
    applyToInternship(internshipId);
    closeActionModal();
}

function confirmReject(internshipId) {
    showNotification('❌ Internship rejected and hidden from matches', 'success');
    closeActionModal();
    // Add logic to hide the internship from the list
}

function confirmShortlist(internshipId) {
    shortlistInternship(internshipId);
    closeActionModal();
}

// Feedback Modal Functions
function showFeedbackModal(internshipId, internshipTitle, feedbackType = 'general') {
    const overlay = document.getElementById('feedback-modal-overlay');
    const titleEl = document.getElementById('feedback-modal-title');
    const bodyEl = document.getElementById('feedback-modal-body');
    
    let feedbackIcon, feedbackText;
    
    switch(feedbackType) {
        case 'application':
            feedbackIcon = 'fas fa-paper-plane';
            feedbackText = 'Application Experience';
            break;
        case 'matching':
            feedbackIcon = 'fas fa-search';
            feedbackText = 'Matching Quality';
            break;
        case 'general':
        default:
            feedbackIcon = 'fas fa-comment-dots';
            feedbackText = 'General Feedback';
    }
    
    titleEl.innerHTML = `
        <i class="${feedbackIcon}" style="color: #6366f1; margin-right: 0.5rem;"></i>
        ${feedbackText}
    `;
    
    bodyEl.innerHTML = `
        <div class="feedback-form">
            <div class="feedback-header">
                <div class="feedback-internship">
                    <i class="fas fa-briefcase"></i>
                    <span class="internship-title">${internshipTitle}</span>
                </div>
            </div>
            
            <div class="feedback-section">
                <h5><i class="fas fa-star"></i> Overall Rating</h5>
                <div class="rating-stars" id="overall-rating">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
                <span class="rating-text" id="rating-text">Click to rate</span>
            </div>
            
            <div class="feedback-section">
                <h5><i class="fas fa-list-check"></i> Quick Feedback</h5>
                <div class="quick-feedback">
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'accurate-match')">
                        <i class="fas fa-bullseye"></i> Accurate Match
                    </button>
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'good-description')">
                        <i class="fas fa-file-alt"></i> Clear Description
                    </button>
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'competitive-stipend')">
                        <i class="fas fa-rupee-sign"></i> Fair Stipend
                    </button>
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'good-company')">
                        <i class="fas fa-building"></i> Reputable Company
                    </button>
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'remote-friendly')">
                        <i class="fas fa-laptop"></i> Remote Options
                    </button>
                    <button class="quick-btn" onclick="toggleQuickFeedback(this, 'growth-opportunity')">
                        <i class="fas fa-chart-line"></i> Growth Potential
                    </button>
                </div>
            </div>
            
            <div class="feedback-section">
                <h5><i class="fas fa-comment"></i> Detailed Comments</h5>
                <textarea 
                    id="feedback-comments" 
                    placeholder="Share your thoughts about this internship, the matching quality, or any suggestions for improvement..."
                    rows="4"
                ></textarea>
            </div>
            
            <div class="feedback-section">
                <h5><i class="fas fa-lightbulb"></i> Suggestions</h5>
                <div class="suggestion-options">
                    <label class="checkbox-option">
                        <input type="checkbox" id="suggest-similar">
                        <span class="checkmark"></span>
                        Show me more similar internships
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="suggest-skills">
                        <span class="checkmark"></span>
                        Suggest skills to improve my matches
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="suggest-location">
                        <span class="checkmark"></span>
                        Expand location preferences
                    </label>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeFeedbackModal()">
                <i class="fas fa-times"></i> Cancel
            </button>
            <button class="btn btn-primary" onclick="submitFeedback(${internshipId})">
                <i class="fas fa-paper-plane"></i> Submit Feedback
            </button>
        </div>
    `;
    
    // Initialize rating system
    initializeRatingSystem();
    
    overlay.classList.add('active');
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal-overlay').classList.remove('active');
}

function initializeRatingSystem() {
    const stars = document.querySelectorAll('.rating-stars .star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            updateRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.getElementById('overall-rating').addEventListener('mouseleave', function() {
        const currentRating = getCurrentRating();
        highlightStars(currentRating);
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-stars .star');
    const ratingText = document.getElementById('rating-text');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    ratingText.textContent = rating > 0 ? ratingLabels[rating] : 'Click to rate';
}

function updateRating(rating) {
    highlightStars(rating);
    // Store the rating
    document.getElementById('overall-rating').dataset.rating = rating;
}

function getCurrentRating() {
    const ratingContainer = document.getElementById('overall-rating');
    return parseInt(ratingContainer.dataset.rating) || 0;
}

function toggleQuickFeedback(button, feedbackType) {
    button.classList.toggle('active');
}

function submitFeedback(internshipId) {
    const rating = getCurrentRating();
    const comments = document.getElementById('feedback-comments').value;
    const quickFeedback = Array.from(document.querySelectorAll('.quick-btn.active')).map(btn => 
        btn.textContent.trim()
    );
    const suggestions = {
        similar: document.getElementById('suggest-similar').checked,
        skills: document.getElementById('suggest-skills').checked,
        location: document.getElementById('suggest-location').checked
    };
    
    // Here you would normally send this data to your backend
    const feedbackData = {
        internshipId,
        rating,
        comments,
        quickFeedback,
        suggestions
    };
    
    console.log('Feedback submitted:', feedbackData);
    
    showNotification('✨ Thank you for your feedback! It helps us improve matching quality.', 'success');
    closeFeedbackModal();
    
    setTimeout(() => {
        showNotification('🎆 Your feedback has been recorded and will help improve future matches', 'info');
    }, 2000);
}

function viewMatchDetails(matchId) {
    viewInternshipDetails(parseInt(matchId.replace('match-', '')));
}

function goHome() {
    window.location.href = '../index.html';
}

// Navigation functions for PRAGATI-AI Premium Features
function openAIInterviewer() {
    showNotification('🤖 Opening AI Interview Assistant...', 'info');
    setTimeout(() => {
        window.location.href = 'ai-interview-assistant.html';
    }, 1000);
}

function openSkillGapAnalysis() {
    showNotification('🧠 Loading Skill Gap Analysis...', 'info');
    setTimeout(() => {
        window.location.href = 'skill-gap-analysis.html';
    }, 1000);
}

function openGamificationDashboard() {
    showNotification('🏆 Opening Achievement Dashboard...', 'info');
    setTimeout(() => {
        window.location.href = 'gamification-dashboard.html';
    }, 1000);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
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
        document.head.appendChild(styles);
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

// Demo functions for testing modals
function testActionModal() {
    showActionModal('apply', 1, 'Software Development Intern • Tech Corp');
}

function testFeedbackModal() {
    showFeedbackModal(1, 'Software Development Intern • Tech Corp', 'general');
}

// Add these functions to window for testing
window.testActionModal = testActionModal;
window.testFeedbackModal = testFeedbackModal;

console.log(`
🎓 PRAGATI-AI - Student Portal
═══════════════════════════════════════════════════════════════
🇮🇳 Predictive Real-time Allocation & Governance Assisted Talent Integrator
✨ Complete 12-step workflow prototype
🤖 AI-powered matching with quota compliance
🎯 Multi-step profile building & analysis
⚖️ Built-in affirmative action support

🗨️ Test the new modals:
- testActionModal() - Test confirmation modal
- testFeedbackModal() - Test feedback modal

Ready for Smart India Hackathon 2024! 🚀
`);
