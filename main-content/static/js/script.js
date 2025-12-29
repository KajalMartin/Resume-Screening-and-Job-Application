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
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = 'none';
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
    errorCode.style.opacity = '0';
    errorCode.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
        errorCode.style.transition = 'all 0.6s ease-out';
        errorCode.style.opacity = '1';
        errorCode.style.transform = 'scale(1)';
    }, 100);
});

document.addEventListener('DOMContentLoaded', function() {
            const labels = document.querySelectorAll('.user-type-label');
            const inputs = document.querySelectorAll('input[name="user_type"]');
            
            labels.forEach(label => {
                label.addEventListener('click', function() {
                    // Remove selected class from all labels
                    labels.forEach(l => l.classList.remove('user-type-selected'));
                    
                    // Add selected class to clicked label
                    this.classList.add('user-type-selected');
                    
                    // Trigger corresponding radio button
                    const inputId = this.getAttribute('for');
                    document.getElementById(inputId).checked = true;
                });
            });
        });

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Modal elements
const jobModal = document.getElementById('jobModal');
const candidateModal = document.getElementById('candidateModal');
const postJobBtn = document.getElementById('postJobBtn');
const closeJobModal = document.getElementById('closeJobModal');
const cancelJob = document.getElementById('cancelJob');
const closeCandidateModal = document.getElementById('closeCandidateModal');
const postJobForm = document.getElementById('postJobForm');
const viewProfileButtons = document.querySelectorAll('.view-profile');
const viewAllJobsBtn = document.getElementById('viewAllJobs');
const viewAllCandidatesBtn = document.getElementById('viewAllCandidates');

// Job Modal Functions
function openJobModal() {
    jobModal.style.display = 'flex';
}

function closeJobModalFunc() {
    jobModal.style.display = 'none';
    postJobForm.reset();
}

// Candidate Modal Functions
function openCandidateModal() {
    candidateModal.style.display = 'flex';
    updateProgressCircles();
}

function closeCandidateModalFunc() {
    candidateModal.style.display = 'none';
}

// Update progress circles
function updateProgressCircles() {
    const progressCircles = document.querySelectorAll('.circle-progress');
    progressCircles.forEach(circle => {
        const progress = circle.getAttribute('data-progress') || 92;
        circle.style.background = `conic-gradient(var(--primary-color) 0% ${progress}%, rgba(59, 130, 246, 0.2) ${progress}% 100%)`;
    });
}

// Form submission
postJobForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const jobData = Object.fromEntries(formData);
    
    // Here you would normally send data to server
    console.log('Job posting data:', jobData);
    
    // Show success message
    alert('Job posted successfully! It will appear in your dashboard shortly.');
    
    // Close modal
    closeJobModalFunc();
    
    // In a real app, you would update the dashboard here
});

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

// Event Listeners
postJobBtn.addEventListener('click', openJobModal);
closeJobModal.addEventListener('click', closeJobModalFunc);
cancelJob.addEventListener('click', closeJobModalFunc);
closeCandidateModal.addEventListener('click', closeCandidateModalFunc);

viewProfileButtons.forEach(button => {
    button.addEventListener('click', openCandidateModal);
});

viewAllJobsBtn.addEventListener('click', function(e) {
    e.preventDefault();
    alert('This would navigate to all jobs page in a real application');
    // window.location.href = '/dashboard/hr/jobs';
});

viewAllCandidatesBtn.addEventListener('click', function(e) {
    e.preventDefault();
    alert('This would navigate to all candidates page in a real application');
    // window.location.href = '/dashboard/hr/candidates';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === jobModal) {
        closeJobModalFunc();
    }
    if (event.target === candidateModal) {
        closeCandidateModalFunc();
    }
});

// Sidebar navigation active state
const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // In a real app, you would load the corresponding content
        const page = this.querySelector('span').textContent.toLowerCase();
        console.log('Navigating to:', page);
    });
});

// Initialize progress circles on load
document.addEventListener('DOMContentLoaded', updateProgressCircles);

// Simulate data loading
setTimeout(() => {
    console.log('Dashboard data loaded successfully');
    // You could add loading indicators here
}, 1000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + N to open new job modal
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openJobModal();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeJobModalFunc();
        closeCandidateModalFunc();
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

document.addEventListener('DOMContentLoaded', function() {
// Search functionality
const searchInput = document.getElementById('hrJobSearch');
searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.hr-table-row');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    updateJobCount();
});

// Filter functionality
const statusFilter = document.getElementById('hrStatusFilter');
const sortBy = document.getElementById('hrSortBy');

statusFilter.addEventListener('change', filterJobs);
sortBy.addEventListener('change', filterJobs);

function filterJobs() {
    const status = statusFilter.value;
    const sort = sortBy.value;
    const rows = Array.from(document.querySelectorAll('.hr-table-row'));
    
    // Filter by status
    rows.forEach(row => {
        if (status === '') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.hr-status-badge');
            const rowStatus = statusBadge.classList.contains('hr-status-active') ? 'active' :
                            statusBadge.classList.contains('hr-status-closed') ? 'closed' : 'draft';
            row.style.display = rowStatus === status ? '' : 'none';
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
                const appsA = parseInt(a.querySelector('.hr-count-badge').textContent);
                const appsB = parseInt(b.querySelector('.hr-count-badge').textContent);
                return appsB - appsA;
                
            default:
                return 0;
        }
    });

    // Reorder table rows
    const tbody = document.querySelector('.hr-data-table tbody');
    visibleRows.forEach(row => tbody.appendChild(row));
    
    updateJobCount();
}

// Select all checkbox
const selectAllCheckbox = document.getElementById('hrSelectAll');
const jobCheckboxes = document.querySelectorAll('.hr-job-checkbox');

selectAllCheckbox.addEventListener('change', function() {
    jobCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
});

// Clear filters
document.getElementById('hrClearFilters').addEventListener('click', function() {
    searchInput.value = '';
    statusFilter.value = '';
    sortBy.value = 'newest';
    
    const rows = document.querySelectorAll('.hr-table-row');
    rows.forEach(row => row.style.display = '');
    
    updateJobCount();
});

// Post new job button
document.getElementById('hrPostNewJob').addEventListener('click', function() {
    // Redirect to job posting page or open modal
    alert('Opening job posting form...');
});

// Action buttons
document.querySelectorAll('.hr-action-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.querySelector('i').className;
        const row = this.closest('.hr-table-row');
        const jobTitle = row.querySelector('.hr-job-info strong').textContent;
        
        if (action.includes('fa-trash')) {
            if (confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
                row.remove();
                updateJobCount();
            }
        } else if (action.includes('fa-eye')) {
            alert(`Viewing details for: ${jobTitle}`);
        } else if (action.includes('fa-edit')) {
            alert(`Editing: ${jobTitle}`);
        } else if (action.includes('fa-users')) {
            alert(`Viewing applications for: ${jobTitle}`);
        }
    });
});

// Row click
document.querySelectorAll('.hr-table-row').forEach(row => {
    row.addEventListener('click', function(e) {
        if (!e.target.closest('.hr-checkbox') && !e.target.closest('.hr-action-btn')) {
            const jobTitle = this.querySelector('.hr-job-info strong').textContent;
            alert(`Opening job details for: ${jobTitle}`);
        }
    });
});

// Pagination
document.querySelectorAll('.hr-pagination-page').forEach(page => {
    page.addEventListener('click', function() {
        document.querySelectorAll('.hr-pagination-page').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
    });
});

function updateJobCount() {
    const visibleRows = document.querySelectorAll('.hr-table-row[style!="display: none;"]');
    document.querySelector('.hr-table-count').textContent = `${visibleRows.length} jobs found`;
}
});

// Modal functions
function hrOpenBulkActionsModal() {
document.getElementById('hrBulkActionsModal').style.display = 'flex';
}

function hrCloseBulkActionsModal() {
document.getElementById('hrBulkActionsModal').style.display = 'none';
}

function hrBulkAction(action) {
alert(`Bulk action selected: ${action}`);
}

function hrConfirmBulkActions() {
const selectedJobs = Array.from(document.querySelectorAll('.hr-job-checkbox:checked'))
    .map(cb => cb.closest('.hr-table-row').querySelector('.hr-job-info strong').textContent);

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
    // Show bulk actions button or panel
    console.log(`${selectedCount} jobs selected for bulk actions`);
}
});

// Initialize page with animations
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
            caUpdateJobAnalysis();
        });

        // Update analysis based on selected job
        function caUpdateJobAnalysis() {
            const jobSelect = document.getElementById('caJobSelect');
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
            document.querySelectorAll('.ca-job-detail-item')[0].querySelector('.ca-job-detail-value').textContent = job.company;
            document.querySelectorAll('.ca-job-detail-item')[1].querySelector('.ca-job-detail-value').textContent = job.location;
            document.querySelectorAll('.ca-job-detail-item')[2].querySelector('.ca-job-detail-value').textContent = job.salary;
            document.querySelectorAll('.ca-job-detail-item')[3].querySelector('.ca-job-detail-value').textContent = job.experience;
            document.querySelectorAll('.ca-job-detail-item')[4].querySelector('.ca-job-detail-value').textContent = job.type;

            // Update overall score
            document.querySelector('.ca-score-value').textContent = `${job.overallScore}%`;
            document.querySelector('.ca-score-ring').style.background = `conic-gradient(
                var(--ca-primary) 0% ${job.overallScore}%,
                rgba(99, 102, 241, 0.2) ${job.overallScore}% 100%
            )`;

            // Update breakdown scores
            const breakdownItems = document.querySelectorAll('.ca-breakdown-item');
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

            // Update skills matching
            const skillItems = document.querySelectorAll('.ca-skill-match-item');
            skillItems[0].querySelector('.ca-skill-percentage').textContent = `${job.skills.python}%`;
            skillItems[0].querySelector('.ca-skill-match-fill').style.width = `${job.skills.python}%`;
            
            skillItems[1].querySelector('.ca-skill-percentage').textContent = `${job.skills.javascript}%`;
            skillItems[1].querySelector('.ca-skill-match-fill').style.width = `${job.skills.javascript}%`;
            
            skillItems[2].querySelector('.ca-skill-percentage').textContent = `${job.skills.aws}%`;
            skillItems[2].querySelector('.ca-skill-match-fill').style.width = `${job.skills.aws}%`;
            
            skillItems[3].querySelector('.ca-skill-percentage').textContent = `${job.skills.docker}%`;
            skillItems[3].querySelector('.ca-skill-match-fill').style.width = `${job.skills.docker}%`;
            
            skillItems[4].querySelector('.ca-skill-percentage').textContent = `${job.skills.ml}%`;
            skillItems[4].querySelector('.ca-skill-match-fill').style.width = `${job.skills.ml}%`;

            // Update match badge
            document.querySelector('.ca-match-badge').innerHTML = `<i class="fas fa-bolt"></i> ${job.overallScore}% Overall Match`;

            // Update color coding based on scores
            updateScoreColors();
        }

        function updateScoreColors() {
            document.querySelectorAll('.ca-skill-percentage').forEach(element => {
                const score = parseInt(element.textContent);
                element.className = 'ca-skill-percentage ';
                
                if (score >= 90) element.className += 'ca-match-excellent';
                else if (score >= 80) element.className += 'ca-match-good';
                else if (score >= 70) element.className += 'ca-match-average';
                else if (score >= 60) element.className += 'ca-match-poor';
                else element.className += 'ca-match-weak';
            });
        }

        // Action Functions
        function caDownloadReport() {
            alert('Downloading detailed analytics report...');
            // In production: Generate and download PDF report
        }

        function caScheduleInterview() {
            const candidateName = document.querySelector('.ca-profile-details h2').textContent;
            const jobTitle = document.querySelector('.ca-profile-title').textContent;
            alert(`Scheduling interview with ${candidateName} for ${jobTitle} position...`);
            // In production: Open calendar/scheduling modal
        }

        function caShortlistCandidate() {
            const candidateName = document.querySelector('.ca-profile-details h2').textContent;
            alert(`Candidate ${candidateName} has been added to shortlist!`);
            // In production: Update candidate status in database
        }

        function caRejectCandidate() {
            const candidateName = document.querySelector('.ca-profile-details h2').textContent;
            if (confirm(`Are you sure you want to reject ${candidateName}?`)) {
                alert(`Candidate ${candidateName} has been rejected.`);
                // In production: Update candidate status in database
            }
        }

        function caRequestMoreInfo() {
            const candidateName = document.querySelector('.ca-profile-details h2').textContent;
            alert(`Requesting additional information from ${candidateName}...`);
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
                document.querySelector('.ca-score-value').textContent = `${randomScore}%`;
                document.querySelector('.ca-match-badge').innerHTML = `<i class="fas fa-bolt"></i> ${randomScore}% Overall Match`;
                
                // Animate the update
                document.querySelector('.ca-score-value').style.transform = 'scale(1.1)';
                setTimeout(() => {
                    document.querySelector('.ca-score-value').style.transform = 'scale(1)';
                }, 300);
            }
        }

        // Simulate periodic updates (every 30 seconds)
        setInterval(caSimulateRealTimeUpdate, 30000);

        // Keyboard shortcuts
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
            return {
                candidateId: 12345,
                candidateName: "John Smith",
                jobId: document.getElementById('caJobSelect').value,
                overallScore: parseInt(document.querySelector('.ca-score-value').textContent),
                breakdown: {
                    skills: parseInt(document.querySelectorAll('.ca-breakdown-score')[0].textContent),
                    experience: parseInt(document.querySelectorAll('.ca-breakdown-score')[1].textContent),
                    education: parseInt(document.querySelectorAll('.ca-breakdown-score')[2].textContent),
                    culture: parseInt(document.querySelectorAll('.ca-breakdown-score')[3].textContent),
                    salary: parseInt(document.querySelectorAll('.ca-breakdown-score')[4].textContent)
                },
                skills: Array.from(document.querySelectorAll('.ca-skill-match-item')).map(item => ({
                    skill: item.querySelector('.ca-skill-name').textContent,
                    score: parseInt(item.querySelector('.ca-skill-percentage').textContent)
                })),
                timestamp: new Date().toISOString()
            };
        }

        // For API integration example
        console.log('Analytics data structure:', caGetAnalyticsData());