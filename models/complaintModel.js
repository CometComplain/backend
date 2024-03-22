import mongoose from "mongoose";

export const statusMap = {pending:0, verified:1, accepted:2, solved:3, reject:4}
// change the attributes name according to your comfortable names
const compliantSchema = new mongoose.Schema({
  compliantID: {
    type: String,
    default: "",
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
    type: String,
    required: true,
  },
  location: {
    type: {
      buildingName: String,
      roomNo: String,
      floorNo: String,
    },
  },
  complaintHash: {

  },
  status: {
    type: String,
    enum: Object.values(statusMap),
    default: "pending",
  },

  ceratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
  },
  
  accepytedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
});

export const Compliant = mongoose.model("Compliant", compliantSchema);
