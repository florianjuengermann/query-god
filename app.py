from flask import Flask, request, jsonify

import backend.main as main

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello this is the new version!"


@app.route("/api", methods=["POST"])
def api():
    data = request.get_json()
    print("data:", data)
    history = data["history"]
    res = main.run(history)
    return jsonify(res)
