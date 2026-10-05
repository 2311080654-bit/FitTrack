document.addEventListener(
    "DOMContentLoaded",
    () => {

        const exerciseGrid =
            document.querySelector(
                "#exerciseGrid"
            );

        const searchInput =
            document.querySelector(
                "#searchExercise"
            );

        const categoryButtons =
            document.querySelectorAll(
                ".category-button"
            );

        const emptyMessage =
            document.querySelector(
                "#emptyExercises"
            );


        let exercises = [];

        let currentCategory = "Todos";


        // ========================================
        // CARGAR JSON
        // ========================================

        loadExercises();


        async function loadExercises() {

            try {

                const response =
                    await fetch(
                        "../data/ejercicios.json"
                    );


                if (!response.ok) {

                    throw new Error(
                        "No se pudo cargar ejercicios.json"
                    );

                }


                exercises =
                    await response.json();


                renderExercises();

            } catch (error) {

                console.error(
                    "FitTrack: error cargando ejercicios:",
                    error
                );

                exerciseGrid.innerHTML = `
                    <div class="empty-exercises">
                        <span>⚠️</span>
                        <h2>Error al cargar ejercicios</h2>
                        <p>
                            Verifica que ejercicios.json
                            exista dentro de la carpeta data.
                        </p>
                    </div>
                `;

            }

        }


        // ========================================
        // MOSTRAR EJERCICIOS
        // ========================================

        function renderExercises() {

            const searchText =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filteredExercises =
                exercises.filter(exercise => {

                    const matchesCategory =
                        currentCategory === "Todos" ||
                        exercise.categoria ===
                            currentCategory;


                    const matchesSearch =
                        exercise.nombre
                            .toLowerCase()
                            .includes(searchText) ||

                        exercise.categoria
                            .toLowerCase()
                            .includes(searchText) ||

                        exercise.nivel
                            .toLowerCase()
                            .includes(searchText);


                    return (
                        matchesCategory &&
                        matchesSearch
                    );

                });


            exerciseGrid.innerHTML = "";


            if (
                filteredExercises.length === 0
            ) {

                emptyMessage.hidden = false;

                return;

            }


            emptyMessage.hidden = true;


            filteredExercises.forEach(
                exercise => {

                    const card =
                        createExerciseCard(
                            exercise
                        );

                    exerciseGrid.appendChild(
                        card
                    );

                }
            );

        }


        // ========================================
        // CREAR TARJETA
        // ========================================

        function createExerciseCard(
            exercise
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "exercise-card";


            article.innerHTML = `

                <div class="exercise-icon">
                    ${exercise.icono}
                </div>

                <span class="exercise-category">
                    ${exercise.categoria}
                </span>

                <h2>
                    ${exercise.nombre}
                </h2>

                <p class="exercise-description">
                    ${exercise.descripcion}
                </p>

                <div class="exercise-info">

                    <span>
                        ⏱ ${exercise.duracion}
                    </span>

                    <span>
                        🔥 ${exercise.calorias} kcal
                    </span>

                    <span>
                        ⭐ ${exercise.nivel}
                    </span>

                </div>

            `;


            return article;

        }


        // ========================================
        // BUSCADOR
        // ========================================

        searchInput.addEventListener(
            "input",
            () => {

                renderExercises();

            }
        );


        // ========================================
        // CATEGORÍAS
        // ========================================

        categoryButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        categoryButtons.forEach(
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


                        renderExercises();

                    }
                );

            }
        );

    }
);