from flask import Flask, request, render_template_string

app = Flask(__name__)

ROLES = {
    "AI Engineer": {
        "skills": ["python", "machine learning", "tensorflow", "deep learning", "openai", "api"],
        "interests": ["ai", "automation", "chatbots", "research"],
        "path": ["Python Basics", "Machine Learning", "TensorFlow", "OpenAI API", "AI Projects"]
    },
    "Data Analyst": {
        "skills": ["excel", "sql", "python", "pandas", "power bi"],
        "interests": ["data", "reports", "business", "analysis"],
        "path": ["Excel", "SQL", "Python Pandas", "Data Visualization", "Dashboards"]
    },
    "Backend Developer": {
        "skills": ["python", "flask", "django", "api", "database"],
        "interests": ["web apps", "servers", "apis"],
        "path": ["Python OOP", "Flask", "REST API", "Database", "Deployment"]
    },
    "Frontend Developer": {
        "skills": ["html", "css", "javascript", "react"],
        "interests": ["design", "ui", "websites"],
        "path": ["HTML", "CSS", "JavaScript", "React", "Responsive Design"]
    },
    "Cybersecurity Analyst": {
        "skills": ["linux", "networking", "security", "python"],
        "interests": ["security", "hacking", "protection"],
        "path": ["Networking", "Linux", "Security Basics", "Python Scripting", "OWASP"]
    }
}


def clean(text):
    return [x.strip().lower() for x in text.split(",") if x.strip()]


def recommend(skills, interests):
    results = []

    for role, info in ROLES.items():
        skill_score = len(set(skills) & set(info["skills"]))
        interest_score = len(set(interests) & set(info["interests"]))

        total = len(info["skills"]) + len(info["interests"])
        matched = skill_score + interest_score
        percent = round((matched / total) * 100)

        results.append({
            "role": role,
            "score": percent,
            "path": info["path"]
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)


HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AI Career Recommendation Tool</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #071a3d, #111827);
            color: white;
        }

        .container {
            width: 90%;
            margin: auto;
            padding: 30px;
        }

        h1 {
            text-align: center;
            font-size: 42px;
        }

        .subtitle {
            text-align: center;
            color: #c084fc;
            font-size: 22px;
            margin-bottom: 30px;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 20px;
        }

        .card {
            background: white;
            color: #111827;
            border-radius: 18px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        input, textarea {
            width: 100%;
            padding: 12px;
            margin: 10px 0 20px;
            border-radius: 10px;
            border: 1px solid #ccc;
            font-size: 15px;
        }

        button {
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        .role {
            border-bottom: 1px solid #ddd;
            padding: 15px 0;
        }

        .score {
            color: #16a34a;
            font-weight: bold;
            font-size: 22px;
        }

        .progress {
            height: 12px;
            background: #e5e7eb;
            border-radius: 20px;
            overflow: hidden;
        }

        .bar {
            height: 100%;
            background: #22c55e;
        }

        ul {
            line-height: 1.7;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 18px;
            color: #facc15;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Career Recommendation Tool</h1>
        <p class="subtitle">Personalized Career Paths for Interns</p>

        <div class="grid">
            <div class="card">
                <h2>1. Your Profile</h2>
                <form method="POST">
                    <label>Skills</label>
                    <textarea name="skills" placeholder="Python, Machine Learning, SQL">{{ skills_text }}</textarea>

                    <label>Interests</label>
                    <textarea name="interests" placeholder="AI, Data Science, Automation">{{ interests_text }}</textarea>

                    <button type="submit">Get Recommendations</button>
                </form>
            </div>

            <div class="card">
                <h2>2. Top Career Recommendations</h2>

                {% if recommendations %}
                    {% for item in recommendations[:3] %}
                        <div class="role">
                            <h3>{{ loop.index }}. {{ item.role }}</h3>
                            <p>Match Score: <span class="score">{{ item.score }}%</span></p>

                            <div class="progress">
                                <div class="bar" style="width: {{ item.score }}%;"></div>
                            </div>

                            <h4>Learning Path</h4>
                            <ul>
                                {% for step in item.path %}
                                    <li>{{ step }}</li>
                                {% endfor %}
                            </ul>
                        </div>
                    {% endfor %}
                {% else %}
                    <p>Enter your skills and interests to get career suggestions.</p>
                {% endif %}
            </div>

            <div class="card">
                <h2>3. Your Progress</h2>

                {% if recommendations %}
                    <p><b>Current Path:</b> {{ recommendations[0].role }}</p>
                    <p><b>Overall Progress:</b> {{ recommendations[0].score }}%</p>

                    <div class="progress">
                        <div class="bar" style="width: {{ recommendations[0].score }}%;"></div>
                    </div>

                    <h4>Suggested Topics</h4>
                    <ul>
                        {% for step in recommendations[0].path %}
                            <li>{{ step }}</li>
                        {% endfor %}
                    </ul>
                {% else %}
                    <p>No progress yet.</p>
                {% endif %}
            </div>
        </div>

        <div class="footer">
            Keep learning, keep building, and shape your future with the right skills.
        </div>
    </div>
</body>
</html>
"""


@app.route("/", methods=["GET", "POST"])
def home():
    recommendations = []
    skills_text = ""
    interests_text = ""

    if request.method == "POST":
        skills_text = request.form.get("skills", "")
        interests_text = request.form.get("interests", "")

        skills = clean(skills_text)
        interests = clean(interests_text)

        recommendations = recommend(skills, interests)

    return render_template_string(
        HTML,
        recommendations=recommendations,
        skills_text=skills_text,
        interests_text=interests_text
    )


if __name__ == "__main__":
    app.run(debug=True)