document.addEventListener("DOMContentLoaded", () => {
    const status = document.querySelector("#achievementStatus");
    const grid = document.querySelector("#achievementGrid");
    const reload = document.querySelector("#reloadAchievements");
    async function load() {
        reload.disabled = true;
        status.textContent = "Cargando tus logros…";
        grid.replaceChildren();
        try {
            const stats = FitTrackStats.calculate(await FitTrackDB.list());
            const achievements = FitTrackStats.achievements(stats);
            status.textContent = `${achievements.filter(item => item.unlocked).length} de ${achievements.length} objetivos alcanzados. La racha refleja los días consecutivos actuales.`;
            achievements.forEach(item => {
                const card = document.createElement("article");
                card.className = `tool-card${item.unlocked ? " unlocked" : ""}`;
                const title = document.createElement("h2");
                title.textContent = `${item.unlocked ? "🏆" : "🔒"} ${item.name}`;
                const description = document.createElement("p");
                description.textContent = item.description;
                const progress = document.createElement("progress");
                progress.max = item.target;
                progress.value = Math.min(item.value, item.target);
                progress.setAttribute("aria-label", item.description);
                const count = document.createElement("p");
                count.textContent = `${Math.min(item.value, item.target)} / ${item.target} · ${item.unlocked ? "Alcanzado" : "En progreso"}`;
                card.append(title, description, progress, count);
                grid.appendChild(card);
            });
        } catch (error) { status.textContent = error.message; }
        finally { reload.disabled = false; }
    }
    reload.addEventListener("click", load);
    load();
});
