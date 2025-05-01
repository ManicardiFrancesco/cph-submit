// src/content.ts
import log from "./log";

interface Payload {
  problemName: string;
  languageId: number;
  sourceCode: string;
  url: string;
}

chrome.runtime.onMessage.addListener((data: Payload) => {
  log("▶️ Received payload, filling form + auto-submit", data);

  setTimeout(() => {
    const form = document.querySelector<HTMLFormElement>(
      "form.submit-form.submitFrameForm"
    );
    if (!form) {
      log("❌ Could not find the submission form");
      return;
    }

    // 1) Problem code or contest index
    if (data.url.includes("/contest/")) {
      const problemIndex = data.url.split("/problem/")[1];
      const idxSelect = form.querySelector<HTMLSelectElement>(
        "select[name='submittedProblemIndex']"
      );
      if (idxSelect) {
        idxSelect.value = problemIndex;
        idxSelect.dispatchEvent(new Event("change", { bubbles: true }));
        log("✔️ Set contest problem index to", problemIndex);
      }
    } else {
      const codeInput = form.querySelector<HTMLInputElement>(
        "input[name='submittedProblemCode']"
      );
      if (codeInput) {
        codeInput.value = data.problemName;
        codeInput.dispatchEvent(new Event("input", { bubbles: true }));
        log("✔️ Set problem code to", data.problemName);
      }
    }

    // 2) Language dropdown (force G++23 = 91 )
    const langSelect = form.querySelector<HTMLSelectElement>(
      "select[name='programTypeId']"
    );
    if (langSelect) {
      const desiredLang = 91;
      langSelect.value = desiredLang.toString();
      langSelect.dispatchEvent(new Event("change", { bubbles: true }));
      log("✔️ Selected language ID", desiredLang);
    }

    // 3) Source textarea
    const sourceArea = form.querySelector<HTMLTextAreaElement>(
      "textarea[name='source'], #sourceCodeTextarea"
    );
    if (sourceArea) {
      sourceArea.value = data.sourceCode;
      sourceArea.dispatchEvent(new Event("input", { bubbles: true }));
      log("✔️ Pasted source code (length:", data.sourceCode.length, ")");
    }

    // 4) Click the submit button
    const submitBtn = form.querySelector<HTMLButtonElement | HTMLInputElement>(
      "input[type='submit'], button[type='submit'], .submit"
    );
    if (submitBtn) {
      log("✔️ Found submit button");
      log("👉 Clicking submit button");
      (submitBtn as HTMLElement).click();
    } else {
      log("❌ Could not find submit button to click");
    }

    log("✅ Fill + submit sequence complete");
  }, 200);
});
