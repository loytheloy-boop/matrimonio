let invitati = [];

async function caricaDati() {
    const res = await fetch("data/invitati.json");
    invitati = await res.json();
}

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
        div.innerHTML = `<h2>Ciao ${invitato.nome}!</h2>
                         <p>Hai già confermato la tua presenza.</p>`;
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

function login() {
    const pwd = document.getElementById("pwd").value;
    if (pwd === "merate2026") {
        document.getElementById("login").style.display = "none";
        document.getElementById("admin-area").style.display = "block";
    }
}

function mostraInvitati() {
    const tab = document.getElementById("tabella");
    tab.innerHTML = `
        <tr><th>Nome</th><th>Telefono</th><th>Email</th><th>Stato</th></tr>
    `;

    invitati.forEach(inv => {
        const stato = localStorage.getItem("invito_" + inv.id) || "in attesa";
        tab.innerHTML += `
            <tr>
                <td>${inv.nome}</td>
                <td>${inv.telefono}</td>
                <td>${inv.email}</td>
                <td>${stato}</td>
            </tr>
        `;
    });
}

window.onload = async () => {
    await caricaDati();
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
        mostraSchedaInvitato();
    }
};

