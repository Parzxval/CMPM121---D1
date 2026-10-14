// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;
// How many seconds should the game wait between updates?
const updateSpeed: number = 0.25; // seconds

let effort: number = 10;
let maxEffort: number = 10;

let maxRecoveryTime = 15;
let recoveryTime = maxRecoveryTime;
let recoveryAmount = 2;

// deno-lint-ignore prefer-const
let base = 3; //Level lvl costs base * lvl; adjust accordingly.

let money: number = 0;

let xp: number = 0;
let level: number = 0;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

const playerUI = document.createElement("h4");
const moneyDisplay = document.createElement("p");
const effortDisplay = document.createElement("p");
const expDisplay = document.createElement("p");
const automationDisplay = document.createElement("p");
playerUI.append(moneyDisplay, effortDisplay, expDisplay, automationDisplay);

//A cheater button to give me more effort
const effortButton = document.createElement("button");
effortButton.textContent = "Get effort";
effortButton.addEventListener("click", () => {
  if (effort < maxEffort) {
    effort++;
  }
  // console.log(`[Get effort]: Clicked`);
});

const moneyButton = document.createElement("button");
moneyButton.textContent = "Get money";
moneyButton.addEventListener("click", () => {
  money += 1000;
  // console.log(`[Get money]: Clicked`);
});

const xpButton = document.createElement("button");
xpButton.textContent = "Get XP";
xpButton.addEventListener("click", () => {
  xp += 1000;
  UpdateLevel();
  // console.log(`[Get XP]: Clicked`);
});

playerUI.append(effortButton, moneyButton, xpButton);

/**
 * An object class for a button which can be enabled/disabled. [this.button] is a publicly accessible HTMLButtonElement object with an EventListener for "click" that calls the function inputed as [operation].
 * @param label The label for this button.
 * @param cost The amount of Effort it takes to press this button. If no cost, put 0.
 * @param pay The amount of money this button pays.
 *
 * The [operation], [cost], and [pay] attributes were moved to the new TaskClass and PurchasableClass.
 * Method SetButtonOperation() was deprecated.
 */
class DynamicButtonClass {
  label: string;
  public button;

  debugMode: boolean = false;

  constructor(label: string) {
    this.label = label;

    this.button = document.createElement("button");
    this.button.textContent = label;
  }

  /**
   * Sets this buttons active state to the input [isEnabled].
   */
  SetActive(isEnabled: boolean) {
    if (this.debugMode == true) {
      console.log(
        `[${this.label}]: isEnabled: ${isEnabled} (${typeof isEnabled})`,
      );
    }
    this.button.disabled = !isEnabled;
  }

  toString() {
    return (this.label);
  }
}

/**
 * A class for all of the tasks that automatically applies the event listener.
 * @param label The label for this button.
 * @param cost The amount of Effort it takes to press this button. If no cost, put 0.
 * @param pay The amount of money this button pays.
 * @param xp The amount of xp this action gives.
 * @param levelUnlocked The minimum level needed to unlock this task.
 */
class TaskClass extends DynamicButtonClass {
  cost: number;
  pay: number;
  xp: number;
  levelUnlocked: number;

  constructor(
    label: string,
    taskCost: number,
    taskPay: number,
    taskXP: number,
    taskLevel: number,
  ) {
    super(label);
    this.cost = taskCost;
    this.pay = taskPay;
    this.xp = taskXP;
    this.levelUnlocked = taskLevel;

    this.button.addEventListener("click", () => {
      this.Execute();
    });
    this.button.textContent = `${this.label} (${this.cost}E -> $${this.pay})`;
  }

  IsAffordable(): boolean {
    return (effort >= this.cost);
  }

  IsUnlocked(): boolean {
    return (level >= this.levelUnlocked);
  }

  /**
   * Checks if this button is available.
   * Will automatically disable itself, if the checker returns false; and re-enable itself,
   * if it returns true.
   * @returns The buttons new active state.
   */
  CheckAvailable(): boolean {
    const isAffordable: boolean = this.IsAffordable();
    const isUnlocked: boolean = this.IsUnlocked();

    if (
      this.button.disabled == true && isAffordable == true && isUnlocked == true
    ) {
      this.SetActive(true);
    } else if (
      this.button.disabled == false &&
      (isAffordable == false || isUnlocked == false)
    ) {
      this.SetActive(false);
    }
    /* I could just have:
     *    this.setActive(isAffordable);
     * but I wanted it to only run if there is a change instead of every update.
     */
    return isAffordable;
  }

  Execute() {
    if (this.debugMode == true) console.log(`[${this.label}]: Clicked`);

    if (this.IsAffordable() == true && this.IsUnlocked() == true) {
      effort -= this.cost;
      money += this.pay;
      xp += this.xp;

      UpdateLevel();
    }
  }

  AutoExecute() {
    if (this.debugMode == true) {
      console.log(
        `${this.label} is being run automatically. Rewarding $${
          Math.floor(this.pay)
        } and ${Math.floor(this.xp)} XP`,
      );
    }

    money += Math.floor(this.pay);
    xp += Math.floor(this.xp);

    UpdateLevel();
  }

  Update() {
    this.CheckAvailable();

    if (this.IsUnlocked() == false) {
      this.button.textContent = `Locked: Lvl ${this.levelUnlocked}`;
    } else {
      this.button.textContent = `${this.label} (${this.cost}E -> $${this.pay})`;
    }
  }
}

/**
 * A class for all of the purchasables (upgrades and items) that automatically applies the event listener, tracks availability,
 * and scales cost.
 * @param label The label for this button.
 * @param cost The amount of Effort it takes to press this button. If no cost, put 0.
 * @param rewardFunc The function that should be run when this object is purchased.
 * @param priceScaling An optional parameter to set how the price scales with each purchase. Default: 1.5
 * @param amountAvailable An optional parameter to set how many are available to purchase. Will delete when it reaches zero.
 * Default: -1 which stands for infinite.
 */
class PurchasableClass extends DynamicButtonClass {
  cost: number;
  rewardFunc: { (): void };
  amountAvailable: number;
  priceScaling: number;
  levelUnlocked: number;

  constructor(
    label: string,
    cost: number,
    rewardFunc: { (): void },
    priceScaling: number = 1.5,
    amountAvailable: number = -1,
    levelUnlocked: number = 1,
  ) {
    super(label);
    this.cost = cost;
    this.rewardFunc = rewardFunc;
    this.amountAvailable = amountAvailable;
    this.priceScaling = priceScaling;
    this.levelUnlocked = levelUnlocked;

    this.button.addEventListener("click", () => {
      this.Execute();
    });
  }

  IsAffordable(): boolean {
    return (money >= this.cost);
  }

  IsUnlocked(): boolean {
    return (level >= this.levelUnlocked);
  }

  IsInStock() {
    return (this.amountAvailable != 0);
  }

  /**
   * Not only checks if the player has enough money to buy it, but also checks if there is available stock.
   * Will automatically disavble the button if there isn't enough money and delete the button if there is no
   * more left in stock.
   */
  CheckAvailable(): boolean {
    const isAffordable: boolean = this.IsAffordable();
    const isUnlocked: boolean = this.IsUnlocked();
    const isInStock: boolean = this.IsInStock();

    if (
      this.button.disabled == true && isAffordable == true &&
      isUnlocked == true && isInStock == true
    ) {
      this.SetActive(true);
    } else if (
      this.button.disabled == false &&
      (isAffordable == false || isUnlocked == false || isInStock == false)
    ) {
      this.SetActive(false);
    }
    /* I could just have:
     *    this.setActive(isAffordable);
     * but I wanted it to only run if there is a change instead of every update.
     */

    if (this.amountAvailable == 0) {
      for (let i = 0; i < upgradeList.length; i++) {
        const upgrade = upgradeList[i];
        if (upgrade.label == this.label) {
          upgradeList.splice(i, 1);
          upgradeGroup.removeChild(this.button);
          break;
        }
      }
    }

    return isAffordable;
  }

  Execute() {
    if (this.debugMode == true) console.log(`[${this.label}]: Clicked`);

    if (this.IsAffordable() == true && this.IsUnlocked() == true) {
      money -= this.cost;
      this.rewardFunc();
      if (this.amountAvailable > 0) this.amountAvailable -= 1;
      this.cost = Math.floor(this.cost * this.priceScaling);
    }
  }

  // Called by the global Update() to update button text and availablility
  Update() {
    this.CheckAvailable();
    if (this.IsUnlocked() == false) {
      this.button.textContent = `Locked: Lvl ${this.levelUnlocked}`;
    } else {
      this.button.textContent = `$${this.cost}: ${this.label}`;
    }
  }
}
/**
 * machineName,amount,task,iterationTime
 */
class MachineClass {
  debugMode: boolean = false;

  name: string;
  amount: number;
  task: { (): void };
  currTimer: number;
  maxTimer: number;

  constructor(
    machineName: string,
    amount: number,
    task: { (): void },
    iterationTime: number,
  ) {
    this.name = machineName;
    this.amount = amount;
    this.task = task;
    this.maxTimer = iterationTime;
    this.currTimer = this.maxTimer;
  }

  Execute() {
    if (this.debugMode == true) {
      console.log(
        `[${this.name} (${this.amount})]: Timer ${this.currTimer}/${this.maxTimer}`,
      );
    }
    if (this.currTimer <= 0) {
      if (this.debugMode == true) {
        console.log(
          `[${this.name} (${this.amount})]: Running task ${this.amount} times`,
        );
      }
      for (let i = this.amount; i > 0; i--) {
        if (this.debugMode == true) {
          console.log(`[${this.name} (${this.amount})]: Task ${i}`);
        }
        this.task();
      }

      this.currTimer = this.maxTimer;
    } else {
      this.currTimer -= updateSpeed;
    }
  }

  Purchase(amountToBuy: number) {
    this.amount += amountToBuy;
  }

  Sell(amountToSell: number) {
    this.amount -= amountToSell;
    if (this.amount < 0) this.amount = 0;
    money += 30;
  }

  toString() {
    return (` ${this.name} (${this.amount}) in ${
      Math.floor(this.currTimer)
    }/${this.maxTimer} seconds`);
  }
}

/** Chore List:
 * Do dishes,
 * Clean room,
 * Do laundry,
 * Clean kitchen,
 * Sweep/mop floors,
 * Clean bathroom,
 * Take out trash,
 */
const choreList: TaskClass[] = [];
const choreGroup: HTMLHeadingElement = document.createElement("h3");
const choreLabel = document.createElement("p");
choreLabel.textContent = "Chores: ";
choreGroup.append(choreLabel);

choreList.push(new TaskClass("Do dishes", 1, 3, 1, 0)); // 0
choreList.push(new TaskClass("Take out trash", 2, 5, 1, 1)); // 1
choreList.push(new TaskClass("Do laundry", 2, 5, 2, 2)); // 2
choreList.push(new TaskClass("Clean room", 5, 10, 2, 3)); // 3
choreList.push(new TaskClass("Clean floors", 5, 10, 3, 4)); // 4
choreList.push(new TaskClass("Clean kitchen", 7, 25, 4, 5)); // 5
choreList.push(new TaskClass("Clean bathroom", 7, 25, 5, 6)); // 6

for (let i = 0; i < choreList.length; i++) {
  const chore = choreList[i];
  choreGroup.append(chore.button);
}

const upgradeList: PurchasableClass[] = [];
const upgradeGroup: HTMLHeadingElement = document.createElement("h3");
const upgradeLabel = document.createElement("p");
upgradeLabel.textContent = "Upgrades: ";
upgradeGroup.append(upgradeLabel);

upgradeList.push(
  new PurchasableClass("Upgrade recovery amount", 20, () => {
    console.log(
      `[recoveryAmount]: Upgraded ${recoveryAmount} -> ${recoveryAmount + 2}`,
    );
    recoveryAmount += 2;
  }, 2),
);

upgradeList.push(
  new PurchasableClass(
    "Upgrade recovery time",
    30,
    () => {
      console.log(
        `[recoveryTime]: Upgraded ${maxRecoveryTime} -> ${maxRecoveryTime - 3}`,
      );
      maxRecoveryTime -= 3;
    },
    2,
    4,
  ),
);

upgradeList.push(
  new PurchasableClass("Upgrade maximum effort", 50, () => {
    console.log(`[maxEffort]: Upgraded ${maxEffort} -> ${maxEffort - 3}`);
    maxEffort += 5;
  }),
);

for (let i = 0; i < upgradeList.length; i++) {
  const upgrade = upgradeList[i];
  upgradeGroup.append(upgrade.button);
}

// interface faktionary {
//   "Roomba": MachineClass;
//   "Mr. Handy": MachineClass;
//   "Dishwasher": MachineClass;
//   "House Keeper": MachineClass;
//   "Toilet Gel": MachineClass;
// }

const ownedMachines: MachineClass[] = [];

const machineList: PurchasableClass[] = [];
const machineGroup = document.createElement("h3");

function BasicMachinePurchase(
  machineName: string,
  amount: number,
  task: { (): void },
  timer: number,
) {
  for (let i = 0; i < ownedMachines.length; i++) {
    const machine: MachineClass = ownedMachines[i];
    if (machine.name == machineName) {
      machine.Purchase(1);
      return;
    }
  }

  ownedMachines.push(new MachineClass(machineName, amount, task, timer));
}

machineList.push(
  new PurchasableClass(
    "Buy Roomba", // Button label
    80, // Price
    () => {
      BasicMachinePurchase("Roomba", 1, () => {
        choreList[4].AutoExecute();
      }, 10);
    }, // RewardFunc
    1.5, // Price Scale
    -1, // Amount
    8, // UnlockLvl
  ),
);

machineList.push(
  new PurchasableClass(
    "Buy Mr. Handy", // Button label
    300, // Price
    () => {
      BasicMachinePurchase("Mr. Handy", 1, () => {
        choreList[2].AutoExecute();
      }, 10);
    }, // RewardFunc
    1.5, // Price Scale
    -1, // Amount
    11, // UnlockLvl
  ),
);

machineList.push(
  new PurchasableClass(
    "Buy Dishwasher", // Button label
    80, // Price
    () => {
      BasicMachinePurchase("Dishwasher", 1, () => {
        choreList[0].AutoExecute();
      }, 7);
    }, // RewardFunc
    1.5, // Price Scale
    -1, // Amount
    6, // UnlockLvl
  ),
);

machineList.push(
  new PurchasableClass(
    "Hire House Keeper", // Button label
    60, // Price
    () => {
      BasicMachinePurchase("House Keeper", 1, () => {
        choreList[3].AutoExecute();
      }, 10);
    }, // RewardFunc
    2.5, // Price Scale
    -1, // Amount
    9, // UnlockLvl
  ),
);

machineList.push(
  new PurchasableClass(
    "Buy Toilet Gel", // Button label
    115, // Price
    () => {
      BasicMachinePurchase("Toilet Gel", 1, () => {
        choreList[6].AutoExecute();
      }, 10);
    }, // RewardFunc
    1.5, // Price Scale
    -1, // Amount
    14, // UnlockLvl
  ),
);

for (let i = 0; i < machineList.length; i++) {
  const machine = machineList[i];
  machineGroup.append(machine.button);
}

/**
 * Checks xp against xpToLevel() helper function; if xp is greater than or equal to, adds a level and logs level update.
 */
function UpdateLevel() {
  while (xp >= XpNeededForLevel(level + 1)) {
    level++;
    console.log(`Level-up to level ${level} with ${xp} total xp`);
  }
}

/**
 * Calculates and returns the number of XP needed for a given level; base xp can be altered to change the xp requirement for the first level.
 */
function XpNeededForLevel(lvl: number): number {
  const xpNeeded = base * lvl * (lvl + 1) / 2;
  return xpNeeded;
}

/**
 * When [effort] is less than [maxEffort], counts down on [recoveryTime]. When it reaches zero, it adds [recoveryAmount] back to the [effort] pool.
 */
function RecoverEffort() {
  if (effort == maxEffort) {
    return;
  }

  if (recoveryTime <= 0) {
    recoveryTime = maxRecoveryTime;
    const effortDif = maxEffort - effort;
    console.log(
      `Recovering ${(effortDif < recoveryAmount) ? effortDif : recoveryAmount}`,
    );
    effort += (effortDif < recoveryAmount) ? effortDif : recoveryAmount;
    return;
  }

  recoveryTime -= updateSpeed;
}

function DisplayStats() {
  moneyDisplay.textContent = `Money: $${money}`;
  effortDisplay.textContent =
    `Effort: ${effort}/${maxEffort} | Recovery: +${recoveryAmount} in ${
      Math.floor(recoveryTime)
    }/${maxRecoveryTime} seconds`;
  expDisplay.textContent = `Level: ${level} | XP to Next Level: ${
    XpNeededForLevel(level + 1) - xp
  }`;
  automationDisplay.textContent = `Automations: ${ownedMachines}`;
}

function Automate() {
  for (let i = 0; i < ownedMachines.length; i++) {
    const machine: MachineClass = ownedMachines[i];
    machine.Execute();
  }
}

/**
 * Similar to Unity's update, this function is used in tandem with the setInterval() function to call all functions within it and update all dynamic objects everytime it is called.
 */
function Update() {
  DisplayStats();

  RecoverEffort();

  Automate();

  for (let i = 0; i < choreList.length; i++) {
    const chore = choreList[i];
    chore.Update();
  }

  for (let i = 0; i < upgradeList.length; i++) {
    const upgrade = upgradeList[i];
    upgrade.Update();
  }

  for (let i = 0; i < machineList.length; i++) {
    const machine = machineList[i];
    machine.Update();
  }
}
Update();
setInterval(Update, updateSpeed * 1000);

app.append(
  heading,
  image,
  playerUI,
  choreGroup,
  upgradeGroup,
  machineGroup,
);
