const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const { WebSocketServer } = require("ws");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const http = require("http");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );
});

const server = http.createServer(app);

const wss = new WebSocketServer({
    server,
    path: "/ws/scan"
});

let currentProcess = null;

let lastScan = {
    command: "",
    output: ""
};

const PROFILES = {
    "Regular scan": [],

    "Quick Scan": [
        "-T4",
        "-F"
    ],

    "Intense Scan": [
        "-T4",
        "-F",
        "-v"
    ],

    "Intense scan plus UDP": [
        "-sS",
        "-sU",
        "-T4",
        "-A",
        "-v"
    ],

    "Service Scan": [
        "-sV"
    ],

    "OS Detection": [
        "-O"
    ],

    "Intense scan, all TCP ports": [
        "-p",
        "1-65535",
        "-T4",
        "-A",
        "-v"
    ],

    "Intense scan, no ping": [
        "-T4",
        "-A",
        "-v",
        "-Pn"
    ],

    "Ping scan": [
        "-sn"
    ],

    "Quick scan plus": [
        "-sV",
        "-T4",
        "-O",
        "-F",
        "--version-light"
    ],

    "Quick traceroute": [
        "-sn",
        "--traceroute"
    ],

    "Slow comprehensive scan": [
        "-sS",
        "-sU",
        "-T4",
        "-A",
        "-v",
        "-PE",
        "-PP",
        "-PS80,443",
        "-PA3389",
        "-PU40125",
        "-PY",
        "-g",
        "53",
        "--script",
        "default or (discovery and safe)"
    ],

    "NSE HTTP Title": [
        "--script",
        "http-title"
    ],

    "NSE SSL Certificate": [
        "--script",
        "ssl-cert"
    ],

    "NSE SMB Discovery": [
        "--script",
        "smb-os-discovery"
    ],

    "NSE Vulnerability Scan": [
        "--script",
        "vuln"
    ]
};

app.get("/api/profiles", (req, res) => {
    res.json(
        Object.keys(PROFILES)
    );
});

app.post("/api/cancel", (req, res) => {
    try {

        if (!currentProcess) {
            return res.json({
                status: "idle"
            });
        }

        process.kill(
            currentProcess.pid,
            "SIGKILL"
        );

        currentProcess = null;

        return res.json({
            status: "cancelled"
        });

    } catch (e) {

        return res.status(500).json({
            status: "error",
            message: e.message
        });
    }
});

app.get("/api/pdf", (req, res) => {

    const filename =
        "/app/reports/informe_nmap.pdf";

    if (!fs.existsSync("/app/reports")) {

        fs.mkdirSync(
            "/app/reports",
            { recursive: true }
        );
    }

    const pdf =
        new PDFDocument();

    const stream =
        fs.createWriteStream(filename);

    pdf.pipe(stream);

    pdf.fontSize(20)
       .text("Informe de Escaneo Nmap");

    pdf.moveDown();

    pdf.text(
        `Comando: ${lastScan.command}`
    );

    pdf.moveDown();

    pdf.text(
        lastScan.output || "Sin datos"
    );

    pdf.end();

    stream.on("finish", () => {

        res.download(
            filename,
            "informe_nmap.pdf"
        );
    });

    stream.on("error", err => {

        console.error(err);

        res.status(500).send(
            "Error generando PDF"
        );
    });
});

wss.on("connection", ws => {

    ws.on("message", data => {

        const req =
            JSON.parse(data);

        let cmd;

        if (
            req.command &&
            req.command.trim()
        ) {

            cmd =
                req.command.trim()
                    .split(" ");

            if (
                cmd[0].toLowerCase() !== "nmap"
            ) {
                cmd.unshift("nmap");
            }

        } else {

            cmd = [
                "nmap",
                ...PROFILES[req.profile],
                req.target
            ];
        }

        ws.send(
            `Ejecutando:\n${cmd.join(" ")}\n\n`
        );

        currentProcess =
            spawn(
                cmd[0],
                cmd.slice(1)
            );

        lastScan.command =
            cmd.join(" ");

        lastScan.output = "";

        currentProcess.stdout.on(
            "data",
            chunk => {

                const line =
                    chunk.toString();

                lastScan.output += line;

                ws.send(line);
            }
        );

        currentProcess.stderr.on(
            "data",
            chunk => {

                const line =
                    chunk.toString();

                lastScan.output += line;

                ws.send(line);
            }
        );

        currentProcess.on(
            "close",
            () => {

                currentProcess = null;

                ws.send(
                    "\n\n=== ESCANEO FINALIZADO ===\n"
                );
            }
        );
    });

    ws.on(
        "close",
        () => {

            if (
                currentProcess
            ) {

                process.kill(
                    currentProcess.pid,
                    "SIGKILL"
                );

                currentProcess =
                    null;
            }
        }
    );
});

server.listen(
    5500,
    "0.0.0.0",
    () => {

        console.log(
            "Servidor iniciado en puerto 5500"
        );
    }
);
