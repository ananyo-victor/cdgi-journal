import express from 'express';
import multer from 'multer';
import JournalModel from './journal.schema.js'; 
import fetchuser from '../../middleware/fetchuser.js';

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/upload', fetchuser, upload.fields([{ name: 'journalImg' }, { name: 'journalPdf' }]), async (req, res) => {
    try {
        
        const { journalText } = req.body;
        const journalImg = req.files['journalImg'] ? req.files['journalImg'][0].buffer : null;
        const journalPdf = req.files['journalPdf'] ? req.files['journalPdf'][0].buffer : null;
        const userId = req.user.id;

        
        const newJournal = new JournalModel({
            userId,
            journalText,
            journalImg,
            journalPdf
        });

        
        await newJournal.save();

        res.status(201).send({ message: "Journal entry created successfully" });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        res.status(500).send({ message: "Error creating journal entry" });
    }
});

router.get('/', fetchuser, async (req, res) => {
    try {
        const journals = await JournalModel.findOne({userId : req.user.id});
        res.status(200).send(journals);
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        res.status(500).send({ message: "Error fetching journal entries" });
    }
});

router.get('/:id', fetchuser, async (req, res) => {
    const { id } = req.params;

    try {
        const journal = await JournalModel.findById(id);

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        res.status(200).send(journal);
    } catch (error) {
        console.error("Error fetching journal entry:", error);
        res.status(500).send({ message: "Error fetching journal entry" });
    }
});

// PUT route to update a journal entry
router.put('/:id', fetchuser, async (req, res) => {
    const { id } = req.params;
    const { journalText } = req.body;
    const journalImg = req.files['journalImg'] ? req.files['journalImg'][0].buffer : null;
    const journalPdf = req.files['journalPdf'] ? req.files['journalPdf'][0].buffer : null;

    try {
        // Find the journal entry by ID
        const journal = await JournalModel.findById(id);

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // Update journal text
        journal.journalText = journalText;
        journal.journalImg = journalImg;
        journal.journalPdf = journalPdf;
        await journal.save();

        res.status(200).send({ message: "Journal entry updated successfully" });
    } catch (error) {
        console.error("Error updating journal entry:", error);
        res.status(500).send({ message: "Error updating journal entry" });
    }
});

router.delete('/:id', fetchuser, async (req, res) => {
    const { id } = req.params;

    try {
        // Find the journal entry by ID and delete it
        await JournalModel.findByIdAndDelete(id);
        res.status(200).send({ message: "Journal entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        res.status(500).send({ message: "Error deleting journal entry" });
    }
});

export default router;