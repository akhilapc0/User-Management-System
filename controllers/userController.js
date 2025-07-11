const User=require('../models/userModel');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const userModel = require('../models/userModel');




const securePassword=async(password)=>{
    try{
      const passwordHash=await bcrypt.hash(password,10);
      return passwordHash; 
    }
    catch(error){
        console.log(error.message);
    }
}

//for send mail

const sendVerifyMail=async(name,email,user_id)=>{
    try{
      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'akhilapc0@gmail.com',
                pass:'zpne kzpk raow tphq'
            }
            
        })
        const mailOptions={
                from:'akhilapc0@gmail.com',
                to:email,
                subject:'for verification mail',
                html:'<p> Hi'+name+',please click here to <a href="http://localhost:3000/verify?id='+user_id+'">verify </a> your mail.</p>'

            }

        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }
            else{
                console.log('email has been send:-',info.response)
            }
        })
    }
    catch(error){
        console.log(error.message)
    }
}
const loadRegister=async(req,res)=>{
    try{
     return    res.render('registration')
    }
    catch(error){
        console.log(error.message)
    }
}

const insertUser=async(req,res)=>{
    try{
            const spassword= await securePassword(req.body.password);
            const user=new User({
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mno,
                image:req.file.filename,
                password:spassword,
                is_admin:0,

            })
            const userData=await user.save();
            if(userData){
               sendVerifyMail(req.body.name,req.body.email,userData._id)
                return res.render("registration",{message:"your registration has been successfully,please verify your mail"})
            }
            else{
              return   res.render("registration",{message:"registraion has been failed"})
            }

    }
    catch(error){
        
        console.log(error.message)
        }
}
const verifyMail=async(req,res)=>{
    try{
        const updateInfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        console.log(updateInfo);
        return res.render('email-verified')
    }
    catch(error){
        console.log(error.message)
    }
}
//login user method started
const loginLoad=async(req,res)=>{
    try{
       return  res.render("login")
    }
    catch(error){
        console.log(error.message)
    }
}

const verifyLogin=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
      const userData= await User.findOne({email:email});
      if(userData){
       const passwordMatch=await bcrypt.compare(password,userData.password);
       if(passwordMatch){
        if(userData.is_verified===0){
           return  res.render("login",{message:"please verify your mail"})
        }
        else{
            req.session.user_id=userData._id;
           return  res.redirect('/home')
        }
       }
       else{
       return  res.render('login',{message:"email and password is incorrect"})
       }

      }
      else{
       return  res.render('login',{message:"email and password is incorrect"})
      }


    }
    catch(error){
        console.log(error.message)
    }
}
const loadHome=async(req,res)=>{
    try{
       return  res.render("home")
    }
    catch(error){
        console.log(error.message)
    }
}

const userLogout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/')
    }
    catch(error){
        console.log(error.message)
    }
}


//forgot password code here

const forgotLoad=async(req,res)=>{
    try{
        res.render("forgot")
    }
    catch(error){
        console.log(error.message)
    }
}

const forgotVerify=async(req,res)=>{
    try{
        const email=req.body.email;
        const userData=await User.findOne({email:email});
        if(userData){

        }
        else{
            res.render("forgot",{message:"user email not match"})
        }
    }
    catch(error){
        console.log(error.message)
    }
}



module.exports={
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgotLoad,
    forgotVerify
}
