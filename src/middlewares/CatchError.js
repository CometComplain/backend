export const CatchError = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error("Error in CatchError:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || "An error occurred" });
        }
        next(error);
    }
};