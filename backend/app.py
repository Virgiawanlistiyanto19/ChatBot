from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

genai.configure(api_key="AIzaSyDyKZrW86vwFK0vJumqvaNBDZB3b1jy1dY")
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("message", "")
    try:
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": f"❌ Error: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
