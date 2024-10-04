require('dotenv').config();

const config = require('./config.json');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const upload = require('./multer');
const fs = require('fs');
const path = require('path');


const jwt = require('jsonwebtoken');



// mongoose.connect(config.connectionString)

mongoose.connect(config.connectionString, {
  bufferCommands: false,  // Désactiver le buffering
  connectTimeoutMS: 30000, // Augmenter le délai de connexion à 30 secondes
  serverSelectionTimeoutMS: 30000 // Timeout pour la sélection du serveur
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB", err));


const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');

const { authenticateToken } = require('./utilities');

const app = express();
app.use(express.json());
app.use(cors({origin:"*"}));

// Test API

// app.get('/hello', async(req, res)  => {

//     return res.status(200).json({message:"hello"});

// });


// CREATE ACCOUNT

 app.post('/create-account', async(req, res)  => {

    const {fullName, email, password} = req.body;

    if(!fullName || !email || !password) {

        return res
        .status(400)
        .json({error: true, message: "All fields are required"})

    }

    const isUser = await User.findOne({email});
    if(isUser) {

      return res
    .status(400)
    .json({error:true , message : "User already exists"})
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({

    fullName,
    email,
    password: hashedPassword,

    });


    await user.save();
    const accessToken = jwt.sign({
    userId : user._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn: "72h",
    }
);


        return res.status(201).json({
        error: false,
        user: {fullName: user.fullName, email: user.email},
        accessToken,
        message:"Registration successful"
    })


 });


//LOGIN

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and Password are required" });
    }

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Comparer le mot de passe avec le hash stocké
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: true, message: "Invalid Credentials" });
    }

    // Générer le token JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '72h' }
    );

    // Répondre avec le token et les informations utilisateur
    return res.json({
      error: false,
      message: "Login Successful",
      user: { fullName: user.fullName, email: user.email },
      accessToken,
    });

  } catch (err) {
    console.error('Error during login:', err); // Loguer l'erreur pour voir les détails dans la console
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});



// Get User 

app.get("/get-user", authenticateToken, async (req, res) => {

const { userId } = req.user;

const isUser = await User.findOne({ _id: userId});

if (!isUser) {
return res.sendStatus(401);

}

return res.json({
user: isUser,
message: "",
})

});

//////////////////////////////////////////// TRAVEL //////////////////////////////////

// Add Travel
app.post("/add-travel-story", authenticateToken, async (req, res) => {


const {title, story, visitedLocation, imageUrl, visitedDate} = req.body;

const {userId} = req.user;


// Validate required fields

if (!title || !story || !visitedLocation || !imageUrl || !visitedDate)

{
return res.status(400).json({errors:true, message:"All fiels are required"});


}

// Convert visiteDate from milliseconds to Date object

const parsedVisiteDate = new Date(parseInt(visitedDate));
try {
  const travelStory = new TravelStory({
title,
story,
visitedLocation,
userId,
imageUrl,
visitedDate: parsedVisiteDate,
})

await travelStory.save();
res.status(201).json({story: travelStory, message:"Added Successfully"})

} catch (error) {
  res.status(400).json({error:true, message: error.message});
}





})


// Tous les voyages
app.get("/get-all-stories", authenticateToken, async (req, res) => {

const { userId } = req.user;

try {
  
const travelStories = await TravelStory.find({ userId: userId }).sort({isFavourite:-1});
res.status(200).json({stories: travelStories});

} catch (error) {
  res.status(500).json({error: true , message: error.message});
}

});

// Modifier un voyage
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!title || !story || !visitedLocation || !visitedDate) {
    return res.status(400).json({ errors: true, message: "All fields are required" });
  }

  // Convert visitedDate from milliseconds to Date object
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  // Define default image URL
  const placeholdersImgUrl = `http://localhost:8000/assets/placeholders.png`;

  try {
    // Use findByIdAndUpdate for updating the travel story
    const updatedTravelStory = await TravelStory.findByIdAndUpdate(
      id,  // The story ID from the params
      {
        title,
        story,
        visitedLocation,
        imageUrl: imageUrl || placeholdersImgUrl,  // Use the imageUrl or a default one
        visitedDate: parsedVisitedDate
      },
      { 
        new: true,  // Return the updated document
        runValidators: true,  // Run validation on the updated data
        context: 'query'  // Context for certain validations (like required fields)
      }
    ).where({ userId }); // Ensure that only the owner can update the story

    // Check if the story exists
    if (!updatedTravelStory) {
      return res.status(404).json({ error: true, message: "Travel story not found or you're not authorized to edit it" });
    }

    // Respond with the updated story
    res.status(200).json({ story: updatedTravelStory, message: 'Updated Successfully' });

  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: true, message: error.message });
  }
});



// Supprimer un voyage

app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // Recherche de l'histoire de voyage
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res.status(404).json({ error: true, message: "Travel story not found" });
    }

    // Suppression de l'histoire de voyage
    await travelStory.deleteOne();

    // Suppression de l'image associée
    const imageUrl = travelStory.imageUrl;
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, 'uploads', filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to delete image file:", err);
        return res.status(500).json({ error: true, message: "Failed to delete image file" });
      }

      // Réponse en cas de succès
      return res.status(200).json({ message: 'Travel story deleted successfully' });
    });

  } catch (error) {
    console.error("Error deleting travel story:", error);
    return res.status(500).json({ error: true, message: error.message });
  }
});


//////////////////////////////////////////// Image //////////////////////////////////

// Route to handle image upload

app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: "No image uploaded" });
        }

        // Accéder correctement au nom du fichier
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

        res.status(201).json({ imageUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an image from uploads folder

app.delete('/delete-image' , async (req, res) => {

const {imageUrl} = req.query;

if (!imageUrl) {
return res.status(400).json({error: true, message: "imageUrl parameter is required"})
}


try {

const filename = path.basename(imageUrl);

const filePath = path.join(__dirname,'uploads' ,filename);

if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  res.status(200).json({messsage:"Image deleted successfully"})
} else {

res.status(200).json({error: true, message: 'Image not found'})

}


} catch (error) {
  res.status(500).json({error: true, message: error.message});
}


})


/////////////////////////////////////////////////////////////////////////////////////////

app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {

const {id } =req.params;
const {isFavourite} = req.body;
const {userId} = req.user;

try {

const travelStory = await TravelStory.findOne({ _id: id , userId:userId });

if (!travelStory) {

return res.status(404).json({error: true, message: " Travel story not found"});

  
}
travelStory.isFavourite = isFavourite;

await travelStory.save();

res.status(200).json({story: travelStory, message: "Update Successful"});

} catch (error) {

res.status(500).json({error: true, message: error.message});

}


});


// SEARCH travel stories
app.get("/search", authenticateToken, async (req, res) => {

const {query} = req.query;
const {userId} = req.user;

if (!query) {

return res.status(404).json({error: true, message:"query is required"});


}

try {

const searchResults = await TravelStory.find({

userId: userId,
$or: [
{ title: { $regex: query, $options: "i" } },
{ story: { $regex: query, $options: "i" } },
{ visitedLocation: { $regex: query, $options: "i" } },
]

}).sort({ isFavourite: -1});

res.status(200).json({stories: searchResults});

} catch (error) {
res.status(500).json({error: true, message: error.message});
}

});

app.get("/travel-stories/filter", authenticateToken, async (req, res) => {

const {startDate, endDate} = req.query;
const {userId} = req.user;


try {

const start = new Date(parseInt(startDate));
const end = new Date(parseInt(endDate));

const filteredStories = await TravelStory.find({

userId: userId,
visitedDate: {$gte: start, $lte:end},

}).sort({isFavourite: -1});
res.status(200).json({stories:filteredStories});



} catch (error) {
res.status(500).json({error: true, message: error.message});
}


});

//
app.use('/uploads', express.static(path.join(__dirname, "uploads")) );
app.use('/assets', express.static(path.join(__dirname, "assets")));



app.listen(8000);
module.exports = app;