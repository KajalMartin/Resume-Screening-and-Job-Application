from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404_page.html'), 404

# @app.route('/error')
# def error():
#     return render_template('404_page.html')

if __name__ == '__main__':
    app.run(debug=True)