# Run rizz locally

## Requirements

- Node.js and npm
- Java 21
- Maven
- Docker Desktop, running before starting the database

## 1. Start PostgreSQL

Open a terminal and run:

```sh
cd /Users/shailesh_adcb/Documents/ChatGPT/BLUSHAURA-
backend/scripts/setup-local.sh
docker compose -f backend/compose.yaml up -d --wait
```

The setup script creates private local database settings on the first run. Keep the generated files in `backend/.local/` private and excluded from Git.

## 2. Start the backend

In the same terminal, run:

```sh
backend/scripts/run-local.sh
```

Leave this terminal running. Check the API at <http://127.0.0.1:8081/api/health>.

To run from IntelliJ IDEA instead, open `backend/pom.xml`, import the Maven project, select JDK 21, set the working directory to the `backend` folder, and run `BlushAuraApplication`. Start PostgreSQL first. Use either IntelliJ or the terminal script to run the backend, so they do not compete for port 8081.

## 3. Start the frontend

Open a second terminal and run:

```sh
cd /Users/shailesh_adcb/Documents/ChatGPT/BLUSHAURA-
npm install
npm run dev
```

Leave this terminal running. You only need to repeat `npm install` when dependencies change or `node_modules` is missing.

You can open the repository folder in VS Code and run these frontend commands in its integrated terminal.

## 4. Open the customer app or admin panel

- Customer app: <http://127.0.0.1:5173/>
- Admin panel: <http://127.0.0.1:5173/admin>

To sign in to the admin panel:

1. Open the admin panel URL in your browser.
2. Enter the email `admin@blushaura.local`.
3. Open `backend/.local/admin-credentials.txt` locally and use its generated password.

The backend creates the credentials file on the first startup when no admin account exists. Deleting the file does not reset an existing account's password. Do not commit or share this file.

Customer and admin flows use the same React application, Spring Boot backend, and PostgreSQL database. The frontend uses Atomic Design, Redux Toolkit, and RTK Query.

## Stop the app

Press `Ctrl+C` in the frontend and backend terminals. Stop the database without deleting its data:

```sh
docker compose -f backend/compose.yaml down
```

## If the admin panel does not open

- If the browser cannot connect to port 5173, check that `npm run dev` is running.
- If the page opens but API requests or sign-in fail, check that the backend and Docker database are running.
- If the credentials file is missing, inspect the backend startup logs and confirm that the backend uses the `backend` working directory.
- These localhost URLs work on the computer running the app. Access from another device requires a network-accessible or deployed URL.

## Formatting and checks

Frontend, from the repository root:

```sh
npm run format
npm run format:check
npm test
npm run build
```

Backend:

```sh
cd backend
mvn spotless:apply
mvn test
```
