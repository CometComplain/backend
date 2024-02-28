export const errorHandler = (err,req,res,next) => {
    const statuscode =  res.statuscode == 200 ? 500:res.statuscode;
    res.status(statuscode);
    res.json({
        message:err?.message,
        stack:err?.stack
    })
}

export const notFound = (req,res,next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
}