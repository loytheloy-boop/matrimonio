/* ============================================================
   CONFIGURAZIONE
   ============================================================ */
const API_URL = "https://script.google.com/macros/s/AKfycbxbOePOroxSVH9Ttsz8QZZhf3-VxmA89SKeGFHyJKR5NreKfts53Fvpq8gkUgGsJoYFrg/exec";
let CONFIG = {};
let invitati = [];
let filtroAttivo = "tutti";
let ricerca = "";
let ordineAsc = true;

/* 🛑 STOP ALLE ADESIONI (persistente) */
let stopAdesioni = localStorage.getItem("stopAdesioni") === "true";

/* ============================================================
   CARICA CONFIGURAZIONE
   ============================================================ */
async function caricaConfig() {
    try {
        const res = await fetch("config.json?nocache=" + Date.now());
        CONFIG = await res.json();

        const heroData = document.getElementById("hero-data");
        const heroRicevimento = document.getElementById("hero-ricevimento");

        if (heroData) {
            heroData.textContent = `${CONFIG.data} – ore ${CONFIG.ora} – ${CONFIG.cerimonia_luogo}`;
        }

        if (heroRicevimento) {
            if (CONFIG.ricevimento_luogo.trim() !== "") {
                heroRicevimento.textContent = `A seguire ricevimento presso ${CONFIG.ricevimento_luogo}`;
            } else {
                heroRicevimento.textContent = "";
            }
        }

    } catch (e) {
        console.error("Errore nel caricamento di config.json", e);
    }
}

/* ============================================================
   CARICA LISTA INVITATI
   ============================================================ */
async function caricaDati() {
    const res = await fetch("data/invitati.json?nocache=" + Date.now());
    invitati = await res.json();
}

/* ============================================================
   LOGIN
   ============================================================ */
function login() {
    const pwd = document.getElementById("pwd").value;

    if (pwd === "merate2026") {
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";

        /* Imposta lo stato del checkbox */
        const chk = document.getElementById("stop-adesioni");
        if (chk) chk.checked = stopAdesioni;

        mostraInvitati();

        const adminArea = document.querySelector("#admin-area");
        if (adminArea) {
            window.scrollTo({
                top: adminArea.offsetTop,
                behavior: "smooth"
            });
        }
    } else {
        alert("Password errata");
    }
}

/* ============================================================
   🛑 STOP ALLE ADESIONI
   ============================================================ */
function toggleStopAdesioni() {
    stopAdesioni = document.getElementById("stop-adesioni").checked;
    localStorage.setItem("stopAdesioni", stopAdesioni);
    alert(stopAdesioni ? "Adesioni bloccate" : "Adesioni riaperte");
}

/* ============================================================
   GOOGLE SHEETS
   ============================================================ */
async function caricaConferme() {
    const res = await fetch(API_URL);
    return await res.json();
}

async function conferma(id, risposta) {
    const invitato = invitati.find(x => x.id == id);

    if (!invitato) {
        document.getElementById("contenuto").innerHTML =
            "<h2>Invito non valido</h2>";
        return;
    }

    /* 🛑 BLOCCO ADESIONI */
    if (stopAdesioni && risposta === "si") {
        document.getElementById("contenuto").innerHTML =
            "<h2>Spiacenti, ma il sistema non può raccogliere adesioni per termini di tempo scaduti.<br>Rivolgersi direttamente agli Sposi.<br>Grazie!</h2>";
        return;
    }

    const payload = {
        id: invitato.id,
        nome: invitato.nome,
        singolo: invitato.singolo,
        email: invitato.email,
        stato: risposta === "si" ? "confermato" : "non confermato"
    };

    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    document.getElementById("contenuto").innerHTML =
        risposta === "si"
            ? "<h2>Grazie di cuore! Ti aspettiamo.</h2>"
            : "<h2>Grazie per la risposta! Ci dispiace non vederti quel giorno.</h2>";
}

/* ============================================================
   PAGINA INVITATO
   ============================================================ */
function getParametro(nome) {
    const url = new URL(window.location.href);
    return url.searchParams.get(nome);
}

function mostraSchedaInvitato() {
    const id = getParametro("id");
    const invitato = invitati.find(x => x.id == id);

    const div = document.getElementById("contenuto");

    if (!invitato) {
        div.innerHTML = "<h2>Invito non valido</h2>";
        return;
    }

    const singolo = invitato.singolo === "Si";

    const imgSrc = singolo ? "img/singolo.jpg" : "img/pluri.jpg";

    const testoInvito = singolo
        ? `Siamo felici di invitarti al nostro matrimonio.`
        : `Siamo felici di invitarvi al nostro matrimonio.`;

    const testoViaggio = singolo
        ? `Se desideri darci una mano a partire, ecco il nostro salvadanaio digitale:`
        : `Se desiderate darci una mano a partire, ecco il nostro salvadanaio digitale:`;

    const testoConferma = singolo
        ? `Confermi la tua presenza?`
        : `Confermate la vostra presenza?`;

    div.innerHTML = `
        <img src="${imgSrc}" alt="Partecipazione" style="width:100%; max-width:500px; border-radius:12px; margin-bottom:20px;">

        <h2>Ciao ${invitato.nome}!</h2>
        <p>${testoInvito}</p>
        <p>Abbiamo già tutto… tranne forse il viaggio di nozze.</p>
        <p>${testoViaggio}</p>
        <p><strong>Alessandro Albertini – Deborah Pennetta</strong></p>
        <p><strong>IBAN: IT93T0538751530000049542558</strong></p>
        <p><strong>Causale: Matrimonio Alessandro e Deborah</strong></p>

        <h3>${testoConferma}</h3>
        <button onclick="conferma(${id}, 'si')" class="btn-si">Sì</button>
        <button onclick="conferma(${id}, 'no')" class="btn-no">No</button>
    `;
}

/* ============================================================
   FUNZIONE DI TEST
   ============================================================ */
function testSingoloRapido() {
    let html = "<h2>TEST CAMPO 'singolo'</h2>";
    html += "<p>Valori letti dal file invitati.json:</p>";
    html += "<ul style='font-size:18px; line-height:1.6;'>";

    invitati.forEach(inv => {
        html += `<li><strong>${inv.nome}</strong> → singolo: <strong>${inv.singolo}</strong></li>`;
    });

    html += "</ul>";

    const div = document.getElementById("contenuto") || document.body;
    div.innerHTML = html;
}

/* ============================================================
   FILTRI E RICERCA
   ============================================================ */
function filtro(tipo) {
    filtroAttivo = tipo;
    mostraInvitati();
}

function filtra() {
    ricerca = document.getElementById("search").value.toLowerCase();
    mostraInvitati();
}

/* ============================================================
   ORDINAMENTO
   ============================================================ */
function ordina() {
    invitati.sort((a, b) =>
        ordineAsc
            ? a.nome.localeCompare(b.nome)
            : b.nome.localeCompare(a.nome)
    );
    ordineAsc = !ordineAsc;
    mostraInvitati();
}

/* ============================================================
   GENERA LINK
   ============================================================ */
function generaLink(id) {
    const base = window.location.origin + window.location.pathname.replace("admin.html", "");
    const link = `${base}?id=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiato:\n" + link);
}

/* ============================================================
   MOSTRA TABELLA ADMIN
   ============================================================ */
async function mostraInvitati() {
    const tab = document.getElementById("tabella");
    if (!tab) return;

    const conferme = await caricaConferme();

    tab.innerHTML = `
        <tr>
            <th onclick="ordina()">Nome</th>
            <th>singolo</th>
            <th>Email</th>
            <th>Stato</th>
            <th>Link</th>
        </tr>
    `;

    invitati
        .filter(inv => {
            const stato = conferme.find(c => c.id == inv.id)?.stato || "in attesa";

            if (filtroAttivo === "confermato" && stato !== "confermato") return false;
            if (filtroAttivo === "non_confermato" && stato !== "non confermato") return false;
            if (filtroAttivo === "attesa" && stato !== "in attesa") return false;

            return inv.nome.toLowerCase().includes(ricerca);
        })
        .forEach(inv => {
            const stato = conferme.find(c => c.id == inv.id)?.stato || "in attesa";

            let badge = "";
            if (stato === "confermato") {
                badge = `<span class="badge verde">✔ Confermato</span>`;
            } else if (stato === "non confermato") {
                badge = `<span class="badge rosso">✖ Non confermato</span>`;
            } else {
                badge = `<span class="badge rosso">⏳ In attesa</span>`;
            }

            tab.innerHTML += `
                <tr>
                    <td>${inv.nome}</td>
                    <td>${inv.singolo}</td>
                    <td>${inv.email}</td>
                    <td>${badge}</td>
                    <td><button onclick="generaLink(${inv.id})">Genera link</button></td>
                </tr>
            `;
        });
}

/* ============================================================
   AVVIO
   ============================================================ */
window.onload = async () => {
    await caricaConfig();
    await caricaDati();

    if (document.getElementById("contenuto")) {
        if (invitati.length > 0) {
            mostraSchedaInvitato();
        } else {
            setTimeout(() => {
                mostraSchedaInvitato();
            }, 200);
        }
    }
};
