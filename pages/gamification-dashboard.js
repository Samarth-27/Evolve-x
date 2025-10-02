// Gamification Dashboard JavaScript
class GamificationDashboard {
    constructor() {
        this.playerData = {};
        this.achievements = [];
        this.badges = [];
        this.challenges = [];
        this.leaderboard = [];
        
        this.initializeEventListeners();
        this.loadPlayerData();
        this.initializeAnimations();
    }
    
    initializeEventListeners() {
        // Badge filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterBadges(filter);
            });
        });
        
        // Leaderboard filter
        const leaderboardFilter = document.querySelector('.leaderboard-filter select');
        if (leaderboardFilter) {
            leaderboardFilter.addEventListener('change', (e) => {
                this.updateLeaderboard(e.target.value);
            });
        }
    }
    
    loadPlayerData() {
        // Simulate loading player data
        this.playerData = {
            name: 'Sachin Kumar',
            title: 'Aspiring Developer',
            level: 12,
            xp: 6800,
            xpToNext: 10000,
            globalRank: 15,
            stats: {
                dayStreak: 23,
                badgesEarned: 18,
                skillsMastered: 7,
                peersHelped: 156
            }
        };
        
        this.achievements = [
            {
                id: 1,
                title: 'Profile Perfectionist',
                description: 'Complete your profile 100%',
                icon: 'fas fa-rocket',
                xpReward: 500,
                timestamp: '2 hours ago',
                isNew: true,
                category: 'profile'
            },
            {
                id: 2,
                title: 'AI Interview Master',
                description: 'Score 90+ in AI interview',
                icon: 'fas fa-brain',
                xpReward: 750,
                timestamp: 'Yesterday',
                isNew: true,
                category: 'skills'
            },
            {
                id: 3,
                title: 'Network Builder',
                description: 'Connect with 50 professionals',
                icon: 'fas fa-handshake',
                xpReward: 300,
                timestamp: '3 days ago',
                isNew: false,
                category: 'social'
            }
        ];
        
        this.badges = [
            {
                id: 1,
                name: 'JavaScript Ninja',
                description: 'Master JavaScript fundamentals',
                icon: 'fab fa-js-square',
                category: 'skills',
                level: 'Gold',
                earned: true,
                progress: 100
            },
            {
                id: 2,
                name: 'React Developer',
                description: 'Build 3 React applications',
                icon: 'fab fa-react',
                category: 'skills',
                level: 'Silver',
                earned: true,
                progress: 100
            },
            {
                id: 3,
                name: 'Community Helper',
                description: 'Help 10 fellow students',
                icon: 'fas fa-comments',
                category: 'social',
                level: 'Bronze',
                earned: true,
                progress: 100
            },
            {
                id: 4,
                name: 'Database Expert',
                description: 'Complete database course',
                icon: 'fas fa-database',
                category: 'learning',
                level: null,
                earned: false,
                progress: 60
            },
            {
                id: 5,
                name: 'Cloud Architect',
                description: 'Get AWS certification',
                icon: 'fab fa-aws',
                category: 'skills',
                level: null,
                earned: false,
                progress: 20
            },
            {
                id: 6,
                name: 'Learning Streak',
                description: 'Learn for 30 days straight',
                icon: 'fas fa-fire-flame-curved',
                category: 'learning',
                level: null,
                earned: false,
                progress: 76
            }
        ];
        
        this.challenges = [
            {
                id: 1,
                title: 'Code Every Day',
                description: 'Complete at least one coding exercise',
                icon: 'fas fa-code',
                type: 'Daily',
                difficulty: 'Easy',
                progress: 85,
                current: 17,
                total: 20,
                reward: '500 XP + Coding Streak Badge',
                active: true
            },
            {
                id: 2,
                title: 'Networking Pro',
                description: 'Connect with 5 industry professionals',
                icon: 'fas fa-users',
                type: 'Weekly',
                difficulty: 'Medium',
                progress: 40,
                current: 2,
                total: 5,
                reward: '750 XP + Network Builder Badge',
                active: true
            },
            {
                id: 3,
                title: 'Skill Master',
                description: 'Master a new technical skill this month',
                icon: 'fas fa-brain',
                type: 'Monthly',
                difficulty: 'Hard',
                progress: 25,
                current: 7,
                total: 30,
                reward: '1000 XP + Skill Master Badge',
                active: false
            }
        ];
        
        this.leaderboard = [
            {
                rank: 1,
                name: 'Priya Sharma',
                college: 'IIT Delhi',
                xp: 15420,
                level: 18,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rank1'
            },
            {
                rank: 2,
                name: 'Arjun Kumar',
                college: 'BITS Pilani',
                xp: 14850,
                level: 17,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rank2'
            },
            {
                rank: 3,
                name: 'Anjali Gupta',
                college: 'NIT Trichy',
                xp: 13920,
                level: 16,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rank3'
            },
            {
                rank: 15,
                name: 'Sachin Kumar (You)',
                college: 'Your College',
                xp: 6800,
                level: 12,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
                isCurrentUser: true
            }
        ];
        
        this.updateUI();
    }
    
    updateUI() {
        this.updatePlayerCard();
        this.updateStatsGrid();
        this.updateAchievements();
        this.updateBadges();
        this.updateLeaderboard();
        this.updateChallenges();
    }
    
    updatePlayerCard() {
        const playerCard = document.querySelector('.player-card');
        if (!playerCard) return;
        
        // Update XP progress
        const xpFill = playerCard.querySelector('.xp-fill');
        const xpText = playerCard.querySelector('.xp-text');
        
        if (xpFill && xpText) {
            const xpPercentage = (this.playerData.xp / this.playerData.xpToNext) * 100;
            xpFill.style.width = xpPercentage + '%';
            xpText.textContent = `${this.playerData.xp.toLocaleString()} / ${this.playerData.xpToNext.toLocaleString()} XP`;
        }
    }
    
    updateStatsGrid() {
        const statCards = document.querySelectorAll('.stat-card');
        const stats = [
            this.playerData.stats.dayStreak,
            this.playerData.stats.badgesEarned,
            this.playerData.stats.skillsMastered,
            this.playerData.stats.peersHelped
        ];
        
        statCards.forEach((card, index) => {
            const h4 = card.querySelector('h4');
            if (h4 && stats[index] !== undefined) {
                this.animateNumber(h4, 0, stats[index], 1000);
            }
        });
    }
    
    updateAchievements() {
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (!achievementsGrid) return;
        
        achievementsGrid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.isNew ? 'new' : ''}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-meta">
                        <span class="xp-reward">+${achievement.xpReward} XP</span>
                        <span class="timestamp">${achievement.timestamp}</span>
                    </div>
                </div>
                ${achievement.isNew ? '<div class="achievement-glow"></div>' : ''}
            </div>
        `).join('');
    }
    
    updateBadges() {
        const badgesGrid = document.querySelector('.badges-grid');
        if (!badgesGrid) return;
        
        badgesGrid.innerHTML = this.badges.map(badge => `
            <div class="badge-card ${badge.earned ? 'earned' : 'locked'} ${badge.category}" data-category="${badge.category}">
                <div class="badge-icon">
                    <i class="${badge.icon}"></i>
                </div>
                <h4>${badge.name}</h4>
                <p>${badge.description}</p>
                ${badge.earned 
                    ? `<div class="badge-level">${badge.level}</div>` 
                    : `<div class="badge-progress">${badge.progress}%</div>`
                }
            </div>
        `).join('');
    }
    
    updateLeaderboard(filter = 'global') {
        const leaderboard = document.querySelector('.leaderboard');
        if (!leaderboard) return;
        
        // Filter leaderboard based on selection
        let filteredData = [...this.leaderboard];
        if (filter === 'college') {
            // In a real app, this would filter by user's college
            filteredData = filteredData.filter(player => 
                player.college === 'Your College' || player.rank <= 3
            );
        }
        
        leaderboard.innerHTML = filteredData.map(player => `
            <div class="leaderboard-item ${player.rank <= 3 ? `rank-${player.rank}` : ''} ${player.isCurrentUser ? 'current-user' : ''}">
                <div class="rank-badge">
                    ${player.rank === 1 ? '<i class="fas fa-crown"></i>' : ''}
                    <span>${player.rank}</span>
                </div>
                <div class="player-info">
                    <img src="${player.avatar}" alt="Avatar">
                    <div>
                        <h4>${player.name}</h4>
                        <p>${player.college}</p>
                    </div>
                </div>
                <div class="player-stats">
                    <span class="xp">${player.xp.toLocaleString()} XP</span>
                    <span class="level">Lv. ${player.level}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateChallenges() {
        const challengesGrid = document.querySelector('.challenges-grid');
        if (!challengesGrid) return;
        
        challengesGrid.innerHTML = this.challenges.map(challenge => `
            <div class="challenge-card ${challenge.active ? 'active' : ''}">
                <div class="challenge-header">
                    <div class="challenge-icon">
                        <i class="${challenge.icon}"></i>
                    </div>
                    <div class="challenge-meta">
                        <span class="challenge-type">${challenge.type}</span>
                        <span class="challenge-difficulty">${challenge.difficulty}</span>
                    </div>
                </div>
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${challenge.progress}%"></div>
                    </div>
                    <span>${challenge.current}/${challenge.total} ${challenge.type === 'Daily' ? 'days' : challenge.type === 'Weekly' ? 'connections' : 'days'}</span>
                </div>
                <div class="challenge-reward">
                    <span>${challenge.reward}</span>
                </div>
            </div>
        `).join('');
    }
    
    filterBadges(category) {
        const badges = document.querySelectorAll('.badge-card');
        
        badges.forEach(badge => {
            if (category === 'all' || badge.dataset.category === category) {
                badge.style.display = 'block';
                badge.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    initializeAnimations() {
        // Animate progress bars on load
        setTimeout(() => {
            const progressBars = document.querySelectorAll('.progress-fill, .xp-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width || '0%';
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 500);
        
        // Add entrance animations
        const cards = document.querySelectorAll('.achievement-card, .badge-card, .leaderboard-item, .challenge-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions
let gamificationDashboard;

function viewAllAchievements() {
    gamificationDashboard.showNotification('🏆 Full achievements page coming soon!', 'info');
}

function goBack() {
    window.location.href = 'student-portal.html';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    gamificationDashboard = new GamificationDashboard();
    
    // Add notification and animation styles
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
            align-items: center;
            color: white;
            font-weight: 500;
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
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});

console.log(`
🏆 Gamification Dashboard Loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Features:
- Real-time XP and level tracking
- Interactive achievement system
- Dynamic badge collection
- Global leaderboards
- Challenge progress tracking
- Smooth animations and transitions

Ready to level up your learning journey! 🚀
`);