// quiz-logic.js - Fixed version with proper question navigation
document.getElementById("resultIcon").innerHTML =
  '<i class="ri-close-circle-fill"></i>';

class QuizManager {
  constructor() {
    this.currentTopic = "";
    this.currentDifficulty = "";
    this.currentLevel = 0;
    this.currentQuestion = 0;
    this.currentScore = 0;
    this.selectedAnswer = null;
    this.questions = [];
    this.startTime = null;
    this.questionStartTime = null;
    this.totalTime = 0;
    this.answeredQuestions = [];
    this.isProcessingAnswer = false; // Flag to prevent double processing

    this.init();
  }

  async init() {
    // Load questions database
    if (typeof questionsDatabase === "undefined") {
      console.error("Questions database not loaded");
      return;
    }

    this.loadProgress();
    this.setupEventListeners();
    this.initializeQuiz();
  }

  initializeQuiz() {
    this.currentTopic = localStorage.getItem("selectedTopic") || "matematika";
    this.loadTopicData();
    this.updateBreadcrumb();
    this.updateGlobalProgress();
    this.showDifficultyScreen();
  }

  loadTopicData() {
    const topicNames = {
      matematika: "Matematika",
      sains: "Sains",
      sejarah: "Sejarah",
      "bahasa-inggris": "Bahasa Inggris",
      logika: "Logika",
      geografi: "Geografi",
      teknologi: "Teknologi",
      "pengetahuan-umum": "Pengetahuan Umum",
    };

    const topicTitle = document.getElementById("topicTitle");
    if (topicTitle) {
      topicTitle.textContent =
        topicNames[this.currentTopic] || "Pilih Tingkat Kesulitan";
    }
  }

  loadQuestions() {
    try {
      // Get questions from database for current topic, difficulty, and level
      const topicQuestions = questionsDatabase[this.currentTopic];
      if (!topicQuestions) {
        throw new Error(`Topic ${this.currentTopic} not found`);
      }

      const difficultyQuestions = topicQuestions[this.currentDifficulty];
      if (!difficultyQuestions) {
        throw new Error(`Difficulty ${this.currentDifficulty} not found`);
      }

      const levelQuestions = difficultyQuestions[this.currentLevel - 1];
      if (!levelQuestions) {
        throw new Error(`Level ${this.currentLevel} not found`);
      }

      this.questions = [...levelQuestions]; // Clone array
      console.log(
        `Loaded ${this.questions.length} questions for ${this.currentTopic} - ${this.currentDifficulty} - Level ${this.currentLevel}`
      );
    } catch (error) {
      console.error("Error loading questions:", error);
      // Fallback to sample questions
      this.questions = this.generateFallbackQuestions();
    }
  }

  generateFallbackQuestions() {
    const fallbackQuestions = [];
    for (let i = 1; i <= 10; i++) {
      fallbackQuestions.push({
        question: `Pertanyaan ${i} untuk ${this.currentTopic} tingkat ${this.currentDifficulty} level ${this.currentLevel}?`,
        options: [
          `Pilihan A ${i}`,
          `Pilihan B ${i}`,
          `Pilihan C ${i}`,
          `Pilihan D ${i}`,
        ],
        correct: Math.floor(Math.random() * 4),
      });
    }
    return fallbackQuestions;
  }

  showGuideSection() {
    const guideSection = document.getElementById("guideSection");
    if (guideSection) {
      guideSection.classList.remove("hidden");
    }
  }

  hideGuideSection() {
    const guideSection = document.getElementById("guideSection");
    if (guideSection) {
      guideSection.classList.add("hidden");
    }
  }

  showDifficultyScreen() {
    this.showScreen("difficultyScreen");
    this.showGuideSection();
    this.setupDifficultySelection();
  }

  showLevelScreen() {
    this.showScreen("levelScreen");
    this.hideGuideSection();
    this.setupLevelSelection();
    this.updateBreadcrumb();
  }

  showQuestionScreen() {
    this.showScreen("questionScreen");
    this.hideGuideSection();
    this.startTime = Date.now();
    this.loadCurrentQuestion();
    this.updateBreadcrumb();
  }

  showScreen(screenId) {
    document.querySelectorAll(".quiz-container").forEach((container) => {
      container.classList.remove("active");
    });

    setTimeout(() => {
      const targetScreen = document.getElementById(screenId);
      if (targetScreen) {
        targetScreen.classList.add("active");
      }
    }, 150);
  }

  setupDifficultySelection() {
    document.querySelectorAll(".difficulty-card").forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".difficulty-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        this.currentDifficulty = card.dataset.difficulty;

        setTimeout(() => {
          this.showLevelScreen();
        }, 300);
      });
    });
  }

  setupLevelSelection() {
    const levelGrid = document.getElementById("levelGrid");
    const levelSubtitle = document.getElementById("levelSubtitle");

    if (!levelGrid || !levelSubtitle) return;

    const difficultyNames = {
      mudah: "Mudah",
      sulit: "Sulit",
      "super-sulit": "Super Sulit",
    };

    levelSubtitle.textContent = `Tingkat ${
      difficultyNames[this.currentDifficulty]
    } - Setiap level berisi 10 pertanyaan`;

    levelGrid.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
      const levelBtn = document.createElement("div");
      levelBtn.className = "level-btn";
      levelBtn.textContent = i;
      levelBtn.dataset.level = i;

      // Check if level is completed
      const progress = this.getProgress();
      if (
        progress[this.currentTopic] &&
        progress[this.currentTopic][this.currentDifficulty] &&
        progress[this.currentTopic][this.currentDifficulty][i] &&
        progress[this.currentTopic][this.currentDifficulty][i].completed
      ) {
        levelBtn.classList.add("completed");
      }

      levelBtn.addEventListener("click", () => {
        this.currentLevel = i;
        this.currentQuestion = 1; // Reset to question 1
        this.currentScore = 0;
        this.answeredQuestions = [];
        this.isProcessingAnswer = false; // Reset processing flag
        this.loadQuestions();
        this.showQuestionScreen();
      });

      levelGrid.appendChild(levelBtn);
    }
  }

  loadCurrentQuestion() {
    if (!this.questions || this.questions.length === 0) {
      console.error("No questions loaded");
      return;
    }

    if (this.currentQuestion > this.questions.length) {
      console.error("Question index out of bounds");
      return;
    }

    const question = this.questions[this.currentQuestion - 1];
    if (!question) {
      console.error("Question not found");
      return;
    }

    // Update UI elements
    const questionNumber = document.getElementById("questionNumber");
    const questionText = document.getElementById("questionText");
    const optionsGrid = document.getElementById("optionsGrid");
    const nextBtn = document.getElementById("nextBtn");

    if (questionNumber) {
      questionNumber.textContent = `Pertanyaan ${this.currentQuestion} dari ${this.questions.length}`;
    }

    if (questionText) {
      questionText.textContent = question.question;
    }

    if (optionsGrid) {
      optionsGrid.innerHTML = "";

      question.options.forEach((option, index) => {
        const optionBtn = document.createElement("div");
        optionBtn.className = "option-btn";
        optionBtn.textContent = option;
        optionBtn.dataset.index = index;

        optionBtn.addEventListener("click", () => {
          if (this.selectedAnswer !== null || this.isProcessingAnswer) return;

          // Remove previous selections
          optionsGrid.querySelectorAll(".option-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });

          this.selectedAnswer = index;
          optionBtn.classList.add("selected");

          if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = "Jawab Pertanyaan";
          }
        });

        optionsGrid.appendChild(optionBtn);
      });
    }

    // Reset question state
    this.selectedAnswer = null;
    this.questionStartTime = Date.now();
    this.isProcessingAnswer = false;

    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = "Pilih Jawaban";
    }

    // Update score display
    this.updateScoreDisplay();
  }

  checkAnswer() {
    if (this.selectedAnswer === null || this.isProcessingAnswer) return;

    this.isProcessingAnswer = true; // Set flag to prevent double processing

    const question = this.questions[this.currentQuestion - 1];
    const isCorrect = this.selectedAnswer === question.correct;
    const questionTime = Date.now() - this.questionStartTime;

    // Record answer
    this.answeredQuestions.push({
      questionIndex: this.currentQuestion - 1,
      selectedAnswer: this.selectedAnswer,
      correctAnswer: question.correct,
      isCorrect: isCorrect,
      timeSpent: questionTime,
    });

    // Update score
    if (isCorrect) {
      this.currentScore += 10; // 10 points per correct answer
    }

    // Show visual feedback
    this.showAnswerFeedback(isCorrect, question.correct);

    // Show result popup
    this.showResultPopup(isCorrect);
  }

  showAnswerFeedback(isCorrect, correctIndex) {
    const optionsGrid = document.getElementById("optionsGrid");
    if (!optionsGrid) return;

    optionsGrid.querySelectorAll(".option-btn").forEach((btn, index) => {
      btn.classList.add("disabled");
      if (index === correctIndex) {
        btn.classList.add("correct");
      } else if (index === this.selectedAnswer && !isCorrect) {
        btn.classList.add("incorrect");
      }
    });
  }

  showResultPopup(isCorrect) {
    const popup = document.getElementById("resultPopup");
    const icon = document.getElementById("resultIcon");
    const title = document.getElementById("resultTitle");
    const text = document.getElementById("resultText");
    const continueBtn = document.getElementById("continueBtn");

    if (!popup || !icon || !title || !text) return;

    if (isCorrect) {
      icon.innerHTML = '<i class="ri-checkbox-circle-fill"></i>';
      icon.className = "result-icon correct";
      title.textContent = "Jawaban Benar!";
      text.textContent =
        "Selamat! Anda berhasil menjawab pertanyaan dengan tepat.";
    } else {
      icon.innerHTML = '<i class="ri-close-circle-fill"></i>';
      icon.className = "result-icon incorrect";
      title.textContent = "Jawaban Salah!";

      const correctAnswer =
        this.questions[this.currentQuestion - 1].options[
          this.questions[this.currentQuestion - 1].correct
        ];
      text.textContent = `Jawaban yang benar adalah: "${correctAnswer}". Jangan menyerah, coba lagi pada pertanyaan berikutnya!`;
    }

    // Reset continue button for normal questions
    if (continueBtn) {
      continueBtn.textContent = "Lanjutkan";
      // Remove any existing event listeners
      continueBtn.onclick = null;
      continueBtn.onclick = () => {
        this.handleContinue();
      };
    }

    popup.classList.add("show");
  }

  // NEW METHOD: Handle continue action from popup
  handleContinue() {
    const popup = document.getElementById("resultPopup");
    if (popup) {
      popup.classList.remove("show");
    }

    // Wait for popup to close, then proceed
    setTimeout(() => {
      if (this.currentQuestion < this.questions.length) {
        this.currentQuestion++;
        this.isProcessingAnswer = false; // Reset flag
        this.loadCurrentQuestion();
      } else {
        // Level completed
        this.completeLevel();
      }
    }, 300);
  }

  nextQuestion() {
    // This method is now only called from the Next button
    if (this.isProcessingAnswer) return;

    const popup = document.getElementById("resultPopup");
    if (popup) {
      popup.classList.remove("show");
    }

    if (this.currentQuestion < this.questions.length) {
      this.currentQuestion++;
      this.isProcessingAnswer = false;
      this.loadCurrentQuestion();
    } else {
      // Level completed
      this.completeLevel();
    }
  }

  completeLevel() {
    this.totalTime = Date.now() - this.startTime;

    // Calculate statistics
    const correctAnswers = this.answeredQuestions.filter(
      (q) => q.isCorrect
    ).length;
    const accuracy = Math.round((correctAnswers / this.questions.length) * 100);
    const averageTime = Math.round(this.totalTime / this.questions.length);

    // Save progress
    const progress = this.getProgress();

    if (!progress[this.currentTopic]) progress[this.currentTopic] = {};
    if (!progress[this.currentTopic][this.currentDifficulty])
      progress[this.currentTopic][this.currentDifficulty] = {};

    progress[this.currentTopic][this.currentDifficulty][this.currentLevel] = {
      completed: true,
      score: this.currentScore,
      accuracy: accuracy,
      timeSpent: this.totalTime,
      averageTimePerQuestion: averageTime,
      answers: this.answeredQuestions,
      timestamp: Date.now(),
    };

    localStorage.setItem("quizProgress", JSON.stringify(progress));
    this.updateGlobalProgress();

    // Show completion message
    this.showLevelCompletionPopup(correctAnswers, accuracy);
  }

  showLevelCompletionPopup(correctAnswers, accuracy) {
    const popup = document.getElementById("resultPopup");
    const icon = document.getElementById("resultIcon");
    const title = document.getElementById("resultTitle");
    const text = document.getElementById("resultText");
    const continueBtn = document.getElementById("continueBtn");

    if (!popup || !icon || !title || !text || !continueBtn) return;

    // Determine performance level
    let performanceLevel, performanceColor, performanceIcon;
    if (accuracy >= 90) {
      performanceLevel = "Sempurna!";
      performanceColor = "correct";
      performanceIcon = "🏆";
    } else if (accuracy >= 80) {
      performanceLevel = "Hebat!";
      performanceColor = "correct";
      performanceIcon = "⭐";
    } else if (accuracy >= 70) {
      performanceLevel = "Bagus!";
      performanceColor = "correct";
      performanceIcon = "👍";
    } else if (accuracy >= 60) {
      performanceLevel = "Lumayan!";
      performanceColor = "incorrect";
      performanceIcon = "📈";
    } else {
      performanceLevel = "Tetap Semangat!";
      performanceColor = "incorrect";
      performanceIcon = "💪";
    }

    icon.textContent = performanceIcon;
    icon.className = `result-icon ${performanceColor}`;
    title.textContent = `Level ${this.currentLevel} Selesai!`;
    text.innerHTML = `
          <div style="margin-bottom: 16px;">
              <strong>${performanceLevel}</strong>
          </div>
          <div style="color: var(--color-text-secondary); font-size: 14px; line-height: 1.5;">
              Jawaban Benar: ${correctAnswers}/${this.questions.length}<br>
              Akurasi: ${accuracy}%<br>
              Skor: ${this.currentScore} poin<br>
              Total Waktu: ${Math.round(this.totalTime / 1000)}s
          </div>
      `;

    continueBtn.textContent = "Kembali ke Level";
    continueBtn.onclick = () => {
      popup.classList.remove("show");
      this.showLevelScreen();
    };

    popup.classList.add("show");
  }

  updateScoreDisplay() {
    const scoreDisplay = document.getElementById("scoreDisplay");
    if (scoreDisplay) {
      scoreDisplay.textContent = `Skor: ${this.currentScore}`;
    }
  }

  updateBreadcrumb() {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) return;

    const topicNames = {
      matematika: "Matematika",
      sains: "Sains",
      sejarah: "Sejarah",
      "bahasa-inggris": "Bahasa Inggris",
      logika: "Logika",
      geografi: "Geografi",
      teknologi: "Teknologi",
      "pengetahuan-umum": "Pengetahuan Umum",
    };

    const difficultyNames = {
      mudah: "Mudah",
      sulit: "Sulit",
      "super-sulit": "Super Sulit",
    };

    let breadcrumbHTML = `<div class="breadcrumb-item">${
      topicNames[this.currentTopic] || "Topic"
    }</div>`;

    if (this.currentDifficulty) {
      breadcrumbHTML += `
              <div class="breadcrumb-separator"></div>
              <div class="breadcrumb-item">${
                difficultyNames[this.currentDifficulty]
              }</div>
          `;
    }

    if (this.currentLevel > 0) {
      breadcrumbHTML += `
              <div class="breadcrumb-separator"></div>
              <div class="breadcrumb-item">Level ${this.currentLevel}</div>
          `;
    }

    if (this.currentQuestion > 0) {
      breadcrumbHTML += `
              <div class="breadcrumb-separator"></div>
              <div class="breadcrumb-item">Pertanyaan ${this.currentQuestion}</div>
          `;
    }

    breadcrumb.innerHTML = breadcrumbHTML;
  }

  updateGlobalProgress() {
    const totalQuestions = 2400; // 8 topics × 3 difficulties × 10 levels × 10 questions
    const answered = this.getTotalAnswered();
    const percentage = Math.min((answered / totalQuestions) * 100, 100);

    const progressStats = document.getElementById("progressStats");
    const progressFill = document.getElementById("progressFill");

    if (progressStats) {
      progressStats.textContent = `${answered} / ${totalQuestions} Pertanyaan`;
    }

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    console.log(
      `Progress: ${answered}/${totalQuestions} (${percentage.toFixed(2)}%)`
    );
  }

  getTotalAnswered() {
    const progress = this.getProgress();
    let total = 0;

    Object.keys(progress).forEach((topic) => {
      if (progress[topic] && typeof progress[topic] === "object") {
        Object.keys(progress[topic]).forEach((difficulty) => {
          if (
            progress[topic][difficulty] &&
            typeof progress[topic][difficulty] === "object"
          ) {
            Object.keys(progress[topic][difficulty]).forEach((level) => {
              const levelData = progress[topic][difficulty][level];
              if (
                levelData &&
                levelData.completed === true &&
                typeof levelData.score === "number" &&
                Array.isArray(levelData.answers) &&
                levelData.answers.length > 0
              ) {
                total += levelData.answers.length;
              }
            });
          }
        });
      }
    });

    return total;
  }

  getProgress() {
    try {
      const progressStr = localStorage.getItem("quizProgress");
      if (!progressStr) return {};

      const progress = JSON.parse(progressStr);

      if (typeof progress !== "object" || progress === null) {
        console.warn("Invalid progress data, resetting...");
        return {};
      }

      return progress;
    } catch (error) {
      console.error("Error parsing progress data:", error);
      return {};
    }
  }

  loadProgress() {
    const progress = this.getProgress();
    console.log("Loaded progress:", progress);

    if (Object.keys(progress).length === 0) {
      this.updateGlobalProgress();
    }
  }

  setupEventListeners() {
    // Next button handler - FIXED VERSION
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      // Remove any existing event listeners first
      nextBtn.replaceWith(nextBtn.cloneNode(true));
      const newNextBtn = document.getElementById("nextBtn");

      newNextBtn.addEventListener("click", () => {
        if (this.selectedAnswer === null || this.isProcessingAnswer) return;

        if (newNextBtn.textContent === "Jawab Pertanyaan") {
          this.checkAnswer();
          newNextBtn.textContent = "Lanjutkan";
          newNextBtn.disabled = false;
        } else if (newNextBtn.textContent === "Lanjutkan") {
          this.nextQuestion();
        }
      });
    }

    // Remove the duplicate continue button listener
    // The continue button in popup now uses onclick directly

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Space or Enter to proceed
      if (
        (e.code === "Space" || e.code === "Enter") &&
        !this.isProcessingAnswer
      ) {
        e.preventDefault();
        const nextBtn = document.getElementById("nextBtn");
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
        }
      }

      // Number keys 1-4 to select options
      if (
        e.code >= "Digit1" &&
        e.code <= "Digit4" &&
        !this.isProcessingAnswer
      ) {
        const optionIndex = parseInt(e.code.slice(-1)) - 1;
        const optionBtns = document.querySelectorAll(".option-btn");
        if (optionBtns[optionIndex] && this.selectedAnswer === null) {
          optionBtns[optionIndex].click();
        }
      }

      // Escape to go back
      if (e.code === "Escape") {
        this.goBack();
      }
    });

    // Close popup when clicking outside
    const resultPopup = document.getElementById("resultPopup");
    if (resultPopup) {
      resultPopup.addEventListener("click", (e) => {
        if (e.target === resultPopup && !this.isProcessingAnswer) {
          resultPopup.classList.remove("show");
        }
      });
    }
  }

  goBack() {
    const activeScreen = document.querySelector(".quiz-container.active");
    if (!activeScreen) return;

    const screenId = activeScreen.id;

    switch (screenId) {
      case "questionScreen":
        this.showLevelScreen();
        break;
      case "levelScreen":
        this.showDifficultyScreen();
        break;
      case "difficultyScreen":
        window.location.href = "index.html";
        break;
    }
  }

  // Method untuk reset progress (untuk testing)
  resetProgress() {
    localStorage.removeItem("quizProgress");
    this.updateGlobalProgress();
    console.log("Progress has been reset");
  }

  // Method untuk clear invalid data
  cleanProgressData() {
    const progress = this.getProgress();
    let cleaned = false;

    Object.keys(progress).forEach((topic) => {
      if (!progress[topic] || typeof progress[topic] !== "object") {
        delete progress[topic];
        cleaned = true;
        return;
      }

      Object.keys(progress[topic]).forEach((difficulty) => {
        if (
          !progress[topic][difficulty] ||
          typeof progress[topic][difficulty] !== "object"
        ) {
          delete progress[topic][difficulty];
          cleaned = true;
          return;
        }

        Object.keys(progress[topic][difficulty]).forEach((level) => {
          const levelData = progress[topic][difficulty][level];
          if (
            !levelData ||
            typeof levelData !== "object" ||
            typeof levelData.completed !== "boolean" ||
            (levelData.completed && typeof levelData.score !== "number")
          ) {
            delete progress[topic][difficulty][level];
            cleaned = true;
          }
        });
      });
    });

    if (cleaned) {
      localStorage.setItem("quizProgress", JSON.stringify(progress));
      console.log("Progress data cleaned");
    }

    return cleaned;
  }

  // Utility methods for statistics and analytics
  getTopicStatistics(topicId) {
    const progress = this.getProgress();
    const topicData = progress[topicId] || {};

    let totalLevels = 0;
    let completedLevels = 0;
    let totalScore = 0;
    let totalTime = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;

    ["mudah", "sulit", "super-sulit"].forEach((difficulty) => {
      const difficultyData = topicData[difficulty] || {};

      for (let level = 1; level <= 10; level++) {
        totalLevels++;
        const levelData = difficultyData[level];

        if (levelData && levelData.completed) {
          completedLevels++;
          totalScore += levelData.score || 0;
          totalTime += levelData.timeSpent || 0;
          totalQuestions += 10;
          correctAnswers += Math.floor((levelData.score || 0) / 10);
        }
      }
    });

    return {
      totalLevels,
      completedLevels,
      completionRate:
        totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
      averageScore:
        completedLevels > 0 ? Math.round(totalScore / completedLevels) : 0,
      accuracy:
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0,
      averageTime:
        completedLevels > 0 ? Math.round(totalTime / completedLevels) : 0,
      totalQuestions,
      correctAnswers,
    };
  }

  getDifficultyStatistics(topicId, difficulty) {
    const progress = this.getProgress();
    const difficultyData = progress[topicId]?.[difficulty] || {};

    let completedLevels = 0;
    let totalScore = 0;
    let totalTime = 0;

    for (let level = 1; level <= 10; level++) {
      const levelData = difficultyData[level];
      if (levelData && levelData.completed) {
        completedLevels++;
        totalScore += levelData.score || 0;
        totalTime += levelData.timeSpent || 0;
      }
    }

    return {
      completedLevels,
      totalLevels: 10,
      completionRate: Math.round((completedLevels / 10) * 100),
      averageScore:
        completedLevels > 0 ? Math.round(totalScore / completedLevels) : 0,
      averageTime:
        completedLevels > 0 ? Math.round(totalTime / completedLevels) : 0,
    };
  }

  exportProgress() {
    const progress = this.getProgress();
    const exportData = {
      version: "1.0",
      timestamp: Date.now(),
      progress: progress,
      statistics: this.generateGlobalStatistics(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `premium-quiz-progress-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  importProgress(fileContent) {
    try {
      const importData = JSON.parse(fileContent);

      if (importData.version && importData.progress) {
        localStorage.setItem(
          "quizProgress",
          JSON.stringify(importData.progress)
        );
        this.updateGlobalProgress();
        alert("Progress berhasil diimpor!");
        return true;
      } else {
        throw new Error("Format file tidak valid");
      }
    } catch (error) {
      alert("Error mengimpor progress: " + error.message);
      return false;
    }
  }

  generateGlobalStatistics() {
    const topics = [
      "matematika",
      "sains",
      "sejarah",
      "bahasa-inggris",
      "logika",
      "geografi",
      "teknologi",
      "pengetahuan-umum",
    ];
    const stats = {};

    topics.forEach((topicId) => {
      stats[topicId] = this.getTopicStatistics(topicId);
    });

    return stats;
  }

  // Performance tracking
  trackPerformance(action, data = {}) {
    const performanceData = {
      timestamp: Date.now(),
      action: action,
      topic: this.currentTopic,
      difficulty: this.currentDifficulty,
      level: this.currentLevel,
      question: this.currentQuestion,
      ...data,
    };

    const performanceLog = JSON.parse(
      localStorage.getItem("performanceLog") || "[]"
    );
    performanceLog.push(performanceData);

    // Keep only last 1000 entries
    if (performanceLog.length > 1000) {
      performanceLog.splice(0, performanceLog.length - 1000);
    }

    localStorage.setItem("performanceLog", JSON.stringify(performanceLog));
  }

  // Adaptive difficulty suggestion
  suggestNextDifficulty() {
    const currentStats = this.getTopicStatistics(this.currentTopic);

    if (currentStats.accuracy >= 85 && currentStats.completionRate >= 70) {
      const difficulties = ["mudah", "sulit", "super-sulit"];
      const currentIndex = difficulties.indexOf(this.currentDifficulty);

      if (currentIndex < difficulties.length - 1) {
        return {
          suggested: difficulties[currentIndex + 1],
          reason: "Performa Anda sangat baik! Coba tingkat yang lebih sulit.",
        };
      }
    } else if (currentStats.accuracy < 60) {
      const difficulties = ["mudah", "sulit", "super-sulit"];
      const currentIndex = difficulties.indexOf(this.currentDifficulty);

      if (currentIndex > 0) {
        return {
          suggested: difficulties[currentIndex - 1],
          reason:
            "Mungkin lebih baik berlatih di tingkat yang lebih mudah dulu.",
        };
      }
    }

    return null;
  }

  // Gamification features
  checkAchievements() {
    const achievements = [];
    const progress = this.getProgress();
    const globalStats = this.generateGlobalStatistics();

    // First question achievement
    if (this.getTotalAnswered() >= 1) {
      achievements.push({
        id: "first_question",
        title: "Langkah Pertama",
        description: "Menjawab pertanyaan pertama",
        icon: "🚀",
      });
    }

    // Perfect level achievement
    Object.values(progress).forEach((topicData) => {
      Object.values(topicData).forEach((difficultyData) => {
        Object.values(difficultyData).forEach((levelData) => {
          if (levelData.completed && levelData.accuracy === 100) {
            achievements.push({
              id: "perfect_level",
              title: "Sempurna!",
              description: "Menyelesaikan level dengan akurasi 100%",
              icon: "🎯",
            });
          }
        });
      });
    });

    // Speed achievement
    const fastestTime = Math.min(
      ...Object.values(progress).flatMap((topicData) =>
        Object.values(topicData).flatMap((difficultyData) =>
          Object.values(difficultyData).map(
            (levelData) => levelData.averageTimePerQuestion || Infinity
          )
        )
      )
    );

    if (fastestTime < 10000) {
      // Less than 10 seconds per question
      achievements.push({
        id: "speed_demon",
        title: "Kilat!",
        description: "Menjawab pertanyaan dengan sangat cepat",
        icon: "⚡",
      });
    }

    return achievements;
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-content">
              <div class="achievement-title">${achievement.title}</div>
              <div class="achievement-description">${achievement.description}</div>
          </div>
      `;

    notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, var(--color-gold-elegant), var(--color-blue-premium));
          color: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 300px;
      `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  // Initialize when DOM is loaded
  static initialize() {
    return new QuizManager();
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.quizManager = QuizManager.initialize();
  });
} else {
  window.quizManager = QuizManager.initialize();
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = QuizManager;
}
