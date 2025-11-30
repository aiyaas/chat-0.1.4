// Prerel integration with 'DB' to store data and also add data to the database, this uses the browser's indexDB API
"use strict";

const DB_VERSION = 1; // Set application version to save data to database

// IndexedDB setup
const DB_NAME = "InceChatDB";
const OBJECT_STORE_NAME = "chatMessages";

// System to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const open = indexedDB.open(DB_NAME, DB_VERSION);
        
        open.onupgradeneeded = function(e) {
            const db = e.target.result;
            return db.createObjectStore(OBJECT_STORE_NAME, {
                "keyPath": "id",
                "autoIncrement": true
            });
        };
        
        open.onsuccess = function(e) {
            return resolve(e.target.result);
        };
        
        // Show error message when open data fails
        open.onerror = function(e) {
            return reject("Error opening IndexedDB: " + e.target.errorCode);
        };
    });
}

// System to add data to IndexedDB
async function addDataToDB(key, value) {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    store.put({ "id": key, "value": value }); // Put data with type Object
    
    return new Promise((resolve) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => console.error("Error adding data: ", e.target.error);
    });
}

async function addDataToDBNoOverwrite(key, newData) {
    // Retrieve old data from IndexedDB
    const existingData = await getDataFromDB(key) || [];
    
    // Make sure existingData is an array
    const updatedData = Array.isArray(existingData) ? existingData : [];
    
    // Add new data to array
    return updatedData.push(newData);
    
    // Save the updated data again
    await addDataToDB(key, updatedData);  
}

// System to get data from IndexedDB by key
async function getDataFromDB(key) {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readonly");
    const store = transaction.objectStore(OBJECT_STORE_NAME);
 
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = (e) => reject("Error getting data: " + e.target.error);
    });
}

// System to clear all data from IndexedDB
async function clearDB() {
    const db = await openDB();
    const transaction = db.transaction([OBJECT_STORE_NAME], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    store.clear(); // Clean all data stored in indexDB, type automatically when executed
    
    return new Promise((resolve) => {
        transaction.oncomplete = () => {
            console.log("Remove success: Data stored in 'indexDB' is permanently deleted.")
            return resolve();
        };
        
        transaction.onerror = (e) => {
            console.error("Error clearing data: ", e.target.error);
        };
    });
}
