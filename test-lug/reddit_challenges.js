import bcrypt from "bcrypt";

async function createPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 11).then(data => data);
    console.log('Logged: ', hashedPassword);
    return hashedPassword;
  } catch (err) {
    console.log(err);
  }
}

function main() {
    console.log('Returned: ', createPassword('hello'))
}

main();