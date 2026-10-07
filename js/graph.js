function arePrerequisitesComplete(skill, skills) {
    return skill.prerequisites.every((id) => {
        const prerequisite = skills.find((item) => item.id === id);

        return prerequisite && prerequisite.status === "done";
    });
}

function getSkillStatus(skill, skills) {
    if (!arePrerequisitesComplete(skill, skills)) {
        return "locked";
    }

    if (skill.status === "done") {
        return "done";
    }

    if (skill.status === "in-progress") {
        return "in-progress";
    }

    return "available";
}

function wouldCreateCycle(skillId, prerequisiteId, skills) {
    const visited = new Set();

    function visit(id) {
        if (id === skillId) {
            return true;
        }

        if (visited.has(id)) {
            return false;
        }

        visited.add(id);

        const skill = skills.find((item) => item.id === id);

        if (!skill) {
            return false;
        }

        return skill.prerequisites.some(visit);
    }

    return visit(prerequisiteId);
}

function getSuggestedSkill(skills) {
    const availableSkills = skills.filter((skill) => {
        return getSkillStatus(skill, skills) === "available";
    });

    if (!availableSkills.length) {
        return null;
    }

    availableSkills.sort((first, second) => {
        return first.prerequisites.length -
            second.prerequisites.length;
    });

    return availableSkills[0];
}

function getSkillLevel(skill, skills, visited = new Set()) {
    if (!skill.prerequisites.length) {
        return 0;
    }

    if (visited.has(skill.id)) {
        return 0;
    }

    const nextVisited = new Set(visited);
    nextVisited.add(skill.id);

    const levels = skill.prerequisites.map((id) => {
        const prerequisite = skills.find((item) => {
            return item.id === id;
        });

        if (!prerequisite) {
            return 0;
        }

        return getSkillLevel(
            prerequisite,
            skills,
            nextVisited
        );
    });

    return Math.max(...levels) + 1;
}

function getProgress(skills) {
    if (!skills.length) {
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