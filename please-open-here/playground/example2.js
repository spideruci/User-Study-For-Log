
let shareVal = 0;

async function firstFuncWithLog() {
    console.log("start first function");
    await secondFunc();
    console.log("end first function");

}

async function secondFunc() {
    await thirdFuncWithLog();
}

async function thirdFuncWithLog() {
    console.log("start third function");
    await sleep(100);
    console.log("end third function");
}

async function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

for (let i = 0; i < 5; i ++) {
    firstFuncWithLog();
}
