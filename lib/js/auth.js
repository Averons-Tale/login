const firebaseConfig = {
  apiKey: "AIzaSyCu-SbsTav4X6Q50pj4XDO2bCRJI3yz_lM",
  authDomain: "averon-s-tale-login.firebaseapp.com",
  projectId: "averon-s-tale-login",
  storageBucket: "averon-s-tale-login.appspot.com",
  messagingSenderId: "229889299972",
  appId: "1:229889299972:web:748f4000dcc4731ae10751",
  measurementId: "G-V17FRDJZJD"
};

const app = firebase.initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

setPersistence(auth, browserLocalPersistence).catch(console.error);

document.addEventListener("DOMContentLoaded", () => {
  const loginToggle = document.getElementById("loginToggle");
  const registerToggle = document.getElementById("registerToggle");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authNavBtn = document.getElementById("authNavBtn");

  function redirectIfLoggedIn() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setCookie("auth_token", token, 30);
        if (window.location.hostname === "login.averons-tale.net") {
          window.location.href = "https://help.averons-tale.net";
        }
      } else {
        if (window.location.hostname === "help.averons-tale.net") {
          window.location.href = "https://login.averons-tale.net";
        }
      }
    });
  }

  redirectIfLoggedIn();

  loginToggle.onclick = () => switchForm("login");
  registerToggle.onclick = () => switchForm("register");

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        showErrorAlert("Bitte bestätige deine E-Mail-Adresse.");
        await auth.signOut();
        return;
      }
      const token = await cred.user.getIdToken();
      setCookie("auth_token", token, 30);
      window.location.href = "https://help.averons-tale.net";
    } catch {
      showErrorAlert("E-Mail oder Passwort falsch");
    }
  };

  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await cred.user.sendEmailVerification();
      showPersistentVerificationAlert();

      const interval = setInterval(async () => {
        await cred.user.reload();
        if (cred.user.emailVerified) {
          clearInterval(interval);
          const token = await cred.user.getIdToken();
          setCookie("auth_token", token, 30);
          window.location.href = "https://help.averons-tale.net";
        }
      }, 3000);
    } catch (err) {
      const msg = err.message.includes("email") ? "E-Mail bereits registriert" : "Passwort zu schwach (min. 6 Zeichen)";
      showErrorAlert(msg);
    }
  };

      document.getElementById('googleLogin').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => result.user.getIdToken())
            .then(token => {
                setCookie('auth_token', token, 30);
                window.location.href = 'https://help.averons-tale.net';
            })
            .catch(() => showErrorAlert('Google-Anmeldung fehlgeschlagen'));
    });

    document.getElementById('discordLogin').addEventListener('click', async () => {
        const provider = new firebase.auth.OAuthProvider('oidc.discord');
        try {
            const result = await auth.signInWithPopup(provider);
            const token = await result.user.getIdToken();
            setCookie('auth_token', token, 30);
            window.location.href = 'https://help.averons-tale.net';
        } catch (err) {
            console.error('Discord-Login fehlgeschlagen', err);
            showErrorAlert('Discord-Anmeldung fehlgeschlagen');
        }
    });

  document.getElementById("forgotPassword").onclick = async (e) => {
    e.preventDefault();
    const email = prompt("Bitte gib deine E-Mail-Adresse ein:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        showAlert("Passwort-Zurücksetzen E-Mail gesendet!");
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  function switchForm(form) {
    const login = form === "login";
    loginToggle.classList.toggle("active", login);
    registerToggle.classList.toggle("active", !login);
    loginForm.classList.toggle("active-form", login);
    registerForm.classList.toggle("active-form", !login);
    authNavBtn.textContent = login ? "Registrieren" : "Anmelden";
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=averons-tale.net; Secure; SameSite=None`;
  }

  function showErrorAlert(msg) {
    showNotification(msg, "error-notification");
  }

  function showAlert(msg) {
    showNotification(msg, "success-notification");
  }

  function showNotification(msg, className) {
    const existing = document.querySelector(`.${className}`);
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = className;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => {
      div.classList.add("fade-out");
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }

  function showPersistentVerificationAlert() {
    if (document.getElementById("verifyAlert")) return;
    const box = document.createElement("div");
    box.id = "verifyAlert";
    box.className = "custom-alert";
    box.innerHTML = `
      <div class="alert-header"><button class="alert-close-btn">✕</button></div>
      <div class="alert-body">
        <div class="alert-icon">📧</div>
        <div class="alert-message">
          <h3>E-Mail-Bestätigung erforderlich</h3>
          <p>Bitte überprüfe deinen Posteingang.</p>
        </div>
      </div>`;
    document.body.appendChild(box);
    box.querySelector(".alert-close-btn").onclick = () => box.remove();
  }

  const style = document.createElement("style");
  style.textContent = `
    .error-notification, .success-notification {
      position: fixed; bottom: 20px; right: 20px;
      padding: 12px 24px; border-radius: 4px;
      color: white; z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    }
    .error-notification { background: #ff4444; }
    .success-notification { background: #4CAF50; }
    .custom-alert {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #f8f9fa; border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: 400px; width: 90%;
      z-index: 10001; animation: fadeIn 0.3s ease-out;
    }
    .alert-header { display: flex; justify-content: flex-end; padding: 12px; }
    .alert-close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6c757d; }
    .alert-body { padding: 0 20px 20px; text-align: center; }
    .alert-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .fade-out { animation: fadeOut 0.3s ease-out forwards; }
    @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  `;
  document.head.appendChild(style);
});