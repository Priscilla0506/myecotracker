// EcoTrack - Client-Side State, Authentication & Logic Controller

// Application State
let state = {
  users: [],             // Local database of registered users
  currentUser: null,     // Currently authenticated user object
  calculator: null,      // Loaded per active user session
  logs: [],              // Loaded per active user session
  challenges: [],        // Loaded per active user session
  badges: []             // Loaded per active user session
};

// Simulation OTP cache variables
let tempSignupData = null;
let currentOtp = null;

// Factors for calculations
const CARBON_FACTORS = {
  travel: {
    'Walking': 0.00,
    'Bicycle': 0.00,
    'Bus': 0.05,
    'Bike': 0.09,
    'Car': 0.21,
    'Train': 0.04
  },
  electricity: 0.82,
  food: {
    'Vegetarian': 50,
    'Mixed': 100,
    'Non-Vegetarian': 150
  },
  plastic: {
    'Low': 5,
    'Medium': 15,
    'High': 30
  },
  shopping: {
    'Low': 10,
    'Medium': 30,
    'High': 60
  }
};

const ACTION_SAVINGS = {
  'transport': 2.0,
  'walk-cycle': 3.0,
  'electricity': 1.5,
  'plastic': 1.0,
  'recycle': 1.2,
  'meal': 2.5,
  'bottle': 0.5
};

const ACTION_LABELS = {
  'transport': '🚌 Public Transport',
  'walk-cycle': '🚲 Walked/Cycled',
  'electricity': '💡 Saved Electricity',
  'plastic': '🛍️ Avoided Plastic',
  'recycle': '♻️ Recycled Waste',
  'meal': '🥗 Plant-Based Meal',
  'bottle': '🥤 Reusable Bottle'
};

const HABIT_TITLES = {
  'transport': 'Public Transit User',
  'walk-cycle': 'Eco Commuter',
  'electricity': 'Energy Saver',
  'plastic': 'Zero-Waste Advocate',
  'recycle': 'Recycling Champion',
  'meal': 'Plant-Powered',
  'bottle': 'Hydration Hero'
};

// Document Elements
const docElements = {
  header: document.getElementById('header'),
  mobileToggle: document.getElementById('mobile-toggle'),
  navMenu: document.getElementById('nav-menu'),
  navLinks: document.querySelectorAll('.nav-link'),
  navSavedVal: document.getElementById('nav-saved-val'),
  
  // Authentication Elements
  authSection: document.getElementById('auth-section'),
  signinCard: document.getElementById('signin-card'),
  signupCard: document.getElementById('signup-card'),
  otpCard: document.getElementById('otp-card'),
  
  signinForm: document.getElementById('signin-form'),
  signinEmail: document.getElementById('signin-email'),
  signinPassword: document.getElementById('signin-password'),
  
  signupForm: document.getElementById('signup-form'),
  signupUsername: document.getElementById('signup-username'),
  signupEmail: document.getElementById('signup-email'),
  signupPassword: document.getElementById('signup-password'),
  signupConfirm: document.getElementById('signup-confirm'),
  
  otpForm: document.getElementById('otp-form'),
  otpCodeInput: document.getElementById('otp-code-input'),
  otpDisplayVal: document.getElementById('otp-display-val'),
  
  linkToSignup: document.getElementById('link-to-signup'),
  linkToSignin: document.getElementById('link-to-signin'),
  linkToSigninFromOtp: document.getElementById('link-to-signin-from-otp'),
  
  navUserItem: document.getElementById('nav-user-item'),
  navUsername: document.getElementById('nav-username'),
  navLogoutItem: document.getElementById('nav-logout-item'),
  btnLogout: document.getElementById('btn-logout'),

  // Dashboard
  dbFootprint: document.getElementById('dashboard-footprint'),
  dbFootprintCat: document.getElementById('dashboard-footprint-cat'),
  dbSaved: document.getElementById('dashboard-saved'),
  dbActionsCount: document.getElementById('dashboard-actions-count'),
  dbBestHabit: document.getElementById('dashboard-best-habit'),
  dbBestHabitDesc: document.getElementById('dashboard-best-habit-desc'),
  goalPercentage: document.getElementById('goal-percentage'),
  goalProgressBar: document.getElementById('goal-progress-bar'),
  encouragementText: document.getElementById('encouragement-text'),
  
  // Calculator
  calculatorForm: document.getElementById('calculator-form'),
  calculatorResultsPanel: document.getElementById('calculator-results-panel'),
  calcResult: document.getElementById('calculator-result'),
  insightsContainer: document.getElementById('insights-container'),
  insightsGrid: document.getElementById('insights-grid'),
  travelDistanceInput: document.getElementById('travel-distance'),
  travelModeInput: document.getElementById('travel-mode'),
  electricityInput: document.getElementById('electricity'),
  foodHabitInput: document.getElementById('food-habit'),
  plasticUsageInput: document.getElementById('plastic-usage'),
  shoppingHabitInput: document.getElementById('shopping-habit'),
  
  // Tracker
  trackerForm: document.getElementById('tracker-form'),
  historyList: document.getElementById('history-list'),
  actionCards: document.querySelectorAll('.action-checkbox-card'),
  
  // Challenges & Badges
  challengeBtns: document.querySelectorAll('.btn-join-challenge'),
  badges: {
    'starter': document.getElementById('badge-starter'),
    'energy': document.getElementById('badge-energy'),
    'plastic': document.getElementById('badge-plastic'),
    'travel': document.getElementById('badge-travel'),
    'champion': document.getElementById('badge-champion')
  },
  
  // Reset
  resetBtn: document.getElementById('reset-data-btn'),
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initUsersDatabase();
  loadSession();
  setupNavigation();
  setupAuthListeners();
  setupCalculator();
  setupTracker();
  setupChallenges();
  setupReset();
  setupBadgeSharing();
  setupGenZInteractions();
  
  // Run primary UI update
  updateAuthUI();
});

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '🔔';
  if (type === 'success') icon = '✓';
  if (type === 'warn') icon = '⚠️';
  if (type === 'info') icon = '💡';
  
  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  docElements.toastContainer.appendChild(toast);
  
  // Remove toast after 4s
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// 🔐 Authentication & Session Setup Functions

// Create simulated credentials databases in localstorage if not existing
function initUsersDatabase() {
  const storedUsers = localStorage.getItem('ecotrack_users');
  if (storedUsers) {
    state.users = JSON.parse(storedUsers);
  } else {
    // Inject a dummy user so testing is fast/easy
    state.users = [
      {
        username: 'green_warrior',
        email: 'green@warrior.com',
        password: 'password123',
        verified: true
      }
    ];
    localStorage.setItem('ecotrack_users', JSON.stringify(state.users));
  }
}

// Check for active login session
function loadSession() {
  const current = localStorage.getItem('ecotrack_current_user');
  if (current) {
    state.currentUser = JSON.parse(current);
    loadUserData();
  }
}

// Load current user scoped carbon tracker data
function loadUserData() {
  if (!state.currentUser) return;
  const username = state.currentUser.username;
  
  try {
    const calcData = localStorage.getItem(`ecotrack_calculator_${username}`);
    const logsData = localStorage.getItem(`ecotrack_logs_${username}`);
    const challengesData = localStorage.getItem(`ecotrack_challenges_${username}`);
    const badgesData = localStorage.getItem(`ecotrack_badges_${username}`);
    
    state.calculator = calcData ? JSON.parse(calcData) : null;
    state.logs = logsData ? JSON.parse(logsData) : [];
    state.challenges = challengesData ? JSON.parse(challengesData) : [];
    state.badges = badgesData ? JSON.parse(badgesData) : [];
  } catch (e) {
    console.error('Error loading scoped user data', e);
  }
}

// Save scoped user data
function saveUserData(keySuffix, data) {
  if (!state.currentUser) return;
  try {
    const username = state.currentUser.username;
    localStorage.setItem(`ecotrack_${keySuffix}_${username}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving user data for ${keySuffix}`, e);
    showToast('Failed to save progress locally.', 'warn');
  }
}

// Handles switching cards in the authentication screen overlay
function showAuthCard(cardId) {
  docElements.signinCard.classList.remove('active');
  docElements.signupCard.classList.remove('active');
  docElements.otpCard.classList.remove('active');
  
  if (cardId === 'signin') docElements.signinCard.classList.add('active');
  if (cardId === 'signup') docElements.signupCard.classList.add('active');
  if (cardId === 'otp') docElements.otpCard.classList.add('active');
}

// Manage visibility of auth overlay vs core content
function updateAuthUI() {
  if (state.currentUser) {
    // User is logged in
    document.body.classList.remove('auth-open');
    docElements.authSection.style.display = 'none';
    
    // Header updates
    docElements.navUserItem.style.display = 'flex';
    docElements.navUsername.textContent = state.currentUser.username;
    docElements.navLogoutItem.style.display = 'block';
    
    // Fill forms with previously calculated data if any
    prefillForms();
    
    // Render dashboard components
    renderAll();
  } else {
    // User logged out
    document.body.classList.add('auth-open');
    docElements.authSection.style.display = 'flex';
    showAuthCard('signin');
    
    // Header elements hide
    docElements.navUserItem.style.display = 'none';
    docElements.navLogoutItem.style.display = 'none';
  }
}

// Prefill forms with scoped profile parameters
function prefillForms() {
  if (state.calculator) {
    docElements.travelDistanceInput.value = state.calculator.travelDistance;
    docElements.travelModeInput.value = state.calculator.travelMode;
    docElements.electricityInput.value = state.calculator.electricity;
    docElements.foodHabitInput.value = state.calculator.foodHabit;
    docElements.plasticUsageInput.value = state.calculator.plasticUsage;
    docElements.shoppingHabitInput.value = state.calculator.shoppingHabit;
  } else {
    docElements.calculatorForm.reset();
  }
  
  // Redraw tracker forms checkbox check marks
  docElements.actionCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.checked = false;
    card.classList.remove('selected');
  });
}

// Bind auth forms actions
function setupAuthListeners() {
  // Screen Toggles
  docElements.linkToSignup.addEventListener('click', () => showAuthCard('signup'));
  docElements.linkToSignin.addEventListener('click', () => showAuthCard('signin'));
  docElements.linkToSigninFromOtp.addEventListener('click', () => showAuthCard('signin'));
  
  // Submit Sign In Form
  docElements.signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginInput = docElements.signinEmail.value.trim().toLowerCase();
    const password = docElements.signinPassword.value;
    
    const matchedUser = state.users.find(u => 
      (u.username.toLowerCase() === loginInput || u.email.toLowerCase() === loginInput) && u.password === password
    );
    
    if (matchedUser) {
      // Create session
      state.currentUser = { username: matchedUser.username, email: matchedUser.email };
      localStorage.setItem('ecotrack_current_user', JSON.stringify(state.currentUser));
      
      // Load and show details
      loadUserData();
      updateAuthUI();
      showToast(`Welcome back, ${matchedUser.username}!`, 'success');
      
      // Clean inputs
      docElements.signinForm.reset();
    } else {
      showToast('Incorrect username/email or password. Try again.', 'warn');
    }
  });

  // Submit Sign Up Form
  docElements.signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = docElements.signupUsername.value.trim();
    const email = docElements.signupEmail.value.trim().toLowerCase();
    const password = docElements.signupPassword.value;
    const confirm = docElements.signupConfirm.value;
    
    // Password confirm validation
    if (password !== confirm) {
      showToast('Passwords do not match. Re-enter confirm password.', 'warn');
      return;
    }
    
    // Check duplication
    const duplicate = state.users.some(u => 
      u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email
    );
    
    if (duplicate) {
      showToast('Username or Email already registered.', 'warn');
      return;
    }
    
    // Store temp data
    tempSignupData = { username, email, password };
    
    // Simulated OTP code generation
    currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
    docElements.otpDisplayVal.textContent = currentOtp;
    docElements.otpCodeInput.value = '';
    
    showAuthCard('otp');
    showToast(`Mock OTP generated: ${currentOtp}. Enter below to verify!`, 'info');
    console.log(`[EcoTrack Verification] Generated Mock OTP for ${username}: ${currentOtp}`);
  });

  // Submit OTP Verification Form
  docElements.otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const codeEntered = docElements.otpCodeInput.value.trim();
    
    if (codeEntered === currentOtp) {
      const newUser = {
        username: tempSignupData.username,
        email: tempSignupData.email,
        password: tempSignupData.password,
        verified: true
      };
      
      // Save database
      state.users.push(newUser);
      localStorage.setItem('ecotrack_users', JSON.stringify(state.users));
      
      // Log in automatically
      state.currentUser = { username: newUser.username, email: newUser.email };
      localStorage.setItem('ecotrack_current_user', JSON.stringify(state.currentUser));
      
      // Setup blank state data
      state.calculator = null;
      state.logs = [];
      state.challenges = [];
      state.badges = [];
      
      // Save blank scoped configurations
      saveUserData('calculator', state.calculator);
      saveUserData('logs', state.logs);
      saveUserData('challenges', state.challenges);
      saveUserData('badges', state.badges);
      
      updateAuthUI();
      showToast(`Account verified! Registration successful. Welcome, ${newUser.username}!`, 'success');
      
      // Clear variables
      tempSignupData = null;
      currentOtp = null;
      docElements.signupForm.reset();
      docElements.otpForm.reset();
    } else {
      showToast('Incorrect verification code. Please check code and try again.', 'warn');
    }
  });

  // Log Out button
  docElements.btnLogout.addEventListener('click', () => {
    state.currentUser = null;
    localStorage.removeItem('ecotrack_current_user');
    
    // Reset scoped states
    state.calculator = null;
    state.logs = [];
    state.challenges = [];
    state.badges = [];
    
    updateAuthUI();
    showToast('You have logged out of EcoTrack.', 'info');
  });
}


// Setup Navigation & Menu interactions
function setupNavigation() {
  // Sticky scroll styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      docElements.header.classList.add('scrolled');
    } else {
      docElements.header.classList.remove('scrolled');
    }
    
    // Highlight Active Link on scroll
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });

    docElements.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile navigation hamburger toggle
  docElements.mobileToggle.addEventListener('click', () => {
    docElements.mobileToggle.classList.toggle('active');
    docElements.navMenu.classList.toggle('active');
  });

  // Close mobile menu on click link
  docElements.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      docElements.mobileToggle.classList.remove('active');
      docElements.navMenu.classList.remove('active');
    });
  });
}

// Setup Carbon Footprint Calculator Form
function setupCalculator() {
  docElements.calculatorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentUser) return;
    
    const distance = parseFloat(docElements.travelDistanceInput.value) || 0;
    const mode = docElements.travelModeInput.value;
    const electricity = parseFloat(docElements.electricityInput.value) || 0;
    const food = docElements.foodHabitInput.value;
    const plastic = docElements.plasticUsageInput.value;
    const shopping = docElements.shoppingHabitInput.value;

    // Calculations
    const travelCo2 = distance * 30 * CARBON_FACTORS.travel[mode];
    const electricityCo2 = electricity * CARBON_FACTORS.electricity;
    const foodCo2 = CARBON_FACTORS.food[food];
    const plasticCo2 = CARBON_FACTORS.plastic[plastic];
    const shoppingCo2 = CARBON_FACTORS.shopping[shopping];

    const totalMonthlyCo2 = travelCo2 + electricityCo2 + foodCo2 + plasticCo2 + shoppingCo2;
    
    let category = 'Moderate';
    let explanation = '';
    
    if (totalMonthlyCo2 < 200) {
      category = 'Low';
      explanation = 'Excellent work! Your carbon footprint is well below average. You are doing a fantastic job maintaining an environmentally sustainable lifestyle.';
    } else if (totalMonthlyCo2 > 500) {
      category = 'High';
      explanation = 'Your monthly carbon footprint is high. Swapping car commutes for public transit, reducing appliance electrical usage, and buying sustainable options can significantly lower your impact.';
    } else {
      category = 'Moderate';
      explanation = 'Your footprint is in the average range. Focus on replacing a few car trips, adding vegetable days, and cutting single-use plastics to move down to Low carbon output.';
    }

    state.calculator = {
      travelDistance: distance,
      travelMode: mode,
      electricity: electricity,
      foodHabit: food,
      plasticUsage: plastic,
      shoppingHabit: shopping,
      footprint: Math.round(totalMonthlyCo2 * 10) / 10,
      category: category,
      explanation: explanation
    };

    saveUserData('calculator', state.calculator);
    renderCalculatorResult();
    renderInsights();
    renderDashboard();
    showToast('Carbon Footprint calculated successfully!', 'success');
    
    // Smooth scroll to results panel
    if (docElements.calculatorResultsPanel) {
      docElements.calculatorResultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Render calculator results card
function renderCalculatorResult() {
  const panel = docElements.calculatorResultsPanel;
  const calcResult = docElements.calcResult;
  
  if (!state.calculator) {
    if (panel) panel.style.display = 'none';
    return;
  }

  if (panel) panel.style.display = 'flex';
  const c = state.calculator;
  calcResult.innerHTML = `
    <div class="result-value-container">
      <div class="result-number">${c.footprint}</div>
      <div class="result-unit">kg CO2 / Month</div>
    </div>
    <div class="result-badge ${c.category.toLowerCase()}">${c.category} Footprint</div>
    <p class="result-explanation">${c.explanation}</p>
    <div style="font-size: 0.82rem; color: var(--muted-text); width: 100%; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 15px;">
      <strong>Breakdown:</strong> Transport: ${Math.round(c.travelDistance * 30 * CARBON_FACTORS.travel[c.travelMode])}kg | 
      Utilities: ${Math.round(c.electricity * CARBON_FACTORS.electricity)}kg | 
      Food: ${CARBON_FACTORS.food[c.foodHabit]}kg | 
      Consumption: ${CARBON_FACTORS.plastic[c.plasticUsage] + CARBON_FACTORS.shopping[c.shoppingHabit]}kg
    </div>
  `;
}

// Render recommendations panel based on calculator data
function renderInsights() {
  if (!state.calculator) {
    docElements.insightsContainer.style.display = 'none';
    return;
  }

  const c = state.calculator;
  const grid = docElements.insightsGrid;
  grid.innerHTML = '';
  let insightCount = 0;

  // Travel advice
  const travelEmissions = c.travelDistance * 30 * CARBON_FACTORS.travel[c.travelMode];
  if (travelEmissions > 80) {
    insightCount++;
    grid.innerHTML += `
      <div class="insight-card travel">
        <div class="insight-icon">🚌</div>
        <div class="insight-info">
          <h4>Optimize Your Transport</h4>
          <p>Your transport emissions are substantial (${Math.round(travelEmissions)}kg/mo). Swap driving for train or bus routes. Walk or bike for trips under 3km.</p>
        </div>
      </div>
    `;
  }

  // Electricity advice
  const electricityEmissions = c.electricity * CARBON_FACTORS.electricity;
  if (electricityEmissions > 100) {
    insightCount++;
    grid.innerHTML += `
      <div class="insight-card energy">
        <div class="insight-icon">💡</div>
        <div class="insight-info">
          <h4>Reduce Household Electricity</h4>
          <p>Utilities contribute ${Math.round(electricityEmissions)}kg/mo. Unplug unused devices, transition to LED light bulbs, and wash laundry in cold cycles.</p>
        </div>
      </div>
    `;
  }

  // Diet advice
  if (c.foodHabit === 'Non-Vegetarian' || c.foodHabit === 'Mixed') {
    insightCount++;
    grid.innerHTML += `
      <div class="insight-card food">
        <div class="insight-icon">🥗</div>
        <div class="insight-info">
          <h4>Try Plant-Based Alternatives</h4>
          <p>Diet generates ${CARBON_FACTORS.food[c.foodHabit]}kg/mo. Replacing meat with lentils, beans, and vegetables just 3 days a week significantly cuts emissions.</p>
        </div>
      </div>
    `;
  }

  // Plastic advice
  if (c.plasticUsage === 'High' || c.plasticUsage === 'Medium') {
    insightCount++;
    grid.innerHTML += `
      <div class="insight-card plastic">
        <div class="insight-icon">🛍️</div>
        <div class="insight-info">
          <h4>Minimize Single-Use Plastics</h4>
          <p>Your plastic footprint is ${CARBON_FACTORS.plastic[c.plasticUsage]}kg/mo. Bring canvas tote bags when shopping and use stainless steel water canisters.</p>
        </div>
      </div>
    `;
  }

  // Shopping advice
  if (c.shoppingHabit === 'High' || c.shoppingHabit === 'Medium') {
    insightCount++;
    grid.innerHTML += `
      <div class="insight-card shopping">
        <div class="insight-icon">🛒</div>
        <div class="insight-info">
          <h4>Practice Conscious Buying</h4>
          <p>Retail goods add ${CARBON_FACTORS.shopping[c.shoppingHabit]}kg/mo. Focus on circular fashion, purchase secondhand goods, and repair before replacing items.</p>
        </div>
      </div>
    `;
  }

  if (insightCount > 0) {
    docElements.insightsContainer.style.display = 'block';
  } else {
    // If no specific advice, show general encouragement
    grid.innerHTML = `
      <div class="insight-card food">
        <div class="insight-icon">🍃</div>
        <div class="insight-info">
          <h4>Keep doing amazing work!</h4>
          <p>Your carbon footprint is low across all sectors. Look at joining challenges to help raise awareness in your social circle.</p>
        </div>
      </div>
    `;
    docElements.insightsContainer.style.display = 'block';
  }
}

// Setup Action Tracker checkbox visuals and Save logic
function setupTracker() {
  // Action selection toggle design
  docElements.actionCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    
    checkbox.addEventListener('change', () => {
      card.classList.toggle('selected', checkbox.checked);
    });
  });

  // Save selected actions
  docElements.trackerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentUser) return;
    
    const selectedActions = [];
    let savedCo2Today = 0;

    docElements.actionCards.forEach(card => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox.checked) {
        const actionVal = checkbox.value;
        selectedActions.push(actionVal);
        savedCo2Today += ACTION_SAVINGS[actionVal];
      }
    });

    if (selectedActions.length === 0) {
      showToast('Please select at least one eco action to save!', 'warn');
      return;
    }

    const todayDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const newLog = {
      id: Date.now().toString(),
      date: todayDateStr,
      actions: selectedActions,
      savedCo2: Math.round(savedCo2Today * 100) / 100
    };

    state.logs.unshift(newLog); // Add to beginning of array
    saveUserData('logs', state.logs);
    
    // Clear checklist
    docElements.actionCards.forEach(card => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.checked = false;
      card.classList.remove('selected');
    });

    showToast(`Logged successfully! Saved ${newLog.savedCo2} kg CO2 today!`, 'success');
    
    // Run badge evaluations
    checkBadges();
    
    // Render changes
    renderDashboard();
    renderHistory();
  });
}

// Render history logs
function renderHistory() {
  const list = docElements.historyList;
  if (state.logs.length === 0) {
    list.innerHTML = `<div class="no-history">No activity logged yet. Check actions above and save today's work!</div>`;
    return;
  }

  list.innerHTML = state.logs.map(log => {
    const actionNames = log.actions.map(act => ACTION_LABELS[act] || act).join(', ');
    return `
      <div class="history-item">
        <div class="history-item-details">
          <span class="history-date">${log.date}</span>
          <span class="history-desc-text">${actionNames}</span>
        </div>
        <span class="history-saving">-${log.savedCo2} kg</span>
      </div>
    `;
  }).join('');
}

// Setup goals/challenges joining logic
function setupChallenges() {
  docElements.challengeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.currentUser) return;
      
      const challengeId = btn.getAttribute('data-challenge-id');
      
      if (!state.challenges.includes(challengeId)) {
        state.challenges.push(challengeId);
        saveUserData('challenges', state.challenges);
        
        const card = document.getElementById(`challenge-${challengeId}`);
        if (card) {
          card.classList.add('joined');
          btn.textContent = 'Challenge Joined ✓';
          btn.classList.replace('btn-secondary', 'btn-primary');
          btn.disabled = true;
        }
        
        const challengeName = card.querySelector('.challenge-title').textContent;
        showToast(`Joined the "${challengeName}"! Keep it up!`, 'success');
      }
    });
  });
}

// Redraw challenges state based on scoped configurations loaded
function renderChallengesState() {
  docElements.challengeBtns.forEach(btn => {
    const challengeId = btn.getAttribute('data-challenge-id');
    const card = document.getElementById(`challenge-${challengeId}`);
    
    if (state.challenges.includes(challengeId)) {
      if (card) card.classList.add('joined');
      btn.textContent = 'Challenge Joined ✓';
      btn.classList.replace('btn-secondary', 'btn-primary');
      btn.disabled = true;
    } else {
      if (card) card.classList.remove('joined');
      btn.textContent = 'Join Challenge';
      btn.classList.replace('btn-primary', 'btn-secondary');
      btn.disabled = false;
    }
  });
}

// Badge Unlocking Evaluations
function checkBadges() {
  if (!state.currentUser) return;
  const currentBadges = [...state.badges];
  const totalLogsCount = state.logs.length;
  
  if (totalLogsCount === 0) return;

  // Collect all unique action tags across entire logs history
  const allLoggedActions = new Set();
  let totalActionsCompleted = 0;
  
  state.logs.forEach(log => {
    log.actions.forEach(act => {
      allLoggedActions.add(act);
      totalActionsCompleted++;
    });
  });

  // Badge 1: Green Starter
  if (!state.badges.includes('starter') && totalLogsCount >= 1) {
    state.badges.push('starter');
    showToast('Unlocked Badge: Green Starter!', 'success');
  }

  // Badge 2: Energy Saver
  if (!state.badges.includes('energy') && allLoggedActions.has('electricity')) {
    state.badges.push('energy');
    showToast('Unlocked Badge: Energy Saver!', 'success');
  }

  // Badge 3: Plastic-Free Hero
  if (!state.badges.includes('plastic') && (allLoggedActions.has('plastic') || allLoggedActions.has('bottle'))) {
    state.badges.push('plastic');
    showToast('Unlocked Badge: Plastic-Free Hero!', 'success');
  }

  // Badge 4: Green Traveler
  if (!state.badges.includes('travel') && (allLoggedActions.has('transport') || allLoggedActions.has('walk-cycle'))) {
    state.badges.push('travel');
    showToast('Unlocked Badge: Green Traveler!', 'success');
  }

  // Badge 5: Climate Champion
  if (!state.badges.includes('champion') && totalActionsCompleted >= 10) {
    state.badges.push('champion');
    showToast('Unlocked Badge: Climate Champion!', 'success');
  }

  // If any new badge was unlocked, save and re-render badges
  if (state.badges.length !== currentBadges.length) {
    saveUserData('badges', state.badges);
    renderBadges();
  }
}

// Calculate dynamic 3-level tier names based on progress
function getBadgeTierName(key) {
  const totalLogsCount = state.logs.length;
  if (totalLogsCount === 0) return '';
  
  const getActionCount = (actKey) => state.logs.filter(log => log.actions.includes(actKey)).length;
  
  let count = 0;
  if (key === 'starter') {
    count = totalLogsCount;
  } else if (key === 'energy') {
    count = getActionCount('electricity');
  } else if (key === 'plastic') {
    count = state.logs.filter(log => log.actions.includes('plastic') || log.actions.includes('bottle')).length;
  } else if (key === 'travel') {
    count = state.logs.filter(log => log.actions.includes('transport') || log.actions.includes('walk-cycle')).length;
  } else if (key === 'champion') {
    let totalActions = 0;
    state.logs.forEach(log => { totalActions += log.actions.length; });
    
    if (totalActions >= 30) return 'Biosphere Sentinel';
    if (totalActions >= 20) return 'Canopy Guardian';
    if (totalActions >= 10) return 'Leaf Sprout';
    return '';
  }
  
  if (count >= 5) return 'Biosphere Sentinel';
  if (count >= 3) return 'Canopy Guardian';
  if (count >= 1) return 'Leaf Sprout';
  return '';
}

// Render badges UI (Locked vs Unlocked status)
function renderBadges() {
  const keys = Object.keys(docElements.badges);
  keys.forEach(key => {
    const card = docElements.badges[key];
    const statusLabel = card.querySelector('.badge-status');
    const criteriaLabel = card.querySelector('.badge-criteria');
    
    // Reset tier classes on card
    card.classList.remove('tier-sprout', 'tier-guardian', 'tier-sentinel');

    if (state.badges.includes(key)) {
      card.classList.add('unlocked');
      statusLabel.textContent = 'Unlocked';
      
      // Calculate dynamic tier
      const tierName = getBadgeTierName(key);
      if (tierName) {
        // Update criteria label to show active Level
        criteriaLabel.innerHTML = `<strong>Level: ${tierName}</strong>`;
        
        // Add corresponding tier styling class
        if (tierName === 'Leaf Sprout') card.classList.add('tier-sprout');
        if (tierName === 'Canopy Guardian') card.classList.add('tier-guardian');
        if (tierName === 'Biosphere Sentinel') card.classList.add('tier-sentinel');
      }
    } else {
      card.classList.remove('unlocked');
      statusLabel.textContent = 'Locked';
      
      // Restore default criteria text
      if (key === 'starter') criteriaLabel.textContent = 'Saved your first daily action log';
      if (key === 'energy') criteriaLabel.textContent = 'Logged "Saved electricity" actions';
      if (key === 'plastic') criteriaLabel.textContent = 'Logged plastic-free habits';
      if (key === 'travel') criteriaLabel.textContent = 'Logged public transport or cycle commutes';
      if (key === 'champion') criteriaLabel.textContent = 'Completed 10 total daily actions';
    }
  });
}

// Calculate the best eco habit (the one logged the most)
function calculateBestHabit() {
  if (state.logs.length === 0) {
    return { name: 'None Yet', count: 0 };
  }

  const counts = {};
  state.logs.forEach(log => {
    log.actions.forEach(act => {
      counts[act] = (counts[act] || 0) + 1;
    });
  });

  let maxKey = '';
  let maxVal = 0;
  
  for (const key in counts) {
    if (counts[key] > maxVal) {
      maxVal = counts[key];
      maxKey = key;
    }
  }

  if (maxKey) {
    return {
      name: HABIT_TITLES[maxKey] || maxKey,
      count: maxVal,
      emoji: getActionEmoji(maxKey)
    };
  }
  
  return { name: 'None Yet', count: 0 };
}

function getActionEmoji(actionKey) {
  const card = document.querySelector(`.action-checkbox-card[for="act-${actionKey}"]`);
  if (card) {
    const emojiSpan = card.querySelector('.action-emoji');
    return emojiSpan ? emojiSpan.textContent : '⭐';
  }
  return '⭐';
}

// Update the dynamic dashboard values
function renderDashboard() {
  // 1. Footprint
  if (state.calculator) {
    docElements.dbFootprint.textContent = `${state.calculator.footprint} kg`;
    docElements.dbFootprintCat.textContent = `${state.calculator.category} Footprint`;
    docElements.dbFootprintCat.style.color = getCategoryColor(state.calculator.category);
  } else {
    docElements.dbFootprint.textContent = '--';
    docElements.dbFootprintCat.textContent = 'Not calculated yet';
    docElements.dbFootprintCat.style.color = 'var(--muted-text)';
  }

  // 2. Total Saved
  let totalSaved = 0;
  let totalActionsCount = 0;
  state.logs.forEach(log => {
    totalSaved += log.savedCo2;
    totalActionsCount += log.actions.length;
  });
  
  const totalSavedRounded = Math.round(totalSaved * 10) / 10;
  docElements.dbSaved.textContent = totalSavedRounded.toFixed(1);
  docElements.dbActionsCount.textContent = totalActionsCount;
  docElements.navSavedVal.textContent = totalSavedRounded.toFixed(1);

  // 3. Best Habit
  const best = calculateBestHabit();
  if (best.name !== 'None Yet') {
    docElements.dbBestHabit.innerHTML = `${best.emoji || '⭐'} ${best.name}`;
    docElements.dbBestHabitDesc.textContent = `Logged ${best.count} time${best.count > 1 ? 's' : ''}`;
  } else {
    docElements.dbBestHabit.textContent = 'None Yet';
    docElements.dbBestHabitDesc.textContent = 'Log actions to reveal';
  }

  // 4. Progress Goal (Goal target of 50 kg CO2 / Month)
  const targetGoal = 50;
  const percentage = Math.min(Math.round((totalSavedRounded / targetGoal) * 100), 100);
  
  docElements.goalPercentage.textContent = `${percentage}%`;
  docElements.goalProgressBar.style.width = `${percentage}%`;

  // Encouragement Message
  const textContainer = docElements.encouragementText;
  if (percentage === 0) {
    textContainer.textContent = 'Calculate your carbon footprint and check off some green actions to pass the eco vibe check, no cap.';
  } else if (percentage < 30) {
    textContainer.textContent = 'Offsetting carbon emissions is lowkey a whole mood! Keep making those green habits happen.';
  } else if (percentage < 70) {
    textContainer.textContent = 'You are seriously slaying the sustainability game. Offsetting emissions is totally coding eco-warrior!';
  } else if (percentage < 100) {
    textContainer.textContent = 'Almost at the target! Just a few more eco-friendly choices to hit that monthly carbon zenith, period.';
  } else {
    textContainer.textContent = 'Absolute legend! You fully hit your monthly offset target. You are officially certified biosphere zenith, no cap!';
  }
}

function getCategoryColor(cat) {
  if (cat === 'Low') return '#047857';
  if (cat === 'Moderate') return '#d97706';
  if (cat === 'High') return '#b91c1c';
  return 'var(--muted-text)';
}

// Render all modules
function renderAll() {
  renderCalculatorResult();
  renderInsights();
  renderHistory();
  renderBadges();
  renderDashboard();
  renderChallengesState();
}

// Reset System Configuration
function setupReset() {
  docElements.resetBtn.addEventListener('click', () => {
    if (!state.currentUser) return;
    const username = state.currentUser.username;
    
    const confirmation = confirm('Are you sure you want to reset all of your carbon calculations, logged logs, challenges, and unlocked rewards for this account? This action is permanent.');
    
    if (confirmation) {
      // Clear user scoped items from localStorage
      localStorage.removeItem(`ecotrack_calculator_${username}`);
      localStorage.removeItem(`ecotrack_logs_${username}`);
      localStorage.removeItem(`ecotrack_challenges_${username}`);
      localStorage.removeItem(`ecotrack_badges_${username}`);
      
      // Reset State variables
      state.calculator = null;
      state.logs = [];
      state.challenges = [];
      state.badges = [];
      
      // Reset DOM elements manually
      docElements.calculatorForm.reset();
      docElements.trackerForm.reset();
      
      showToast('All calculations and habits have been wiped for your profile!', 'warn');
      renderAll();
    }
  });
}

// Bind sharing and click listener events to badges
function setupBadgeSharing() {
  const modalOverlay = document.getElementById('badge-modal');
  const modalClose = document.getElementById('badge-modal-close');
  
  if (modalOverlay && modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
    
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
      }
    });
  }

  // Add click listeners to badge cards
  const keys = Object.keys(docElements.badges);
  keys.forEach(key => {
    const card = docElements.badges[key];
    if (card) {
      card.addEventListener('click', () => {
        if (state.badges.includes(key)) {
          const name = card.querySelector('.badge-name').textContent;
          const emoji = card.querySelector('.badge-art').textContent;
          openBadgeModal(key, name, emoji);
        }
      });
    }
  });
}

// Open Share & Download Badge Dialog
function openBadgeModal(key, name, emoji) {
  const modal = document.getElementById('badge-modal');
  const modalTitle = document.getElementById('modal-badge-title');
  const modalImg = document.getElementById('modal-badge-img');
  const btnDownload = document.getElementById('btn-download-badge');
  const shareWhatsapp = document.getElementById('share-whatsapp');
  const shareLinkedin = document.getElementById('share-linkedin');
  const shareInstagram = document.getElementById('share-instagram');
  const instagramHelper = document.getElementById('instagram-helper');
  const captionText = document.getElementById('caption-text');
  const btnCopyCaption = document.getElementById('btn-copy-caption');
  
  if (!modal) return;
  
  instagramHelper.style.display = 'none';
  
  const tierName = getBadgeTierName(key);
  modalTitle.textContent = `${name} - ${tierName} Unlocked!`;
  
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  let totalSaved = 0;
  state.logs.forEach(log => { totalSaved += log.savedCo2; });
  const totalSavedRounded = Math.round(totalSaved * 10) / 10;
  
  const activeUsername = state.currentUser ? state.currentUser.username : 'Eco Warrior';
  
  generateBadgeImage(key, name, emoji, todayDateStr, activeUsername, tierName, (dataUrl) => {
    modalImg.src = dataUrl;
    btnDownload.href = dataUrl;
    btnDownload.download = `EcoTrack_${key}_${tierName.replace(/\s+/g, '_')}_Badge.png`;
  });

  const appUrl = encodeURIComponent(window.location.origin + window.location.pathname);
  const rawMessage = `I just unlocked the *${name}* badge (Level: *${tierName}*) on EcoTrack by reducing my carbon impact! I have offset ${totalSavedRounded} kg of CO2 so far. Track yours here:`;
  const shareText = encodeURIComponent(`${rawMessage} `) + appUrl;
  
  shareWhatsapp.href = `https://api.whatsapp.com/send?text=${shareText}`;
  
  const linkedinText = encodeURIComponent(`I just unlocked the ${name} badge (Level: ${tierName}) on EcoTrack for offsetting my carbon emissions! Check out your stats here: `) + appUrl;
  shareLinkedin.href = `https://www.linkedin.com/feed/?shareActive=true&text=${linkedinText}`;
  
  const captionTemplate = `I just unlocked the ${name} badge (Level: ${tierName}) on EcoTrack by reducing my carbon footprint by ${totalSavedRounded} kg of CO2! 🌱 Track your impact at: ${window.location.origin + window.location.pathname} #EcoTrack #Sustainability`;
  captionText.textContent = captionTemplate;
  
  // Clean event handlers
  const newShareInstagram = shareInstagram.cloneNode(true);
  shareInstagram.parentNode.replaceChild(newShareInstagram, shareInstagram);
  newShareInstagram.addEventListener('click', () => {
    instagramHelper.style.display = instagramHelper.style.display === 'none' ? 'block' : 'none';
  });
  
  const newBtnCopy = btnCopyCaption.cloneNode(true);
  btnCopyCaption.parentNode.replaceChild(newBtnCopy, btnCopyCaption);
  newBtnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(captionTemplate).then(() => {
      showToast('Caption copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Copy caption failed: ', err);
      showToast('Failed to copy caption.', 'warn');
    });
  });

  modal.style.display = 'flex';
}

// Generate circular badge image dynamically using Canvas API
function generateBadgeImage(key, badgeName, emoji, dateString, username, tierName, callback) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, '#059669');
  grad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(200, 200, 190, 0, Math.PI * 2);
  ctx.fill();

  // Outer Gold Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(200, 200, 178, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dash border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(200, 200, 168, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Awarded to Username
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`AWARDED TO: ${username.toUpperCase()}`, 200, 75);

  // Badge Emoji Graphic
  ctx.font = '90px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 200, 150);

  // Badge Name text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(badgeName, 200, 230);

  // Active Tier level
  ctx.fillStyle = '#fbbf24'; // Gold
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`Level: ${tierName}`, 200, 265);

  // Subtitle Verified tag
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('VERIFIED ECOTRACK ACHIEVEMENT', 200, 295);

  // Date earned
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Earned on: ${dateString}`, 200, 320);

  // Branding EcoTrack tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('🌱 EcoTrack', 200, 350);

  callback(canvas.toDataURL('image/png'));
}

// Gen Z Particle Burst Emitter & Action Listeners
function setupGenZInteractions() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    // Trigger particle burst on button presses or checkbox switches
    if (
      (target.tagName === 'BUTTON' && (target.type === 'submit' || target.classList.contains('btn-join-challenge') || target.id === 'btn-copy-caption' || target.id === 'reset-data-btn')) ||
      (target.classList.contains('action-checkbox-card') || target.closest('.action-checkbox-card'))
    ) {
      triggerParticleBurst(e.clientX, e.clientY);
    }
  });
}

// Spawn green SVGs & sparkles particles flying outward
function triggerParticleBurst(clientX, clientY) {
  const particles = ['🌱', '🍃', '✨', '⚡', '🍀'];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    el.className = 'eco-particle';
    el.textContent = particles[Math.floor(Math.random() * particles.length)];
    
    // Position absolutely on screen at click coords
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;

    // Calculate random trajectory angles
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 120;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rot = -180 + Math.random() * 360;

    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(el);

    // Clean memory after flight is done
    el.addEventListener('animationend', () => {
      el.remove();
    });
  }
}
