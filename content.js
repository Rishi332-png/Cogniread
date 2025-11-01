// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET ARTICLE TEXT') {
        const article = document.querySelector("article");
        let text = "";
        
        if (article) {
            text = article.innerText;
        } else {
            const paragraphs = Array.from(document.querySelectorAll("p"));
            text = paragraphs.map((p) => p.innerText).join("\n");
        }

        sendResponse({ text: text });
        
        // This is the most critical line. It keeps the message port open.
        return true; 
    }
});