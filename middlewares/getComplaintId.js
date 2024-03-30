import { customAlphabet } from 'nanoid';

const generateId = customAlphabet("0123456789", 10);

// Middleware to generate complaint ID
export const generateComplaintId = (req, res, next) => {
    req.body.complaintId = generateId();
    next();
}
