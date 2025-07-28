// Theme management
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.querySelector(".sun-icon");
const moonIcon = document.querySelector(".moon-icon");

let currentTheme = localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", currentTheme);

if (currentTheme === "dark") {
  sunIcon.style.display = "none";
  moonIcon.style.display = "block";
}

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);

  if (currentTheme === "dark") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
});

// Topics configuration - Updated with real-time data structure
const topics = [
  {
    id: "matematika",
    name: "Matematika",
    icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  },
  {
    id: "sains",
    name: "Sains",
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24l-4.24 4.24"/>',
  },
  {
    id: "sejarah",
    name: "Sejarah",
    icon: '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  },
  {
    id: "bahasa-inggris",
    name: "Bahasa Inggris",
    icon: '<path d="M2.5 17a24.12 24.12 0 010-10 2 2 0 011.4-1.4 49.56 49.56 0 0116.2 0A2 2 0 0121.5 7a24.12 24.12 0 010 10 2 2 0 01-1.4 1.4 49.55 49.55 0 01-16.2 0A2 2 0 012.5 17z"/><path d="m7 8l4 4 4-4"/>',
  },
  {
    id: "logika",
    name: "Logika",
    icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  },
  {
    id: "geografi",
    name: "Geografi",
    icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/>',
  },
  {
    id: "teknologi",
    name: "Teknologi",
    icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  },
  {
    id: "pengetahuan-umum",
    name: "Pengetahuan Umum",
    icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  },
];

// Enhanced data management functions
function getQuizProgress() {
  return JSON.parse(localStorage.getItem("quizProgress") || "{}");
}

function getQuizSession() {
  return JSON.parse(localStorage.getItem("currentQuizSession") || "null");
}

function getAllQuizHistory() {
  return JSON.parse(localStorage.getItem("quizHistory") || "[]");
}

function calculateOverallStats() {
  const progress = getQuizProgress();
  const history = getAllQuizHistory();
  const session = getQuizSession();

  let totalQuestions = 0;
  let correctAnswers = 0;
  let totalTime = 0;
  let completedSessions = 0;

  // Calculate from progress data
  Object.values(progress).forEach((topicData) => {
    Object.values(topicData).forEach((difficultyData) => {
      Object.values(difficultyData).forEach((levelData) => {
        if (levelData.completed) {
          totalQuestions += 10; // Each level has 10 questions
          correctAnswers += Math.floor(levelData.score / 10); // Assuming 10 points per correct answer
          totalTime += levelData.timeSpent || 300; // Default 5 minutes if no time recorded
          completedSessions++;
        }
      });
    });
  });

  // Add current session data if available
  if (session && session.answers) {
    const sessionCorrect = session.answers.filter(
      (answer) => answer.correct
    ).length;
    const sessionTotal = session.answers.length;
    const sessionTime = session.timeSpent || 0;

    totalQuestions += sessionTotal;
    correctAnswers += sessionCorrect;
    totalTime += sessionTime;
    if (sessionTotal > 0) completedSessions++;
  }

  // Add quiz history data
  history.forEach((historyItem) => {
    if (historyItem.completed) {
      totalQuestions += historyItem.totalQuestions || 0;
      correctAnswers += historyItem.correctAnswers || 0;
      totalTime += historyItem.timeSpent || 0;
      completedSessions++;
    }
  });

  const accuracyRate =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const averageTime =
    completedSessions > 0 ? Math.round(totalTime / completedSessions) : 0;

  return {
    totalQuestions,
    correctAnswers,
    accuracyRate,
    averageTime: Math.round(averageTime / 1000), // Convert to seconds
    completedSessions,
  };
}

function getRank(accuracyRate) {
  if (accuracyRate >= 95)
    return { rank: "S+", label: "Legendary", color: "#FFD700" };
  if (accuracyRate >= 90)
    return { rank: "S", label: "Superior", color: "#C0C0C0" };
  if (accuracyRate >= 85)
    return { rank: "A+", label: "Excellent", color: "#CD7F32" };
  if (accuracyRate >= 80)
    return { rank: "A", label: "Great", color: "#4CAF50" };
  if (accuracyRate >= 75)
    return { rank: "B+", label: "Good", color: "#2196F3" };
  if (accuracyRate >= 70)
    return { rank: "B", label: "Average", color: "#FF9800" };
  if (accuracyRate >= 60) return { rank: "C", label: "Fair", color: "#FF5722" };
  return { rank: "D", label: "Needs Improvement", color: "#F44336" };
}

function getAchievementMessage(
  accuracyRate,
  totalQuestions,
  completedSessions
) {
  if (accuracyRate >= 98) return "🏆 Quiz Master - Sempurna!";
  if (accuracyRate >= 95) return "🌟 Genius Level - Luar Biasa!";
  if (accuracyRate >= 90) return "🔥 Outstanding Performance!";
  if (accuracyRate >= 85) return "⭐ Excellent Achievement!";
  if (accuracyRate >= 80) return "👍 Great Job - Keep Going!";
  if (accuracyRate >= 75) return "📈 Good Progress Made!";
  if (accuracyRate >= 70) return "💪 On The Right Track!";
  if (totalQuestions >= 100) return "🎯 Dedication Recognized!";
  if (completedSessions >= 10) return "🚀 Consistent Learner!";
  return "🌱 Keep Learning & Growing!";
}

function getTopicProgress(topicId) {
  const progress = getQuizProgress();
  const topicData = progress[topicId] || {};
  const session = getQuizSession();

  const difficulties = ["mudah", "sulit", "super-sulit"];
  let totalLevels = 0;
  let completedLevels = 0;
  let totalScore = 0;

  difficulties.forEach((difficulty) => {
    const difficultyData = topicData[difficulty] || {};
    for (let level = 1; level <= 10; level++) {
      totalLevels++;
      if (difficultyData[level] && difficultyData[level].completed) {
        completedLevels++;
        totalScore += difficultyData[level].score || 0;
      }
    }
  });

  // Add current session progress if it matches this topic
  if (session && session.topic === topicId) {
    const sessionCorrect = session.answers
      ? session.answers.filter((a) => a.correct).length
      : 0;
    const sessionTotal = session.answers ? session.answers.length : 0;

    if (sessionTotal > 0) {
      totalScore += (sessionCorrect / sessionTotal) * 100;
      completedLevels += 0.1; // Partial completion for current session
    }
  }

  const completionRate =
    totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  const averageScore =
    completedLevels > 0
      ? Math.round(totalScore / Math.max(completedLevels, 1))
      : 0;

  return {
    completedLevels: Math.floor(completedLevels),
    totalLevels,
    completionRate,
    averageScore,
    difficulties: difficulties.map((diff) => {
      const diffData = topicData[diff] || {};
      let completed = 0;
      let totalScore = 0;

      for (let level = 1; level <= 10; level++) {
        if (diffData[level] && diffData[level].completed) {
          completed++;
          totalScore += diffData[level].score || 0;
        }
      }

      // Add session data if matches
      if (session && session.topic === topicId && session.difficulty === diff) {
        const sessionProgress = session.answers
          ? session.answers.length / 10
          : 0;
        completed += sessionProgress;
      }

      return {
        name: diff,
        completed: Math.floor(completed),
        total: 10,
        percentage: Math.round((completed / 10) * 100),
        averageScore:
          completed > 0 ? Math.round(totalScore / Math.max(completed, 1)) : 0,
      };
    }),
  };
}

function getPerformanceIndicator(rate) {
  if (rate >= 85) return "excellent";
  if (rate >= 70) return "good";
  return "needs-improvement";
}

// Enhanced display functions with animations
function displayOverallStats() {
  const stats = calculateOverallStats();
  const rank = getRank(stats.accuracyRate);

  // Show loading state first
  document.getElementById("overallScoreText").textContent = "Memuat...";
  document.getElementById("overallScoreIcon").textContent = "⏳";

  // Simulate loading delay for better UX
  setTimeout(() => {
    // Update overall score with animation
    const scoreElement = document.getElementById("overallScoreText");
    const iconElement = document.getElementById("overallScoreIcon");

    animateNumber(scoreElement, stats.accuracyRate, "%");
    iconElement.textContent = rank.rank;
    iconElement.style.background = rank.color;

    // Update achievement badge
    const achievement = getAchievementMessage(
      stats.accuracyRate,
      stats.totalQuestions,
      stats.completedSessions
    );
    const badgeElement = document.getElementById("achievementBadge");
    badgeElement.querySelector("span").textContent = achievement;

    // Update stats grid
    displayStatsGrid(stats, rank);
  }, 500);
}

function displayStatsGrid(stats, rank) {
  const statsGrid = document.getElementById("statsGrid");

  const statsData = [
    {
      icon: "📊",
      number: stats.totalQuestions,
      label: "Total Pertanyaan",
      description: "Jumlah pertanyaan yang telah dijawab",
      class: "questions",
    },
    {
      icon: "🎯",
      number: stats.accuracyRate,
      suffix: "%",
      label: "Tingkat Akurasi",
      description: "Persentase jawaban benar",
      class: "accuracy",
    },
    {
      icon: "⏱️",
      number: stats.averageTime,
      suffix: "s",
      label: "Rata-rata Waktu",
      description: "Waktu per sesi kuis",
      class: "time",
    },
    {
      icon: "🏆",
      number: rank.rank,
      label: "Peringkat",
      description: rank.label,
      class: "rank",
      isText: true,
    },
  ];

  statsGrid.innerHTML = statsData
    .map(
      (stat, index) => `
          <div class="stat-card" style="animation-delay: ${0.1 + index * 0.1}s">
            <div class="stat-icon ${stat.class}">${stat.icon}</div>
            <div class="stat-number" data-target="${
              stat.isText ? 0 : stat.number
            }" data-suffix="${stat.suffix || ""}" data-text="${
        stat.isText ? stat.number : ""
      }">${stat.isText ? stat.number : "0"}</div>
            <div class="stat-label">${stat.label}</div>
            <div class="stat-description">${stat.description}</div>
          </div>
        `
    )
    .join("");

  // Animate numbers after cards are rendered
  setTimeout(() => animateStatNumbers(), 800);
}

function displayTopicsProgress() {
  const topicsGrid = document.getElementById("topicsGrid");

  // Show loading state
  topicsGrid.innerHTML = topics
    .map(
      (topic, index) => `
          <div class="topic-progress" style="animation-delay: ${
            0.1 + index * 0.05
          }s">
            <div class="loading-skeleton" style="height: 200px;"></div>
          </div>
        `
    )
    .join("");

  // Load actual data
  setTimeout(() => {
    topicsGrid.innerHTML = "";

    topics.forEach((topic, index) => {
      const progress = getTopicProgress(topic.id);
      const topicCard = document.createElement("div");
      topicCard.className = "topic-progress";
      topicCard.style.animationDelay = `${0.1 + index * 0.05}s`;

      const difficultyNames = {
        mudah: "Mudah",
        sulit: "Sulit",
        "super-sulit": "Super Sulit",
      };

      topicCard.innerHTML = `
              <div class="topic-header">
                <div class="topic-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${topic.icon}
                  </svg>
                </div>
                <div class="topic-info">
                  <h3>${topic.name}</h3>
                  <div class="topic-completion">
                    <span class="performance-indicator ${getPerformanceIndicator(
                      progress.completionRate
                    )}"></span>
                    ${progress.completedLevels}/${
        progress.totalLevels
      } level selesai
                    <span style="margin-left: 8px; font-weight: 600; color: var(--color-gold-elegant);">
                      ${progress.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
              
              ${progress.difficulties
                .map(
                  (diff, diffIndex) => `
                <div class="difficulty-progress">
                  <div class="difficulty-header">
                    <span class="difficulty-name">${
                      difficultyNames[diff.name]
                    }</span>
                    <span class="difficulty-score">${diff.completed}/10 
                      ${
                        diff.averageScore > 0
                          ? `(${diff.averageScore}% avg)`
                          : ""
                      }
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill ${
                      diff.name === "mudah"
                        ? "easy"
                        : diff.name === "sulit"
                        ? "medium"
                        : "hard"
                    }" 
                         data-width="${diff.percentage}%" 
                         style="width: 0%; animation-delay: ${
                           1 + diffIndex * 0.2
                         }s;"></div>
                  </div>
                </div>
              `
                )
                .join("")}
              
              ${
                progress.completionRate > 0
                  ? `
                <div style="margin-top: 16px; padding: 12px; background: rgba(180, 156, 115, 0.1); border-radius: 8px; text-align: center;">
                  <small style="color: var(--color-text-secondary);">
                    Skor rata-rata: <strong style="color: var(--color-gold-elegant);">${progress.averageScore}%</strong>
                  </small>
                </div>
              `
                  : `
                <div style="margin-top: 16px; padding: 12px; background: rgba(180, 156, 115, 0.05); border-radius: 8px; text-align: center;">
                  <small style="color: var(--color-text-secondary);">
                    Belum ada progress di tema ini
                  </small>
                </div>
              `
              }
            `;

      topicsGrid.appendChild(topicCard);
    });

    // Animate progress bars
    setTimeout(() => animateProgressBars(), 1200);
  }, 800);
}

// Enhanced animation functions
function animateNumber(element, target, suffix = "") {
  if (!element) return;

  const isText = element.dataset.text;
  if (isText) {
    element.textContent = isText;
    return;
  }

  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  element.style.animation = "countUp 0.6s ease-out";

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + suffix;
  }, 16);
}

function animateStatNumbers() {
  document.querySelectorAll(".stat-number").forEach((element, index) => {
    const target = parseInt(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || "";
    const text = element.dataset.text;

    setTimeout(() => {
      animateNumber(element, target, suffix);
    }, index * 200);
  });
}

function animateProgressBars() {
  document.querySelectorAll(".progress-fill").forEach((fill, index) => {
    const targetWidth = fill.dataset.width;

    setTimeout(() => {
      fill.style.width = targetWidth;
    }, index * 100);
  });
}

// Enhanced event handlers
function handleShare() {
  const stats = calculateOverallStats();
  const rank = getRank(stats.accuracyRate);
  const achievement = getAchievementMessage(
    stats.accuracyRate,
    stats.totalQuestions,
    stats.completedSessions
  );

  const shareText =
    `🎓 Premium Quiz Results\n\n` +
    `${achievement}\n\n` +
    `📊 Statistik:\n` +
    `• Total Pertanyaan: ${stats.totalQuestions.toLocaleString()}\n` +
    `• Akurasi: ${stats.accuracyRate}%\n` +
    `• Peringkat: ${rank.rank} (${rank.label})\n` +
    `• Rata-rata Waktu: ${stats.averageTime}s\n` +
    `• Sesi Selesai: ${stats.completedSessions}\n\n` +
    `🚀 Coba Premium Quiz di: ${window.location.origin}`;

  if (navigator.share) {
    navigator
      .share({
        title: "Premium Quiz Results",
        text: shareText,
        url: window.location.origin,
      })
      .catch(console.error);
  } else {
    navigator.clipboard
      .writeText(shareText)
      .then(() => showNotification("Hasil berhasil disalin ke clipboard! 📋"))
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showNotification("Hasil berhasil disalin ke clipboard! 📋");
      });
  }
}

function handleReset() {
  const stats = calculateOverallStats();

  const confirmMessage =
    `⚠️ Konfirmasi Reset Progress\n\n` +
    `Anda akan menghapus SEMUA data:\n` +
    `• ${stats.totalQuestions} pertanyaan terjawab\n` +
    `• ${stats.completedSessions} sesi selesai\n` +
    `• Semua progress tema dan level\n` +
    `• Riwayat pencapaian\n\n` +
    `Tindakan ini TIDAK DAPAT DIBATALKAN!\n\n` +
    `Ketik "RESET" untuk melanjutkan:`;

  const userInput = prompt(confirmMessage);

  if (userInput === "RESET") {
    // Clear all data
    localStorage.removeItem("quizProgress");
    localStorage.removeItem("currentQuizSession");
    localStorage.removeItem("quizHistory");
    localStorage.removeItem("userPreferences");

    showNotification(
      "✅ Progress berhasil direset! Mengalihkan ke halaman utama...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else if (userInput !== null) {
    showNotification("❌ Reset dibatalkan. Input tidak sesuai.", "error");
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${
            type === "success"
              ? "var(--color-success)"
              : type === "error"
              ? "var(--color-error)"
              : "var(--color-blue-premium)"
          };
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          z-index: 10000;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          animation: slideInFromRight 0.3s ease-out;
          font-weight: 500;
        `;
  notification.textContent = message;

  // Add to DOM
  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutToRight 0.3s ease-out";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Check for empty data and show appropriate message
function checkDataAvailability() {
  const progress = getQuizProgress();
  const session = getQuizSession();
  const history = getAllQuizHistory();

  const hasData =
    Object.keys(progress).length > 0 || session || history.length > 0;

  if (!hasData) {
    document.querySelector(".result-hero").innerHTML = `
            <div class="no-data-message">
              <div class="no-data-icon">📊</div>
              <h2>Belum Ada Data Kuis</h2>
              <p>Anda belum mengerjakan kuis apapun. Mulai kuis pertama Anda untuk melihat hasil di sini!</p>
              <div style="margin-top: 24px;">
                <a href="quiz.html" class="action-btn">
                  🚀 Mulai Kuis Sekarang
                </a>
              </div>
            </div>
          `;

    document.getElementById("statsGrid").innerHTML = "";
    document.getElementById("topicsGrid").innerHTML = "";
    return false;
  }

  return true;
}

// Initialize everything with improved error handling
function initResults() {
  try {
    if (!checkDataAvailability()) {
      return;
    }

    displayOverallStats();
    displayTopicsProgress();

    // Add event listeners
    document.getElementById("shareBtn").addEventListener("click", handleShare);
    document.getElementById("resetBtn").addEventListener("click", handleReset);

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";

    // Add keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
  } catch (error) {
    console.error("Error initializing results:", error);
    showNotification(
      "Terjadi kesalahan saat memuat data. Coba refresh halaman.",
      "error"
    );
  }
}

function handleKeyboardShortcuts(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "r":
        e.preventDefault();
        handleReset();
        break;
      case "s":
        e.preventDefault();
        handleShare();
        break;
    }
  }

  if (e.key === "Escape") {
    window.location.href = "index.html";
  }
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutToRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
document.head.appendChild(style);

// Auto-refresh data every 30 seconds if page is visible
let refreshInterval;

function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (!document.hidden && checkDataAvailability()) {
      const currentStats = calculateOverallStats();
      // Only refresh if we detect changes
      const lastStats = JSON.parse(sessionStorage.getItem("lastStats") || "{}");
      if (JSON.stringify(currentStats) !== JSON.stringify(lastStats)) {
        displayOverallStats();
        displayTopicsProgress();
        sessionStorage.setItem("lastStats", JSON.stringify(currentStats));
      }
    }
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

// Load and display results when page loads
document.addEventListener("DOMContentLoaded", () => {
  initResults();
  startAutoRefresh();
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  stopAutoRefresh();
});
