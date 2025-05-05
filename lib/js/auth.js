document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect();

    // UI Elemente
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authNavBtn = document.getElementById('authNavBtn');
    const auth = firebase.auth();

    // Formularumschaltung
    function switchForm(formToShow) {
        if (formToShow === 'login') {
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

    // Event Listener für Formularumschaltung
    loginToggle.addEventListener('click', () => switchForm('login'));
    registerToggle.addEventListener('click', () => switchForm('register'));

    // Auth-Status prüfen und ggf. weiterleiten
    function checkAuthAndRedirect() {
        const token = getCookie('auth_token');
        if (token) {
            verifyToken(token).then(isValid => {
                if (isValid) {
                    window.location.href = 'https://help.averons-tale.net';
                } else {
                    deleteCookie('auth_token');
                }
            });
        }
    }

    // Token verifizieren
    function verifyToken(token) {
        return fetch('https://europe-west3-averon-s-tale-login.cloudfunctions.net/verifyToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => data.valid)
        .catch(() => false);
    }

    // Cookie Funktionen
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/;domain=.averons-tale.net;Secure;SameSite=Lax`;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; path=/; domain=.averons-tale.net; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    // Login Handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                if (user.emailVerified) {
                    return user.getIdToken().then(idToken => {
                        setCookie('auth_token', idToken, 30);
                        window.location.href = 'https://help.averons-tale.net';
                    });
                } else {
                    showErrorAlert('Bitte bestätige deine E-Mail-Adresse.');
                    return auth.signOut();
                }
            })
            .catch(err => {
                showErrorAlert('E-Mail oder Passwort falsch');
            });
    });

    // Registrierungs Handler
    registerForm.addEventListener('submit', function(e) {
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
                                return user.getIdToken().then(idToken => {
                                    setCookie('auth_token', idToken, 30);
                                    window.location.href = 'https://help.averons-tale.net';
                                });
                            }
                        });
                    }, 3000);
                });
            })
            .catch(err => {
                const errorMsg = err.message.includes('email') ? 
                    'E-Mail bereits registriert' : 
                    'Passwort zu schwach (min. 6 Zeichen)';
                showErrorAlert(errorMsg);
            });
    });

    // Google Login Handler
    document.getElementById('googleLogin').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => {
                return result.user.getIdToken().then(idToken => {
                    setCookie('auth_token', idToken, 30);
                    window.location.href = 'https://help.averons-tale.net';
                });
            })
            .catch(err => {
                showErrorAlert('Google-Anmeldung fehlgeschlagen');
            });
    });

    // Discord Login Handler
    document.getElementById('discordLogin').addEventListener('click', async function() {
        const provider = new firebase.auth.OAuthProvider('oidc.discord');
        
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            
            if (result.user) {
                window.location.href = 'https://help.averons-tale.net';
            } else {
                alert('Login fehlgeschlagen oder abgebrochen');
            }
        } catch (error) {
            console.error('Login fehlgeschlagen:', error);
            alert('Login fehlgeschlagen: ' + error.message);
        }
    });
    

    // Passwort vergessen Handler
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        const email = prompt("Bitte gib deine E-Mail-Adresse ein:");
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => showAlert("Passwort-Zurücksetzen E-Mail gesendet!"))
                .catch(err => showErrorAlert(err.message));
        }
    });

    // Fehleranzeige
    function showErrorAlert(message) {
        const existingError = document.querySelector('.error-notification');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    // Erfolgsanzeige
    function showAlert(message) {
        const existingAlert = document.querySelector('.success-notification');
        if (existingAlert) existingAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = 'success-notification';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    // E-Mail Verifizierungs-Hinweis
    function showPersistentVerificationAlert() {
        const existingAlert = document.getElementById('verifyAlert');
        if (existingAlert) return;

        const alertBox = document.createElement('div');
        alertBox.id = 'verifyAlert';
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
            <div class="alert-header">
                <button class="alert-close-btn">
                    ✕
                </button>
            </div>
            <div class="alert-body">
                <div class="alert-icon">📧</div>
                <div class="alert-message">
                    <h3>E-Mail-Bestätigung erforderlich</h3>
                    <p>Wir haben eine Bestätigungs-E-Mail gesendet. Bitte überprüfe deinen Posteingang.</p>
                </div>
            </div>
        `;

        document.body.appendChild(alertBox);

        alertBox.querySelector('.alert-close-btn').addEventListener('click', function() {
            alertBox.remove();
        });
    }

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        .error-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #ff4444;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        }
        
        .success-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        }
        
        .custom-alert {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            width: 90%;
            max-width: 400px;
            z-index: 10001;
            animation: fadeIn 0.3s ease-out;
        }
        
        .alert-header {
            display: flex;
            justify-content: flex-end;
            padding: 12px;
        }
        
        .alert-close-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #6c757d;
        }
        
        .alert-body {
            padding: 0 20px 20px;
            text-align: center;
        }
        
        .alert-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .fade-out {
            animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});