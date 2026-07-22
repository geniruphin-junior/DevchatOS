/* 
   ================================================================
   SYSTÈME DE MESSAGERIE DÉVELOPPÉ PAR RUPHIN & L'ÉQUIPE DEV JVLTIC 
   VERSION FINALE (PHOTOS + HEURE + CORRECTIONS)
   ================================================================
*/

// --- 1. IMPORTATIONS FIREBASE ---
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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- 2. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCYz4g734STV0GdnvKdcsPGLaZc_J_XXg",
  authDomain: "devchat-ruphin.firebaseapp.com",
  databaseURL: "https://devchat-ruphin-default-rtdb.firebaseio.com",
  projectId: "devchat-ruphin",
  storageBucket: "devchat-ruphin.firebasestorage.app",
  messagingSenderId: "750392215277",
  appId: "1:750392215277:web:630bd10e89323ed3962ee4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- 3. CONFIGURATION SYSTÈME ---
const ADMINS = [
  "RUPHIN", "GLOIRE", "JAPHET", "JULES", "NOBLE", 
  "ELIEL", "HACKER-Sipossible", "OTHERS", "HACKER"
];
const CODE = "JVLTIC2026";
let activeUser = "";

// --- 4. ÉLÉMENTS DU DOM (Compatibilité avec votre HTML) ---
const btnAuth = document.getElementById("btnAuth");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn"); // Bouton photo
const chatInput = document.getElementById("chatInput");
const msgBox = document.getElementById("msgBox");
const authLayer = document.getElementById("auth-layer");
const mainSite = document.getElementById("main-site");
const card = document.getElementById("card");
const toggleBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidbar");

// --- 5. LOGIQUE DE CONNEXION ---
function tryLogin() {
  const u = document.getElementById("userIn").value.trim().toUpperCase();
  const p = document.getElementById("passIn").value;

  if (ADMINS.includes(u) && p === CODE) {
    activeUser = u;
    document.getElementById("display-name").innerText = u;
    unlockSystem();
    loadMessages();
    
    // Message de bienvenue avec lien GitHub (CORRIGÉ)
    setTimeout(() => {
        const githubLink = "https://github.com/geniruphin-jnior/DevchatOS.git";
        const message = `Salut ${u} ! C'est Ruphin. Voici le lien vers le dépôt du projet : ${githubLink}`;
        if(confirm(message)) {
            window.open(githubLink, "_blank");
        }
    }, 800);

  } else {
    card.style.animation = "none";
    setTimeout(() => (card.style.animation = "shake 0.4s"), 10);
    btnAuth.innerText = "ACCÈS REFUSÉ";
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
    }, 50);
  }, 600);
}

// --- 6. MOTEUR DE MESSAGERIE (TEXTE + PHOTOS) ---

// Envoi de texte
async function sendMsg(textOverride = null) {
  const text = textOverride !== null ? textOverride : chatInput.value.trim();
  if (text === "") return;

  try {
    await addDoc(collection(db, "messages"), {
      author: activeUser,
      text: text,
      type: "text",
      timestamp: serverTimestamp(),
    });
    if(!textOverride) chatInput.value = "";
  } catch (e) {
    console.error("Erreur d'envoi : ", e);
    alert("Erreur lors de l'envoi du message.");
  }
}

// Envoi de photo
async function sendPhoto(file) {
  if (!file) return;
  
  try {
    // Message "Envoi..."
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "msg sent";
    loadingMsg.innerHTML = `<span style="color:#666; font-style:italic;">Envoi de l'image...</span>`;
    msgBox.appendChild(loadingMsg);
    msgBox.scrollTo({ top: msgBox.scrollHeight, behavior: "smooth" });

    // Upload vers Firebase Storage
    const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Sauvegarde du lien dans Firestore
    await addDoc(collection(db, "messages"), {
      author: activeUser,
      text: downloadURL,
      type: "image",
      timestamp: serverTimestamp(),
    });

    // Nettoyage
    fileInput.value = "";
    // Supprimer le message "Envoi..."
    if (loadingMsg.parentNode) {
        msgBox.removeChild(loadingMsg);
    }

  } catch (e) {
    console.error("Erreur upload image : ", e);
    alert("Échec de l'envoi de l'image. Vérifiez la console.");
  }
}

// Écouteur pour le fichier
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    sendPhoto(file);
  }
});

// Écouteur pour le bouton photo
if(uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });
}

// Lecture des messages
function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  onSnapshot(q, (snapshot) => {
    msgBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      displayMessage(data.author, data.text, data.type, data.author === activeUser, data.timestamp);
    });
  });
}

function displayMessage(author, content, type, isSent, timestamp) {
  const wrapper = document.createElement("div");
  let timeText = "";

  // Correction de l'heure
  if (timestamp && timestamp.toDate) {
    const date = timestamp.toDate();
    timeText = date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
  }

  let contentHtml = "";
  if (type === "image") {
    contentHtml = `<img src="${content}" style="max-width:100%; border-radius:8px; margin-top:5px; display:block;">`;
  } else {
    contentHtml = content;
  }

  wrapper.className = `msg ${isSent ? "sent" : "received"}`;
  
  // Adaptation pour votre structure HTML
  if(isSent) {
      wrapper.innerHTML = `
        <div class="msg-author" style="font-size:0.7rem; color:#888; text-align:right; margin-bottom:2px;">${author}</div>
        <span class="msg-time" style="float:right; font-size:0.7rem; color:#888; margin-left:5px;">${timeText}</span>
        <div style="clear:both;"></div>
        ${contentHtml}
      `;
  } else {
      wrapper.innerHTML = `
        <div class="msg-author" style="font-size:0.7rem; color:#888; margin-bottom:2px;">${author}</div>
        <span class="msg-time" style="float:right; font-size:0.7rem; color:#888; margin-left:5px;">${timeText}</span>
        <div style="clear:both;"></div>
        ${contentHtml}
      `;
  }

  msgBox.appendChild(wrapper);
  msgBox.scrollTo({ top: msgBox.scrollHeight, behavior: "smooth" });
}

// --- 7. ÉCOUTEURS ---
btnAuth.addEventListener("click", tryLogin);
sendBtn.addEventListener("click", () => sendMsg());

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (mainSite && mainSite.style.display === "flex") {
      sendMsg();
    } else {
      tryLogin();
    }
  }
});

// Sidebar
if(toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
}

// Initialisation de la sidebar (optionnel)
document.addEventListener("DOMContentLoaded", () => {
    // Ajoute la classe 'active' si vous voulez la sidebar ouverte par défaut sur mobile
    if(window.innerWidth < 768) {
        sidebar.classList.add("active");
    }
});