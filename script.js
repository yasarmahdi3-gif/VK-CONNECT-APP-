
/* =====================================
   VK CONNECT - CLEAN APPLICATION
===================================== */

const SUPABASE_URL = "https://vuknoitixjlrolmprzwo.supabase.co";
const SUPABASE_KEY = "sb_publishable_5duqz0ik84vZw55EP8fp6A_i3Ak3-Wh";

let db = null;
let currentUser = null;
let currentProfile = null;

const $ = (id) => document.getElementById(id);

function notify(text) {
  const box = $("notification");
  if (!box) {
    alert(text);
    return;
  }

  box.textContent = text;
  box.classList.remove("hidden");

  setTimeout(() => box.classList.add("hidden"), 3000);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  $("app-screen")?.classList.add("hidden");
  $(id)?.classList.remove("hidden");
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
    page.classList.remove("active");
  });

  $(id)?.classList.remove("hidden");
  $(id)?.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === id);
  });

  if (id === "chats-page") loadPeople();
  if (id === "status-page") loadStatuses();
  if (id === "communities-page") loadCommunities();
  if (id === "discover-page") loadDiscover();
}

function showApp() {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  $("app-screen")?.classList.remove("hidden");
  showPage("chats-page");
  loadProfile();
}

function closeApp() {
  $("app-screen")?.classList.add("hidden");
  showScreen("welcome-screen");
}

async function loadSupabase() {
  if (window.supabase) return window.supabase;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window.supabase;
}

async function connectDatabase() {
  const library = await loadSupabase();

  db = library.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
}

// =====================================
// REGISTRATION
// =====================================

$("register-form")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!db) {
    notify("Please wait. Connecting...");
    return;
  }

  const name = $("register-name").value.trim();
  const username = $("register-username").value.trim();
  const email = $("register-email").value.trim();
  const password = $("register-password").value;

  if (!name || !username || !email || !password) {
    notify("Please complete all fields.");
    return;
  }

  if (password.length < 8) {
    notify("Password must contain at least 8 characters.");
    return;
  }

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: username
        }
      }
    });

    if (error) throw error;

    $("register-form").reset();

    if (data.session) {
      currentUser = data.user;
      await saveNewProfile(name, username);
      showApp();
      notify("Welcome to VK CONNECT!");
    } else {
      showScreen("login-screen");
      notify("Account created. Check your email if verification is required.");
    }

  } catch (error) {
    notify(error.message);
  }
});

// =====================================
// LOGIN
// =====================================

$("login-form")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!db) {
    notify("Please wait. Connecting...");
    return;
  }

  const email = $("login-email").value.trim();
  const password = $("login-password").value;

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;

    $("login-form").reset();

    showApp();
    notify("Welcome back to VK CONNECT!");

  } catch (error) {
    notify(error.message);
  }
});

// =====================================
// PROFILE
// =====================================

async function saveNewProfile(name, username) {
  const { error } = await db.from("profiles").upsert({
    id: currentUser.id,
    display_name: name,
    bio: "Welcome to VK CONNECT!",
    language: "en"
  });

  if (error) throw error;
}

async function loadProfile() {
  if (!currentUser || !db) return;

  try {
    let { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      await saveNewProfile(
        currentUser.user_metadata?.full_name || "VK CONNECT User",
        currentUser.user_metadata?.username || ""
      );

      const result = await db
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (result.error) throw result.error;
      data = result.data;
    }

    currentProfile = data;

    if ($("profile-name")) {
      $("profile-name").textContent = data.display_name || "VK CONNECT User";
    }

    if ($("profile-username")) {
      $("profile-username").textContent =
        "@" + (currentUser.user_metadata?.username || "member");
    }

    if ($("profile-bio")) {
      $("profile-bio").textContent = data.bio || "";
    }

  } catch (error) {
    notify("Profile error: " + error.message);
  }
}

$("edit-profile-button")?.addEventListener("click", async () => {
  if (!currentUser || !db) return;

  const oldBio = currentProfile?.bio || "";
  const newBio = prompt("Enter your new bio:", oldBio);

  if (newBio === null) return;

  const { error } = await db
    .from("profiles")
    .update({ bio: newBio.trim() })
    .eq("id", currentUser.id);

  if (error) {
    notify(error.message);
    return;
  }

  await loadProfile();
  notify("Profile updated!");
});

// =====================================
// LOAD PEOPLE
// =====================================

async function loadPeople() {
  if (!currentUser || !db) return;

  const list = $("chat-list");
  if (!list) return;

  const { data, error } = await db
    .from("profiles")
    .select("id, display_name, bio")
    .neq("id", currentUser.id)
    .order("display_name");

  if (error) {
    list.textContent = error.message;
    return;
  }

  list.innerHTML = "";

  if (!data.length) {
    list.textContent = "No other members yet. Invite friends to VK CONNECT!";
    return;
  }

  data.forEach(person => {
    const item = document.createElement("div");
    item.className = "empty-state";
    item.textContent = person.display_name || "VK CONNECT Member";
    list.appendChild(item);
  });
}

// =====================================
// DISCOVER PEOPLE
// =====================================

async function loadDiscover() {
  if (!currentUser || !db) return;

  const list = $("post-feed");
  if (!list) return;

  const { data, error } = await db
    .from("profiles")
    .select("display_name, bio")
    .neq("id", currentUser.id)
    .order("display_name");

  if (error) {
    list.textContent = error.message;
    return;
  }

  list.innerHTML = "";

  if (!data.length) {
    list.textContent = "No members to discover yet.";
    return;
  }

  data.forEach(person => {
    const item = document.createElement("div");
    item.className = "empty-state";

    const heading = document.createElement("h3");
    heading.textContent = person.display_name || "VK Member";

    const paragraph = document.createElement("p");
    paragraph.textContent = person.bio || "";

    item.append(heading, paragraph);
    list.appendChild(item);
  });
}

// =====================================
// STATUS
// =====================================

async function loadStatuses() {
  if (!db) return;

  const list = $("status-list");
  if (!list) return;

  const { data, error } = await db
    .from("statuses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = error.message;
    return;
  }

  list.innerHTML = "";

  if (!data.length) {
    list.textContent = "No status updates yet.";
    return;
  }

  data.forEach(status => {
    const item = document.createElement("div");
    item.className = "empty-state";
    item.textContent = status.body || "";
    list.appendChild(item);
  });
}

$("add-status-button")?.addEventListener("click", async () => {
  if (!currentUser || !db) return;

  const body = prompt("What would you like to share?");
  if (!body?.trim()) return;

  const { error } = await db.from("statuses").insert({
    user_id: currentUser.id,
    body: body.trim()
  });

  if (error) {
    notify(error.message);
    return;
  }

  notify("Status posted!");
  loadStatuses();
});

// =====================================
// COMMUNITIES
// =====================================

async function loadCommunities() {
  if (!db) return;

  const list = $("community-list");
  if (!list) return;

  const { data, error } = await db
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = error.message;
    return;
  }

  list.innerHTML = "";

  if (!data.length) {
    list.textContent = "No communities yet.";
    return;
  }

  data.forEach(community => {
    const item = document.createElement("div");
    item.className = "empty-state";
    item.textContent = community.name;
    list.appendChild(item);
  });
}

$("create-community-button")?.addEventListener("click", async () => {
  if (!currentUser || !db) return;

  const name = prompt("Enter a community name:");
  if (!name?.trim()) return;

  const { error } = await db.from("communities").insert({
    name: name.trim(),
    created_by: currentUser.id
  });

  if (error) {
    notify(error.message);
    return;
  }

  notify("Community created!");
  loadCommunities();
});

// =====================================
// NAVIGATION
// =====================================

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

$("header-profile")?.addEventListener("click", () => {
  showPage("profile-page");
});

$("new-chat-button")?.addEventListener("click", () => {
  showPage("discover-page");
});

$("voice-call-button")?.addEventListener("click", () => {
  notify("Voice calling will be added in a later update.");
});

$("video-call-button")?.addEventListener("click", () => {
  notify("Video calling will be added in a later update.");
});

$("create-post-button")?.addEventListener("click", () => {
  notify("Post publishing will be added in a later update.");
});

// =====================================
// SEARCH
// =====================================

$("search-button")?.addEventListener("click", () => {
  $("search-area")?.classList.toggle("hidden");
});

$("global-search")?.addEventListener("input", event => {
  const query = event.target.value.toLowerCase();

  document.querySelectorAll(".page").forEach(page => {
    page.querySelectorAll("h2, h3, p, div").forEach(item => {
      item.style.display =
        !query || item.textContent.toLowerCase().includes(query)
          ? ""
          : "none";
    });
  });
});

// =====================================
// DARK MODE
// =====================================

const savedTheme = localStorage.getItem("vk_theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  if ($("theme-button")) $("theme-button").textContent = "☀️";
}

$("theme-button")?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const dark = document.body.classList.contains("dark-mode");

  localStorage.setItem("vk_theme", dark ? "dark" : "light");
  $("theme-button").textContent = dark ? "☀️" : "🌙";
});

// =====================================
// LOGOUT
// =====================================

async function logout() {
  if (!db) return;

  const { error } = await db.auth.signOut();

  if (error) {
    notify(error.message);
    return;
  }

  currentUser = null;
  currentProfile = null;

  closeApp();
  notify("You have signed out.");
}

$("logout-button")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    logout();
  }
});

// =====================================
// WELCOME SCREEN BUTTONS
// =====================================

$("show-login")?.addEventListener("click", () => {
  showScreen("login-screen");
});

$("show-register")?.addEventListener("click", () => {
  showScreen("register-screen");
});

$("back-welcome")?.addEventListener("click", event => {
  event.preventDefault();
  showScreen("welcome-screen");
});

$("register-back")?.addEventListener("click", event => {
  event.preventDefault();
  showScreen("welcome-screen");
});

$("go-register")?.addEventListener("click", event => {
  event.preventDefault();
  showScreen("register-screen");
});

$("go-login")?.addEventListener("click", event => {
  event.preventDefault();
  showScreen("login-screen");
});

// =====================================
// START APPLICATION
// =====================================

async function startApp() {
  try {
    await connectDatabase();

    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    if (data.session) {
      currentUser = data.session.user;
      showApp();
    } else {
      showScreen("welcome-screen");
    }

  } catch (error) {
    console.error("VK CONNECT error:", error);
    showScreen("welcome-screen");
    notify("Connection error: " + error.message);
  }

  $("loading-screen")?.classList.add("hidden");
}

startApp();
 
