# Build Guide: Running the Repository Locally

This document provides step-by-step instructions to run the repository locally.

## Prerequisites

Ensure you have the following installed:

- [DFX](https://internetcomputer.org/docs/current/developer-docs/cli-reference/dfx) for managing Internet Computer canisters.
- [Node.js](https://nodejs.org/) (Recommended version: 16.x or higher)
- [npm](https://www.npmjs.com/) (comes bundled with Node.js)

## Steps to Run

### 1. Start the Replica

To run the replica, execute the following command in your terminal:

```bash
dfx start --clean
```

This launches the Internet Computer replica in the background.

### 2. Open a New Terminal

Keep the replica running and open a new terminal window to proceed with the next steps.

### 3. Navigate to the Frontend Directory

Move to the frontend directory:

```bash
cd src/kyc_vault_frontend
```

### 4. Install Dependencies

Install the necessary dependencies for the frontend:

```bash
npm install
```

### 5. Setup the Application

Run the setup script to configure the application:

```bash
npm run setup
```

### 6. Run the Application

Once setup is complete, the application will run successfully.

You can now access the application locally.
