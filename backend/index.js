require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('./multer');
const connectDB = require('./db');  // Connexion MongoDB
const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');
const { authenticateToken } = require('./utilities');

// Connexion à MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Test API route
app.get('/hello', async (req, res) => {
    return res.status(200).json({ message: "Hello!" });
});

// Créer un compte utilisateur
app.post('/create-account', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        fullName,
        email,
        password: hashedPassword,
    });

    await user.save();
    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "72h" }
    );

    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken,
        message: "Registration successful"
    });
});

// Connexion utilisateur
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: true, message: "Email and Password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: true, message: "Invalid Credentials" });
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '72h' }
        );

        return res.json({
            error: false,
            message: "Login Successful",
            user: { fullName: user.fullName, email: user.email },
            accessToken,
        });

    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Obtenir les informations de l'utilisateur connecté
app.get('/get-user', authenticateToken, async (req, res) => {
    const { userId } = req.user;

    const isUser = await User.findOne({ _id: userId });
    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "",
    });
});

// Ajouter une histoire de voyage
app.post('/add-travel-story', authenticateToken, async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
        return res.status(400).json({ errors: true, message: "All fields are required" });
    }

    const parsedVisitedDate = new Date(parseInt(visitedDate));
    try {
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate,
        });

        await travelStory.save();
        res.status(201).json({ story: travelStory, message: "Added Successfully" });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

// Obtenir toutes les histoires de voyage de l'utilisateur connecté
app.get('/get-all-stories', authenticateToken, async (req, res) => {
    const { userId } = req.user;

    try {
        const travelStories = await TravelStory.find({ userId: userId }).sort({ isFavourite: -1 });
        res.status(200).json({ stories: travelStories });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// Modifier une histoire de voyage
app.put('/edit-story/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !visitedDate) {
        return res.status(400).json({ errors: true, message: "All fields are required" });
    }

    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try {
        const updatedTravelStory = await TravelStory.findByIdAndUpdate(
            id,
            { title, story, visitedLocation, imageUrl, visitedDate: parsedVisitedDate },
            { new: true, runValidators: true, context: 'query' }
        ).where({ userId });

        if (!updatedTravelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found or unauthorized" });
        }

        res.status(200).json({ story: updatedTravelStory, message: 'Updated Successfully' });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// Supprimer une histoire de voyage
app.delete('/delete-story/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        await travelStory.deleteOne();

        const imageUrl = travelStory.imageUrl;
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', filename);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
                return res.status(500).json({ error: true, message: "Failed to delete image file" });
            }

            return res.status(200).json({ message: 'Travel story deleted successfully' });
        });

    } catch (error) {
        console.error("Error deleting travel story:", error);
        return res.status(500).json({ error: true, message: error.message });
    }
});

// Télécharger une image
app.post('/image-upload', upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: "No image uploaded" });
        }

        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        res.status(201).json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer une image
app.delete('/delete-image', async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: true, message: "imageUrl parameter is required" });
    }

    try {
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: true, message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// Mettre à jour l'état favori d'une histoire de voyage
app.put('/update-is-favourite/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        travelStory.isFavourite = isFavourite;
        await travelStory.save();

        res.status(200).json({ message: "Updated successfully", story: travelStory });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

// Serveur des fichiers statiques pour les images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lancer le serveur
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
