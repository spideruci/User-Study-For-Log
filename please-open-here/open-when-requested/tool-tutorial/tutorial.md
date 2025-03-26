

### 🗂️ Intro to Logiverse

> “Let me walk you through how to use **Logiverse**, a VSCode extension that helps developers organize and contextualize their `console.log` outputs more effectively.”

---

### 🔁 Log Timeline View

> “When Logiverse first opens, it presents the log outputs in **temporal order**—the same sequence they appeared during program execution. You’ll see log messages printed by the server as the application runs.”

---

### 🌳 Function Tree (Top of the View)

> “At the top of the panel, you’ll see a tree view showing a simplified call graph of your program. But to reduce clutter, Logiverse only includes functions that actually contain console.log statements. This helps you focus only on the parts of the code that generated output.”

> “Each tree node represents a function that logged something during runtime. You can click on a node to expand it and inspect the logs or subsequent function calls inside.”

---

### ✋ Drag & Drop to Create Custom Views

> “You can **drag** any function or log statement to the **top of the list** to create a new list. This isolates all logs associated with that function or that specific log statement. It’s a quick way to focus on just one part of the code or isolate a specific execution path.”
![Demo](../../../figures/call-graph.gif)

---

### 🔖 Labels and Filtering

> “Each log message is tagged with a **label**, typically the function name and call index.  
Clicking on a label will **filter the logs** to show only those related to that specific function call.”

> “For example, if you want to focus on the first call to `anonymous_function_15`, the one that received `Order 001`, you can click on its label.  
Logiverse will then split out the logs for just that function call—making it much easier to follow what happened in that call from start to finish.”
![Demo](../../../figures/execution-label.gif)


Here's a self-contained **Markdown-formatted self-guided tutorial** for participants to get started with your prototype tool and explore logs generated from the `ad-hoc-async` project:

---

## 🧪 Self-Guided Tutorial: Exploring Logs with the Prototype Tool

Welcome! In this tutorial, you’ll set up and run a simulated server, send test requests, and use our prototype tool to explore and reason about the behavior captured in log output.

This guide will take approximately **10 minutes**.

---

## ✅ Step 1: Compile the Server Code

Open **Terminal 1**, navigate to the `please-open-here`, and run:

```bash
cd ./please-open-here
npx babel server.js --out-file ./dist/server.compiled.js
```

This compiles the modern JavaScript in `server.js` into a Node-compatible version.

---

## ✅ Step 2: Start the Server

Still in **Terminal 1**, start the compiled server:

```bash
node ./dist/server.compiled.js
```

You should see:

```
🍳 Overcooked Kitchen running at http://localhost:3000
```

The server is now ready to accept requests and print logs in the terminal.

---

## ✅ Step 3: Trigger Example Logs

Open **Terminal 2** and run:

```bash
node ./example.js
```

This script sends several test requests to the server, including:
- `GET /player/:id` – to fetch player profiles
- `POST /order` – to simulate food orders

These requests will generate logs that reflect asynchronous food preparation processes.

---

## ✅ Step 4: Explore the Logs in the Prototype Tool

Now open the prototype tool

Use it to:
- 📂 Group logs by request or function
- 🔍 Search for specific players or ingredients
- ⏱️ Identify which parts of the system run concurrently
- 🧠 Trace async logic like `preparePickle()`, `grillPatty()`, or `getPlayerProfile()`

Focus questions:
- Can you follow the full lifecycle of an order?
- Which logs relate to each other?
- How does asynchrony show up visually?
---

## 🎉 You're Ready!

You've now seen how logs are generated, organized, and explored in the prototype tool.

You're ready to begin the assigned tasks. If you’d like to re-run the example or modify code/logs, feel free to do so during the session.

---

🛠️ Need help? Let your facilitator know at any time.

---

