
let shareVal = 0;

async function taskOne() {
    console.log("start task one");
    await taskTwo();
    await taskThree();
    console.log("end task one");

}

async function taskTwo() {
    shareVal++;
    console.log(shareVal);
    await sleep(100);
}
async function taskThree() {
    shareVal++;
    console.log(shareVal);
    await sleep(100);
}

async function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

for (let i = 0; i < 5; i ++) {
    taskOne();
}
