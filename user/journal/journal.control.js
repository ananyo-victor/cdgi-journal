import express from 'express';
import multer from 'multer';
import JournalModel from './journal.schema.js';
import fetchuser from '../../middleware/fetchuser.js';

const router = express.Router();

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './files')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now()
//       cb(null, uniqueSuffix + file.originalname)
//     }
//   })
const upload = multer({ storage: storage });

//POST route to upload data into database
router.post('/upload', fetchuser, upload.fields([{ name: 'journalImg' }, { name: 'journalPdf' }]), async (req, res) => {
    try {

        const { journalName, journalText } = req.body;
        let journalImgArray = [];
        let journalPdfArray = [];

        if (req.files['journalImg']) {
            journalImgArray = req.files['journalImg'].map(file => ({name : file.originalname}));
        }
        // console.log(journalImgArray);
        
        if (req.files['journalPdf']) {
            journalPdfArray = req.files['journalPdf'].map(file => ({name : file.originalname}));
        }
        // console.log(journalPdfArray);
        
        const userId = req.user.id;
        const newJournal = new JournalModel({
            userId,
            journalName,
            journalText,
            journalImg: journalImgArray,
            journalPdf: journalPdfArray
        });

        await newJournal.save();
        
        res.status(201).send({ message: "Journal entry created successfully" });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        res.status(500).send({ message: "Error creating journal entry" });
    }
});
//GET route to access all the data
router.get('/', fetchuser, async (req, res) => {
    try {
        const journals = await JournalModel.find({ userId: req.user.id });
        res.status(200).send(journals); 
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        res.status(500).send({ message: "Error fetching journal entries" });
    } 
}); 
// GET route to access data from the name
router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const journal = await JournalModel.findOne({ journalName: name });

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
router.put('/journalText/:name', fetchuser, async (req, res) => {
    const { name } = req.params;
    const { journalText } = req.body;
    
    try {
        const journal = await JournalModel.findOneAndUpdate({ journalName: name }, {
            $set: {
                journalText: journalText, // Update journalText
                textUpdatedAt : Date.now
            }
        });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        if (journalText === undefined || journalText === null) {
            return res.status(400).send({ message: "journalText is missing" });
        }
        res.status(200).send({ message: "Journal entry updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error updating journal entry" });
    }
});


router.put('/journalImgAndPdf/:name', upload.fields([{ name: 'journalImg' }, { name: 'journalPdf' }]), fetchuser, async (req, res) => {
    const { name } = req.params;
    let journalImg2 = [];
    let journalPdf2 = [];
    console.log(req.files['journalImg']);
    console.log(req.files['journalPdf']);
    if (req.files && req.files['journalImg']) {
        // Iterate over each uploaded image
        for (const file of req.files['journalImg']) {
            journalImg2.push({name : file.originalname});
            console.log(file);
        }
    }else{
        console.log("no file");
    }

    if (req.files && req.files['journalPdf']) {
        // Iterate over each uploaded PDF
        for (const file of req.files['journalPdf']) {
            journalPdf2.push({name : file.originalname});
            console.log(file);
        }
    }else{
        console.log("no pdf");  
    }

    try {
        const journal = await JournalModel.findOneAndUpdate({ journalName: name }, {
            $set: {
                journalImg: journalImg2,
                journalPdf: journalPdf2,
                imgOrPdfUdatedAt: Date.now
            }
        });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        res.status(200).send({ message: "Journal entry updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error updating journal entry" });
    }
});


// DELETE route to delete specific field by entering the name and itemType
// router.delete('/:name', fetchuser, async (req, res) => {
//     const { name } = req.params;
//     const { itemType } = req.query;

//     try {
//         const journal = await JournalModel.findOne({ journalName: name });

//         if (!journal) {
//             return res.status(404).send({ message: "Journal entry not found" });
//         }

//         if (!itemType) {
//             return res.status(400).send({ message: "Please specify item type (text, image, or pdf)" });
//         }

//         switch (itemType) {
//             case 'text':
//                 journal.journalText = ""; // Clear journal text
//                 break;
//             case 'image':
//                 journal.journalImg = []; // Clear array of images
//                 break;
//             case 'pdf':
//                 journal.journalPdf = []; // Clear array of PDFs
//                 break;
//             default:
//                 return res.status(400).send({ message: "Invalid item type specified" });
//         }

//         await journal.save();

//         res.status(200).send({ message: "Item deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting item:", error);
//         res.status(500).send({ message: "Error deleting item" });
//     }
// });

//DELETE route to delete all the data fecthed by the name
router.delete('/:name', fetchuser, async (req, res) => {
    const { name } = req.params;

    try {
        await JournalModel.findOneAndDelete({ journalName: name });
        res.status(200).send({ message: "Journal entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        res.status(500).send({ message: "Error deleting journal entry" });
    }
});

//DELETE route to delete the specific data from the id
// router.delete('/:id', fetchuser, async (req, res) => {
//     const { id } = req.params;

//     try {
//         await JournalModel.findByIdAndDelete(id);
//         res.status(200).send({ message: "Journal entry deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting journal entry:", error);
//         res.status(500).send({ message: "Error deleting journal entry" });
//     }
// });

// DELETE route to delete specific image using the index 

router.delete('/journalImg/:name/:imageIndex', fetchuser, async (req, res) => {
    const { name, imageIndex} = req.params;

    try {
        const journal = await JournalModel.findOne({ journalName: name });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // Remove the image at the specified index
        if (imageIndex !== undefined && imageIndex !== null) {
            journal.journalImg.splice((imageIndex-1), 1);
        }
        
        await journal.save();

        res.status(200).send({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).send({ message: "Error deleting image" });
    }
});

// DELETE route to delete specific pdf using the index
router.delete('/journalPdf/:name/:pdfIndex', fetchuser, async (req, res) => {
    const { name, pdfIndex } = req.params;

    try {
        const journal = await JournalModel.findOne({ journalName: name });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // Remove the PDF at the specified index
        if (pdfIndex !== undefined && pdfIndex !== null) {
            journal.journalPdf.splice((pdfIndex-1), 1);
        }
        
        await journal.save();

        res.status(200).send({ message: "PDF deleted successfully" });
    } catch (error) {
        console.error("Error deleting PDF:", error);
        res.status(500).send({ message: "Error deleting PDF" });
    }
});

// DELETE route to delete the text
router.delete('/journalText/:name', fetchuser, async (req, res) => {
    const { name} = req.params;

    try {
        const journal = await JournalModel.findOne({ journalName: name });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        journal.journalText = '';
        
        await journal.save();

        res.status(200).send({ message: "Text deleted successfully" });
    } catch (error) {
        console.error("Error deleting Text:", error);
        res.status(500).send({ message: "Error deleting Text" });
    }
});


export default router;