import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    journalName: { type: String, require: true },
    journalText: { type: String },
    journalImg: [{ type: Buffer }],
    journalPdf: [{ type: Buffer }],
    achievedAt: { type: Date, default: Date.now }
});

const JournalModel = mongoose.model("Journal", journalSchema);

export default JournalModel;
