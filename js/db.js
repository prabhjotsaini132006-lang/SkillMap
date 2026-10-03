const DB_NAME = "skillmap-db";
const DB_VERSION = 3;

let db;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.addEventListener("success", () => {
            db = request.result;
            resolve(db);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });

        request.addEventListener("upgradeneeded", () => {
            const database = request.result;

            if (!database.objectStoreNames.contains("roadmaps")) {
                database.createObjectStore("roadmaps", {
                    keyPath: "id"
                });
            }

            if (!database.objectStoreNames.contains("skills")) {
                database.createObjectStore("skills", {
                    keyPath: "id"
                });
            }
        });
    });
}

function addRoadmap(roadmap) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("roadmaps", "readwrite");
        const store = transaction.objectStore("roadmaps");

        const request = store.add(roadmap);

        request.addEventListener("success", () => {
            resolve(roadmap);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function getRoadmaps() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("roadmaps", "readonly");
        const store = transaction.objectStore("roadmaps");

        const request = store.getAll();

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function updateRoadmap(roadmap) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("roadmaps", "readwrite");
        const store = transaction.objectStore("roadmaps");

        const request = store.put(roadmap);

        request.addEventListener("success", () => {
            resolve(roadmap);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function deleteRoadmap(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("roadmaps", "readwrite");
        const store = transaction.objectStore("roadmaps");

        const request = store.delete(id);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function addSkill(skill) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("skills", "readwrite");
        const store = transaction.objectStore("skills");

        const request = store.add(skill);

        request.addEventListener("success", () => {
            resolve(skill);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}


function getSkillsByRoadmap(roadmapId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("skills", "readonly");
        const store = transaction.objectStore("skills");

        const request = store.getAll();

        request.addEventListener("success", () => {
            const skills = request.result.filter((skill) => {
                return skill.roadmapId === roadmapId;
            });

            resolve(skills);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function getSkill(skillId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("skills", "readonly");
        const store = transaction.objectStore("skills");

        const request = store.get(skillId);

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}


function updateSkill(skill) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("skills", "readwrite");
        const store = transaction.objectStore("skills");

        const request = store.put(skill);

        request.addEventListener("success", () => {
            resolve(skill);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function deleteSkill(skillId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("skills", "readwrite");
        const store = transaction.objectStore("skills");

        const request = store.delete(skillId);

        request.addEventListener("success", () => {
            resolve();
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

function getRoadmap(roadmapId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("roadmaps", "readonly");
        const store = transaction.objectStore("roadmaps");
        const request = store.get(roadmapId);

        request.addEventListener("success", () => {
            resolve(request.result);
        });

        request.addEventListener("error", () => {
            reject(request.error);
        });
    });
}

export {
    openDatabase,
    addRoadmap,
    getRoadmaps,
    getRoadmap,
    updateRoadmap,
    deleteRoadmap,
    addSkill,
    getSkillsByRoadmap,
    getSkill,
    updateSkill,
    deleteSkill
};