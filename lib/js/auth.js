document.addEventListener('DOMContentLoaded', function() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authNavBtn = document.getElementById('authNavBtn');
    
    function switchForm(formToShow) {
        if (formToShow === 'login') {
            loginToggle.classList.add('active');
            registerToggle.classList.remove('active');
            loginForm.classList.add('active-form');
            registerForm.classList.remove('active-form');
            authNavBtn.textContent = 'Anmelden';
        } else {
            loginToggle.classList.remove('active');
            registerToggle.classList.add('active');
            loginForm.classList.remove('active-form');
            registerForm.classList.add('active-form');
            authNavBtn.textContent = 'Registrieren';
        }
    }
    
    loginToggle.addEventListener('click', () => switchForm('login'));
    registerToggle.addEventListener('click', () => switchForm('register'));
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {

                window.location.href = 'https://help.nexorhub.com';
            })
            .catch((error) => {
            
                alert(error.message);
            });
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.updateProfile({
                    displayName: document.getElementById('registerUsername').value
                });
            })
            .then(() => {
                window.location.href = 'https://help.nexorhub.com';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
    
    // Google Login
    document.getElementById('googleLogin').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(() => {
                window.location.href = 'https://help.nexorhub.com';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
    
    // Discord Login
    document.getElementById('discordLogin').addEventListener('click', () => {
        const provider = new firebase.auth.OAuthProvider('discord.com');
        auth.signInWithPopup(provider)
            .then(() => {
                window.location.href = 'https://help.nexorhub.com';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
    
    // Passwort zurücksetzen
    document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Bitte geben Sie Ihre E-Mail-Adresse ein:');
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet!');
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    });
});