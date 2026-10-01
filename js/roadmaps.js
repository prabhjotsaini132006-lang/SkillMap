import {
    openDatabase,
    addRoadmap,
    getRoadmaps,
    updateRoadmap,
    deleteRoadmap
} from "./db.js";

import {
    renderRoadmaps
} from "./ui.js";


const roadmapForm = document.querySelector("#roadmap-form");
const roadmapNameInput = document.querySelector("#roadmap-name");
const roadmapDescriptionInput = document.querySelector("#roadmap-description");


function loadRoadmaps() {
    getRoadmaps()
        .then((roadmaps) => {
            renderRoadmaps(roadmaps);
        })
        .catch((error) => {
            console.error("Failed to load roadmaps:", error);
        });
}


function createRoadmap(event) {
    event.preventDefault();

    const roadmap = {
        id: crypto.randomUUID(),
        name: roadmapNameInput.value.trim(),
        description: roadmapDescriptionInput.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    addRoadmap(roadmap)
        .then(() => {
            roadmapForm.reset();

            return getRoadmaps();
        })
        .then((roadmaps) => {
            renderRoadmaps(roadmaps);
        })
        .catch((error) => {
            console.error("Failed to create roadmap:", error);
        });
}

function renameRoadmap(roadmapId) {
    getRoadmaps()
        .then((roadmaps) => {
            const roadmap = roadmaps.find((item) => {
                return item.id === roadmapId;
            });

            if (!roadmap) {
                throw new Error("Roadmap not found.");
            }

            const newName = prompt("Enter the new roadmap name:", roadmap.name);

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

            return updateRoadmap(roadmap);
        })
        .then(() => {
            return getRoadmaps();
        })
        .then((roadmaps) => {
            renderRoadmaps(roadmaps);
        })
        .catch((error) => {
            console.error("Failed to rename roadmap:", error);
        });
}

function removeRoadmap(roadmapId) {
    const confirmed = confirm(
        "Are you sure you want to delete this roadmap?"
    );

    if (!confirmed) {
        return;
    }

    deleteRoadmap(roadmapId)
        .then(() => {
            return getRoadmaps();
        })
        .then((roadmaps) => {
            renderRoadmaps(roadmaps);
        })
        .catch((error) => {
            console.error("Failed to delete roadmap:", error);
        });
}

roadmapForm.addEventListener("submit", createRoadmap);
document.querySelector("#roadmap-list").addEventListener("click", (event) => {
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
});

openDatabase()
    .then(() => {
        loadRoadmaps();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });