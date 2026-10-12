import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { deck, questions, letters } from "../src/content";
async function jump(page: Page, title: string) {
  await page
    .getByRole("button", { name: "Open contents", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Contents", exact: true })
    .getByRole("button", {
      name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .click();
  await page.locator("main").focus();
}
async function noOverflow(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((a) => a.finished));
  });
  const result = await page.evaluate(() => {
    const main = document.querySelector("main")!;
    const rect = main.getBoundingClientRect();
    const bad = Array.from(
      main.querySelectorAll(
        "h1,p,.option,.code-block,.diagram,.takeaway,.stage-actions",
      ),
    )
      .map((el) => ({
        tag: el.className || el.tagName,
        r: el.getBoundingClientRect(),
      }))
      .filter(
        ({ r }) =>
          r.bottom > rect.bottom + 1 ||
          r.right > rect.right + 1 ||
          r.left < rect.left - 1,
      );
    const overlap: string[] = [];
    for (const selector of [".question-content", ".explanation-body"]) {
      const parent = main.querySelector(selector);
      if (parent) {
        const children = Array.from(parent.children).filter(
          (c) => c.getBoundingClientRect().height > 0,
        );
        for (let i = 1; i < children.length; i++) {
          if (
            children[i - 1].getBoundingClientRect().bottom >
            children[i].getBoundingClientRect().top + 1
          )
            overlap.push(children[i].className || children[i].tagName);
        }
      }
    }
    const pre = Array.from(main.querySelectorAll("pre")).filter(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    for (const selector of [".question-layout", ".explanation-body"]) {
      const parent = main.querySelector(selector);
      if (parent) {
        const area = parent.getBoundingClientRect();
        for (const c of Array.from(parent.children)) {
          const a = c.getBoundingClientRect();
          if (a.top < area.top - 1 || a.bottom > area.bottom + 1)
            overlap.push("outside " + selector + ": " + c.className);
        }
      }
    }
    return {
      slide: main.id,
      scrollY: main.scrollHeight > main.clientHeight + 2,
      bad: bad.map((x) => x.tag),
      overlap,
      codeOverflow: pre.length,
    };
  });
  expect(result, `Overflow on ${result.slide}`).toMatchObject({
    scrollY: false,
    bad: [],
    overlap: [],
    codeOverflow: 0,
  });
}
test("selection, answer, explanation and navigation remain separate", async ({
  page,
}) => {
  await page.goto("/");
  await jump(page, "Example 1.1");
  await page.locator(".option").nth(0).click();
  await expect(page.locator(".option.selected")).toHaveCount(1);
  await expect(page.locator(".option.correct")).toHaveCount(0);
  await expect(page.getByTestId("answer-summary")).toHaveCount(0);
  await expect(page.getByTestId("solution-diagram")).toHaveCount(0);
  await page.locator("main").focus();
  await page.keyboard.press("e");
  await expect(page.locator(".stage-tag")).toHaveText("Question");
  await page.keyboard.press("a");
  await expect(page.locator(".stage-tag")).toHaveText("Answer");
  await expect(page.locator(".option.correct")).toContainText("C");
  await expect(page.getByTestId("solution-diagram")).toHaveCount(0);
  await page.keyboard.press("e");
  await expect(page.locator(".stage-tag")).toContainText("Explanation");
  await expect(page.getByTestId("solution-diagram")).toHaveCount(1);
  await page.keyboard.press("h");
  await expect(page.locator(".stage-tag")).toHaveText("Question");
  await expect(page.getByTestId("solution-diagram")).toHaveCount(0);
  await expect(page.getByTestId("answer-summary")).toHaveCount(0);
  await expect(page.locator(".correct,.reconsider")).toHaveCount(0);
  await page.keyboard.press("a");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".stage-tag")).toHaveText("Question");
  await expect(page.locator(".option.selected")).toHaveCount(0);
  await page.keyboard.press("Space");
  await expect(page.locator(".stage-tag")).toHaveText("Answer");
  await page.keyboard.press("Space");
  await expect(page.locator(".stage-tag")).toContainText("Explanation");
  await page.keyboard.press("Space");
  await expect(page.locator(".misconceptions")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.locator(".eyebrow")).toContainText("1.2");
});
test("timer and editable fields cannot reveal or advance", async ({ page }) => {
  await page.goto("/");
  await jump(page, "Example 3.2");
  // Verify the target guard independently of the modal/panel guard.
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "qa-entry";
    const editable = document.createElement("div");
    editable.id = "qa-editable";
    editable.setAttribute("contenteditable", "");
    document.querySelector("main")!.append(input, editable);
  });
  for (const selector of ["#qa-entry", "#qa-editable"]) {
    const field = page.locator(selector);
    await field.fill("");
    for (const key of ["a", "e", "h", "f", "Space", "ArrowRight", "ArrowLeft"])
      await field.press(key);
    await expect(page.locator("main")).toHaveAttribute("id", "example-3.2");
    await expect(page.locator(".stage-tag")).toHaveText("Question");
    expect(
      await field.evaluate((el) =>
        (el instanceof HTMLInputElement
          ? el.value
          : el.textContent!
        ).replaceAll("\u00a0", " "),
      ),
    ).toBe("aehf ");
    expect(await page.evaluate(() => Boolean(document.fullscreenElement))).toBe(
      false,
    );
  }
  await page.evaluate(() => {
    document.querySelector("#qa-entry")!.remove();
    document.querySelector("#qa-editable")!.remove();
  });
  await page.getByRole("button", { name: "Open discussion timer" }).click();
  const input = page.getByRole("spinbutton");
  await input.fill("1");
  await input.press("ArrowRight");
  await input.press("a");
  await input.press("e");
  await input.press("h");
  await input.press("f");
  await input.press("Space");
  await expect(page.locator("main")).toHaveAttribute("id", "example-3.2");
  await expect(page.locator(".stage-tag")).toHaveText("Question");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.locator(".timer-ended")).toBeVisible({ timeout: 3000 });
  await expect(page.locator(".stage-tag")).toHaveText("Question");
  await expect(page.locator("main")).toHaveAttribute("id", "example-3.2");
});
test("reset is protected, notes explicit and fullscreen exits", async ({
  page,
}) => {
  await page.goto("/");
  await jump(page, "Example 4.3");
  await page.getByRole("button", { name: "Open presenter notes" }).click();
  await expect(page.locator(".notes-warning")).toContainText(
    "Visible on the projector",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator("main").focus();
  await page.keyboard.press("f");
  await expect(
    page.getByRole("button", { name: "Exit fullscreen", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("f");
  await expect(
    page.getByRole("button", { name: "Enter fullscreen", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open contents", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset session…", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "aria-label",
    "Reset this session?",
  );
  await page.getByRole("button", { name: "Keep presenting" }).click();
  await expect(page.locator("main")).toHaveAttribute("id", "example-4.3");
  await page
    .getByRole("button", { name: "Open contents", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset session…", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset session", exact: true })
    .click();
  await expect(page.locator("main")).toHaveAttribute("id", "opening");
});
for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
]) {
  test(`complete deck fits ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const slide of deck) {
      await jump(page, slide.title);
      await noOverflow(page);
      if (slide.kind === "question") {
        const q = questions.find((q) => q.id === slide.questionId)!;
        await expect(page.locator(".option")).toHaveCount(4);
        await expect(page.getByTestId("solution-diagram")).toHaveCount(0);
        for (let choice = 0; choice < 4; choice++) {
          await page.locator(".option").nth(choice).click();
          await expect(page.locator(".correct")).toHaveCount(0);
          await expect(page.getByTestId("answer-summary")).toHaveCount(0);
          await noOverflow(page);
        }
        await page.locator(".option").nth(0).click();
        await page.locator("main").focus();
        await page.keyboard.press("a");
        await expect(page.locator(".option.correct .option-letter")).toHaveText(
          q.answer,
        );
        await noOverflow(page);
        await page.keyboard.press("e");
        for (let step = 0; step <= q.steps.length; step++) {
          await noOverflow(page);
          if (step < q.steps.length) {
            await page
              .getByRole("button", { name: "Next explanation →", exact: true })
              .click();
          }
        }
        await page
          .getByRole("button", { name: "View original question", exact: false })
          .click();
        await expect(page.getByRole("dialog").locator(".option")).toHaveCount(
          4,
        );
        await expect(page.getByRole("dialog").locator(".correct")).toHaveCount(
          0,
        );
        await page.getByRole("button", { name: "Close panel" }).click();
      }
    }
  });
}
test("source answer key and IDs match the 11 supplied examples", () => {
  expect(questions.map((q) => [q.id, q.answer])).toEqual([
    ["1.1", "C"],
    ["1.2", "C"],
    ["1.3", "B"],
    ["2.1", "C"],
    ["2.2", "D"],
    ["3.1", "C"],
    ["3.2", "C"],
    ["3.3", "B"],
    ["4.1", "A"],
    ["4.2", "B"],
    ["4.3", "C"],
  ]);
  expect(new Set(deck.map((s) => s.id)).size).toBe(deck.length);
  for (const q of questions)
    expect(
      letters
        .filter((l) => l !== q.answer)
        .every((l) => Boolean(q.misconceptions[l])),
    ).toBeTruthy();
});

test("DOCX options and code are preserved apart from whitespace", () => {
  const paragraphs = JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        `import zipfile,xml.etree.ElementTree as E,json
n={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with zipfile.ZipFile('CS4023_Midterm_Sample_Questions.docx') as z:
 root=E.fromstring(z.read('word/document.xml'))
 lines=[]
 for p in root.findall('.//w:p',n):
  text=''
  for e in p.iter():
   if e.tag=='{'+n['w']+'}t': text+=e.text or ''
   elif e.tag=='{'+n['w']+'}br': text+='\\n'
  lines.extend(text.split('\\n'))
 print(json.dumps(lines))
`,
      ],
      { encoding: "utf8" },
    ),
  ) as string[];
  const normal = (s: string) => s.replace(/\s/g, "");
  for (const q of questions) {
    const start = paragraphs.indexOf("Example " + q.id);
    const end = paragraphs.findIndex(
      (p, i) => i > start && p.startsWith("Answer:"),
    );
    const original = paragraphs.slice(start + 1, end);
    expect(original[0]).toBe(q.prompt);
    for (const [i, l] of letters.entries()) {
      const option = original.find((p) => p.startsWith(l.toLowerCase() + ") "));
      expect(option?.slice(3)).toBe(q.options[i]);
    }
    if (q.code) {
      const begin = original.findIndex((p) => p.startsWith("#include"));
      const finish = original.findIndex((p) => p.startsWith("a)"));
      const source = original
        .slice(begin, finish)
        .filter((p) => p !== q.afterCode)
        .join("\n");
      expect(normal(q.code)).toBe(normal(source));
    }
  }
});
