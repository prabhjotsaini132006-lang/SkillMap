import {
    openDatabase,
    getRoadmap,
    addSkill,
    getSkillsByRoadmap,
    getSkill,
    updateSkill,
    deleteSkill
} from "./db.js";

import {
    renderSkills,
    renderSkillTree,
    drawSkillTreeLines
} from "./ui.js";

import {
    getSkillStatus,
    wouldCreateCycle,
    getSuggestedSkill,
    getSkillLevel,
    getProgress
} from "./graph.js";

const skillForm = document.querySelector("#skill-form");

const skillNameInput = document.querySelector("#skill-name");
const skillDescriptionInput = document.querySelector("#skill-description");
const skillDifficultyInput = document.querySelector("#skill-difficulty");
const skillResourceInput = document.querySelector("#skill-resource");
const skillStatusInput = document.querySelector("#skill-status");
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
        
        skills.forEach((skill) => {
        skill.status = getSkillStatus(skill, skills);
        skill.level = getSkillLevel(skill, skills);
    });

    const progress = getProgress(skills);

    const progressElement = document.querySelector(
        "#roadmap-progress"
    );

    progressElement.textContent = `Progress: ${progress}%`;

    renderSkills(skills);
    renderSkillTree(skills);
    drawSkillTreeLines(skills);
        
    })
        .catch((error) => {
            console.error("Failed to load skills:", error);
        });
}

async function refreshRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    const skills = await getSkillsByRoadmap(roadmapId);

    skills.forEach((skill) => {
        skill.status = getSkillStatus(skill, skills);
        skill.level = getSkillLevel(skill, skills);
    });

    const progress = getProgress(skills);

    document.querySelector("#roadmap-progress").textContent =
        `Progress: ${progress}%`;

    const suggestedSkill = getSuggestedSkill(skills);

    document.querySelector("#suggested-skill").textContent =
        suggestedSkill
            ? `Suggested Next Skill: ${suggestedSkill.name}`
            : "Suggested Next Skill: None";

    renderSkills(skills);
    renderSkillTree(skills);
    drawSkillTreeLines(skills);
}

function loadRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    getRoadmap(roadmapId)
        .then((roadmap) => {
            if (!roadmap) {
                throw new Error("Roadmap not found.");
            }

            document.querySelector("#roadmap-title").textContent =
                roadmap.name;

            document.querySelector("#roadmap-description").textContent =
                roadmap.description;
        })
        .catch((error) => {
            console.error("Failed to load roadmap:", error);
        });
}

function loadSuggestedSkill() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    getSkillsByRoadmap(roadmapId)
        .then((skills) => {

            const suggestedSkillElement = document.querySelector(
                "#suggested-skill"
            );

            const suggestedSkill = getSuggestedSkill(skills);

            if (!suggestedSkill) {
                suggestedSkillElement.textContent =
                    "Suggested Next Skill: None";

                return;
            }

            suggestedSkillElement.textContent =
                `Suggested Next Skill: ${suggestedSkill.name}`;
        })
        .catch((error) => {
            console.error(
                "Failed to load suggested skill:",
                error
            );
        });
}

async function createSkill(event) {
    event.preventDefault();

    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        console.error("No roadmap ID found.");
        return;
    }

    const selectedPrerequisites = Array.from(
        document.querySelectorAll(
            "#prerequisite-list input:checked"
        )
).map((checkbox) => checkbox.value);

const skills = await getSkillsByRoadmap(roadmapId);

    if (editingSkillId) {

    const cycleDetected = selectedPrerequisites.some((prerequisiteId) => {
        return wouldCreateCycle(
            editingSkillId,
            prerequisiteId,
            skills
        );
    });

    if (cycleDetected) {
        alert("This prerequisite would create a cycle.");
        return;
    }
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
                skill.status = skillStatusInput.value;
                skill.prerequisites = selectedPrerequisites;
                return updateSkill(skill);
            })
                .then(() => {
            editingSkillId = null;
            skillForm.reset();
            skillSubmitButton.textContent = "Add Skill";

            return refreshRoadmap();
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
        status: skillStatusInput.value,
        prerequisites: selectedPrerequisites
    };

    addSkill(skill)
        .then(() => {
            skillForm.reset();
            return refreshRoadmap();
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
            skillStatusInput.value = skill.status;

            const prerequisiteInputs = document.querySelectorAll(
                "#prerequisite-list input"
            );

            prerequisiteInputs.forEach((input) => {
                input.checked = skill.prerequisites.includes(input.value);
            });

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

    deleteSkill(skillId)
        .then(() => {
            return refreshRoadmap();
        })
        .catch((error) => {
            console.error("Failed to delete skill:", error);
        });
}

function loadPrerequisites() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    getSkillsByRoadmap(roadmapId)
        .then((skills) => {

            const prerequisiteList = document.querySelector(
                "#prerequisite-list"
            );

            prerequisiteList.innerHTML = "";

            skills.forEach((skill) => {

                const label = document.createElement("label");

                label.innerHTML = `
                    <input
                        type="checkbox"
                        value="${skill.id}"
                    >
                    ${skill.name}
                `;

                prerequisiteList.appendChild(label);
            });
        })
        .catch((error) => {
            console.error(
                "Failed to load prerequisites:",
                error
            );
        });
}


openDatabase()
    .then(() => {
        loadRoadmap();
        loadSkills();
        loadPrerequisites();
        loadSuggestedSkill();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });