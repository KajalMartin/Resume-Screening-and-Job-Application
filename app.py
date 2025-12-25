from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle form submission logic here
        pass
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Handle form submission logic here
        pass
    return render_template('signup.html')



# Error Page - 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404_page.html'), 404

if __name__ == '__main__':
    app.run(debug=True)