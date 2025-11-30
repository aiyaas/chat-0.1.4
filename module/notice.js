// Function to display notification bubble when this instance is called
function bubble(message, duration = 5000) {
  const e = document.querySelector(".note");
  e.innerHTML = message; // Display notification message to home screen
  e.style.display = "block";
  
  // Add time to delete notification
  setTimeout(() => {
    e.innerHTML = "";
    e.style.display = "none";
  }, duration);
}

