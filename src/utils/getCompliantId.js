import { customAlphabet } from "nanoid";
const generateId = customAlphabet("0123456789", 10);

export const GetComplaintId = () => {
  const complaintId = generateId();
  return complaintId;
};