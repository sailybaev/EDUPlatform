const API_BASE_URL = CONFIG.API_BASE_URL;
let allCourses = [];
let isLoading = false;
let initialized = false;
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = './login.html';
        return;
    }

    $(document).ready(() => {
        initializeAdminPanel();
    });

    $('.selectpicker').selectpicker({
        actionsBox: true,
        liveSearch: true,
        selectedTextFormat: 'count > 2'
    });
});

// Initialize admin panel
async function initializeAdminPanel() {
    try {
        await loadCourses();
        await loadUsers();
        await loadCoursesTable();
        await loadTickets();
        initializeEventListeners();
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        alert('Failed to load admin panel. Please refresh the page.');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    const createCourseForm = document.getElementById('createCourseForm');
    if (createCourseForm) {
        createCourseForm.addEventListener('submit', handleCourseSubmit);
    }

    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle course submission
async function handleCourseSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    const titleInput = document.getElementById('courseTitle');
    const descriptionInput = document.getElementById('courseDescription');

    if (!titleInput || !descriptionInput) {
        alert('Form inputs not found');
        return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        alert('Course title is required');
        return;
    }

    isLoading = true;
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();
        if (data.success) {
            e.target.reset();
            await Promise.all([
                loadCoursesTable(),
                loadUsers()
            ]);
        } else {
            alert(data.message || 'Failed to create course');
        }
    } catch (error) {
        console.error('Error creating course:', error);
        alert('Failed to create course. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = './login.html';
}

// Error handler wrapper
function errorHandler(fn) {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            alert(`An error occurred in ${fn.name}. Please try again.`);
        }
    };
}

// Wrap existing functions with error handler
const safeLoadCourses = errorHandler(loadCourses);
const safeLoadUsers = errorHandler(loadUsers);
const safeLoadCoursesTable = errorHandler(loadCoursesTable);

// Add course management functions
async function createCourse(title, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();
        if (data.success) {
            alert('Course created successfully');
            loadCoursesTable();
            loadCourses();
        } else {
            alert(data.message || 'Failed to create course');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create course');
    }
}

// Function to fetch all courses
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();

        if (data.success) {
            allCourses = data.courses; // Store fetched courses
            console.log('Courses loaded:', allCourses);
        } else {
            alert(`Error: ${data.message}`);
            console.error('Failed to load courses:', data.message);
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        alert('An unexpected error occurred while fetching courses.');
    }
}

// Function to fetch and render all users
window.saveUserChanges = saveUserChanges;
window.deleteUser = deleteUser;

// Update loadUsers function to use event listeners instead of inline onclick
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();

        if (data.success) {
            const usersTableBody = document.getElementById('usersTableBody');
            usersTableBody.innerHTML = '';

            data.users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${sanitizeHTML(user.name)} ${sanitizeHTML(user.surname)}</td>
                    <td>${sanitizeHTML(user.email)}</td>
                    <td>
                        <select class="form-select role-select" id="role-${user._id}">
                            <option value="student" ${user.who === 'student' ? 'selected' : ''}>Student</option>
                            <option value="admin" ${user.who === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td class="course-select-container">
                        <div class="custom-select">
                            <div class="select-button" id="select-button-${user._id}">
                                Select Courses
                            </div>
                            <div class="select-dropdown" id="dropdown-${user._id}">
                                <div class="search-box">
                                    <input type="text" placeholder="Search courses..." class="search-input">
                                </div>
                                <div class="options-container" id="options-${user._id}">
                                    ${getCoursesOptions(user.courses)}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary save-btn">Save Changes</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete User</button>
                    </td>
                `;

                usersTableBody.appendChild(tr);

                // Initialize custom select
                initializeCustomSelect(user._id, user.courses);

                // Add event listeners
                const saveBtn = tr.querySelector('.save-btn');
                const deleteBtn = tr.querySelector('.delete-btn');

                saveBtn.addEventListener('click', () => saveUserChanges(user._id));
                deleteBtn.addEventListener('click', () => deleteUser(user._id));
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load users');
    }
}

function initializeCustomSelect(userId, userCourses) {
    const selectButton = document.getElementById(`select-button-${userId}`);
    const dropdown = document.getElementById(`dropdown-${userId}`);
    const optionsContainer = document.getElementById(`options-${userId}`);
    const searchInput = dropdown.querySelector('.search-input');

    // Toggle dropdown
    selectButton.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#select-button-${userId}`) && 
            !e.target.closest(`#dropdown-${userId}`)) {
            dropdown.style.display = 'none';
        }
    });

    // Handle option selection
    optionsContainer.addEventListener('click', (e) => {
        const option = e.target.closest('.course-option');
        if (option) {
            option.classList.toggle('selected');
            updateSelectedDisplay(userId);
        }
    });

    // Handle search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const options = optionsContainer.querySelectorAll('.course-option');
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}


// Function to generate course options HTML
function getCoursesOptions(userCourses = []) {
    if (!allCourses.length) {
        return '<div class="no-courses">No courses available</div>';
    }

    return allCourses.map(course => `
        <div class="course-option ${userCourses.some(uc => uc._id === course._id) ? 'selected' : ''}" 
             data-value="${sanitizeHTML(course._id)}">
            ${sanitizeHTML(course.title)}
        </div>
    `).join('');
}

function updateSelectedDisplay(userId) {
    const selectButton = document.getElementById(`select-button-${userId}`);
    const selectedOptions = document.querySelectorAll(`#options-${userId} .course-option.selected`);
    
    if (selectedOptions.length === 0) {
        selectButton.textContent = 'Select Courses';
    } else {
        selectButton.textContent = `${selectedOptions.length} courses selected`;
    }
}

// Function to save user changes (role and courses)
async function saveUserChanges(userId) {
    const roleSelect = document.getElementById(`role-${userId}`);
    const selectedOptions = document.querySelectorAll(`#options-${userId} .course-option.selected`);
    
    const newRole = roleSelect.value;
    const selectedCourses = Array.from(selectedOptions).map(option => option.dataset.value);

    if (!confirm('Are you sure you want to save these changes?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                who: newRole,
                courses: selectedCourses
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('User updated successfully');
            loadUsers();
            loadCoursesTable();
        } else {
            alert(data.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update user');
    }
}
// Function to delete a user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('User deleted successfully.');
            loadUsers(); // Reload users to remove deleted user
        } else {
            alert(`Error: ${data.message}`);
            console.error('Failed to delete user:', data.message);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An unexpected error occurred while deleting the user.');
    }
}


// Update loadCoursesTable function
async function loadCoursesTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (data.success) {
            const coursesTableBody = document.getElementById('coursesTableBody');
            coursesTableBody.innerHTML = '';

            data.courses.forEach(course => {
                const tr = document.createElement('tr');
                const assignedUsers = course.assignedUsers || [];
                const usersList = assignedUsers.map(user => user.name).join(', ');

                tr.innerHTML = `
                    <td>${sanitizeHTML(course.title)}</td>
                    <td>${sanitizeHTML(course.description || '')}</td>
                    <td>
                        <span class="badge bg-primary">${course.assignedCount} users</span>
                        <button class="btn btn-sm btn-link" 
                            type="button" 
                            data-bs-toggle="tooltip" 
                            title="${sanitizeHTML(usersList)}">
                            View Users
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                    </td>
                `;

                coursesTableBody.appendChild(tr);

                // Initialize tooltip
                const tooltip = tr.querySelector('[data-bs-toggle="tooltip"]');
                const edt= tr.querySelector('.edit-btn');
                const delBtn = tr.querySelector('.delete-btn');
                
                edt.addEventListener('click', () => {
                    editCourse(course._id);
                });

                delBtn.addEventListener('click', () => {
                    deleteCourse(course._id)
                });
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load courses');
    }
};

// Add course management functions
async function editCourse(courseId) {
    const course = allCourses.find(c => c._id === courseId);
    if (!course) return;

    const newTitle = prompt('Enter new course title:', course.title);
    const newDescription = prompt('Enter new course description:', course.description);

    if (!newTitle) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Course updated successfully');
            loadCoursesTable();
            loadCourses();
        } else {
            alert(data.message || 'Failed to update course');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update course');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Course deleted successfully');
            loadCoursesTable();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('An unexpected error occurred while deleting the course.');
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}

// Updated sanitizeHTML function
function sanitizeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

async function loadTickets() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (data.success) {
            const ticketsTableBody = document.getElementById('ticketsTableBody');
            ticketsTableBody.innerHTML = '';

            data.tickets.forEach(ticket => {
                const tr = document.createElement('tr');
                const createdDate = new Date(ticket.createdAt).toLocaleDateString();
                
                tr.innerHTML = `
                    <td>${sanitizeHTML(ticket.user.name)} ${sanitizeHTML(ticket.user.surname)}</td>
                    <td>${sanitizeHTML(ticket.subject)}</td>
                    <td>${sanitizeHTML(ticket.description)}</td>
                    <td><span class="badge bg-${getStatusBadgeColor(ticket.status)}">${ticket.status}</span></td>
                    <td><span class="badge bg-${getPriorityBadgeColor(ticket.priority)}">${ticket.priority}</span></td>
                    <td>${createdDate}</td>
                    <td>
                        ${ticket.status === 'open' ? `
                            <button class="btn btn-sm btn-success accept-ticket" data-ticket-id="${ticket._id}">Accept</button>
                            <button class="btn btn-sm btn-danger reject-ticket" data-ticket-id="${ticket._id}">Reject</button>
                        ` : ticket.status === 'in-progress' ? `
                            <button class="btn btn-sm btn-success complete-ticket" data-ticket-id="${ticket._id}">Complete</button>
                        ` : ''}
                        <button class="btn btn-sm btn-primary view-ticket" data-ticket-id="${ticket._id}">View</button>
                    </td>
                `;

                ticketsTableBody.appendChild(tr);

                // Add event listeners for the buttons
                const acceptBtn = tr.querySelector('.accept-ticket');
                const rejectBtn = tr.querySelector('.reject-ticket');
                const viewBtn = tr.querySelector('.view-ticket');
                const completeBtn = tr.querySelector('.complete-ticket');

                if (acceptBtn) {
                    acceptBtn.addEventListener('click', () => handleTicket(ticket._id, 'accept'));
                }
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', () => handleTicket(ticket._id, 'reject'));
                }
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => viewTicket(ticket._id));
                }
                if (completeBtn) {
                    completeBtn.addEventListener('click', () => completeTicket(ticket._id));
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load tickets');
    }
}

function getStatusBadgeColor(status) {
    const colors = {
        'open': 'warning',
        'in-progress': 'info',
        'closed': 'secondary'
    };
    return colors[status] || 'secondary';
}

function getPriorityBadgeColor(priority) {
    const colors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'danger'
    };
    return colors[priority] || 'secondary';
}

async function handleTicket(ticketId, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/${action}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (data.success) {
            alert(`Ticket ${action}ed successfully`);
            loadTickets();
        } else {
            alert(data.message || `Failed to ${action} ticket`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to ${action} ticket`);
    }
}

async function viewTicket(ticketId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (data.success) {
            showTicketModal(data.ticket);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load ticket details');
    }
}

function showTicketModal(ticket) {
    const modalHtml = `
        <div class="modal fade" id="ticketModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Ticket Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <strong>Subject:</strong> ${sanitizeHTML(ticket.subject)}
                        </div>
                        <div class="mb-3">
                            <strong>Description:</strong>
                            <p>${sanitizeHTML(ticket.description)}</p>
                        </div>
                        <div class="mb-3">
                            <strong>Status:</strong> 
                            <span class="badge bg-${getStatusBadgeColor(ticket.status)}">${ticket.status}</span>
                        </div>
                        <div class="mb-3">
                            <strong>Priority:</strong>
                            <span class="badge bg-${getPriorityBadgeColor(ticket.priority)}">${ticket.priority}</span>
                        </div>
                        <hr>
                        <h6>Responses</h6>
                        <div class="ticket-responses mb-3">
                            ${ticket.responses.map(response => `
                                <div class="card mb-2">
                                    <div class="card-body">
                                        <p class="card-text">${sanitizeHTML(response.message)}</p>
                                        <small class="text-muted">
                                            By ${response.responder.name} on ${new Date(response.createdAt).toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Add Response</label>
                            <textarea class="form-control" id="ticketResponse" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="sendResponse">Send Response</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
    modal.show();

    document.getElementById('sendResponse').addEventListener('click', () => {
        const response = document.getElementById('ticketResponse').value;
        if (response.trim()) {
            sendTicketResponse(ticket._id, response);
        }
    });

    document.getElementById('ticketModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

async function sendTicketResponse(ticketId, message) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (data.success) {
            alert('Response sent successfully');
            const modal = bootstrap.Modal.getInstance(document.getElementById('ticketModal'));
            modal.hide();
            loadTickets();
        } else {
            alert(data.message || 'Failed to send response');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send response');
    }
}

async function completeTicket(ticketId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (data.success) {
            alert('Ticket marked as completed');
            loadTickets();
        } else {
            alert(data.message || 'Failed to complete ticket');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to complete ticket');
    }
}