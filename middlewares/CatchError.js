export const CatchError = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        // console.log("in catch error : ", error);
        res.status(500).json({
            message: error.message,
        });
        next(error);
    }
};
