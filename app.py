from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello this is the new version!"
