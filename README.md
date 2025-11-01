CogniRead 🚀
Tagline: Summarize. Ask. Understand.

This is the official repository for CogniRead, an AI-powered reading assistant built as a Chrome Extension for the Google Chrome AI Challenge 2025.

CogniRead transforms your reading experience from a passive one into an active, conversational journey. It's designed to help you understand web content faster by providing instant summaries and letting you ask specific questions about any article.

✨ Key Features
Multi-Mode Summaries: Instantly generate a Brief Summary, Detailed Summary, or Bullet Points for any webpage using the Google Gemini API.
"Ask the Article" (Interactive Q&A): Go beyond summaries. Ask specific questions about the article (e.g., "What was the final verdict?" or "Who was the main person involved?") and get an AI-powered answer based only on the article's text.
Sleek Modern UI: A beautiful, responsive, and professional interface built from scratch.
Animated Theme Switch: Toggle between a polished Dark Mode and a clean Light Mode with a smooth animation. Your preference is saved locally.
One-Click Copy: Easily copy the summary or answer to your clipboard.
Smart Onboarding: Automatically detects if a user needs to add an API key and guides them to the options page.
demo
(I highly recommend you record a 30-60 second GIF of your extension working and place it here. For now, you can use your video, or add screenshots.)

CogniRead UI

🔧 How to Install & Test
Since this is an unpacked Chrome extension, you can load it directly into your browser to test it.

Download the Code:

Click the green "Code" button on this repository.
Select "Download ZIP".
Unzip the file on your computer.
Load the Extension in Chrome:

Open your Chrome browser and navigate to chrome://extensions.
In the top-right corner, toggle on "Developer mode".
Click the "Load unpacked" button that appears.
Select the entire CogniRead folder (the one you just unzipped).
Run it!

The CogniRead icon will appear in your toolbar (you may need to pin it).
Click the icon and go to Options to add your Gemini API key.
You're all set! Go to any article and start summarizing.
🛠️ Built With
Core: JavaScript (ES6+), HTML5, CSS3
Browser API: Chrome Extensions Manifest V3
Platform APIs: chrome.storage, chrome.runtime, chrome.tabs
AI: Google Gemini API (v1/gemini-pro stable model)
Utilities: fetch API for asynchronous calls

