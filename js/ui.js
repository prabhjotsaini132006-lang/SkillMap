function renderRoadmaps(roadmaps) {
    const list = document.querySelector("#roadmap-list");
    list.innerHTML = "";

    if (!roadmaps.length) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">+</div>
                <p>No roadmaps yet</p>
                <span>Create your first learning roadmap to get started.</span>
            </div>
        `;
        return;
    }

    roadmaps.forEach((roadmap) => {
        const progress = roadmap.progress || 0;
        const card = document.createElement("article");

        card.className = "roadmap-card";
        card.innerHTML = `
            <div class="roadmap-card-content">
                <span class="section-kicker">LEARNING PATH</span>
                <h3>${roadmap.name}</h3>
                <p>${roadmap.description || "No description provided."}</p>

                <div class="progress-info">
                    <span>Progress</span>
                    <strong>${progress}%</strong>
                </div>

                <div class="progress-track">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>

            <div class="roadmap-card-actions">
                <a href="roadmap.html?id=${roadmap.id}" class="btn btn-primary">
                    Continue →
                </a>

                <button class="btn btn-secondary"
                    data-action="rename"
                    data-roadmap-id="${roadmap.id}">
                    Rename
                </button>

                <button class="btn btn-secondary"
                    data-action="delete"
                    data-roadmap-id="${roadmap.id}">
                    Delete
                </button>
            </div>
        `;

        list.appendChild(card);
    });
}

function renderSkills(skills) {
    const list = document.querySelector("#skill-list");
    list.innerHTML = "";

    if (!skills.length) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">+</div>
                <p>No skills found</p>
                <span>Add skills or change your filters.</span>
            </div>
        `;
        return;
    }

    skills.forEach((skill) => {
        const card = document.createElement("article");

        card.className = "roadmap-card";

        const resource = skill.resourceUrl
            ? `<a class="skill-resource" href="${skill.resourceUrl}"
                target="_blank" rel="noopener noreferrer">Open Resource →</a>`
            : "";

        const deadline = skill.deadline
            ? `<span class="skill-badge deadline-badge">
                Due ${formatDate(skill.deadline)}
            </span>`
            : "";

        card.innerHTML = `
            <div class="roadmap-card-content">
                <div class="skill-card-header">
                    <div>
                        <span class="section-kicker">LEVEL ${skill.level}</span>
                        <h3>${skill.name}</h3>
                    </div>

                    <span class="skill-badge ${getStatusClass(skill.status)}">
                        ${formatStatus(skill.status)}
                    </span>
                </div>

                <p>${skill.description || "No description provided."}</p>

                <div class="skill-card-meta">
                    <span class="skill-badge ${getDifficultyClass(skill.difficulty)}">
                        ${formatDifficulty(skill.difficulty)}
                    </span>

                    <span class="skill-badge">
                        Level ${skill.level}
                    </span>

                    ${deadline}
                </div>

                ${resource}
            </div>

            <div class="roadmap-card-actions">
                <button class="btn btn-secondary"
                    data-action="edit-skill"
                    data-skill-id="${skill.id}">
                    Edit
                </button>

                <button class="btn btn-secondary"
                    data-action="delete-skill"
                    data-skill-id="${skill.id}">
                    Delete
                </button>
            </div>
        `;

        list.appendChild(card);
    });
}

function renderSkillTree(skills) {
    const tree = document.querySelector("#skill-tree");
    tree.innerHTML = "";

    if (!skills.length) {
        tree.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">◆</div>
                <p>Your skill tree is empty</p>
                <span>Add skills and prerequisites to build your learning path.</span>
            </div>
        `;
        return;
    }

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("skill-tree-lines");
    tree.appendChild(svg);

    const levels = {};

    skills.forEach((skill) => {
        if (!levels[skill.level]) {
            levels[skill.level] = [];
        }

        levels[skill.level].push(skill);
    });

    Object.keys(levels)
        .sort((a, b) => a - b)
        .forEach((level) => {
            const column = document.createElement("div");

            column.className = "skill-tree-level";
            column.innerHTML = `<h3>Level ${level}</h3>`;

            levels[level].forEach((skill) => {
                const node = document.createElement("div");

                node.className = "skill-tree-node";
                node.dataset.skillId = skill.id;

                node.innerHTML = `
                    <strong>${skill.name}</strong>
                    <span class="${getStatusClass(skill.status)}">
                        ${formatStatus(skill.status)}
                    </span>
                `;

                column.appendChild(node);
            });

            tree.appendChild(column);
        });
}

function drawSkillTreeLines(skills) {
    const tree = document.querySelector("#skill-tree");
    const svg = tree.querySelector(".skill-tree-lines");

    if (!svg) {
        return;
    }

    svg.innerHTML = "";

    const treeRect = tree.getBoundingClientRect();

    skills.forEach((skill) => {
        const child = tree.querySelector(
            `[data-skill-id="${skill.id}"]`
        );

        if (!child) {
            return;
        }

        skill.prerequisites.forEach((id) => {
            const parent = tree.querySelector(
                `[data-skill-id="${id}"]`
            );

            if (!parent) {
                return;
            }

            const parentRect = parent.getBoundingClientRect();
            const childRect = child.getBoundingClientRect();

            const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

            line.setAttribute(
                "x1",
                parentRect.right - treeRect.left
            );

            line.setAttribute(
                "y1",
                parentRect.top +
                parentRect.height / 2 -
                treeRect.top
            );

            line.setAttribute(
                "x2",
                childRect.left - treeRect.left
            );

            line.setAttribute(
                "y2",
                childRect.top +
                childRect.height / 2 -
                treeRect.top
            );

            line.classList.add("skill-tree-line");
            svg.appendChild(line);
        });
    });
}

function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );
}

const statusClasses = {
    done: "status-done",
    "in-progress": "status-progress",
    available: "status-available",
    locked: "status-locked"
};

const statusNames = {
    done: "Done",
    "in-progress": "In Progress",
    available: "Available",
    locked: "Locked"
};

const difficultyClasses = {
    easy: "difficulty-easy",
    medium: "difficulty-medium",
    hard: "difficulty-hard"
};

function getStatusClass(status) {
    return statusClasses[status] || "status-locked";
}

function getDifficultyClass(difficulty) {
    return difficultyClasses[difficulty] || "";
}

function formatStatus(status) {
    return statusNames[status] || "Locked";
}

function formatDifficulty(difficulty) {
    if (!difficulty) {
        return "Unknown";
    }

    return difficulty[0].toUpperCase() + difficulty.slice(1);
}

export {
    renderRoadmaps,
    renderSkills,
    renderSkillTree,
    drawSkillTreeLines
};