
document.addEventListener('DOMContentLoaded', function () {
    const auth = firebase.auth();

    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => console.error('Persistence error:', error));

    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authNavBtn = document.getElementById('authNavBtn');

    checkAuthAndRedirect();

function checkAuthAndRedirect() {
    auth.onAuthStateChanged(user => {
        if (user) {
            user.getIdToken().then(token => {
                setCookie('auth_token', token, 30);
                if (window.location.hostname === 'login.averons-tale.net') {
                    window.location.href = 'https://help.averons-tale.net';
                }
            });
        } else {
            // Handle case when user is not logged in
            if (window.location.hostname === 'help.averons-tale.net') {
                window.location.href = 'https://login.averons-tale.net';
            }
        }
    });
}

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 86400000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/;domain=averons-tale.net;Secure;SameSite=None`;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; path=/; domain=averons-tale.net; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None`;
    }

    function getCookie(name) {
        const cookies = `; ${document.cookie}`;
        const parts = cookies.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';')[0];
    }


    function switchForm(form) {
        if (form === 'login') {
            loginToggle.classList.add('active');
            registerToggle.classList.remove('active');
            loginForm.classList.add('active-form');
            registerForm.classList.remove('active-form');
            authNavBtn.textContent = 'Registrieren';
        } else {
            loginToggle.classList.remove('active');
            registerToggle.classList.add('active');
            loginForm.classList.remove('active-form');
            registerForm.classList.add('active-form');
            authNavBtn.textContent = 'Anmelden';
        }
    }

    loginToggle.addEventListener('click', () => switchForm('login'));
    registerToggle.addEventListener('click', () => switchForm('register'));

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                if (!user.emailVerified) {
                    showErrorAlert('Bitte bestätige deine E-Mail-Adresse.');
                    return auth.signOut();
                }
                return user.getIdToken().then(token => {
                    setCookie('auth_token', token, 30);
                    window.location.href = 'https://help.averons-tale.net';
                });
            })
            .catch(() => showErrorAlert('E-Mail oder Passwort falsch'));
    });

    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                return user.sendEmailVerification().then(() => {
                    showPersistentVerificationAlert();
                    const checkInterval = setInterval(() => {
                        user.reload().then(() => {
                            if (user.emailVerified) {
                                clearInterval(checkInterval);
                                user.getIdToken().then(token => {
                                    setCookie('auth_token', token, 30);
                                    window.location.href = 'https://help.averons-tale.net';
                                });
                            }
                        });
                    }, 3000);
                });
            })
            .catch(err => {
                const msg = err.message.includes('email') ? 'E-Mail bereits registriert' : 'Passwort zu schwach (min. 6 Zeichen)';
                showErrorAlert(msg);
            });
    });

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

    document.getElementById('forgotPassword').addEventListener('click', e => {
        e.preventDefault();
        const email = prompt("Bitte gib deine E-Mail-Adresse ein:");
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => showAlert('Passwort-Zurücksetzen E-Mail gesendet!'))
                .catch(err => showErrorAlert(err.message));
        }
    });

    function showErrorAlert(msg) {
        const existing = document.querySelector('.error-notification');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'error-notification';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => {
            div.classList.add('fade-out');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }

    function showAlert(msg) {
        const existing = document.querySelector('.success-notification');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'success-notification';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => {
            div.classList.add('fade-out');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }

    function showPersistentVerificationAlert() {
        if (document.getElementById('verifyAlert')) return;
        const alertBox = document.createElement('div');
        alertBox.id = 'verifyAlert';
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
            <div class="alert-header"><button class="alert-close-btn">✕</button></div>
            <div class="alert-body">
                <div class="alert-icon">📧</div>
                <div class="alert-message">
                    <h3>E-Mail-Bestätigung erforderlich</h3>
                    <p>Wir haben eine Bestätigungs-E-Mail gesendet. Bitte überprüfe deinen Posteingang.</p>
                </div>
            </div>`;
        document.body.appendChild(alertBox);
        alertBox.querySelector('.alert-close-btn').addEventListener('click', () => alertBox.remove());
    }

    const style = document.createElement('style');
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

function syncAuthState() {
    auth.onAuthStateChanged(user => {
        if (user && window.location.hostname === 'login.averons-tale.net') {
            user.getIdToken().then(token => {
                setCookie('auth_token', token, 30);
                window.location.href = 'https://help.averons-tale.net';
            });
        }
    });
}

// Initial call
syncAuthState();