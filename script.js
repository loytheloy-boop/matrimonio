let invitati = [];

// Carica il file JSON con la lista degli invitati
async function caricaDati() {
    const res = await fetch("data/invitati.json");
    invitati = await res.json();
}

// Legge un parametro dalla URL (es: ?id=1)
function getParametro(nome) {
    const url = new URL(window.location.href);
    return url.searchParams.get(nome);
}

// Mostra la scheda dell'invitato
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
        div.innerHTML = `
            <h2>Ciao ${invitato.nome}!</h2>
            <p>Hai già confermato la tua presenza.</p>
        `;
        return;
    }

    div.innerHTML = `
        <h2>Ciao ${invitato.nome}!</h2>
        <p>Siamo felici di invitarti al nostro matrimonio.</p>
        <button onclick="conferma(${id})">Confermo la mia presenza</button>
    `;
}

// Salva la conferma dell'invitato
function conferma(id) {
    localStorage.setItem("invito_" + id, "confermato");
    document.getElementById("contenuto").innerHTML =
        "<h2>Grazie di cuore! Ti aspettiamo.</h2>";
}

// Login area riservata
function login() {
    const pwd = document.getElementById("pwd").value;
    if (pwd === "merate2026") {
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";
    }
}

// Mostra la lista degli invitati nell'area admin
function mostraInvitati() {
    const tab = document.getElementById("tabella");
    tab.innerHTML = `
        <tr>
            <th>Nome</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Stato</th>
            <th>Link</th>
        </tr>
    `;

    invitati.forEach(inv => {
        const stato = localStorage.getItem("invito_" + inv.id) || "in attesa";
        tab.innerHTML += `
            <tr>
                <td>${inv.nome}</td>
                <td>${inv.telefono}</td>
                <td>${inv.email}</td>
                <td>${stato}</td>
                <td><button onclick="generaLink(${inv.id})">Genera link</button></td>
            </tr>
        `;
    });
}

// Genera il link personalizzato per un invitato
function generaLink(id) {
    const base = window.location.origin + window.location.pathname.replace("admin.html", "");
    const link = `${base}?id=${id}`;
    copia(link);
    alert("Link copiato negli appunti:\n" + link);
}

// Copia un testo negli appunti
function copia(testo) {
    navigator.clipboard.writeText(testo);
}

// BLOCCO FINALE CORRETTO PER GITHUB PAGES
window.onload = async () => {
    await caricaDati();

    const path = window.location.pathname;

    // Funziona sia in locale che su GitHub Pages
    if (
        path.endsWith("/") ||
        path.endsWith("/index.html") ||
        path.includes("matrimonio")
    ) {
        if (document.getElementById("contenuto")) {
            mostraSchedaInvitato();
        }
    }
};

