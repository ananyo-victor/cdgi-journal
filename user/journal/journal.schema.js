import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    journalName: { type: String, require: true },
    journalText: { type: String },
    journalImg: [{ name: String }],
    journalPdf: [{ name: String }],
    achievedAt: { type: Date, default: Date.now },
    textUpdatedAt: {type: Date},
    imgOrPdfUdatedAt: {type: Date}
});

const JournalModel = mongoose.model("Journal", journalSchema);

export default JournalModel;
 