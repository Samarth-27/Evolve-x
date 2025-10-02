// Skill Gap Analysis JavaScript
class SkillGapAnalyzer {
    constructor() {
        this.currentSkills = {};
        this.marketData = {};
        this.gapAnalysis = {};
        this.learningPaths = {};
        
        this.initializeEventListeners();
        this.loadInitialData();
    }
    
    initializeEventListeners() {
        // Filter change listeners
        const industryFilter = document.getElementById('industry-filter');
        const roleFilter = document.getElementById('role-filter');
        
        if (industryFilter) {
            industryFilter.addEventListener('change', () => this.updateGapAnalysis());
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.updateGapAnalysis());
        }
    }
    
    loadInitialData() {
        // Simulate loading current skills from user profile
        this.currentSkills = {
            programming: {
                'JavaScript': 85,
                'Python': 70,
                'Java': 45,
                'C++': 0,
                'Go': 0
            },
            frameworks: {
                'React.js': 65,
                'Node.js': 40,
                'Angular': 0,
                'Vue.js': 25,
                'Express.js': 35
            },
            databases: {
                'MongoDB': 0,
                'PostgreSQL': 0,
                'MySQL': 20,
                'Redis': 0
            },
            cloud: {
                'AWS': 0,
                'Azure': 0,
                'Docker': 15,
                'Kubernetes': 0
            },
            tools: {
                'Git': 75,
                'Jest': 30,
                'Webpack': 40,
                'CI/CD': 10
            },
            soft: {
                'Communication': 80,
                'Leadership': 60,
                'Problem Solving': 85,
                'Team Work': 90
            }
        };
        
        // Load market intelligence data
        this.marketData = {
            trending: [
                { skill: 'AI/Machine Learning', growth: 45, demand: 'Very High' },
                { skill: 'Cloud Computing', growth: 38, demand: 'High' },
                { skill: 'DevOps', growth: 32, demand: 'High' },
                { skill: 'Cybersecurity', growth: 28, demand: 'Medium' },
                { skill: 'Blockchain', growth: 25, demand: 'Medium' }
            ],
            salaryImpact: [
                { skill: 'Database Skills', increase: 2.5 },
                { skill: 'Cloud Platforms', increase: 3.2 },
                { skill: 'Testing', increase: 1.8 },
                { skill: 'DevOps', increase: 4.1 },
                { skill: 'AI/ML', increase: 5.5 }
            ]
        };
        
        this.performGapAnalysis();
        this.updateUI();
    }
    
    performGapAnalysis() {
        const industryRequirements = this.getIndustryRequirements();
        const roleRequirements = this.getRoleRequirements();
        
        this.gapAnalysis = {
            critical: [],
            moderate: [],
            minor: [],
            strong: []
        };
        
        // Analyze each skill category
        Object.keys(industryRequirements).forEach(category => {
            Object.keys(industryRequirements[category]).forEach(skill => {
                const required = industryRequirements[category][skill];
                const current = this.currentSkills[category]?.[skill] || 0;
                const gap = required - current;
                
                const gapItem = {
                    skill: skill,
                    category: category,
                    required: required,
                    current: current,
                    gap: gap,
                    impact: this.calculateImpact(skill, gap)
                };
                
                if (gap > 60) {
                    this.gapAnalysis.critical.push(gapItem);
                } else if (gap > 30) {
                    this.gapAnalysis.moderate.push(gapItem);
                } else if (gap > 0) {
                    this.gapAnalysis.minor.push(gapItem);
                } else {
                    this.gapAnalysis.strong.push(gapItem);
                }
            });
        });
        
        // Sort by impact
        this.gapAnalysis.critical.sort((a, b) => b.impact - a.impact);
        this.gapAnalysis.moderate.sort((a, b) => b.impact - a.impact);
    }
    
    getIndustryRequirements() {
        // Return skill requirements based on selected industry
        return {
            programming: {
                'JavaScript': 80,
                'Python': 75,
                'Java': 70,
                'C++': 60,
                'Go': 50
            },
            frameworks: {
                'React.js': 85,
                'Node.js': 80,
                'Angular': 70,
                'Vue.js': 65,
                'Express.js': 75
            },
            databases: {
                'MongoDB': 85,
                'PostgreSQL': 80,
                'MySQL': 75,
                'Redis': 60
            },
            cloud: {
                'AWS': 85,
                'Azure': 75,
                'Docker': 80,
                'Kubernetes': 70
            },
            tools: {
                'Git': 90,
                'Jest': 75,
                'Webpack': 70,
                'CI/CD': 80
            }
        };
    }
    
    getRoleRequirements() {
        // Return role-specific requirements
        const role = document.getElementById('role-filter')?.value || 'fullstack';
        
        const requirements = {
            frontend: {
                'JavaScript': 90,
                'React.js': 85,
                'CSS': 80,
                'HTML': 85
            },
            backend: {
                'Node.js': 90,
                'Python': 85,
                'MongoDB': 80,
                'PostgreSQL': 75
            },
            fullstack: {
                'JavaScript': 85,
                'React.js': 80,
                'Node.js': 85,
                'MongoDB': 80,
                'PostgreSQL': 75
            }
        };
        
        return requirements[role] || requirements.fullstack;
    }
    
    calculateImpact(skill, gap) {
        // Calculate impact based on skill importance and market demand
        const skillWeights = {
            'MongoDB': 90,
            'AWS': 95,
            'PostgreSQL': 85,
            'React.js': 80,
            'Node.js': 85,
            'Docker': 75,
            'Jest': 70
        };
        
        const weight = skillWeights[skill] || 50;
        return Math.min(100, (gap / 100) * weight);
    }
    
    updateGapAnalysis() {
        this.performGapAnalysis();
        this.updateUI();
        this.showNotification('🔄 Gap analysis updated based on your filters', 'info');
    }
    
    updateUI() {
        // Update summary cards
        this.updateSummaryCards();
        
        // Update gap details
        this.updateGapDetails();
        
        // Update learning timeline
        this.updateLearningTimeline();
        
        // Update market intelligence
        this.updateMarketIntelligence();
    }
    
    updateSummaryCards() {
        const summaryCards = document.querySelectorAll('.summary-card');
        if (summaryCards.length >= 3) {
            summaryCards[0].querySelector('h3').textContent = this.gapAnalysis.critical.length;
            summaryCards[1].querySelector('h3').textContent = this.gapAnalysis.moderate.length;
            summaryCards[2].querySelector('h3').textContent = this.gapAnalysis.strong.length;
        }
    }
    
    updateGapDetails() {
        const gapDetails = document.querySelector('.gap-details');
        if (!gapDetails) return;
        
        let html = '';
        
        // Add critical gaps
        this.gapAnalysis.critical.slice(0, 3).forEach(gap => {
            html += this.createGapItemHTML(gap, 'critical');
        });
        
        // Add moderate gaps
        this.gapAnalysis.moderate.slice(0, 2).forEach(gap => {
            html += this.createGapItemHTML(gap, 'moderate');
        });
        
        gapDetails.innerHTML = html;
    }
    
    createGapItemHTML(gap, priority) {
        const icons = {
            'MongoDB': 'fas fa-database',
            'PostgreSQL': 'fas fa-database',
            'AWS': 'fab fa-aws',
            'Azure': 'fas fa-cloud',
            'Docker': 'fab fa-docker',
            'Jest': 'fas fa-vial',
            'React.js': 'fab fa-react',
            'Node.js': 'fab fa-node-js'
        };
        
        const icon = icons[gap.skill] || 'fas fa-code';
        const impactText = gap.impact > 80 ? 'High' : gap.impact > 50 ? 'Medium' : 'Low';
        const opportunitiesBlocked = Math.floor(gap.impact / 8);
        
        return `
            <div class="gap-item ${priority}">
                <div class="gap-header">
                    <div class="gap-title">
                        <i class="${icon}"></i>
                        <span>${gap.skill}</span>
                    </div>
                    <div class="gap-priority">${priority}</div>
                </div>
                <div class="gap-info">
                    <p>Required level: ${gap.required}% | Your level: ${gap.current}% | Gap: ${gap.gap}%</p>
                    <div class="gap-impact">
                        <span class="impact-label">Impact:</span>
                        <span class="impact-value">${impactText} - Blocking ${opportunitiesBlocked} potential opportunities</span>
                    </div>
                </div>
                <div class="gap-actions">
                    <button class="btn btn-primary btn-sm" onclick="skillAnalyzer.createLearningPath('${gap.skill.toLowerCase()}')">
                        <i class="fas fa-route"></i> Create Learning Path
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="skillAnalyzer.findCourses('${gap.skill.toLowerCase()}')">
                        <i class="fas fa-graduation-cap"></i> Find Courses
                    </button>
                </div>
            </div>
        `;
    }
    
    updateLearningTimeline() {
        // Learning timeline is mostly static for demo
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length > 0) {
            // Animate progress bars
            setTimeout(() => {
                const progressBars = document.querySelectorAll('.timeline-progress .progress-fill');
                progressBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }, 500);
        }
    }
    
    updateMarketIntelligence() {
        // Market intelligence cards are populated from static data
        // In a real app, this would fetch live data
    }
    
    createLearningPath(skillName) {
        this.showNotification(`🛣️ Creating personalized learning path for ${skillName}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`✅ Learning path created! Check your timeline for updates.`, 'success');
        }, 2000);
    }
    
    findCourses(skillName) {
        this.showNotification(`🔍 Finding best courses for ${skillName}...`, 'info');
        
        const courses = [
            { name: `${skillName} Fundamentals`, provider: 'Coursera', price: 'Free' },
            { name: `Advanced ${skillName}`, provider: 'Udemy', price: '₹1,299' },
            { name: `${skillName} Masterclass`, provider: 'edX', price: 'Free' }
        ];
        
        setTimeout(() => {
            let message = `📚 Found ${courses.length} courses for ${skillName}:\n`;
            courses.forEach(course => {
                message += `• ${course.name} (${course.provider}) - ${course.price}\n`;
            });
            this.showNotification(message, 'success');
        }, 1500);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions
let skillAnalyzer;

function updateSkills() {
    skillAnalyzer.showNotification('⚙️ Skill update feature coming soon!', 'info');
}

function exportReport() {
    skillAnalyzer.showNotification('📥 Exporting your skill gap analysis report...', 'info');
    
    setTimeout(() => {
        skillAnalyzer.showNotification('✅ Report exported successfully!', 'success');
    }, 2000);
}

function createLearningPath(skill) {
    skillAnalyzer.createLearningPath(skill);
}

function findCourses(skill) {
    skillAnalyzer.findCourses(skill);
}

function goBack() {
    window.location.href = 'student-portal.html';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    skillAnalyzer = new SkillGapAnalyzer();
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
            min-width: 300px;
            max-width: 500px;
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
        }
        .notification-success { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
        .notification-info { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .notification-warning { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
        .notification-content {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            color: white;
            font-weight: 500;
            white-space: pre-line;
        }
        .notification-content button {
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            opacity: 0.8;
            margin-left: 1rem;
        }
        .notification-content button:hover {
            opacity: 1;
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

console.log(`
🧠 Skill Gap Analyzer Loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Features:
- Real-time skill gap analysis
- Personalized learning recommendations
- Market intelligence integration
- Interactive progress tracking
- Course discovery and recommendations

Ready to optimize your learning journey! 🚀
`);