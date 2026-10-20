window.FitTrackMedia = (() => {
    const root = new URL("../", document.currentScript.src);
    function create(exercise, onVideo = () => {}) {
        const section = document.createElement("section");
        section.className = "exercise-media";
        section.setAttribute("aria-label", `Demostración de ${exercise.nombre}`);
        const images = document.createElement("div");
        images.className = "exercise-media-images";
        const sources = exercise.imagenes || [];
        sources.forEach((source, index) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = new URL(source, root).href;
            img.alt = `${exercise.nombre}: posición ${index + 1}`;
            img.loading = "lazy";
            img.width = 480;
            img.height = 360;
            img.addEventListener("error", () => {
                img.hidden = true;
                caption.textContent = "Imagen no disponible";
            });
            const caption = document.createElement("figcaption");
            caption.textContent = sources.length > 1 ? `Posición ${index + 1}` : "Vista previa del video";
            figure.append(img, caption);
            images.appendChild(figure);
        });
        section.appendChild(images);
        if (exercise.id <= 10) {
            const credit = document.createElement("a");
            credit.href = "https://github.com/yuhonas/free-exercise-db";
            credit.target = "_blank";
            credit.rel = "noopener noreferrer";
            credit.textContent = "Fotos: free-exercise-db (Unlicense)";
            section.appendChild(credit);
        }
        if (/^[\w-]{11}$/.test(exercise.videoId || "")) {
            const button = document.createElement("button");
            button.className = "media-video-button";
            button.type = "button";
            button.textContent = "▶ Ver video";
            button.setAttribute("aria-expanded", "false");
            const container = document.createElement("div");
            container.hidden = true;
            const link = document.createElement("a");
            link.href = `https://www.youtube.com/watch?v=${exercise.videoId}`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Abrir en YouTube ↗";
            link.addEventListener("click", onVideo);
            button.addEventListener("click", () => {
                const opening = container.hidden;
                container.replaceChildren();
                container.hidden = !opening;
                button.setAttribute("aria-expanded", String(opening));
                button.textContent = opening ? "Cerrar video" : "▶ Ver video";
                if (opening) {
                    onVideo();
                    const iframe = document.createElement("iframe");
                    iframe.src = `https://www.youtube-nocookie.com/embed/${exercise.videoId}?rel=0`;
                    iframe.title = `Video: ${exercise.nombre}`;
                    iframe.allow = "encrypted-media; picture-in-picture; fullscreen";
                    iframe.allowFullscreen = true;
                    iframe.referrerPolicy = "strict-origin-when-cross-origin";
                    container.appendChild(iframe);
                }
            });
            section.append(button, link, container);
            const note = document.createElement("small");
            note.textContent = `Video de ${exercise.videoAutor || "YouTube"}. Requiere Internet; algunos videos están en inglés.`;
            section.appendChild(note);
        }
        return section;
    }
    return { create };
})();
