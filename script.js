/* ============================================================
   CONFIGURAZIONE
   Inserisci qui l'URL del tuo Google Apps Script
   ============================================================ */
const API_URL = "https://script.google.com/macros/s/AKfycbxbOePOroxSVH9Ttsz8QZZhf3-VxmA89SKeGFHyJKR5NreKfts53Fvpq8gkUgGsJoYFrg/exec";
let CONFIG = {};
let invitati = [];
let filtroAttivo = "tutti";
let ricerca = "";
let ordineAsc = true;

/* ============================================================
   CARICA CONFIGURAZIONE (data, ora, luoghi)
   ============================================================ */
async function caricaConfig() {
    try {
        const res = await fetch("config.json");
        CONFIG = await res.json();

        const heroData = document.getElementById("hero-data");
        const heroRicevimento = document.getElementById("hero-ricevimento");

        if (heroData) {
            heroData.textContent = `${CONFIG.data} – ore ${CONFIG.ora} – ${CONFIG.cerimonia_luogo}`;
        }

        if (heroRicevimento) {
            heroRicevimento.textContent = `A seguire ricevimento presso ${CONFIG.ricevimento_luogo}`;
        }
    } catch (e) {
        console.error("Errore nel caricamento di config.json", e);
    }
}

/* ============================================================
   CARICA LISTA INVITATI
   ============================================================ */
async function caricaDati() {
    const res = await fetch("data/invitati.json");
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
   GOOGLE SHEETS: LETTURA E SCRITTURA
   ============================================================ */
async function caricaConferme() {
    const res = await fetch(API_URL);
    return await res.json();
}

async function conferma(id) {
    const invitato = invitati.find(x => x.id == id);

    if (!invitato) {
        document.getElementById("contenuto").innerHTML =
            "<h2>Invito non valido</h2>";
        return;
    }

    const payload = {
        id: invitato.id,
        nome: invitato.nome,
        telefono: invitato.telefono,
        email: invitato.email,
        stato: "confermato"
    };

    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    document.getElementById("contenuto").innerHTML =
        "<h2>Grazie di cuore! Ti aspettiamo.</h2>";
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

    div.innerHTML = `
        <h2>Ciao ${invitato.nome}!</h2>
        <p>Siamo felici di invitarti al nostro matrimonio.</p>
        <button onclick="conferma(${id})">Confermo la mia presenza</button>
    `;
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
            <th>Telefono</th>
            <th>Email</th>
            <th>Stato</th>
            <th>Link</th>
        </tr>
    `;

    invitati
        .filter(inv => {
            const stato = conferme.find(c => c.id == inv.id)?.stato || "in attesa";

            if (filtroAttivo === "confermato" && stato !== "confermato") return false;
            if (filtroAttivo === "attesa" && stato !== "in attesa") return false;

            return inv.nome.toLowerCase().includes(ricerca);
        })
        .forEach(inv => {
            const stato = conferme.find(c => c.id == inv.id)?.stato || "in attesa";

            const badge = stato === "confermato"
                ? `<span class="badge verde">✔ Confermato</span>`
                : `<span class="badge rosso">⏳ In attesa</span>`;

            tab.innerHTML += `
                <tr>
                    <td>${inv.nome}</td>
                    <td>${inv.telefono}</td>
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
        mostraSchedaInvitato();
    }
};
