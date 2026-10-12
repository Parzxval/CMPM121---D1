// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

let effort: number = 10;
let maxEffort: number = 10;
let recoveryTime = -1;
let maxRecoveryTime = 15;
let recoveryAmount = 2;

let money: number = 0;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

const message = document.createElement("p");
message.textContent = `Effort: ${effort}/${maxEffort} | Money: ${money}`;

/**
 * An object class for a button which can be enabled/disabled. [this.button] is a publicly accessible HTMLButtonElement object with an EventListener for "click" that calls the function inputed as [operation].
 * @param label The label for this button.
 * @param cost The amount of Effort it takes to press this button. If no cost, put 0.
 * @param pay The amount of money this button pays.
 * @param operation The function that should be called when this button is pressed.
 */
class DynamicButtonClass {
  label: string;
  cost: number;
  pay: number;
  operation;

  public button;

  constructor(
    label: string,
    cost: number,
    pay: number,
    operation: { (): void },
  ) {
    this.label = label;
    this.cost = cost;
    this.pay = pay;
    this.operation = operation;

    this.button = document.createElement("button");
    this.button.textContent = `${cost} Effort: ${label}`;
    this.button.addEventListener("click", this.operation);
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

  /**
   * Checks if this button is available based on the effort cost. Will automatically disable itself if the player doesn't have enough effort and re-enables itself when the player does have enough.
   * @returns Returns the buttons new active state.
   */
  CheckAvailable(): boolean {
    if (this.button.disabled == false && effort < this.cost) {
      this.SetActive(false);
    } else if (this.button.disabled == true && effort >= this.cost) {
      this.SetActive(true);
    }

    return (this.button.disabled);
  }

  /**
   *  Removes the buttons old operation and changes it to [newOperation].
   * @param newOperation The new function for the button to call when pressed.
   */
  SetButtonOperation(newOperation: { (): void }) {
    this.button.removeEventListener("click", this.operation);
    this.operation = newOperation;
    this.button.addEventListener("click", this.operation);
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
const choreList: DynamicButtonClass[] = [];
const choreGroup: HTMLHeadingElement = document.createElement("h2");

choreList.push(
  new DynamicButtonClass("Do dishes", 1, 3, () => {
    effort -= 1;
    money += 3;
    console.log(`[Do dishes]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Take out trash", 2, 5, () => {
    effort -= 2;
    money += 5;
    console.log(`[Take out trash]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Do laundry", 3, 5, () => {
    effort -= 3;
    money += 5;
    console.log(`[Do Laundry]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Clean room", 5, 10, () => {
    effort -= 5;
    money += 10;
    console.log(`[Clean room]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Sweep/Mop floors", 5, 10, () => {
    effort -= 5;
    money += 10;
    console.log(`[Sweep/Mop floors]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Clean kitchen", 7, 25, () => {
    effort -= 7;
    money += 25;
    console.log(`[Clean kitchen]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Clean bathroom", 7, 25, () => {
    effort -= 7;
    money += 25;
    console.log(`[Clean bathroom]: Clicked`);
  }),
);

for (let i = 0; i < choreList.length; i++) {
  const chore = choreList[i];
  choreGroup.append(chore.button);
}

const upgradeList: DynamicButtonClass[] = [];
const upgradeGroup: HTMLHeadingElement = document.createElement("h2");

upgradeList.push(
  new DynamicButtonClass("Upgrade recovery amount", 0, 0, () => {
    if (money >= 50) {
      money -= 50;
      console.log(
        `[recoveryAmount]: Upgraded ${recoveryAmount} -> ${recoveryAmount + 2}`,
      );
      recoveryAmount += 2;
    }
  }),
);

upgradeList.push(
  new DynamicButtonClass("Upgrade recovery speed", 0, 0, () => {
    if (money >= 50) {
      money -= 50;
      console.log(
        `[recoveryTime]: Upgraded ${maxRecoveryTime} -> ${maxRecoveryTime - 3}`,
      );
      maxRecoveryTime -= 3;
    }
  }),
);

upgradeList.push(
  new DynamicButtonClass("Upgrade maximum effort", 0, 0, () => {
    if (money >= 50) {
      money -= 50;
      console.log(
        `[maxEffort]: Upgraded ${maxEffort} -> ${maxEffort - 3}`,
      );
      maxEffort += 2;
    }
  }),
);

for (let i = 0; i < upgradeList.length; i++) {
  const upgrade = upgradeList[i];
  upgradeGroup.append(upgrade.button);
}

//A cheater button to give me more effort
const effortButton = new DynamicButtonClass("Get effort", 0, 0, () => {
  if (effort < maxEffort) {
    effort++;
  }
  console.log(`[Get effort]: Clicked`);
});

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
    message.textContent = `Effort: ${effort}/${maxEffort} | Money: ${money}`;
  } else if (recoveryTime >= 0) {
    message.textContent =
      `Effort (${recoveryTime}): ${effort}/${maxEffort} | Money: ${money}`;
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
  effortButton.button,
  choreGroup,
  upgradeGroup,
);
