//this is the chromes inbuilt function
chrome.runtime.onInstalled.addListener(()=>{
       chrome.storage.sync.get(["geminiApiKey"], (result)=>{
       if(!result.geminiApiKey){
         chrome.tabs.create({url: "options.html"})
       }
       })
})