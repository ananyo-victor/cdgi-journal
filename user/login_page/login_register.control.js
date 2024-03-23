import express from "express";
import UserModel from "./login_register.schema.js";
import fetchuser from "../../middleware/fetchuser.js";
import jwt from "jsonwebtoken";

const JWT_secret = "s0//P4$$w0rD";


const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        console.log("router");
        const { email, password, firstName, lastName } = req.body;
        const user = new UserModel({
            email,
            password,
            firstName,
            lastName,
        });

        const validate = user.validateSync();
        if (validate) {
            return res.status(400).send({ message: validate.message });
        }
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_secret);
        console.log(authToken);

        await user.save();
        return res.status(201).send({ message: "User created" });
    } catch (error) {
        return res
            .status(500)
            .send({ message: `Error creating user ${error.message}` });
    }
});

router.post("/login", fetchuser, async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(401).send({ message: "Invalid credentials" });
    }
    const validatePassword = user.validatePassword(password);
    if (!validatePassword) {
        return res.status(401).send({ message: "Invalid credentials" });
    }
    const data = {
        user: {
            id: user.id
        }
    };
    const authToken = jwt.sign(data, JWT_secret);
    // res.json(authToken);
    return res.status(200).send({ user });
});


router.get("/getuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        // res.status(500).send( "Can't get user" );
    }

});
export default router;