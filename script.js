class FileSystem {
    constructor() {
        if (FileSystem.instance) {
            return FileSystem.instance;
        }

        this.fs = {
            notes: {
                type: "folder",
                content: {
                    "welcome.txt": {
                        type: "file",
                        content:
                            "Welcome to Y2K WebOS! (Psst.. Easter egg when you set your year to 2000 in settings!)",
                        modified: new Date().toISOString(),
                    },
                },
            },
            art: {
                type: "folder",
                content: {},
            },
        };

        FileSystem.instance = this;
    }

    saveFile(path, content) {
        const [folder, filename] = path.split("/");

        if (!this.fs[folder]) {
            alert("Please save in notes/ or art/ folder");
            return false;
        }

        if (!filename) {
            alert("Please provide a valid filename.");
            return false;
        }

        this.fs[folder].content[filename] = {
            type: "file",
            content: content,
            modified: new Date().toISOString(),
        };

        return true;
    }

    loadFile(path) {
        const [folder, filename] = path.split("/");
        if (!filename) {
            alert("Invalid file path.");
            return "";
        }
        return this.fs[folder]?.content[filename]?.content || "";
    }

    getStructure() {
        return this.fs;
    }
}

const fileSystem = new FileSystem();

class AppManager {
    static apps = {
        Notepad: {
            create: () => {
                return `
      <div class="notepad">
        <div class="toolbar">
          <button class="save-btn">Save</button>
        </div>
        <textarea class="notepad-content"></textarea>
      </div>`;
            },
            init: (window, readOnly = false) => {
                const textarea = window.querySelector(".notepad-content");
                const saveBtn = window.querySelector(".save-btn");
                const defaultFolder = "notes";

                if (readOnly) {
                    textarea.disabled = true;
                    saveBtn.style.display = "none";
                }

                saveBtn.onclick = () => {
                    showModal(`
                <h3>Save File</h3>
                <input type="text" id="modal-filename" placeholder="filename.txt" />
                <button id="modal-save-btn">Save</button>
            `);

                    document.getElementById("modal-save-btn").onclick = () => {
                        const filename = document
                            .getElementById("modal-filename")
                            .value.trim();
                        if (!filename) {
                            showModal(`
                        <h3>Error</h3>
                        <p>Please enter a filename.</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            return;
                        }

                        const path = `${defaultFolder}/${filename}`;
                        const content = textarea.value;

                        if (fileSystem.saveFile(path, content)) {
                            showModal(`
                        <h3>Success</h3>
                        <p>File saved successfully!</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            windowManager.refreshAppWindow("My Files");
                        } else {
                            showModal(`
                        <h3>Error</h3>
                        <p>Failed to save file. Ensure you are saving in the correct folder.</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                        }
                    };
                };
            },
        },
        Paint: {
            create: () => {
                return `
      <div class="paint">
        <div class="paint-tools">
          <input type="color" value="#000000">
          <input type="range" min="1" max="20" value="5">
          <button class="clear-btn">Clear</button>
          <button class="save-btn">Save</button>
        </div> <br>
        <canvas class="paint-canvas"></canvas>
      </div>`;
            },
            init: (window) => {
                const canvas = window.querySelector(".paint-canvas");
                const ctx = canvas.getContext("2d");
                let painting = false;
                let lastX, lastY;

                canvas.width = window.clientWidth - 40;
                canvas.height = window.clientHeight - 100;

                function draw(e) {
                    if (!painting) return;
                    const color = window.querySelector('input[type="color"]').value;
                    const size = window.querySelector('input[type="range"]').value;

                    ctx.lineWidth = size;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = color;

                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.stroke();

                    [lastX, lastY] = [x, y];
                }

                canvas.onmousedown = (e) => {
                    painting = true;
                    const rect = canvas.getBoundingClientRect();
                    [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
                };

                canvas.onmouseup = () => (painting = false);
                canvas.onmousemove = draw;
                canvas.onmouseleave = () => (painting = false);

                window.querySelector(".clear-btn").onclick = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                };

                window.querySelector(".save-btn").onclick = () => {
                    showModal(`
        <h3>Save Drawing</h3>
        <input type="text" id="modal-filename" placeholder="drawing.png" />
        <button id="modal-save-btn">Save</button>
      `);

                    document.getElementById("modal-save-btn").onclick = () => {
                        const filename = document
                            .getElementById("modal-filename")
                            .value.trim();
                        if (!filename) {
                            showModal(`
            <h3>Error</h3>
            <p>Please enter a filename.</p>
            <button id="modal-close-btn">Close</button>
          `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            return;
                        }

                        const defaultFolder = "art";
                        const imageData = canvas.toDataURL("image/png");
                        const path = `${defaultFolder}/${filename}`;

                        if (fileSystem.saveFile(path, imageData)) {
                            showModal(`
            <h3>Success</h3>
            <p>Image saved successfully!</p>
            <button id="modal-close-btn">Close</button>
          `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                            windowManager.refreshAppWindow("My Files");
                        } else {
                            showModal(`
            <h3>Error</h3>
            <p>Failed to save image. Ensure you are saving in the correct folder.</p>
            <button id="modal-close-btn">Close</button>
          `);
                            document.getElementById("modal-close-btn").onclick = hideModal;
                        }
                    };
                };
            },
        },
        Calculator: {
            create: () => {
                return `
            <div class="calculator">
                <input type="text" class="calc-display" readonly value="0">
                <div class="calc-buttons">
                    ${[7, 8, 9, "+"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[4, 5, 6, "-"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[1, 2, 3, "*"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                    <br>
                    ${[0, "C", "=", "/"]
                        .map(
                            (btn) =>
                                `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                        )
                        .join("")}
                        </div>
                    </div>`;
            },
            init: (window) => {
                const display = window.querySelector(".calc-display");
                const calculator = new Calculator();

                window.querySelectorAll(".calc-btn").forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const value = btn.dataset.value;
                        display.value = calculator.handleInput(value);
                    });
                });
            },
        },
        Browser: {
            create: () => {
                return `
    <div class="retro-browser">
        <div class="browser-banner">
            <img src="browserbanner.png" alt="Browser Banner" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="browser-toolbar">
            <input type="text" class="search-bar" placeholder="Search the web..." />
            <button class="search-btn">Search</button>
        </div>
    </div>
`;
            },
            init: (appWindow) => {
                const searchBtn = appWindow.querySelector(".search-btn");
                const searchBar = appWindow.querySelector(".search-bar");

                searchBtn.onclick = () => {
                    const query = searchBar.value.trim();
                    if (query === "") {
                        showModal(`
                <h3>Error</h3>
                <p>Please enter a search query.</p>
                <button id="modal-close-btn">Close</button>
              `);
                        document.getElementById("modal-close-btn").onclick = hideModal;
                        return;
                    }

                    const url =
                        "https://www.google.com/search?q=" + encodeURIComponent(query);
                    window.open(url, "_blank");
                };
            },
        },
        "My Files": {
            create: () => {
                const structure = fileSystem.getStructure();

                return `
                    <div class="file-explorer">
                        ${Object.entries(structure)
                        .map(
                            ([folder, data]) => `
                            <div class="folder">
                                <div class="folder-header">
                                    <img src="icons/file.png" width="32" height="32">
                                    <span>${folder}</span>
                            </div>
                                <div class="folder-content">
                                    ${Object.entries(data.content)
                                    .map(
                                        ([filename, file]) => `
                                        <div class="file-item" data-path="${folder}/${filename}">
                                            <img src="${filename
                                                .toLowerCase()
                                                .endsWith(".png")
                                                ? "icons/picture.png"
                                                : "icons/notepad.png"
                                            }" width="32" height="32">
                                            <span>${filename}</span>
                                        </div>
                                    `
                                    )
                                    .join("")}
                                </div>
                            </div>
                        `
                        )
                        .join("")}
                    </div>`;
            },
            init: (window) => {
                const fileList = window.querySelector(".file-explorer");

                fileList.addEventListener("dblclick", (e) => {
                    const fileItem = e.target.closest(".file-item");
                    if (fileItem) {
                        const path = fileItem.dataset.path;
                        const [folder, ...rest] = path.split("/");
                        const filename = rest.join("/");

                        const extension = filename.split(".").pop().toLowerCase();
                        const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp"];
                        const textExtensions = ["txt", "md", "js", "html", "css"];

                        if (imageExtensions.includes(extension)) {
                            const imageSrc = fileSystem.loadFile(path);
                            const imageViewerContent =
                                AppManager.apps["Image Viewer"].create(imageSrc);
                            windowManager.createWindow(filename, imageViewerContent);
                        } else if (textExtensions.includes(extension)) {
                            const notepadContent = AppManager.apps.Notepad.create();
                            const notepadWindow = windowManager.createWindow(
                                filename,
                                notepadContent
                            );
                            AppManager.apps.Notepad.init(notepadWindow, true);
                            const textarea = notepadWindow.querySelector(".notepad-content");
                            textarea.value = fileSystem.loadFile(path);
                        }
                    }
                });
            },
        },
        "Image Viewer": {
            create: (imageSrc) => {
                return `
            <div class="image-viewer">
              <img src="${imageSrc}" alt="No file opened" style="max-width: 100%; max-height: 100%;" />
            </div>`;
            },
        },
        Codédex: {
            create: () => {
                window.open("https://www.codedex.io/community/hackathon", "_blank");
                return `<div class="codedex">Redirecting to Codédex...</div>`;
            },
        },
        Game: {
            create: () => {
                return `
                    <div class="game-container">
                        <div class="game-instructions">Press SPACE to start/pause. Use arrow keys to move.</div>
                        <canvas id="snake"></canvas>
                    </div>`;
            },
            init: (window) => {
                const canvas = window.querySelector("#snake");
                if (!canvas) {
                    console.error("Canvas with id 'snake' not found.");
                    return;
                }
                const ctx = canvas.getContext("2d");
                const gridSize = 20;
                let snake = [{ x: 10, y: 10 }];
                let food = { x: 15, y: 15 };
                let direction = "right";
                let score = 0;
                let gameRunning = false;
                let gameLoop;

                canvas.width = 400;
                canvas.height = 400;

                document.addEventListener("keydown", (e) => {
                    if (e.code === "Space" && window.style.zIndex === (windowManager.zIndex - 1).toString()) {
                        e.preventDefault();
                        gameRunning = !gameRunning;
                        if (gameRunning) {
                            gameLoop = setInterval(() => {
                                updateGame();
                                drawGame();
                            }, 100);
                        } else {
                            clearInterval(gameLoop);
                        }
                    }
                    if (gameRunning) {
                        switch (e.key) {
                            case "ArrowUp":
                                if (direction !== "down") direction = "up";
                                break;
                            case "ArrowDown":
                                if (direction !== "up") direction = "down";
                                break;
                            case "ArrowLeft":
                                if (direction !== "right") direction = "left";
                                break;
                            case "ArrowRight":
                                if (direction !== "left") direction = "right";
                                break;
                        }
                    }
                });

                function drawGame() {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = "lime";
                    snake.forEach((segment) => {
                        ctx.fillRect(
                            segment.x * gridSize,
                            segment.y * gridSize,
                            gridSize - 2,
                            gridSize - 2
                        );
                    });

                    ctx.fillStyle = "red";
                    ctx.fillRect(
                        food.x * gridSize,
                        food.y * gridSize,
                        gridSize - 2,
                        gridSize - 2
                    );

                    ctx.fillStyle = "white";
                    ctx.font = "20px Arial";
                    ctx.fillText(`Score: ${score}`, 10, 30);
                }

                function updateGame() {
                    const head = { ...snake[0] };

                    switch (direction) {
                        case "up":
                            head.y--;
                            break;
                        case "down":
                            head.y++;
                            break;
                        case "left":
                            head.x--;
                            break;
                        case "right":
                            head.x++;
                            break;
                    }

                    if (
                        head.x < 0 ||
                        head.x >= canvas.width / gridSize ||
                        head.y < 0 ||
                        head.y >= canvas.height / gridSize
                    ) {
                        return gameOver();
                    }

                    if (
                        snake.some(
                            (segment) => segment.x === head.x && segment.y === head.y
                        )
                    ) {
                        return gameOver();
                    }

                    snake.unshift(head);

                    if (head.x === food.x && head.y === food.y) {
                        score += 10;
                        spawnFood();
                    } else {
                        snake.pop();
                    }
                }

                function spawnFood() {
                    food = {
                        x: Math.floor(Math.random() * (canvas.width / gridSize)),
                        y: Math.floor(Math.random() * (canvas.height / gridSize)),
                    };

                    if (
                        snake.some(
                            (segment) => segment.x === food.x && segment.y === food.y
                        )
                    ) {
                        spawnFood();
                    }
                }

                function gameOver() {
                    clearInterval(gameLoop);
                    showModal(`
                        <h3>Game Over!</h3>
                        <p>Your Score: ${score}</p>
                        <button id="modal-close-btn">Close</button>
                    `);
                    document.getElementById("modal-close-btn").onclick = () => {
                        hideModal();
                        snake = [{ x: 10, y: 10 }];
                        direction = "right";
                        score = 0;
                        spawnFood();
                        drawGame();
                        gameRunning = false;
                    };
                }

                drawGame();
            },
        },
        Chat: {
            create: () => {
                return `
            <div class="chat">
                <div class="chat-status"></div>
                <div class="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Type a message..." />
                    <button class="chat-send">Send</button>
                </div>
            </div>`;
            },
            init: (window) => {
                const chatStatus = window.querySelector(".chat-status");
                const chatMessages = window.querySelector(".chat-messages");
                const chatInput = window.querySelector(".chat-input");
                const chatSend = window.querySelector(".chat-send");
                let ws;

                function connect() {
                    ws = new WebSocket("wss://y2kos.onrender.com");

                    ws.onopen = () => {
                        chatStatus.innerHTML = "● Connected";
                        chatStatus.style.color = "#0f0";
                        chatSend.disabled = false;
                        chatInput.disabled = false;
                    };

                    ws.onclose = () => {
                        chatStatus.innerHTML = "● Disconnected - Reconnecting...";
                        chatStatus.style.color = "#f00";
                        chatSend.disabled = true;
                        chatInput.disabled = true;
                        setTimeout(connect, 5000);
                    };

                    ws.onmessage = (event) => {
                        try {
                            if (event.data instanceof Blob) {
                                event.data
                                    .text()
                                    .then((text) => {
                                        const data = JSON.parse(text);
                                        addMessage(data.username, data.message);
                                    })
                                    .catch((error) => {
                                        console.error("Error parsing message:", error);
                                    });
                            } else {
                                const data = JSON.parse(event.data);
                                addMessage(data.username, data.message);
                            }
                        } catch (error) {
                            console.error("Error handling message:", error);
                        }
                    };

                    ws.onerror = (error) => {
                        console.error("WebSocket error:", error);
                        chatStatus.innerHTML = "● Error connecting";
                        chatStatus.style.color = "#f00";
                    };
                }

                const userId = Array(4)
                    .fill(0)
                    .map(() => {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        return chars.charAt(Math.floor(Math.random() * chars.length));
                    })
                    .join("");

                function addMessage(username, message) {
                    const messageDiv = document.createElement("div");
                    messageDiv.className = "chat-message";
                    messageDiv.innerHTML = `
            <span class="chat-username">${username}:</span>
            <span class="chat-text">${message}</span>
            <span class="chat-time">${new Date().toLocaleTimeString()}</span>
        `;
                    chatMessages.appendChild(messageDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                function sendMessage() {
                    const message = chatInput.value.trim();
                    if (message && ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: "message",
                                username: `User [${userId}]`,
                                message: message,
                            })
                        );
                        chatInput.value = "";
                    }
                }

                chatSend.onclick = sendMessage;
                chatInput.onkeypress = (e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                };

                connect();

                return () => {
                    if (ws) {
                        ws.close();
                    }
                };
            },
        },
        Settings: {
            create: () => {
                return `
                <div class="settings">
                    <div class="settings-section">
                        <h3>System Colors</h3>
                        <div class="color-grid">
                            <div class="color-option">
                                <label for="button-color">Button Color:</label>
                                <input type="color" id="button-color" name="button-color" value="#c0c0c0">
                            </div>
                            <div class="color-option">
                                <label for="taskbar-color">Taskbar Color:</label>
                                <input type="color" id="taskbar-color" name="taskbar-color" value="#d2a4a4">
                            </div>
                            <div class="color-option">
                                <label for="window-title-color">Window Title Color:</label>
                                <input type="color" id="window-title-color" name="window-title-color" value="#f2426b">
                            </div>
                            <div class="color-option">
                                <label for="close-btn-color">Close Button Color:</label>
                                <input type="color" id="close-btn-color" name="close-btn-color" value="#eeeb12">
                            </div>
                            <div class="color-option">
                                <label for="min-btn-color">Minimize Button Color:</label>
                                <input type="color" id="min-btn-color" name="min-btn-color" value="#c0c0c0">
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Date & Time</h3>
                        <div class="date-settings">                            
                            <label for="custom-year">Set Year:</label>
                            <input type="number" id="custom-year" min="1970" max="2100" value="1999">
                        </div>
                    </div>
                    <button id="save-settings-btn">Save Settings</button>
                </div>`;
            },
            init: (window) => {
                const inputs = {
                    buttonColor: window.querySelector("#button-color"),
                    taskbarColor: window.querySelector("#taskbar-color"),
                    windowTitleColor: window.querySelector("#window-title-color"),
                    closeBtnColor: window.querySelector("#close-btn-color"),
                    minBtnColor: window.querySelector("#min-btn-color"),
                    customYear: window.querySelector("#custom-year"),
                };

                const saveBtn = window.querySelector("#save-settings-btn");

                saveBtn.onclick = () => {
                    Object.entries(inputs).forEach(([key, input]) => {
                        updateColor(key, input.value);
                    });

                    checkY2K(inputs.customYear.value);

                    showModal(`
                    <h3>Success</h3>
                    <p>Settings have been saved.</p>
                    <button id="modal-close-btn">Close</button>
                `);
                    document.getElementById("modal-close-btn").onclick = hideModal;
                };

                function updateColor(key, value) {
                    const cssVarMap = {
                        buttonColor: "--button-color",
                        taskbarColor: "--taskbar-color",
                        windowTitleColor: "--window-title-color",
                        closeBtnColor: "--close-btn-color",
                        minBtnColor: "--min-btn-color",
                    };

                    if (cssVarMap[key]) {
                        document.documentElement.style.setProperty(cssVarMap[key], value);
                    }
                }

                function checkY2K(year) {
                    if (year === "2000") {
                        triggerY2KEvent();
                    }
                }

                function createFireworks() {
                    const fireworksContainer = document.querySelector(".fireworks");
                    const canvas = document.createElement("canvas");
                    fireworksContainer.appendChild(canvas);
                    const ctx = canvas.getContext("2d");
                    canvas.width = fireworksContainer.offsetWidth;
                    canvas.height = fireworksContainer.offsetHeight;

                    window.addEventListener("resize", () => {
                        canvas.width = fireworksContainer.offsetWidth;
                        canvas.height = fireworksContainer.offsetHeight;
                    });

                    const particles = [];
                    const fireworks = [];
                    const gravity = 0.05;

                    class Particle {
                        constructor(x, y, color) {
                            this.x = x;
                            this.y = y;
                            this.radius = 2;
                            this.color = color;
                            this.speed = Math.random() * 3 + 1;
                            this.angle = Math.random() * Math.PI * 2;
                            this.velocityX = Math.cos(this.angle) * this.speed;
                            this.velocityY = Math.sin(this.angle) * this.speed;
                            this.alpha = 1;
                        }

                        update() {
                            this.velocityY += gravity;
                            this.x += this.velocityX;
                            this.y += this.velocityY;
                            this.alpha -= 0.01;
                        }

                        draw() {
                            ctx.save();
                            ctx.globalAlpha = this.alpha;
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                            ctx.fillStyle = this.color;
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    class Firework {
                        constructor(x, y) {
                            this.x = x;
                            this.y = y;
                            this.targetY = (Math.random() * canvas.height) / 2;
                            this.exploded = false;
                            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                        }

                        update() {
                            this.y -= 2;
                            if (this.y <= this.targetY && !this.exploded) {
                                this.exploded = true;
                                this.explode();
                            }
                        }

                        explode() {
                            const particleCount = 100;
                            new Audio("sfx/blast.mp3").play();
                            for (let i = 0; i < particleCount; i++) {
                                particles.push(new Particle(this.x, this.y, this.color));
                            }
                        }

                        draw() {
                            if (!this.exploded) {
                                ctx.beginPath();
                                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                                ctx.fillStyle = this.color;
                                ctx.fill();
                            }
                        }
                    }

                    function launchFirework() {
                        const x = Math.random() * canvas.width;
                        const y = canvas.height;
                        fireworks.push(new Firework(x, y));
                    }

                    function animate() {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        fireworks.forEach((firework, index) => {
                            firework.update();
                            firework.draw();
                            if (firework.exploded) {
                                fireworks.splice(index, 1);
                            }
                        });

                        particles.forEach((particle, index) => {
                            particle.update();
                            particle.draw();
                            if (particle.alpha <= 0) {
                                particles.splice(index, 1);
                            }
                        });

                        requestAnimationFrame(animate);
                    }

                    launchFirework();
                    setInterval(launchFirework, 500);
                    animate();
                }

                function triggerY2KEvent() {
                    const errors = [
                        "CRITICAL ERROR: System time corruption detected",
                        "WARNING: Date overflow imminent",
                        "FATAL ERROR: Memory allocation failed",
                        "ERROR: Operating system crash detected",
                        "SYSTEM FAILURE: Time paradox detected",
                    ];
                    let errorIndex = 0;

                    function showNextError() {
                        if (errorIndex < errors.length) {
                            showModal(`
                            <h3 style="color:red">SYSTEM ERROR</h3>
                            <p>${errors[errorIndex]}</p>
                            <div class="error-code">Code: Y2K-${Math.floor(
                                Math.random() * 9999
                            )}</div>
                        `);
                            const errorSound = new Audio("sfx/error.mp3");
                            errorSound.play().catch(() => { });
                            errorIndex++;
                            setTimeout(showNextError, 1000);
                        } else {
                            hideModal();
                            startDramaticSequence();
                        }
                    }

                    function startDramaticSequence() {
                        const messages = [
                            { text: "But wait", delay: 1000 },
                            { text: "But wait.", delay: 1000 },
                            { text: "But wait..", delay: 1000 },
                            { text: "But wait...", delay: 2000 },
                        ];
                        let messageIndex = 0;

                        function showMessage() {
                            if (messageIndex < messages.length) {
                                document.body.innerHTML = `
                                <div style="color:black; font-family:monospace; font-size:24px; text-align:center; margin-top:40vh;">
                                    ${messages[messageIndex].text}
                                </div>
                            `;
                                messageIndex++;
                                setTimeout(showMessage, messages[messageIndex - 1].delay);
                            } else {
                                startBlackout();
                            }
                        }
                        showMessage();
                    }

                    function startBlackout() {
                        document.body.style.transition = "all 1s";
                        document.body.style.background = "#000";
                        document.body.style.backgroundImage = "none";
                        document.body.innerHTML = "";

                        setTimeout(showCelebration, 5000);

                        new Audio("sfx/grand.mp3").play();
                    }

                    function showCelebration() {
                        document.body.innerHTML = `
        <div class="y2k-celebration" style="
            text-align: center; 
            padding-top: 10vh;
            position: relative;
            overflow: hidden;
            background: black;
            height: 100vh;
        ">
            <div class="fireworks" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            "></div>
            <div class="celebration-text" style="
                position: relative;
                z-index: 2;
                pointer-events: none;
            ">
                <h1 style="
                    color: gold; 
                    font-size: 48px; 
                    text-shadow: 0 0 10px #fff;
                    opacity: 0;
                    transition: opacity 3s;
                ">Welcome to 2000!</h1>
                <h2 style="
                    color: silver;
                    opacity: 0;
                    transition: opacity 3s;
                    transition-delay: 2s;
                    margin-top: 20px;
                ">We Made It!</h2>
            </div>
        </div>
    `;

                        setTimeout(() => {
                            const h1 = document.querySelector(".celebration-text h1");
                            const h2 = document.querySelector(".celebration-text h2");
                            if (h1) h1.style.opacity = "1";
                            if (h2) h2.style.opacity = "1";
                        }, 100);

                        createFireworks();

                        setTimeout(showEndScreen, 20000);
                    }

                    function showEndScreen() {
                        document.body.innerHTML = `
                        <div style="
                            text-align:center; 
                            padding-top:30vh; 
                            background:black; 
                            height:100vh;
                            transition: opacity 2s;
                        ">
                            <h1 style="color:white; font-size:36px;">Thanks for playing!</h1>
                            <p style="color:#888;">Created by Candy for Codédex Holiday Hackathon 2024</p>
                            <button onclick="location.reload()" style="
                                margin-top:20px; 
                                padding:10px 20px;
                                background: #333;
                                color: white;
                                border: 1px solid #fff;
                                cursor: pointer;
                            ">
                                Restart System
                            </button>
                        </div>
                    `;
                    }

                    showNextError();
                }
            },
        },
    };
}

class Calculator {
    constructor() {
        this.display = "";
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
    }

    clear() {
        this.display = "";
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
        return "0";
    }

    calculate() {
        if (this.previousValue === null || this.operation === null)
            return this.display;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.display);
        let result = 0;

        switch (this.operation) {
            case "+":
                result = prev + current;
                break;
            case "-":
                result = prev - current;
                break;
            case "*":
                result = prev * current;
                break;
            case "/":
                result = current !== 0 ? prev / current : "Error";
                break;
        }

        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
        return result.toString();
    }

    handleInput(value) {
        if (value === "C") {
            return this.clear();
        }

        if (value === "=") {
            this.display = this.calculate();
            return this.display;
        }

        if ("+-*/".includes(value)) {
            if (this.previousValue !== null) {
                this.display = this.calculate();
            }
            this.previousValue = this.display;
            this.operation = value;
            this.newNumber = true;
            return this.display;
        }

        if (this.newNumber) {
            this.display = value;
            this.newNumber = false;
        } else {
            this.display += value;
        }
        return this.display;
    }
}

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.zIndex = 100;
    }

    createWindow(title, content) {
        const win = document.createElement("div");
        win.className = "window";
        win.style.zIndex = this.zIndex++;
        win.style.left = "50px";
        win.style.top = "50px";

        win.innerHTML = `
            <div class="window-title">
                <span>${title}</span>
                <div class="window-controls">
                    <div class="window-button minimize-button"></div>
                    <div class="window-button close-button"></div>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;

        document.getElementById("desktop").appendChild(win);
        this.makeDraggable(win);
        this.setupControls(win);
        this.windows.set(win, title);

        if (AppManager.apps[title]?.init) {
            AppManager.apps[title].init(win);
        }

        return win;
    }

    makeDraggable(win) {
        const title = win.querySelector(".window-title");
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        let dragTimeout = null;

        title.onmousedown = dragMouseDown;

        const self = this;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDragChoppy;
            win.style.zIndex = self.zIndex++;
        }

        function elementDrag(e) {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            win.style.top = win.offsetTop - pos2 + "px";
            win.style.left = win.offsetLeft - pos1 + "px";
        }

        function elementDragChoppy(e) {
            if (!dragTimeout) {
                dragTimeout = setTimeout(() => {
                    elementDrag(e);
                    dragTimeout = null;
                }, 50);
            }
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            if (dragTimeout) {
                clearTimeout(dragTimeout);
                dragTimeout = null;
            }
        }
    }

    setupControls(win) {
        win.querySelector(".close-button").onclick = () => {
            const title = this.windows.get(win);
            win.remove();
            this.windows.delete(win);
            const icon = document.querySelector(`.icon[data-app="${title}"]`);
            if (icon) {
                icon.style.backgroundColor = "";
            }
        };

        win.querySelector(".minimize-button").onclick = () => {
            win.style.display = "none";
        };
    }

    refreshAppWindow(appName) {
        this.windows.forEach((title, win) => {
            if (title === appName) {
                win.querySelector(".window-content").innerHTML =
                    AppManager.apps[appName].create();
                AppManager.apps[appName].init(win);
            }
        });
    }
}

const windowManager = new WindowManager();

const desktopIcons = [
    { name: "My Files", icon: "icons/file.png" },
    { name: "Browser", icon: "icons/browser.png" },
    { name: "Notepad", icon: "icons/notepad.png" },
    { name: "Calculator", icon: "icons/calculator.png" },
    { name: "Paint", icon: "icons/paint.png" },
    { name: "Image Viewer", icon: "icons/picture.png" },
    { name: "Codédex", icon: "icons/code.png" },
    { name: "Game", icon: "icons/snake.png" },
    { name: "Settings", icon: "icons/gear.png" },
    { name: "Chat", icon: "icons/chat.png" },
];

const iconsPerColumn = 5;
const columns = Math.ceil(desktopIcons.length / iconsPerColumn);

document.getElementById("desktop").innerHTML = Array(columns)
    .fill()
    .map(
        (_, colIndex) => `
        <div class="icon-column" style="position: absolute; left: ${colIndex * 100
            }px;">
            ${desktopIcons
                .slice(colIndex * iconsPerColumn, (colIndex + 1) * iconsPerColumn)
                .map(
                    ({ name, icon }) => `
                    <div class="icon" data-app="${name}">
                        <div class="icon-image" style="background-image: url('${icon}')"></div>
                        <span>${name}</span>
                    </div>
                `
                )
                .join("")}
        </div>
    `
    )
    .join("");

document.querySelectorAll(".icon").forEach((icon) => {
    icon.addEventListener("click", () => {
        const appName = icon.dataset.app;
        let existingWindow = null;

        windowManager.windows.forEach((title, win) => {
            if (title === appName) {
                existingWindow = win;
            }
        });

        if (existingWindow) {
            existingWindow.style.display = "block";
            existingWindow.style.zIndex = windowManager.zIndex++;
        } else {
            const app = AppManager.apps[appName];
            let content = app.create();

            icon.style.backgroundColor = "rgba(255,255,255,0.2)";
            windowManager.createWindow(appName, content);
        }
    });
});

function showModal(contentHTML) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = contentHTML;
    modal.style.display = "block";
}

function hideModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

document.getElementById("modal-close").onclick = hideModal;

window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        hideModal();
    }
};

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const defaultDate = new Date(now);
    defaultDate.setFullYear(1999);
    const date = window.customDate || defaultDate.toLocaleDateString();
    document.querySelector(".taskbar-right").innerHTML = `
        <div>${time}</div>
        <div>${date}</div>
    `;
}

const taskbarRight = document.createElement("div");
taskbarRight.className = "taskbar-right";
document.getElementById("taskbar").appendChild(taskbarRight);

setInterval(updateClock, 1000);
updateClock();

function openWelcomeFile() {
    const path = "notes/welcome.txt";
    const content = fileSystem.loadFile(path);

    const notepadContent = AppManager.apps.Notepad.create();
    const notepadWindow = windowManager.createWindow("Welcome", notepadContent);
    const textarea = notepadWindow.querySelector(".notepad-content");

    textarea.value = content;
    AppManager.apps.Notepad.init(notepadWindow, true);
}

const bootScreen = document.getElementById("boot-screen");
let bootText = bootScreen.innerHTML;
bootScreen.innerHTML = "";

let charIndex = 0;
const typeSpeed = 10;

function typeText() {
    if (charIndex < bootText.length) {
        bootScreen.innerHTML += bootText.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, typeSpeed);
    } else {
        const boot = new Audio("sfx/boot.mp3");
        setTimeout(() => {
            bootScreen.classList.add("fade-out");
            boot.play();
            setTimeout(openWelcomeFile, 1500);
        }, 1000);
    }
}

setTimeout(typeText, 500);
