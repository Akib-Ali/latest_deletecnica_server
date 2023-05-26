const express = require('express');
const router = new express.Router();
const conn = require('../db/conn')
const Blog = require("../db/blog")
const User = require("../db/user")
const Comment = require("../db/comment")
const multer = require("multer")
const fs = require('fs');
const path = require('path');
const Jwt = require("jsonwebtoken")
const jwtKey = "dela-axionic"
const bcrypt = require("bcrypt")
const publicPath = path.join(__dirname, '../public');
router.use(express.static(publicPath));


//email 
let nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const creds = require("../credential.json")


//authentication start

//signup api


router.post("/register-user", async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10)
  const user = new User({
    name,
    email,
    password: hashPassword,
    createdAt: Date.now()
  })
  let result = await user.save()
  result = result.toObject()
  delete result.password
  res.send(result)


})

//login api

router.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const matchPassword = await bcrypt.compare(req.body.password, user.password);
      if (matchPassword) {
        Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
          if (err) {
            res.send({ result: "something went wrong please try again later" });
          } else {
            res.send({ user, auth: token });
          }
        });
      } else {
        res.send({ result: "Incorrect password" });
      }
    } else {
      res.send({ result: "No User found" });
    }
  }
});


//update user


router.post("/userupdate/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10); // Hash the new password

    const result = await User.updateOne(
      { _id: req.params.id },
      { $set: { password: hashPassword, ...req.body } }
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});


//delete user

router.delete('/delete-user/:_id', async (req, res) => {
  let deleteselecteduser = await User.deleteOne(req.params)
  res.send(deleteselecteduser)

})




function verifyToken(req, res, next) {
  let token = req.headers['authorization'];
  if (token) {
    token = token.split(" ")[1]
    // console.log("middleware called", token)
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" })

      } else {
        next()

      }
    })
  } else {
    res.status(403).send({ result: "please add token with headers" })

  }


}







//authentication end





//post api

router.post("/post-newblog", verifyToken, async (req, res) => {
  try {
    const { blog_title, blog_slug, blog_summary, blog_keyword, blog_content, pic } = req.body;
    console.log(req.body)

    const newBlog = new Blog({
      blog_title,
      blog_slug,
      blog_summary,
      blog_keyword,
      blog_content,
      pic,
      createdAt: Date.now()

    })

    let result = await newBlog.save();
    res.send(result)

  } catch (error) {
    console.log(error)

  }
  // console.log(req.body)

})


//get api 

router.get('/blog-list', async (req, res) => {
  let bloglist = await Blog.find().sort({ createdAt: -1 });
  if (bloglist.length > 0) {
    res.send(bloglist)
  } else {
    res.send({ result: "No Result found" })
  }

})

//single blog api

router.get('/blog/:id', async (req, res) => {
  let result = await Blog.findOne({ _id: req.params.id })
  if (result) {
    res.send(result)
  } else {
    res.send({ result: "No Record found" })
  }
})



//update api



router.post("/blogupdate/:id", verifyToken, async (req, res) => {
  try {
    const { blog_title, blog_slug, blog_summary, blog_keyword, blog_content, pic } = req.body;
    console.log(req.body, "reeived from backend")
    let updateObject = {};
    if (blog_title) {
      updateObject.blog_title = blog_title;
    }
    if (blog_slug) {
      updateObject.blog_slug = blog_slug;
    }
    if (blog_summary) {
      updateObject.blog_summary = blog_summary;
    }
    if (blog_keyword) {
      updateObject.blog_keyword = blog_keyword;
    }
    if (blog_content) {
      updateObject.blog_content = blog_content;
    }

    if (pic) {
      updateObject.pic = pic

    }

    const result = await Blog.updateOne(
      { _id: req.params.id },
      { $set: updateObject }
    );

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});



//delete api

router.delete('/delete-blog/:_id', verifyToken, async (req, res) => {
  let deleteselectedblog = await Blog.deleteOne(req.params)
  res.send(deleteselectedblog)

})


//customer comment api 

router.post("/post-comment", async (req, res) => {
  try {
    const { client_name, client_email, client_message, admin_approved } = req.body;
    console.log(req.body)

    const newComment = new Comment({
      client_name,
      client_email,
      client_message,
      admin_approved,
      createdAt: Date.now()

    })

    let result = await newComment.save();
    res.send(result)

  } catch (error) {
    console.log(error)

  }
  // console.log(req.body

})


//customer update api

router.post("/update-comment/:id", async (req, res) => {

  try {
    const { admin_approved } = req.body;
    const result = await Comment.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    )
    res.send(result)


  } catch (error) {
    console.log(error)
    res.status(500).send("Internal server error")
  }


})



//comment get api 

router.get('/comment-list', async (req, res) => {
  let commentlist = await Comment.find().sort({ createdAt: -1 });
  if (commentlist.length > 0) {
    res.send(commentlist)
  } else {
    res.send({ result: "No Result found" })
  }

})

//comment delete api 

router.delete('/delete-comment/:_id', async (req, res) => {
  let deleteselectedcomment = await Comment.deleteOne(req.params)
  res.send(deleteselectedcomment)

})



















//mail

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: creds.auth.user,
    pass: creds.auth.pass
  }
})

const imagePath = path.join(publicPath, 'delatecnica_logo.png');

router.post("/mail", (req, res, next) => {

  var email = req.body.email
  var message = req.body.message
  var name = req.body.name
  var phone_number = req.body.phone_number

  const mailOptions = [
    {
      from: {
        name: "Dellatecnica",
        address: creds.auth.user
      },
      to: email,
      subject: "Thanks for connecting with us.",
      html: `<p>Dear ${name},</p>
          Thank you for contacting us through our contact us form. We appreciate your interest in our wood working machinery and are happy to assist you!<br>
          Our team has received your message and will respond to your inquiry as soon as possible. Please allow up to 24-48 hours for a reply, although we always aim to get back to our customers as quickly as possible.<br/><br/>
          If you have any additional inquiry you would like to send to us, you can do so via replying to this email.<br>
          In the meantime, feel free to browse our website https://www.dellatecnica.in for more information about our products and services. You can also call us on our number: 87278-22330 for more details.<br><br>
          Thank you again for reaching out to us. We look forward to speaking with you soon.<br><br>
        Best regards,<br/>
        TEAM DELLATECNICA <br/>
        <img src="cid:delatecnica_logo" alt="" style="width: 200px; height: 250px; display: inline-block; vertical-align: middle; margin-top:-30px" padding-top:-30px />

        
        `,
      attachments: [
        {
          filename: 'delatecnica_logo.png',
          path: imagePath,
          cid: 'delatecnica_logo'
        }
      ]


    },
    {
      from: {
        name: "Dellatecnica",
        address: creds.auth.user
      },
      to: creds.auth.user,
      subject: "New enquiry",
      html: `
        <h3>You have received a new enquiry from: </h3>
        <p><b>Name: </b>${name}</p>
        <p><b>Contact Number: </b>${phone_number}</p>
        <p><b>Email: </b>${email}</p>
        <p><b>Message: </b>${message}</p>
      `
    }
  ];

  const sendEmails = () => {
    mailOptions.forEach((mail) => {
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          res.json({
            status: false,
            message: err
          });
          console.log(err);
        } else {
          res.json({
            status: true,
            message: "Thanks for connecting with us."
          });
          console.log("Email Sent: " + data.response);
        }
      });
    })
  }

  sendEmails();
})

transporter.verify(function (err, success) {
  if (err) console.log(err)
  else console.log("Server is ready to take the emails")
});

module.exports = router;
