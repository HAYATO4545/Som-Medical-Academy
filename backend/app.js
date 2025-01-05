const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const cors = require("cors") 
const Port = process.env.PORT || 3000
const app = express()
const dbURI = process.env.MONGO_URI
const User = require("./user")
const jwt = require('jsonwebtoken')
require('dotenv').config();
app.use(express.json())
app.use(cors())  
mongoose.connect(dbURI)
.then(()=> {
    app.listen(Port,()=> {
        console.log("http://localhost:"+Port)
    })
}).catch((error)=>{
   console.log(error)
})


app.get("/" , async(req,res)=> {
const users = await User.find()
res.json(users)
})




app.post("/register", async (req, res) => {
  const { username, email, mobileNumber, password } = req.body;

  if (!username || !email || !mobileNumber || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    const mobileNumberExists = await User.findOne({ mobileNumber });
    if (mobileNumberExists) {
      return res.status(400).json({ message: "Mobile number is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        isPay: user.isPay,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '10d' }
    );

    user.token = token; // حفظ التوكن
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while registering the user" });
  }
});



app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(password, findUser.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: findUser._id,
        username: findUser.username,
        email: findUser.email,
        isPay: findUser.isPay,
        isAdmin: findUser.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '10d' }
    );

    findUser.token = token; // تحديث التوكن
    await findUser.save();

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while logging in" });
  }
});





app.post('/validateToken', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({
      message: 'Token is valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.post("/logout", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // فك التوكن والتحقق من صحة المستخدم
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // العثور على المستخدم باستخدام الـ id
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // إزالة التوكن من قاعدة البيانات
    user.token = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while logging out" });
  }
});

app.post("/deleteAll", async (req, res) => {
  try {
    // حذف جميع المستخدمين من قاعدة البيانات
    await User.deleteMany({});
    
    // يمكن إضافة حذف بيانات أخرى إذا كنت تستخدم مكونات إضافية
    // await OtherModel.deleteMany({});

    res.status(200).json({ message: "All data has been deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while deleting data" });
  }
});


app.post("/checkIsPay", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // فك التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // استرجاع بيانات المستخدم من قاعدة البيانات باستخدام ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // إرجاع القيمة الجديدة لـ isPay من قاعدة البيانات
    return res.status(200).json({
      message: "Token is valid",
      isPay: user.isPay, // إرجاع القيمة الجديدة لـ isPay من قاعدة البيانات
    });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});


app.post("/getUserDetails", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID in the decoded token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the username and mobileNumber
    res.status(200).json({ 
      username: user.username, 
      mobileNumber: user.mobileNumber 
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});


app.post("/searchUser", async (req, res) => {
  const { mobileNumber } = req.body; // فقط نأخذ mobileNumber

  if (!mobileNumber) {
    return res.status(400).json({ message: "Provide mobileNumber for search" });
  }

  try {
    // بناء كائن البحث باستخدام التعبير المنتظم لرقم الهاتف فقط
    const query = { mobileNumber: { $regex: mobileNumber } }; // البحث عن رقم الهاتف

    // البحث عن المستخدمين الذين يطابقون رقم الهاتف
    const users = await User.find(query);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // إرسال قائمة المستخدمين
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while searching for users" });
  }
});



app.post("/checkAdmin", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ isAdmin: false, message: "Token is required" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ isAdmin: false, message: "User not found" });
    }

    // Check admin privileges
    return res.status(200).json({
      isAdmin: user.isAdmin,
      message: user.isAdmin ? "User is an admin" : "User is not an admin",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ isAdmin: false, message: "Invalid or expired token" });
  }
});


app.post("/openCourse", async (req, res) => {
  const { id } = req.body;

  // التحقق من وجود معرف المستخدم
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // البحث عن المستخدم بواسطة معرفه
    const findeUser = await User.findById(id);
    if (!findeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // تحديث قيمة isPay
    findeUser.isPay = !findeUser.isPay;

    // حفظ التغييرات
    await findeUser.save();

    return res.status(200).json({ message: "isPay value updated successfully", isPay: findeUser.isPay });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while updating isPay" });
  }
});


app.post("/toggleAdmin", async (req, res) => {
  const { id } = req.body;

  // التحقق من وجود معرف المستخدم
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // البحث عن المستخدم بواسطة معرفه
    const findeUser = await User.findById(id);
    if (!findeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // تحديث قيمة isAdmin
    findeUser.isAdmin = !findeUser.isAdmin;

    // حفظ التغييرات
    await findeUser.save();

    return res.status(200).json({ message: "isAdmin value updated successfully", isAdmin: findeUser.isAdmin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while updating isAdmin" });
  }
});



