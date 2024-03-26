import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  pdfUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalSchema', required: true },
  journalPdfs: [{ type: Buffer}],
  achievedAt: { type: Date, default: Date.now }
});

const journalPdf = mongoose.model('journalPdf', pdfSchema);

export default journalPdf;
