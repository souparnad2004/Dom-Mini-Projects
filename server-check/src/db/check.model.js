import mongoose from "mongoose";

const checkSchema = new mongoose.Schema(
  {
    index: { 
        type: Number,
        unique: true
    },
    checked: {
      type: Boolean,
      default: false,
      required: true,
    },
    userId: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    userEmail: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Check = mongoose.model("Check", checkSchema);