import { chromium } from "@playwright/test";
import { deck, questions } from "../src/content.ts";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome" });
const failures = [];
const errors = [];
const requests = [];
await mkdir("/private/tmp/cs4023-qa", { recursive: true });
for (const [width, height] of [
  [1280, 720],
  [1920, 1080],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:5173")) requests.push(r.url());
  });
  await page.goto("http://127.0.0.1:5173");
  async function record(name) {
    const geo = await page.evaluate(() => {
      const main = document.querySelector("main");
      const r = main.getBoundingClientRect();
      return {
        id: main.id,
        stage: document.querySelector(".stage-tag")?.textContent,
        height: main.clientHeight,
        scroll: main.scrollHeight,
        bad: [
          ...main.querySelectorAll(
            "h1,p,.option,.code-block,.diagram,.takeaway,.stage-actions",
          ),
        ]
          .filter((el) => {
            const a = el.getBoundingClientRect();
            return (
              a.bottom > r.bottom + 1 ||
              a.right > r.right + 1 ||
              a.left < r.left - 1
            );
          })
          .map((el) => [
            el.className || el.tagName,
            Math.round(el.getBoundingClientRect().bottom - r.bottom),
          ]),
        pre: [...main.querySelectorAll("pre")].map((p) => [
          p.clientWidth,
          p.scrollWidth,
          p.clientHeight,
          p.scrollHeight,
        ]),
        children: [...main.children].map((c) => [
          c.className,
          c.clientHeight,
          c.scrollHeight,
        ]),
      };
    });
    if (
      geo.scroll > geo.height + 2 ||
      geo.bad.length ||
      geo.pre.some((p) => p[1] > p[0] + 1)
    )
      failures.push({ width, name, ...geo });
    await page.screenshot({
      path: `/private/tmp/cs4023-qa/${width}-${name}.png`,
    });
  }
  for (let i = 0; i < deck.length; i++) {
    const s = deck[i];
    await page
      .getByRole("button", { name: "Open contents", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Contents", exact: true })
      .getByRole("button")
      .nth(i)
      .click();
    await page.locator("main").focus();
    await record(s.id);
    if (s.kind === "question") {
      const q = questions.find((q) => q.id === s.questionId);
      await page.keyboard.press("a");
      await record(s.id + "-answer");
      await page.keyboard.press("e");
      for (let j = 0; j <= q.steps.length; j++) {
        await record(s.id + "-explain-" + j);
        if (j < q.steps.length)
          await page
            .getByRole("button", { name: "Next explanation →", exact: true })
            .click();
      }
    }
  }
  await page.close();
}
await browser.close();
await writeFile(
  "/private/tmp/cs4023-qa/audit.json",
  JSON.stringify({ failures, errors, requests }, null, 2),
);
console.log(JSON.stringify({ failures, errors, requests }, null, 2));
