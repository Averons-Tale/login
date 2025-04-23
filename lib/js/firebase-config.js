import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCu-SbsTav4X6Q50pj4XDO2bCRJI3yz_lM",
    authDomain: "averon-s-tale-login.firebaseapp.com",
    projectId: "averon-s-tale-login",
    storageBucket: "averon-s-tale-login.firebasestorage.app",
    messagingSenderId: "229889299972",
    appId: "1:229889299972:web:748f4000dcc4731ae10751",
    measurementId: "G-V17FRDJZJD"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();