// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import kitchenBackground from "./assets/kitchenbackground.png?no-inline";
// deno-lint-ignore no-unused-vars
import bathroomBackground from "./assets/bathroombackground.png?no-inline"; //TO-DO: IMPLEMENT BATHROOM CHORES VISUALLY
import dishwasher from "./assets/dishwasher.png?no-inline";
import washerDryer from "./assets/washerdryer.png?no-inline";
import lockedDishwasher from "./assets/lockeddishwasher.png?no-inline";
import lockedWasherDryer from "./assets/lockedwasherdryer.png?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;
// How many seconds should the game wait between updates?
const updateSpeed: number = 0.25; // seconds

let energy: number = 10;
let maxEnergy: number = 10;

let maxRecoveryTime = 15;
let recoveryTime = maxRecoveryTime;
let recoveryAmount = 2;

// deno-lint-ignore prefer-const
let base = 3; //Level lvl costs base * lvl; adjust accordingly.

let money: number = 0;

let xp: number = 0;
let level: number = 0;

const heading = document.createElement("h1");
heading.textContent = "Chore Clicker";

const kitchenBgImg = document.createElement("img");
kitchenBgImg.src = kitchenBackground;
kitchenBgImg.alt = "A kitchen background";
kitchenBgImg.className = "bg";

const bgContainer = document.createElement("div");
bgContainer.className = "kitchen-scene";
bgContainer.append(kitchenBgImg);

const hoverBox = document.createElement("div");
hoverBox.className = "hoverbox";
document.body.append(hoverBox);

/**
 * @param text to be shown on hover
 * @param event Mouse event used for cursor position
 * displays a message with mouse hover on interactables
 */
function ShowHoverBox(text: string, event: MouseEvent) {
  hoverBox.textContent = text;
  hoverBox.style.display = "block";
  hoverBox.style.left = `${event.clientX + 12}px`;
  hoverBox.style.top = `${event.clientY + 12}px`;
}

function HideHoverBox() {
  hoverBox.style.display = "none";
}

const playerUI = document.createElement("h4");
const moneyDisplay = document.createElement("p");
const energyDisplay = document.createElement("p");
const expDisplay = document.createElement("p");
const automationDisplay = document.createElement("p");
automationDisplay.className = "automation-display";

const statsPanel = document.createElement("div");
statsPanel.className = "stats";
statsPanel.append(moneyDisplay, energyDisplay, expDisplay);

playerUI.append(
  /*moneyDisplay, energyDisplay, expDisplay, */ automationDisplay,
); //old UI visual with cheats

//A cheater button to give me more energy
const energyButton = document.createElement("button");
energyButton.textContent = "Get energy";
energyButton.addEventListener("click", () => {
  if (energy < maxEnergy) {
    energy += 1000;
  }

  if (energy > maxEnergy) {
    energy = maxEnergy;
  }
  // console.log(`[Get energy]: Clicked`);
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

//playerUI.append(energyButton, moneyButton, xpButton); old ui
const cheatLabel = document.createElement("p");
cheatLabel.textContent = "Admin Cheats";
cheatLabel.className = "admin-cheats";
const cheatBar = document.createElement("div");
cheatBar.className = "cheats";
cheatBar.append(energyButton, moneyButton, xpButton);
statsPanel.append(cheatLabel, cheatBar);

/**
 * An object class for a button which can be enabled/disabled. [this.button] is a publicly accessible HTMLButtonElement object with an EventListener for "click" that calls the function inputed as [operation].
 * @param label The label for this button.
 * @param cost The amount of Energy it takes to press this button. If no cost, put 0.
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
 * @param cost The amount of Energy it takes to press this button. If no cost, put 0.
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
    return (energy >= this.cost);
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
      energy -= this.cost;
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
        } and ${Math.ceil(this.xp / 4)} XP`,
      );
    }

    money += Math.floor(this.pay);
    xp += Math.ceil(this.xp / 4);

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
 * @param cost The amount of Energy it takes to press this button. If no cost, put 0.
 * @param rewardFunc The function that should be run when this object is purchased.
 * @param options An optional parameter for further customizing the object. {priceScaling = 1.5, stock = -1, levelUnlocked = 1}. This is a
 * special parameter that functions similarly to **kwargs in Python. If you want to change any of these parameters, just add an object with
 * whichever key words you want defined inside like this:
 *
 *  @example new PurchasableClass("Example",420,choreList[69],{levelUnlocked: 42, priceScaling: 2.1})
 *
 * @optional options.priceScaling: An optional parameter to set how the price scales with each purchase. Default: 1.5
 * @optional options.stock: An optional parameter to set how many are available to purchase. The object will delete itself when this reaches
 * zero. Default: -1 for infinite.
 * @optional options.levelUnlocked: The player level required to unlock access to this button.
 *
 * **kwargs functionality from: https://www.peterbe.com/plog/javascript-destructuring-like-python-kwargs-with-defaults
 * Thanks Mr. Bengtsson!
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
    { priceScaling = 1.5, stock = -1, levelUnlocked = 1 } = {},
  ) {
    super(label);
    this.cost = cost;
    this.rewardFunc = rewardFunc;

    this.button.addEventListener("click", () => {
      this.Execute();
    });

    //  Other options
    this.amountAvailable = stock;
    this.priceScaling = priceScaling;
    this.levelUnlocked = levelUnlocked;
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
      this.button.remove();
      for (let i = 0; i < upgradeList.length; i++) {
        const upgrade = upgradeList[i];
        if (upgrade.label == this.label) {
          upgradeList.splice(i, 1);
          break;
        }
      }
    }

    return isAffordable;
  }

  Execute() {
    if (this.debugMode == true) console.log(`[${this.label}]: Clicked`);

    if (
      this.IsAffordable() == true && this.IsUnlocked() == true &&
      this.IsInStock() == true
    ) {
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
 * The class to handle all machine objects (objects that automate tasks).
 * @param machineName The name of this machine.
 * @param task The task that is being automated. Should be taken from the choreList list of tasks.
 * @param iterationTime How long it takes to run [task].
 *
 * The parameter [amount] was removed because it was kinda redundant given that I already had the Purchase() and Sell() methods.
 */
class MachineClass {
  debugMode: boolean = false;

  name: string;
  amount: number;
  task: TaskClass;
  currTimer: number;
  maxTimer: number;

  constructor(
    machineName: string,
    task: TaskClass,
    iterationTime: number,
  ) {
    this.name = machineName;
    this.amount = 0;
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
        this.task.AutoExecute();
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

  Upgrade(timerReduction: number, minTimer: number) {
    this.Purchase(1);
    this.maxTimer -= timerReduction;
    //Assign the higher of he 2 numbers if maxTimer is below minTimer
    this.maxTimer = Math.max(minTimer, this.maxTimer);

    if (this.currTimer > this.maxTimer) {
      this.currTimer = this.maxTimer;
    }
  }

  toString() {
    return (` ${this.name} (${this.amount}): + $${this.task.pay} and ${
      Math.ceil(this.task.xp / 4)
    } XP in ${Math.floor(this.currTimer)}/${this.maxTimer} seconds ($${
      this.task.pay * this.amount
    } & ${Math.ceil(this.task.xp / 4) * this.amount} XP per cycle)`);
  }
}

interface Interactable {
  IsHit(event: MouseEvent): boolean;
  GetHoverText(): string;
  OnClick(): void;
}

class ApplianceClass implements Interactable {
  lockedImg: HTMLImageElement;
  unlockedImg: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  purchasable: PurchasableClass;
  upgrade: PurchasableClass;
  name: string;
  isOwned: boolean = false;

  constructor(
    name: string,
    lockedSrc: string,
    unlockedSrc: string,
    purchasable: PurchasableClass,
    upgrade: PurchasableClass,
    container: HTMLElement,
  ) {
    this.purchasable = purchasable;
    this.upgrade = upgrade;
    this.name = name;

    this.lockedImg = document.createElement("img");
    this.lockedImg.src = lockedSrc;
    this.lockedImg.alt = `A blacked out image of a ${name}`;
    this.lockedImg.className = "appliance";

    this.unlockedImg = document.createElement("img");
    this.unlockedImg.src = unlockedSrc;
    this.unlockedImg.alt = `Image of a ${name}`;
    this.unlockedImg.className = "appliance";
    this.unlockedImg.style.display = "none";

    container.append(this.lockedImg, this.unlockedImg);

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    this.lockedImg.addEventListener("load", () => {
      this.canvas.width = this.lockedImg.naturalWidth;
      this.canvas.height = this.lockedImg.naturalHeight;
      this.ctx.drawImage(this.lockedImg, 0, 0);
    });
  }

  IsHit(event: MouseEvent): boolean {
    const img = this.isOwned ? this.unlockedImg : this.lockedImg;
    //Displayed coordinates will match image's natural coordinates
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    const x = Math.floor(event.offsetX * scaleX);
    const y = Math.floor(event.offsetY * scaleY);

    //prevent reading pixels outside of canvas
    if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
      return false;
    }

    //Read the pixel's transparency
    const alpha = this.ctx.getImageData(x, y, 1, 1).data[3];

    return alpha > 10;
  }

  Unlock() {
    this.lockedImg.style.display = "none";
    this.unlockedImg.style.display = "";
    this.isOwned = true;
    this.upgrade.button.style.display = "";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.unlockedImg, 0, 0);
  }

  OnClick(): void {
    if (this.isOwned) {
      this.upgrade.Execute();
    } else {
      this.purchasable.Execute();
    }
  }

  GetHoverText(): string {
    if (this.isOwned == true) {
      return `Upgrade ${this.name}: $${this.upgrade.cost}`;
    } else if (this.purchasable.IsUnlocked() == false) {
      return `Locked: requires level ${this.purchasable.levelUnlocked}`;
    } else {
      return `Buy ${this.name}: $${this.purchasable.cost}`;
    }
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
choreList.push(new TaskClass("Take out trash", 2, 7, 1, 1)); // 1
choreList.push(new TaskClass("Do laundry", 2, 8, 2, 2)); // 2
choreList.push(new TaskClass("Clean room", 5, 18, 2, 3)); // 3
choreList.push(new TaskClass("Clean floors", 5, 20, 3, 4)); // 4
choreList.push(new TaskClass("Clean kitchen", 7, 30, 4, 5)); // 5
choreList.push(new TaskClass("Clean bathroom", 7, 35, 5, 8)); // 8
choreList.push(new TaskClass("Clean windows", 10, 60, 6, 10)); // 10

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
  new PurchasableClass(
    "Buy Energy Bar (+7E)",
    10,
    () => {
      console.log(
        `[Energy Bar]: Purchased ${energy} -> ${energy + 7}`,
      );
      energy += 7;
    },
    { priceScaling: 2, levelUnlocked: 1 },
  ),
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
    { priceScaling: 2, stock: 2, levelUnlocked: 3 },
  ),
);

upgradeList.push(
  new PurchasableClass("Upgrade maximum energy", 50, () => {
    console.log(`[maxEnergy]: Upgraded ${maxEnergy} -> ${maxEnergy - 3}`);
    maxEnergy += 5;
  }, { levelUnlocked: 4 }),
);

upgradeList.push(
  new PurchasableClass("Upgrade recovery amount", 20, () => {
    console.log(
      `[recoveryAmount]: Upgraded ${recoveryAmount} -> ${recoveryAmount + 2}`,
    );
    recoveryAmount += 2;
  }, { priceScaling: 2, levelUnlocked: 5 }),
);

upgradeList.push(
  new PurchasableClass(
    "Upgrade recovery time+",
    650,
    () => {
      console.log(
        `[recoveryTime]: Upgraded ${maxRecoveryTime} -> ${maxRecoveryTime - 3}`,
      );
      maxRecoveryTime -= 3;
    },
    { priceScaling: 2, stock: 2, levelUnlocked: 10 },
  ),
);

for (let i = 0; i < upgradeList.length; i++) {
  const upgrade = upgradeList[i];
  upgradeGroup.append(upgrade.button);
}

// interface faktionary {
//   "Washing Machine": MachineClass;
//   "Mr. Handy": MachineClass;
//   "Dishwasher": MachineClass;
//   "House Keeper": MachineClass;
//   "Toilet Gel": MachineClass;
// }

const ownedMachines: MachineClass[] = [];

const machineList: PurchasableClass[] = [];
const machineGroup = document.createElement("h3");
const machineLabel = document.createElement("p");
machineLabel.textContent = "Automations: ";
machineGroup.append(machineLabel);

function BasicMachinePurchase(
  machineName: string,
  task: TaskClass,
  timer: number,
) {
  for (let i = 0; i < ownedMachines.length; i++) {
    const machine: MachineClass = ownedMachines[i];
    if (machine.name == machineName) {
      machine.Purchase(1);
      return;
    }
  }
  const machine: MachineClass = new MachineClass(machineName, task, timer);
  machine.Purchase(1);
  ownedMachines.push(machine);
}

function UpgradeMachine(
  machineName: string,
  timerReduction: number,
  minTimer: number,
) {
  for (let i = 0; i < ownedMachines.length; i++) {
    if (ownedMachines[i].name == machineName) {
      ownedMachines[i].Upgrade(timerReduction, minTimer);
      return;
    }
  }
}

const dishwasherPurchase = new PurchasableClass(
  "Buy Dishwasher", // Button label
  120, // Price
  () => {
    BasicMachinePurchase("Dishwasher", choreList[0], 7);
    //show dishwasher instead of blackout image
    dishwasherAppliance.Unlock();
  }, // RewardFunc
  { levelUnlocked: 8, stock: 1 },
);
machineList.push(dishwasherPurchase);

const dishwasherUpgrade = new PurchasableClass(
  "Upgrade Dishwasher",
  150,
  () => {
    UpgradeMachine("Dishwasher", 1, 1);
  },
  { priceScaling: 1.4 },
);
dishwasherUpgrade.button.style.display = "none";
machineList.push(dishwasherUpgrade);

const washingMachinePurchase = new PurchasableClass(
  "Buy Washing Machine", // Button label
  80, // Price
  () => {
    BasicMachinePurchase("Washing Machine", choreList[2], 10);
    washerAppliance.Unlock();
  }, // RewardFunc
  { levelUnlocked: 5, stock: 1 },
);
machineList.push(washingMachinePurchase);

const washingMachineUpgrade = new PurchasableClass(
  "Upgrade Washing Machine",
  100,
  () => {
    UpgradeMachine("Washing Machine", 1, 1);
  },
  { priceScaling: 1.2 },
);
washingMachineUpgrade.button.style.display = "none";
machineList.push(washingMachineUpgrade);

/*machineList.push(
  new PurchasableClass(
    "Buy Mr. Handy", // Button label
    300, // Price
    () => {
      BasicMachinePurchase("Mr. Handy", choreList[2], 10);
    }, // RewardFunc
    { levelUnlocked: 11 },
  ),
);*/

machineList.push(
  new PurchasableClass(
    "Hire House Keeper", // Button label
    60, // Price
    () => {
      BasicMachinePurchase("House Keeper", choreList[3], 10);
    }, // RewardFunc
    { priceScaling: 2.5, levelUnlocked: 9 },
  ),
);

machineList.push(
  new PurchasableClass(
    "Buy Toilet Gel", // Button label
    115, // Price
    () => {
      BasicMachinePurchase("Toilet Gel", choreList[6], 10);
    }, // RewardFunc
    { levelUnlocked: 15 },
  ),
);

for (let i = 0; i < machineList.length; i++) {
  const machine = machineList[i];
  machineGroup.append(machine.button);
}

//Create appliances and add to a list
const interactableList: Interactable[] = [];

const dishwasherAppliance = new ApplianceClass(
  "Dishwasher",
  lockedDishwasher,
  dishwasher,
  dishwasherPurchase,
  dishwasherUpgrade,
  bgContainer,
);
interactableList.push(dishwasherAppliance);

const washerAppliance = new ApplianceClass(
  "Washing Machine",
  lockedWasherDryer,
  washerDryer,
  washingMachinePurchase,
  washingMachineUpgrade,
  bgContainer,
);
interactableList.push(washerAppliance);

bgContainer.addEventListener("mousemove", (event: MouseEvent) => {
  let hovered: Interactable | null = null;
  for (let i = 0; i < interactableList.length; i++) {
    if (interactableList[i].IsHit(event) == true) {
      hovered = interactableList[i];
      break;
    }
  }
  if (hovered != null) {
    ShowHoverBox(hovered.GetHoverText(), event);
    bgContainer.style.cursor = "pointer";
  } else {
    HideHoverBox();
    bgContainer.style.cursor = "";
  }
});

bgContainer.addEventListener("mouseleave", () => {
  HideHoverBox();
  bgContainer.style.cursor = "";
});

bgContainer.addEventListener("click", (event: MouseEvent) => {
  for (let i = 0; i < interactableList.length; i++) {
    const item = interactableList[i];
    if (item.IsHit(event) == true) {
      item.OnClick();
      ShowHoverBox(item.GetHoverText(), event);
      break;
    }
  }
});

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
 * When [energy] is less than [maxEnergy], counts down on [recoveryTime]. When it reaches zero, it adds [recoveryAmount] back to the [energy] pool.
 */
function RecoverEnergy() {
  if (energy == maxEnergy) {
    return;
  }

  if (recoveryTime <= 0) {
    recoveryTime = maxRecoveryTime;
    const energyDif = maxEnergy - energy;
    console.log(
      `Recovering ${(energyDif < recoveryAmount) ? energyDif : recoveryAmount}`,
    );
    energy += (energyDif < recoveryAmount) ? energyDif : recoveryAmount;
    return;
  }

  recoveryTime -= updateSpeed;
}

function DisplayStats() {
  moneyDisplay.textContent = `Money: $${money}`;
  energyDisplay.textContent =
    `Energy: ${energy}/${maxEnergy} | Recovery: +${recoveryAmount}E in ${
      Math.floor(recoveryTime)
    }/${maxRecoveryTime} seconds`;
  expDisplay.textContent = `Level: ${level} | XP to Next Level: ${
    XpNeededForLevel(level + 1) - xp
  }`;
  automationDisplay.textContent = `Owned Automations: ${ownedMachines}`;
}

// To be called inside of Update(). Runs the executions for all automated tasks
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

  RecoverEnergy();

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

const sidebar = document.createElement("div");
sidebar.className = "sidebar";
sidebar.append(choreGroup, upgradeGroup, machineGroup);

app.append(
  heading,
  statsPanel,
  bgContainer,
  playerUI,
  sidebar,
);
