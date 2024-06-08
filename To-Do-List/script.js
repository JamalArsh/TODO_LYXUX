document.addEventListener("DOMContentLoaded", () => {
  const taskList = {
    "to-do": document.getElementById("to-do-task"),
    "in-progress": document.getElementById("in-progress-task"),
    "in-review": document.getElementById("in-review-task"),
    done: document.getElementById("done-task"),
  };

  const popupForm = document.getElementById("popup");
  const taskTitleInput = document.getElementById("task-title");
  const taskDescriptionInput = document.getElementById("task-description");
  const taskPriorityInput = document.getElementById("task-priority");
  const addTaskFromButton = document.getElementById("add");
  const editTaskButton = document.getElementById("update");
  const cancel = document.getElementById("cancel");
  const close = document.getElementById("close");

  const registerButton = document.getElementById("register");
  const loginButton = document.getElementById("login");
  const logoutButton = document.getElementById("logout");
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");

  const addTaskButton = document.getElementById("add-to-do");
  const addInProgressButton = document.getElementById("add-in-progress");
  const addInReviewButton = document.getElementById("add-in-review");
  const addDoneButton = document.getElementById("add-done");

  const authContainer = document.getElementById("auth-container");
  const userContainer = document.getElementById("user-container");
  const logoutContainer = document.getElementById("logout-container");

  const closePopupButton = document.getElementById("close-popup");
  const popupAlert = document.getElementById("popup-alert");
  const popupTitle = document.getElementById("popup-title");
  const popupDescription = document.getElementById("popup-description");
  const username = document.getElementById("username");

  let token = localStorage.getItem("token");

  logoutButton.addEventListener("click", logout);

  addTaskButton.addEventListener("click", () => openPopupForm("to-do"));
  addInProgressButton.addEventListener("click", () =>
    openPopupForm("in-progress")
  );
  addInReviewButton.addEventListener("click", () => openPopupForm("in-review"));
  addDoneButton.addEventListener("click", () => openPopupForm("done"));

  addTaskFromButton.addEventListener("click", () =>
    addTask(popupForm.dataset.status)
  );

  registerButton.addEventListener("click", register);
  loginButton.addEventListener("click", login);
  closePopupButton.addEventListener("click", () => {
    popupAlert.style.display = "none";
  });

  editTaskButton.addEventListener("click", updateTask);

  // this function will be called when the page loads
  isUserLoggedIn();

  const openPopupForm = (status) => {
    popupForm.style.display = "flex";
    popupForm.dataset.status = status;
  };

  const closePopupForm = () => {
    popupForm.style.display = "none";
    taskTitleInput.value = "";
    taskDescriptionInput.value = "";
    taskPriorityInput.value = "low";
    editTaskButton.style.display = "none";
    addTaskFromButton.style.display = "block";
  };

  close.addEventListener("click", closePopupForm);
  cancel.addEventListener("click", closePopupForm);

  function isUserLoggedIn() {
    if (token) {
      fetchTasks();
      authContainer.style.display = "none";
      userContainer.style.display = "flex";
      logoutContainer.style.display = "flex";

      username.innerText = getUserDetails().username;
    } else {
      authContainer.style.display = "flex";
      userContainer.style.display = "none";
      logoutContainer.style.display = "none";
    }
  }

  function fetchTasks() {
    if (!token) return;

    const userId = getUserDetails().userId;

    fetch("http://localhost:5000/api/tasks?userId=" + userId, {
      method: "get",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((tasks) => {
        Object.keys(taskList).forEach((column) => {
          taskList[column].innerHTML = "";
        });
        tasks.forEach((task) => {
          addTaskToDOM(task);
        });
      });
  }

  function addTask(status) {
    const titleInput = taskTitleInput;
    const descriptionInput = taskDescriptionInput;
    const priorityInput = taskPriorityInput;

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value.trim();

    if (title === "" || description === "") {
      openPopup("Error", "Please enter both a title and a description.");
      return;
    }

    const userId = getUserDetails().userId;

    fetch("http://localhost:5000/api/tasks/save?userId=" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        title,
        description,
        status,
        priority,
        isCompleted: false,
      }),
    }).then((task) => {
      fetchTasks();
      titleInput.value = "";
      descriptionInput.value = "";

      closePopupForm();
    });
  }

  function addTaskToDOM(task) {
    const column = taskList[task.status];

    if (!column) return;

    const item = document.createElement("div");
    item.className = "board-item " + task.priority;
    item.innerHTML = `
          <button class="delete" onclick="deleteTask('${task._id}')" 
          >X</button>
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <span class="date">${new Date(task.date).toLocaleDateString()}</span>
          <button class="edit" onclick="editTask(
            '${task._id}', '${task.title}', '${task.description}', '${
      task.priority
    }', '${task.status}')"><img src="./edit.png"/>
          </button>
      `;

    column.appendChild(item);
  }

  window.deleteTask = function (taskId) {
    confirm("Are you sure you want to delete this task?") &&
      deleteTaskFromAPI(taskId);
  };

  function deleteTaskFromAPI(taskId) {
    const userId = getUserDetails().userId;

    fetch("http://localhost:5000/api/tasks/delete?userId=" + userId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ _id: taskId }),
    }).then(() => {
      openPopup("Success", "Task deleted successfully.", "green");
      fetchTasks();
    });
  }

  window.editTask = function (taskId, title, description, priority, status) {
    taskTitleInput.value = title;
    taskDescriptionInput.value = description;
    taskPriorityInput.value = priority;
    popupForm.dataset.taskId = taskId;
    popupForm.dataset.status = status;
    editTaskButton.style.display = "block";
    addTaskFromButton.style.display = "none";
    popupForm.style.display = "flex";
  };

  function updateTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const priority = taskPriorityInput.value.trim();
    const status = popupForm.dataset.status;
    const taskId = popupForm.dataset.taskId;

    if (title === "" || description === "") {
      openPopup("Error", "Please enter both a title and a description.");
      return;
    }

    const userId = getUserDetails().userId;

    fetch("http://localhost:5000/api/tasks/update?userId=" + userId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        _id: taskId,
        title,
        description,
        priority,
        status,
      }),
    }).then(() => {
      openPopup("Success", "Task updated successfully.", "green");
      fetchTasks();
      closePopupForm();
    });
  }

  function register() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (username === "" || password === "") {
      openPopup("Error", "Please enter both a username and a password.");
      return;
    }

    fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      if (response.status === 201) {
        openPopup(
          "Success",
          "User registered successfully. Please log in.",
          "green"
        );
      } else {
        openPopup("Error", "Registration failed. Please try again.");
      }
    });
  }

  function login() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (username === "" || password === "") {
      openPopup("Error", "Please enter both a username and a password.");

      return;
    }

    fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          token = `Bearer ${data.token}`;
          fetchTasks();
          isUserLoggedIn();
        } else {
          openPopup("Error", "Login failed. Please check your credentials.");
        }
      });
  }

  function logout() {
    localStorage.removeItem("token");
    token = null;
    isUserLoggedIn();
    clearTasks();
  }

  function clearTasks() {
    Object.keys(taskList).forEach((column) => {
      taskList[column].innerHTML = "";
    });
  }

  function getUserDetails() {
    try {
      if (!token) {
        return null;
      }

      const base64Url = token.split(".")[1];

      if (!base64Url) {
        return null;
      }

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedData = JSON.parse(atob(base64));

      return decodedData;
    } catch (error) {
      return null;
    }
  }

  function openPopup(
    title = "Error",
    description = "An error occurred. Please try again.",
    color = "red"
  ) {
    popupTitle.innerText = title;
    popupDescription.innerText = description;
    popupAlert.style.display = "flex";
    popupTitle.style.color = color;
  }
});
