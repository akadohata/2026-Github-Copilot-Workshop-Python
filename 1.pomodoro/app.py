from flask import Flask, render_template
import os

app = Flask(__name__)


@app.get("/")
def index():
	return render_template("index.html")


if __name__ == "__main__":
	debug_mode = os.getenv("FLASK_DEBUG") == "1"
	app.run(debug=debug_mode)
