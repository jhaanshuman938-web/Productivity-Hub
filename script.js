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

/* ---------- DOM ELEMENTS ---------- */
let noteTitle, noteContent, linkTitle, linkUrl, imageUrl, imageCaption;

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
const DEFAULT_AVATAR_URL = "https://static.vecteezy.com/system/resources/thumbnails/049/328/543/small_2x/face-icon-logo-flat-vector.jpg";

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
  // Initialize DOM element references
  noteTitle = document.getElementById("noteTitle");
  noteContent = document.getElementById("noteContent");
  linkTitle = document.getElementById("linkTitle");
  linkUrl = document.getElementById("linkUrl");
  imageUrl = document.getElementById("imageUrl");
  imageCaption = document.getElementById("imageCaption");

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

  // Restore theme (previous gradient/light theme)
  if (toggle) {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const isLight = savedTheme === "light";

    document.body.classList.toggle("light", isLight);
    toggle.textContent = isLight ? "dark_mode" : "light_mode";

    toggle.onclick = () => {
      const nowLight = !document.body.classList.contains("light");
      document.body.classList.toggle("light", nowLight);
      toggle.textContent = nowLight ? "dark_mode" : "light_mode";
      localStorage.setItem(STORAGE_KEYS.theme, nowLight ? "light" : "dark");
    };
  }

  // Restore last active tab
  const savedTab = localStorage.getItem(STORAGE_KEYS.activeTab);
  if (savedTab) {
    const btn = document.querySelector(`.mdc-tab[onclick*="'${savedTab}'"]`);
    if (btn) {
      setActiveTab(btn, savedTab);
    }
  }
});

function setActiveTab(button, tabName) {
  document.querySelectorAll('.mdc-tab').forEach(t => {
    t.classList.remove('mdc-tab--active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  if (button) {
    button.classList.add('mdc-tab--active');
    button.setAttribute('aria-selected', 'true');
  }
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
  if (!input || !input.value.trim()) return;

  todos.push({ id: Date.now(), text: input.value.trim(), completed: false });
  input.value = "";
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  const ul = document.getElementById("todoList");
  if (!ul) return;

  ul.innerHTML = "";

  todos.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <input type="checkbox" onchange="toggleTodo(${t.id})" ${t.completed ? "checked" : ""} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--md-sys-color-primary);">
        <span class="${t.completed ? "todo-completed" : ""}" style="font-size: 16px;">${escapeHtml(t.text)}</span>
      </div>
      <button onclick="deleteTodo(${t.id})" aria-label="Delete todo">🗑</button>
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
  if (!noteTitle || !noteContent) return;

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
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
  const notesList = document.getElementById("notesList");
  if (!notesList) return;

  notesList.innerHTML = "";
  notes.forEach(n => {
    const noteDiv = document.createElement("div");
    noteDiv.className = "mdc-card project-card";
    noteDiv.innerHTML = `
      <strong class="title-medium">${escapeHtml(n.title || "Untitled")}</strong>
      <p class="body-medium">${escapeHtml(n.content).replace(/\n/g, '<br>')}</p>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="mdc-button mdc-button--outlined" onclick="editNote(${n.id})" aria-label="Edit note">✏ Edit</button>
        <button class="mdc-button mdc-button--outlined" onclick="deleteNote(${n.id})" aria-label="Delete note">🗑 Delete</button>
      </div>
    `;
    notesList.appendChild(noteDiv);
  });

  const emptyMsg = document.querySelector("#notes .empty");
  if (emptyMsg) {
    emptyMsg.style.display = notes.length ? "none" : "block";
  }
}

/* ---------- LINKS ---------- */
function addLink() {
  if (!linkUrl || !linkUrl.value.trim()) return;

  links.push({
    id: Date.now(),
    title: (linkTitle && linkTitle.value.trim()) || linkUrl.value.trim(),
    url: linkUrl.value.trim()
  });

  if (linkTitle) linkTitle.value = "";
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
  const linksList = document.getElementById("linksList");
  if (!linksList) return;

  linksList.innerHTML = "";
  links.forEach(l => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.title)}</a>
      <button onclick="deleteLink(${l.id})" aria-label="Delete link">🗑</button>
    `;
    linksList.appendChild(li);
  });

  const emptyMsg = document.querySelector("#links .empty");
  if (emptyMsg) {
    emptyMsg.style.display = links.length ? "none" : "block";
  }
}

/* ---------- IMAGES ---------- */
function addImage() {
  if (!imageUrl || !imageUrl.value.trim()) return;

  images.push({
    id: Date.now(),
    url: imageUrl.value.trim(),
    caption: (imageCaption && imageCaption.value.trim()) || ""
  });

  imageUrl.value = "";
  if (imageCaption) imageCaption.value = "";
  saveImages();
  renderImages();
}

function deleteImage(id) {
  images = images.filter(img => img.id !== id);
  saveImages();
  renderImages();
}

function renderImages() {
  const imageGrid = document.getElementById("imageGrid");
  if (!imageGrid) return;

  imageGrid.innerHTML = "";
  images.forEach(img => {
    const imageDiv = document.createElement("div");
    imageDiv.className = "image-item";
    imageDiv.innerHTML = `
      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || 'Image')}" loading="lazy" onerror="this.parentElement.style.display='none'">
      <div class="image-meta">
        <small>${escapeHtml(img.caption || "")}</small>
        <button onclick="deleteImage(${img.id})" aria-label="Delete image">🗑</button>
      </div>
    `;
    imageGrid.appendChild(imageDiv);
  });

  const emptyMsg = document.querySelector("#images .empty");
  if (emptyMsg) {
    emptyMsg.style.display = images.length ? "none" : "block";
  }
}

/* ---------- UTILITY FUNCTIONS ---------- */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- INITIAL RENDER ---------- */
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    renderNotes();
    renderLinks();
    renderImages();
  });
} else {
  renderTodos();
  renderNotes();
  renderLinks();
  renderImages();
}
