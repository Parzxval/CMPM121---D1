# Contributors

Kajol Prasad and Serena Heath!

# D1 starter

A minimal TypeScript/Vite browser project with Deno checks and GitHub Pages deployment.

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da), which has no explicit repository license. No new license is assigned to that material. The D1 scaffold and original SVG were authored with OpenAI GPT-6 Astra assistance. Dependencies retain their respective licenses.

## Useful Links

- [Project Repo](https://github.com/Parzxval/CMPM121---D1)
- [Assignment Page](https://docs.google.com/document/d/1RdQ4yCqg6Jmkc7TH2W8KlLn9rBnvKmO35uvmbcDTOEc/edit?tab=t.0#heading=h.z27emflh20wz)
- [Assignment Spreadsheet](https://docs.google.com/spreadsheets/d/13rC6H1Tyt8QaLfrW946tXaowraPK9OYNvriRu53NgvA/edit?gid=106#gid=106)
- [Lectures](https://drive.google.com/drive/folders/1624F_OwJeTv9GGrUJ9kJiYKiUAqJ1gDK?usp=drive_link)
- [Mozilla Docs (MDN)](https://developer.mozilla.org/en-US/)

# Ideas

- Chore Clicker: Do different chores with effort as a currency. Buy home improvements and upgrades with rewards.
  - The player has multiple chore buttons that they can click. Each chore costs a sort of stamina called Effort and gives varying levels of reward currency (maybe allowance?). The upgrades are home improvements that help the player automate certain tasks or reduce the amount of Effort they take.

## Notes

Serena: <br>
In my most recent push I changed MachineClass to take a the whole TaskClass object instead of just a callback to the tasks AutoExecute() method. This was to help provide some more data to the machine to support the UI changes I'll describe later. I also removed the [amount] parameter cause it was kinda redundant given that I had the Purchase() & Sell() methods already. I changed the MachineClass' toString() method (and thus the UI that it displays) to show how much money & XP the machine is earning (both individually & total per cycle) in addition to what it already displayed. <br>
Next I plan to mess with the PurchasableClass so that it is a little simpler to use. This will involve some parameter changes so keep and eye out for that.
