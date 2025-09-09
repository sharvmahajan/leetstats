/**
 * LeetCode Statistics Dashboard
 * Professional implementation with proper error handling and UX
 */

class LeetCodeStats {
    constructor() {
        this.apiUrl = 'https://leetcode-stats-api.herokuapp.com';
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements = {
            usernameInput: document.getElementById('username'),
            searchButton: document.getElementById('search-btn'),
            errorMessage: document.getElementById('error-message'),
            loadingSpinner: document.getElementById('loading-spinner'),
            userRank: document.getElementById('user-rank'),
            totalSolved: document.getElementById('total-solved'),
            progressCircle: document.getElementById('progress-circle'),
            easySolved: document.getElementById('easy-solved'),
            easyTotal: document.getElementById('easy-total'),
            easyProgress: document.getElementById('easy-progress'),
            mediumSolved: document.getElementById('medium-solved'),
            mediumTotal: document.getElementById('medium-total'),
            mediumProgress: document.getElementById('medium-progress'),
            hardSolved: document.getElementById('hard-solved'),
            hardTotal: document.getElementById('hard-total'),
            hardProgress: document.getElementById('hard-progress')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.elements.searchButton.addEventListener('click', () => this.handleSearch());
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        this.elements.usernameInput.addEventListener('input', () => this.clearError());
    }

    /**
     * Handle search button click
     */
    async handleSearch() {
        const username = this.elements.usernameInput.value.trim();
        
        if (!username) {
            this.showError('Please enter a username');
            return;
        }

        if (this.isLoading) {
            return;
        }

        await this.fetchUserStats(username);
    }

    /**
     * Fetch user statistics from API
     * @param {string} username - LeetCode username
     */
    async fetchUserStats(username) {
        this.setLoadingState(true);
        this.clearError();

        try {
            const response = await fetch(`${this.apiUrl}/${username}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.status !== 'success') {
                throw new Error('User not found');
            }

            this.updateUI(data);
            
        } catch (error) {
            console.error('Error fetching user stats:', error);
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Update UI with fetched data
     * @param {Object} data - API response data
     */
    updateUI(data) {
        const stats = this.extractStats(data);
        
        // Update rank
        this.elements.userRank.textContent = `Rank: #${stats.ranking}`;
        
        // Update total solved
        this.elements.totalSolved.textContent = stats.totalSolved.toString();
        
        // Update difficulty stats
        this.updateDifficultyStats('easy', stats.easy);
        this.updateDifficultyStats('medium', stats.medium);
        this.updateDifficultyStats('hard', stats.hard);
        
        // Update progress circle
        this.updateProgressCircle(stats.totalSolved, stats.totalQuestions);
    }

    /**
     * Extract and normalize stats from API response
     * @param {Object} data - Raw API response
     * @returns {Object} Normalized stats object
     */
    extractStats(data) {
        return {
            ranking: data.ranking || '--',
            totalSolved: data.totalSolved || 0,
            totalQuestions: data.totalQuestions || 1,
            easy: {
                solved: data.easySolved || 0,
                total: data.totalEasy || 0
            },
            medium: {
                solved: data.mediumSolved || 0,
                total: data.totalMedium || 0
            },
            hard: {
                solved: data.hardSolved || 0,
                total: data.totalHard || 0
            }
        };
    }

    /**
     * Update difficulty-specific UI elements
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @param {Object} stats - Solved and total counts
     */
    updateDifficultyStats(difficulty, stats) {
        const solvedElement = this.elements[`${difficulty}Solved`];
        const totalElement = this.elements[`${difficulty}Total`];
        const progressElement = this.elements[`${difficulty}Progress`];

        if (solvedElement) solvedElement.textContent = stats.solved.toString();
        if (totalElement) totalElement.textContent = stats.total.toString();
        
        if (progressElement && stats.total > 0) {
            const percentage = (stats.solved / stats.total) * 100;
            progressElement.style.width = `${percentage}%`;
        }
    }

    /**
     * Update circular progress indicator
     * @param {number} solved - Number of problems solved
     * @param {number} total - Total number of problems
     */
    updateProgressCircle(solved, total) {
        if (total === 0) return;
        
        const percentage = Math.min((solved / total) * 100, 100);
        const progressCircle = this.elements.progressCircle;
        
        progressCircle.style.background = `conic-gradient(
            var(--primary-color) 0% ${percentage}%, 
            #e2e8f0 ${percentage}% 100%
        )`;
    }

    /**
     * Set loading state
     * @param {boolean} loading - Whether to show loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.elements.searchButton.classList.add('loading');
            this.elements.searchButton.disabled = true;
        } else {
            this.elements.searchButton.classList.remove('loading');
            this.elements.searchButton.disabled = false;
        }
    }

    /**
     * Handle and display errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        let message = 'An error occurred. Please try again.';
        
        if (error.message === 'User not found') {
            message = 'User not found. Please check the username and try again.';
        } else if (error.message.includes('Failed to fetch')) {
            message = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('HTTP error')) {
            message = 'Server error. Please try again later.';
        }
        this.showError(message);
    }

    /**
     * Display error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.add('show');

        // Reset rank & total solved
        this.elements.userRank.textContent = "Rank: --";
        this.elements.totalSolved.textContent = "0";

        // Reset Easy stats
        this.elements.easySolved.textContent = "0";
        this.elements.easyTotal.textContent = "0";
        this.elements.easyProgress.style.width = "0%";

        // Reset Medium stats
        this.elements.mediumSolved.textContent = "0";
        this.elements.mediumTotal.textContent = "0";
        this.elements.mediumProgress.style.width = "0%";

        // Reset Hard stats
        this.elements.hardSolved.textContent = "0";
        this.elements.hardTotal.textContent = "0";
        this.elements.hardProgress.style.width = "0%";

        // Reset overall progress circle
        this.elements.progressCircle.style.background = `conic-gradient(
            var(--primary-color) 0% 0%, 
            #e2e8f0 0% 100%
        )`;
    }

    /**
     * Clear error message
     */
    clearError() {
        this.elements.errorMessage.classList.remove('show');
        this.elements.errorMessage.textContent = '';
    }
}

/**
 * Utility functions
 */
const Utils = {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Validate username format
     * @param {string} username - Username to validate
     * @returns {boolean} Whether username is valid
     */
    isValidUsername(username) {
        const trimmed = username.trim();
        return trimmed.length > 0 && trimmed.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
    }
};

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if all required elements exist
    const requiredElements = [
        'username', 'search-btn', 'error-message', 'user-rank', 
        'total-solved', 'progress-circle'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        return;
    }
    
    // Initialize the application
    new LeetCodeStats();
});

// Handle application errors globally
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});