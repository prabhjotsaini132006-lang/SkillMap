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

export {
    renderRoadmaps,
    renderSkills
};