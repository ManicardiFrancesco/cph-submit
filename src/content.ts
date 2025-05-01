// src/content.ts
import log from "./log";

interface Payload {
  problemName: string;
  languageId: number;
  sourceCode: string;
  url: string;
}

chrome.runtime.onMessage.addListener((data: Payload) => {
  log("▶️ Received payload, will fill form in 200ms", data);

  setTimeout(() => {
    // 1) Grab the form by its exact classes
    const form = document.querySelector<HTMLFormElement>(
      "form.submit-form.submitFrameForm"
    );
    if (!form) {
      log("❌ Could not find <form class='submit-form submitFrameForm'>");
      return;
    }

    // 2) Problem code / index
    if (data.url.includes("/contest/")) {
      const idx = data.url.split("/problem/")[1];
      const sel = form.querySelector<HTMLSelectElement>(
        "select[name='submittedProblemIndex']"
      );
      if (sel) sel.value = idx;
    } else {
      const codeIn = form.querySelector<HTMLInputElement>(
        "input[name='submittedProblemCode']"
      );
      if (codeIn) codeIn.value = data.problemName;
    }

    // 3) Language
    const langSel = form.querySelector<HTMLSelectElement>(
      "select[name='programTypeId']"
    );
    if (langSel) langSel.value = data.languageId.toString();

    // 4) Source
    const ta = form.querySelector<HTMLTextAreaElement>(
      "textarea[name='source'], #sourceCodeTextarea"
    );
    if (ta) ta.value = data.sourceCode;

    // 5) ftaa/bfaa are already populated by CF's own inline script once ready
    //    so we don't need to override; just log what's there:
    const ftaaIn = form.querySelector<HTMLInputElement>("input[name='ftaa']");
    const bfaaIn = form.querySelector<HTMLInputElement>("input[name='bfaa']");
    log("Hidden tokens:",
        "ftaa=", ftaaIn?.value?.slice(0,6), "...",
        "bfaa=", bfaaIn?.value?.slice(0,6), "..."
    );

    log("📝 Filled form, now submitting…");
    form.submit();
  }, 200);
});
