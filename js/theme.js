const themeToggle = document.querySelector("#theme-toggle");

function getTheme() {
    return document.cookie
        .split("; ")
        .find((item) => item.startsWith("theme="))
        ?.split("=")[1] || "light";
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.cookie = `theme=${theme}; max-age=31536000; path=/`;

    if (themeToggle) {
        themeToggle.textContent = theme === "dark"
            ? "☀️"
            : "🌙";
    }
}

function toggleTheme() {
    const currentTheme = getTheme();
    setTheme(currentTheme === "dark" ? "light" : "dark");
}

setTheme(getTheme());

themeToggle?.addEventListener("click", toggleTheme);