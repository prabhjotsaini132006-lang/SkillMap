const themeToggle = document.querySelector("#theme-toggle");

function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;

    document.cookie =
        `${name}=${value}; max-age=${maxAge}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");

    const cookie = cookies.find((item) => {
        return item.startsWith(`${name}=`);
    });

    if (!cookie) {
        return null;
    }

    return cookie.split("=")[1];
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
    const currentTheme =
        document.documentElement.dataset.theme || "light";

    const nextTheme =
        currentTheme === "light" ? "dark" : "light";

    applyTheme(nextTheme);
    setCookie("skillmap-theme", nextTheme, 365);
}

const savedTheme = getCookie("skillmap-theme");

applyTheme(savedTheme || "light");

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}