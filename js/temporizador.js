document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================
           ELEMENTOS
        ===================================== */

        const routineName =
            document.querySelector("#routineName");

        const routineDescription =
            document.querySelector("#routineDescription");

        const timerDisplay =
            document.querySelector("#timerDisplay");

        const timerStatus =
            document.querySelector("#timerStatus");

        const timerProgressBar =
            document.querySelector(
                "#timerProgressBar"
            );

        const startTimer =
            document.querySelector("#startTimer");

        const pauseTimer =
            document.querySelector("#pauseTimer");

        const resetTimer =
            document.querySelector("#resetTimer");

        const currentExercise =
            document.querySelector(
                "#currentExercise"
            );

        const currentExerciseDescription =
            document.querySelector(
                "#currentExerciseDescription"
            );

        const exerciseNumber =
            document.querySelector(
                "#exerciseNumber"
            );

        const totalExercises =
            document.querySelector(
                "#totalExercises"
            );

        const totalCalories =
            document.querySelector(
                "#totalCalories"
            );

        const routineLevel =
            document.querySelector(
                "#routineLevel"
            );

        const nextExercise =
            document.querySelector(
                "#nextExercise"
            );

        const exerciseList =
            document.querySelector(
                "#exerciseList"
            );

        const workoutComplete =
            document.querySelector(
                "#workoutComplete"
            );


        /* =====================================
           VARIABLES
        ===================================== */

        let routines = [];

        let exercises = [];

        let selectedRoutine = null;

        let currentExerciseIndex = 0;

        let timeRemaining = 30;

        let totalTime = 30;

        let timerInterval = null;

        let timerRunning = false;


        /* =====================================
           OBTENER ID DE LA URL
        ===================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );

        const routineId =
            Number(
                params.get("routine")
            );


        /* =====================================
           INICIAR
        ===================================== */

        loadWorkout();


        /* =====================================
           CARGAR DATOS
        ===================================== */

        async function loadWorkout() {

            try {

                const [
                    routinesResponse,
                    exercisesResponse
                ] = await Promise.all([

                    fetch(
                        "../data/rutinas.json"
                    ),

                    fetch(
                        "../data/ejercicios.json"
                    )

                ]);


                if (
                    !routinesResponse.ok ||
                    !exercisesResponse.ok
                ) {

                    throw new Error(
                        "No se pudieron cargar los archivos JSON."
                    );

                }


                routines =
                    await routinesResponse.json();

                exercises =
                    await exercisesResponse.json();


                selectedRoutine =
                    routines.find(
                        routine =>
                            routine.id ===
                            routineId
                    );


                if (!selectedRoutine) {

                    showRoutineError();

                    return;
                }


                prepareWorkout();


            } catch (error) {

                console.error(
                    "FitTrack Timer:",
                    error
                );

                showRoutineError();

            }

        }


        /* =====================================
           PREPARAR RUTINA
        ===================================== */

        function prepareWorkout() {

            routineName.textContent =
                selectedRoutine.nombre;

            routineDescription.textContent =
                selectedRoutine.descripcion;

            totalExercises.textContent =
                selectedRoutine.ejercicios.length;

            totalCalories.textContent =
                selectedRoutine.calorias;

            routineLevel.textContent =
                selectedRoutine.nivel;


            renderExerciseList();

            updateCurrentExercise();

            updateTimerDisplay();

        }


        /* =====================================
           LISTA DE EJERCICIOS
        ===================================== */

        function renderExerciseList() {

            exerciseList.innerHTML = "";


            selectedRoutine.ejercicios.forEach(
                (exerciseId, index) => {

                    const exercise =
                        exercises.find(
                            item =>
                                item.id ===
                                exerciseId
                        );


                    if (!exercise) {
                        return;
                    }


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "exercise-list-item";


                    if (
                        index ===
                        currentExerciseIndex
                    ) {

                        item.classList.add(
                            "active"
                        );

                    }


                    item.dataset.index =
                        index;


                    item.innerHTML = `

                        <div
                            class="exercise-list-number"
                        >
                            ${index + 1}
                        </div>

                        <div
                            class="exercise-list-icon"
                        >
                            ${exercise.icono}
                        </div>

                        <div
                            class="exercise-list-content"
                        >

                            <h3>
                                ${exercise.nombre}
                            </h3>

                            <p>
                                ${exercise.duracion}
                                ·
                                ${exercise.calorias} kcal
                            </p>

                        </div>

                        <div
                            class="exercise-list-check"
                        >
                            ${index < currentExerciseIndex
                                ? "✓"
                                : ""
                            }
                        </div>

                    `;


                    exerciseList.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================
           EJERCICIO ACTUAL
        ===================================== */

        function updateCurrentExercise() {

            const exerciseId =
                selectedRoutine.ejercicios[
                    currentExerciseIndex
                ];


            const exercise =
                exercises.find(
                    item =>
                        item.id ===
                        exerciseId
                );


            if (!exercise) {
                return;
            }


            currentExercise.textContent =
                exercise.nombre;


            currentExerciseDescription.textContent =
                exercise.descripcion;


            exerciseNumber.textContent =
                `${currentExerciseIndex + 1}/${selectedRoutine.ejercicios.length}`;


            const icon =
                document.querySelector(
                    ".current-exercise-icon"
                );


            if (icon) {

                icon.textContent =
                    exercise.icono;

            }


            renderExerciseList();

        }


        /* =====================================
           TIMER
        ===================================== */

        function startWorkoutTimer() {

            if (timerRunning) {
                return;
            }


            timerRunning = true;


            timerStatus.textContent =
                "ENTRENANDO";


            startTimer.disabled = true;


            timerInterval =
                setInterval(
                    () => {

                        if (
                            timeRemaining > 0
                        ) {

                            timeRemaining--;

                            updateTimerDisplay();

                        } else {

                            completeCurrentExercise();

                        }

                    },
                    1000
                );

        }


        /* =====================================
           PAUSAR
        ===================================== */

        function pauseWorkoutTimer() {

            if (!timerRunning) {
                return;
            }


            clearInterval(
                timerInterval
            );


            timerInterval = null;

            timerRunning = false;


            timerStatus.textContent =
                "PAUSADO";


            startTimer.disabled = false;

        }


        /* =====================================
           REINICIAR
        ===================================== */

        function resetWorkoutTimer() {

            clearInterval(
                timerInterval
            );


            timerInterval = null;

            timerRunning = false;


            timeRemaining = 30;

            totalTime = 30;


            timerStatus.textContent =
                "LISTO";


            startTimer.disabled = false;


            updateTimerDisplay();

        }


        /* =====================================
           COMPLETAR EJERCICIO
        ===================================== */

        function completeCurrentExercise() {

            clearInterval(
                timerInterval
            );


            timerInterval = null;

            timerRunning = false;


            if (
                currentExerciseIndex <
                selectedRoutine.ejercicios.length - 1
            ) {

                currentExerciseIndex++;


                timeRemaining = 30;

                totalTime = 30;


                timerStatus.textContent =
                    "SIGUIENTE";


                updateCurrentExercise();

                updateTimerDisplay();


                setTimeout(
                    () => {

                        timerStatus.textContent =
                            "LISTO";

                    },
                    1000
                );


            } else {

                finishWorkout();

            }


            startTimer.disabled = false;

        }


        /* =====================================
           SIGUIENTE
        ===================================== */

        function goToNextExercise() {

            clearInterval(
                timerInterval
            );


            timerInterval = null;

            timerRunning = false;


            if (
                currentExerciseIndex <
                selectedRoutine.ejercicios.length - 1
            ) {

                currentExerciseIndex++;

                timeRemaining = 30;

                totalTime = 30;


                timerStatus.textContent =
                    "SIGUIENTE";


                updateCurrentExercise();

                updateTimerDisplay();


                startTimer.disabled = false;

            } else {

                finishWorkout();

            }

        }


        /* =====================================
           ACTUALIZAR DISPLAY
        ===================================== */

        function updateTimerDisplay() {

            const minutes =
                Math.floor(
                    timeRemaining / 60
                );

            const seconds =
                timeRemaining % 60;


            timerDisplay.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


            const progress =
                totalTime > 0
                    ? (
                        (
                            totalTime -
                            timeRemaining
                        ) /
                        totalTime
                    ) * 100
                    : 0;


            timerProgressBar.style.width =
                `${progress}%`;

        }


        /* =====================================
           FINALIZAR ENTRENAMIENTO
        ===================================== */

        function finishWorkout() {

            clearInterval(
                timerInterval
            );


            timerInterval = null;

            timerRunning = false;


            timerStatus.textContent =
                "COMPLETADO";


            timerDisplay.textContent =
                "00:00";


            timerProgressBar.style.width =
                "100%";


            startTimer.disabled = true;


            nextExercise.disabled = true;


            saveWorkout();


            workoutComplete.hidden =
                false;


            workoutComplete.scrollIntoView({
                behavior: "smooth"
            });

        }


        /* =====================================
           GUARDAR ENTRENAMIENTO
        ===================================== */

        function saveWorkout() {

            const savedWorkouts =
                JSON.parse(
                    localStorage.getItem(
                        "fittrack_workouts"
                    )
                ) || [];


            const workout = {

                id: Date.now(),

                routineId:
                    selectedRoutine.id,

                routineName:
                    selectedRoutine.nombre,

                duration:
                    selectedRoutine.duracion,

                calories:
                    selectedRoutine.calorias,

                level:
                    selectedRoutine.nivel,

                date:
                    new Date().toISOString()

            };


            savedWorkouts.push(
                workout
            );


            localStorage.setItem(
                "fittrack_workouts",
                JSON.stringify(
                    savedWorkouts
                )
            );


            console.log(
                "FitTrack: entrenamiento guardado.",
                workout
            );

        }


        /* =====================================
           ERROR
        ===================================== */

        function showRoutineError() {

            routineName.textContent =
                "Rutina no encontrada";

            routineDescription.textContent =
                "Regresa a Rutinas y selecciona un entrenamiento válido.";

            timerDisplay.textContent =
                "--:--";

            startTimer.disabled =
                true;

            pauseTimer.disabled =
                true;

            resetTimer.disabled =
                true;

            nextExercise.disabled =
                true;

        }


        /* =====================================
           EVENTOS
        ===================================== */

        startTimer.addEventListener(
            "click",
            startWorkoutTimer
        );


        pauseTimer.addEventListener(
            "click",
            pauseWorkoutTimer
        );


        resetTimer.addEventListener(
            "click",
            resetWorkoutTimer
        );


        nextExercise.addEventListener(
            "click",
            goToNextExercise
        );

    }
);