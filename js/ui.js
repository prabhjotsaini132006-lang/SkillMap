function renderRoadmaps(roadmaps) {
    const roadmapList = document.querySelector("#roadmap-list");

    roadmapList.innerHTML = "";

    if (roadmaps.length === 0) {
        roadmapList.innerHTML = `
            <p>No roadmaps created yet.</p>
        `;

        return;
    }

    roadmaps.forEach((roadmap) => {
        const roadmapCard = document.createElement("article");

        roadmapCard.className = "roadmap-card";

        roadmapCard.innerHTML = `
            <div class="roadmap-card-content">

                <h3>${roadmap.name}</h3>

                <p>${roadmap.description}</p>

                <p>Progress: 0%</p>

            </div>

            <div class="roadmap-card-actions">

                <a
                    href="roadmap.html?id=${roadmap.id}"
                    class="btn btn-primary"
                >
                    Open
                </a>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-action="rename"
                    data-roadmap-id="${roadmap.id}"
                >
                    Rename
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-action="delete"
                    data-roadmap-id="${roadmap.id}"
                >
                    Delete
                </button>

            </div>
        `;

        roadmapList.appendChild(roadmapCard);
    });
}

function renderSkills(skills) {
    const skillList = document.querySelector("#skill-list");

    skillList.innerHTML = "";

    if (skills.length === 0) {
        skillList.innerHTML = `
            <p>No skills added yet.</p>
        `;

        return;
    }

    skills.forEach((skill) => {
        const skillCard = document.createElement("article");

        skillCard.className = "roadmap-card";

        skillCard.innerHTML = `
            <div class="roadmap-card-content">

                <h3>${skill.name}</h3>

                <p>${skill.description}</p>

                <p>Difficulty: ${skill.difficulty}</p>

                <p>Status: ${skill.status}</p>

                <p>Level: ${skill.level}</p>

            </div>

            <div class="roadmap-card-actions">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-action="edit-skill"
                    data-skill-id="${skill.id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-action="delete-skill"
                    data-skill-id="${skill.id}"
                >
                    Delete
                </button>

            </div>
        `;

        skillList.appendChild(skillCard);
    });
}

function renderSkillTree(skills) {

    const skillTree = document.querySelector("#skill-tree");

    skillTree.innerHTML = "";

    const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
    );

    svg.classList.add("skill-tree-lines");

    skillTree.appendChild(svg);

    if (skills.length === 0) {
        skillTree.innerHTML = `
            <p>No skills available for the skill tree.</p>
        `;

        return;
    }

    const levels = {};

    skills.forEach((skill) => {

        if (!levels[skill.level]) {
            levels[skill.level] = [];
        }

        levels[skill.level].push(skill);
    });

    Object.keys(levels)
        .sort((levelA, levelB) => {
            return Number(levelA) - Number(levelB);
        })
        .forEach((level) => {

            const levelColumn = document.createElement("div");

            levelColumn.className = "skill-tree-level";

            levelColumn.innerHTML = `
                <h3>Level ${level}</h3>
            `;

            levels[level].forEach((skill) => {

                const node = document.createElement("div");

                node.className = "skill-tree-node";
                node.dataset.skillId = skill.id;

                node.innerHTML = `
                    <strong>${skill.name}</strong>
                    <span>${skill.status}</span>
                `;

                levelColumn.appendChild(node);
            });

            skillTree.appendChild(levelColumn);
        });
}

function drawSkillTreeLines(skills) {

    const skillTree = document.querySelector("#skill-tree");
    const svg = skillTree.querySelector(".skill-tree-lines");

    skills.forEach((skill) => {

        const childNode = skillTree.querySelector(
            `[data-skill-id="${skill.id}"]`
        );

        if (!childNode) {
            return;
        }

        skill.prerequisites.forEach((prerequisiteId) => {

            const parentNode = skillTree.querySelector(
                `[data-skill-id="${prerequisiteId}"]`
            );

            if (!parentNode) {
                return;
            }

            const parentRect = parentNode.getBoundingClientRect();
            const childRect = childNode.getBoundingClientRect();
            const treeRect = skillTree.getBoundingClientRect();

            const startX =
                parentRect.right -
                treeRect.left;

            const startY =
                parentRect.top +
                parentRect.height / 2 -
                treeRect.top;

            const endX =
                childRect.left -
                treeRect.left;

            const endY =
                childRect.top +
                childRect.height / 2 -
                treeRect.top;

            const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);

            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);

            line.classList.add("skill-tree-line");

            svg.appendChild(line);
        });
    });
}

export {
    renderRoadmaps,
    renderSkills,
    renderSkillTree,
    drawSkillTreeLines
};