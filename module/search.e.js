// Handle the search feature on the search bar 
const searchInput = document.querySelector("#inlineFormInputGroup");
const items = document.querySelectorAll("#listItems");
const error = document.querySelector("#eSearchInfo");

searchInput.addEventListener("input", () => {
    function searchItems(__query__) {
        return items.forEach((i) => {
            let itemsText = i.textContent.toLowerCase();
            
            if (itemsText.includes(__query__.toLowerCase())) {
                i.style.display = "block";
                error.style.display = "none";
            } else {
                i.style.display = "none";
                error.style.display = "block";
                
                error.innerHTML = "No results found. Check your spelling or try a more general term.";
            }
        });
    }
    
    return searchItems(searchInput.value.trim());
});
