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

export {
    renderRoadmaps
};