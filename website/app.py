from flask import Flask, render_template, request, redirect, url_for, session, flash
from datetime import datetime
import os

app = Flask(__name__)

@app.route('/')
def home(): 
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)