// TODO: add server side IP address

const API_BASE_URL = CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    loadUserProfile();
    loadReadingProgress();
    loadUpcomingTasks();
    loadAcademicPerformance();

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

async function loadUpcomingTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/tasks/upcoming`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const tasks = await response.json();
        
        const tasksContainer = document.querySelector('.d-flex.overflow-auto');
        tasksContainer.innerHTML = tasks.map(task => `
            <div class="card text-center" style="min-width: 200px; flex: 0 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                <div class="card-header text-white" style="background-color: #007bff; border-radius: 8px 8px 0 0;">
                    ${new Date(task.dueDate).toLocaleDateString()}
                </div>
                <div class="card-body">
                    <h6 class="card-title">${task.title}</h6>
                    <p class="card-text"><small class="text-muted">${getDaysLeft(task.dueDate)} day(s) left</small></p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function getDaysLeft(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

async function loadAcademicPerformance() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/exams/performance`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
            console.log('Performance data:', data.performance);
        }
    } catch (error) {
        console.error('Error loading performance:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}
