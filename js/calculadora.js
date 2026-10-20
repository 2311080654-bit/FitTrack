document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#intervalForm");
    const result = document.querySelector("#calculationResult");
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const exercises = Number(document.getElementById("exerciseCount").value);
        const rounds = Number(document.getElementById("roundCount").value);
        const work = Number(document.getElementById("workSeconds").value);
        const rest = Number(document.getElementById("restSeconds").value);
        if (![exercises, rounds, work, rest].every(Number.isInteger)) {
            result.hidden = false;
            result.textContent = "Utiliza números enteros en todos los campos.";
            return;
        }
        const intervals = exercises * rounds;
        const total = intervals * work + (intervals - 1) * rest;
        result.hidden = false;
        result.textContent = `${Math.floor(total / 60)} min ${total % 60} s en total: ${intervals} intervalos de trabajo y ${intervals - 1} descansos. No incluye descanso después del último ejercicio.`;
    });
    form.addEventListener("reset", () => { result.hidden = true; result.textContent = ""; });
});
