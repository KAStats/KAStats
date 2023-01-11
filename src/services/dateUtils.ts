export const getDateChangedByDays = (days: number, base: Date = new Date()): Date => {
    const past = new Date(base);
    past.setHours(0, 0, 0, 0);
    past.setDate(past.getDate() + days);
    return past;
};
