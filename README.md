# Setup Instructions

This section outlines the steps to set up and run the Wave Chat application locally. Ensure you have Node.js (version 20 or higher) and npm installed on your system.

## 1. Install Dependencies

Navigate to the respective directories for the backend and frontend and install their dependencies:

### Backend Dependencies

```bash
cd backend
npm install
```

### Frontend Dependencies

```bash
cd frontend
npm install
```

## 2. Run the Application

### Start Backend Server

From the `backend` directory, start the server in development mode. This will typically run on `http://localhost:3001`:

```bash
cd backend
npm run dev
```

### Start Frontend Development Server

In a **separate terminal**, navigate to the `frontend` directory and start the React development server. This will open the application in your browser, typically on `http://localhost:5173`:

```bash
cd frontend
npm run dev
```

## 3. Usage

Once both the backend and frontend servers are running:

1.  Open two browser tabs or windows and navigate to `http://localhost:5173` in both.
2.  In the first tab, enter a username (e.g., "Alice") and join the chat.
3.  In the second tab, enter another username (e.g., "Bob") and join the chat.
4.  You should now see both users in the online user list. Select a user to start a conversation.
5.  Messages sent will appear in real-time in both users' chat windows.

# CloudWave Full Stack Code Challenge ~ Wave Chat

CloudWave have provided scaffolding for both the front and back end of the challenge, to save you time.

## Front-end

### Configuration

This application uses Vite, ReactJS, Typescript and vitest for testing. `tsconfig.json` has been pre-configured for the environment and hot reloading has been set up for you.

⚠️ **Some files may throw typescript errors due to empty placeholder files or commented out code.**

&nbsp;

### Linting

There's `stylelint` for linting SCSS files and `eslint` for linting code. You can lint the application with the `lint` and `lint:styles` commands in `package.json`.

⚠️ **Some files may throw linting warnings due to commented out scaffolding code.**

&nbsp;

### UI & Components

We've added `ant design` for you to use, which comes with a selection of UI React components and style classes out of the box.

Read more [here](https://ant.design/).

Not comfortable with Ant design? Feel free to use native HTML elements or another component library, such as `material-ui` or `react-bootstrap`.

&nbsp;

### Routing

This challenge uses `react-router` for routing.

&nbsp;

### Socket IO

Read more [here](https://socket.io/). The examples on the home page should be enough for you to complete the challenge.

&nbsp;

## Back-end

### Configuration

This application uses typescript and jest. `tsconfig.json` has been pre-configured for the environment.

&nbsp;

### Socket IO

The HTTP server with socket.io are already connected. The socket server will automatically run by default on port 3001.

&nbsp;

### Hot Reload

The backend server supports hot reload using `nodemon`. Any changes you make to files will automatically be updated if the server is started with the `start:dev` command.
