/* ---------- STORAGE KEYS ---------- */
const STORAGE_KEYS = {
  todos: "pph_todos",
  notes: "pph_notes",
  links: "pph_links",
  images: "pph_images",
  theme: "pph_theme",
  activeTab: "pph_active_tab",
  avatar: "pph_avatar"
};

/* ---------- STATE ---------- */
let todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.todos)) || [];
let notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.notes)) || [];
let links = JSON.parse(localStorage.getItem(STORAGE_KEYS.links)) || [];
let images = JSON.parse(localStorage.getItem(STORAGE_KEYS.images)) || [];
let editNoteId = null;

/* ---------- SAVE HELPERS ---------- */
function saveTodos() {
  localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

function saveImages() {
  localStorage.setItem(STORAGE_KEYS.images, JSON.stringify(images));
}

/* ---------- AVATAR ---------- */
const DEFAULT_AVATAR_URL = "https://th.bing.com/th/id/OIP.ZLBpRk7WpBBVqHclmK8ndwHaH_?w=165&h=189&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3";

function setAvatar(url) {
  const avatarImg = document.getElementById("avatarImage");
  const avatarText = document.querySelector(".avatar-text");
  
  if (url && url.trim()) {
    avatarImg.src = url;
    avatarImg.style.display = "block";
    avatarText.style.display = "none";
    localStorage.setItem(STORAGE_KEYS.avatar, url);
  } else {
    // Use default avatar
    avatarImg.src = DEFAULT_AVATAR_URL;
    avatarImg.style.display = "block";
    avatarText.style.display = "none";
    localStorage.removeItem(STORAGE_KEYS.avatar);
  }
}

function loadAvatar() {
  const savedAvatar = localStorage.getItem(STORAGE_KEYS.avatar);
  if (savedAvatar) {
    setAvatar(savedAvatar);
  } else {
    // Load default avatar if no custom avatar is saved
    setAvatar(DEFAULT_AVATAR_URL);
  }
}

/* ---------- THEME + ACTIVE TAB ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById("themeToggle");

  // Load avatar
  loadAvatar();
  
  // Allow clicking avatar to change it
  const avatar = document.getElementById("avatar");
  if (avatar) {
    avatar.style.cursor = "pointer";
    avatar.onclick = () => {
      const url = prompt("Enter avatar image URL (or leave empty to reset to default):");
      if (url !== null) {
        if (url.trim() === "") {
          // Reset to default
          setAvatar("");
        } else {
          setAvatar(url);
        }
      }
    };
  }

  // Restore theme
  if (toggle) {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

    if (savedTheme === "light") {
      document.body.classList.add("light");
      toggle.textContent = "🌙";
    } else {
      toggle.textContent = "☀";
    }

    toggle.onclick = () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      toggle.textContent = isLight ? "🌙" : "☀";
      localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
    };
  }

  // Restore last active tab
  const savedTab = localStorage.getItem(STORAGE_KEYS.activeTab);
  if (savedTab) {
    const btn = document.querySelector(`.tabs .tab[onclick*="'${savedTab}'"]`);
    if (btn) {
      setActiveTab(btn, savedTab);
    }
  }
});

function setActiveTab(button, tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  if (button) button.classList.add('active');
  const content = document.getElementById(tabName);
  if (content) content.classList.add('active');

  localStorage.setItem(STORAGE_KEYS.activeTab, tabName);
}

function openTab(event, tabName) {
  setActiveTab(event.currentTarget, tabName);
}

/* ---------- TODOS ---------- */
function addTodo() {
  const input = document.getElementById("todoInput");
  if (!input.value.trim()) return;

  todos.push({ id: Date.now(), text: input.value });
  input.value = "";
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  const ul = document.getElementById("todoList");
  ul.innerHTML = "";

  todos.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${t.text}
      <button onclick="deleteTodo(${t.id})">🗑</button>
    `;
    ul.appendChild(li);
  });

  const emptyMsg = document.querySelector("#todos .empty");
  if (emptyMsg) {
    emptyMsg.style.display = todos.length ? "none" : "block";
  }
}

/* ---------- NOTES ---------- */
function addNote() {
  const title = noteTitle.value;
  const content = noteContent.value;
  if (!title && !content) return;

  if (editNoteId) {
    notes = notes.map(n =>
      n.id === editNoteId ? { ...n, title, content } : n
    );
    editNoteId = null;
  } else {
    notes.push({ id: Date.now(), title, content });
  }

  noteTitle.value = "";
  noteContent.value = "";
  saveNotes();
  renderNotes();
}

function editNote(id) {
  const n = notes.find(n => n.id === id);
  noteTitle.value = n.title;
  noteContent.value = n.content;
  editNoteId = id;
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

function renderNotes() {
  notesList.innerHTML = "";
  notes.forEach(n => {
    notesList.innerHTML += `
      <div class="project">
        <strong>${n.title || "Untitled"}</strong>
        <p>${n.content}</p>
        <button onclick="editNote(${n.id})">✏</button>
        <button onclick="deleteNote(${n.id})">🗑</button>
      </div>
    `;
  });

  const emptyMsg = document.querySelector("#notes .empty");
  if (emptyMsg) {
    emptyMsg.style.display = notes.length ? "none" : "block";
  }
}

/* ---------- LINKS ---------- */
function addLink() {
  if (!linkUrl.value) return;

  links.push({
    id: Date.now(),
    title: linkTitle.value || linkUrl.value,
    url: linkUrl.value
  });

  linkTitle.value = "";
  linkUrl.value = "";
  saveLinks();
  renderLinks();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function renderLinks() {
  linksList.innerHTML = "";
  links.forEach(l => {
    linksList.innerHTML += `
      <li>
        <a href="${l.url}" target="_blank">${l.title}</a>
        <button onclick="deleteLink(${l.id})">🗑</button>
      </li>
    `;
  });

  const emptyMsg = document.querySelector("#links .empty");
  if (emptyMsg) {
    emptyMsg.style.display = links.length ? "none" : "block";
  }
}

/* ---------- IMAGES ---------- */
function addImage() {
  if (!imageUrl.value) return;

  images.push({
    id: Date.now(),
    url: imageUrl.value,
    caption: imageCaption.value
  });

  imageUrl.value = "";
  imageCaption.value = "";
  saveImages();
  renderImages();
}

function deleteImage(id) {
  images = images.filter(img => img.id !== id);
  saveImages();
  renderImages();
}

function renderImages() {
  imageGrid.innerHTML = "";
  images.forEach(img => {
    imageGrid.innerHTML += `
      <div class="image-item">
        <img src="${img.url}" alt="${img.caption || 'Image'}">
        <div class="image-meta">
          <small>${img.caption || ""}</small>
          <button onclick="deleteImage(${img.id})">🗑</button>
        </div>
      </div>
    `;
  });

  const emptyMsg = document.querySelector("#images .empty");
  if (emptyMsg) {
    emptyMsg.style.display = images.length ? "none" : "block";
  }
}

/* ---------- INITIAL RENDER ---------- */
renderTodos();
renderNotes();
renderLinks();

renderImages();

