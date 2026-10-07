import {
    openDatabase,
    addRoadmap,
    getRoadmaps,
    getSkillsByRoadmap,
    updateRoadmap,
    deleteRoadmap
} from "./db.js";

import { renderRoadmaps } from "./ui.js";

const roadmapForm = document.querySelector("#roadmap-form");
const roadmapNameInput = document.querySelector("#roadmap-name");
const roadmapDescriptionInput = document.querySelector("#roadmap-description");

function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getDeadlineStatus(deadline, status) {
    if (!deadline || status === "done") {
        return "upcoming";
    }

    const today = getToday();
    const date = new Date(`${deadline}T00:00:00`);
    const days = Math.ceil(
        (date - today) / (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return "overdue";
    }

    if (days <= 7) {
        return "due-soon";
    }

    return "upcoming";
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

async function getDashboardData() {
    const roadmaps = await getRoadmaps();
    const deadlines = [];

    let totalSkills = 0;
    let completedSkills = 0;

    for (const roadmap of roadmaps) {
        const skills = await getSkillsByRoadmap(roadmap.id);

        totalSkills += skills.length;

        completedSkills += skills.filter((skill) => {
            return skill.status === "done";
        }).length;

        roadmap.progress = skills.length
            ? Math.round(
                (completedSkills / totalSkills) * 100
            )
            : 0;

        skills.forEach((skill) => {
            if (skill.deadline) {
                deadlines.push({
                    ...skill,
                    roadmapName: roadmap.name,
                    deadlineStatus: getDeadlineStatus(
                        skill.deadline,
                        skill.status
                    )
                });
            }
        });
    }

    const dueSoon = deadlines.filter((skill) => {
        return skill.deadlineStatus === "due-soon";
    });

    const overdue = deadlines.filter((skill) => {
        return skill.deadlineStatus === "overdue";
    });

    return {
        roadmaps,
        deadlines,
        dueSoon,
        overdue,
        progress: totalSkills
            ? Math.round((completedSkills / totalSkills) * 100)
            : 0
    };
}

function renderDashboardStats(data) {
    document.querySelector("#roadmap-count").textContent =
        data.roadmaps.length;

    document.querySelector("#overall-progress").textContent =
        `${data.progress}%`;

    document.querySelector("#due-soon-count").textContent =
        data.dueSoon.length;

    document.querySelector("#overdue-count").textContent =
        data.overdue.length;
}

function renderDeadlines(deadlines) {
    const list = document.querySelector("#deadline-list");

   const today = getToday();

    const upcoming = deadlines
        .filter((skill) => {
            const deadline = new Date(`${skill.deadline}T00:00:00`);
            return deadline >= today;
        })
        .sort((a, b) => {
            return a.deadline.localeCompare(b.deadline);
        })
        .slice(0, 5);

    if (!upcoming.length) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✓</div>
                <p>No upcoming deadlines.</p>
                <span>Add deadlines to your skills to see them here.</span>
            </div>
        `;
        return;
    }

    list.innerHTML = upcoming.map((skill) => {
        const statusClass = skill.status === "done"
            ? "deadline-complete"
            : skill.deadlineStatus === "due-soon"
                ? "deadline-soon"
                : "";

        return `
            <div class="deadline-item">
                <div>
                    <strong>${skill.name}</strong>
                    <span>${skill.roadmapName}</span>
                </div>

                <time class="${statusClass}">
                    ${formatDate(skill.deadline)}
                </time>
            </div>
        `;
    }).join("");
}

function showDeadlineAlert(data) {
    if (!data.dueSoon.length) {
        return;
    }

    if (sessionStorage.getItem("skillmap-deadline-alert")) {
        return;
    }

    sessionStorage.setItem("skillmap-deadline-alert", "shown");

    alert(
        `${data.dueSoon.length} skill deadline` +
        `${data.dueSoon.length === 1 ? "" : "s"} ` +
        "are due within 7 days."
    );
}

async function loadDashboard() {
    try {
        const data = await getDashboardData();

        renderDashboardStats(data);
        renderRoadmaps(data.roadmaps);
        renderDeadlines(data.deadlines);
        showDeadlineAlert(data);

        return data.roadmaps;
    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }
}

async function createRoadmap(event) {
    event.preventDefault();

    const roadmap = {
        id: crypto.randomUUID(),
        name: roadmapNameInput.value.trim(),
        description: roadmapDescriptionInput.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await addRoadmap(roadmap);
        roadmapForm.reset();
        await loadDashboard();
    } catch (error) {
        console.error("Failed to create roadmap:", error);
    }
}

async function renameRoadmap(roadmapId) {
    try {
        const roadmaps = await getRoadmaps();

        const roadmap = roadmaps.find((item) => {
            return item.id === roadmapId;
        });

        if (!roadmap) {
            throw new Error("Roadmap not found.");
        }

        const newName = prompt(
            "Enter the new roadmap name:",
            roadmap.name
        );

        if (newName === null) {
            return;
        }

        const trimmedName = newName.trim();

        if (trimmedName.length < 3) {
            alert("Roadmap name must be at least 3 characters.");
            return;
        }

        roadmap.name = trimmedName;
        roadmap.updatedAt = new Date().toISOString();

        await updateRoadmap(roadmap);
        await loadDashboard();
    } catch (error) {
        console.error("Failed to rename roadmap:", error);
    }
}

async function removeRoadmap(roadmapId) {
    const confirmed = confirm(
        "Are you sure you want to delete this roadmap?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteRoadmap(roadmapId);
        await loadDashboard();
    } catch (error) {
        console.error("Failed to delete roadmap:", error);
    }
}

roadmapForm.addEventListener("submit", createRoadmap);

document.querySelector("#roadmap-list").addEventListener(
    "click",
    (event) => {
        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const roadmapId = button.dataset.roadmapId;

        if (action === "rename") {
            renameRoadmap(roadmapId);
        }

        if (action === "delete") {
            removeRoadmap(roadmapId);
        }
    }
);

openDatabase()
    .then(loadDashboard)
    .catch((error) => {
        console.error("Failed to open database:", error);
    });