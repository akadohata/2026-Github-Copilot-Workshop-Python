import os
from flask import Flask, render_template


app = Flask(__name__)


@app.get("/")
def index():
	return render_template("index.html")


if __name__ == "__main__":
	debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")
	app.run(debug=debug_mode)
