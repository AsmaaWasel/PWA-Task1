document.addEventListener('DOMContentLoaded', function() {
    // Check for service worker support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    }
  });
  
  var db;
  
  // Open or create the IndexedDB database
  var request = indexedDB.open("ToDoListDB", 1);
  
  request.onerror = function(event) {
    console.error("Error opening IndexedDB:", event.target.errorCode);
  };
  
  request.onsuccess = function(event) {
    db = event.target.result;
    loadTasks();
  };
  
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
  
    // Create an object store (table) to store tasks
    var objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
  
    // Create an index to search tasks by text
    objectStore.createIndex("text", "text", { unique: false });
  };
  
  function addTask() {
    var taskInput = document.getElementById("taskInput");
    var taskText = taskInput.value.trim();
  
    if (taskText !== "") {
      var transaction = db.transaction(["tasks"], "readwrite");
      var objectStore = transaction.objectStore("tasks");
  
      // Add the new task to the object store
      var request = objectStore.add({ text: taskText });
  
      request.onsuccess = function(event) {
        console.log("Task added to IndexedDB");
        // Refresh the task list after adding a new task
        loadTasks();
      };
  
      request.onerror = function(event) {
        console.error("Error adding task to IndexedDB:", event.target.errorCode);
      };
  
      // Clear the input field after adding the task
      taskInput.value = "";
    }
  }
  
  function loadTasks() {
    var tasksList = document.getElementById("tasksList");
    tasksList.innerHTML = ""; // Clear existing tasks
  
    var transaction = db.transaction(["tasks"], "readonly");
    var objectStore = transaction.objectStore("tasks");
  
    // Get all tasks from the object store
    var request = objectStore.openCursor();
  
    request.onsuccess = function(event) {
      var cursor = event.target.result;
  
      if (cursor) {
        // Add each task to the tasksList
        var li = document.createElement("li");
        li.innerHTML = cursor.value.text + '<button class="deleteBtn" onclick="deleteTask(' + cursor.value.id + ')">Delete</button>';
        tasksList.appendChild(li);
        cursor.continue();
      }
    };
  
    request.onerror = function(event) {
      console.error("Error loading tasks from IndexedDB:", event.target.errorCode);
    };
  }
  
  function deleteTask(taskId) {
    var transaction = db.transaction(["tasks"], "readwrite");
    var objectStore = transaction.objectStore("tasks");
  
    // Delete the task with the given ID from the object store
    var request = objectStore.delete(taskId);
  
    request.onsuccess = function(event) {
      console.log("Task deleted from IndexedDB");
      // Refresh the task list after deleting a task
      loadTasks();
    };
  
    request.onerror = function(event) {
      console.error("Error deleting task from IndexedDB:", event.target.errorCode);
    };
  }
  