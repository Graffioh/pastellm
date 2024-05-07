chrome.storage.local.get("inputText", (result) => {
  const savedInputText = result.inputText;
  const textArea = document.getElementById("input-text");

  textArea.value = savedInputText ?? "";
});

document.getElementById("paste-btn").addEventListener("click", async () => {
  const inputText = document.getElementById("input-text").value;

  selectedUrls = [
    "https://chatgpt.com/*",
    "https://groq.com/*",
    "https://claude.ai/*",
    "https://chat.deepseek.com/*",
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
  // for chatgpt, deepseek, groq
  const inputFields = document.querySelectorAll(
    'input[type="text"], input[type="search"], textarea, #prompt-textarea'
  );

  // for claude.ai
  const pFields = document.querySelectorAll('div[contenteditable="true"] p');

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

document.getElementById("input-text").addEventListener("keydown", (event) => {
  if (event.code === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.getElementById("paste-btn").click();
  }
});

document.getElementById("input-text").addEventListener("keyup", () => {
  const inputText = document.getElementById("input-text").value;
  chrome.storage.local.set({ inputText: inputText });
});
