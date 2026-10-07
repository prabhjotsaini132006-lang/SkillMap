import {
    openDatabase,
    getRoadmaps,
    getSkillsByRoadmap
} from "./db.js";

const calendarMonth = document.querySelector("#calendar-month");
const calendarGrid = document.querySelector("#calendar-grid");
const deadlineList = document.querySelector("#calendar-deadlines");

const previousMonthButton = document.querySelector("#previous-month");
const nextMonthButton = document.querySelector("#next-month");

let currentDate = new Date();
let skills = [];

function getToday() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function getDaysFromToday(date) {
    const today = new Date(`${getToday()}T00:00:00`);
    const target = new Date(`${date}T00:00:00`);

    return Math.round(
        (target - today) / (1000 * 60 * 60 * 24)
    );
}

function getDeadlineClass(skill) {
    if (skill.status === "done") {
        return "deadline-complete";
    }

    const days = getDaysFromToday(skill.deadline);

    if (days < 0) {
        return "deadline-overdue";
    }

    if (days <= 7) {
        return "deadline-soon";
    }

    return "";
}

async function loadSkills() {
    const roadmaps = await getRoadmaps();
    const allSkills = [];

    for (const roadmap of roadmaps) {
        const roadmapSkills = await getSkillsByRoadmap(roadmap.id);

        roadmapSkills.forEach((skill) => {
            if (!skill.deadline) {
                return;
            }

            allSkills.push({
                ...skill,
                roadmapName: roadmap.name
            });
        });
    }

    skills = allSkills;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    calendarMonth.textContent = new Intl.DateTimeFormat(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    ).format(currentDate);

    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = createDay(
            daysInPreviousMonth - i,
            year,
            month - 1,
            true
        );

        calendarGrid.appendChild(day);
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
        const day = createDay(
            dayNumber,
            year,
            month,
            false
        );

        calendarGrid.appendChild(day);
    }

    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;

    for (let dayNumber = 1; dayNumber <= remainingCells; dayNumber++) {
        const day = createDay(
            dayNumber,
            year,
            month + 1,
            true
        );

        calendarGrid.appendChild(day);
    }
}

function createDay(dayNumber, year, month, otherMonth) {
    const date = new Date(year, month, dayNumber);

    const dateString =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const day = document.createElement("div");

    day.className = "calendar-day";

    if (otherMonth) {
        day.classList.add("other-month");
    }

    if (dateString === getToday()) {
        day.classList.add("today");
    }

    day.innerHTML = `
        <div class="calendar-day-number">
            ${dayNumber}
        </div>
    `;

    const daySkills = skills.filter((skill) => {
        return skill.deadline === dateString;
    });

    daySkills.forEach((skill) => {
        const deadline = document.createElement("a");

        deadline.className =
            `calendar-deadline ${getDeadlineClass(skill)}`;

        deadline.href = `roadmap.html?id=${skill.roadmapId}`;
        deadline.textContent = skill.name;
        deadline.title = `${skill.name} — ${skill.roadmapName}`;

        day.appendChild(deadline);
    });

    return day;
}

function renderDeadlines() {
    deadlineList.innerHTML = "";

    const upcoming = [...skills]
        .filter((skill) => {
            return skill.status !== "done";
        })
        .sort((first, second) => {
            return first.deadline.localeCompare(second.deadline);
        });

    if (!upcoming.length) {
        deadlineList.innerHTML = `
            <div class="empty-state">
                <p>No pending deadlines</p>
                <span>Your scheduled deadlines will appear here.</span>
            </div>
        `;

        return;
    }

    upcoming.forEach((skill) => {
        const item = document.createElement("article");
        const days = getDaysFromToday(skill.deadline);

        let label = "Upcoming";

        if (days < 0) {
            label = "Overdue";
        } else if (days === 0) {
            label = "Today";
        } else if (days === 1) {
            label = "Tomorrow";
        } else if (days <= 7) {
            label = `In ${days} days`;
        }

        item.className = "deadline-item";

        item.innerHTML = `
            <div>
                <strong>${skill.name}</strong>
                <span>${skill.roadmapName}</span>
            </div>

            <div>
                <span class="${getDeadlineClass(skill)}">
                    ${label}
                </span>
                <time>${formatDate(skill.deadline)}</time>
            </div>
        `;

        deadlineList.appendChild(item);
    });
}

async function refreshCalendar() {
    try {
        await loadSkills();
        renderCalendar();
        renderDeadlines();
    } catch (error) {
        console.error("Failed to load calendar:", error);
    }
}

previousMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

openDatabase()
    .then(refreshCalendar)
    .catch((error) => {
        console.error("Failed to open database:", error);
    });