// Application State
let appState = {
    currentView: 'login',
    isLoggedIn: false,
    userRole: null,
    userName: null,
    userEmail: null,
    walletBalance: 5000,
    totalDonated: 0,
    organizationsSupported: 0,
    peopleHelped: 0,
    impactScore: 0,
    donations: [],
    transactions: [],
    impactUpdates: [],
    selectedOrg: null,
    selectedRole: null
};

// Demo credentials
const demoCredentials = {
    'donor@demo.com': {
        password: 'password123',
        role: 'donor',
        name: 'Sarah Johnson'
    },
    'admin@demo.com': {
        password: 'password123',
        role: 'admin',
        name: 'Michael Chen'
    }
};

// Organization Data
const organizations = {
    'clean-water': {
        name: 'Clean Water Initiative',
        description: 'Providing clean drinking water to rural communities',
        icon: '🌊',
        impactPerDollar: 5, // people helped per dollar
        transparencyScore: 98
    },
    'education': {
        name: 'Education for All',
        description: 'Building schools and providing educational resources',
        icon: '📚',
        impactPerDollar: 2,
        transparencyScore: 95
    },
    'healthcare': {
        name: 'Healthcare Access',
        description: 'Mobile clinics and medical supplies for underserved areas',
        icon: '🏥',
        impactPerDollar: 3,
        transparencyScore: 97
    }
};

// DOM Elements
const viewElements = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('.nav-btn');
const orgCards = document.querySelectorAll('.org-card');
const donationForm = document.getElementById('donationForm');
const transactionModal = document.getElementById('transactionModal');
const roleOptions = document.querySelectorAll('.role-option');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkLoginState();
    loadSampleData();
});

// Check if user is already logged in
function checkLoginState() {
    const savedUser = localStorage.getItem('aidchain_user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        loginUser(userData.email, userData.role, userData.name);
    } else {
        showLoginView();
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!appState.isLoggedIn) {
                showLoginView();
                return;
            }
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Role selection
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectRole(option.dataset.role);
        });
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Organization Selection
    orgCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!appState.isLoggedIn || appState.userRole !== 'donor') {
                return;
            }
            selectOrganization(card.dataset.org);
        });
    });

    // Recipient Organization Selector
    const recipientOrgSelect = document.getElementById('recipientOrg');
    if (recipientOrgSelect) {
        recipientOrgSelect.addEventListener('change', (e) => {
            const updateForm = document.getElementById('updateForm');
            if (e.target.value) {
                updateForm.style.display = 'block';
            } else {
                updateForm.style.display = 'none';
            }
        });
    }

    // Ledger Filters
    const orgFilter = document.getElementById('orgFilter');
    const typeFilter = document.getElementById('typeFilter');
    if (orgFilter && typeFilter) {
        orgFilter.addEventListener('change', filterTransactions);
        typeFilter.addEventListener('change', filterTransactions);
    }
}

// Authentication Functions
function selectRole(role) {
    appState.selectedRole = role;
    
    // Update role selection UI
    roleOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.role === role) {
            option.classList.add('selected');
        }
    });

    // Show login form
    const roleSelection = document.querySelector('.role-selection');
    const loginForm = document.getElementById('loginForm');
    const selectedRoleDisplay = document.getElementById('selectedRoleDisplay');
    
    const roleInfo = {
        donor: { icon: '👤', title: 'Donor Login', desc: 'Access your donation dashboard' },
        admin: { icon: '⚙️', title: 'Organization Admin Login', desc: 'Manage recipient portal' }
    };
    
    selectedRoleDisplay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 2rem;">${roleInfo[role].icon}</span>
            <div>
                <strong>${roleInfo[role].title}</strong>
                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">${roleInfo[role].desc}</p>
            </div>
        </div>
    `;
    
    roleSelection.style.display = 'none';
    loginForm.style.display = 'block';
}

function backToRoleSelection() {
    const roleSelection = document.querySelector('.role-selection');
    const loginForm = document.getElementById('loginForm');
    
    roleSelection.style.display = 'block';
    loginForm.style.display = 'none';
    
    // Clear form
    document.getElementById('loginName').value = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    // Clear role selection
    roleOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    appState.selectedRole = null;
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const name = document.getElementById('loginName').value;
    
    // Check demo credentials
    const user = demoCredentials[email];
    if (user && user.password === password && user.role === appState.selectedRole) {
        loginUser(email, user.role, user.name || name);
    } else {
        // For demo purposes, allow any credentials with the selected role
        if (name && email && password && appState.selectedRole) {
            loginUser(email, appState.selectedRole, name);
        } else {
            alert('Invalid credentials. Please check the demo credentials provided.');
        }
    }
}

function loginUser(email, role, name) {
    appState.isLoggedIn = true;
    appState.userRole = role;
    appState.userName = name;
    appState.userEmail = email;
    
    // Save to localStorage
    localStorage.setItem('aidchain_user', JSON.stringify({
        email: email,
        role: role,
        name: name
    }));
    
    // Update UI
    updateUIForLoggedInUser();
    
    // Switch to appropriate dashboard
    if (role === 'admin') {
        switchView('recipient');
    } else {
        switchView('dashboard');
    }
}

function logout() {
    appState.isLoggedIn = false;
    appState.userRole = null;
    appState.userName = null;
    appState.userEmail = null;
    
    localStorage.removeItem('aidchain_user');
    
    showLoginView();
}

function showLoginView() {
    // Hide all views and show login
    viewElements.forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById('login').classList.add('active');
    
    // Hide navigation elements
    document.getElementById('navMenu').style.display = 'none';
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    
    // Reset navigation
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    appState.currentView = 'login';
}

function updateUIForLoggedInUser() {
    // Show navigation
    document.getElementById('navMenu').style.display = 'flex';
    document.getElementById('welcomeMessage').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'block';
    
    // Update welcome message
    document.getElementById('userName').textContent = appState.userName;
    document.getElementById('userRole').textContent = appState.userRole === 'admin' ? 'Admin' : 'Donor';
    
    // Show/hide wallet info based on role
    if (appState.userRole === 'donor') {
        document.getElementById('walletInfo').style.display = 'block';
        // Hide recipient portal button for donors
        document.querySelector('[data-view="recipient"]').style.display = 'none';
    } else {
        document.getElementById('walletInfo').style.display = 'none';
        // Show recipient portal button for admins
        document.querySelector('[data-view="recipient"]').style.display = 'block';
    }
    
    // Update dashboard based on role
    if (appState.userRole === 'admin') {
        document.getElementById('dashboardTitle').textContent = 'Admin Dashboard';
        document.getElementById('dashboardSubtitle').textContent = 'Manage organization updates and track donations';
    } else {
        document.getElementById('dashboardTitle').textContent = 'Your Donation Dashboard';
        document.getElementById('dashboardSubtitle').textContent = 'Track your contributions and see their real-world impact';
    }
    
    updateDashboard();
    updateWalletBalance();
}

// View Management
function switchView(viewName) {
    if (!appState.isLoggedIn && viewName !== 'login') {
        showLoginView();
        return;
    }
    
    // Check role permissions
    if (viewName === 'recipient' && appState.userRole !== 'admin') {
        alert('Access denied. Only organization admins can access the recipient portal.');
        return;
    }
    
    if (viewName === 'donate' && appState.userRole !== 'donor') {
        alert('Access denied. Only donors can access the donation page.');
        return;
    }
    
    // Update navigation
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Update views
    viewElements.forEach(view => {
        view.classList.remove('active');
        if (view.id === viewName) {
            view.classList.add('active');
        }
    });

    appState.currentView = viewName;

    // Update content based on view
    if (viewName === 'ledger') {
        renderTransactions();
    } else if (viewName === 'recipient') {
        renderRecentUpdates();
    }
}

// Organization Selection
function selectOrganization(orgId) {
    if (appState.userRole !== 'donor') {
        return;
    }
    
    appState.selectedOrg = orgId;
    
    // Update UI
    orgCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.org === orgId) {
            card.classList.add('selected');
        }
    });

    // Show donation form
    const selectedOrgElement = document.getElementById('selectedOrg');
    const org = organizations[orgId];
    selectedOrgElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 2rem;">${org.icon}</span>
            <div>
                <strong>${org.name}</strong>
                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">${org.description}</p>
            </div>
        </div>
    `;
    
    // Pre-fill donor name
    document.getElementById('donorName').value = appState.userName;
    
    donationForm.style.display = 'block';
    donationForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelDonation() {
    appState.selectedOrg = null;
    orgCards.forEach(card => card.classList.remove('selected'));
    donationForm.style.display = 'none';
}

// Donation Processing
function processDonation() {
    if (appState.userRole !== 'donor') {
        alert('Only donors can make donations.');
        return;
    }
    
    const amount = parseInt(document.getElementById('donationAmount').value);
    const donorName = document.getElementById('donorName').value;
    const message = document.getElementById('donationMessage').value;

    if (!amount || !donorName || !appState.selectedOrg) {
        alert('Please fill in all required fields');
        return;
    }

    if (amount > appState.walletBalance) {
        alert('Insufficient wallet balance');
        return;
    }

    // Show processing modal
    showTransactionModal(amount, donorName, message);
}

function showTransactionModal(amount, donorName, message) {
    transactionModal.classList.add('active');
    
    const steps = ['Creating Smart Contract', 'Processing Payment', 'Recording on Blockchain', 'Notifying Recipient'];
    let currentStep = 0;

    const progressSteps = document.querySelectorAll('.progress-step');
    const transactionDetails = document.getElementById('transactionDetails');

    // Generate transaction ID
    const transactionId = 'TX' + Date.now().toString(36).toUpperCase();
    
    transactionDetails.innerHTML = `
        Transaction ID: ${transactionId}<br>
        Organization: ${organizations[appState.selectedOrg].name}<br>
        Amount: $${amount}<br>
        Donor: ${donorName}
    `;

    const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
            // Mark current step as completed
            if (currentStep > 0) {
                progressSteps[currentStep - 1].classList.remove('active');
                progressSteps[currentStep - 1].classList.add('completed');
            }
            
            // Activate next step
            if (currentStep < progressSteps.length) {
                progressSteps[currentStep].classList.add('active');
            }
            
            currentStep++;
        } else {
            clearInterval(stepInterval);
            
            // Complete transaction
            setTimeout(() => {
                progressSteps[progressSteps.length - 1].classList.remove('active');
                progressSteps[progressSteps.length - 1].classList.add('completed');
                
                // Process the donation
                completeDonation(amount, donorName, message, transactionId);
                
                setTimeout(() => {
                    transactionModal.classList.remove('active');
                    switchView('dashboard');
                    cancelDonation();
                }, 1500);
            }, 1000);
        }
    }, 1500);
}

function completeDonation(amount, donorName, message, transactionId) {
    const org = organizations[appState.selectedOrg];
    const timestamp = new Date();
    
    // Create donation record
    const donation = {
        id: transactionId,
        organizationId: appState.selectedOrg,
        organizationName: org.name,
        amount: amount,
        donorName: donorName,
        message: message,
        timestamp: timestamp,
        status: 'completed'
    };
    
    // Create transaction record
    const transaction = {
        id: transactionId,
        type: 'donation',
        organizationId: appState.selectedOrg,
        organizationName: org.name,
        amount: amount,
        description: `Donation from ${donorName}`,
        timestamp: timestamp,
        donorName: donorName
    };
    
    // Update state
    appState.donations.push(donation);
    appState.transactions.push(transaction);
    appState.walletBalance -= amount;
    appState.totalDonated += amount;
    
    // Update organizations supported
    const supportedOrgs = [...new Set(appState.donations.map(d => d.organizationId))];
    appState.organizationsSupported = supportedOrgs.length;
    
    // Calculate people helped
    appState.peopleHelped += Math.floor(amount * org.impactPerDollar);
    
    // Calculate impact score
    appState.impactScore = Math.min(95, Math.floor((appState.totalDonated / 100) * 5));
    
    // Update UI
    updateDashboard();
    updateWalletBalance();
}

// Dashboard Updates
function updateDashboard() {
    document.getElementById('totalDonated').textContent = `$${appState.totalDonated.toLocaleString()}`;
    document.getElementById('organizationsSupported').textContent = appState.organizationsSupported;
    document.getElementById('peopleHelped').textContent = appState.peopleHelped.toLocaleString();
    document.getElementById('impactScore').textContent = `${appState.impactScore}%`;
    
    renderDonationHistory();
    renderImpactUpdates();
}

function updateWalletBalance() {
    if (appState.userRole === 'donor') {
        document.getElementById('walletBalance').textContent = `$${appState.walletBalance.toLocaleString()}`;
    }
}

function renderDonationHistory() {
    const historyContainer = document.getElementById('donationHistory');
    
    if (appState.donations.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state"><p>No donations yet. Make your first donation to start tracking impact!</p></div>';
        return;
    }
    
    const historyHTML = appState.donations.map(donation => `
        <div class="history-item">
            <h4>${donation.organizationName}</h4>
            <p>${donation.message || 'No message provided'}</p>
            <div class="history-meta">
                <span class="history-amount">$${donation.amount}</span>
                <span class="history-date">${formatDate(donation.timestamp)}</span>
            </div>
        </div>
    `).join('');
    
    historyContainer.innerHTML = historyHTML;
}

function renderImpactUpdates() {
    const impactContainer = document.getElementById('impactUpdates');
    
    if (appState.impactUpdates.length === 0) {
        impactContainer.innerHTML = '<div class="empty-state"><p>Impact updates will appear here once you make donations.</p></div>';
        return;
    }
    
    const impactHTML = appState.impactUpdates.map(update => `
        <div class="impact-item">
            <h4>${update.title}</h4>
            <p>${update.description}</p>
            <div class="history-meta">
                <span class="history-amount">${update.peopleImpacted} people helped</span>
                <span class="history-date">${formatDate(update.timestamp)}</span>
            </div>
        </div>
    `).join('');
    
    impactContainer.innerHTML = impactHTML;
}

// Transaction Ledger
function renderTransactions() {
    const transactionList = document.getElementById('transactionList');
    
    if (appState.transactions.length === 0) {
        transactionList.innerHTML = '<div class="empty-state"><p>No transactions yet. The ledger will update as donations are made.</p></div>';
        return;
    }
    
    const transactionHTML = appState.transactions.map(tx => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>${tx.description}</h4>
                <p>${tx.organizationName} • ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                <div class="transaction-id">ID: ${tx.id}</div>
            </div>
            <div class="transaction-meta">
                <div class="transaction-amount">$${tx.amount.toLocaleString()}</div>
                <div class="transaction-time">${formatDate(tx.timestamp)}</div>
            </div>
        </div>
    `).join('');
    
    transactionList.innerHTML = transactionHTML;
}

function filterTransactions() {
    const orgFilter = document.getElementById('orgFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filteredTransactions = appState.transactions;
    
    if (orgFilter) {
        filteredTransactions = filteredTransactions.filter(tx => tx.organizationId === orgFilter);
    }
    
    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(tx => tx.type === typeFilter);
    }
    
    renderFilteredTransactions(filteredTransactions);
}

function renderFilteredTransactions(transactions) {
    const transactionList = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        transactionList.innerHTML = '<div class="empty-state"><p>No transactions match the selected filters.</p></div>';
        return;
    }
    
    const transactionHTML = transactions.map(tx => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>${tx.description}</h4>
                <p>${tx.organizationName} • ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                <div class="transaction-id">ID: ${tx.id}</div>
            </div>
            <div class="transaction-meta">
                <div class="transaction-amount">$${tx.amount.toLocaleString()}</div>
                <div class="transaction-time">${formatDate(tx.timestamp)}</div>
            </div>
        </div>
    `).join('');
    
    transactionList.innerHTML = transactionHTML;
}

// Recipient Portal
function submitUpdate() {
    if (appState.userRole !== 'admin') {
        alert('Only organization admins can submit updates.');
        return;
    }
    
    const orgId = document.getElementById('recipientOrg').value;
    const title = document.getElementById('updateTitle').value;
    const description = document.getElementById('updateDescription').value;
    const fundsUsed = parseInt(document.getElementById('fundsUsed').value);
    const peopleImpacted = parseInt(document.getElementById('peopleImpacted').value);
    
    if (!orgId || !title || !description || !fundsUsed || !peopleImpacted) {
        alert('Please fill in all fields');
        return;
    }
    
    const org = organizations[orgId];
    const timestamp = new Date();
    const updateId = 'UP' + Date.now().toString(36).toUpperCase();
    
    // Create impact update
    const impactUpdate = {
        id: updateId,
        organizationId: orgId,
        organizationName: org.name,
        title: title,
        description: description,
        fundsUsed: fundsUsed,
        peopleImpacted: peopleImpacted,
        timestamp: timestamp
    };
    
    // Create disbursement transaction
    const disbursementTransaction = {
        id: updateId,
        type: 'disbursement',
        organizationId: orgId,
        organizationName: org.name,
        amount: fundsUsed,
        description: title,
        timestamp: timestamp
    };
    
    // Create impact transaction
    const impactTransaction = {
        id: 'IM' + Date.now().toString(36).toUpperCase(),
        type: 'impact',
        organizationId: orgId,
        organizationName: org.name,
        amount: 0,
        description: `${peopleImpacted} people helped - ${title}`,
        timestamp: timestamp
    };
    
    // Update state
    appState.impactUpdates.push(impactUpdate);
    appState.transactions.push(disbursementTransaction);
    appState.transactions.push(impactTransaction);
    
    // Clear form
    document.getElementById('updateTitle').value = '';
    document.getElementById('updateDescription').value = '';
    document.getElementById('fundsUsed').value = '';
    document.getElementById('peopleImpacted').value = '';
    
    // Update UI
    renderRecentUpdates();
    updateDashboard();
    
    alert('Impact update submitted successfully!');
}

function renderRecentUpdates() {
    const updatesContainer = document.getElementById('recentUpdates');
    
    if (appState.impactUpdates.length === 0) {
        updatesContainer.innerHTML = '<div class="empty-state"><p>No updates posted yet.</p></div>';
        return;
    }
    
    const updatesHTML = appState.impactUpdates.slice(-5).reverse().map(update => `
        <div class="impact-item">
            <h4>${update.title}</h4>
            <p><strong>${update.organizationName}</strong></p>
            <p>${update.description}</p>
            <div class="history-meta">
                <span class="history-amount">$${update.fundsUsed} used • ${update.peopleImpacted} people helped</span>
                <span class="history-date">${formatDate(update.timestamp)}</span>
            </div>
        </div>
    `).join('');
    
    updatesContainer.innerHTML = updatesHTML;
}

// Sample Data
function loadSampleData() {
    // Add some sample impact updates for demonstration
    const sampleUpdates = [
        {
            id: 'UP001',
            organizationId: 'clean-water',
            organizationName: 'Clean Water Initiative',
            title: 'Water Well Completed in Rural Village',
            description: 'Successfully installed a new water well providing clean drinking water to 500+ residents.',
            fundsUsed: 2500,
            peopleImpacted: 500,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
            id: 'UP002',
            organizationId: 'education',
            organizationName: 'Education for All',
            title: 'School Supplies Distributed',
            description: 'Provided textbooks, notebooks, and learning materials to 200 students across 3 schools.',
            fundsUsed: 1200,
            peopleImpacted: 200,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
    ];
    
    // Only add sample data if no real updates exist
    if (appState.impactUpdates.length === 0) {
        appState.impactUpdates = sampleUpdates;
        
        // Add corresponding transactions
        sampleUpdates.forEach(update => {
            appState.transactions.push({
                id: update.id,
                type: 'impact',
                organizationId: update.organizationId,
                organizationName: update.organizationName,
                amount: 0,
                description: `${update.peopleImpacted} people helped - ${update.title}`,
                timestamp: update.timestamp
            });
        });
    }
}

// Utility Functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
        transactionModal.classList.remove('active');
    }
});
