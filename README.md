
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
├── do-not-modify.js       # Script to send custom requests
├── server-backup.js       # Backup script for you to start the second task
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

--- 

## Appendix 

## 🧩 High-Level Flow (Call Stack + Async)

When an order is placed, the async function chain looks like this:

```
[async POST handler]
   └── prepareOrder(orderId, player, dishes)
         └── Promise.all(dishes.map(...))
               └── prepareDish(dish, orderId)
                     └── recipes[dish](orderId)
                           └── (prepareBurger OR prepareSalad)
```

All major operations inside `prepareOrder`, `prepareDish`, and the recipe functions (`prepareBurger`, etc.) are asynchronous — many of them simulate latency with `await sleep(...)`.

---

## 🧵 **Async Function Chain Details**

### 1. `prepareOrder(orderId, player, dishes)`
- Starts parallel preparation of all dishes via `Promise.all(...)`.
- Each dish kicks off a **separate async execution path**.
- Does **not** block per dish — waits for all dishes to complete.

```js
await Promise.all(dishes.map(dish => prepareDish(dish, orderId)));
```

---

### 2. `prepareDish(dish, orderId)`
- Looks up the recipe in the `recipes` map.
- Calls the corresponding async recipe function (`prepareBurger`, `prepareSalad`, etc.).
- If dish is unknown, throws an error — bubbling up to the parent try/catch.

```js
await recipes[dish](orderId);
```

---

### 3. `prepareBurger(orderId)`
- Starts **three tasks in parallel**:
  - `heatUpBread()`
  - `grillPatty()`
  - `preparePickle(orderId)`

```js
await Promise.all([
    heatUpBread(),
    grillPatty(),
    preparePickle(orderId)
]);
```

Each of these:
- Is an `async function`.
- Uses `await sleep(...)` to simulate time spent.

#### Inside `preparePickle(orderId)`
- Calls external `getPickleCountFor` (presumably async).
- Loops `count` times:
  - In each iteration, logs a message and `await sleep(...)`.

This creates a **serial async loop** — each pickle is prepared one after another.

---

### 4. `prepareSalad(orderId)`
- Executes two steps **in sequence**:
  - `await washVeggies()`
  - `await cutVeggies()`

Each step has:
- A log before and after.
- A random delay via `await sleep(...)`.

---

## ⏱️ Simulated Latency & Execution Order

- `sleep(...)` makes nearly every function involve some artificial delay.
- **`Promise.all` introduces parallelism**, especially at the dish level and in burger components.
- Logs are interleaved at runtime depending on random sleep durations.

---

## 🔄 Example Call Stack (with async context)

Suppose player 1 places an order with `['burger', 'salad']`.

Here’s a simplified async trace:

```
-> prepareOrder("001", 1, ["burger", "salad"])
    -> Promise.all([...])
        ├── prepareDish("burger", "001")
        │     -> prepareBurger("001")
        │         -> Promise.all([...])
        │             ├── heatUpBread()      -- sleep()
        │             ├── grillPatty()       -- sleep(20)
        │             └── preparePickle()    -- getPickleCountFor(), then sleep() per pickle
        └── prepareDish("salad", "001")
              -> prepareSalad("001")
                  -> washVeggies()  -- sleep()
                  -> cutVeggies()   -- sleep()
```

### 🧵 Concurrency:
- Burger and Salad prep happen **in parallel**.
- Inside Burger, bread/patty/pickles are **also in parallel**.
- Pickles, however, are made **sequentially**.

---

### Potential Outputs
Time  | prepareOrder           | prepareBurger        | heatUpBread         | grillPatty          | preparePickle        | prepareSalad         | washVeggies          | cutVeggies
------|------------------------|----------------------|---------------------|---------------------|----------------------|----------------------|----------------------|--------------------
  0ms | Player 1 started...    | Start preparing...   | Start Heat Up...    | Start Grill...      | Prepare Pickle 1...  | Start preparing...   | Start Wash...        |
 30ms |                        |                      | Finish Heat Up...   | Finish Grill...     | Prepare Pickle 2...  |                      | Finish Wash...       | Start Cut...
 60ms |                        |                      |                     |                     | Prepare Pickle 3...  |                      |                      | Finish Cut...
 90ms | [ORDER 001] complete!  | Finish preparing...  |                     |                     | Done with all...     | Finish preparing...  |                      |


### All Logs Outputs

Time  | Function               | Console Output
------|------------------------|---------------------------------------------------------
  0ms | prepareOrder           | Player 1 started Order 001 with burger and salad
  0ms | prepareBurger          | Start preparing Burger
  0ms | heatUpBread            | Start Heat Up Bread
  0ms | grillPatty             | Start Grill Patty
  0ms | preparePickle          | Prepare Pickle 1 for Burger
  0ms | prepareSalad           | Start preparing Salad
  0ms | washVeggies            | Start Wash Veggies
 30ms | heatUpBread            | Finish Heat Up Bread
 30ms | grillPatty             | Finish Grill Patty
 30ms | washVeggies            | Finish Wash Veggies
 30ms | cutVeggies             | Start Cut Veggies
 30ms | preparePickle          | Prepare Pickle 2 for Burger
 60ms | cutVeggies             | Finish Cut Veggies
 60ms | preparePickle          | Prepare Pickle 3 for Burger
 90ms | prepareSalad           | Finish preparing Salad
 90ms | preparePickle          | Done with all pickles
 90ms | prepareBurger          | Finish preparing Burger
 90ms | prepareOrder           | [ORDER 001] Order (from Player 1) is complete!