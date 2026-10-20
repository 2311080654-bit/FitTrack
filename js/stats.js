window.FitTrackStats = (() => {
    const day = value => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    };
    function calculate(workouts, now = new Date()) {
        const dates = new Set(workouts.map(item => day(item.date)).filter(Boolean));
        const cursor = new Date(now);
        cursor.setHours(12, 0, 0, 0);
        if (!dates.has(day(cursor))) cursor.setDate(cursor.getDate() - 1);
        let streak = 0;
        while (dates.has(day(cursor))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return {
            count: workouts.length,
            minutes: workouts.reduce((sum, item) => sum + (Number(String(item.duration).match(/\d+/)?.[0]) || 0), 0),
            calories: workouts.reduce((sum, item) => sum + (Number(item.calories) || 0), 0),
            streak,
            routines: new Set(workouts.map(item => item.routineId)).size
        };
    }
    function achievements(stats) {
        return [
            ["Primer paso", "Completa tu primer entrenamiento", stats.count, 1],
            ["En movimiento", "Completa 5 entrenamientos", stats.count, 5],
            ["Constancia", "Completa 10 entrenamientos", stats.count, 10],
            ["Una hora para ti", "Acumula 60 minutos", stats.minutes, 60],
            ["Explora", "Completa 3 rutinas diferentes", stats.routines, 3],
            ["Tres días seguidos", "Mantén una racha de 3 días", stats.streak, 3]
        ].map(([name, description, value, target]) => ({ name, description, value, target, unlocked: value >= target }));
    }
    return { calculate, achievements };
})();
