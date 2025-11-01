document.addEventListener("DOMContentLoaded", () => {
    // --- Get references to all HTML elements ---
    const summarizeButton = document.getElementById("summarize");
    const copyButton = document.getElementById("copy-btn");
    const resultContainer = document.getElementById("result-container");
    const resultPre = document.getElementById("result");
    const copyTextSpan = document.getElementById("copy-text");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    // === NEW: Q&A Elements ===
    const qaContainer = document.getElementById("qa-container");
    const questionInput = document.getElementById("question-input");
    const askButton = document.getElementById("ask-button");
    
    // This will hold the full article text after a summary is made
    let originalArticleText = '';

    // --- Theme Switch Logic ---
    chrome.storage.sync.get(["theme"], (result) => {
        if (result.theme === "light") {
            body.classList.add("light-theme");
            themeToggle.checked = false;
        } else {
            body.classList.remove("light-theme");
            themeToggle.checked = true;
        }
    });
    themeToggle.addEventListener("change", () => {
        if (themeToggle.checked) {
            body.classList.remove("light-theme");
            chrome.storage.sync.set({ theme: "dark" });
        } else {
            body.classList.add("light-theme");
            chrome.storage.sync.set({ theme: "light" });
        }
    });

    // --- Summarize Button Logic ---
    summarizeButton.addEventListener("click", () => {
        qaContainer.classList.remove("visible"); // Hide Q&A on new summary
        const summaryType = document.getElementById("summary-type").value;
        showLoader();

        chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
            if (!geminiApiKey) {
                displayError("No API key set. Go to options to add one.");
                return;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                if (!tab.id) {
                    displayError("Cannot run on this special page.");
                    return;
                }
                chrome.tabs.sendMessage(tab.id, { type: "GET ARTICLE TEXT" }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.text) {
                        displayError("Could not read this page. Reload and try again.");
                        return;
                    }
                    (async () => {
                        const { text } = response;
                        if (text.trim().length < 50) {
                            displayError("Not enough text found on this page.");
                            return;
                        }
                        originalArticleText = text; // ** Store the full text
                        try {
                            const summary = await getGeminiSummary(text, summaryType, geminiApiKey);
                            displayResult(summary);
                            qaContainer.classList.add("visible"); // ** Show Q&A section
                        } catch (error) {
                            displayError(error.message);
                        }
                    })();
                });
            });
        });
    });

    // === NEW: Ask Button Logic ===
    askButton.addEventListener("click", () => {
        const question = questionInput.value.trim();
        if (!question) {
            displayError("Please enter a question.");
            return;
        }
        if (!originalArticleText) {
            displayError("You must summarize an article first.");
            return;
        }
        
        showLoader();

        chrome.storage.sync.get(["geminiApiKey"], async ({ geminiApiKey }) => {
            if (!geminiApiKey) {
                displayError("No API key set.");
                return;
            }
            try {
                const answer = await getGeminiAnswer(originalArticleText, question, geminiApiKey);
                displayResult(answer);
            } catch (error) {
                displayError(error.message);
            }
        });
    });

    // --- Helper Functions ---
    function showLoader() {
        resultPre.textContent = '';
        const oldLoader = resultContainer.querySelector(".loader");
        if (oldLoader) oldLoader.remove();
        resultContainer.insertAdjacentHTML('beforeend', '<div class="loader"></div>');
    }

    function removeLoader() {
        const loader = resultContainer.querySelector(".loader");
        if (loader) loader.remove();
    }

    function displayResult(text) {
        removeLoader();
        resultPre.textContent = text.trim();
    }

    function displayError(message) {
        removeLoader();
        resultPre.textContent = `Error: ${message}`;
    }

    // --- Copy Button Logic ---
    copyButton.addEventListener("click", () => {
        const resultText = resultPre.textContent;
        if (resultText.startsWith("Select a summary type") || resultText.startsWith("Error:")) return;
        navigator.clipboard.writeText(resultText).then(() => {
            copyTextSpan.textContent = "Copied!";
            copyButton.classList.add("success");
            setTimeout(() => {
                copyTextSpan.textContent = "Copy";
                copyButton.classList.remove("success");
            }, 1500);
        }).catch(err => {
            copyTextSpan.textContent = "Failed!";
            console.error('Failed to copy text: ', err);
        });
    });
});

// --- API Call Functions ---
async function makeApiCall(prompt, apiKey) {
     const model =
    "models/gemini-2.5-flash-preview-05-20"; // or "models/gemini-2.5-pro-preview-03-25"
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 },
        }),
    });
    if (!res.ok) {
        let errorData;
        try { errorData = await res.json(); } catch (e) { throw new Error(`Request failed with status ${res.status}`); }
        throw new Error(errorData.error?.message || "An unknown API error occurred.");
    }
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        if (data.promptFeedback?.blockReason) {
            return `Request blocked for safety reasons (${data.promptFeedback.blockReason}).`;
        }
        return "The API returned no content.";
    }
    return data.candidates[0]?.content?.parts[0].text ?? "No answer could be generated.";
}

async function getGeminiSummary(rawText, type, apiKey) {
    const max = 20000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;
    const promptMap = {
        brief: `Summarize in 2-3 sentences:\n\n${text}`,
        detailed: `Give a detailed summary:\n\n${text}`,
        bullets: `Summarize in 5-7 bullet points (start each line with "- "):\n\n${text}`,
    };
    return makeApiCall(promptMap[type] || promptMap.brief, apiKey);
}

// === NEW: API Function for Answering Questions ===
async function getGeminiAnswer(articleText, question, apiKey) {
    const max = 20000;
    const text = articleText.length > max ? articleText.slice(0, max) + "..." : articleText;
    const prompt = `Based *only* on the content of the following article, answer the user's question. If the answer is not in the article, say "The answer to that question is not found in the article."\n\n---ARTICLE---\n${text}\n\n---QUESTION---\n${question}`;
    return makeApiCall(prompt, apiKey);
}