from flask import Flask, render_template, request, redirect, url_for, session, flash
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

# Database Models
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'jobseeker' or 'hr'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships  
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

# Create tables
with app.app_context():
    if not os.path.exists('careersync.db'):
        db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Check if form data exists
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
            
            # Redirect based on user type
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
        # Check if all required fields are present
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
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered', 'error')
            return redirect(url_for('signup'))
        
        # Create new user
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
            
            # Auto login after signup
            session['user_id'] = new_user.id
            session['user_name'] = new_user.name
            session['user_type'] = new_user.user_type
            
            flash('Registration successful!', 'success')
            
            # Redirect based on user type
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
    return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if session['user_type'] == 'hr':
        return redirect(url_for('hr_dashboard'))
    else:
        return redirect(url_for('jobseeker_dashboard'))

@app.route('/dashboard/hr')
def hr_dashboard():
    if 'user_id' not in session or session['user_type'] != 'hr':
        return redirect(url_for('login'))
    
    return render_template('hr_dashboard.html', 
                         user_name=session['user_name'])

@app.route('/dashboard/jobseeker')
def jobseeker_dashboard():
    if 'user_id' not in session or session['user_type'] != 'jobseeker':
        return redirect(url_for('login'))
    
    return render_template('jobseeker_dashboard.html',
                         user_name=session['user_name'])


@app.route('/job-postings')
def job_postings():
  return render_template('hr-job-listing.html')

# Error Page - 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404_page.html'), 404

@app.route('/hr-dash')
def hr_dash():
    return render_template('hr_dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)