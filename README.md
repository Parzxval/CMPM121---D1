# Contributors

Kajol Prasad and Serena Heath!

## D1 starter

A minimal TypeScript/Vite browser project with Deno checks and GitHub Pages deployment.

## Project Handoff

Deployed playable Github link: https://parzxval.github.io/CMPM121---D1/

## Build and Run Instructions

- Requirement: Deno installed.
- Install git hooks: `deno task setup`
- Open Vite on port 3000 automatically on browser: `deno task dev`
- Production build: `deno task build`
- All checks: `deno task ci`
- Deployment handled by Github actions after push to main

## How to Play

Goal: complete chores and buy upgrades with money.

Interactions:

- Chores: Each chore costs effort and returns money and XP. XP progresses player level, and some chores unlock at higher levels.
- Effort: The cost to do chores; regenerates over time
- Levels: Raised by gaining XP, and helps unlock different chores and purchases
- Upgrades: Improve recovery and maximum effort
- Automations: Machines and upgrades that perform chores on a timer
- Appliances: Interactable machines that can be bought then upgraded for extra units and a faster timer

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da), which has no explicit repository license. No new license is assigned to that material. The D1 scaffold and original SVG were authored with OpenAI GPT-6 Astra assistance. Dependencies retain their respective licenses.

## Useful Links

- [Project Repo](https://github.com/Parzxval/CMPM121---D1)
- [Assignment Page](https://docs.google.com/document/d/1RdQ4yCqg6Jmkc7TH2W8KlLn9rBnvKmO35uvmbcDTOEc/edit?tab=t.0#heading=h.z27emflh20wz)
- [Assignment Spreadsheet](https://docs.google.com/spreadsheets/d/13rC6H1Tyt8QaLfrW946tXaowraPK9OYNvriRu53NgvA/edit?gid=106#gid=106)
- [Lectures](https://drive.google.com/drive/folders/1624F_OwJeTv9GGrUJ9kJiYKiUAqJ1gDK?usp=drive_link)
- [Mozilla Docs (MDN)](https://developer.mozilla.org/en-US/)

## Ideas

- Chore Clicker: Do different chores with effort as a currency. Buy home improvements and upgrades with rewards.
  - The player has multiple chore buttons that they can click. Each chore costs a sort of stamina called Effort and gives varying levels of reward currency (maybe allowance?). The upgrades are home improvements that help the player automate certain tasks or reduce the amount of Effort they take.

## Notes

Serena: <br>
In my most recent push I updated the PurchasableClass to use a cool Python style **kwargs parameter that I found online. I did this so that we can customize specific optional parameters without having to deal with the other ones that come before it in the list; Now we can just say which one we're changing and the rest will use their default! Next, I'm thinking about adding some more things to buy and tasks to do so there is some more progression for the gameplay.

## Assets

- kitchenbackground, bathroombackground: Room model designed in Arcadium3d and edited in Sketchbook.
- Remaining assets: created using Sketchbook.
