import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    sub: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },

    email: String,
    emailVerified: Boolean,
    name: String,
    picture: String,

    roles: {
      type: [String],
      default: ["user"],
    },

    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: OIDC uniqueness constraint
userSchema.index({ sub: 1, issuer: 1 }, { unique: true });

export const UserModel = mongoose.model("User", userSchema);