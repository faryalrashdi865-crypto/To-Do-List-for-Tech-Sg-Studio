// ============================================================
// MY CONSTELLATION — Mission Control
// ============================================================

const $ = (selector) => document.querySelector(selector);

// ------------------------------------------------------------
// ELEMENTS
// ------------------------------------------------------------

const taskForm = $("#taskForm");
const taskInput = $("#taskInput");
const priorityInput = $("#priorityInput");
const categoryInput = $("#categoryInput");

const todayLabel = $("#todayLabel");
const starfield = $("#starfield");

const skyPanel = $("#skyPanel");
const skyEmpty = $("#skyEmpty");
const skyStatus = $("#skyStatus");
const skyCaption = $("#skyCaption");

const connectorGroup = $("#connectorGroup");
const starGroup = $("#starGroup");
const orbitGroup = $("#orbitGroup");

const constellationToast = $("#constellationToast");

const detailCard = $("#detailCard");
const detailText = $("#detailText");
const detailDate = $("#detailDate");
const detailPriority = $("#detailPriority");
const detailCategory = $("#detailCategory");

const detailToggle = $("#detailToggle");
const detailDelete = $("#detailDelete");
const detailClose = $("#detailClose");

const viewToggle = $("#viewToggle");
const listView = $("#listView");
const taskList = $("#taskList");
const emptyState = $("#emptyState");

const clearCompleted = $("#clearCompleted");

const progressRing = $("#progressRing");
const progressPercent = $("#progressPercent");
const progressSummary = $("#progressSummary");
const progressDetail = $("#progressDetail");

const totalCount = $("#totalCount");
const doneCount = $("#doneCount");
const activeCount = $("#activeCount");

const levelBadge = $("#levelBadge");

const orbitTitle = $("#orbitTitle");
const orbitText = $("#orbitText");

const celebration = $("#celebration");

// ------------------------------------------------------------
// APP STATE
// ------------------------------------------------------------

const STORAGE_KEY = "my-constellation-tasks-v2";

let tasks = loadTasks();

let selectedId = null;

let showingList = false;

let previouslyComplete = false;

// ------------------------------------------------------------
// DATE
// ------------------------------------------------------------

todayLabel.textContent = new Date().toLocaleDateString(
    undefined,
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
);


// ------------------------------------------------------------
// DATE HELPERS
// ------------------------------------------------------------

function formatDate(iso) {

    const date = iso
        ? new Date(iso)
        : new Date();

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function formatTime(iso) {

    const date = iso
        ? new Date(iso)
        : new Date();

    return date.toLocaleTimeString(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ------------------------------------------------------------
// LOCAL STORAGE
// ------------------------------------------------------------

function loadTasks() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved
            .map(task => ({

                id:
                    Number(task.id)
                    || Date.now()
                    + Math.random(),

                text:
                    String(task.text || "")
                    .trim(),

                done:
                    Boolean(task.done),

                priority:
                    task.priority || "medium",

                category:
                    task.category || "general",

                createdAt:
                    task.createdAt
                    || new Date().toISOString()

            }))
            .filter(task => task.text);

    } catch {

        return [];
    }
}


function save() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


// ------------------------------------------------------------
// BACKGROUND STARFIELD
// ------------------------------------------------------------

function buildStarfield(count = 95) {

    const fragment =
        document.createDocumentFragment();

    for (let i = 0; i < count; i++) {

        const dot =
            document.createElement("span");

        dot.className =
            Math.random() < 0.18
                ? "bg-star bright"
                : "bg-star";

        dot.style.left =
            `${Math.random() * 100}%`;

        dot.style.top =
            `${Math.random() * 100}%`;

        dot.style.animationDelay =
            `${(Math.random() * 4).toFixed(2)}s`;

        dot.style.animationDuration =
            `${(2.4 + Math.random() * 3).toFixed(2)}s`;

        fragment.appendChild(dot);
    }

    starfield.appendChild(fragment);
}


buildStarfield();


// ------------------------------------------------------------
// SHOOTING STAR
// ------------------------------------------------------------

function fireShootingStar() {

    const star =
        document.createElement("div");

    star.className =
        "shooting-star";

    star.style.setProperty(
        "--sy",
        `${8 + Math.random() * 42}%`
    );

    document.body.appendChild(star);

    star.addEventListener(
        "animationend",
        () => star.remove(),
        { once: true }
    );
}


// ------------------------------------------------------------
// TOAST MESSAGE
// ------------------------------------------------------------

function showToast(message) {

    constellationToast.textContent =
        message;

    constellationToast.classList.remove(
        "show"
    );

    void constellationToast.offsetWidth;

    constellationToast.classList.add(
        "show"
    );
}


// ------------------------------------------------------------
// CONSTELLATION POSITION
// ------------------------------------------------------------

function hashPosition(id, index = 0) {

    const n1 =
        Math.abs(
            Math.sin(
                Number(id)
                * 12.9898
                + index * 4.17
            )
            * 43758.5453
        ) % 1;

    const n2 =
        Math.abs(
            Math.sin(
                Number(id)
                * 78.233
                + index * 8.91
            )
            * 12543.123
        ) % 1;

    return {

        x: 8 + n1 * 84,

        y: 9 + n2 * 43

    };
}


// ------------------------------------------------------------
// SVG CREATOR
// ------------------------------------------------------------

function createSvgElement(
    name,
    attrs = {}
) {

    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            name
        );

    Object.entries(attrs).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                value
            );

        }
    );

    return element;
}


// ------------------------------------------------------------
// RENDER CONSTELLATION
// ------------------------------------------------------------

function renderSky() {

    connectorGroup.innerHTML = "";

    starGroup.innerHTML = "";

    orbitGroup.innerHTML = "";

    skyEmpty.hidden =
        tasks.length > 0;


    // Empty constellation

    if (!tasks.length) {

        skyStatus.textContent =
            "0 / 0 stars illuminated";

        skyCaption.textContent =
            "Your tasks become stars. Complete them to light the sky.";

        return;
    }


    // Decorative orbit

    const orbit =
        createSvgElement(
            "ellipse",
            {
                cx: "50",
                cy: "29",
                rx: "38",
                ry: "19",
                fill: "none",
                stroke:
                    "rgba(116, 137, 255, .08)",
                "stroke-width": ".25",
                "stroke-dasharray": "1 2"
            }
        );

    orbitGroup.appendChild(orbit);


    // Connect stars

    for (
        let i = 1;
        i < tasks.length;
        i++
    ) {

        const previous =
            hashPosition(
                tasks[i - 1].id,
                i - 1
            );

        const current =
            hashPosition(
                tasks[i].id,
                i
            );

        const line =
            createSvgElement(
                "line",
                {
                    class:
                        "task-connector"
                        +
                        (
                            tasks[i - 1].done
                            && tasks[i].done
                                ? " lit"
                                : ""
                        ),

                    x1: previous.x,

                    y1: previous.y,

                    x2: current.x,

                    y2: current.y
                }
            );

        connectorGroup.appendChild(line);
    }


    // Create task stars

    tasks.forEach(
        (task, index) => {

            const pos =
                hashPosition(
                    task.id,
                    index
                );

            const group =
                createSvgElement("g");

            const isSelected =
                task.id === selectedId;

            const isUrgent =
                task.priority === "urgent";

            const isHigh =
                task.priority === "high";


            // Selected star ring

            if (isSelected) {

                group.appendChild(

                    createSvgElement(
                        "circle",
                        {
                            class:
                                "task-star-ring",

                            cx: pos.x,

                            cy: pos.y,

                            r: "3"
                        }
                    )

                );
            }


            // Main star

            const star =
                createSvgElement(
                    "circle",
                    {

                        class:
                            "task-star"

                            + (
                                task.done
                                    ? " lit"
                                    : ""
                            )

                            + (
                                isHigh
                                    ? " high"
                                    : ""
                            )

                            + (
                                isUrgent
                                    ? " urgent"
                                    : ""
                            )

                            + (
                                isSelected
                                    ? " selected"
                                    : ""
                            ),

                        cx: pos.x,

                        cy: pos.y,

                        r:
                            task.done
                                ? 2.45
                                : isUrgent
                                    ? 2.2
                                    : isHigh
                                        ? 1.95
                                        : 1.65,

                        tabindex: "0",

                        role: "button",

                        "aria-label":
                            `${task.text}. ${
                                task.done
                                    ? "Completed."
                                    : "Active."
                            }`

                    }
                );


            star.dataset.id =
                task.id;


            group.appendChild(star);

            starGroup.appendChild(group);

        }
    );


    // Status

    const total =
        tasks.length;

    const done =
        tasks.filter(
            task => task.done
        ).length;


    skyStatus.textContent =
        `${done} / ${total} stars illuminated`;


    if (done === total) {

        skyCaption.textContent =
            "Every mission is complete. Your constellation is fully illuminated.";

    }

    else if (done > 0) {

        skyCaption.textContent =
            `${total - done} mission${
                total - done === 1
                    ? ""
                    : "s"
            } still waiting to become starlight.`;

    }

    else {

        skyCaption.textContent =
            "Your constellation is forming. Complete missions to illuminate it.";

    }
}


// ------------------------------------------------------------
// STAR CLICK
// ------------------------------------------------------------

starGroup.addEventListener(
    "click",
    event => {

        const star =
            event.target.closest(
                ".task-star"
            );

        if (!star) return;

        selectedId =
            Number(star.dataset.id);

        renderAll();
    }
);


// Keyboard support

starGroup.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Enter"
            &&
            event.key !== " "
        ) {
            return;
        }

        const star =
            event.target.closest(
                ".task-star"
            );

        if (!star) return;

        event.preventDefault();

        selectedId =
            Number(star.dataset.id);

        renderAll();
    }
);


// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

const priorityLabels = {

    low: "LOW",

    medium: "MEDIUM",

    high: "HIGH",

    urgent: "URGENT"

};


const categoryLabels = {

    study: "STUDY",

    coding: "CODING",

    work: "WORK",

    personal: "PERSONAL",

    general: "GENERAL"

};


// ------------------------------------------------------------
// DETAIL PANEL
// ------------------------------------------------------------

function renderDetail() {

    const task =
        tasks.find(
            item => item.id === selectedId
        );


    if (
        !task
        ||
        showingList
    ) {

        detailCard.hidden = true;

        return;
    }


    detailCard.hidden = false;

    detailText.textContent =
        task.text;

    detailDate.textContent =
        `Created ${formatDate(
            task.createdAt
        )} at ${formatTime(
            task.createdAt
        )}`;


    detailPriority.textContent =
        priorityLabels[
            task.priority
        ] || "MEDIUM";


    detailPriority.className =
        `priority-badge ${task.priority}`;


    detailCategory.textContent =
        categoryLabels[
            task.category
        ] || "GENERAL";


    detailToggle.textContent =
        task.done
            ? "Mark active"
            : "Mark complete";
}


// ------------------------------------------------------------
// COMPLETE FROM DETAIL
// ------------------------------------------------------------

detailToggle.addEventListener(
    "click",
    () => {

        const task =
            tasks.find(
                item =>
                    item.id === selectedId
            );

        if (!task) return;


        task.done =
            !task.done;


        if (task.done) {

            fireShootingStar();

            showToast(
                "MISSION ILLUMINATED"
            );
        }


        save();

        renderAll();

    }
);


// ------------------------------------------------------------
// DELETE FROM DETAIL
// ------------------------------------------------------------

detailDelete.addEventListener(
    "click",
    () => {

        tasks =
            tasks.filter(
                task =>
                    task.id !== selectedId
            );

        selectedId = null;

        save();

        renderAll();

    }
);


// ------------------------------------------------------------
// CLOSE DETAIL
// ------------------------------------------------------------

detailClose.addEventListener(
    "click",
    () => {

        selectedId = null;

        renderAll();

    }
);


// ------------------------------------------------------------
// LIST VIEW
// ------------------------------------------------------------

function renderList() {

    taskList.innerHTML = "";


    tasks.forEach(
        task => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                `task-item${
                    task.done
                        ? " done"
                        : ""
                }`;


            item.dataset.id =
                task.id;


            item.innerHTML = `

                <button
                    type="button"
                    class="tick"
                    aria-label="${
                        task.done
                            ? "Mark active"
                            : "Mark complete"
                    }"
                >

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >

                        <path
                            d="M4 12l5 5L20 6"
                        />

                    </svg>

                </button>


                <div class="task-main">

                    <span class="task-text"></span>

                    <span class="task-date"></span>

                </div>


                <button
                    type="button"
                    class="delete-btn"
                    aria-label="Delete task"
                >
                    ×
                </button>

            `;


            item.querySelector(
                ".task-text"
            ).textContent =
                task.text;


            item.querySelector(
                ".task-date"
            ).textContent =
                `${priorityLabels[
                    task.priority
                ]} · ${
                    categoryLabels[
                        task.category
                    ]
                } · ${
                    formatDate(
                        task.createdAt
                    )
                }`;


            taskList.appendChild(item);

        }
    );


    emptyState.hidden =
        tasks.length !== 0;
}


// ------------------------------------------------------------
// LIST CLICK
// ------------------------------------------------------------

taskList.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                ".task-item"
            );

        if (!item) return;


        const id =
            Number(item.dataset.id);


        const task =
            tasks.find(
                entry =>
                    entry.id === id
            );


        if (!task) return;


        // Delete

        if (
            event.target.closest(
                ".delete-btn"
            )
        ) {

            tasks =
                tasks.filter(
                    entry =>
                        entry.id !== id
                );

            save();

            renderAll();

            return;
        }


        // Complete

        if (
            event.target.closest(
                ".tick"
            )
            ||
            event.target.closest(
                ".task-text"
            )
        ) {

            task.done =
                !task.done;


            if (task.done) {

                fireShootingStar();

                showToast(
                    "MISSION ILLUMINATED"
                );
            }


            save();

            renderAll();
        }
    }
);


// ------------------------------------------------------------
// VIEW TOGGLE
// ------------------------------------------------------------

viewToggle.addEventListener(
    "click",
    () => {

        showingList =
            !showingList;


        if (showingList) {

            selectedId = null;

        }


        renderAll();

    }
);


function renderViewState() {

    skyPanel.hidden =
        showingList;


    listView.hidden =
        !showingList;


    viewToggle.setAttribute(
        "aria-pressed",
        String(showingList)
    );


    viewToggle.innerHTML =
        showingList

            ? '<span class="button-icon">✦</span> Sky view'

            : '<span class="button-icon">☷</span> List view';
}


// ------------------------------------------------------------
// ADD TASK
// ------------------------------------------------------------

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const text =
            taskInput.value.trim();


        if (!text) return;


        const task = {

            id:
                Date.now()
                +
                Math.floor(
                    Math.random() * 1000
                ),

            text,

            done: false,

            priority:
                priorityInput.value,

            category:
                categoryInput.value,

            createdAt:
                new Date().toISOString()

        };


        tasks.push(task);


        selectedId =
            task.id;


        taskInput.value = "";


        save();

        renderAll();


        showToast(
            "NEW STAR DISCOVERED"
        );


        taskInput.focus();

    }
);


// ------------------------------------------------------------
// CLEAR COMPLETED
// ------------------------------------------------------------

clearCompleted.addEventListener(
    "click",
    () => {

        const before =
            tasks.length;


        tasks =
            tasks.filter(
                task =>
                    !task.done
            );


        if (
            tasks.length !== before
        ) {

            if (
                !tasks.some(
                    task =>
                        task.id === selectedId
                )
            ) {

                selectedId = null;

            }


            save();

            renderAll();

            showToast(
                "COMPLETED MISSIONS CLEARED"
            );
        }
    }
);


// ------------------------------------------------------------
// STATISTICS
// ------------------------------------------------------------

function renderStats() {

    const total =
        tasks.length;


    const done =
        tasks.filter(
            task =>
                task.done
        ).length;


    const active =
        total - done;


    const percent =
        total
            ? Math.round(
                (done / total) * 100
            )
            : 0;


    totalCount.textContent =
        total;


    doneCount.textContent =
        done;


    activeCount.textContent =
        active;


    progressPercent.textContent =
        `${percent}%`;


    progressRing.style.setProperty(
        "--progress",
        `${percent * 3.6}deg`
    );


    // Level

    const level =
        Math.max(
            1,
            Math.floor(
                done / 3
            ) + 1
        );


    levelBadge.textContent =
        `LVL ${String(level).padStart(2, "0")}`;


    // Messages

    if (total === 0) {

        progressSummary.textContent =
            "Ready for launch";

        progressDetail.textContent =
            "Add a mission to begin.";

        orbitTitle.textContent =
            "Start your orbit";

        orbitText.textContent =
            "Small progress still changes the shape of your sky.";

    }

    else if (percent === 100) {

        progressSummary.textContent =
            "Universe complete";

        progressDetail.textContent =
            "Every mission has been illuminated.";

        orbitTitle.textContent =
            "Full orbit achieved";

        orbitText.textContent =
            "You completed every mission currently in your sky.";

    }

    else if (percent >= 75) {

        progressSummary.textContent =
            "Final approach";

        progressDetail.textContent =
            `${active} mission${
                active === 1
                    ? ""
                    : "s"
            } left to complete.`;

        orbitTitle.textContent =
            "Almost there";

        orbitText.textContent =
            "The brightest part of the sky is still ahead.";

    }

    else if (percent >= 40) {

        progressSummary.textContent =
            "Constellation growing";

        progressDetail.textContent =
            `${done} of ${total} missions illuminated.`;

        orbitTitle.textContent =
            "Good trajectory";

        orbitText.textContent =
            "Your completed missions are starting to form a pattern.";

    }

    else {

        progressSummary.textContent =
            "Orbit established";

        progressDetail.textContent =
            `${active} active mission${
                active === 1
                    ? ""
                    : "s"
            } remaining.`;

        orbitTitle.textContent =
            "Keep building";

        orbitText.textContent =
            "One completed mission creates another point of light.";
    }
}


// ------------------------------------------------------------
// COMPLETION CELEBRATION
// ------------------------------------------------------------

function checkCompletionCelebration() {

    const allDone =
        tasks.length > 0
        &&
        tasks.every(
            task =>
                task.done
        );


    if (
        allDone
        &&
        !previouslyComplete
    ) {

        celebration.classList.remove(
            "show"
        );

        void celebration.offsetWidth;

        celebration.classList.add(
            "show"
        );

        fireShootingStar();
    }


    previouslyComplete =
        allDone;
}


// ------------------------------------------------------------
// RENDER EVERYTHING
// ------------------------------------------------------------

function renderAll() {

    renderSky();

    renderDetail();

    renderList();

    renderViewState();

    renderStats();

    checkCompletionCelebration();
}


// ------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------

renderAll();