from flask import Flask
from flask import render_template
import evaluate
app = Flask(__name__)
app.debug = True


baselines = [
	("AMiner",0.3),
	("LRegression",0.2)
]
@app.route("/")
def hello():
	data = []
	teams = evaluate.readTeamInfo()
	for t in teams:
		f = open("result/"+str(t.id))
		t.bestScore = float(f.readline())
		t.lastScore = float(f.readline())
		t.lastUpdate = f.readline()[0:-1]

		f.close()
	
	for bl in baselines:
		t = evaluate.Team()
		t.members = bl[0]
		t.bestScore = bl[1]
		t.isBaseline = True
		teams.append(t)

	teams.sort(key=lambda x:x.bestScore,reverse=True)
	rank = 1
	for t in teams:
		if not t.isBaseline:
			t.rank = rank
			rank += 1
	return render_template("leaderboard.htm",teams=teams)

if __name__ == "__main__":
	app.run()