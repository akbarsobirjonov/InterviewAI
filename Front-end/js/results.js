// ===== RESULTS PAGE LOGIC =====
window.addEventListener("DOMContentLoaded", async () => {
    // Get results from sessionStorage
    const resultsData = sessionStorage.getItem('interviewResults');
    
    if (!resultsData) {
        alert('No interview results found! Please complete an interview first.');
        window.location.href = 'professions.html';
        return;
    }

    const { profession, evaluation } = JSON.parse(resultsData);

    // Update profession name
    const professionNames = {
        'frontend': 'Frontend Developer',
        'backend': 'Backend Developer',
        'designer': 'UI/UX Designer',
        'product-manager': 'Product Manager',
        'marketing-manager': 'Marketing Manager',
        'data-scientist': 'Data Scientist'
    };

    const professionName = professionNames[profession] || profession;
    document.getElementById('professionName').textContent = professionName;

    // Render all results
    renderScoreSummary(evaluation.averageScore);
    renderSkillRatings(evaluation.skillRatings);
    renderStrengths(evaluation.strengths);
    renderWeakPoints(evaluation.weakPoints);
    renderRecommendations(evaluation.recommendations);
});

// ===== RENDER FUNCTIONS =====
function renderScoreSummary(average) {
    const scoreElement = document.getElementById('averageScore');
    if (scoreElement) {
        scoreElement.textContent = `${average}/10`;
        
        // Add color based on score
        const scoreValue = parseFloat(average);
        if (scoreValue >= 8) {
            scoreElement.style.color = '#10b981'; // green
        } else if (scoreValue >= 6) {
            scoreElement.style.color = '#f59e0b'; // yellow
        } else {
            scoreElement.style.color = '#ef4444'; // red
        }
    }
}

function renderSkillRatings(ratings) {
    const container = document.getElementById('skillRatings');
    if (!container || !ratings) return;
    
    container.innerHTML = '';
    
    for (const [skill, score] of Object.entries(ratings)) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${skill}</span>
            <span style="font-weight: 600;">${score}/10</span>
        `;
        container.appendChild(li);
    }
}

function renderStrengths(list) {
    const container = document.getElementById('strengthsList');
    if (!container || !list) return;
    
    container.innerHTML = '';
    
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.style.color = '#10b981'; // green
        container.appendChild(li);
    });
}

function renderWeakPoints(list) {
    const container = document.getElementById('weakPointsList');
    if (!container || !list) return;
    
    container.innerHTML = '';
    
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.style.color = '#f59e0b'; // orange
        container.appendChild(li);
    });
}

function renderRecommendations(list) {
    const container = document.getElementById('recommendationsList');
    if (!container || !list) return;
    
    container.innerHTML = '';
    
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
    });
}

// ===== BUTTON ACTIONS =====
const backHomeBtn = document.getElementById('backHomeBtn');
if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
        sessionStorage.removeItem('interviewResults');
        window.location.href = '../index.html';
    });
}

const tryAgainBtn = document.getElementById('tryAgainBtn');
if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
        const resultsData = sessionStorage.getItem('interviewResults');
        if (resultsData) {
            const { profession } = JSON.parse(resultsData);
            sessionStorage.removeItem('interviewResults');
            window.location.href = `chat.html?profession=${profession}`;
        } else {
            window.location.href = 'professions.html';
        }
    });
}