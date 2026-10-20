document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#beginWorkout")?.addEventListener("click", () => {
        window.location.href = "./pages/rutinas.html";
    });
    const values = document.querySelectorAll("#progreso .stat-card strong");
    values.forEach(value => { value.textContent = "…"; });
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    document.querySelector("#progreso").appendChild(status);
    try {
        const stats = FitTrackStats.calculate(await FitTrackDB.list());
        const numbers = [stats.streak, stats.count, stats.minutes, FitTrackStats.achievements(stats).filter(item => item.unlocked).length];
        values.forEach((value, index) => { value.textContent = numbers[index]; });
        status.textContent = stats.count ? "Tu historial está actualizado." : "Completa tu primera rutina para registrar tu progreso.";
    } catch (error) {
        values.forEach(value => { value.textContent = "—"; });
        status.textContent = error.message;
        const retry = document.createElement("button");
        retry.className = "btn";
        retry.textContent = "Volver a cargar";
        retry.onclick = () => location.reload();
        status.appendChild(retry);
    }
});
