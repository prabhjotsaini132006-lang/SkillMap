import {
    openDatabase,
    getRoadmaps,
    addSkill,
    getSkillsByRoadmap
} from "./db.js";

import {
    renderSkills
} from "./ui.js";


const skillForm = document.querySelector("#skill-form");

const skillNameInput = document.querySelector("#skill-name");
const skillDescriptionInput = document.querySelector("#skill-description");
const skillDifficultyInput = document.querySelector("#skill-difficulty");
const skillResourceInput = document.querySelector("#skill-resource");


function getRoadmapId() {
    const parameters = new URLSearchParams(window.location.search);

    return parameters.get("id");
}


function loadSkills() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    getSkillsByRoadmap(roadmapId)
        .then((skills) => {
            renderSkills(skills);
        })
        .catch((error) => {
            console.error("Failed to load skills:", error);
        });
}


function createSkill(event) {
    event.preventDefault();

    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        console.error("No roadmap ID found.");
        return;
    }

    const skill = {
        id: crypto.randomUUID(),
        roadmapId: roadmapId,
        name: skillNameInput.value.trim(),
        description: skillDescriptionInput.value.trim(),
        difficulty: skillDifficultyInput.value,
        resourceUrl: skillResourceInput.value.trim(),
        status: "locked",
        prerequisites: []
    };

    addSkill(skill)
        .then(() => {
            skillForm.reset();

            return getSkillsByRoadmap(roadmapId);
        })
        .then((skills) => {
            renderSkills(skills);
        })
        .catch((error) => {
            console.error("Failed to create skill:", error);
        });
}


skillForm.addEventListener("submit", createSkill);


openDatabase()
    .then(() => {
        loadSkills();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });