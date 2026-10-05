document.addEventListener(
    "DOMContentLoaded",
    () => {

        const routineGrid =
            document.querySelector("#routineGrid");

        const emptyRoutines =
            document.querySelector("#emptyRoutines");

        const filterButtons =
            document.querySelectorAll(
                ".routine-filter"
            );

        let routines = [];

        let currentCategory = "Todos";


        /* =====================================
           CARGAR JSON
        ===================================== */

        loadRoutines();


        async function loadRoutines() {

            try {

                const response =
                    await fetch(
                        "../data/rutinas.json"
                    );

                if (!response.ok) {
                    throw new Error(
                        "No se pudo cargar rutinas.json"
                    );
                }

                routines =
                    await response.json();

                renderRoutines();

            } catch (error) {

                console.error(
                    "FitTrack - Error cargando rutinas:",
                    error
                );

                routineGrid.innerHTML = `
                    <div class="empty-routines">
                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h2>
                            Error al cargar las rutinas
                        </h2>

                        <p>
                            Verifica que rutinas.json exista
                            dentro de la carpeta data.
                        </p>
                    </div>
                `;
            }
        }


        /* =====================================
           MOSTRAR RUTINAS
        ===================================== */

        function renderRoutines() {

            const filteredRoutines =
                routines.filter(
                    routine => {

                        if (
                            currentCategory ===
                            "Todos"
                        ) {
                            return true;
                        }

                        return (
                            routine.categoria ===
                            currentCategory
                        );
                    }
                );


            routineGrid.innerHTML = "";


            if (
                filteredRoutines.length === 0
            ) {

                emptyRoutines.hidden = false;

                return;
            }


            emptyRoutines.hidden = true;


            filteredRoutines.forEach(
                routine => {

                    const card =
                        createRoutineCard(
                            routine
                        );

                    routineGrid.appendChild(
                        card
                    );
                }
            );
        }


        /* =====================================
           CREAR TARJETA
        ===================================== */

        function createRoutineCard(
            routine
        ) {

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "routine-card";


            article.innerHTML = `

                <div class="routine-card-top">

                    <div class="routine-icon">
                        ${routine.icono}
                    </div>

                    <span class="routine-category">
                        ${routine.categoria}
                    </span>

                </div>


                <h2>
                    ${routine.nombre}
                </h2>


                <p class="routine-card-description">
                    ${routine.descripcion}
                </p>


                <div class="routine-info">

                    <div class="routine-info-item">

                        <span class="routine-info-label">
                            Tiempo
                        </span>

                        <span class="routine-info-value">
                            ${routine.duracion}
                        </span>

                    </div>


                    <div class="routine-info-item">

                        <span class="routine-info-label">
                            Calorías
                        </span>

                        <span class="routine-info-value">
                            ${routine.calorias} kcal
                        </span>

                    </div>


                    <div class="routine-info-item">

                        <span class="routine-info-label">
                            Nivel
                        </span>

                        <span class="routine-info-value">
                            ${routine.nivel}
                        </span>

                    </div>

                </div>


                <div class="routine-exercises">

                    <div class="routine-exercises-title">
                        Ejercicios
                    </div>

                    <div class="routine-exercise-count">
                        ${routine.ejercicios.length}
                        ejercicios incluidos
                    </div>

                </div>


                <button
                    class="routine-start"
                    data-routine-id="${routine.id}"
                >
                    Comenzar rutina →
                </button>

            `;


            const startButton =
                article.querySelector(
                    ".routine-start"
                );


            startButton.addEventListener(
                "click",
                () => {

                    startRoutine(
                        routine.id
                    );

                }
            );


            return article;
        }


        /* =====================================
           COMENZAR RUTINA
        ===================================== */

        function startRoutine(
            routineId
        ) {

            window.location.href =
                `./temporizador.html?routine=${routineId}`;

        }


        /* =====================================
           FILTROS
        ===================================== */

        filterButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        filterButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        currentCategory =
                            button.dataset.category;


                        renderRoutines();

                    }
                );

            }
        );

    }
);