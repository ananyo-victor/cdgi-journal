import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  imgUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalSchema', required: true },
  journalImgs: [{ type: Buffer}],
  achievedAt: { type: Date, default: Date.now }
});

const journalImg = mongoose.model('journalImg', imageSchema);

export default journalImg;
