document.getElementById("paste-btn").addEventListener("click", async () => {
  const inputText = document.getElementById("input-text").value;

  const tabs = await chrome.tabs.query({
    currentWindow: true,
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
