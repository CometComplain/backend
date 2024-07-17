export const CheckFileType = (req, res, next) => {
    // Check if a file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Get the uploaded file
    const file = req.files.file; // Assuming the file input field name is 'file'

    // Check file size
    if (file.size > 1024 * 1024 * 100) { // 5 MB limit
        return res.status(400).send('File size exceeds limit.');
    }

    // Filter the file based on your requirements (e.g., mime type, size)
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
        return res.status(400).send('Invalid file type.');
    }

    next();
};