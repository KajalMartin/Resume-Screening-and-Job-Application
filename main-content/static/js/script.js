// script.js - Updated with modal functionality

// ===========================================
// MODAL MANAGEMENT SYSTEM
// ===========================================

// Modal elements
const jobPreviewModal = document.getElementById('jobPreviewModal');
const candidatePreviewModal = document.getElementById('candidatePreviewModal');
const confirmationModal = document.getElementById('confirmationModal');
const notificationToast = document.getElementById('notificationToast');

// Current active item for modals
let currentJobId = null;
let currentCandidateId = null;
let currentAction = null;
let currentCallback = null;

// ===========================================
// JOB PREVIEW MODAL FUNCTIONS
// ===========================================

function openJobPreview(jobId, openEdit = false) {
    currentJobId = jobId;
    
    // Reset modal to preview mode
    document.getElementById('editJobForm').style.display = 'none';
    document.getElementById('previewModalTitle').textContent = 'Job Preview';
    
    // Show loading state
    const previewContentEl = document.querySelector('.preview-content');
    if (previewContentEl) previewContentEl.classList.add('loading');
    
    // Fetch job details
    fetch(`/api/job/${jobId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch job details');
            return response.json();
        })
        .then(job => {
            // Update preview content
            updateJobPreview(job);
            if (previewContentEl) previewContentEl.classList.remove('loading');
            jobPreviewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // If caller requested opening directly in edit mode, switch after content is ready
            if (openEdit) {
                setTimeout(() => {
                    try { switchToEditMode(); } catch (err) { console.error(err); }
                }, 50);
            }
        })
        .catch(error => {
            console.error('Error fetching job:', error);
            showNotification('Error loading job details', 'error');
        });
}

function updateJobPreview(job) {
    // Update basic info
    document.getElementById('previewJobTitle').textContent = job.title;
    document.getElementById('previewCompany').textContent = job.company;
    document.getElementById('previewLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${job.location || 'Not specified'}`;
    document.getElementById('previewSalary').innerHTML = `<i class="fas fa-money-bill-wave"></i> ${job.salary_range || 'Not specified'}`;
    document.getElementById('previewJobType').innerHTML = `<i class="fas fa-briefcase"></i> ${formatJobType(job.job_type)}`;
    document.getElementById('previewStatus').innerHTML = `<i class="fas fa-circle"></i> <span class="status-badge ${job.status}">${formatStatus(job.status)}</span>`;
    
    // Update description and requirements
    document.getElementById('previewDescription').textContent = job.description;
    document.getElementById('previewRequirements').textContent = job.requirements;
    
    // Update dates and ID
    document.getElementById('previewPostedDate').textContent = formatDate(job.created_at);
    document.getElementById('previewUpdatedDate').textContent = formatDate(job.updated_at);
    document.getElementById('previewJobId').textContent = job.id;
    
    // Set up toggle status button
    const toggleBtn = document.getElementById('toggleStatusBtn');
    toggleBtn.innerHTML = job.status === 'active' 
        ? '<i class="fas fa-pause"></i> Close Job' 
        : '<i class="fas fa-play"></i> Activate Job';
    
    // Fetch application count (this would come from backend in real app)
    document.getElementById('previewApplications').textContent = '0';
    
    // Pre-fill edit form
    prefillEditForm(job);
}

function prefillEditForm(job) {
    document.getElementById('editJobTitle').value = job.title;
    document.getElementById('editCompany').value = job.company;
    document.getElementById('editLocation').value = job.location || '';
    document.getElementById('editSalaryRange').value = job.salary_range || '';
    document.getElementById('editDescription').value = job.description;
    document.getElementById('editRequirements').value = job.requirements;
    
    // Set job type radio
    document.querySelectorAll('input[name="job_type"]').forEach(radio => {
        radio.checked = radio.value === job.job_type;
    });
    
    // Set status radio
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.checked = radio.value === job.status;
    });
}

function switchToEditMode() {
    document.getElementById('previewModalTitle').textContent = 'Edit Job';
    document.querySelector('.preview-content').style.display = 'none';
    document.getElementById('editJobForm').style.display = 'block';
}

function switchToPreviewMode() {
    document.getElementById('previewModalTitle').textContent = 'Job Preview';
    document.getElementById('editJobForm').style.display = 'none';
    document.querySelector('.preview-content').style.display = 'block';
    
    // Reload job data
    if (currentJobId) {
        openJobPreview(currentJobId);
    }
}

// ===========================================
// CANDIDATE PREVIEW MODAL FUNCTIONS
// ===========================================

function openCandidatePreview(candidateId) {
    currentCandidateId = candidateId;
    
    // Reset modal to preview mode
    document.getElementById('editCandidateForm').style.display = 'none';
    document.getElementById('candidateModalTitle').textContent = 'Candidate Profile';
    
    // Show loading state
    document.querySelector('.preview-content').classList.add('loading');
    
    // Fetch candidate details
    fetch(`/api/candidate/${candidateId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch candidate details');
            return response.json();
        })
        .then(candidate => {
            // Update preview content
            updateCandidatePreview(candidate);
            document.querySelector('.preview-content').classList.remove('loading');
            candidatePreviewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error fetching candidate:', error);
            showNotification('Error loading candidate profile', 'error');
        });
}

function updateCandidatePreview(candidate) {
    // Update basic info
    document.getElementById('candidateAvatar').textContent = candidate.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('candidateName').textContent = candidate.name;
    document.getElementById('candidateEmail').textContent = candidate.email;
    document.getElementById('candidatePhone').innerHTML = `<i class="fas fa-phone"></i> ${candidate.phone || 'Not specified'}`;
    document.getElementById('candidateExperience').innerHTML = `<i class="fas fa-briefcase"></i> ${candidate.experience || 'Not specified'}`;
    document.getElementById('candidateEducation').innerHTML = `<i class="fas fa-graduation-cap"></i> ${candidate.education || 'Not specified'}`;
    
    // Update skills
    const skillsContainer = document.getElementById('candidateSkills');
    skillsContainer.innerHTML = '';
    if (candidate.skills) {
        const skills = candidate.skills.split(',').map(skill => skill.trim());
        skills.forEach(skill => {
            if (skill) {
                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            }
        });
    } else {
        skillsContainer.innerHTML = '<span class="skill-tag">No skills specified</span>';
    }
    
    // Update dates and ID
    document.getElementById('candidateMemberSince').textContent = formatDate(candidate.created_at);
    document.getElementById('candidateId').textContent = candidate.id;
    
    // Update last active (for demo, use created date)
    document.getElementById('lastActive').textContent = formatDate(candidate.created_at);
    
    // Pre-fill edit form
    prefillCandidateEditForm(candidate);
    
    // Load applications (this would come from backend in real app)
    loadCandidateApplications(candidateId);
}

function prefillCandidateEditForm(candidate) {
    document.getElementById('editCandidateName').value = candidate.name;
    document.getElementById('editCandidateEmail').value = candidate.email;
    document.getElementById('editCandidatePhone').value = candidate.phone || '';
    document.getElementById('editCandidateExperience').value = candidate.experience || '';
    document.getElementById('editCandidateEducation').value = candidate.education || '';
    document.getElementById('editCandidateResume').value = candidate.resume_url || '';
    document.getElementById('editCandidateSkills').value = candidate.skills || '';
}

function loadCandidateApplications(candidateId) {
    // This would be an API call in real app
    const applicationsList = document.getElementById('candidateApplications');
    applicationsList.innerHTML = '<p>Loading applications...</p>';
    
    // Simulated data
    setTimeout(() => {
        const applications = [
            { job: 'Senior Software Engineer', company: 'Tech Corp', status: 'shortlisted', date: '2024-01-15' },
            { job: 'Full Stack Developer', company: 'Startup XYZ', status: 'pending', date: '2024-01-10' },
            { job: 'Frontend Engineer', company: 'Design Co', status: 'rejected', date: '2024-01-05' }
        ];
        
        if (applications.length > 0) {
            applicationsList.innerHTML = '';
            applications.forEach(app => {
                const appItem = document.createElement('div');
                appItem.className = 'application-item';
                appItem.innerHTML = `
                    <div class="application-info">
                        <h5>${app.job}</h5>
                        <p>${app.company} • Applied on ${formatDate(app.date)}</p>
                    </div>
                    <span class="application-status status-${app.status}">${formatStatus(app.status)}</span>
                `;
                applicationsList.appendChild(appItem);
            });
        } else {
            applicationsList.innerHTML = '<p>No applications found.</p>';
        }
        
        // Update total applications count
        document.getElementById('totalApplications').textContent = applications.length;
    }, 500);
}

function switchToCandidateEditMode() {
    document.getElementById('candidateModalTitle').textContent = 'Edit Candidate';
    document.querySelector('.preview-content').style.display = 'none';
    document.getElementById('editCandidateForm').style.display = 'block';
}

function switchToCandidatePreviewMode() {
    document.getElementById('candidateModalTitle').textContent = 'Candidate Profile';
    document.getElementById('editCandidateForm').style.display = 'none';
    document.querySelector('.preview-content').style.display = 'block';
    
    // Reload candidate data
    if (currentCandidateId) {
        openCandidatePreview(currentCandidateId);
    }
}

// ===========================================
// CONFIRMATION MODAL FUNCTIONS
// ===========================================

function showConfirmation(title, message, callback) {
    currentAction = title.toLowerCase().replace(' ', '_');
    currentCallback = callback;
    
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').textContent = message;
    
    confirmationModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeConfirmationModal() {
    confirmationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentAction = null;
    currentCallback = null;
}

// ===========================================
// NOTIFICATION SYSTEM
// ===========================================

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
        toastIcon.style.color = 'var(--secondary-color)';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
        toastIcon.style.color = 'var(--danger-color)';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
        toastIcon.style.color = 'var(--warning-color)';
    } else {
        toastIcon.className = 'fas fa-info-circle toast-icon';
        toastIcon.style.color = 'var(--primary-color)';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// ===========================================
// API INTEGRATION FUNCTIONS
// ===========================================

function updateJob() {
    const form = document.getElementById('editJobForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add loading state
    const saveBtn = document.getElementById('saveJobBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
    saveBtn.disabled = true;
    
    fetch(`/api/job/${currentJobId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update job');
        return response.json();
    })
    .then(result => {
        showNotification('Job updated successfully!', 'success');
        switchToPreviewMode();
        
        // Refresh job postings table if on that page
        if (window.location.pathname.includes('job-postings')) {
            location.reload(); // Or update specific row
        }
    })
    .catch(error => {
        console.error('Error updating job:', error);
        showNotification('Error updating job', 'error');
    })
    .finally(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

function deleteJob() {
    showConfirmation('Delete Job', 'Are you sure you want to delete this job? This action cannot be undone.', () => {
        fetch(`/api/job/${currentJobId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete job');
            return response.json();
        })
        .then(result => {
            showNotification('Job deleted successfully!', 'success');
            closeJobPreviewModal();
            
            // Refresh job postings table if on that page
            if (window.location.pathname.includes('job-postings')) {
                location.reload(); // Or remove specific row
            }
        })
        .catch(error => {
            console.error('Error deleting job:', error);
            showNotification('Error deleting job', 'error');
        });
    });
}

function toggleJobStatus() {
    fetch(`/api/job/${currentJobId}/toggle-status`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to toggle status');
        return response.json();
    })
    .then(result => {
        showNotification(`Job status updated to ${result.status}`, 'success');
        openJobPreview(currentJobId); // Reload preview
    })
    .catch(error => {
        console.error('Error toggling status:', error);
        showNotification('Error updating job status', 'error');
    });
}

function updateCandidate() {
    const form = document.getElementById('editCandidateForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add loading state
    const saveBtn = document.getElementById('saveCandidateBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
    saveBtn.disabled = true;
    
    fetch(`/api/candidate/${currentCandidateId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update candidate');
        return response.json();
    })
    .then(result => {
        showNotification('Candidate updated successfully!', 'success');
        switchToCandidatePreviewMode();
    })
    .catch(error => {
        console.error('Error updating candidate:', error);
        showNotification('Error updating candidate', 'error');
    })
    .finally(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

function deleteCandidate() {
    showConfirmation('Delete Candidate', 'Are you sure you want to delete this candidate? This action cannot be undone.', () => {
        fetch(`/api/candidate/${currentCandidateId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete candidate');
            return response.json();
        })
        .then(result => {
            showNotification('Candidate deleted successfully!', 'success');
            closeCandidatePreviewModal();
            
            // Refresh candidates table if on that page
            if (window.location.pathname.includes('candidates')) {
                location.reload(); // Or remove specific row
            }
        })
        .catch(error => {
            console.error('Error deleting candidate:', error);
            showNotification('Error deleting candidate', 'error');
        });
    });
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatJobType(type) {
    const types = {
        'fulltime': 'Full-time',
        'parttime': 'Part-time',
        'contract': 'Contract',
        'remote': 'Remote'
    };
    return types[type] || type;
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function closeJobPreviewModal() {
    jobPreviewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentJobId = null;
}

function closeCandidatePreviewModal() {
    candidatePreviewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentCandidateId = null;
}

// ===========================================
// EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Job Preview Modal Events
    const closePreviewModal = document.getElementById('closePreviewModal');
    if (closePreviewModal) {
        closePreviewModal.addEventListener('click', closeJobPreviewModal);
    }
    
    const editJobBtn = document.getElementById('editJobBtn');
    if (editJobBtn) {
        editJobBtn.addEventListener('click', switchToEditMode);
    }
    
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', switchToPreviewMode);
    }
    
    const deleteJobBtn = document.getElementById('deleteJobBtn');
    if (deleteJobBtn) {
        deleteJobBtn.addEventListener('click', deleteJob);
    }
    
    const toggleStatusBtn = document.getElementById('toggleStatusBtn');
    if (toggleStatusBtn) {
        toggleStatusBtn.addEventListener('click', toggleJobStatus);
    }
    
    const editJobForm = document.getElementById('editJobForm');
    if (editJobForm) {
        editJobForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateJob();
        });
    }
    
    // Candidate Preview Modal Events
    const closeCandidatePreview = document.getElementById('closeCandidatePreviewModal');
    if (closeCandidatePreview) {
        closeCandidatePreview.addEventListener('click', closeCandidatePreviewModal);
    }
    
    const editCandidateBtn = document.getElementById('editCandidateBtn');
    if (editCandidateBtn) {
        editCandidateBtn.addEventListener('click', switchToCandidateEditMode);
    }
    
    const cancelCandidateEditBtn = document.getElementById('cancelCandidateEditBtn');
    if (cancelCandidateEditBtn) {
        cancelCandidateEditBtn.addEventListener('click', switchToCandidatePreviewMode);
    }
    
    const deleteCandidateBtn = document.getElementById('deleteCandidateBtn');
    if (deleteCandidateBtn) {
        deleteCandidateBtn.addEventListener('click', deleteCandidate);
    }
    
    const downloadResumeBtn = document.getElementById('downloadResumeBtn');
    if (downloadResumeBtn) {
        downloadResumeBtn.addEventListener('click', function() {
            // This would check if resume URL exists and initiate download
            showNotification('Resume download started', 'success');
        });
    }
    
    const editCandidateForm = document.getElementById('editCandidateForm');
    if (editCandidateForm) {
        editCandidateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCandidate();
        });
    }
    
    // Confirmation Modal Events
    const closeConfirmationBtn = document.getElementById('closeConfirmationModal');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmationModal);
    }
    
    const cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
    if (cancelConfirmationBtn) {
        cancelConfirmationBtn.addEventListener('click', closeConfirmationModal);
    }
    
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', function() {
            if (currentCallback) {
                currentCallback();
            }
            closeConfirmationModal();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === jobPreviewModal) {
            closeJobPreviewModal();
        }
        if (event.target === candidatePreviewModal) {
            closeCandidatePreviewModal();
        }
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            if (jobPreviewModal.style.display === 'flex') {
                closeJobPreviewModal();
            }
            if (candidatePreviewModal.style.display === 'flex') {
                closeCandidatePreviewModal();
            }
            if (confirmationModal.style.display === 'flex') {
                closeConfirmationModal();
            }
        }
        
        // Ctrl+S to save in edit mode
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (jobPreviewModal.style.display === 'flex' && document.getElementById('editJobForm').style.display === 'block') {
                updateJob();
            }
            if (candidatePreviewModal.style.display === 'flex' && document.getElementById('editCandidateForm').style.display === 'block') {
                updateCandidate();
            }
        }
    });
    
    // Update existing viewJobDetails function
    window.viewJobDetails = function(jobId) {
        openJobPreview(jobId);
    };
    
    // Update existing viewCandidateProfile function
    window.viewCandidateProfile = function(candidateId) {
        openCandidatePreview(candidateId);
    };
    
    console.log('Modal system initialized');
});

// ===========================================
// GENERAL FUNCTIONS
// ===========================================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe steps
document.querySelectorAll('.step').forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(step);
});

// Add hover effects for suggestion cards
document.querySelectorAll('.ai-suggestion a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
});

// Animate error code on load
document.addEventListener('DOMContentLoaded', function() {
    const errorCode = document.querySelector('.error-code');
    if (errorCode) {
        errorCode.style.opacity = '0';
        errorCode.style.transform = 'scale(0.5)';
        
        setTimeout(() => {
            errorCode.style.transition = 'all 0.6s ease-out';
            errorCode.style.opacity = '1';
            errorCode.style.transform = 'scale(1)';
        }, 100);
    }
});

// User type selection for signup
document.addEventListener('DOMContentLoaded', function() {
    const labels = document.querySelectorAll('.user-type-label');
    const inputs = document.querySelectorAll('input[name="user_type"]');
    
    if (labels.length > 0) {
        labels.forEach(label => {
            label.addEventListener('click', function() {
                // Remove selected class from all labels
                labels.forEach(l => l.classList.remove('user-type-selected'));
                
                // Add selected class to clicked label
                this.classList.add('user-type-selected');
                
                // Trigger corresponding radio button
                const inputId = this.getAttribute('for');
                if (inputId) {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.checked = true;
                    }
                }
            });
        });
    }
});

// ===========================================
// DASHBOARD SPECIFIC FUNCTIONS
// ===========================================

// Set current date in dashboard
const currentDateElement = document.getElementById('current-date');
if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Modal elements
const jobModal = document.getElementById('jobModal');
const candidateModal = document.getElementById('candidateModal');
const postJobBtns = document.querySelectorAll('.post-job-btn');
const closeJobModal = document.getElementById('closeJobModal');
const cancelJob = document.getElementById('cancelJob');
const closeCandidateModal = document.getElementById('closeCandidateModal');
const postJobForm = document.getElementById('postJobForm');
const viewProfileButtons = document.querySelectorAll('.view-profile');
const viewAllJobsBtn = document.getElementById('viewAllJobs');
const viewAllCandidatesBtn = document.getElementById('viewAllCandidates');

// Job Modal Functions
function openJobModal() {
    if (jobModal) {
        jobModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeJobModalFunc() {
    if (jobModal) {
        jobModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (postJobForm) {
            postJobForm.reset();
        }
    }
}

// Candidate Modal Functions
function openCandidateModal() {
    if (candidateModal) {
        candidateModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateProgressCircles();
    }
}

function closeCandidateModalFunc() {
    if (candidateModal) {
        candidateModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Update progress circles
function updateProgressCircles() {
    const progressCircles = document.querySelectorAll('.circle-progress');
    progressCircles.forEach(circle => {
        const progress = circle.getAttribute('data-progress') || 92;
        circle.style.background = `conic-gradient(var(--primary-color) 0% ${progress}%, rgba(59, 130, 246, 0.2) ${progress}% 100%)`;
    });
}

// Form validation and submission
if (postJobForm) {
    postJobForm.addEventListener('submit', function(e) {
        // Form validation
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
                // Add error message
                if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = '#ef4444';
                    errorMsg.style.fontSize = '0.75rem';
                    errorMsg.style.marginTop = '0.25rem';
                    errorMsg.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                }
            } else {
                field.style.borderColor = '';
                // Remove error message
                if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
                    field.nextElementSibling.remove();
                }
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            // Show alert only if not already showing error messages
            if (!document.querySelector('.error-message')) {
                alert('Please fill in all required fields marked with *');
            }
        } else {
            // Optional: Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span> Posting...';
            submitBtn.disabled = true;
            
            // Simulate processing (in real app, this would be actual form submission)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        }
    });
}

// Job selection for analysis
const jobSelect = document.getElementById('selectJobForAnalysis');
if (jobSelect) {
    jobSelect.addEventListener('change', function() {
        // In a real app, you would fetch job details based on selection
        const jobTitle = this.options[this.selectedIndex].text;
        console.log('Selected job for analysis:', jobTitle);
        
        // Update match score based on selection (simulated)
        const score = Math.floor(Math.random() * 30) + 70; // 70-100%
        document.querySelector('.circle-progress').setAttribute('data-progress', score);
        document.querySelector('.score-text').textContent = `${score}%`;
        updateProgressCircles();
    });
}

// Event Listeners for dashboard
if (postJobBtns && postJobBtns.length) {
    postJobBtns.forEach(btn => btn.addEventListener('click', openJobModal));
}

if (closeJobModal) {
    closeJobModal.addEventListener('click', closeJobModalFunc);
}

if (cancelJob) {
    cancelJob.addEventListener('click', closeJobModalFunc);
}

if (closeCandidateModal) {
    closeCandidateModal.addEventListener('click', closeCandidateModalFunc);
}

if (viewProfileButtons.length > 0) {
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openCandidateModal();
        });
    });
}

if (viewAllJobsBtn) {
    viewAllJobsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Navigating to all jobs page');
        // In real app: window.location.href = '/dashboard/hr/job-postings';
    });
}

if (viewAllCandidatesBtn) {
    viewAllCandidatesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Navigating to all candidates page');
        // In real app: window.location.href = '/dashboard/hr/candidates';
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (jobModal && event.target === jobModal) {
        closeJobModalFunc();
    }
    if (candidateModal && event.target === candidateModal) {
        closeCandidateModalFunc();
    }
});

// Sidebar navigation active state
const sidebarLinks = document.querySelectorAll('.sidebar-link');
if (sidebarLinks.length > 0) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's a hash link or dummy link
            if (this.getAttribute('href') === '#' || !this.getAttribute('href')) {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // In a real app, you would load the corresponding content
                const page = this.querySelector('span').textContent.toLowerCase();
                console.log('Navigating to:', page);
            }
        });
    });
}

// Initialize progress circles on load
document.addEventListener('DOMContentLoaded', function() {
    updateProgressCircles();
    
    // Simulate data loading
    setTimeout(() => {
        console.log('Dashboard data loaded successfully');
        // You could remove loading indicators here
    }, 1000);
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + N to open new job modal
    if (e.ctrlKey && e.key === 'n' && jobModal) {
        e.preventDefault();
        openJobModal();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        if (jobModal && jobModal.style.display === 'flex') {
            closeJobModalFunc();
        }
        if (candidateModal && candidateModal.style.display === 'flex') {
            closeCandidateModalFunc();
        }
    }
});

// Sample data for demonstration (would come from backend in real app)
const sampleJobs = [
    { title: "Senior Software Engineer", company: "Tech Corp Inc.", applications: 42, date: "Jan 15, 2024", status: "active" },
    { title: "UX Designer", company: "Design Studio", applications: 28, date: "Jan 10, 2024", status: "active" },
    { title: "Data Scientist", company: "Analytics Pro", applications: 35, date: "Jan 5, 2024", status: "active" },
    { title: "Product Manager", company: "Product Inc.", applications: 18, date: "Jan 1, 2024", status: "closed" },
    { title: "DevOps Engineer", company: "Cloud Systems", applications: 22, date: "Dec 28, 2023", status: "active" },
];

const sampleCandidates = [
    { name: "John Smith", title: "Senior Software Engineer", experience: "5+ years", education: "Master's", match: 92 },
    { name: "Emma Wilson", title: "UX Designer", experience: "3-5 years", education: "Bachelor's", match: 88 },
    { name: "Michael Chen", title: "Data Scientist", experience: "2-4 years", education: "PhD", match: 95 },
    { name: "Sarah Johnson", title: "Product Manager", experience: "7+ years", education: "MBA", match: 85 },
    { name: "David Brown", title: "DevOps Engineer", experience: "4-6 years", education: "Bachelor's", match: 90 },
];

console.log('Sample data loaded:', { sampleJobs, sampleCandidates });

// ===========================================
// JOB POSTINGS PAGE FUNCTIONS
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality for job postings page
    const searchInput = document.getElementById('hrJobSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.hr-table-row');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
            
            updateJobCount();
        });
    }

    // Filter functionality for job postings page
    const statusFilter = document.getElementById('hrStatusFilter');
    const sortBy = document.getElementById('hrSortBy');

    if (statusFilter && sortBy) {
        statusFilter.addEventListener('change', filterJobs);
        sortBy.addEventListener('change', filterJobs);
    }

    function filterJobs() {
        const status = statusFilter ? statusFilter.value : '';
        const sort = sortBy ? sortBy.value : 'newest';
        const rows = Array.from(document.querySelectorAll('.hr-table-row'));
        
        // Filter by status
        rows.forEach(row => {
            if (status === '') {
                row.style.display = '';
            } else {
                const statusBadge = row.querySelector('.hr-status-badge');
                if (statusBadge) {
                    const rowStatus = statusBadge.classList.contains('hr-status-active') ? 'active' :
                                    statusBadge.classList.contains('hr-status-closed') ? 'closed' : 'draft';
                    row.style.display = rowStatus === status ? '' : 'none';
                }
            }
        });

        // Sort rows
        const visibleRows = rows.filter(row => row.style.display !== 'none');
        
        visibleRows.sort((a, b) => {
            switch(sort) {
                case 'newest':
                    const dateA = new Date(a.querySelector('td:nth-child(6)').textContent);
                    const dateB = new Date(b.querySelector('td:nth-child(6)').textContent);
                    return dateB - dateA;
                    
                case 'oldest':
                    const dateA2 = new Date(a.querySelector('td:nth-child(6)').textContent);
                    const dateB2 = new Date(b.querySelector('td:nth-child(6)').textContent);
                    return dateA2 - dateB2;
                    
                case 'applications':
                    const appsBadgeA = a.querySelector('.hr-count-badge');
                    const appsBadgeB = b.querySelector('.hr-count-badge');
                    const appsA = appsBadgeA ? parseInt(appsBadgeA.textContent) : 0;
                    const appsB = appsBadgeB ? parseInt(appsBadgeB.textContent) : 0;
                    return appsB - appsA;
                    
                default:
                    return 0;
            }
        });

        // Reorder table rows
        const tbody = document.querySelector('.hr-data-table tbody');
        if (tbody && visibleRows.length > 0) {
            visibleRows.forEach(row => tbody.appendChild(row));
        }
        
        updateJobCount();
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('hrSelectAll');
    const jobCheckboxes = document.querySelectorAll('.hr-job-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            jobCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('hrClearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (sortBy) sortBy.value = 'newest';
            
            const rows = document.querySelectorAll('.hr-table-row');
            rows.forEach(row => row.style.display = '');
            
            updateJobCount();
        });
    }

    // Post new job button in job postings page
    const postNewJobBtn = document.getElementById('hrPostNewJob');
    if (postNewJobBtn) {
        postNewJobBtn.addEventListener('click', function() {
            // Open the job posting modal
            openJobModal();
        });
    }

    // Action buttons in job postings table
    document.querySelectorAll('.hr-action-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (!icon) return;
            
            const action = icon.className;
            const row = this.closest('.hr-table-row');
            if (!row) return;
            
            const jobTitleElement = row.querySelector('.hr-job-info strong');
            const jobTitle = jobTitleElement ? jobTitleElement.textContent : 'Unknown Job';
            
            if (action.includes('fa-trash')) {
                if (confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
                    // In real app: Send delete request to server
                    console.log(`Deleting job: ${jobTitle}`);
                    row.style.opacity = '0.5';
                    setTimeout(() => {
                        row.remove();
                        updateJobCount();
                    }, 300);
                }
            } else if (action.includes('fa-eye')) {
                alert(`Viewing details for: ${jobTitle}`);
                // In real app: Redirect to job details page
            } else if (action.includes('fa-edit')) {
                alert(`Editing: ${jobTitle}`);
                // In real app: Open edit modal
            } else if (action.includes('fa-users')) {
                alert(`Viewing applications for: ${jobTitle}`);
                // In real app: Redirect to applications page
            }
        });
    });

    // Row click for job details
    document.querySelectorAll('.hr-table-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (!e.target.closest('.hr-checkbox') && !e.target.closest('.hr-action-btn')) {
                const jobTitleElement = this.querySelector('.hr-job-info strong');
                const jobTitle = jobTitleElement ? jobTitleElement.textContent : 'Unknown Job';
                alert(`Opening job details for: ${jobTitle}`);
                // In real app: window.location.href = `/dashboard/hr/jobs/${jobId}`;
            }
        });
    });

    // Pagination
    document.querySelectorAll('.hr-pagination-page').forEach(page => {
        page.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.hr-pagination-page').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            console.log(`Navigating to page: ${this.textContent}`);
        });
    });

    function updateJobCount() {
        const visibleRows = document.querySelectorAll('.hr-table-row[style!="display: none;"]');
        const countElement = document.querySelector('.hr-table-count');
        if (countElement) {
            countElement.textContent = `${visibleRows.length} jobs found`;
        }
    }
});

// ===========================================
// CANDIDATE ANALYTICS FUNCTIONS
// ===========================================

// Modal functions for bulk actions
function hrOpenBulkActionsModal() {
    const modal = document.getElementById('hrBulkActionsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hrCloseBulkActionsModal() {
    const modal = document.getElementById('hrBulkActionsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function hrBulkAction(action) {
    console.log(`Bulk action selected: ${action}`);
    alert(`Bulk action selected: ${action}`);
}

function hrConfirmBulkActions() {
    const selectedJobs = Array.from(document.querySelectorAll('.hr-job-checkbox:checked'))
        .map(cb => {
            const row = cb.closest('.hr-table-row');
            if (row) {
                const jobTitleElement = row.querySelector('.hr-job-info strong');
                return jobTitleElement ? jobTitleElement.textContent : 'Unknown Job';
            }
            return 'Unknown Job';
        });

    if (selectedJobs.length === 0) {
        alert('Please select at least one job');
        return;
    }

    alert(`Applying bulk action to: ${selectedJobs.join(', ')}`);
    hrCloseBulkActionsModal();
}

// Open bulk actions if jobs are selected
document.addEventListener('click', function() {
    const selectedCount = document.querySelectorAll('.hr-job-checkbox:checked').length;
    if (selectedCount > 0) {
        console.log(`${selectedCount} jobs selected for bulk actions`);
    }
});

// ===========================================
// CANDIDATE ANALYTICS PAGE FUNCTIONS
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Animate progress bars
    setTimeout(() => {
        document.querySelectorAll('.ca-progress-fill, .ca-skill-match-fill').forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0';
            setTimeout(() => {
                fill.style.width = width;
            }, 100);
        });
    }, 500);

    // Initialize job details
    const jobSelect = document.getElementById('caJobSelect');
    if (jobSelect) {
        caUpdateJobAnalysis();
        jobSelect.addEventListener('change', caUpdateJobAnalysis);
    }
});

// Update analysis based on selected job
function caUpdateJobAnalysis() {
    const jobSelect = document.getElementById('caJobSelect');
    if (!jobSelect) return;
    
    const selectedJob = jobSelect.value;
    const jobDetails = {
        job1: {
            company: 'Tech Corp Inc.',
            location: 'Remote',
            salary: '$120,000 - $150,000',
            experience: '5+ years',
            type: 'Full-time',
            overallScore: 92,
            skills: { python: 95, javascript: 88, aws: 82, docker: 75, ml: 65 },
            breakdown: { skills: 94, experience: 96, education: 88, culture: 85, salary: 78 }
        },
        job2: {
            company: 'Startup XYZ',
            location: 'New York, NY',
            salary: '$100,000 - $130,000',
            experience: '3+ years',
            type: 'Full-time',
            overallScore: 85,
            skills: { python: 92, javascript: 90, aws: 75, docker: 70, ml: 60 },
            breakdown: { skills: 88, experience: 82, education: 85, culture: 90, salary: 85 }
        }
    };

    const job = jobDetails[selectedJob] || jobDetails.job1;
    
    // Update job details
    const jobDetailItems = document.querySelectorAll('.ca-job-detail-item');
    if (jobDetailItems.length >= 5) {
        jobDetailItems[0].querySelector('.ca-job-detail-value').textContent = job.company;
        jobDetailItems[1].querySelector('.ca-job-detail-value').textContent = job.location;
        jobDetailItems[2].querySelector('.ca-job-detail-value').textContent = job.salary;
        jobDetailItems[3].querySelector('.ca-job-detail-value').textContent = job.experience;
        jobDetailItems[4].querySelector('.ca-job-detail-value').textContent = job.type;
    }

    // Update overall score
    const scoreValue = document.querySelector('.ca-score-value');
    const scoreRing = document.querySelector('.ca-score-ring');
    if (scoreValue) {
        scoreValue.textContent = `${job.overallScore}%`;
    }
    if (scoreRing) {
        scoreRing.style.background = `conic-gradient(
            var(--ca-primary) 0% ${job.overallScore}%,
            rgba(99, 102, 241, 0.2) ${job.overallScore}% 100%
        )`;
    }

    // Update breakdown scores
    const breakdownItems = document.querySelectorAll('.ca-breakdown-item');
    if (breakdownItems.length >= 5) {
        breakdownItems[0].querySelector('.ca-breakdown-score').textContent = `${job.breakdown.skills}%`;
        breakdownItems[0].querySelector('.ca-progress-fill').style.width = `${job.breakdown.skills}%`;
        
        breakdownItems[1].querySelector('.ca-breakdown-score').textContent = `${job.breakdown.experience}%`;
        breakdownItems[1].querySelector('.ca-progress-fill').style.width = `${job.breakdown.experience}%`;
        
        breakdownItems[2].querySelector('.ca-breakdown-score').textContent = `${job.breakdown.education}%`;
        breakdownItems[2].querySelector('.ca-progress-fill').style.width = `${job.breakdown.education}%`;
        
        breakdownItems[3].querySelector('.ca-breakdown-score').textContent = `${job.breakdown.culture}%`;
        breakdownItems[3].querySelector('.ca-progress-fill').style.width = `${job.breakdown.culture}%`;
        
        breakdownItems[4].querySelector('.ca-breakdown-score').textContent = `${job.breakdown.salary}%`;
        breakdownItems[4].querySelector('.ca-progress-fill').style.width = `${job.breakdown.salary}%`;
    }

    // Update skills matching
    const skillItems = document.querySelectorAll('.ca-skill-match-item');
    const skillKeys = ['python', 'javascript', 'aws', 'docker', 'ml'];
    
    skillItems.forEach((item, index) => {
        if (index < skillKeys.length) {
            const skillKey = skillKeys[index];
            const skillPercentage = item.querySelector('.ca-skill-percentage');
            const skillFill = item.querySelector('.ca-skill-match-fill');
            
            if (skillPercentage) {
                skillPercentage.textContent = `${job.skills[skillKey]}%`;
            }
            if (skillFill) {
                skillFill.style.width = `${job.skills[skillKey]}%`;
            }
        }
    });

    // Update match badge
    const matchBadge = document.querySelector('.ca-match-badge');
    if (matchBadge) {
        matchBadge.innerHTML = `<i class="fas fa-bolt"></i> ${job.overallScore}% Overall Match`;
    }

    // Update color coding based on scores
    updateScoreColors();
}

function updateScoreColors() {
    document.querySelectorAll('.ca-skill-percentage').forEach(element => {
        const score = parseInt(element.textContent);
        element.className = 'ca-skill-percentage';
        
        if (score >= 90) element.className += ' ca-match-excellent';
        else if (score >= 80) element.className += ' ca-match-good';
        else if (score >= 70) element.className += ' ca-match-average';
        else if (score >= 60) element.className += ' ca-match-poor';
        else element.className += ' ca-match-weak';
    });
}

// Action Functions for candidate analytics
function caDownloadReport() {
    alert('Downloading detailed analytics report...');
    // In production: Generate and download PDF report
}

function caScheduleInterview() {
    const candidateName = document.querySelector('.ca-profile-details h2');
    const jobTitle = document.querySelector('.ca-profile-title');
    const name = candidateName ? candidateName.textContent : 'Candidate';
    const title = jobTitle ? jobTitle.textContent : 'Position';
    alert(`Scheduling interview with ${name} for ${title} position...`);
    // In production: Open calendar/scheduling modal
}

function caShortlistCandidate() {
    const candidateName = document.querySelector('.ca-profile-details h2');
    const name = candidateName ? candidateName.textContent : 'Candidate';
    alert(`Candidate ${name} has been added to shortlist!`);
    // In production: Update candidate status in database
}

function caRejectCandidate() {
    const candidateName = document.querySelector('.ca-profile-details h2');
    const name = candidateName ? candidateName.textContent : 'Candidate';
    if (confirm(`Are you sure you want to reject ${name}?`)) {
        alert(`Candidate ${name} has been rejected.`);
        // In production: Update candidate status in database
    }
}

function caRequestMoreInfo() {
    const candidateName = document.querySelector('.ca-profile-details h2');
    const name = candidateName ? candidateName.textContent : 'Candidate';
    alert(`Requesting additional information from ${name}...`);
    // In production: Open email composer with template
}

function caCompareWithOthers() {
    alert('Opening candidate comparison view...');
    // In production: Redirect to comparison page
}

// Print/Export functions
function caPrintAnalysis() {
    window.print();
}

// Simulate real-time updates
function caSimulateRealTimeUpdate() {
    // This would be replaced with WebSocket or API calls in production
    const scores = [92, 93, 94, 91, 90];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    
    if (Math.random() > 0.7) { // 30% chance of update
        const scoreValue = document.querySelector('.ca-score-value');
        const matchBadge = document.querySelector('.ca-match-badge');
        
        if (scoreValue) {
            scoreValue.textContent = `${randomScore}%`;
        }
        if (matchBadge) {
            matchBadge.innerHTML = `<i class="fas fa-bolt"></i> ${randomScore}% Overall Match`;
        }
        
        // Animate the update
        if (scoreValue) {
            scoreValue.style.transform = 'scale(1.1)';
            setTimeout(() => {
                scoreValue.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

// Simulate periodic updates (every 30 seconds)
setInterval(caSimulateRealTimeUpdate, 30000);

// Keyboard shortcuts for candidate analytics
document.addEventListener('keydown', function(e) {
    // Ctrl + S to shortlist
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        caShortlistCandidate();
    }
    // Ctrl + I to schedule interview
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        caScheduleInterview();
    }
    // Escape to go back
    if (e.key === 'Escape') {
        window.history.back();
    }
});

// Export data for API integration
function caGetAnalyticsData() {
    const jobSelect = document.getElementById('caJobSelect');
    const scoreValue = document.querySelector('.ca-score-value');
    
    return {
        candidateId: 12345,
        candidateName: "John Smith",
        jobId: jobSelect ? jobSelect.value : '',
        overallScore: scoreValue ? parseInt(scoreValue.textContent) : 0,
        breakdown: {
            skills: 0,
            experience: 0,
            education: 0,
            culture: 0,
            salary: 0
        },
        skills: [],
        timestamp: new Date().toISOString()
    };
}

// For API integration example
console.log('Analytics data structure available via caGetAnalyticsData() function');

// ===========================================
// HELPER FUNCTIONS FOR JOB INTERACTIONS
// ===========================================

function viewJobDetails(jobId) {
    console.log(`Viewing details for job ID: ${jobId}`);
    alert(`Viewing job details for ID: ${jobId}`);
    // In real app: window.location.href = `/dashboard/hr/jobs/${jobId}`;
}

function editJob(jobId) {
    console.log(`Editing job ID: ${jobId}`);
    alert(`Editing job ID: ${jobId}`);
    // In real app: Open edit modal with job data
}

function viewCandidateProfile(candidateId) {
    console.log(`Viewing profile for candidate ID: ${candidateId}`);
    openCandidateModal();
    // In real app: window.location.href = `/dashboard/hr/candidates/${candidateId}`;
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('CareerSync application initialized');
    
    // Check if we're on dashboard page
    const isDashboard = document.querySelector('.dashboard-container');
    if (isDashboard) {
        console.log('Dashboard page detected');
    }
    
    // Check if we're on analytics page
    const isAnalytics = document.querySelector('.ca-analytics-container');
    if (isAnalytics) {
        console.log('Analytics page detected');
    }
    
    // Check if we're on job postings page
    const isJobPostings = document.querySelector('.hr-job-postings-page');
    if (isJobPostings) {
        console.log('Job postings page detected');
    }
});

// Job Postings functionality
document.addEventListener('DOMContentLoaded', function() {
    // Post New Job buttons (header + sidebar)
    document.querySelectorAll('.post-job-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('jobModal').style.display = 'flex';
        });
    });

    // View applications button
    document.querySelectorAll('.view-applications-btn').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            openApplicationsModal(jobId);
        });
    });

    // Edit job button — open preview and immediately switch to edit mode
    document.querySelectorAll('.edit-job-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const jobId = this.getAttribute('data-job-id') || this.closest('tr')?.getAttribute('data-job-id');
            if (!jobId) {
                console.warn('Edit button clicked but no jobId found');
                return;
            }
            openJobPreview(jobId, true);
        });
    });

    // Delete job button
    document.querySelectorAll('.delete-job-btn').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            const jobRow = this.closest('tr');
            const jobTitle = jobRow.querySelector('td strong').textContent;
            
            showConfirmation(
                'Delete Job Posting',
                `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`,
                () => deleteJob(jobId, jobRow)
            );
        });
    });

    // Applications modal close button
    const closeApplicationsBtn = document.getElementById('closeApplicationsBtn');
    if (closeApplicationsBtn) {
        closeApplicationsBtn.addEventListener('click', function() {
            document.getElementById('applicationsModal').style.display = 'none';
        });
    }

    // Close applications modal button
    const closeApplicationsModal = document.getElementById('closeApplicationsModal');
    if (closeApplicationsModal) {
        closeApplicationsModal.addEventListener('click', function() {
            document.getElementById('applicationsModal').style.display = 'none';
        });
    }

    // Status filter for applications
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterApplications(this.value);
        });
    }

    // Search applications
    const searchApplications = document.getElementById('searchApplications');
    if (searchApplications) {
        searchApplications.addEventListener('input', function() {
            searchApplicationsList(this.value.toLowerCase());
        });
    }
});

// Open applications modal and load data
function openApplicationsModal(jobId) {
    const modal = document.getElementById('applicationsModal');
    const modalTitle = document.getElementById('applicationsModalTitle');
    const jobTitleElement = document.getElementById('applicationsJobTitle');
    const tableBody = document.getElementById('applicationsTableBody');
    
    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem;">
                <div class="simple-loading">
                    <span class="loading-spinner large" aria-hidden="true"></span>
                    <p>Loading applications...</p>
                </div>
            </td>
        </tr>
    `;
    
    modal.style.display = 'flex';
    
    // Fetch job details and applications
    fetch(`/api/job/${jobId}`)
        .then(response => response.json())
        .then(job => {
            modalTitle.textContent = `Applications for ${job.title}`;
            jobTitleElement.textContent = job.title;
            
            // Update stats
            document.getElementById('totalApplicationsCount').textContent = 'Loading...';
            document.getElementById('activeApplicationsCount').textContent = 'Loading...';
            
            // Load applications
            loadApplications(jobId);
        })
        .catch(error => {
            console.error('Error loading job details:', error);
            showNotification('Error loading job details', 'error');
        });
}

// Load applications for a job
function loadApplications(jobId) {
    fetch(`/api/applications/${jobId}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('applicationsTableBody');
            
            if (data.applications && data.applications.length > 0) {
                // Update stats
                document.getElementById('totalApplicationsCount').textContent = 
                    `${data.applications.length} applications`;
                
                const activeCount = data.applications.filter(app => app.status === 'pending' || app.status === 'shortlisted').length;
                document.getElementById('activeApplicationsCount').textContent = 
                    `${activeCount} active`;
                
                // Render applications
                renderApplications(data.applications);
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">
                            <p>No applications found for this job.</p>
                        </td>
                    </tr>
                `;
                
                document.getElementById('totalApplicationsCount').textContent = '0 applications';
                document.getElementById('activeApplicationsCount').textContent = '0 active';
            }
        })
        .catch(error => {
            console.error('Error loading applications:', error);
            showNotification('Error loading applications', 'error');
        });
}

// Render applications in table
function renderApplications(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    tableBody.innerHTML = '';
    
    applications.forEach(app => {
        const candidate = app.candidate;
        const initials = candidate.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        const statusClass = `status-${app.status}`;
        const statusText = app.status.charAt(0).toUpperCase() + app.status.slice(1);
        
        const appliedDate = new Date(app.applied_at);
        const formattedDate = appliedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <a href="#" class="candidate-profile-link" data-candidate-id="${candidate.id}">
                    <div class="candidate-avatar-small">${initials}</div>
                    <div>
                        <strong>${candidate.name}</strong>
                        ${candidate.experience ? `<div class="text-muted">${candidate.experience}</div>` : ''}
                    </div>
                </a>
            </td>
            <td>${candidate.email}</td>
            <td>${candidate.phone || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="application-actions">
                    <button class="btn-icon view-candidate-btn" title="View Profile" data-candidate-id="${candidate.id}">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="btn-icon update-status-btn" title="Update Status" data-application-id="${app.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners for candidate profile links
    document.querySelectorAll('.candidate-profile-link, .view-candidate-btn').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const candidateId = this.getAttribute('data-candidate-id') || 
                               this.closest('.view-candidate-btn').getAttribute('data-candidate-id');
            openCandidatePreview(candidateId);
        });
    });
    
    // Add event listeners for update status buttons
    document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', function() {
            const applicationId = this.getAttribute('data-application-id');
            updateApplicationStatus(applicationId);
        });
    });
}

// Filter applications by status
function filterApplications(status) {
    const rows = document.querySelectorAll('#applicationsTableBody tr');
    
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusElement = row.querySelector('.status-badge');
            const rowStatus = statusElement ? statusElement.textContent.toLowerCase() : '';
            row.style.display = rowStatus === status ? '' : 'none';
        }
    });
}

// Search applications
function searchApplicationsList(query) {
    const rows = document.querySelectorAll('#applicationsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

// Delete job
function deleteJob(jobId, jobRow) {
    fetch(`/api/job/${jobId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove row from table
            jobRow.remove();
            showNotification('Job deleted successfully', 'success');
            
            // Update job count in sidebar if it exists
            const jobBadge = document.querySelector('.sidebar-link[href*="job_postings"] .sidebar-badge');
            if (jobBadge) {
                const currentCount = parseInt(jobBadge.textContent) || 0;
                jobBadge.textContent = Math.max(0, currentCount - 1);
            }
        } else {
            showNotification(data.error || 'Failed to delete job', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting job:', error);
        showNotification('Error deleting job', 'error');
    });
}

// Update application status
function updateApplicationStatus(applicationId) {
    // You can implement a modal for updating application status
    showNotification('Update application status feature coming soon', 'info');
}

// Helper function for notifications
function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const messageElement = document.getElementById('toastMessage');
    const icon = toast.querySelector('.toast-icon');
    
    messageElement.textContent = message;
    
    // Set icon based on type
    switch(type) {
        case 'error':
            icon.className = 'fas fa-exclamation-circle toast-icon';
            toast.style.background = '#fee2e2';
            toast.style.color = '#991b1b';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle toast-icon';
            toast.style.background = '#fef3c7';
            toast.style.color = '#92400e';
            break;
        case 'info':
            icon.className = 'fas fa-info-circle toast-icon';
            toast.style.background = '#dbeafe';
            toast.style.color = '#1e40af';
            break;
        default:
            icon.className = 'fas fa-check-circle toast-icon';
            toast.style.background = '#d1fae5';
            toast.style.color = '#065f46';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}