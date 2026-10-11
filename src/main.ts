// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

let effort: number = 10;
// deno-lint-ignore prefer-const
let maxEffort: number = 10;
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

const choreList: DynamicButtonClass[] = [];

choreList.push(
  new DynamicButtonClass("Do dishes", 1, 3, () => {
    if (effort >= 1) {
      effort -= 1;
      money += 3;
    }
    console.log(`[Do dishes]: Clicked`);
  }),
);

choreList.push(
  new DynamicButtonClass("Clean room", 5, 10, () => {
    if (effort >= 5) {
      effort -= 5;
      money += 10;
    }
    console.log(`[Clean room]: Clicked`);
  }),
);

//A cheater button to give me more effort
const effortButton = new DynamicButtonClass("Get effort", 0, 0, () => {
  if (effort < maxEffort) {
    effort++;
  }
  console.log(`[Get effort]: Clicked`);
});

// document.createElement("button");
// effortButton.textContent = "Get effort";
// effortButton.addEventListener("click", );

/**
 * Similar to Unity's update, this function is used in tandem with the setInterval() function to call all functions within it and update all dynamic objects everytime it is called.
 */
function Update() {
  message.textContent = `Effort: ${effort}/${maxEffort} | Money: ${money}`;

  for (let i = 0; i < choreList.length; i++) {
    const chore = choreList[i];
    chore.CheckAvailable();
  }
}
setInterval(Update, 250);

app.append(heading, image, message, effortButton.button);
for (let i = 0; i < choreList.length; i++) {
  const chore = choreList[i];
  app.append(chore.button);
}
