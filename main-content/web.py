# web.py - Updated with modal routes
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from flask_bcrypt import Bcrypt

app = Flask(__name__)

app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///careersync.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# -------------------------- Database Models -------------------
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'jobseeker' or 'hr'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with job postings
    job_postings = db.relationship('JobPosting', backref='hr', lazy=True)
    
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
    def get_initials(self):
        """Get first letters of first two words for avatar"""
        words = self.name.split()
        if len(words) >= 2:
            return f"{words[0][0]}{words[1][0]}".upper()
        elif len(words) == 1:
            return words[0][0].upper() * 2
        else:
            return "US"

class JobPosting(db.Model):
    __tablename__ = 'job_posting'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100))
    salary_range = db.Column(db.String(100))
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=False)
    job_type = db.Column(db.String(50), nullable=False)  # fulltime, parttime, contract, remote
    status = db.Column(db.String(20), default='active')  # active, closed, draft
    hr_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with applications
    applications = db.relationship('Application', backref='job', lazy=True)
    
    def to_dict(self):
        """Convert job posting to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'salary_range': self.salary_range,
            'description': self.description,
            'requirements': self.requirements,
            'job_type': self.job_type,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Candidate(db.Model):
    __tablename__ = 'candidate'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    resume_url = db.Column(db.String(500))
    skills = db.Column(db.Text)
    experience = db.Column(db.String(100))
    education = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert candidate to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'skills': self.skills,
            'experience': self.experience,
            'education': self.education,
            'resume_url': self.resume_url,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def get_initials(self):
        """Get initials for avatar"""
        words = self.name.split()
        if len(words) >= 2:
            return f"{words[0][0]}{words[1][0]}".upper()
        elif len(words) == 1:
            return words[0][0].upper() * 2
        else:
            return "CD"

class Application(db.Model):
    __tablename__ = 'application'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job_posting.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, shortlisted, rejected, hired
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    candidate = db.relationship('Candidate', backref='applications')

# Create tables
with app.app_context():
    db.create_all()

# --------------------- Routes -------------------------
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if not request.form.get('email') or not request.form.get('password'):
            flash('Please fill in all fields', 'error')
            return redirect(url_for('login'))
        
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            session['user_type'] = user.user_type
            
            if user.user_type == 'hr':
                return redirect(url_for('hr_dashboard'))
            else:
                return redirect(url_for('jobseeker_dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        required_fields = ['name', 'email', 'password', 'phone', 'user_type']
        for field in required_fields:
            if not request.form.get(field):
                flash(f'Please fill in the {field.replace("_", " ")} field', 'error')
                return redirect(url_for('signup'))
        
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        phone = request.form['phone']
        user_type = request.form['user_type']
        
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered', 'error')
            return redirect(url_for('signup'))
        
        new_user = User(
            name=name,
            email=email,
            phone=phone,
            user_type=user_type
        )
        new_user.set_password(password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            session['user_id'] = new_user.id
            session['user_name'] = new_user.name
            session['user_type'] = new_user.user_type
            
            flash('Registration successful!', 'success')
            
            if user_type == 'hr':
                return redirect(url_for('hr_dashboard'))
            else:
                return redirect(url_for('jobseeker_dashboard'))
                
        except Exception as e:
            db.session.rollback()
            flash(f'Registration failed: {str(e)}', 'error')
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully', 'success')
    return redirect(url_for('home'))

# Job Modal API Routes
@app.route('/api/job/<int:job_id>', methods=['GET', 'PUT', 'DELETE'])
def job_api(job_id):
    if 'user_id' not in session or session['user_type'] != 'hr':
        return jsonify({'error': 'Unauthorized'}), 401
    
    job = JobPosting.query.get_or_404(job_id)
    
    # Check if user owns this job
    if job.hr_id != session['user_id']:
        return jsonify({'error': 'Forbidden'}), 403
    
    if request.method == 'GET':
        return jsonify(job.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        # Update job fields
        job.title = data.get('title', job.title)
        job.company = data.get('company', job.company)
        job.location = data.get('location', job.location)
        job.salary_range = data.get('salary_range', job.salary_range)
        job.description = data.get('description', job.description)
        job.requirements = data.get('requirements', job.requirements)
        job.job_type = data.get('job_type', job.job_type)
        job.status = data.get('status', job.status)
        
        try:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Job updated successfully',
                'job': job.to_dict()
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            # Delete related applications first
            Application.query.filter_by(job_id=job_id).delete()
            
            db.session.delete(job)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Job deleted successfully'
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@app.route('/api/job/<int:job_id>/toggle-status', methods=['POST'])
def toggle_job_status(job_id):
    if 'user_id' not in session or session['user_type'] != 'hr':
        return jsonify({'error': 'Unauthorized'}), 401
    
    job = JobPosting.query.get_or_404(job_id)
    
    if job.hr_id != session['user_id']:
        return jsonify({'error': 'Forbidden'}), 403
    
    # Toggle between active and closed
    job.status = 'closed' if job.status == 'active' else 'active'
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Job status updated to {job.status}',
            'status': job.status
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Candidate Modal API Routes
@app.route('/api/candidate/<int:candidate_id>', methods=['GET', 'PUT', 'DELETE'])
def candidate_api(candidate_id):
    if 'user_id' not in session or session['user_type'] != 'hr':
        return jsonify({'error': 'Unauthorized'}), 401
    
    candidate = Candidate.query.get_or_404(candidate_id)
    
    if request.method == 'GET':
        return jsonify(candidate.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        # Update candidate fields
        candidate.name = data.get('name', candidate.name)
        candidate.email = data.get('email', candidate.email)
        candidate.phone = data.get('phone', candidate.phone)
        candidate.skills = data.get('skills', candidate.skills)
        candidate.experience = data.get('experience', candidate.experience)
        candidate.education = data.get('education', candidate.education)
        
        try:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Candidate updated successfully',
                'candidate': candidate.to_dict()
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            # Delete related applications
            Application.query.filter_by(candidate_id=candidate_id).delete()
            
            db.session.delete(candidate)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Candidate deleted successfully'
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

def get_dashboard_data(user_id):
    """Helper function to get dashboard data"""
    user = User.query.get(user_id)
    
    # Get job postings count
    job_count = JobPosting.query.filter_by(hr_id=user_id).count()
    
    # Get recent jobs (last 5)
    recent_jobs = JobPosting.query.filter_by(hr_id=user_id)\
        .order_by(JobPosting.created_at.desc())\
        .limit(5)\
        .all()
    
    # Get total applications
    total_applications = Application.query.join(JobPosting)\
        .filter(JobPosting.hr_id == user_id)\
        .count()
    
    # Get shortlisted applications
    shortlisted_count = Application.query.join(JobPosting)\
        .filter(JobPosting.hr_id == user_id, Application.status == 'shortlisted')\
        .count()
    
    # Get recent activities
    recent_activities = []
    
    # Get recent applications for activity
    recent_apps = Application.query\
        .join(JobPosting)\
        .filter(JobPosting.hr_id == user_id)\
        .order_by(Application.applied_at.desc())\
        .limit(3)\
        .all()
    
    for app in recent_apps:
        recent_activities.append({
            'title': f'New application from {app.candidate.name}',
            'description': f'Applied for {app.job.title}',
            'time_ago': 'Just now'  # In production, calculate time difference
        })
    
    # Get new candidates (last 4)
    new_candidates = Candidate.query\
        .join(Application, Candidate.id == Application.candidate_id)\
        .join(JobPosting, Application.job_id == JobPosting.id)\
        .filter(JobPosting.hr_id == user_id)\
        .order_by(Candidate.created_at.desc())\
        .limit(4)\
        .all()
    
    return {
        'user': user,
        'job_count': job_count,
        'recent_jobs': recent_jobs,
        'total_applications': total_applications,
        'shortlisted_count': shortlisted_count,
        'recent_activities': recent_activities,
        'new_candidates': new_candidates
    }

@app.route('/dashboard/hr')
def hr_dashboard():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    data = get_dashboard_data(user_id)
    
    return render_template('hr_dashboard.html', **data)

@app.route('/dashboard/jobseeker')
def jobseeker_dashboard():
    if 'user_id' not in session or session['user_type'] != 'jobseeker':
        return redirect(url_for('login'))
    
    return render_template('jobseeker_dashboard.html',
                         user_name=session['user_name'])

# Job Postings Routes
@app.route('/dashboard/hr/job-postings')
def job_postings():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    jobs = JobPosting.query.filter_by(hr_id=user_id)\
        .order_by(JobPosting.created_at.desc())\
        .all()
    
    return render_template('job_postings.html', 
                         jobs=jobs,
                         job_count=len(jobs))

@app.route('/dashboard/hr/create-job', methods=['POST'])
def create_job():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        try:
            new_job = JobPosting(
                title=request.form['title'],
                company=request.form['company'],
                location=request.form.get('location', ''),
                salary_range=request.form.get('salary_range', ''),
                description=request.form['description'],
                requirements=request.form['requirements'],
                job_type=request.form['job_type'],
                status='active',
                hr_id=session['user_id']
            )
            
            db.session.add(new_job)
            db.session.commit()
            
            flash('Job posted successfully!', 'success')
            return redirect(url_for('hr_dashboard'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error creating job: {str(e)}', 'error')
            return redirect(url_for('hr_dashboard'))
    
    return redirect(url_for('hr_dashboard'))

# Candidates Routes
@app.route('/dashboard/hr/candidates')
def candidate_list():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get candidates who applied to this HR's jobs
    candidates = Candidate.query\
        .join(Application, Candidate.id == Application.candidate_id)\
        .join(JobPosting, Application.job_id == JobPosting.id)\
        .filter(JobPosting.hr_id == user_id)\
        .distinct()\
        .order_by(Candidate.created_at.desc())\
        .all()
    
    return render_template('candidates.html',
                         candidates=candidates,
                         candidate_count=len(candidates))

# Applications Routes
@app.route('/dashboard/hr/applications')
def applications():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get applications for this HR's jobs
    apps = Application.query\
        .join(JobPosting, Application.job_id == JobPosting.id)\
        .filter(JobPosting.hr_id == user_id)\
        .order_by(Application.applied_at.desc())\
        .all()
    
    return render_template('applications.html',
                         applications=apps,
                         application_count=len(apps))

# Analytics Routes
@app.route('/dashboard/hr/analytics')
def analytics():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get analytics data
    total_jobs = JobPosting.query.filter_by(hr_id=user_id).count()
    active_jobs = JobPosting.query.filter_by(hr_id=user_id, status='active').count()
    total_applications = Application.query\
        .join(JobPosting)\
        .filter(JobPosting.hr_id == user_id)\
        .count()
    
    return render_template('analytics.html',
                         total_jobs=total_jobs,
                         active_jobs=active_jobs,
                         total_applications=total_applications)

# ------------------ Job Posting Action Buttons -----------------------------
@app.route('/api/applications/<int:job_id>')
def get_job_applications(job_id):
    if 'user_id' not in session or session['user_type'] != 'hr':
        return jsonify({'error': 'Unauthorized'}), 401
    
    job = JobPosting.query.get_or_404(job_id)
    
    # Check if user owns this job
    if job.hr_id != session['user_id']:
        return jsonify({'error': 'Forbidden'}), 403
    
    # Get applications with candidate details
    applications = Application.query\
        .filter_by(job_id=job_id)\
        .options(db.joinedload(Application.candidate))\
        .order_by(Application.applied_at.desc())\
        .all()
    
    applications_data = []
    for app in applications:
        applications_data.append({
            'id': app.id,
            'candidate_id': app.candidate_id,
            'job_id': app.job_id,
            'status': app.status,
            'applied_at': app.applied_at.strftime('%Y-%m-%d %H:%M:%S'),
            'candidate': {
                'id': app.candidate.id,
                'name': app.candidate.name,
                'email': app.candidate.email,
                'phone': app.candidate.phone,
                'skills': app.candidate.skills,
                'experience': app.candidate.experience,
                'education': app.candidate.education,
                'resume_url': app.candidate.resume_url
            }
        })
    
    return jsonify({
        'job_id': job_id,
        'job_title': job.title,
        'applications': applications_data,
        'total': len(applications_data)
    })

# Error Page - 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404_page.html'), 404

if __name__ == '__main__':
    app.run(debug=True)