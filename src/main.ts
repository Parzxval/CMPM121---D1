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

class ChoreClass {
  name: string;
  cost: number;
  pay: number;
  public button;

  constructor(name: string, cost: number, pay: number) {
    this.name = name;
    this.cost = cost;
    this.pay = pay;

    this.button = document.createElement("button");
    this.button.textContent = name;
    this.button.addEventListener("click", () => {
      if (effort >= this.cost) {
        effort -= this.cost;
        money += this.pay;
      }
      console.log("Clicked");
    });
  }

  ToggleActive(isEnabled: boolean) {
    console.log(`isEnabled: ${isEnabled} (${typeof isEnabled})`);
    this.button.disabled = !isEnabled;
  }
}

const choreList: ChoreClass[] = [];

// const button = document.createElement("button");
// button.textContent = "1 Effort: Do dishes";
choreList.push(new ChoreClass("1 Effort: Do dishes", 1, 3));

const effortButton = document.createElement("button");
effortButton.textContent = "Get effort";
effortButton.addEventListener("click", () => {
  if (effort < maxEffort) {
    effort++;
  }
});

function Update() {
  message.textContent = `Effort: ${effort}/${maxEffort} | Money: ${money}`;

  for (let i = 0; i < choreList.length; i++) {
    const chore = choreList[i];
    if (chore.button.disabled == false && effort < chore.cost) {
      chore.ToggleActive(false);
    } else if (chore.button.disabled == true && effort >= chore.cost) {
      chore.ToggleActive(true);
    }
  }
}

app.append(heading, image, message, effortButton);
for (let i = 0; i < choreList.length; i++) {
  const chore = choreList[i];
  app.append(chore.button);
}

setInterval(Update, 500);
