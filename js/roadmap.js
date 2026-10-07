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
const skillDeadlineInput = document.querySelector("#skill-deadline");
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

function prepareSkills(skills) {
    return skills.map((skill) => {
        return {
            ...skill,
            status: getSkillStatus(skill, skills),
            level: getSkillLevel(skill, skills)
        };
    });
}

async function refreshRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    try {
        const skills = await getSkillsByRoadmap(roadmapId);
        const preparedSkills = prepareSkills(skills);
        const progress = getProgress(skills);
        const suggestedSkill = getSuggestedSkill(skills);

        document.querySelector("#roadmap-progress").textContent =
            `Progress: ${progress}%`;

        document.querySelector("#suggested-skill").textContent =
            suggestedSkill
                ? `Suggested Next Skill: ${suggestedSkill.name}`
                : "Suggested Next Skill: None";

        renderSkills(filterSkills(preparedSkills));
        renderSkillTree(preparedSkills);
        drawSkillTreeLines(preparedSkills);

        await loadPrerequisites();
    } catch (error) {
        console.error("Failed to refresh roadmap:", error);
    }
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

        return matchesSearch && matchesStatus && matchesDifficulty;
    });
}

async function loadRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    try {
        const roadmap = await getRoadmap(roadmapId);

        if (!roadmap) {
            throw new Error("Roadmap not found.");
        }

        document.querySelector("#roadmap-title").textContent =
            roadmap.name;

        document.querySelector("#roadmap-description").textContent =
            roadmap.description || "No description provided.";
    } catch (error) {
        console.error("Failed to load roadmap:", error);
    }
}

async function loadPrerequisites() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    try {
        const skills = await getSkillsByRoadmap(roadmapId);
        const prerequisiteList = document.querySelector("#prerequisite-list");

        prerequisiteList.innerHTML = "";

        skills.forEach((skill) => {
            if (skill.id === editingSkillId) {
                return;
            }

            const label = document.createElement("label");

            label.innerHTML = `
                <input type="checkbox" value="${skill.id}">
                ${skill.name}
            `;

            prerequisiteList.appendChild(label);
        });
    } catch (error) {
        console.error("Failed to load prerequisites:", error);
    }
}

async function createSkill(event) {
    event.preventDefault();

    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        console.error("No roadmap ID found.");
        return;
    }

    const name = skillNameInput.value.trim();

    if (name.length < 2) {
        alert("Skill name must be at least 2 characters.");
        return;
    }

    const selectedPrerequisites = Array.from(
        document.querySelectorAll("#prerequisite-list input:checked")
    ).map((checkbox) => checkbox.value);

    try {
        const skills = await getSkillsByRoadmap(roadmapId);

        if (skillStatusInput.value === "done") {
            const prerequisitesComplete = selectedPrerequisites.every(
                (id) => {
                    const prerequisite = skills.find((skill) => {
                        return skill.id === id;
                    });

                    return prerequisite && prerequisite.status === "done";
                }
            );

            if (!prerequisitesComplete) {
                alert(
                    "Complete all prerequisites before marking this skill as done."
                );
                return;
            }
        }

        if (editingSkillId) {
            const cycleDetected = selectedPrerequisites.some((id) => {
                return wouldCreateCycle(
                    editingSkillId,
                    id,
                    skills
                );
            });

            if (cycleDetected) {
                alert("This prerequisite would create a cycle.");
                return;
            }

            const skill = await getSkill(editingSkillId);

            if (!skill) {
                throw new Error("Skill not found.");
            }

            skill.name = name;
            skill.description = skillDescriptionInput.value.trim();
            skill.difficulty = skillDifficultyInput.value;
            skill.deadline = skillDeadlineInput.value;
            skill.resourceUrl = skillResourceInput.value.trim();
            skill.status = skillStatusInput.value;
            skill.prerequisites = selectedPrerequisites;

            await updateSkill(skill);

            resetSkillForm();
            await refreshRoadmap();

            return;
        }

        const skill = {
            id: crypto.randomUUID(),
            roadmapId,
            name,
            description: skillDescriptionInput.value.trim(),
            difficulty: skillDifficultyInput.value,
            deadline: skillDeadlineInput.value,
            resourceUrl: skillResourceInput.value.trim(),
            status: skillStatusInput.value,
            prerequisites: selectedPrerequisites
        };

        await addSkill(skill);

        resetSkillForm();
        await refreshRoadmap();
    } catch (error) {
        console.error("Failed to save skill:", error);
    }
}

async function editSkill(skillId) {
    try {
        const skill = await getSkill(skillId);

        if (!skill) {
            throw new Error("Skill not found.");
        }

        editingSkillId = skill.id;
        skillSubmitButton.textContent = "Update Skill";

        skillNameInput.value = skill.name;
        skillDescriptionInput.value = skill.description || "";
        skillDifficultyInput.value = skill.difficulty || "easy";
        skillDeadlineInput.value = skill.deadline || "";
        skillResourceInput.value = skill.resourceUrl || "";
        skillStatusInput.value = skill.status || "available";

        await loadPrerequisites();

        const prerequisiteInputs = document.querySelectorAll(
            "#prerequisite-list input"
        );

        prerequisiteInputs.forEach((input) => {
            input.checked = skill.prerequisites.includes(input.value);
        });

        skillForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        console.error("Failed to load skill:", error);
    }
}

function resetSkillForm() {
    editingSkillId = null;

    skillForm.reset();
    skillSubmitButton.textContent = "Add Skill";

    loadPrerequisites();
}

async function removeSkill(skillId) {
    if (!confirm("Are you sure you want to delete this skill?")) {
        return;
    }

    try {
        await deleteSkill(skillId);
        await refreshRoadmap();
    } catch (error) {
        console.error("Failed to delete skill:", error);
    }
}

async function exportRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        return;
    }

    try {
        const roadmap = await getRoadmap(roadmapId);
        const skills = await getSkillsByRoadmap(roadmapId);

        const roadmapData = {
            roadmap,
            skills
        };

        const jsonData = JSON.stringify(
            roadmapData,
            null,
            2
        );

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
    } catch (error) {
        console.error("Failed to export roadmap:", error);
    }
}

async function importRoadmap(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {
        const text = await file.text();
        const roadmapData = JSON.parse(text);

        if (
            !roadmapData.roadmap ||
            !Array.isArray(roadmapData.skills)
        ) {
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
                prerequisites: skill.prerequisites.map((id) => {
                    return skillIdMap.get(id);
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
    } finally {
        importInput.value = "";
    }
}

skillForm.addEventListener("submit", createSkill);

document.querySelector("#skill-list").addEventListener(
    "click",
    (event) => {
        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const skillId = button.dataset.skillId;

        if (action === "edit-skill") {
            editSkill(skillId);
        }

        if (action === "delete-skill") {
            removeSkill(skillId);
        }
    }
);

skillSearchInput.addEventListener("input", refreshRoadmap);
statusFilter.addEventListener("change", refreshRoadmap);
difficultyFilter.addEventListener("change", refreshRoadmap);

exportButton.addEventListener("click", () => {
    exportRoadmap();
});

importInput.addEventListener("change", importRoadmap);

openDatabase()
    .then(async () => {
        await loadRoadmap();
        await refreshRoadmap();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });