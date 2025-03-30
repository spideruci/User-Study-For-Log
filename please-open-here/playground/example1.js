async function first() {
    console.log("start first function");
    await first();
    console.log("end first function");
}

async function second() {
    console.log("start second function");
    await third();
    console.log("finish second function");
}

async function third() {
    console.log("start third function");
    await sleep(100);
    console.log("finish third function");
}

async function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

first();