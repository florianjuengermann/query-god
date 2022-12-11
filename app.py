from flask import Flask, request, jsonify

import backend.main as main

import subprocess
from io import StringIO
import sys

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
# flask paraters python and file name


@app.route("/run", methods=["POST"])
def run():
    content = request.get_json()
    python = content["python"]
    print(python)

    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    exec(python)
    sys.stdout = old_stdout
    output = redirected_output.getvalue()
    print(output)
    return output


if __name__ == "__main__":
    main.toy_test()
