'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2022-05-21T14:11:59.604Z',
    '2022-05-29T17:01:17.194Z',
    '2022-06-01T23:36:17.929Z',
    '2022-06-02T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div> 
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

///////////////////////////////////////////////// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const createUserNames = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    // When 0 seconds, stop timer adn log uot user

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrese 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 100;
  // Call the timer every seconds
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//Event handlers
let currentAccount, timer;
// Fake login

// currentAccount = account1;
// updateUI(account1);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //);

  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };
    //const locale =  navigator.language;
    const locale = currentAccount.locale;

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const reciverACC = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    reciverACC &&
    reciverACC.username !== currentAccount.username
  ) {
    //Doing transfer
    currentAccount.movements.push(-amount);
    reciverACC.movements.push(amount);

    // Add transfer date

    currentAccount.movementsDates.push(new Date().toISOString());
    reciverACC.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const pin = Number(inputClosePin.value);
  const deleteAcc = accounts.find(
    acc => acc.username === inputCloseUsername.value
  );

  // Clear fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
  if (
    deleteAcc &&
    pin &&
    deleteAcc.username === currentAccount.username &&
    pin === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account

    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;

    //Set default value
    labelWelcome.textContent = 'Log in to get started';
  }
});
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);

console.log(Number('23'));
console.log(+'23');

console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e30px', 10));

console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('2.5rem'));

console.log(Number.isNaN(23));
console.log(Number.isNaN('23'));
console.log(Number.isNaN(+'23x'));
console.log(Number.isNaN(23 / 0));

console.log(Number.isFinite(20));
console.log(Number.isFinite('30'));
console.log(Number.isFinite(+'23x'));
console.log(Number.isFinite(23 / 0));
*/
/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(4, 52, 4, 5, 3, 12));
console.log(Math.max(4, '52', 4, 5, 3, 12));
console.log(Math.max(4, '52px', 4, 5, 3, 12));

console.log(Math.min(4, 52, 4, 5, 3, 12));

console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

console.log(Math.trunc(23.3));

console.log(Math.round(23.4));
console.log(Math.round(23.9));

console.log(Math.ceil(23.4));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.4));
console.log(Math.floor(23.9));
console.log(Math.floor('23.9'));

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));
console.log(Math.ceil(-23.4));

console.log((2.7).toFixed(0));
*/
/*
console.log(5 % 2);

const isEven = n => n % 2 === 0;
console.log(isEven(4));
console.log(isEven(15));
console.log(isEven(6));
console.log(isEven(23));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/
/*
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;
const PI = 3.14_15;
console.log(PI);

console.log(Number('230_000'));
*/
/*
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(452367542736543465753462345243652535675437643745n);
console.log(BigInt(452367542736543465753462345243652535));

console.log(10000n + 10000n);
console.log(21435234764375254352435n * 1000000n);

const huge = 34252346562536235n;
const num = 23;
console.log(huge * BigInt(num));

console.log(20n > 15);
console.log(20n === 20);
console.log(20n == '20');

console.log(huge + ' is REALLY big!!!!');
*/
/*
// Create a date

const now = new Date();
console.log(now);

console.log(new Date('Jun 02 2022 12:26:49'));
console.log(new Date('December 24, 2018'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2022, 5, 4, 4, 15, 36));

console.log(new Date(0));

console.log(new Date(3 * 24 * 60 * 60 * 1000));
*/
/*
const future = new Date(2022, 5, 4, 4, 15);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());
console.log(new Date(1654308900000));

console.log(Date.now());

future.setFullYear(2030);
console.log(future);
*/
/*
const future = new Date(2022, 5, 4, 4, 15);

console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2022, 5, 4), new Date(2022, 5, 2));
console.log(days1);
*/
/*
const num = 4312342341.23;

const options = {
  style: 'currency',
  unit: 'kilometer-per-hour',
  currency: 'EUR',
  useGrouping: 'min2',
};

console.log('en-US', new Intl.NumberFormat('en-US', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/
/*
// setTimeout
const ingridients = ['salami', 'mozarella'];
const pizzaTimer = setTimeout(
  (ing1, ing2) =>
    console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}.`),
  3000,
  ...ingridients
);
console.log('Waiting...');

if (ingridients.includes('mozarella')) clearTimeout(pizzaTimer);

// setInterrval

setInterval(() => {
  const now = new Date();
  console.log(
    'H',
    now.getHours(),
    'Min',
    now.getMinutes(),
    'Sec',
    now.getSeconds()
  );
}, 1000);
*/
