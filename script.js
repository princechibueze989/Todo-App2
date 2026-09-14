const taskList = document.getElementById("taskList");
const taskDialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const notesInput = document.getElementById("notesInput");
const dueDateInput = document.getElementById("dueDateInput");
const priorityInput = document.getElementById("priorityInput");
const categoryInput = document.getElementById("categoryInput");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const taskCount = document.getElementById("taskCount");
const dialogTitle = document.getElementById("dialogTitle");
let tasks = JSON.parse(localStorage.getItem("todoTasks") || "[]");
let currentFilter = "all";
let editingId = null;

document.getElementById("dateLabel").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date());

function displayTasks() {
    taskList.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = `${task.text} ${task.notes || ""} ${task.category}`.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === "all" || (currentFilter === "completed" ? task.completed : !task.completed);
        return matchesSearch && matchesFilter;
    }).sort((first, second) => Number(first.completed) - Number(second.completed));

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task ${task.completed ? "completed" : ""} priority-${task.priority}`;
        const content = document.createElement("div");
        content.className = "task-content";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleTask(task.id));
        const details = document.createElement("span");
        details.className = "task-details";
        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;
        const meta = document.createElement("small");
        meta.textContent = `${task.category}${task.dueDate ? ` · ${formatDueDate(task.dueDate)}` : ""}`;
        details.append(text, meta);
        content.append(checkbox, details);
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";
        deleteButton.addEventListener("click", () => deleteTask(task.id));
        li.addEventListener("dblclick", () => openEditor(task));
        li.append(content, deleteButton);
        taskList.appendChild(li);
    });
    taskCount.textContent = tasks.filter(task => !task.completed).length;
    emptyMessage.hidden = filteredTasks.length !== 0;
}

function formatDueDate(value) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function saveTasks() { localStorage.setItem("todoTasks", JSON.stringify(tasks)); }
function toggleTask(id) { tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task); saveTasks(); displayTasks(); }
function deleteTask(id) { tasks = tasks.filter(task => task.id !== id); saveTasks(); displayTasks(); }
function openEditor(task = null) {
    editingId = task?.id || null;
    dialogTitle.textContent = task ? "Edit task" : "Add task";
    taskForm.reset();
    if (task) { taskInput.value = task.text; notesInput.value = task.notes || ""; dueDateInput.value = task.dueDate || ""; priorityInput.value = task.priority || "medium"; categoryInput.value = task.category || "Personal"; }
    taskDialog.showModal();
    taskInput.focus();
}

document.getElementById("addBtn").addEventListener("click", () => openEditor());
document.getElementById("closeDialog").addEventListener("click", () => taskDialog.close());
taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const values = { text: taskInput.value.trim(), notes: notesInput.value.trim(), dueDate: dueDateInput.value, priority: priorityInput.value, category: categoryInput.value };
    if (editingId) tasks = tasks.map(task => task.id === editingId ? { ...task, ...values } : task);
    else tasks.push({ id: Date.now(), completed: false, ...values });
    saveTasks();
    displayTasks();
    taskDialog.close();
});
searchInput.addEventListener("input", displayTasks);
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    displayTasks();
}));
document.getElementById("clearBtn").addEventListener("click", () => { tasks = tasks.filter(task => !task.completed); saveTasks(); displayTasks(); });
document.getElementById("themeBtn").addEventListener("click", () => { document.body.classList.toggle("dark"); localStorage.setItem("todoTheme", document.body.classList.contains("dark") ? "dark" : "light"); });
if (localStorage.getItem("todoTheme") === "dark") document.body.classList.add("dark");
displayTasks();
