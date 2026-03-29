let invitati = [];
let filtroAttivo = "tutti";
let ricerca = "";

// Carica dati
async function caricaDati() {
    const res = await fetch("data/invitati.json");
    invitati = await res.json();
}

// Login
function login() {
    const pwd = document.getElementById("pwd").value;
    if (pwd === "merate2026") {
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";
        mostraInvitati();
    }
}

// Filtri
function filtro(tipo) {
    filtroAttivo = tipo;
    mostraInvitati();
}

// Ricerca
function filtra() {
    ricerca = document.getElementById("search").value.toLowerCase();
    mostraInvitati();
}

// Mostra tabella
function mostraInvitati() {
    const tab = document.getElementById("tabella");

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
            const stato = localStorage.getItem("invito_" + inv.id) || "in attesa";

            if (filtroAttivo === "confermato" && stato !== "confermato") return false;
            if (filtroAttivo === "attesa" && stato !== "in attesa") return false;

            return inv.nome.toLowerCase().includes(ricerca);
        })
        .forEach(inv => {
            const stato = localStorage.getItem("invito_" + inv.id) || "in attesa";

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

// Ordinamento alfabetico
let ordineAsc = true;
function ordina() {
    invitati.sort((a, b) =>
        ordineAsc
            ? a.nome.localeCompare(b.nome)
            : b.nome.localeCompare(a.nome)
    );
    ordineAsc = !ordineAsc;
    mostraInvitati();
}

// Genera link
function generaLink(id) {
    const base = window.location.origin + window.location.pathname.replace("admin.html", "");
    const link = `${base}?id=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiato:\n" + link);
}

// Pagina invitato
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

    const stato = localStorage.getItem("invito_" + id);

    if (stato === "confermato") {
        div.innerHTML = `<h2>Ciao ${invitato.nome}!</h2><p>Hai già confermato.</p>`;
        return;
    }

    div.innerHTML = `
        <h2>Ciao ${invitato.nome}!</h2>
        <p>Siamo felici di invitarti al nostro matrimonio.</p>
        <button onclick="conferma(${id})">Confermo la mia presenza</button>
    `;
}

function conferma(id) {
    localStorage.setItem("invito_" + id, "confermato");
    document.getElementById("contenuto").innerHTML =
        "<h2>Grazie di cuore! Ti aspettiamo.</h2>";
}

// Avvio
window.onload = async () => {
    await caricaDati();

    if (document.getElementById("contenuto")) {
        mostraSchedaInvitato();
    }
};
