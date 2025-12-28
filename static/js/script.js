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
