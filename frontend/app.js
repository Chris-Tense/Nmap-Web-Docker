let currentSocket = null;
let cancelled = false;

async function scanHost() {

    cancelled = false;

    const target =
        document.getElementById("target").value.trim();

    const profile =
        document.getElementById("profile").value;

    const command =
        document.getElementById("command").value.trim();

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    document.getElementById("progress").value = 0;
    document.getElementById("progressText").textContent = "0%";

    result.textContent = "";
    status.value = "Escaneando...";

    currentSocket = new WebSocket(
        `ws://${window.location.host}/ws/scan`
    );

    currentSocket.onopen = () => {

        currentSocket.send(
            JSON.stringify({
                target,
                profile,
                command
            })
        );
    };

    currentSocket.onmessage = (event) => {

        result.textContent += event.data;

        result.scrollTop =
            result.scrollHeight;

        const progressBar =
            document.getElementById("progress");

        const progressText =
            document.getElementById("progressText");

        const match =
            event.data.match(
                /About\s+([0-9.]+)%\s+done/i
            );

        if (match) {

            const percent =
                parseFloat(match[1]);

            progressBar.value =
                percent;

            progressText.textContent =
                Math.round(percent) + "%";
        }

        if (
            event.data.includes(
                "=== ESCANEO FINALIZADO ==="
            )
        ) {

            progressBar.value = 100;
            progressText.textContent = "100%";
            status.value = "Finalizado";
        }
    };

    currentSocket.onclose = () => {

        currentSocket = null;

        if (cancelled) {

            status.value = "Cancelado";

        } else {

            status.value = "Finalizado";
        }
    };
}

async function cancelScan() {

    cancelled = true;

    try {

        const response = await fetch(
            "/api/cancel",
            {
                method: "POST"
            }
        );

        console.log(
            await response.text()
        );

    } catch (e) {

        console.error(e);
    }

    if (currentSocket) {

        currentSocket.close();
        currentSocket = null;
    }
}

function clearScreen() {

    document.getElementById(
        "target"
    ).value = "";

    document.getElementById(
        "command"
    ).value = "";

    document.getElementById(
        "result"
    ).textContent = "";

    document.getElementById(
        "status"
    ).value = "Listo";

    document.getElementById(
        "profile"
    ).selectedIndex = 0;

    document.getElementById(
        "progress"
    ).value = 0;

    document.getElementById(
        "progressText"
    ).textContent = "0%";
}

async function loadProfiles() {

    try {

        const response =
            await fetch("/api/profiles");

        const profiles =
            await response.json();

        const select =
            document.getElementById(
                "profile"
            );

        select.innerHTML = "";

        profiles.forEach(profile => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = profile;
            option.textContent = profile;

            select.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Error cargando perfiles:",
            error
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProfiles();

        document.getElementById(
            "status"
        ).value = "Listo";

        document.getElementById(
            "progressText"
        ).textContent = "0%";
    }
);

function downloadPDF() {

    window.open(
        "/api/pdf",
        "_blank"
    );
}
