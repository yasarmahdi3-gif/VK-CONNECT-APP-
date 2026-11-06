
/* =====================================
   VK CONNECT - JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  // ===================================
  // LOADING SCREEN
  // ===================================

  setTimeout(() => {
    $("loading-screen")?.classList.add("hidden");

    const savedUser = localStorage.getItem("vk_user");

    if (savedUser) {
      showApp();
    } else {
      showScreen("welcome-screen");
    }
  }, 1200);


  // ===================================
  // SCREEN NAVIGATION
  // ===================================

  function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.add("hidden");
    });

    $("app-screen").classList.add("hidden");
    $(screenId)?.classList.remove("hidden");
  }


  // ===================================
  // NOTIFICATIONS
  // ===================================

  function notify(message) {
    const notification = $("notification");

    notification.textContent = message;
    notification.classList.remove("hidden");

    setTimeout(() => {
      notification.classList.add("hidden");
    }, 3000);
  }


  // ===================================
  // WELCOME BUTTONS
  // ===================================

  $("show-login").addEventListener("click", () => {
    showScreen("login-screen");
  });

  $("show-register").addEventListener("click", () => {
    showScreen("register-screen");
  });

  $("back-welcome").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("welcome-screen");
  });

  $("register-back").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("welcome-screen");
  });

  $("go-register").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("register-screen");
  });

  $("go-login").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("login-screen");
  });


  // ===================================
  // REGISTRATION DEMO
  // ===================================

  $("register-form").addEventListener("submit", (event) => {
    event.preventDefault();

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

    const user = {
      name,
      username,
      email,
      bio: "Welcome to VK CONNECT!",
      friends: 0,
      followers: 0,
      following: 0
    };

    // Demo only: do not use real passwords or credentials here.
    localStorage.setItem("vk_user", JSON.stringify(user));

    $("register-form").reset();

    showApp();
    notify("Welcome to VK CONNECT!");
  });


  // ===================================
  // LOGIN DEMO
  // ===================================

  $("login-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("login-email").value.trim().toLowerCase();
    const password = $("login-password").value;

    const savedUser = localStorage.getItem("vk_user");

    if (!savedUser) {
      notify("Please create a demo account first.");
      return;
    }

    const user = JSON.parse(savedUser);

    if (
      email !== user.email.toLowerCase() &&
      email !== user.username.toLowerCase()
    ) {
      notify("Account not found.");
      return;
    }

    // This prototype does not authenticate passwords.
    if (!password) {
      notify("Enter your password.");
      return;
    }

    $("login-form").reset();

    showApp();
    notify("Welcome back!");
  });


  // ===================================
  // SHOW MAIN APPLICATION
  // ===================================

  function showApp() {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.add("hidden");
    });

    $("app-screen").classList.remove("hidden");

    loadProfile();
    showPage("chats-page");
  }


  // ===================================
  // LOAD PROFILE
  // ===================================

  function loadProfile() {
    const savedUser = localStorage.getItem("vk_user");

    if (!savedUser) return;

    const user = JSON.parse(savedUser);

    $("profile-name").textContent = user.name;
    $("profile-username").textContent = "@" + user.username;
    $("profile-bio").textContent = user.bio || "";
    $("friends-count").textContent = user.friends || 0;
    $("followers-count").textContent = user.followers || 0;
    $("following-count").textContent = user.following || 0;
  }


  // ===================================
  // MAIN NAVIGATION
  // ===================================

  function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.add("hidden");
      page.classList.remove("active");
    });

    $(pageId)?.classList.remove("hidden");
    $(pageId)?.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.remove("active");

      if (button.dataset.page === pageId) {
        button.classList.add("active");
      }
    });
  }

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  $("header-profile").addEventListener("click", () => {
    showPage("profile-page");
  });


  // ===================================
  // DARK MODE
  // ===================================

  const savedTheme = localStorage.getItem("vk_theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    $("theme-button").textContent = "☀️";
  }

  $("theme-button").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("vk_theme", isDark ? "dark" : "light");

    $("theme-button").textContent = isDark ? "☀️" : "🌙";
  });


  // ===================================
  // SEARCH
  // ===================================

  $("search-button").addEventListener("click", () => {
    $("search-area").classList.toggle("hidden");

    if (!$("search-area").classList.contains("hidden")) {
      $("global-search").focus();
    }
  });

  $("global-search").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();

    document.querySelectorAll(".page").forEach(page => {
      page.querySelectorAll("h2, h3, p").forEach(element => {
        element.style.opacity =
          !query || element.textContent.toLowerCase().includes(query)
            ? "1"
            : "0.35";
      });
    });
  });


  // ===================================
  // NEW CHAT
  // ===================================

  $("new-chat-button").addEventListener("click", () => {
    notify("Friend search and messaging will be connected next.");
  });


  // ===================================
  // STATUS
  // ===================================

  $("add-status-button").addEventListener("click", () => {
    notify("Status creation will be connected next.");
  });


  // ===================================
  // CALLS
  // ===================================

  $("voice-call-button").addEventListener("click", () => {
    notify("Voice calling requires a calling server.");
  });

  $("video-call-button").addEventListener("click", () => {
    notify("Video calling requires a calling server.");
  });


  // ===================================
  // COMMUNITIES
  // ===================================

  $("create-community-button").addEventListener("click", () => {
    notify("Community creation will be added next.");
  });


  // ===================================
  // DISCOVER
  // ===================================

  $("create-post-button").addEventListener("click", () => {
    notify("Post creation will be added next.");
  });


  // ===================================
  // PROFILE
  // ===================================

  $("edit-profile-button").addEventListener("click", () => {
    const savedUser = localStorage.getItem("vk_user");

    if (!savedUser) return;

    const user = JSON.parse(savedUser);

    const newBio = prompt("Enter your new bio:", user.bio || "");

    if (newBio !== null) {
      user.bio = newBio.trim();

      localStorage.setItem("vk_user", JSON.stringify(user));

      loadProfile();
      notify("Profile updated.");
    }
  });


  // ===================================
  // SETTINGS
  // ===================================

  $("settings-button").addEventListener("click", () => {
    notify("More settings will be added soon.");
  });

  $("privacy-button").addEventListener("click", () => {
    notify("Privacy settings will be added soon.");
  });

  $("language-button").addEventListener("click", () => {
    notify("More languages will be added soon.");
  });

  $("backup-button").addEventListener("click", () => {
    notify("Cloud backup requires a secure backend.");
  });


  // ===================================
  // LOGOUT
  // ===================================

  $("logout-button").addEventListener("click", () => {
    const confirmed = confirm("Are you sure you want to log out?");

    if (confirmed) {
      localStorage.removeItem("vk_user");
      showScreen("welcome-screen");
      notify("You have logged out.");
    }
  });

});
