from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route("/")
def home():
    return "Python Executor API is running!"

@app.route("/run", methods=["POST"])
def run_python_code():
    data = request.json
    code = data.get("code", "")

    try:
        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True,
            text=True,
            timeout=5
        )
        output = result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        output = str(e)

    return jsonify({"output": output})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)  # Use port 10000 (Render needs it)
