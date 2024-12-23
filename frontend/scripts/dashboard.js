const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    loadUserProfile();
    loadReadingProgress();
    loadUpcomingEvents();
    loadPerformanceCards();

    document.querySelector('.logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

});

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/user/profile`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const user = await response.json();
        
        const studentNameElement = document.getElementById('studentName');
        const studentDetailsElement = document.getElementById('studentDetails');
        
        studentNameElement.textContent = `${user.user.name} ${user.user.surname}`;
        studentDetailsElement.textContent = `${user.user.school || 'School'} | ${user.user.class || 'Class'}`;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadReadingProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/reading/progress`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const progress = await response.json();
        
        const progressBarElement = document.getElementById('readingProgressBar');
        const booksReadElement = document.getElementById('booksReadCount');
        
        if (progress.totalBooks > 0) {
            const percentage = (progress.completedBooks / progress.totalBooks) * 100;
            progressBarElement.style.width = `${percentage}%`;
            progressBarElement.textContent = `${percentage}%`;
            booksReadElement.textContent = `${progress.completedBooks} books read`;
        }
    } catch (error) {
        console.error('Error loading reading progress:', error);
    }
}


function getDaysLeft(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}


async function loadUpcomingEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/events/upcoming`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        const eventsContainer = document.getElementById('upcomingEventsContainer');

        eventsContainer.innerHTML = data.events.map(event => `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${new Date(event.date).toLocaleDateString()}</h6>
                    <p class="card-text">${event.description}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

async function loadPerformanceCards() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/performance`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        const performanceContainer = document.getElementById('performanceCardsContainer');

        performanceContainer.innerHTML = data.performance.map(item => `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${item.subject}</h5>
                    <p class="card-text">Score: ${item.score}%</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading performance cards:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}
