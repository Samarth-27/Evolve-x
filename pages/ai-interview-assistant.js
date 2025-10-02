// AI Interview Assistant JavaScript
class AIInterviewAssistant {
    constructor() {
        this.isInterviewActive = false;
        this.isPaused = false;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.startTime = null;
        this.questionStartTime = null;
        this.responses = [];
        this.skillAnalytics = [];
        this.currentSkill = 'python';
        this.metrics = {
            confidence: 85,
            clarity: 92,
            responseTime: 2.3,
            contentQuality: 78
        };
        this.feedbackItems = [];
        this.recognition = null;
        this.speechSynthesis = window.speechSynthesis;
        
        this.initializeSpeechRecognition();
        this.initializeEventListeners();
        this.loadQuestions();
    }
    
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                document.getElementById('mic-btn').classList.add('active');
                document.querySelector('.speech-status').textContent = 'Listening...';
                this.animateMicVisualization(true);
            };
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.processResponse(finalTranscript);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
            };
            
            this.recognition.onend = () => {
                this.stopListening();
            };
        } else {
            console.log('Speech recognition not supported in this browser');
        }
    }
    
    stopListening() {
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) {
            micBtn.classList.remove('active');
        }
        const speechStatus = document.querySelector('.speech-status');
        if (speechStatus) {
            speechStatus.textContent = 'Click microphone to start speaking';
        }
        this.animateMicVisualization(false);
    }
    
    initializeEventListeners() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Duration selection
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    loadQuestions() {
        this.questionBank = {
            // Python Programming Questions
            python: {
                beginner: [
                    "What is Python and why is it popular for programming?",
                    "Explain the difference between lists and tuples in Python.",
                    "How do you handle exceptions in Python? Give an example.",
                    "What are Python dictionaries and when would you use them?",
                    "Explain the concept of indentation in Python.",
                    "What is the difference between '==' and 'is' in Python?",
                    "How do you create and use functions in Python?"
                ],
                intermediate: [
                    "Explain list comprehensions in Python with examples.",
                    "What are decorators in Python and how do you use them?",
                    "Describe the difference between shallow and deep copy.",
                    "How do you work with files in Python?",
                    "Explain the concept of generators and yield keyword.",
                    "What is the Global Interpreter Lock (GIL) in Python?",
                    "How do you handle multiple inheritance in Python?"
                ],
                advanced: [
                    "Explain metaclasses in Python and when to use them.",
                    "How would you optimize Python code for better performance?",
                    "Describe the difference between multiprocessing and multithreading.",
                    "How do you implement design patterns in Python?",
                    "Explain context managers and the 'with' statement.",
                    "How would you build a RESTful API using Python frameworks?"
                ]
            },
            // JavaScript Questions
            javascript: {
                beginner: [
                    "What is JavaScript and where is it used?",
                    "Explain the difference between var, let, and const.",
                    "What are JavaScript data types?",
                    "How do you create and call functions in JavaScript?",
                    "What is the DOM and how do you manipulate it?",
                    "Explain event handling in JavaScript."
                ],
                intermediate: [
                    "What is closure in JavaScript? Give an example.",
                    "Explain hoisting in JavaScript.",
                    "What are promises and how do they work?",
                    "Describe the difference between == and === operators.",
                    "How do you handle asynchronous operations in JavaScript?",
                    "What is the 'this' keyword and how does it work?"
                ],
                advanced: [
                    "Explain the event loop in JavaScript.",
                    "What are prototypes and prototype inheritance?",
                    "How do you implement module patterns in JavaScript?",
                    "Explain async/await and how it differs from promises.",
                    "How would you optimize JavaScript performance?"
                ]
            },
            // Java Questions
            java: {
                beginner: [
                    "What is Java and what are its main features?",
                    "Explain the concept of Object-Oriented Programming in Java.",
                    "What is the difference between JDK, JRE, and JVM?",
                    "How do you handle exceptions in Java?",
                    "What are access modifiers in Java?",
                    "Explain the concept of inheritance in Java."
                ],
                intermediate: [
                    "What are interfaces and abstract classes in Java?",
                    "Explain the concept of polymorphism with examples.",
                    "What is the difference between ArrayList and LinkedList?",
                    "How does garbage collection work in Java?",
                    "What are Java Collections and which ones do you use most?",
                    "Explain multithreading in Java."
                ],
                advanced: [
                    "What are generics in Java and why are they useful?",
                    "Explain the concept of design patterns in Java.",
                    "How do you optimize Java application performance?",
                    "What is the difference between synchronized and concurrent collections?",
                    "How would you implement a microservice architecture in Java?"
                ]
            },
            // React.js Questions
            react: {
                beginner: [
                    "What is React and why is it popular?",
                    "Explain the concept of components in React.",
                    "What is JSX and how is it different from HTML?",
                    "How do you handle events in React?",
                    "What are props in React?",
                    "Explain the concept of state in React components."
                ],
                intermediate: [
                    "What is the difference between class and functional components?",
                    "Explain React hooks and give examples of useState and useEffect.",
                    "How do you handle forms in React?",
                    "What is the virtual DOM and how does it work?",
                    "How do you pass data between components?",
                    "What is conditional rendering in React?"
                ],
                advanced: [
                    "Explain React Context API and when to use it.",
                    "How do you optimize React application performance?",
                    "What are higher-order components (HOCs)?",
                    "How would you implement state management with Redux?",
                    "Explain React Router and navigation in single-page applications."
                ]
            },
            // SQL and Database Questions
            sql: {
                beginner: [
                    "What is SQL and why is it important?",
                    "Explain the difference between SQL and NoSQL databases.",
                    "What are the basic SQL commands you know?",
                    "How do you create a table in SQL?",
                    "What is the difference between WHERE and HAVING clauses?",
                    "Explain primary keys and foreign keys."
                ],
                intermediate: [
                    "What are JOINs in SQL? Explain different types.",
                    "How do you optimize SQL query performance?",
                    "What is database normalization and why is it important?",
                    "Explain the concept of indexing in databases.",
                    "What are stored procedures and functions?",
                    "How do you handle transactions in SQL?"
                ],
                advanced: [
                    "Explain ACID properties in database transactions.",
                    "How would you design a database schema for an e-commerce application?",
                    "What are window functions in SQL?",
                    "How do you handle database replication and sharding?",
                    "Explain different isolation levels in databases."
                ]
            },
            // Data Science Questions
            'data-science': {
                beginner: [
                    "What is data science and what does a data scientist do?",
                    "Explain the difference between supervised and unsupervised learning.",
                    "What are the steps in a typical data science project?",
                    "How do you handle missing data in a dataset?",
                    "What is the difference between classification and regression?",
                    "Explain what data visualization is and why it's important."
                ],
                intermediate: [
                    "What are some common machine learning algorithms you know?",
                    "How do you evaluate the performance of a machine learning model?",
                    "Explain cross-validation and why it's important.",
                    "What is feature engineering and why is it crucial?",
                    "How do you handle categorical variables in machine learning?",
                    "What is overfitting and how do you prevent it?"
                ],
                advanced: [
                    "Explain the bias-variance tradeoff in machine learning.",
                    "How would you build and deploy a machine learning pipeline?",
                    "What are ensemble methods and when would you use them?",
                    "How do you handle class imbalance in classification problems?",
                    "Explain deep learning and neural networks."
                ]
            },
            // HR and Behavioral Questions
            hr: {
                beginner: [
                    "Tell me about yourself and your technical journey.",
                    "Why are you interested in this internship opportunity?",
                    "What are your greatest strengths as a developer?",
                    "How do you stay updated with new technologies?",
                    "Describe a challenging project you worked on recently.",
                    "Where do you see yourself in your tech career?"
                ]
            },
            behavioral: {
                beginner: [
                    "Describe a time when you had to learn a new technology quickly.",
                    "Tell me about a time you faced a difficult coding problem.",
                    "How do you handle working in a team on coding projects?",
                    "Describe a situation where you had to debug complex code.",
                    "What motivates you to write clean, maintainable code?",
                    "How do you handle code reviews and feedback?"
                ]
            }
        };
        
        // Skill-specific answer keywords for analysis
        this.answerKeywords = {
            python: {
                excellent: ['list comprehension', 'generator', 'decorator', 'exception handling', 'pandas', 'numpy', 'django', 'flask'],
                good: ['function', 'class', 'loop', 'dictionary', 'list', 'tuple', 'import', 'module'],
                basic: ['print', 'variable', 'if', 'else', 'python']
            },
            javascript: {
                excellent: ['closure', 'promise', 'async await', 'prototype', 'hoisting', 'event loop', 'callback'],
                good: ['function', 'variable', 'array', 'object', 'dom', 'event', 'json'],
                basic: ['javascript', 'html', 'css', 'browser', 'web']
            },
            java: {
                excellent: ['polymorphism', 'inheritance', 'interface', 'abstract', 'generics', 'collections', 'multithreading'],
                good: ['class', 'object', 'method', 'constructor', 'exception', 'array', 'string'],
                basic: ['java', 'main', 'system.out.println', 'public', 'static']
            },
            react: {
                excellent: ['hooks', 'useeffect', 'usestate', 'context', 'redux', 'virtual dom', 'jsx'],
                good: ['component', 'props', 'state', 'render', 'event', 'form'],
                basic: ['react', 'html', 'javascript', 'web', 'ui']
            },
            sql: {
                excellent: ['join', 'index', 'normalization', 'transaction', 'stored procedure', 'trigger'],
                good: ['select', 'insert', 'update', 'delete', 'where', 'group by', 'order by'],
                basic: ['database', 'table', 'sql', 'data', 'query']
            },
            'data-science': {
                excellent: ['machine learning', 'neural network', 'feature engineering', 'cross validation', 'overfitting'],
                good: ['algorithm', 'model', 'training', 'testing', 'data cleaning', 'visualization'],
                basic: ['data', 'analysis', 'statistics', 'python', 'excel']
            }
        };
    }
    
    startInterview() {
        // Validate selections first
        const interviewType = document.getElementById('interview-type').value;
        const skillFocus = document.getElementById('skill-focus').value;
        const difficultyBtn = document.querySelector('.difficulty-btn.active');
        const durationBtn = document.querySelector('.duration-btn.active');
        
        if (!difficultyBtn) {
            this.showNotification('⚠️ Please select a difficulty level', 'warning');
            return;
        }
        
        if (!durationBtn) {
            this.showNotification('⚠️ Please select a session duration', 'warning');
            return;
        }
        
        this.isInterviewActive = true;
        this.startTime = Date.now();
        this.currentQuestion = 0;
        this.responses = [];
        this.skillAnalytics = [];
        
        // Get selected options
        const difficulty = difficultyBtn.dataset.level;
        const duration = parseInt(durationBtn.dataset.duration);
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        
        // Store current skill for analysis
        this.currentSkill = skillFocus;
        
        // Update UI
        document.querySelector('.status-text').textContent = `${skillName} interview in progress...`;
        document.querySelector('.btn-start').style.display = 'none';
        
        // Start timer
        this.startTimer();
        
        // Ask first question
        this.askQuestion();
        
        // Update progress
        this.updateProgress();
        
        this.showNotification(`🎯 ${skillName} interview started! Good luck!`, 'success');
    }
    
    askQuestion() {
        const interviewType = document.getElementById('interview-type').value;
        const skillFocus = document.getElementById('skill-focus').value;
        const difficulty = document.querySelector('.difficulty-btn.active').dataset.level;
        
        // Determine which question bank to use
        let questionBank;
        if (interviewType === 'technical') {
            questionBank = this.questionBank[skillFocus] || this.questionBank.python;
        } else {
            questionBank = this.questionBank[interviewType];
        }
        
        const questions = questionBank[difficulty] || questionBank.beginner;
        const question = questions[this.currentQuestion % questions.length];
        
        // Store current skill for analysis
        this.currentSkill = skillFocus;
        this.questionStartTime = Date.now();
        
        // Update question display with skill context
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        document.querySelector('.current-question h4').textContent = `${skillName} - Question ${this.currentQuestion + 1}`;
        document.querySelector('.current-question p').textContent = question;
        
        // Speak the question
        this.speakText(`${skillName} question ${this.currentQuestion + 1}: ${question}`);
        
        // Add specific feedback
        this.addFeedback(`${skillName} question presented`, 'neutral');
        
        // Update progress
        this.updateProgress();
    }
    
    speakText(text) {
        if (this.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            utterance.onstart = () => {
                document.querySelector('.speaking-indicator').style.opacity = '1';
                this.animateAvatar(true);
            };
            
            utterance.onend = () => {
                document.querySelector('.speaking-indicator').style.opacity = '0';
                this.animateAvatar(false);
            };
            
            this.speechSynthesis.speak(utterance);
        }
    }
    
    processResponse(response) {
        // Check if interview is paused
        if (this.isPaused) {
            this.showNotification('⏸️ Interview is paused. Resume to continue.', 'warning');
            return;
        }
        
        const responseTime = (Date.now() - this.questionStartTime) / 1000;
        
        // Store response
        this.responses.push({
            question: this.currentQuestion,
            response: response,
            responseTime: responseTime,
            timestamp: Date.now()
        });
        
        // Analyze response
        this.analyzeResponse(response, responseTime);
        
        // Move to next question
        setTimeout(() => {
            if (!this.isPaused) {
                this.nextQuestion();
            }
        }, 2000);
    }
    
    analyzeResponse(response, responseTime) {
        const wordCount = response.split(' ').length;
        const responseText = response.toLowerCase();
        
        // Skill-specific content analysis
        const skillAnalysis = this.analyzeSkillSpecificContent(responseText, this.currentSkill);
        
        // Calculate metrics based on multiple factors
        const responseTimeScore = Math.min(100, Math.max(60, 100 - (responseTime - 2) * 10));
        const lengthScore = Math.min(100, Math.max(40, wordCount * 2));
        const skillScore = skillAnalysis.score;
        
        const confidence = Math.round((responseTimeScore + lengthScore + skillScore) / 3);
        const clarity = Math.min(100, Math.max(70, 100 - Math.max(0, responseTime - 3) * 8));
        const contentQuality = Math.round((lengthScore + skillScore) / 2);
        
        // Update metrics with weighted average
        this.metrics.confidence = Math.round((this.metrics.confidence * 0.7) + (confidence * 0.3));
        this.metrics.clarity = Math.round((this.metrics.clarity * 0.7) + (clarity * 0.3));
        this.metrics.responseTime = ((this.metrics.responseTime * 0.7) + (responseTime * 0.3)).toFixed(1);
        this.metrics.contentQuality = Math.round((this.metrics.contentQuality * 0.7) + (contentQuality * 0.3));
        
        // Update UI
        this.updateMetrics();
        
        // Generate skill-specific feedback
        this.generateSkillSpecificFeedback(skillAnalysis, responseTime, wordCount);
    }
    
    analyzeSkillSpecificContent(responseText, skill) {
        const keywords = this.answerKeywords[skill] || this.answerKeywords.python;
        let score = 50; // Base score
        let level = 'basic';
        let matchedKeywords = [];
        
        // Check for excellent keywords
        const excellentMatches = keywords.excellent.filter(keyword => 
            responseText.includes(keyword.toLowerCase())
        );
        
        // Check for good keywords
        const goodMatches = keywords.good.filter(keyword => 
            responseText.includes(keyword.toLowerCase())
        );
        
        // Check for basic keywords
        const basicMatches = keywords.basic.filter(keyword => 
            responseText.includes(keyword.toLowerCase())
        );
        
        // Calculate score based on keyword matches
        if (excellentMatches.length > 0) {
            score += excellentMatches.length * 15;
            level = 'excellent';
            matchedKeywords = excellentMatches;
        } else if (goodMatches.length > 0) {
            score += goodMatches.length * 10;
            level = 'good';
            matchedKeywords = goodMatches;
        } else if (basicMatches.length > 0) {
            score += basicMatches.length * 5;
            level = 'basic';
            matchedKeywords = basicMatches;
        }
        
        // Cap the score at 100
        score = Math.min(100, score);
        
        return {
            score: score,
            level: level,
            matchedKeywords: matchedKeywords,
            excellentCount: excellentMatches.length,
            goodCount: goodMatches.length,
            basicCount: basicMatches.length
        };
    }
    
    generateSkillSpecificFeedback(skillAnalysis, responseTime, wordCount) {
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        
        // Response time feedback
        if (responseTime < 2) {
            this.addFeedback('⚡ Excellent response time!', 'good');
        } else if (responseTime > 15) {
            this.addFeedback('⏱️ Take your time, but try to be more concise', 'neutral');
        }
        
        // Skill-specific content feedback
        if (skillAnalysis.level === 'excellent') {
            this.addFeedback(`🎆 Outstanding ${skillName} knowledge demonstrated!`, 'good');
            if (skillAnalysis.matchedKeywords.length > 0) {
                this.addFeedback(`💪 Used advanced concepts: ${skillAnalysis.matchedKeywords.slice(0,2).join(', ')}`, 'good');
            }
        } else if (skillAnalysis.level === 'good') {
            this.addFeedback(`👍 Good ${skillName} understanding shown`, 'good');
            this.addFeedback('📈 Try mentioning more advanced concepts next time', 'neutral');
        } else if (skillAnalysis.level === 'basic') {
            this.addFeedback(`📝 Basic ${skillName} knowledge detected`, 'neutral');
            this.addFeedback('📅 Consider studying more advanced topics', 'neutral');
        } else {
            this.addFeedback(`🤔 Could you elaborate more on ${skillName} concepts?`, 'neutral');
        }
        
        // Length feedback
        if (wordCount > 80) {
            this.addFeedback('💬 Very detailed response!', 'good');
        } else if (wordCount < 15) {
            this.addFeedback('📝 Try to provide more detailed explanations', 'neutral');
        }
        
        // Store analysis for final results
        if (!this.skillAnalytics) {
            this.skillAnalytics = [];
        }
        this.skillAnalytics.push({
            question: this.currentQuestion,
            skillAnalysis: skillAnalysis,
            responseTime: responseTime,
            wordCount: wordCount
        });
    }
    
    updateMetrics() {
        document.getElementById('confidence-score').textContent = this.metrics.confidence;
        document.getElementById('response-time').textContent = this.metrics.responseTime + 's';
        document.getElementById('speech-clarity').textContent = this.metrics.clarity;
        document.getElementById('content-quality').textContent = this.metrics.contentQuality;
    }
    
    addFeedback(message, type) {
        const feedbackList = document.getElementById('live-feedback');
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${type}`;
        
        const icon = type === 'good' ? 'fas fa-check-circle' : 
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 
                    'fas fa-info-circle';
        
        feedbackItem.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        feedbackList.appendChild(feedbackItem);
        
        // Limit to 5 feedback items
        while (feedbackList.children.length > 5) {
            feedbackList.removeChild(feedbackList.firstChild);
        }
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (feedbackItem.parentNode) {
                feedbackItem.remove();
            }
        }, 10000);
    }
    
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.endInterview();
        } else {
            this.askQuestion();
        }
    }
    
    endInterview() {
        this.isInterviewActive = false;
        this.stopTimer();
        
        // Update status
        document.querySelector('.status-text').textContent = 'Interview completed!';
        
        // Show results
        this.showResults();
        
        this.showNotification('🎉 Interview completed successfully!', 'success');
    }
    
    showResults() {
        const modal = document.getElementById('results-modal');
        const resultsContainer = modal.querySelector('.results-summary');
        
        const totalTime = Math.round((Date.now() - this.startTime) / 1000 / 60);
        const avgResponseTime = this.responses.reduce((sum, r) => sum + r.responseTime, 0) / this.responses.length;
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        
        // Calculate skill-specific analytics
        const skillStats = this.calculateSkillStatistics();
        const overallSkillLevel = this.determineOverallSkillLevel(skillStats);
        
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>🏆 ${skillName} Interview Analysis</h4>
                <p>Comprehensive analysis of your ${skillName} interview performance</p>
                <div class="overall-grade ${overallSkillLevel.class}">
                    <span class="grade">${overallSkillLevel.grade}</span>
                    <span class="grade-label">${overallSkillLevel.label}</span>
                </div>
            </div>
            
            <div class="results-metrics">
                <div class="result-card">
                    <div class="result-icon"><i class="fas fa-brain"></i></div>
                    <div class="result-info">
                        <span class="result-value">${skillStats.averageSkillScore}%</span>
                        <span class="result-label">${skillName} Proficiency</span>
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon"><i class="fas fa-comments"></i></div>
                    <div class="result-info">
                        <span class="result-value">${this.metrics.confidence}%</span>
                        <span class="result-label">Interview Confidence</span>
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon"><i class="fas fa-clock"></i></div>
                    <div class="result-info">
                        <span class="result-value">${avgResponseTime.toFixed(1)}s</span>
                        <span class="result-label">Avg Response Time</span>
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-icon"><i class="fas fa-star"></i></div>
                    <div class="result-info">
                        <span class="result-value">${this.metrics.contentQuality}%</span>
                        <span class="result-label">Content Quality</span>
                    </div>
                </div>
            </div>
            
            <div class="skill-breakdown">
                <h5>📊 ${skillName} Knowledge Breakdown</h5>
                <div class="skill-levels">
                    <div class="skill-level">
                        <span class="level-label">Advanced Concepts</span>
                        <div class="level-bar">
                            <div class="level-fill excellent" style="width: ${(skillStats.excellentCount / this.responses.length) * 100}%"></div>
                        </div>
                        <span class="level-count">${skillStats.excellentCount} questions</span>
                    </div>
                    <div class="skill-level">
                        <span class="level-label">Intermediate Concepts</span>
                        <div class="level-bar">
                            <div class="level-fill good" style="width: ${(skillStats.goodCount / this.responses.length) * 100}%"></div>
                        </div>
                        <span class="level-count">${skillStats.goodCount} questions</span>
                    </div>
                    <div class="skill-level">
                        <span class="level-label">Basic Concepts</span>
                        <div class="level-bar">
                            <div class="level-fill basic" style="width: ${(skillStats.basicCount / this.responses.length) * 100}%"></div>
                        </div>
                        <span class="level-count">${skillStats.basicCount} questions</span>
                    </div>
                </div>
            </div>
            
            <div class="results-recommendations">
                <h5>🎯 Personalized Recommendations</h5>
                <ul>
                    ${this.generatePersonalizedRecommendations(skillStats, skillName).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="results-actions">
                <button class="btn btn-secondary" onclick="aiAssistant.retakeInterview()">
                    <i class="fas fa-redo"></i> Retake Interview
                </button>
                <button class="btn btn-primary" onclick="aiAssistant.saveResults()">
                    <i class="fas fa-download"></i> Download Report
                </button>
                <button class="btn btn-success" onclick="aiAssistant.shareResults()">
                    <i class="fas fa-share"></i> Share Results
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    calculateSkillStatistics() {
        if (!this.skillAnalytics || this.skillAnalytics.length === 0) {
            return { averageSkillScore: 70, excellentCount: 0, goodCount: 0, basicCount: 0 };
        }
        
        const totalScore = this.skillAnalytics.reduce((sum, analysis) => sum + analysis.skillAnalysis.score, 0);
        const averageSkillScore = Math.round(totalScore / this.skillAnalytics.length);
        
        const excellentCount = this.skillAnalytics.filter(a => a.skillAnalysis.level === 'excellent').length;
        const goodCount = this.skillAnalytics.filter(a => a.skillAnalysis.level === 'good').length;
        const basicCount = this.skillAnalytics.filter(a => a.skillAnalysis.level === 'basic').length;
        
        return {
            averageSkillScore,
            excellentCount,
            goodCount,
            basicCount
        };
    }
    
    determineOverallSkillLevel(stats) {
        const score = stats.averageSkillScore;
        
        if (score >= 90) {
            return { grade: 'A+', label: 'Expert Level', class: 'grade-excellent' };
        } else if (score >= 80) {
            return { grade: 'A', label: 'Advanced', class: 'grade-excellent' };
        } else if (score >= 70) {
            return { grade: 'B+', label: 'Intermediate+', class: 'grade-good' };
        } else if (score >= 60) {
            return { grade: 'B', label: 'Intermediate', class: 'grade-good' };
        } else if (score >= 50) {
            return { grade: 'C+', label: 'Basic+', class: 'grade-basic' };
        } else {
            return { grade: 'C', label: 'Beginner', class: 'grade-basic' };
        }
    }
    
    generatePersonalizedRecommendations(stats, skillName) {
        const recommendations = [];
        
        if (stats.excellentCount === 0) {
            recommendations.push(`📈 Study advanced ${skillName} concepts like frameworks and design patterns`);
        }
        
        if (stats.averageSkillScore < 70) {
            recommendations.push(`📚 Focus on strengthening your ${skillName} fundamentals`);
        }
        
        if (this.metrics.responseTime > 8) {
            recommendations.push(`⏱️ Practice explaining ${skillName} concepts more concisely`);
        }
        
        // Skill-specific recommendations
        const skill = this.currentSkill;
        if (skill === 'python') {
            recommendations.push('🐍 Practice Python coding challenges on platforms like LeetCode or HackerRank');
            if (stats.excellentCount < 2) {
                recommendations.push('🔍 Learn advanced Python concepts: decorators, generators, context managers');
            }
        } else if (skill === 'javascript') {
            recommendations.push('🌐 Build more JavaScript projects to demonstrate practical knowledge');
            if (stats.excellentCount < 2) {
                recommendations.push('🔄 Master async programming: promises, async/await, and event loop');
            }
        } else if (skill === 'react') {
            recommendations.push('⚙️ Create React projects showcasing hooks and state management');
            if (stats.excellentCount < 2) {
                recommendations.push('📱 Learn React ecosystem: Redux, React Router, testing libraries');
            }
        }
        
        recommendations.push('🎓 Consider taking online courses or certifications in your chosen technology');
        recommendations.push('🤝 Practice mock interviews to improve confidence and communication');
        
        return recommendations;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.startTime) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.querySelector('.timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    updateProgress() {
        const progress = (this.currentQuestion / this.totalQuestions) * 100;
        document.getElementById('interview-progress').style.width = progress + '%';
        document.getElementById('current-q').textContent = this.currentQuestion + 1;
        document.getElementById('total-q').textContent = this.totalQuestions;
    }
    
    animateMicVisualization(active) {
        const waves = document.querySelectorAll('.wave');
        waves.forEach((wave, index) => {
            if (active) {
                wave.style.animation = `wave 1.5s infinite ease-in-out ${index * 0.1}s`;
                wave.style.background = '#ef4444';
            } else {
                wave.style.animation = 'none';
                wave.style.background = '#6366f1';
                wave.style.height = '10px';
            }
        });
    }
    
    animateAvatar(speaking) {
        const mouth = document.querySelector('.mouth');
        if (speaking) {
            mouth.style.animation = 'mouthMove 0.5s infinite alternate';
        } else {
            mouth.style.animation = 'none';
        }
    }
    
    showNotification(message, type) {
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
    
    retakeInterview() {
        this.isInterviewActive = false;
        this.currentQuestion = 0;
        this.responses = [];
        this.skillAnalytics = [];
        this.stopTimer();
        
        // Reset UI
        document.querySelector('.status-text').textContent = 'Ready to start interview';
        document.querySelector('.current-question h4').textContent = 'Welcome to your AI-powered interview session!';
        document.querySelector('.current-question p').textContent = 'Select your skill focus and click "Start Interview" to begin.';
        document.querySelector('.btn-start').style.display = 'block';
        document.querySelector('.timer').textContent = '00:00';
        document.getElementById('interview-progress').style.width = '0%';
        document.getElementById('current-q').textContent = '1';
        
        // Reset metrics
        this.metrics = {
            confidence: 85,
            clarity: 92,
            responseTime: 2.3,
            contentQuality: 78
        };
        this.updateMetrics();
        
        // Close modal
        document.getElementById('results-modal').classList.remove('active');
        
        this.showNotification('🔄 Interview reset! Ready for another attempt.', 'info');
    }
    
    saveResults() {
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        const skillStats = this.calculateSkillStatistics();
        const overallSkillLevel = this.determineOverallSkillLevel(skillStats);
        
        const reportData = {
            skillName: skillName,
            overallGrade: overallSkillLevel.grade,
            skillProficiency: skillStats.averageSkillScore,
            confidence: this.metrics.confidence,
            contentQuality: this.metrics.contentQuality,
            averageResponseTime: (this.responses.reduce((sum, r) => sum + r.responseTime, 0) / this.responses.length).toFixed(1),
            date: new Date().toLocaleDateString(),
            recommendations: this.generatePersonalizedRecommendations(skillStats, skillName)
        };
        
        // Create downloadable report
        const reportText = `
${skillName} Interview Analysis Report
${'='.repeat(50)}
Date: ${reportData.date}
Overall Grade: ${reportData.overallGrade}
Skill Proficiency: ${reportData.skillProficiency}%
Interview Confidence: ${reportData.confidence}%
Content Quality: ${reportData.contentQuality}%
Average Response Time: ${reportData.averageResponseTime}s

Recommendations:
${reportData.recommendations.map(rec => `- ${rec.replace(/�[�-�🌀-�🐀-�🤀-�]/g, '').trim()}`).join('\n')}

Generated by PRAGATI-AI Interview Assistant
        `;
        
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skillName}-Interview-Report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('💾 Interview report downloaded successfully!', 'success');
    }
    
    shareResults() {
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        const skillStats = this.calculateSkillStatistics();
        const overallSkillLevel = this.determineOverallSkillLevel(skillStats);
        
        const shareText = `I just completed a ${skillName} interview with PRAGATI-AI! 🏆

📊 My Results:
• Overall Grade: ${overallSkillLevel.grade} (${overallSkillLevel.label})
• ${skillName} Proficiency: ${skillStats.averageSkillScore}%
• Interview Confidence: ${this.metrics.confidence}%

#PRAGATI-AI #InterviewPrep #${skillName.replace(/\s+/g, '')}`;
        
        if (navigator.share) {
            navigator.share({
                title: `${skillName} Interview Results`,
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Results copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('⚠️ Could not copy to clipboard', 'warning');
            });
        }
    }
}

// Global functions
let aiAssistant;

function startInterview() {
    aiAssistant.startInterview();
}

function toggleMicrophone() {
    if (!aiAssistant || !aiAssistant.isInterviewActive) {
        aiAssistant.showNotification('⚠️ Please start the interview first!', 'warning');
        return;
    }
    
    if (aiAssistant.recognition) {
        const micBtn = document.getElementById('mic-btn');
        if (micBtn.classList.contains('active')) {
            aiAssistant.recognition.stop();
            micBtn.classList.remove('active');
            document.querySelector('.speech-status').textContent = 'Click microphone to start speaking';
            aiAssistant.animateMicVisualization(false);
        } else {
            try {
                aiAssistant.recognition.start();
            } catch (error) {
                aiAssistant.showNotification('⚠️ Microphone access denied or not available', 'warning');
            }
        }
    } else {
        aiAssistant.showNotification('⚠️ Speech recognition not supported in this browser', 'warning');
    }
}

function toggleSpeaker() {
    const btn = document.getElementById('speaker-btn');
    const isMuted = btn.classList.contains('muted');
    
    if (isMuted) {
        aiAssistant.speechSynthesis.cancel();
        btn.classList.remove('muted');
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        btn.classList.add('muted');
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

function pauseInterview() {
    if (!aiAssistant || !aiAssistant.isInterviewActive) {
        aiAssistant.showNotification('⚠️ No active interview to pause', 'warning');
        return;
    }
    
    // Toggle pause state
    aiAssistant.isPaused = !aiAssistant.isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    
    if (aiAssistant.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.querySelector('.status-text').textContent = 'Interview paused';
        aiAssistant.showNotification('⏸️ Interview paused', 'info');
        
        // Stop speech recognition if active
        if (aiAssistant.recognition && document.getElementById('mic-btn').classList.contains('active')) {
            aiAssistant.recognition.stop();
        }
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        const skillName = document.getElementById('skill-focus').options[document.getElementById('skill-focus').selectedIndex].text;
        document.querySelector('.status-text').textContent = `${skillName} interview in progress...`;
        aiAssistant.showNotification('▶️ Interview resumed', 'success');
    }
}

function submitTextResponse() {
    if (!aiAssistant || !aiAssistant.isInterviewActive) {
        aiAssistant.showNotification('⚠️ Please start the interview first!', 'warning');
        return;
    }
    
    const textarea = document.getElementById('text-response');
    const response = textarea.value.trim();
    
    if (response) {
        aiAssistant.processResponse(response);
        textarea.value = '';
        aiAssistant.showNotification('✅ Response submitted!', 'success');
    } else {
        aiAssistant.showNotification('⚠️ Please enter your response first!', 'warning');
    }
}

function closeResults() {
    document.getElementById('results-modal').classList.remove('active');
}

function goBack() {
    window.location.href = 'student-portal.html';
}

// Additional functions for the new buttons
function retakeInterview() {
    if (aiAssistant) {
        aiAssistant.retakeInterview();
    }
}

function saveResults() {
    if (aiAssistant) {
        aiAssistant.saveResults();
    }
}

function shareResults() {
    if (aiAssistant) {
        aiAssistant.shareResults();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    aiAssistant = new AIInterviewAssistant();
    
    // Add some CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
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
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes mouthMove {
            0% { transform: scaleY(1); }
            100% { transform: scaleY(0.5); }
        }
        
        /* Enhanced Results Modal Styles */
        .overall-grade {
            text-align: center;
            margin: 1.5rem 0;
            padding: 1rem;
            border-radius: 1rem;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .grade {
            font-size: 3rem;
            font-weight: bold;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .grade-excellent .grade { color: #10b981; }
        .grade-good .grade { color: #3b82f6; }
        .grade-basic .grade { color: #f59e0b; }
        
        .grade-label {
            font-size: 1.1rem;
            font-weight: 600;
            opacity: 0.8;
        }
        
        .results-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .result-card {
            background: white;
            padding: 1.5rem;
            border-radius: 1rem;
            text-align: center;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .result-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .result-icon {
            font-size: 2rem;
            color: #6366f1;
            margin-bottom: 0.5rem;
        }
        
        .result-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #1e293b;
            display: block;
        }
        
        .result-label {
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 0.5rem;
        }
        
        .skill-breakdown {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 1rem;
            margin: 2rem 0;
        }
        
        .skill-breakdown h5 {
            margin-bottom: 1.5rem;
            color: #1e293b;
        }
        
        .skill-level {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .level-label {
            min-width: 140px;
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
        }
        
        .level-bar {
            flex: 1;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .level-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 1s ease;
        }
        
        .level-fill.excellent { background: linear-gradient(90deg, #10b981, #34d399); }
        .level-fill.good { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .level-fill.basic { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        
        .level-count {
            min-width: 80px;
            text-align: right;
            font-size: 0.85rem;
            color: #6b7280;
            font-weight: 500;
        }
        
        .results-recommendations {
            background: #fffbeb;
            padding: 1.5rem;
            border-radius: 1rem;
            border: 2px solid #fde68a;
            margin: 2rem 0;
        }
        
        .results-recommendations h5 {
            color: #92400e;
            margin-bottom: 1rem;
        }
        
        .results-recommendations ul {
            list-style: none;
            padding: 0;
        }
        
        .results-recommendations li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #fde68a;
            color: #78350f;
            font-weight: 500;
        }
        
        .results-recommendations li:last-child {
            border-bottom: none;
        }
        
        .results-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 2rem;
        }
        
        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        
        /* Modal Overlay Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal {
            background: white;
            border-radius: 1rem;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9) translateY(-50px);
            transition: all 0.3s ease;
        }
        
        .modal-overlay.active .modal {
            transform: scale(1) translateY(0);
        }
        
        .modal-header {
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            color: #6b7280;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .modal-close:hover {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .modal-body {
            padding: 1rem 2rem 2rem;
        }
    `;
    document.head.appendChild(style);
});

// Debug: Check if all functions are properly exported
console.log('📝 Debug: Checking function availability:');
console.log('- startInterview:', typeof startInterview);
console.log('- toggleMicrophone:', typeof toggleMicrophone);
console.log('- toggleSpeaker:', typeof toggleSpeaker);
console.log('- pauseInterview:', typeof pauseInterview);
console.log('- submitTextResponse:', typeof submitTextResponse);
console.log('- retakeInterview:', typeof retakeInterview);
console.log('- saveResults:', typeof saveResults);
console.log('- shareResults:', typeof shareResults);

console.log(`
🤖 AI Interview Assistant Loaded & Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Enhanced Features:
- Skill-specific question banks (Python, JS, Java, React, SQL, Data Science)
- Intelligent keyword-based answer analysis
- Real-time performance metrics
- Comprehensive graded results with recommendations
- Speech recognition and synthesis
- Professional interview reports

🔍 Instructions:
1. Select your programming skill focus
2. Choose difficulty and duration
3. Click 'Start Interview'
4. Answer using voice or text input
5. Get detailed analysis and recommendations

Ready to ace your technical interview! 🚀
`);
