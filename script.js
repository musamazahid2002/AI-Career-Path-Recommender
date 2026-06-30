const careers = [
  {
    title: "AI Engineer",
    icon: "🤖",
    keywords: ["python", "machine learning", "tensorflow", "ai", "automation", "research", "deep learning", "openai"],
    path: ["Python Basics", "Machine Learning Fundamentals", "Deep Learning with TensorFlow", "Build AI Projects", "Learn OpenAI API"],
    projects: ["AI resume screener", "Image classifier", "Career chatbot", "Text summarizer"],
  },
  {
    title: "Data Analyst",
    icon: "📊",
    keywords: ["excel", "sql", "data analysis", "python", "pandas", "visualization", "dashboard", "power bi"],
    path: ["Excel & Data Cleaning", "SQL for Data Analysis", "Python Pandas and NumPy", "Data Visualization", "Dashboard Building"],
    projects: ["Sales dashboard", "Student result analysis", "Customer churn report", "Excel automation"],
  },
  {
    title: "Backend Developer",
    icon: "💻",
    keywords: ["python", "django", "flask", "rest api", "database", "sql", "authentication", "deployment"],
    path: ["Python OOP", "REST APIs with Flask/Django", "Database Design", "Authentication", "Deployment"],
    projects: ["Task manager API", "Auth system", "Blog backend", "Internship portal API"],
  },
  {
    title: "Frontend Developer",
    icon: "🎨",
    keywords: ["html", "css", "javascript", "react", "ui", "web design", "frontend"],
    path: ["HTML CSS Basics", "JavaScript DOM", "Responsive Design", "React Basics", "Portfolio Website"],
    projects: ["Portfolio site", "Weather app", "Landing page", "Dashboard UI"],
  },
  {
    title: "Cloud Engineer",
    icon: "☁️",
    keywords: ["aws", "azure", "docker", "linux", "cloud", "devops", "deployment", "networking"],
    path: ["Linux Basics", "Cloud Fundamentals", "Docker", "CI/CD", "Deploy Real Apps"],
    projects: ["Deploy web app", "Dockerized API", "Cloud storage demo", "CI/CD pipeline"],
  },
  {
    title: "Cybersecurity Analyst",
    icon: "🛡️",
    keywords: ["security", "cybersecurity", "networking", "linux", "ethical hacking", "risk", "monitoring"],
    path: ["Networking Basics", "Linux Security", "Web Security", "Security Tools", "Incident Response"],
    projects: ["Vulnerability checklist", "Log analyzer", "Phishing detector", "Security report"],
  },
];

const defaultProfile = {
  name: "Usama Zahid",
  level: "Intermediate",
  skills: "Python, Machine Learning, TensorFlow, SQL, Data Analysis",
  interests: "AI, Data Science, Automation, Research",
  goal: "Get an AI internship",
};

const elements = {
  name: document.getElementById("name"),
  level: document.getElementById("level"),
  skills: document.getElementById("skills"),
  interests: document.getElementById("interests"),
  goal: document.getElementById("goal"),
  recommendations: document.getElementById("recommendations"),
  summary: document.getElementById("summaryText"),
  currentPath: document.getElementById("currentPath"),
  overallBar: document.getElementById("overallBar"),
  progressPercent: document.getElementById("progressPercent"),
  topicHeading: document.getElementById("topicHeading"),
  topicList: document.getElementById("topicList"),
  chart: document.getElementById("chart"),
  projectIdeas: document.getElementById("projectIdeas"),
  missingSkills: document.getElementById("missingSkills"),
  chatMessages: document.getElementById("chatMessages"),
  chatInput: document.getElementById("chatInput"),
};

let rankedCareers = [];
let activeCareer = null;

function getWords(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[\n,]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function calculateScore(career, userWords, level) {
  const matches = career.keywords.filter(keyword =>
    userWords.some(word => word.includes(keyword) || keyword.includes(word))
  );

  const levelBonus = { Beginner: 8, Intermediate: 15, Advanced: 20 }[level] || 10;
  let score = Math.round((matches.length / career.keywords.length) * 80) + levelBonus;
  if (matches.length >= 4) score += 3;
  return Math.min(96, Math.max(35, score));
}

function getProgressKey() {
  return `progress-${activeCareer?.title || "default"}`;
}

function getProgress() {
  const progress = JSON.parse(localStorage.getItem(getProgressKey())) || [];
  return Array.isArray(progress) ? progress : [];
}

function saveProgress(progress) {
  localStorage.setItem(getProgressKey(), JSON.stringify(progress));
}

function clearAllProgress() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("progress-")) {
      localStorage.removeItem(key);
    }
  });
}

function createRecommendationCard(career, index) {
  const pathItems = career.path.map(item => `<li>${item}</li>`).join("");
  return `
    <article class="recommendation">
      <div class="rank">${index + 1}</div>
      <div class="icon">${career.icon}</div>
      <div>
        <h3>${career.title}</h3>
        <p>Match Score <span class="score">${career.score}%</span></p>
        <div class="meter"><span style="width:${career.score}%"></span></div>
      </div>
      <div class="path">
        <h4>Learning Path</h4>
        <ul>${pathItems}</ul>
      </div>
    </article>
  `;
}

function renderProgress() {
  if (!activeCareer) {
    elements.currentPath.textContent = "Choose a career path";
    elements.topicHeading.textContent = "Learning Topics";
    elements.topicList.innerHTML = '<li class="empty-state">Complete your profile to unlock a personalized roadmap.</li>';
    elements.overallBar.style.width = "0%";
    elements.progressPercent.textContent = "0%";
    elements.chart.innerHTML = "";
    return;
  }

  const saved = getProgress();
  elements.currentPath.textContent = activeCareer.title;
  elements.topicHeading.textContent = `Learning Topics (${saved.length}/${activeCareer.path.length})`;

  elements.topicList.innerHTML = activeCareer.path.map((topic, index) => {
    const isChecked = saved.includes(index);
    const statusText = isChecked ? "Completed" : index < saved.length ? "In Progress" : "Not Started";
    return `
      <li>
        <input type="checkbox" data-index="${index}" ${isChecked ? "checked" : ""} />
        <div>${topic}<span>${statusText}</span></div>
      </li>
    `;
  }).join("");

  const percent = Math.round((saved.length / activeCareer.path.length) * 100);
  elements.overallBar.style.width = `${percent}%`;
  elements.progressPercent.textContent = `${percent}%`;

  const heights = [15, 35, Math.max(45, percent - 10), Math.max(10, percent)];
  elements.chart.innerHTML = heights.map(height => `<span style="height:${height}%"></span>`).join("");
}

function renderInsights() {
  if (!activeCareer) {
    elements.projectIdeas.innerHTML = "";
    elements.missingSkills.innerHTML = "";
    return;
  }

  const userWords = [...getWords(elements.skills.value), ...getWords(elements.interests.value)];
  const missing = activeCareer.keywords.filter(keyword =>
    !userWords.some(word => word.includes(keyword) || keyword.includes(word))
  ).slice(0, 5);

  elements.projectIdeas.innerHTML = activeCareer.projects.map(project => `<li>${project}</li>`).join("");
  elements.missingSkills.innerHTML = missing.length
    ? missing.map(skill => `<li>${skill}</li>`).join("")
    : `<li>You already match the main skills.</li>`;
}

function updateRecommendations() {
  const userWords = [
    ...getWords(elements.skills.value),
    ...getWords(elements.interests.value),
    ...getWords(elements.goal.value),
  ];

  rankedCareers = careers
    .map(career => ({ ...career, score: calculateScore(career, userWords, elements.level.value) }))
    .sort((a, b) => b.score - a.score);

  activeCareer = rankedCareers[0] || careers[0];
  elements.recommendations.innerHTML = rankedCareers.slice(0, 4).map(createRecommendationCard).join("");

  elements.summary.textContent = `${elements.name.value}, your strongest match is ${activeCareer.title} with ${activeCareer.score}% score. Focus on ${activeCareer.path.slice(0, 3).join(", ")} and build portfolio projects to improve your internship chances.`;

  renderProgress();
  renderInsights();
}

function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.textContent = text;
  elements.chatMessages.appendChild(message);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function chatbotReply(question) {
  const q = question.toLowerCase();
  const career = activeCareer || rankedCareers[0] || careers[0];
  const userSkills = getWords(elements.skills.value);
  const missing = career.keywords.filter(keyword => !userSkills.some(word => word.includes(keyword) || keyword.includes(word))).slice(0, 4);

  if (q.includes("30") || q.includes("plan") || q.includes("roadmap")) {
    return `30-day plan for ${career.title}: Week 1 learn ${career.path[0]}, Week 2 practice ${career.path[1]}, Week 3 build a mini project, Week 4 polish your GitHub, CV and LinkedIn.`;
  }
  if (q.includes("project")) {
    return `Best projects for ${career.title}: ${career.projects.join(", ")}. Start with one simple project and deploy it online.`;
  }
  if (q.includes("interview")) {
    return `Prepare by revising fundamentals, explaining your projects clearly, practicing 20 common questions, and doing mock interviews. For ${career.title}, focus on ${career.path.slice(0, 3).join(", ")}.`;
  }
  if (q.includes("missing") || q.includes("skill")) {
    return missing.length ? `You should improve these skills: ${missing.join(", ")}. Add them one by one to your weekly learning plan.` : `Your skills match this path well. Now build projects and improve problem-solving.`;
  }
  if (q.includes("internship") || q.includes("job")) {
    return `For internships: create 2 strong projects, upload them on GitHub, improve your LinkedIn, prepare a one-page CV and apply daily to relevant roles.`;
  }
  return `For your current goal, I recommend focusing on ${career.title}. Next step: complete "${career.path[0]}", then build a small portfolio project.`;
}

function saveProfile() {
  const profile = {
    name: elements.name.value,
    level: elements.level.value,
    skills: elements.skills.value,
    interests: elements.interests.value,
    goal: elements.goal.value,
  };
  localStorage.setItem("career-profile", JSON.stringify(profile));
  updateRecommendations();
  addMessage("Profile saved successfully in your browser.");
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("career-profile"));
  if (!profile) return;
  Object.keys(profile).forEach(key => {
    if (elements[key]) elements[key].value = profile[key];
  });
}

function resetApp() {
  Object.entries(defaultProfile).forEach(([key, value]) => {
    if (elements[key]) elements[key].value = value;
  });

  clearAllProgress();
  localStorage.removeItem("career-profile");
  rankedCareers = [];
  activeCareer = null;
  elements.recommendations.innerHTML = '<div class="summary">Reset complete. Enter a new profile and generate fresh recommendations.</div>';
  elements.summary.textContent = "Your progress and profile have been reset. Create a new plan to start again.";
  elements.projectIdeas.innerHTML = "";
  elements.missingSkills.innerHTML = "";
  renderProgress();
  elements.chatMessages.innerHTML = "";
  addMessage("Your progress and profile were reset. Ask me for a new roadmap whenever you are ready.");
}

function exportReport() {
  if (!activeCareer) {
    addMessage("Generate recommendations first so that an export report can be created.");
    return;
  }

  const saved = getProgress().length;
  const report = `AI Career Recommendation Report\n\nName: ${elements.name.value}\nLevel: ${elements.level.value}\nGoal: ${elements.goal.value}\nBest Career: ${activeCareer.title}\nMatch Score: ${activeCareer.score}%\nProgress: ${saved}/${activeCareer.path.length}\n\nLearning Path:\n- ${activeCareer.path.join("\n- ")}\n\nProject Ideas:\n- ${activeCareer.projects.join("\n- ")}`;

  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "career-recommendation-report.txt";
  link.click();
}

document.getElementById("recommendBtn").addEventListener("click", () => {
  updateRecommendations();
});
document.getElementById("saveBtn").addEventListener("click", saveProfile);
document.getElementById("exportBtn").addEventListener("click", exportReport);
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset your profile, progress, and chat history?")) {
    resetApp();
  }
});

elements.topicList.addEventListener("change", event => {
  if (event.target.type !== "checkbox") return;
  const index = Number(event.target.dataset.index);
  let progress = getProgress();
  progress = event.target.checked ? [...new Set([...progress, index])] : progress.filter(item => item !== index);
  saveProgress(progress.sort((a, b) => a - b));
  renderProgress();
});

document.getElementById("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const question = elements.chatInput.value.trim();
  if (!question) return;
  addMessage(question, "user");
  elements.chatInput.value = "";
  setTimeout(() => addMessage(chatbotReply(question)), 300);
});

document.querySelectorAll(".quick-prompts button").forEach(button => {
  button.addEventListener("click", () => {
    elements.chatInput.value = button.dataset.prompt;
    document.getElementById("chatForm").dispatchEvent(new Event("submit"));
  });
});

document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("click", () => {
    const target = document.querySelector(card.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.getElementById("clearChatBtn").addEventListener("click", () => {
  elements.chatMessages.innerHTML = "";
  addMessage("Hi! I am your AI career assistant. Ask me about your roadmap, skills, projects or internships.");
});

loadProfile();
updateRecommendations();
addMessage("Hi! I am your AI career assistant. Ask me about your roadmap, skills, projects or internships.");
