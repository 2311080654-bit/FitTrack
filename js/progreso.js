document.addEventListener(
    "DOMContentLoaded",
    () => {

        const totalWorkouts =
            document.querySelector(
                "#totalWorkouts"
            );

        const totalMinutes =
            document.querySelector(
                "#totalMinutes"
            );

        const totalCalories =
            document.querySelector(
                "#totalCalories"
            );

        const currentStreak =
            document.querySelector(
                "#currentStreak"
            );

        const weeklyChart =
            document.querySelector(
                "#weeklyChart"
            );

        const lastWorkout =
            document.querySelector(
                "#lastWorkout"
            );

        const workoutHistory =
            document.querySelector(
                "#workoutHistory"
            );

        const emptyProgress =
            document.querySelector(
                "#emptyProgress"
            );

        const clearHistory =
            document.querySelector(
                "#clearHistory"
            );


        /* =====================================
           CARGAR DATOS
        ===================================== */

        loadProgress();


        /* =====================================
           OBTENER ENTRENAMIENTOS
        ===================================== */

        function getWorkouts() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "fittrack_workouts"
                    )
                ) || [];

            } catch (error) {

                console.error(
                    "Error leyendo LocalStorage:",
                    error
                );

                return [];

            }

        }


        /* =====================================
           CARGAR PROGRESO
        ===================================== */

        function loadProgress() {

            const workouts =
                getWorkouts();


            if (workouts.length === 0) {

                showEmptyState();

                return;

            }


            showProgress();


            calculateStatistics(
                workouts
            );

            renderWeeklyChart(
                workouts
            );

            renderLastWorkout(
                workouts
            );

            renderHistory(
                workouts
            );

        }


        /* =====================================
           ESTADÍSTICAS
        ===================================== */

        function calculateStatistics(
            workouts
        ) {

            const workoutCount =
                workouts.length;


            const minutes =
                workouts.reduce(
                    (
                        total,
                        workout
                    ) => {

                        return (
                            total +
                            parseDuration(
                                workout.duration
                            )
                        );

                    },
                    0
                );


            const calories =
                workouts.reduce(
                    (
                        total,
                        workout
                    ) => {

                        return (
                            total +
                            Number(
                                workout.calories
                            )
                        );

                    },
                    0
                );


            const streak =
                calculateStreak(
                    workouts
                );


            totalWorkouts.textContent =
                workoutCount;

            totalMinutes.textContent =
                minutes;

            totalCalories.textContent =
                calories;

            currentStreak.textContent =
                streak;

        }


        /* =====================================
           DURACIÓN
        ===================================== */

        function parseDuration(
            duration
        ) {

            if (!duration) {
                return 0;
            }


            const match =
                String(duration).match(
                    /(\d+)/
                );


            if (!match) {
                return 0;
            }


            return Number(
                match[1]
            );

        }


        /* =====================================
           RACHA
        ===================================== */

        function calculateStreak(
            workouts
        ) {

            if (
                workouts.length === 0
            ) {

                return 0;

            }


            const dates =
                workouts
                    .map(
                        workout =>
                            normalizeDate(
                                workout.date
                            )
                    )
                    .filter(Boolean);


            const uniqueDates =
                [
                    ...new Set(dates)
                ]
                .sort()
                .reverse();


            if (
                uniqueDates.length === 0
            ) {

                return 0;

            }


            const today =
                normalizeDate(
                    new Date()
                );


            const yesterday =
                normalizeDate(
                    new Date(
                        Date.now() -
                        86400000
                    )
                );


            if (
                uniqueDates[0] !== today &&
                uniqueDates[0] !== yesterday
            ) {

                return 0;

            }


            let streak = 1;


            for (
                let i = 1;
                i < uniqueDates.length;
                i++
            ) {

                const current =
                    new Date(
                        uniqueDates[i - 1]
                    );

                const previous =
                    new Date(
                        uniqueDates[i]
                    );


                const difference =
                    (
                        current -
                        previous
                    ) /
                    86400000;


                if (
                    Math.round(
                        difference
                    ) === 1
                ) {

                    streak++;

                } else {

                    break;

                }

            }


            return streak;

        }


        /* =====================================
           NORMALIZAR FECHA
        ===================================== */

        function normalizeDate(
            dateValue
        ) {

            const date =
                new Date(
                    dateValue
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return null;

            }


            return [
                date.getFullYear(),
                String(
                    date.getMonth() + 1
                ).padStart(2, "0"),
                String(
                    date.getDate()
                ).padStart(2, "0")
            ].join("-");

        }


        /* =====================================
           GRÁFICA SEMANAL
        ===================================== */

        function renderWeeklyChart(
            workouts
        ) {

            const today =
                new Date();


            const weekDays =
                [];


            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        today
                    );


                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                date.setDate(
                    today.getDate() - i
                );


                weekDays.push(
                    date
                );

            }


            const values =
                weekDays.map(
                    date => {

                        const day =
                            normalizeDate(
                                date
                            );


                        return workouts.filter(
                            workout =>
                                normalizeDate(
                                    workout.date
                                ) === day
                        ).length;

                    }
                );


            const maximum =
                Math.max(
                    ...values,
                    1
                );


            weeklyChart.innerHTML = "";


            values.forEach(
                (value, index) => {

                    const column =
                        document.createElement(
                            "div"
                        );


                    column.className =
                        "chart-column";


                    const bar =
                        document.createElement(
                            "div"
                        );


                    bar.className =
                        "chart-bar";


                    const height =
                        value === 0
                            ? 4
                            : (
                                value /
                                maximum
                            ) * 100;


                    bar.style.height =
                        `${height}%`;


                    const valueText =
                        document.createElement(
                            "span"
                        );


                    valueText.className =
                        "chart-value";


                    valueText.textContent =
                        value;


                    column.appendChild(
                        valueText
                    );

                    column.appendChild(
                        bar
                    );


                    weeklyChart.appendChild(
                        column
                    );

                }
            );

        }


        /* =====================================
           ÚLTIMO ENTRENAMIENTO
        ===================================== */

        function renderLastWorkout(
            workouts
        ) {

            const sorted =
                [
                    ...workouts
                ].sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(b.date) -
                        new Date(a.date)
                );


            const workout =
                sorted[0];


            if (!workout) {
                return;
            }


            lastWorkout.innerHTML = `

                <div class="last-workout-content">

                    <div class="last-workout-icon">
                        🏆
                    </div>

                    <h3>
                        ${workout.routineName}
                    </h3>

                    <p>
                        ${workout.duration}
                        ·
                        ${workout.calories} kcal
                    </p>

                    <span class="last-workout-date">
                        ${formatDate(workout.date)}
                    </span>

                </div>

            `;

        }


        /* =====================================
           HISTORIAL
        ===================================== */

        function renderHistory(
            workouts
        ) {

            const sorted =
                [
                    ...workouts
                ].sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(b.date) -
                        new Date(a.date)
                );


            workoutHistory.innerHTML =
                "";


            sorted.forEach(
                workout => {

                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "history-item";


                    item.innerHTML = `

                        <div class="history-icon">
                            🏋️
                        </div>

                        <div class="history-content">

                            <h3>
                                ${workout.routineName}
                            </h3>

                            <p>
                                ${formatDate(
                                    workout.date
                                )}
                            </p>

                        </div>

                        <div class="history-details">

                            <div class="history-detail">

                                <span>
                                    TIEMPO
                                </span>

                                <strong>
                                    ${workout.duration}
                                </strong>

                            </div>

                            <div class="history-detail">

                                <span>
                                    CALORÍAS
                                </span>

                                <strong>
                                    ${workout.calories}
                                    kcal
                                </strong>

                            </div>

                            <div class="history-detail">

                                <span>
                                    NIVEL
                                </span>

                                <strong>
                                    ${workout.level}
                                </strong>

                            </div>

                        </div>

                    `;


                    workoutHistory.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================
           FORMATEAR FECHA
        ===================================== */

        function formatDate(
            dateValue
        ) {

            const date =
                new Date(
                    dateValue
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "Fecha desconocida";

            }


            return date.toLocaleDateString(
                "es-MX",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        }


        /* =====================================
           ESTADO VACÍO
        ===================================== */

        function showEmptyState() {

            totalWorkouts.textContent =
                "0";

            totalMinutes.textContent =
                "0";

            totalCalories.textContent =
                "0";

            currentStreak.textContent =
                "0";


            emptyProgress.hidden =
                false;


            workoutHistory.hidden =
                true;


            lastWorkout.innerHTML = `

                <div class="last-workout-content">

                    <div class="last-workout-icon">
                        🏃
                    </div>

                    <h3>
                        Sin entrenamientos
                    </h3>

                    <p>
                        Completa tu primera rutina
                        para comenzar a registrar
                        tu progreso.
                    </p>

                </div>

            `;


            renderEmptyChart();

        }


        /* =====================================
           MOSTRAR PROGRESO
        ===================================== */

        function showProgress() {

            emptyProgress.hidden =
                true;

            workoutHistory.hidden =
                false;

        }


        /* =====================================
           GRÁFICA VACÍA
        ===================================== */

        function renderEmptyChart() {

            weeklyChart.innerHTML = "";


            for (
                let i = 0;
                i < 7;
                i++
            ) {

                const column =
                    document.createElement(
                        "div"
                    );


                column.className =
                    "chart-column";


                column.innerHTML = `

                    <span class="chart-value">
                        0
                    </span>

                    <div
                        class="chart-bar"
                        style="height: 4px;"
                    ></div>

                `;


                weeklyChart.appendChild(
                    column
                );

            }

        }


        /* =====================================
           BORRAR HISTORIAL
        ===================================== */

        clearHistory.addEventListener(
            "click",
            () => {

                const workouts =
                    getWorkouts();


                if (
                    workouts.length === 0
                ) {

                    return;

                }


                const confirmation =
                    confirm(
                        "¿Seguro que quieres borrar todo tu historial de entrenamientos?"
                    );


                if (!confirmation) {

                    return;

                }


                localStorage.removeItem(
                    "fittrack_workouts"
                );


                loadProgress();

            }
        );

    }
);