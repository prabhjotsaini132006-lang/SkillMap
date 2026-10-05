import {
    openDatabase,
    getRoadmap,
    addRoadmap,
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
const skillSearchInput = document.querySelector("#skill-search");
const statusFilter = document.querySelector("#status-filter");
const difficultyFilter = document.querySelector("#difficulty-filter");
const exportButton = document.querySelector("#export-roadmap");
const importInput = document.querySelector("#import-roadmap");
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

   renderSkills(filterSkills(skills));
    renderSkillTree(skills);
    drawSkillTreeLines(skills);
    loadPrerequisites();
}

function filterSkills(skills) {
    const searchTerm = skillSearchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedDifficulty = difficultyFilter.value;

    return skills.filter((skill) => {
        const matchesSearch = skill.name
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            skill.status === selectedStatus;

        const matchesDifficulty =
            selectedDifficulty === "all" ||
            skill.difficulty === selectedDifficulty;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesDifficulty
        );
    });
}

async function exportRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    const roadmap = await getRoadmap(roadmapId);
    const skills = await getSkillsByRoadmap(roadmapId);

    const roadmapData = {
        roadmap: roadmap,
        skills: skills
    };

    const jsonData = JSON.stringify(roadmapData, null, 2);

    const blob = new Blob(
        [jsonData],
        { type: "application/json" }
    );

    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${roadmap.name}.json`;

    link.click();

    URL.revokeObjectURL(downloadUrl);
}

async function importRoadmap(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", async () => {
        try {
            const roadmapData = JSON.parse(reader.result);

            if (!roadmapData.roadmap || !Array.isArray(roadmapData.skills)) {
                throw new Error("Invalid SkillMap JSON structure.");
            }

            const importedRoadmap = {
                ...roadmapData.roadmap,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addRoadmap(importedRoadmap);

            const skillIdMap = new Map();

            roadmapData.skills.forEach((skill) => {
                skillIdMap.set(
                    skill.id,
                    crypto.randomUUID()
                );
            });

            for (const skill of roadmapData.skills) {
              const importedSkill = {
                ...skill,
                id: skillIdMap.get(skill.id),
                roadmapId: importedRoadmap.id,
                prerequisites: skill.prerequisites.map((prerequisiteId) => {
                    return skillIdMap.get(prerequisiteId);
                })
            };

                await addSkill(importedSkill);
            }

            alert("Roadmap imported successfully.");

            window.location.href =
                `roadmap.html?id=${importedRoadmap.id}`;

        } catch (error) {
            alert("Failed to import roadmap.");
            console.error("Failed to import roadmap:", error);
        }
    });

    reader.readAsText(file);
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
if (skillStatusInput.value === "done") {
    const prerequisitesComplete = selectedPrerequisites.every(
        (prerequisiteId) => {
            const prerequisite = skills.find((skill) => {
                return skill.id === prerequisiteId;
            });

            return prerequisite && prerequisite.status === "done";
        }
    );

    if (!prerequisitesComplete) {
        alert("Complete all prerequisites before marking this skill as done.");
        return;
    }
}

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

            loadPrerequisites();

            skillNameInput.value = skill.name;
            skillDescriptionInput.value = skill.description;
            skillDifficultyInput.value = skill.difficulty;
            skillResourceInput.value = skill.resourceUrl;
            skillStatusInput.value = skill.status;

           return loadPrerequisites().then(() => {
            const prerequisiteInputs = document.querySelectorAll(
                "#prerequisite-list input"
            );

            prerequisiteInputs.forEach((input) => {
                input.checked = skill.prerequisites.includes(input.value);
            });
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
        return Promise.resolve();
    }

    return getSkillsByRoadmap(roadmapId)
        .then((skills) => {

            const prerequisiteList = document.querySelector(
                "#prerequisite-list"
            );

            prerequisiteList.innerHTML = "";

           skills.forEach((skill) => {
            if (skill.id === editingSkillId) {
                    return;
                }

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

skillSearchInput.addEventListener("input", () => {
    refreshRoadmap();
});

statusFilter.addEventListener("change", () => {
    refreshRoadmap();
});

difficultyFilter.addEventListener("change", () => {
    refreshRoadmap();
});

exportButton.addEventListener("click", () => {
    exportRoadmap().catch((error) => {
        console.error("Failed to export roadmap:", error);
    });
});

importInput.addEventListener("change", (event) => {
    importRoadmap(event);
});

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