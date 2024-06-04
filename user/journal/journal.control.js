import express from 'express';
import multer from 'multer';
import JournalModel from './journal.schema.js';
import fetchuser from '../../middleware/fetchuser.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4()
        cb(null, `${uniqueSuffix}-${file.originalname.split(" ").join("_")}`)
    }
})

const upload = multer({ storage: storage });

//POST route to upload data into database
router.post('/upload', fetchuser, upload.fields([{ name: 'journalImg', maxCount: 1 }, { name: 'journalPdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { journalName, journalText } = req.body;
        const files = req.files;

        const userId = req.user.id;

        // Check if an image file was uploaded
        const imageUrl = files['journalImg'] ? `https://cdgi-journal.onrender.com/${files['journalImg'][0].originalname}` : null;

        // Check if a PDF file was uploaded
        const pdfUrl = files['journalPdf'] ? `https://cdgi-journal.onrender.com/${files['journalPdf'][0].originalname}` : null;

        // If neither image nor PDF was uploaded, return an error
        if (!imageUrl && !pdfUrl) {
            return res.status(400).send({ message: "No image or PDF uploaded" });
        }

        const newJournal = new JournalModel({
            userId,
            journalName,
            journalText,
            journalImg: imageUrl,
            journalPdf: pdfUrl
        });

        await newJournal.save();
        res.status(201).send({ message: "Journal entry created successfully" });
    } catch (error) {
        console.error("Error uploading journal entry:", error);
        res.status(500).send({ message: "Error uploading journal entry" });
    }
});



//GET route to access all the data
router.get('/', async (req, res) => {
    try {
        const journals = await JournalModel.find();
        res.status(200).send({status : true, message : "All data list", data : journals});
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
                textUpdatedAt: Date.now()
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

// router.put('/journalImgAndPdf/:name', fetchuser, upload.fields([{ name: 'journalImg' }, { name: 'journalPdf' }]), async (req, res) => {
    
//     console.log(req.files['journalImg']);
    
//     // res.json("ABHAY");
//     const { name } = req.params; 
   
//     let journalImg2 = [];
//     let journalPdf2 = [];
//     // console.log(req); 

//     if (req.files['journalImg']) {
//         for (const file of req.files['journalImg']) {
//             console.log("here");
//             // Push each file object into journalImg2 array
//             try {
//                 journalImg2 = req.files['journalImg'].map(file => ({ name: `https://cdgi-journal.onrender.com/${file.originalname.split(" ").join("_")}` }));
//                 // console.log("done");
                
//             } catch (error) {
//                 // console.log(hehe);
//             }
//             // console.log(file);
//         }
//     } else {
//         console.log("no file");
//     }
//     if (req.files['journalPdf']) {
//         for (const file of req.files['journalPdf']) {
//             // Push each file object into journalPdf2 array
//             journalPdf2 = req.files['journalPdf'].map(file => ({ name: `https://cdgi-journal.onrender.com/${file.originalname.split(" ").join("_")}` }));
//         }
//         // console.log("lala");
//         console.log(journalPdf2);
//     } else {
//         console.log("no pdf");
//     } 

//     try {
//         const journal = await JournalModel.findOneAndUpdate({ journalName: name }, {
//             $set: {
//                 journalImg: journalImg2,
//                 journalPdf: journalPdf2,
//                 imgOrPdfUdatedAt: Date.now()
//             }
//         },{new : true});
// // console.log("now here");
//         if (!journal) {
//             return res.status(404).send({ message: "Journal entry not found" });
//         }

//         res.status(200).send({ message: "Journal entry updated successfully" });
//     } catch (error) {
//         res.status(500).send({ message: "Error updating journal entry" });
//     }

//     // res.status(200).json("name");
// });


// Route for updating journal images

router.put('/journalImg/:id', fetchuser, upload.single('journalImg'), async (req, res) => {
    const { id } = req.params;

    try {
        // Check if journalImg file was uploaded
        if (!req.file) {
            return res.status(400).send({ message: "No image file provided" });
        }

        // Get the image URL
        const imageUrl = `https://cdgi-journal.onrender.com/${req.file.originalname.split(" ").join("_")}`;

        // Update the journal entry by _id and set the new image data
        const journal = await JournalModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    journalImg: imageUrl,
                    imgUdatedAt: Date.now()
                }
            },
            { new: true }
        );

        // If journal entry is not found, return a 404 response
        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // If successfully updated, send a success response
        res.status(200).send({ message: "Journal image updated successfully" });
    } catch (error) {
        // If an error occurs during the update process, send a 500 response
        console.error("Error updating journal image:", error);
        res.status(500).send({ message: "Error updating journal image" });
    }
});


// Route for updating journal PDFs
router.put('/journalPdf/:id', fetchuser, upload.single('journalPdf'), async (req, res) => {
    const { id } = req.params;

    try {
        // Check if journalPdf file was uploaded
        if (!req.file) {
            return res.status(400).send({ message: "No PDF file provided" });
        }

        // Get the PDF URL
        const pdfUrl = `https://cdgi-journal.onrender.com/${req.file.originalname.split(" ").join("_")}`;

        // Update the journal entry by _id and set the new PDF data
        const journal = await JournalModel.findOneAndUpdate(
            { "journalPdf._id": id },
            {
                $set: {
                    "journalPdf.$.name": pdfUrl,
                    pdfUdatedAt: Date.now()
                }
            },
            { new: true }
        );

        // If journal entry is not found, return a 404 response
        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // If successfully updated, send a success response
        res.status(200).send({ message: "Journal PDF updated successfully" });
    } catch (error) {
        // If an error occurs during the update process, send a 500 response
        console.error("Error updating journal PDF:", error);
        res.status(500).send({ message: "Error updating journal PDF" });
    }
});



// router.put('/journalImgAndPdf/:name', upload.single('t'), async (req, res) => {
//     const { name } = req.params; 
   
//     // let journalImg2 = [];
//     // let journalPdf2 = [];
//     console.log(req); 

//     // if (req.files['journalImg']) {
//     //     for (const file of req.files['journalImg']) {
//     //         // Push each file object into journalImg2 array
//     //         journalImg2.push({ name: file.originalname });
//     //         console.log(file);
//     //     }
//     // } else {
//     //     console.log("no file");
//     // }
//     // if (req.files['journalPdf']) {
//     //     for (const file of req.files['journalPdf']) {
//     //         // Push each file object into journalPdf2 array
//     //         journalPdf2.push({ name: file.originalname });
//     //         console.log(file);
//     //     }
//     // } else {
//     //     console.log("no pdf");
//     // }

//     // try {
//     //     const journal = await JournalModel.findOneAndUpdate({ journalName: name }, {
//     //         $set: {
//     //             journalImg: journalImg2,
//     //             journalPdf: journalPdf2,
//     //             imgOrPdfUdatedAt: Date.now()
//     //         }
//     //     });

//     //     if (!journal) {
//     //         return res.status(404).send({ message: "Journal entry not found" });
//     //     }

//     //     res.status(200).send({ message: "Journal entry updated successfully" });
//     // } catch (error) {
//     //     res.status(500).send({ message: "Error updating journal entry" });
//     // }

//     res.status(200).json("name");
// });

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
    const { name, imageIndex } = req.params;

    try {
        const journal = await JournalModel.findOne({ journalName: name });

        if (!journal) {
            return res.status(404).send({ message: "Journal entry not found" });
        }

        // Remove the image at the specified index
        if (imageIndex !== undefined && imageIndex !== null) {
            journal.journalImg.splice((imageIndex - 1), 1);
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
            journal.journalPdf.splice((pdfIndex - 1), 1);
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
    const { name } = req.params;

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