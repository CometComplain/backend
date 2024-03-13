export const CatchError = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};