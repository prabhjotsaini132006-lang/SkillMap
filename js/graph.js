function arePrerequisitesComplete(skill, skills) {
    return skill.prerequisites.every((prerequisiteId) => {
        const prerequisite = skills.find((item) => {
            return item.id === prerequisiteId;
        });

        return prerequisite && prerequisite.status === "done";
    });
}


function getSkillStatus(skill, skills) {

    if (skill.status === "done") {
        return "done";
    }

    if (!arePrerequisitesComplete(skill, skills)) {
        return "locked";
    }

    if (skill.status === "in-progress") {
        return "in-progress";
    }

    return "available";
}

function wouldCreateCycle(skillId, prerequisiteId, skills) {
    const visited = new Set();

    function visit(currentId) {
        if (currentId === skillId) {
            return true;
        }

        if (visited.has(currentId)) {
            return false;
        }

        visited.add(currentId);

        const currentSkill = skills.find((skill) => {
            return skill.id === currentId;
        });

        if (!currentSkill) {
            return false;
        }

        return currentSkill.prerequisites.some((id) => {
            return visit(id);
        });
    }

    return visit(prerequisiteId);
}

function getSuggestedSkill(skills) {

    const availableSkills = skills.filter((skill) => {
        return getSkillStatus(skill, skills) === "available";
    });

    if (availableSkills.length === 0) {
        return null;
    }

    availableSkills.sort((skillA, skillB) => {
        return skillA.prerequisites.length -
            skillB.prerequisites.length;
    });

    return availableSkills[0];
}

function getSkillLevel(skill, skills) {

    if (skill.prerequisites.length === 0) {
        return 0;
    }

    const prerequisiteLevels = skill.prerequisites.map((prerequisiteId) => {

        const prerequisite = skills.find((item) => {
            return item.id === prerequisiteId;
        });

        if (!prerequisite) {
            return 0;
        }

        return getSkillLevel(prerequisite, skills);
    });

    return Math.max(...prerequisiteLevels) + 1;
}

function getProgress(skills) {

    if (skills.length === 0) {
        return 0;
    }

    const completedSkills = skills.filter((skill) => {
        return skill.status === "done";
    });

    return Math.round(
        (completedSkills.length / skills.length) * 100
    );
}

export {
    arePrerequisitesComplete,
    getSkillStatus,
    wouldCreateCycle,
    getSuggestedSkill,
    getSkillLevel,
    getProgress
};