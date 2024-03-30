import { Complaint, statusMap } from '../models/complaintModel.js';
import AsyncHandler from 'express-async-handler';

export const GetNoOfComplaints = AsyncHandler(async (req, res) => {
  try {
    const complaintCounts = {};
    // Count complaints by status
    for (const status in statusMap) {
      const statusCount = await Complaint.countDocuments({ status: statusMap[status] });
        complaintCounts[statusMap[status]] = statusCount;
    }

    res.status(200).json({
      complaintCounts,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
});