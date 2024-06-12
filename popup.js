const textArea = document.getElementById("input-text");

// get text if in chrome storage
chrome.storage.local.get("inputText", (result) => {
  const savedInputText = result.inputText;

  textArea.value = savedInputText ?? "";
});

// set chrome storage text every keyup event
textArea.addEventListener("keyup", () => {
  const inputText = document.getElementById("input-text").value;
  chrome.storage.local.set({ inputText: inputText });
});

// main logic
document.getElementById("paste-btn").addEventListener("click", async () => {
  const inputText = document.getElementById("input-text").value;

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
  const inputFields = document.querySelectorAll(
    'input[type="text"], input[type="search"], textarea, #prompt-textarea'
  );

  // for claude.ai
  const pFields = document.querySelectorAll('div[contenteditable="true"] p');

  const geminiButton = document.querySelector(".send-button");

  if (pFields.length === 1) {
    for (const p of pFields) {
      p.textContent = text;
      p.dispatchEvent(new Event("input", { bubbles: true }));
      p.focus();
      setTimeout(function () {
        const enterEvent = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 13,
        });
        p.dispatchEvent(enterEvent);
      }, 500);
    }

    // this shit is for gemini :)
    const observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          const geminiButton = document.querySelector(".send-button");
          if (geminiButton) {
            const inputArea = document.querySelector("div[contenteditable]");
            if (inputArea) {
              inputArea.textContent = text;
              inputArea.dispatchEvent(new Event("input", { bubbles: true }));
            }

            geminiButton.click();
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    for (const inputField of inputFields) {
      inputField.value = text;
      inputField.dispatchEvent(new Event("input", { bubbles: true }));
      inputField.focus();
      const enterEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        keyCode: 13,
      });
      inputField.dispatchEvent(enterEvent);
    }
  }
}

// submit with enter
textArea.addEventListener("keydown", (event) => {
  if (event.code === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.getElementById("paste-btn").click();
  }
});
