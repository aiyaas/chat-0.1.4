const inputUser      = document.querySelector("#input");
const sendBtn        = document.querySelector("#send");
const useChat        = document.querySelector("#useChat"); //Msg
const uploaded       = document.querySelector("#upfile");
const microphone     = document.querySelector("#record");
const showMediaFile  = document.querySelector("#RootFile");
const deleteChat     = document.querySelector("#deleteChat");
const useSplit       = document.querySelector("#split");
const useNumChat     = document.querySelector("#numChat");
const useKey         = document.querySelector("#useKey");


// Auto scroll page when response is displayed with DOM
const autoScroll = document.querySelector(".scroll");
let initialInputHeight = inputUser.scrollHeight;

// Add model name to home screen without any hassle
document.querySelectorAll(".models").forEach((e) => {
    e.innerHTML += "Reapl <span class='ms-1' style='color:#5d7ce0;font-size:16px;'></span>";
});


let data = { message: "", file: {}, history: [] }; // Cache 

// Function to display current chat time, adjust current country
function time() {
    return new Date().toLocaleString("en-US", {
        hour12: false,
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
    });
}

// Key features for automation of the entire chat program with an improved model
async function HandleOutgoingChat() {
    const from = inputUser.value.trim();
    if (!from) return;
    // Auto input user installation with use message
    inputUser.value = "";
    inputUser.style.height = `${initialInputHeight}px`;
    
    // Handle user input with replace /Url/Html/Sensor
    const full_args = from
        .replace(/<(.*?)>/gis, "&#60;$1&#62;") // HTML
        .replace(new RegExp(text.join("|"), "gi"), "****") // Sensor
        .replace(/\b((?:https?|ftp):\/\/[^\s\°]+)/g, "<a href='$1'>$1</a>"); // URL
    
    // Display user messages to appear on the main screen
    useChat.innerHTML += `
    <li class="repaly">
      <section>${showMediaFile ? showMediaFile.innerHTML.replace(/\s+/g, " ").trim() : showMediaFile.innerHTML=""}${full_args}</section>
      <div class="time">${time()}</div>
    </li>`;
    
    showMediaFile.innerHTML = "";
    
    // Spinner animation when sending chat is quite long
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
    <svg width="18px" height="18px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" class="hds-flight-icon--animation-loading spinner">
      <g fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd">
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"/>
        <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"/>
      </g>
    </svg>`;
    
    try {
        // Get and input messages into the model environment
        // Assuming 'messages' is a function that interacts with your AI model
        const response = await environment(from); // Renamed 'data' to 'responseData' to avoid conflict with global 'data' object
        
        useChat.innerHTML += `
            <li class="sender">
                <section>${response}</section>
                <div class="time"><svg onclick='useClipboard()' width='13px' height='13px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' class='icon-md-heavy'><path fill-rule='evenodd' clip-rule='evenodd' d='M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z' fill='#4a5568'></path></svg></div>
            </li>`;
        
        const splitChat = (typeof response === "string") ? `${response.slice(0, 28)}...` : "";
        const NumChat = useChat.children.length + " Chat";
        
        useSplit.textContent = splitChat;
        useNumChat.textContent = NumChat;
        
        // Save text message data into database 
        await addDataToDBNoOverwrite('message', ({
            user: from,
            system: response 
        }));
        
        await addDataToDB("lastSplitChat", splitChat);
        await addDataToDB("lastNumChat", NumChat);
        await addDataToDB("chatHistoryHTML", useChat.innerHTML); // Store full chat with HTML
        
    } catch (e) {
        console.log(e.stack);
        return bubble(e.message, 10000);
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Arrow / Arrow_Up_MD"><path id="Vector" d="M12 19V5M12 5L6 11M12 5L18 11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
    }
    
    // Add handling to add culdwon to user input as a premium feature
    inputUser.disabled = true;
    let setTimeColdwon = 10;
    
    let disable = setInterval(() => {
        inputUser.placeholder =
            setTimeColdwon > 0 ?
            `Can send in ${setTimeColdwon--}s` :
            (clearInterval(disable),
                (inputUser.disabled = false),
                (inputUser.placeholder = "Ask me any questions"));
    }, 1000);
    
    autoScroll.scrollTo({ top: autoScroll.scrollHeight, behavior: "smooth" }) // Scroll to bottom of the message container
}


// Add copy button to grab text from object class to make it easier to copy text to clipboard
function useClipboard() {
    bubble("Text has been copied to the clipboard!");
    return navigator.clipboard.writeText(event.target.closest(".sender").textContent.trim());
}

// Cancel upload files with this function
function cancelUpFile() {
    showMediaFile.innerHTML = "";
    data.file = {};
}

// Get api key from user
useKey.addEventListener('click', async () => {
    const used = prompt("Enter your Api key to use in the https://aistudio.google.com/ your key is private.");
    if (used) {
        await addDataToDB('apiKey', used);
    }
});


// Set the configuration to take the sound and return it to text form
microphone.addEventListener("click", () => {
    var speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = "id-ID";
    
    recognition.addEventListener("result", (e) => {
        const transcript = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
        
        inputUser.value = transcript; // Show recorded text
    });
    
    if (speech == true) {
        navigator.vibrate([200, 100, 200]); // Vibrate 200ms, pause 100ms, vibrate again 200ms.
        recognition.start();
    }
});

// Handle file input change (file upload)
uploaded.addEventListener("click", () => {
    const input = Object.assign(document.createElement("input"), { type: "file" });
    const typeFileChange = [
        "audio/mp3",
        "audio/wav",
        "video/mp4",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "text/text",
        "text/javascript",
        "text/html",
        "text/plain",
        "text/css",
        "text/csv",
        "text/xml",
        "application/pdf"
    ];
    
    input.addEventListener("change", function() {
        const file = this.files[0];
        const type = file.type.split("/")[0];
        const ext = file.type.toUpperCase().split("/")[1];
        const reader = new FileReader();
        if (!typeFileChange.includes(file.type)) {
            return bubble("File type not supported.");
        }
        
        reader.onload = (e) => {
            const base64 = e.target.result.split(",")[1];
            const url = e.target.result;
            const blob = new Blob([file], { type: file.type });
            
            let media = ""; // Media for element HTML
            
            switch (type) {
                case "image":
                    media = `<img src="${url}" alt="${file.name}" />`;
                    break;
                case "video":
                    const canvas = document.createElement("canvas");
                    const video = document.createElement("video");
                    video.src = URL.createObjectURL(blob);
                    video.muted = true;
                    video.play();
                    video.addEventListener("loadeddata", () => {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                        media = `<img src="${canvas.toDataURL()}" alt="thumbnail" />`;
                        renderPreview(); // Re-render when thumbnail is ready
                    });
                    break;
                default:
                    media = `<div class="file-none"><svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="30px" height="30px" fill="#4a5568"><path d="M 12.5 4 C 10.032499 4 8 6.0324991 8 8.5 L 8 39.5 C 8 41.967501 10.032499 44 12.5 44 L 35.5 44 C 37.967501 44 40 41.967501 40 39.5 L 40 18.5 A 1.50015 1.50015 0 0 0 39.560547 17.439453 L 39.544922 17.423828 L 26.560547 4.4394531 A 1.50015 1.50015 0 0 0 25.5 4 L 12.5 4 z M 12.5 7 L 24 7 L 24 15.5 C 24 17.967501 26.032499 20 28.5 20 L 37 20 L 37 39.5 C 37 40.346499 36.346499 41 35.5 41 L 12.5 41 C 11.653501 41 11 40.346499 11 39.5 L 11 8.5 C 11 7.6535009 11.653501 7 12.5 7 z M 27 9.1210938 L 34.878906 17 L 28.5 17 C 27.653501 17 27 16.346499 27 15.5 L 27 9.1210938 z M 17.5 25 A 1.50015 1.50015 0 1 0 17.5 28 L 30.5 28 A 1.50015 1.50015 0 1 0 30.5 25 L 17.5 25 z M 17.5 32 A 1.50015 1.50015 0 1 0 17.5 35 L 26.5 35 A 1.50015 1.50015 0 1 0 26.5 32 L 17.5 32 z"/></svg></div>`;
            }
            
            function renderPreview() {
                return showMediaFile.innerHTML = `
                  <div class="container">
                    <button class="button" onclick="cancelUpFile()">
                      <svg viewBox="0 0 24 24" width="10px" height="10px" stroke="#000000"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                    <div class="media">${media}</div>
                    <div class="contents">
                      <h3>${file.name.trim()}</h3>
                      <p class="extension">${useFileSize(new Blob([base64]))} ・ ${ext}</p>
                    </div>
                  </div>`;
            };
            
            if (type !== "video") renderPreview(); // image/file render
            
            // Save the Object file to the log variable data 
            data.file = {
                mime_type: file.type,
                fileName: file.name,
                data: base64,
                isImage: type === "image"
            };
        };
        
        reader.readAsDataURL(file);
    });
    
    input.click();
});

// Show real-time data when there is a change
setInterval(async () => {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readonly");
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    store.getAll().onsuccess = (e) => {
        const data = JSON.stringify(e.target.result);
        document.querySelector("#statistic").innerHTML = `
          <table>
            <tr>
              <th> DB used&emsp;</th>
              <td><mark class="mark-a m-0">${useFileSize(new Blob([data]))}</mark></td>
            </tr>
            <tr>
              <th> Data stack&emsp;</th>
              <td><pre class="m-0">${(typeof data === "string") ? `${data.slice(0, 20)}...` : "..."}</pre></td>
            </tr>
            <tr>
              <th> Api Key&emsp;</th>
              <td><pre class="m-0">${(typeof e.target.result === "string") ? `${e.target.result[0].value.slice(0, 30)}...` : "..."}</pre></td>
            </tr>
          </table>`;
    };
}, 500);


document.addEventListener('DOMContentLoaded', async () => {
    // Show message data stored in IndexedDB
    useChat.innerHTML = await getDataFromDB("chatHistoryHTML");    
    
    // Auto loading of data details from IndexedDB
    useSplit.textContent = await getDataFromDB("lastSplitChat");
    useNumChat.textContent = await getDataFromDB("lastNumChat");
    autoScroll.scrollTo({ top: autoScroll.scrollHeight, behavior: "smooth" }); // Scroll to bottom after loading messages
});

inputUser.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    inputUser.style.height = `${initialInputHeight}px`;
    inputUser.style.height = `${inputUser.scrollHeight}px`;
});


inputUser.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        return e.preventDefault() + HandleOutgoingChat();
    }
});

deleteChat.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear? This action cannot be undone.")) {
        bubble("Remove success: Data stored in 'indexDB' is permanently deleted.");
        useChat.innerHTML = "";
        useSplit.innerHTML = "";
        useNumChat.innerHTML = "";
        return await clearDB(); // Clear all data from IndexedDB
    }
});

bubble("<b style='font-size:15px;'>Welcome to <span style='color:#2aa198;'>REAPL</span>, your personal AI assistant.</b> <br><br> All your inputs such as chats with (Reapl) are not used for any specific purposes so you don't need to worry about your data, all chat data is stored in browser cookies.", 8000);

sendBtn.addEventListener("click", HandleOutgoingChat);
