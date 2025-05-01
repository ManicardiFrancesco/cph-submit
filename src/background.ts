import config from "./config";
import log from "./log";
import { CphSubmitResponse, CphEmptyResponse } from "./types";

let targetTabId: number | null = null;
let pendingData: CphSubmitResponse | null = null;

// 1) Poll the CPH server
async function poll() {
  try {
    const resp = await fetch(config.cphEndpoint, {
      headers: { "cph-submit": "true" }
    });
    if (!resp.ok) {
      log("CPH server error", resp.status);
      return;
    }
    const json = await resp.json() as CphSubmitResponse | CphEmptyResponse;
    if (json.empty) {
      return;
    }
    log("CPH wants us to submit", json);
    openSubmitTab(json);
  } catch (e) {
    log("Fetch error", e);
  }
}

// 2) Open the CF submit page and stash data
function openSubmitTab(data: CphSubmitResponse) {
  const isContest = data.url.includes("/contest/");
  const submitUrl = isContest
    ? `https://codeforces.com/contest/${new URL(data.url).pathname.split("/")[2]}/submit`
    : "https://codeforces.com/problemset/submit";

  chrome.tabs.create({ url: submitUrl, active: true }, tab => {
    if (!tab.id) {
      log("Failed to create tab");
      return;
    }
    targetTabId = tab.id;
    pendingData = data;
    log("Opened tab", tab.id, "→ waiting for load");
  });
}

// 3) When that tab finishes loading /submit, send it our data
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (
    tabId === targetTabId &&
    info.status === "complete" &&
    tab.url?.includes("/submit") &&
    pendingData
  ) {
    log("Submit page loaded in tab", tabId, "— sending payload");
    chrome.tabs.sendMessage(tabId, pendingData);
    // clear so we don’t resend repeatedly
    targetTabId = null;
    pendingData = null;
  }
});

setInterval(poll, config.pollIntervalMs);
