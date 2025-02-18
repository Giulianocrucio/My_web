from flask import Flask, request, jsonify, send_file
import matplotlib.pyplot as plt
import numpy as np
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

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

@app.route("/plot", methods=["POST"])
def generate_plot():
    """ Generate a plot based on the function sent from frontend """
    data = request.json
    function_str = data.get("function", "x**2")  # Default: y = x^2

    # Create x values
    x = np.linspace(-10, 10, 400)

    try:
        y = eval(function_str, {"x": x, "np": np})  # Safe eval with limited scope
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Create the plot
    plt.figure(figsize=(6, 4))
    plt.plot(x, y, label=f"y = {function_str}", color="blue")
    plt.axhline(0, color="black", linewidth=0.5)
    plt.axvline(0, color="black", linewidth=0.5)
    plt.legend()
    plt.grid()

    # Save the plot to a BytesIO object
    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format="png")
    plt.close()
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype="image/png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
