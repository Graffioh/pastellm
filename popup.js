const textArea = document.getElementById("input-text");
const pasteBtn = document.getElementById("paste-btn");
const clearBtn = document.getElementById("clear-btn");

// get text if in chrome storage
chrome.storage.local.get("inputText", (result) => {
  const savedInputText = result.inputText;

  textArea.value = savedInputText ?? "";
});

// set chrome storage text every keyup event
textArea.addEventListener("keyup", () => {
  const inputText = textArea.value;
  chrome.storage.local.set({ inputText: inputText });
});

// submit with enter
textArea.addEventListener("keydown", (event) => {
  if (event.code === "Enter" && !event.shiftKey) {
    event.preventDefault();
    pasteBtn.click();
  }
});

// clear textarea
clearBtn.addEventListener("click", (event) => {
  event.preventDefault();

  textArea.value = "";
  chrome.storage.local.set({ inputText: "" });
});

// main logic
pasteBtn.addEventListener("click", async () => {
  const inputText = textArea.value;

  selectedUrls = [
    "https://chatgpt.com/*",
    "https://groq.com/*",
    "https://claude.ai/*",
    "https://chat.deepseek.com/*",
    "https://chat.mistral.ai/*",
    "https://gemini.google.com/*",
  ];

  const tabs = await chrome.tabs.query({
    currentWindow: true,
    url: selectedUrls,
  });

  for (const tab of tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: pasteIntoInputFields,
      args: [inputText],
    });
  }
});

function pasteIntoInputFields(text) {
  // for chatgpt, deepseek, groq, mistral
  const inputType1 = document.querySelectorAll(
    'input[type="text"], input[type="search"], textarea, #prompt-textarea'
  );
  // for claude.ai and gemini
  const inputType2 = document.querySelectorAll("div[contenteditable] p");

  const isClaudeOrGemini = inputType2.length === 1;
  const geminiButton = document.querySelector(".send-button");

  const input = isClaudeOrGemini ? inputType2[0] : inputType1[0];

  if (isClaudeOrGemini) {
    input.textContent = text;
  } else {
    input.value = text;
  }

  setTimeout(function () {
    const enterEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      keyCode: 13,
    });
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(enterEvent);

    if (geminiButton) {
      geminiButton.click();
    }
  }, 500);
}
