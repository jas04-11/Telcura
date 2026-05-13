const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    wouldRecommend: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Update doctor rating on save
reviewSchema.post("save", async function () {
  const Doctor = require("./Doctor");
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { doctor: this.doctor } },
    { $group: { _id: "$doctor", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(this.doctor, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
