import {
    openDatabase,
    addSkill,
    getSkillsByRoadmap,
    getSkill,
    updateSkill,
    deleteSkill
} from "./db.js";

import {
    renderSkills
} from "./ui.js";


const skillForm = document.querySelector("#skill-form");

const skillNameInput = document.querySelector("#skill-name");
const skillDescriptionInput = document.querySelector("#skill-description");
const skillDifficultyInput = document.querySelector("#skill-difficulty");
const skillResourceInput = document.querySelector("#skill-resource");
const skillSubmitButton = document.querySelector("#skill-submit-button");
let editingSkillId = null;

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

    if (editingSkillId) {
        getSkill(editingSkillId)
            .then((skill) => {
                if (!skill) {
                    throw new Error("Skill not found.");
                }

                skill.name = skillNameInput.value.trim();
                skill.description = skillDescriptionInput.value.trim();
                skill.difficulty = skillDifficultyInput.value;
                skill.resourceUrl = skillResourceInput.value.trim();

                return updateSkill(skill);
            })
            .then(() => {
                editingSkillId = null;
                skillForm.reset();
                skillSubmitButton.textContent = "Add Skill";    

                return getSkillsByRoadmap(roadmapId);
            })
            .then((skills) => {
                renderSkills(skills);
            })
            .catch((error) => {
                console.error("Failed to update skill:", error);
            });

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

function editSkill(skillId) {
    getSkill(skillId)
        .then((skill) => {
            console.log("Skill received for editing:", skill);

            if (!skill) {
                throw new Error("Skill not found.");
            }

            editingSkillId = skill.id;
            skillSubmitButton.textContent = "Update Skill";

            skillNameInput.value = skill.name;
            skillDescriptionInput.value = skill.description;
            skillDifficultyInput.value = skill.difficulty;
            skillResourceInput.value = skill.resourceUrl;
            console.log("Form values loaded:", {
            name: skillNameInput.value,
            description: skillDescriptionInput.value,
            difficulty: skillDifficultyInput.value,
            resource: skillResourceInput.value
});
        })
        .catch((error) => {
            console.error("Failed to load skill:", error);
        });
}


skillForm.addEventListener("submit", createSkill);

const skillList = document.querySelector("#skill-list");

skillList.addEventListener("click", (event) => {
    console.log("Skill list clicked.");

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const skillId = button.dataset.skillId;

    console.log("Button action:", action);
    console.log("Skill ID:", skillId);

    if (action === "edit-skill") {
        console.log("Edit clicked:", skillId);
        editSkill(skillId);
    }

    if (action === "delete-skill") {
        removeSkill(skillId);
    }
});

function removeSkill(skillId) {
    const confirmed = confirm(
        "Are you sure you want to delete this skill?"
    );

    if (!confirmed) {
        return;
    }

    const roadmapId = getRoadmapId();

    deleteSkill(skillId)
        .then(() => {
            return getSkillsByRoadmap(roadmapId);
        })
        .then((skills) => {
            renderSkills(skills);
        })
        .catch((error) => {
            console.error("Failed to delete skill:", error);
        });
}

openDatabase()
    .then(() => {
        loadSkills();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });