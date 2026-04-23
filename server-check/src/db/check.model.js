import mongoose from "mongoose";

const checkSchema = new mongoose.Schema(
  {
    index: { 
        type: Number,
        unique: true
    },
    checked: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true }
);

export const Check = mongoose.model("Check", checkSchema);