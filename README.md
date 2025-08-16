# AidChain

**Transparent Donation Tracking Platform**

AidChain is a blockchain-powered donation platform aimed at enhancing transparency and trust. It allows donors to make contributions, monitor real-world impact, and provides a recipient portal for organizations to post updates on fund usage.

---

## Demo

A live version of AidChain is available at:

[https://aidchain.netlify.app/](https://aidchain.netlify.app/)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Donor | `donor@demo.com` | `password123` |
| Admin | `admin@demo.com` | `password123` |

---

## Features

### Donor Dashboard
- **Wallet Balance**: Default starting balance for donors.
- **Stats**: Displays total donated, number of organizations supported, people helped, and impact score.
- **Donation History**: Tracks past donations with messages and dates.
- **Impact Tracker**: Shows real-world outcomes of contributions.

### Donation Flow
- Choose from verified organizations:
  - **Clean Water Initiative**
  - **Education for All**
  - **Healthcare Access**
- Fill in donation amount, name, and optional message.
- Processes via steps:
  1. Smart contract creation  
  2. Payment processing  
  3. Blockchain recording  
  4. Recipient notification

### Public Transparency Ledger
- Filterable list of donations, disbursements, and impact updates.
- Enables real-time visibility of all transaction flows.

### Recipient Portal (Admin)
- Organizations can post impact updates:
  - Title and description
  - Funds used and people impacted
- Updates appear both in the portal and the public ledger.

---

## Getting Started

### Installation
** Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/aidchain.git
   cd aidchain
````

## Usage

1. Upon loading, choose your role — Donor or Organization Admin.
2. Sign in using the demo credentials.
3. Explore:

   * Donor: dashboards, donation flow, and registry access.
   * Admin: post updates via the Recipient Portal.
4. Donations and updates dynamically reflect in the transparent ledger.

---

## Tech Stack

* **Frontend**: HTML, CSS, JavaScript, with modular page views (login, donor, admin).
* **Blockchain Simulation**: Steps and confirmations are simulated client-side.
* **State Management**: JavaScript maintains state for donations, balance, and updates.
* **Browser Storage**: Uses `localStorage` to persist login sessions.

---

## Folder Structure

```
/src
  ├── index.html      # Main application with login, donor & admin areas
  ├── style.css       # Shared styles for all pages
  └── script.js       # Logic for authentication, navigation, and data handling
README.md              # Project overview and setup guide
```

---

## Future Work Ideas

* **Blockchain Integration**: Connect with Ethereum or other networks for real donations.
* **Authentication**: Use OAuth or wallet-based logins (e.g., MetaMask).
* **Backend Setup**: Add a server or database for real-world user and transaction persistence.
* **Enhanced Admin Dashboard**: Visualize donations, export reports, and manage content.
* **Mobile Optimization**: Refine responsiveness for seamless access on smartphones.

---
