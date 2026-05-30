// 1. IMPORT DES OUTILS FIREBASE (Obligatoire en mode MODULE)
import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, push, onChildAdded } from "https://gstatic.com";

// 2. TA CONFIGURATION FIREBASE (Vérifiée et complète)
const firebaseConfig = {
  apiKey: "AIzaSyCYZ4g734STV0GdwnVkDcsPGLazc_J_XXg",
  authDomain: "://firebaseapp.com",
  projectId: "devchat-ruphin",
  storageBucket: "devchat-ruphin.appspot.com",
  messagingSenderId: "750392215277",
  appId: "1:750392215277:web:e18551ee66de2dce962ee4",
};

// 3. INITIALISATION DU SYSTÈME
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// --- CONFIGURATION ADMIN ---
const ADMINS = ["RUPHIN", "GLOIRE", "JAPHET", "JULES", "NOBLE"];
const CODE = "2024";
let activeUser = "";

// --- RÉCUPÉRATION DES ÉLÉMENTS DU DOM ---
const btnAuth = document.getElementById("btnAuth");
const userIn = document.getElementById("userIn");
const passIn = document.getElementById("passIn");
const authLayer = document.getElementById("auth-layer");
const mainSite = document.getElementById("main-site");
const displayName = document.getElementById("display-name");

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const msgBox = document.getElementById("msgBox");

// --- SYSTÈME DE CONNEXION ---
function tryLogin() {
  const u = userIn.value.trim().toUpperCase();
  const p = passIn.value;
  const card = document.getElementById("card");

  if (ADMINS.includes(u) && p === CODE) {
    activeUser = u;
    unlockSystem();
  } else {
    // Effet visuel d'erreur
    card.style.animation = "none";
    setTimeout(() => {
      card.style.animation = "shake 0.5s";
    }, 10);
    btnAuth.innerText = "ACCÈS REFUSÉ";
    btnAuth.style.background = "#ff4d4d";

    setTimeout(() => {
      btnAuth.innerText = "SE CONNECTER";
      btnAuth.style.background = "#00a884";
    }, 1000);
  }
}

function unlockSystem() {
  // Animation de disparition de l'écran de login
  authLayer.style.opacity = "0";
  setTimeout(() => {
    authLayer.style.display = "none";
    mainSite.style.display = "flex"; // Affiche le chat
    setTimeout(() => {
      mainSite.style.opacity = "1";
      displayName.innerText = "Session : " + activeUser;
    }, 50);
  }, 500);
}

// --- GESTION DES MESSAGES ---
function sendMsg() {
  const text = chatInput.value.trim();
  if (text === "" || activeUser === "") return;

  // Envoi sécurisé vers Firebase
  push(messagesRef, {
    author: activeUser,
    text: text,
    timestamp: Date.now(),
  });

  chatInput.value = ""; // Vide le champ de saisie
}

// ÉCOUTEUR EN TEMPS RÉEL (Réception des messages)
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  const wrapper = document.createElement("div");
  const isMe = data.author === activeUser;

  // Structure du message avec nom discret
  wrapper.className = isMe ? "msg-wrapper sent-wrapper" : "msg-wrapper";
  wrapper.innerHTML = `
    <span class="msg-author">${data.author}</span>
    <div class="msg ${isMe ? "sent" : "received"}">
        ${data.text}
    </div>
  `;

  msgBox.appendChild(wrapper);
  msgBox.scrollTop = msgBox.scrollHeight; // Scroll automatique
});

// --- ÉCOUTEURS D'ÉVÉNEMENTS (INTERACTIONS) ---
btnAuth.addEventListener("click", tryLogin);
sendBtn.addEventListener("click", sendMsg);

// Support de la touche Entrée pour l'input
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMsg();
});

// Support de la touche Entrée pour le mot de passe
passIn.addEventListener("keypress", (e) => {
  if (e.key === "Enter") tryLogin();
});
