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
    loadUserTickets();

    document.querySelector('.logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    document.querySelector('#view-profile').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/pages/profile.html';
    });

    document.querySelector('#getHelp').addEventListener('click', (e) => {
        e.preventDefault();
        showHelpModal();
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
async function submitTicket() {
    const subject = document.getElementById('ticketSubject').value;
    const description = document.getElementById('ticketDescription').value;
    const priority = document.getElementById('ticketPriority').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ subject, description, priority })
        });

        const data = await response.json();
        if (data.success) {
            alert('Ticket submitted successfully');
            const modal = bootstrap.Modal.getInstance(document.getElementById('helpModal'));
            modal.hide();
        } else {
            alert('Failed to submit ticket');
        }
    } catch (error) {
        console.error('Error submitting ticket:', error);
        alert('An error occurred while submitting the ticket');
    }
}

function showHelpModal() {
    const modalHtml = `
        <div class="modal fade" id="helpModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Get Help</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="helpForm">
                            <div class="mb-3">
                                <label class="form-label">Subject</label>
                                <input type="text" class="form-control" id="ticketSubject" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="ticketDescription" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Priority</label>
                                <select class="form-select" id="ticketPriority">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="submitTicket">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('helpModal'));
    modal.show();

    document.getElementById('submitTicket').addEventListener('click', submitTicket);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}

async function loadUserTickets() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/tickets`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const ticketsContainer = document.getElementById('ticketsContainer');
            ticketsContainer.innerHTML = data.tickets.map(ticket => `
                <div class="card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">${ticket.subject}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">
                            Status: <span class="badge ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
                        </h6>
                        <p class="card-text">${ticket.description}</p>
                        <p class="card-text">
                            <small class="text-muted">
                                Priority: <span class="badge ${getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span>
                            </small>
                        </p>
                        <button class="btn btn-sm btn-primary view-responses" data-ticket-id="${ticket._id}">
                            View Responses (${ticket.responses.length})
                        </button>
                    </div>
                </div>
            `).join('');

            // Add event listeners for viewing responses
            document.querySelectorAll('.view-responses').forEach(button => {
                button.addEventListener('click', () => viewTicketResponses(button.dataset.ticketId));
            });
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

function getStatusBadgeClass(status) {
    const classes = {
        'open': 'bg-warning',
        'in-progress': 'bg-info',
        'closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'low': 'bg-success',
        'medium': 'bg-warning',
        'high': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
}

async function viewTicketResponses(ticketId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboardst/tickets/${ticketId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        
        if (data.success) {
            showResponsesModal(data.ticket);
        }
    } catch (error) {
        console.error('Error loading ticket details:', error);
    }
}

function showResponsesModal(ticket) {
    const modalHtml = `
        <div class="modal fade" id="responsesModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Ticket Responses</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Subject: ${ticket.subject}</h6>
                        <p>${ticket.description}</p>
                        <hr>
                        <h6>Responses:</h6>
                        ${ticket.responses.length > 0 ? 
                            ticket.responses.map(response => `
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <p class="card-text">${response.message}</p>
                                        <small class="text-muted">
                                            Responded on ${new Date(response.createdAt).toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p>No responses yet.</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('responsesModal'));
    modal.show();

    document.getElementById('responsesModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

