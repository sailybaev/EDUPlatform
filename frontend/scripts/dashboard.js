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
});

async function loadUserProfile() {
    try {
        const response = await fetch('http://localhost:3000/api/user/profile', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const user = await response.json();
        
        document.querySelector('.card-title.mb-1').textContent = `${user.name} ${user.surname}`;
        document.querySelector('.card-text.text-muted.mb-2').textContent = `${user.school || 'School'} | ${user.class || 'Class'}`;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadReadingProgress() {
    try {
        const response = await fetch('http://localhost:3000/api/reading/progress', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const progress = await response.json();
        
        const progressBar = document.querySelector('.progress-bar');
        const booksRead = document.querySelector('p.mb-1');
        
        if (progress.totalBooks > 0) {
            const percentage = (progress.completedBooks / progress.totalBooks) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
            booksRead.textContent = `${progress.completedBooks} books read`;
        }
    } catch (error) {
        console.error('Error loading reading progress:', error);
    }
}

async function loadUpcomingTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks/upcoming', {
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
        const response = await fetch('http://localhost:3000/api/exams/performance', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const performance = await response.json();
        
        // Update performance cards here
    } catch (error) {
        console.error('Error loading performance:', error);
    }
}