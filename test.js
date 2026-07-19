/* 
   ================================================================
   SYSTÈME DE MESSAGERIE DÉVELOPPÉ PAR RUPHIN & L'ÉQUIPE DEV JVLTIC 
   ================================================================*/

// --- 1. IMPORTATIONS (LIENS VERS LES FICHIERS RÉELS) GRACE A UN PEU D AIDE DE COPILOT ---
// --- 1. IMPORTATIONS CORRECTES ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 2. CONFIGURATION DU PROJET AVECX IMPORT DES MODULES FIREBASE DE FRANKFORT
const firebaseConfig = {
  apiKey: "AIzaSyCYz4g734STV0GdnvKdcsPGLaZc_J_XXg",
  authDomain: "devchat-ruphin.firebaseapp.com",
  databaseURL: "https://devchat-ruphin-default-rtdb.firebaseio.com",
  projectId: "devchat-ruphin",
  storageBucket: "devchat-ruphin.firebasestorage.app",
  messagingSenderId: "750392215277",
  appId: "1:750392215277:web:630bd10e89323ed3962ee4",
};

// Innitialisation et recuperation des données du serveur firebase de frankfurt

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. CONFIGURATION DU SYSTÈME ---
const ADMINS = [
  "RUPHIN",
  "GLOIRE",
  "JAPHET",
  "JULES",
  "NOBLE",
  "ELIEL",
  "HACKER",
  "OTHERS",
  "HACKER",
];
const CODE = "JVLTIC2026";
let activeUser = "";

// --- 4. ÉLÉMENTS DU DOM ---
const btnAuth = document.getElementById("btnAuth");
const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const msgBox = document.getElementById("msgBox");
const authLayer = document.getElementById("auth-layer");
const mainSite = document.getElementById("main-site");

// --- 5. LOGIQUE DE CONNEXION ---
function tryLogin() {
  const u = document.getElementById("userIn").value.trim().toUpperCase();
  const p = document.getElementById("passIn").value;
  const card = document.getElementById("card");

  if (ADMINS.includes(u) && p === CODE) {
    activeUser = u;
    unlockSystem();
    loadMessages();
  } else {
    card.style.animation = "none";
    setTimeout(() => (card.style.animation = "shake 0.4s"), 10);
    btnAuth.innerText = "RUPHIN REFUSE VOTRE ACCES";
    btnAuth.style.background = "#ff4d4d";
    setTimeout(() => {
      btnAuth.innerText = "SE CONNECTER";
      btnAuth.style.background = "#00a884";
    }, 1500);
  }
}

function unlockSystem() {
  authLayer.style.opacity = "0";
  authLayer.style.filter = "blur(20px)";
  setTimeout(() => {
    authLayer.style.display = "none";
    mainSite.style.display = "flex";
    setTimeout(() => {
      mainSite.style.opacity = "1";
      document.getElementById("display-name").innerText = `${activeUser}`;
    }, 50);
  }, 600);
}

// --- 6. MOTEUR DE MESSAGERIE RÉEL ---
async function sendMsg() {
  const text = chatInput.value.trim();
  if (text === "") return;

  try {
    await addDoc(collection(db, "messages"), {
      author: activeUser,
      text: text,
      timestamp: serverTimestamp(),
    });
    chatInput.value = "";
  } catch (e) {
    console.error("Erreur d'envoi Firestore : ", e);
  }
}

function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  onSnapshot(q, (snapshot) => {
    msgBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      displayMessage(
        data.author,
        data.text,
        data.author === activeUser,
        data.timestamp,
      );
    });
  });
}

function displayMessage(author, text, isSent, timestamp) {
  const wrapper = document.createElement("div");
  let timeTrue = "";

  if (timestamp) {
    const date = timestamp.toDate();
    timeTrue = date.toLocaleString("fr-FR", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // --- TRANSFORMATION DES LIENS ---
  const linkifiedText = text.replace(
    /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g,
    function (match) {
      let url = match;
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    },
  );

  wrapper.className = `msg-wrapper ${isSent ? "sent-wrapper" : ""}`;
  wrapper.innerHTML = `
    <span class="msg-author">${author} • ${timeTrue}</span>
    <div class="msg ${isSent ? "sent" : "received"}">${linkifiedText}</div>
  `;
  msgBox.appendChild(wrapper);
  msgBox.scrollTo({ top: msgBox.scrollHeight, behavior: "smooth" });
}

// --- 7. ÉCOUTEURS ---
btnAuth.addEventListener("click", tryLogin);
sendBtn.addEventListener("click", sendMsg);
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    // Si on clique sur le boutton enter le message est envoyé
    if (mainSite && mainSite.style.display === "flex") sendMsg();
    else tryLogin();
  }
});
//adaptation aux petits ecrans
const toggleBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidbar");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
