import {
    openDatabase,
    getRoadmaps
} from "./db.js";


const roadmapTitle = document.querySelector("#roadmap-title");
const roadmapDescription = document.querySelector("#roadmap-description");


function getRoadmapId() {
    const parameters = new URLSearchParams(window.location.search);

    return parameters.get("id");
}


function loadRoadmap() {
    const roadmapId = getRoadmapId();

    if (!roadmapId) {
        roadmapTitle.textContent = "Roadmap not found";
        roadmapDescription.textContent = "No roadmap ID was provided.";

        return;
    }

    getRoadmaps()
        .then((roadmaps) => {
            const roadmap = roadmaps.find((item) => {
                return item.id === roadmapId;
            });

            if (!roadmap) {
                roadmapTitle.textContent = "Roadmap not found";
                roadmapDescription.textContent =
                    "The requested roadmap does not exist.";

                return;
            }

            roadmapTitle.textContent = roadmap.name;
            roadmapDescription.textContent = roadmap.description;
        })
        .catch((error) => {
            console.error("Failed to load roadmap:", error);
        });
}


openDatabase()
    .then(() => {
        loadRoadmap();
    })
    .catch((error) => {
        console.error("Failed to open database:", error);
    });