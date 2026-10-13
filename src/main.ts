// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

let effort: number = 10;
// deno-lint-ignore prefer-const
let maxEffort: number = 10;
// deno-lint-ignore prefer-const
let maxRecoveryTime = 15;
let recoveryTime = maxRecoveryTime;
// deno-lint-ignore prefer-const
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

const message = document.createElement("p");
message.textContent =
  `Effort: ${effort}/${maxEffort} | Money: ${money} | Level: ${level} | XP to Next Level: ${
    XpNeededForLevel(level + 1) - xp
  }`;

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

  constructor(label: string) {
    this.label = label;

    this.button = document.createElement("button");
    this.button.textContent = label;
  }

  /**
   * Sets this buttons active state to the input [isEnabled].
   */
  SetActive(isEnabled: boolean) {
    console.log(
      `[${this.label}]: isEnabled: ${isEnabled} (${typeof isEnabled})`,
    );
    this.button.disabled = !isEnabled;
  }
}

/**
 * **New**
 *
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
    console.log(`[${this.label}]: Clicked`);

    if (this.IsAffordable() == true && this.IsUnlocked() == true) {
      effort -= this.cost;
      money += this.pay;
      xp += this.xp;

      UpdateLevel();
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
const choreGroup: HTMLHeadingElement = document.createElement("h2");

choreList.push(new TaskClass("Do dishes", 1, 3, 1, 0));

choreList.push(new TaskClass("Take out trash", 2, 5, 1, 1));

choreList.push(new TaskClass("Do laundry", 2, 5, 2, 2));

choreList.push(new TaskClass("Clean room", 5, 10, 2, 3));

choreList.push(new TaskClass("Clean floors", 5, 10, 3, 4));

choreList.push(new TaskClass("Clean kitchen", 7, 25, 4, 5));

choreList.push(new TaskClass("Clean bathroom", 7, 25, 5, 6));

for (let i = 0; i < choreList.length; i++) {
  const chore = choreList[i];
  choreGroup.append(chore.button);
}

const upgradeList: DynamicButtonClass[] = [];
const upgradeGroup: HTMLHeadingElement = document.createElement("h2");

// upgradeList.push(
//   new DynamicButtonClass("Upgrade recovery amount", 0, 0, () => {
//     if (money >= 50) {
//       money -= 50;
//       console.log(
//         `[recoveryAmount]: Upgraded ${recoveryAmount} -> ${recoveryAmount + 2}`,
//       );
//       recoveryAmount += 2;
//     }
//   }),
// );

// upgradeList.push(
//   new DynamicButtonClass("Upgrade recovery speed", 0, 0, () => {
//     if (money >= 50) {
//       money -= 50;
//       console.log(
//         `[recoveryTime]: Upgraded ${maxRecoveryTime} -> ${maxRecoveryTime - 3}`,
//       );
//       maxRecoveryTime -= 3;
//     }
//   }),
// );

// upgradeList.push(
//   new DynamicButtonClass("Upgrade maximum effort", 0, 0, () => {
//     if (money >= 50) {
//       money -= 50;
//       console.log(
//         `[maxEffort]: Upgraded ${maxEffort} -> ${maxEffort - 3}`,
//       );
//       maxEffort += 2;
//     }
//   }),
// );

for (let i = 0; i < upgradeList.length; i++) {
  const upgrade = upgradeList[i];
  upgradeGroup.append(upgrade.button);
}

//A cheater button to give me more effort
const effortButton = document.createElement("button");
effortButton.textContent = "Get effort";
effortButton.addEventListener("click", () => {
  if (effort < maxEffort) {
    effort++;
  }
  console.log(`[Get effort]: Clicked`);
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

  recoveryTime--;
}

/**
 * Similar to Unity's update, this function is used in tandem with the setInterval() function to call all functions within it and update all dynamic objects everytime it is called.
 */
function Update() {
  if (effort >= maxEffort) {
    message.textContent =
      `Effort: ${effort}/${maxEffort} | Money: ${money} | Level: ${level} | XP to Next Level: ${
        XpNeededForLevel(level + 1) - xp
      }`;
  } else if (recoveryTime >= 0) {
    message.textContent =
      `Effort (${recoveryTime}): ${effort}/${maxEffort} | Money: ${money} | Level: ${level} | XP to Next Level: ${
        XpNeededForLevel(level + 1) - xp
      }`;
  }

  for (let i = 0; i < choreList.length; i++) {
    const chore = choreList[i];
    chore.CheckAvailable();
  }

  console.log(effort);
}
setInterval(Update, 250);
setInterval(RecoverEffort, (maxRecoveryTime < 1) ? 250 : 1000);

app.append(
  heading,
  image,
  message,
  effortButton,
  choreGroup,
  upgradeGroup,
);
