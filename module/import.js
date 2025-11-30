function formatToCSV(data) {
    // Convert some 'JSON' to 'CSV' type
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => {
          return typeof value === 'object'
            ? `${key}, ${formatToCSV(value)}`
            : `${key}, ${value}`;
        })
        .join('\n'); // Add (\n) if you want to change the line
    }
    
    return null;
};

async function ParseInCsv() {
    const myData = await getDataFromDB("message");

    try {
        const a = document.createElement("a");
        console.log(parts)       
        a.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(formatToCSV(myData)));
        
        a.setAttribute("download", Date.now() + ".csv");
        document.body.appendChild(a);
        a.click();
        
        // Remove items createElement in the download file
        document.body.removeChild(a);
    } catch (e) {
        bubble("Your browser does not support this feature! Please use a different browser.");
    }
}
