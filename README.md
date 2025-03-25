
# 🍳 Overcooked-Style Kitchen Server (For User Study)

Welcome! This fake Overcooked-style kitchen server is part of a **user study**.
This server simulates a multiplayer cooking game where players submit dish orders, and the system processes them with **intentional latency**, **parallel execution**, and **detailed logs**.

---

## 🎯 Study Instructions

Please follow the setup steps below. During the study, you will interact with the logs produced by this server using our VS Code extension.

> ⚠️ **Do not open or modify anything in the `please-do-not-open/` folder.**  
> This folder contains internal logic meant to remain hidden for the purpose of the study.

> ✅ **Only open `open-when-requested/` when you are instructed to do so.**  
> This folder contains your assigned tasks (e.g., `task1.md`, `task2.md`).

---

## 📁 Project Structure

```
please-open-here/
├── server.js              # Main server logic (you may view this)
├── example.js             # Sample client that sends a request to the server
├── postToServer.js        # Optional script to send custom requests
├── please-do-not-open/    # 🔒 Internal logic (DO NOT OPEN)
└── open-when-requested/   # ✅ Task instructions (open when asked)
    ├── task1.md
    └── task2.md
```

---

## 🛠 Setup Instructions

Please execute the following commands to install dependencies and compile the server.

### 1. Install dependencies and link plugin

```sh
npm install
npm link
```

### 2. Set up the client folder

```sh
cd ./please-open-here
npm install
npm link babel-plugin-lug
```

### 3. Compile necessary files

```sh
npx babel ./please-do-not-open/utils.js --out-file ./dist/please-do-not-open/utils.js
npx babel server.js --out-file ./dist/server.compiled.js
```

### 4. Start the server

```sh
node ./server.js
```

You should see:

```
🍳 Overcooked Kitchen running at http://localhost:3000
```

---

## ▶️ Try Submitting a Sample Order

In a **separate terminal**, run the example client:

```sh
cd ./please-open-here
node ./example.js
```

This will simulate a player placing an order like `burger` and `salad`. You will see a sequence of logs printed in the terminal representing each step of dish preparation.

---

## 📦 API Summary (Optional)

You are not required to interact directly with these endpoints, but here’s what they do for reference:

### `POST /order`

Submit an order with player ID and dish names.

### `GET /player/:id`

Fetches a player profile with avatar, name, level, and completed order count.

---

## ❓ Need Help?

If anything doesn’t work or you have questions during the session, please ask the study organizer.

Thanks for participating and helping us improve developer tools! 🙌

