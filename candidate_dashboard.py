# candidate_dashboard.py
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
import os
import uuid
from werkzeug.utils import secure_filename
from models import db, User, JobPosting, Candidate as CandidateModel, Application

candidate_bp = Blueprint('candidate', __name__, url_prefix='/dashboard/candidate')

# Candidate Dashboard Routes
@candidate_bp.route('/')
def candidate_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get candidate stats
    total_applications = Application.query.filter_by(candidate_id=user_id).count()
    pending_applications = Application.query.filter_by(candidate_id=user_id, status='pending').count()
    shortlisted_applications = Application.query.filter_by(candidate_id=user_id, status='shortlisted').count()
    rejected_applications = Application.query.filter_by(candidate_id=user_id, status='rejected').count()
    
    # Get recent applications (last 5)
    recent_apps = Application.query.filter_by(candidate_id=user_id)\
        .join(JobPosting)\
        .order_by(Application.applied_at.desc())\
        .limit(5)\
        .all()
    
    # Get recommended jobs (based on skills - simplified)
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    recommended_jobs = []
    if candidate and candidate.skills:
        # Simple recommendation based on skills (in real app, use ML)
        skills = candidate.skills.lower().split(',')
        for skill in skills[:3]:  # Check first 3 skills
            jobs = JobPosting.query.filter(
                JobPosting.description.ilike(f'%{skill.strip()}%') |
                JobPosting.requirements.ilike(f'%{skill.strip()}%')
            ).filter_by(status='active').limit(3).all()
            recommended_jobs.extend(jobs)
    
    # Remove duplicates
    recommended_jobs = list(set(recommended_jobs))[:5]
    
    # Get application timeline
    applications_timeline = Application.query.filter_by(candidate_id=user_id)\
        .join(JobPosting)\
        .order_by(Application.applied_at.desc())\
        .limit(10)\
        .all()
    
    return render_template('candidate_dashboard.html',
                         user_name=session['user_name'],
                         total_applications=total_applications,
                         pending_applications=pending_applications,
                         shortlisted_applications=shortlisted_applications,
                         rejected_applications=rejected_applications,
                         recent_apps=recent_apps,
                         recommended_jobs=recommended_jobs,
                         applications_timeline=applications_timeline)

@candidate_bp.route('/applications')
def applications():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get filter parameters
    status_filter = request.args.get('status', 'all')
    sort_by = request.args.get('sort', 'newest')
    
    # Base query
    query = Application.query.filter_by(candidate_id=user_id).join(JobPosting)
    
    # Apply filters
    if status_filter != 'all':
        query = query.filter(Application.status == status_filter)
    
    # Apply sorting
    if sort_by == 'newest':
        query = query.order_by(Application.applied_at.desc())
    elif sort_by == 'oldest':
        query = query.order_by(Application.applied_at.asc())
    elif sort_by == 'match':
        # Assuming match_score column exists, otherwise adjust
        query = query.order_by(Application.match_score.desc())
    elif sort_by == 'status':
        query = query.order_by(Application.status)
    
    applications = query.all()
    
    return render_template('candidate_applications.html',
                         applications=applications,
                         user_name=session['user_name'])

@candidate_bp.route('/job-search')
def job_search():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    # Get search parameters
    search_query = request.args.get('search', '')
    location_filter = request.args.get('location', '')
    experience_filter = request.args.get('experience', 'all')
    job_type_filter = request.args.get('job_type', 'all')
    
    # Base query for active jobs
    query = JobPosting.query.filter_by(status='active')
    
    # Apply filters
    if search_query:
        query = query.filter(
            JobPosting.title.ilike(f'%{search_query}%') |
            JobPosting.company.ilike(f'%{search_query}%') |
            JobPosting.description.ilike(f'%{search_query}%')
        )
    
    if location_filter:
        query = query.filter(JobPosting.location.ilike(f'%{location_filter}%'))
    
    if experience_filter != 'all':
        query = query.filter(JobPosting.experience.ilike(f'%{experience_filter}%'))
    
    if job_type_filter != 'all':
        query = query.filter(JobPosting.job_type == job_type_filter)
    
    # Get jobs
    jobs = query.order_by(JobPosting.created_at.desc()).all()
    
    # Check which jobs are already applied
    user_id = session['user_id']
    applied_job_ids = [app.job_id for app in 
                      Application.query.filter_by(candidate_id=user_id).all()]
    
    return render_template('candidate_job_search.html',
                         jobs=jobs,
                         applied_job_ids=applied_job_ids,
                         user_name=session['user_name'])

@candidate_bp.route('/profile')
def profile():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    return render_template('candidate_profile.html',
                         candidate=candidate,
                         user_name=session['user_name'])

@candidate_bp.route('/profile/update', methods=['POST'])
def update_profile():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    if candidate:
        candidate.name = request.form.get('name', candidate.name)
        candidate.email = request.form.get('email', candidate.email)
        candidate.phone = request.form.get('phone', candidate.phone)
        candidate.skills = request.form.get('skills', candidate.skills)
        candidate.experience = request.form.get('experience', candidate.experience)
        candidate.education = request.form.get('education', candidate.education)
        
        # Handle resume upload
        if 'resume' in request.files:
            resume_file = request.files['resume']
            if resume_file and resume_file.filename:
                filename = secure_filename(f"{user_id}_{resume_file.filename}")
                resume_path = os.path.join('uploads/resumes', filename)
                os.makedirs('uploads/resumes', exist_ok=True)
                resume_file.save(resume_path)
                candidate.resume_url = resume_path
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
    
    return redirect(url_for('candidate.profile'))

@candidate_bp.route('/apply/<int:job_id>')
def apply_job(job_id):
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Check if already applied
    existing_application = Application.query.filter_by(
        candidate_id=user_id,
        job_id=job_id
    ).first()
    
    if existing_application:
        flash('You have already applied for this job!', 'warning')
    else:
        # Create new application
        # Calculate match score (simplified - in real app, use ML)
        candidate = CandidateModel.query.get(user_id)
        job = JobPosting.query.get(job_id)
        
        match_score = 70  # Base score
        
        if candidate and job:
            if candidate.skills:
                skills = [s.strip().lower() for s in candidate.skills.split(',')]
                job_text = (job.description + ' ' + job.requirements).lower()
                matched_skills = sum(1 for skill in skills if skill in job_text)
                if skills:
                    match_score += min(30, (matched_skills / len(skills)) * 30)
        
        new_application = Application(
            candidate_id=user_id,
            job_id=job_id,
            status='pending',
            match_score=match_score
        )
        
        db.session.add(new_application)
        db.session.commit()
        
        flash(f'Application submitted successfully! Match Score: {match_score}%', 'success')
    
    return redirect(url_for('candidate.job_search'))

@candidate_bp.route('/resume-analysis')
def resume_analysis():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    # Analyze resume (simplified)
    analysis = {
        'profile_strength': 75,
        'skills_gap': ['Machine Learning', 'Cloud Computing'],
        'suggested_improvements': [
            'Add more quantifiable achievements',
            'Include specific project details',
            'Update skills section with latest technologies'
        ],
        'keyword_analysis': {
            'technical_skills': 8,
            'leadership': 3,
            'achievements': 5
        }
    }
    
    return render_template('candidate_resume_analysis.html',
                         candidate=candidate,
                         analysis=analysis,
                         user_name=session['user_name'])

# API Routes for candidate dashboard
@candidate_bp.route('/api/applications/stats')
def application_stats():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    stats = {
        'total': Application.query.filter_by(candidate_id=user_id).count(),
        'pending': Application.query.filter_by(candidate_id=user_id, status='pending').count(),
        'shortlisted': Application.query.filter_by(candidate_id=user_id, status='shortlisted').count(),
        'rejected': Application.query.filter_by(candidate_id=user_id, status='rejected').count(),
        'hired': Application.query.filter_by(candidate_id=user_id, status='hired').count()
    }
    
    return jsonify(stats)

@candidate_bp.route('/api/recommended-jobs')
def recommended_jobs_api():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    # Get recommended jobs (simplified)
    jobs = JobPosting.query.filter_by(status='active')\
        .order_by(JobPosting.created_at.desc())\
        .limit(10)\
        .all()
    
    jobs_data = []
    for job in jobs:
        jobs_data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'type': job.job_type,
            'posted_date': job.created_at.strftime('%b %d, %Y')
        })
    
    return jsonify({'jobs': jobs_data})
# candidate_dashboard.py
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
import os
import uuid
from werkzeug.utils import secure_filename
from models import db, User, JobPosting, Candidate as CandidateModel, Application

candidate_bp = Blueprint('candidate', __name__, url_prefix='/dashboard/candidate')

# Candidate Dashboard Routes
@candidate_bp.route('/')
def candidate_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get candidate stats
    total_applications = Application.query.filter_by(candidate_id=user_id).count()
    pending_applications = Application.query.filter_by(candidate_id=user_id, status='pending').count()
    shortlisted_applications = Application.query.filter_by(candidate_id=user_id, status='shortlisted').count()
    rejected_applications = Application.query.filter_by(candidate_id=user_id, status='rejected').count()
    
    # Get recent applications (last 5)
    recent_apps = Application.query.filter_by(candidate_id=user_id)\
        .join(JobPosting)\
        .order_by(Application.applied_at.desc())\
        .limit(5)\
        .all()
    
    # Get recommended jobs (based on skills - simplified)
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    recommended_jobs = []
    if candidate and candidate.skills:
        # Simple recommendation based on skills (in real app, use ML)
        skills = candidate.skills.lower().split(',')
        for skill in skills[:3]:  # Check first 3 skills
            jobs = JobPosting.query.filter(
                JobPosting.description.ilike(f'%{skill.strip()}%') |
                JobPosting.requirements.ilike(f'%{skill.strip()}%')
            ).filter_by(status='active').limit(3).all()
            recommended_jobs.extend(jobs)
    
    # Remove duplicates
    recommended_jobs = list(set(recommended_jobs))[:5]
    
    # Get application timeline
    applications_timeline = Application.query.filter_by(candidate_id=user_id)\
        .join(JobPosting)\
        .order_by(Application.applied_at.desc())\
        .limit(10)\
        .all()
    
    return render_template('candidate_dashboard.html',
                         user_name=session['user_name'],
                         total_applications=total_applications,
                         pending_applications=pending_applications,
                         shortlisted_applications=shortlisted_applications,
                         rejected_applications=rejected_applications,
                         recent_apps=recent_apps,
                         recommended_jobs=recommended_jobs,
                         applications_timeline=applications_timeline)

@candidate_bp.route('/applications')
def applications():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Get filter parameters
    status_filter = request.args.get('status', 'all')
    sort_by = request.args.get('sort', 'newest')
    
    # Base query
    query = Application.query.filter_by(candidate_id=user_id).join(JobPosting)
    
    # Apply filters
    if status_filter != 'all':
        query = query.filter(Application.status == status_filter)
    
    # Apply sorting
    if sort_by == 'newest':
        query = query.order_by(Application.applied_at.desc())
    elif sort_by == 'oldest':
        query = query.order_by(Application.applied_at.asc())
    elif sort_by == 'match':
        # Assuming match_score column exists, otherwise adjust
        query = query.order_by(Application.match_score.desc())
    elif sort_by == 'status':
        query = query.order_by(Application.status)
    
    applications = query.all()
    
    return render_template('candidate_applications.html',
                         applications=applications,
                         user_name=session['user_name'])

@candidate_bp.route('/job-search')
def job_search():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    # Get search parameters
    search_query = request.args.get('search', '')
    location_filter = request.args.get('location', '')
    experience_filter = request.args.get('experience', 'all')
    job_type_filter = request.args.get('job_type', 'all')
    
    # Base query for active jobs
    query = JobPosting.query.filter_by(status='active')
    
    # Apply filters
    if search_query:
        query = query.filter(
            JobPosting.title.ilike(f'%{search_query}%') |
            JobPosting.company.ilike(f'%{search_query}%') |
            JobPosting.description.ilike(f'%{search_query}%')
        )
    
    if location_filter:
        query = query.filter(JobPosting.location.ilike(f'%{location_filter}%'))
    
    if experience_filter != 'all':
        query = query.filter(JobPosting.experience.ilike(f'%{experience_filter}%'))
    
    if job_type_filter != 'all':
        query = query.filter(JobPosting.job_type == job_type_filter)
    
    # Get jobs
    jobs = query.order_by(JobPosting.created_at.desc()).all()
    
    # Check which jobs are already applied
    user_id = session['user_id']
    applied_job_ids = [app.job_id for app in 
                      Application.query.filter_by(candidate_id=user_id).all()]
    
    return render_template('candidate_job_search.html',
                         jobs=jobs,
                         applied_job_ids=applied_job_ids,
                         user_name=session['user_name'])

@candidate_bp.route('/profile')
def profile():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    return render_template('candidate_profile.html',
                         candidate=candidate,
                         user_name=session['user_name'])

@candidate_bp.route('/profile/update', methods=['POST'])
def update_profile():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    if candidate:
        candidate.name = request.form.get('name', candidate.name)
        candidate.email = request.form.get('email', candidate.email)
        candidate.phone = request.form.get('phone', candidate.phone)
        candidate.skills = request.form.get('skills', candidate.skills)
        candidate.experience = request.form.get('experience', candidate.experience)
        candidate.education = request.form.get('education', candidate.education)
        
        # Handle resume upload
        if 'resume' in request.files:
            resume_file = request.files['resume']
            if resume_file and resume_file.filename:
                filename = secure_filename(f"{user_id}_{resume_file.filename}")
                resume_path = os.path.join('uploads/resumes', filename)
                os.makedirs('uploads/resumes', exist_ok=True)
                resume_file.save(resume_path)
                candidate.resume_url = resume_path
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
    
    return redirect(url_for('candidate.profile'))

@candidate_bp.route('/apply/<int:job_id>')
def apply_job(job_id):
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    # Check if already applied
    existing_application = Application.query.filter_by(
        candidate_id=user_id,
        job_id=job_id
    ).first()
    
    if existing_application:
        flash('You have already applied for this job!', 'warning')
    else:
        # Create new application
        # Calculate match score (simplified - in real app, use ML)
        candidate = CandidateModel.query.get(user_id)
        job = JobPosting.query.get(job_id)
        
        match_score = 70  # Base score
        
        if candidate and job:
            if candidate.skills:
                skills = [s.strip().lower() for s in candidate.skills.split(',')]
                job_text = (job.description + ' ' + job.requirements).lower()
                matched_skills = sum(1 for skill in skills if skill in job_text)
                if skills:
                    match_score += min(30, (matched_skills / len(skills)) * 30)
        
        new_application = Application(
            candidate_id=user_id,
            job_id=job_id,
            status='pending',
            match_score=match_score
        )
        
        db.session.add(new_application)
        db.session.commit()
        
        flash(f'Application submitted successfully! Match Score: {match_score}%', 'success')
    
    return redirect(url_for('candidate.job_search'))

@candidate_bp.route('/resume-analysis')
def resume_analysis():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    # Analyze resume (simplified)
    analysis = {
        'profile_strength': 75,
        'skills_gap': ['Machine Learning', 'Cloud Computing'],
        'suggested_improvements': [
            'Add more quantifiable achievements',
            'Include specific project details',
            'Update skills section with latest technologies'
        ],
        'keyword_analysis': {
            'technical_skills': 8,
            'leadership': 3,
            'achievements': 5
        }
    }
    
    return render_template('candidate_resume_analysis.html',
                         candidate=candidate,
                         analysis=analysis,
                         user_name=session['user_name'])

# API Routes for candidate dashboard
@candidate_bp.route('/api/applications/stats')
def application_stats():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    
    stats = {
        'total': Application.query.filter_by(candidate_id=user_id).count(),
        'pending': Application.query.filter_by(candidate_id=user_id, status='pending').count(),
        'shortlisted': Application.query.filter_by(candidate_id=user_id, status='shortlisted').count(),
        'rejected': Application.query.filter_by(candidate_id=user_id, status='rejected').count(),
        'hired': Application.query.filter_by(candidate_id=user_id, status='hired').count()
    }
    
    return jsonify(stats)

@candidate_bp.route('/api/recommended-jobs')
def recommended_jobs_api():
    if 'user_id' not in session or session.get('user_type') != 'jobseeker':
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    candidate = CandidateModel.query.filter_by(id=user_id).first()
    
    # Get recommended jobs (simplified)
    jobs = JobPosting.query.filter_by(status='active')\
        .order_by(JobPosting.created_at.desc())\
        .limit(10)\
        .all()
    
    jobs_data = []
    for job in jobs:
        jobs_data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'type': job.job_type,
            'posted_date': job.created_at.strftime('%b %d, %Y')
        })
    
    return jsonify({'jobs': jobs_data})