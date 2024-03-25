import mongoose from "mongoose";

export const statusMap = {pending:0, verified:1, accepted:2, solved:3, rejected:4}
export const typesMap = {
  mess: 0,
  electrical: 1,
  plumbing: 2,
  it: 3,
  academics: 4,
  others: 5,
}

// change the attributes name according to your comfortable names
const compliantSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  mobile: {
    type: String,
  },
  compliantType: {
    type: Number,
    enum: Object.values(typesMap),
    required: true,
  },
  location: {
    type: {
      buildingName: Number,
      roomNo: String,
      floorNo: String,
    },
    required: true,
  },
  complaintHash: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: Number,
    enum: Object.values(statusMap),
    default: statusMap.pending,
  },

  createdBy: {
    type: String,
    required: true,
  },
  
  accepytedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  proof: {
    type: String,
  },
  completionProof: {
    type: String,
  },
});

compliantSchema.index({ complaintId: 1 }, { unique: true });


export const Compliant = mongoose.model("Compliant", compliantSchema);
