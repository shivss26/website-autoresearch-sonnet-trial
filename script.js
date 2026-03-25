// ANTI-PATTERN: This entire file is render-blocking (loaded synchronously in <head>)
// The browser must download, parse, and execute this BEFORE it can render ANY HTML.
// Most of this code is unused — it's for a dashboard app that doesn't exist on this page.

// ANTI-PATTERN: Console errors — referencing things that don't exist
console.log("Initializing DevFlow v2.4.1...");
var config = window.__DEVFLOW_CONFIG || {};
var apiBase = config.apiUrl || "https://api.devflow.io/v1";

// ANTI-PATTERN: Expensive synchronous operation on load — blocking the main thread
function generateLargeDataset() {
    var data = [];
    for (var i = 0; i < 10000; i++) {
        data.push({
            id: i,
            name: "Task " + i,
            status: ["open", "in-progress", "closed"][Math.floor(Math.random() * 3)],
            priority: Math.floor(Math.random() * 5),
            assignee: "user_" + Math.floor(Math.random() * 50),
            created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ["bug", "feature", "docs", "infra"].slice(0, Math.floor(Math.random() * 3) + 1),
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(5)
        });
    }
    return data;
}

// ANTI-PATTERN: Runs immediately on parse — blocks rendering
var taskDatabase = generateLargeDataset();
console.log("Generated " + taskDatabase.length + " tasks");

// ANTI-PATTERN: Large unused functions that bloat the JS bundle

function initKanbanBoard(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var columns = ["Backlog", "To Do", "In Progress", "Review", "Done"];
    columns.forEach(function(colName) {
        var col = document.createElement("div");
        col.className = "kanban-column";
        col.innerHTML = '<div class="column-header">' + colName + ' <span>(0)</span></div>';
        container.appendChild(col);
    });

    // Drag and drop handlers
    container.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
        e.target.style.opacity = "0.5";
    });

    container.addEventListener("dragend", function(e) {
        e.target.style.opacity = "1";
    });

    container.addEventListener("dragover", function(e) {
        e.preventDefault();
        var column = e.target.closest(".kanban-column");
        if (column) column.style.background = "#e8e0f0";
    });

    container.addEventListener("dragleave", function(e) {
        var column = e.target.closest(".kanban-column");
        if (column) column.style.background = "";
    });

    container.addEventListener("drop", function(e) {
        e.preventDefault();
        var taskId = e.dataTransfer.getData("text/plain");
        var column = e.target.closest(".kanban-column");
        if (column && taskId) {
            // Move task to new column
            var task = document.querySelector('[data-task-id="' + taskId + '"]');
            if (task) column.appendChild(task);
            column.style.background = "";
        }
    });
}

function initChart(canvasId, chartData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    // Simple bar chart renderer
    var maxVal = Math.max.apply(null, chartData.values);
    var barWidth = (width - 40) / chartData.values.length;

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    chartData.values.forEach(function(val, i) {
        var barHeight = (val / maxVal) * (height - 60);
        var x = 20 + i * barWidth + barWidth * 0.1;
        var y = height - 40 - barHeight;

        ctx.fillStyle = "#764ba2";
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);

        ctx.fillStyle = "#6b7280";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(chartData.labels[i], x + barWidth * 0.4, height - 20);
    });
}

function initNotifications() {
    var panel = document.querySelector(".notification-panel");
    if (!panel) return;

    // Poll for new notifications every 30 seconds
    setInterval(function() {
        fetch(apiBase + "/notifications?unread=true")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.count > 0) {
                    document.querySelector(".notif-badge").textContent = data.count;
                    document.querySelector(".notif-badge").style.display = "block";
                }
            })
            .catch(function() { /* silently fail */ });
    }, 30000);
}

function debounce(fn, delay) {
    var timer;
    return function() {
        var args = arguments;
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}

function initSearch() {
    var input = document.querySelector(".search-bar input");
    if (!input) return;

    var search = debounce(function(query) {
        var results = taskDatabase.filter(function(task) {
            return task.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
                   task.description.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
        renderSearchResults(results.slice(0, 20));
    }, 300);

    input.addEventListener("input", function(e) {
        search(e.target.value);
    });
}

function renderSearchResults(results) {
    var container = document.querySelector(".search-results");
    if (!container) return;
    container.innerHTML = "";
    results.forEach(function(task) {
        var div = document.createElement("div");
        div.className = "search-result-item";
        div.innerHTML = '<strong>' + task.name + '</strong><br><small>' + task.status + '</small>';
        container.appendChild(div);
    });
}

function formatDate(isoString) {
    var d = new Date(isoString);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function formatRelativeTime(isoString) {
    var now = Date.now();
    var then = new Date(isoString).getTime();
    var diff = now - then;
    var minutes = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";
    if (hours < 24) return hours + "h ago";
    if (days < 7) return days + "d ago";
    return formatDate(isoString);
}

// ANTI-PATTERN: localStorage operations that may throw in restricted contexts
try {
    var savedTheme = localStorage.getItem("devflow-theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
} catch (e) {
    console.warn("localStorage not available");
}

// ANTI-PATTERN: Registering event listeners for elements that don't exist
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, initializing modules...");
    initKanbanBoard("kanban-container");
    initChart("velocity-chart", { values: [12, 19, 8, 15, 22, 18, 25], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] });
    initNotifications();
    initSearch();

    // ANTI-PATTERN: Attaching listeners to null elements (querySelector returns null)
    var themeToggle = document.querySelector("#theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function() {
            var current = document.body.getAttribute("data-theme");
            var next = current === "light" ? "dark" : "light";
            document.body.setAttribute("data-theme", next);
            localStorage.setItem("devflow-theme", next);
        });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key === "k") {
            e.preventDefault();
            var searchBar = document.querySelector(".search-bar input");
            if (searchBar) searchBar.focus();
        }
    });
});
