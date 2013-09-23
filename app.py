from flask import Flask
from flask import render_template
app = Flask(__name__)
app.debug = True

@app.route("/")
def hello():
	return render_template("leaderboard.htm")

if __name__ == "__main__":
	app.run()