export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    if (status === 500) {
        console.error(`[${new Date().toISOString()}] ${err.stack}`);
    }

    res.status(status).json({
        success: false,
        message: err.message || 'Lỗi máy chủ',
        error: err.message || 'Lỗi máy chủ',
        ...(err.errors ? { errors: err.errors } : {}),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}