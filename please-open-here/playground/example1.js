async function taskOne() {
    console.log("start task one");
    await taskTwo();
    console.log("end task one");
}

async function taskTwo() {
    console.log("start task two");
    await taskThree();
    console.log("finish task two");
}

async function taskThree() {
    console.log("start task three");
    await sleep(100);
    console.log("finish task three");
}

async function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

taskOne();