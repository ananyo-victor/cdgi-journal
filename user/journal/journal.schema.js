import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    journalName: { type: String, require: true, unique: true },
    journalText: { type: String },
    journalImg: { type: String } ,
    journalPdf: { type: String },
    achievedAt: { type: Date, default: Date.now },
    textUpdatedAt: {type: Date, default: Date.now},
    imgUdatedAt: {type: Date, default: Date.now},
    pdfUdatedAt: {type: Date, default: Date.now}
});

const JournalModel = mongoose.model("Journal", journalSchema);

export default JournalModel;
 