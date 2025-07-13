const User=require('../models/userModel');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const userModel = require('../models/userModel');
const randomstring=require('randomstring');
const config=require('../config/config');

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

const sendVerifyMail=async(name,email,token)=>{
    try{
      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
            
        })
        const mailOptions={
                from:config.emailPassword,
                to:email,
                subject:'for verification mail',
                 html:'<p> Hi'+name+',please click here to <a href="http://localhost:3000/verify?id='+token+'">verify </a> your mail.</p>'


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
//for reset password sent mail


const sendResetPasswordMail=async(name,email,token)=>{
    try{
      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
            
        })
        const mailOptions={
                from:config.emailUser,
                to:email,
                subject:'for Reset password',
                html:'<p> Hi'+name+',please click here to <a href="http://localhost:3000/forgot-password?token='+token+'">reset</a> your password.</p>'

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
        const userData= await User.findById({_id:req.session.user_id});
     
       return  res.render("home",{user:userData})

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
            
            if(userData.is_verified===0){
                res.render('forgot',{message:"please verify your mail"})
            }
            else{
                const randomString=randomstring.generate();
                console.log(randomString)
                const updateData=await User.updateOne({email:email},{$set:{token:randomString}});
                console.log(updateData)
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forgot',{message:"please check you mail to reset your  password"});
            }
        }
        else{
            res.render("forgot",{message:"user email not match"})
        }
    }
    catch(error){
        console.log(error.message)
    }
}

const forgotPasswordLoad=async(req,res)=>{
    try{

        const token=req.query.token;
        const tokenData=await User.findOne({token:token});
        if(tokenData){
            res.render("forgot-password",{user_id:tokenData._id})
        }
        else{
            res.render('404',{message:"token is invalid"})
        }
    }
    catch(error){
        console.log(error.message)
    }
}

const resetPassword=async(req,res)=>{
    try{
        const password=req.body.password;
        const user_id=req.body.user_id;
        const secure_password=await securePassword(password);
       const updateData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
       res.redirect('/')
    }
    catch(error){
        console.log(error.message)
    }
}

//for verification send mail link

const verificationLoad=async(req,res)=>{
    try{
        res.render('verification')
    }
    catch(error){
        console.log(error.message)
    }
}

const sendVerificationLink=async(req,res)=>{
    try{
        const email=req.body.email;

        const userData=await User.findOne({email:email});
        if(userData){
            sendVerifyMail(userData.name,userData.email,userData._id)
            res.render("verification",{message:"reset verification mail send your mail id,please check"})
        }
        else{
            res.render('verification',{message:"this email not exist "})
        }
    }
    catch(error){
        console.log(error.message)
    }
}
//user profile edit and update
const editLoad=async(req,res)=>{
    try{
        const id=req.query.id;
        const userData=await User.findById({_id:id});
        if(userData){
            res.render("edit",{user:userData})
        }
        else{
            res.redirect('/home')
        }
    }
    catch(error){
        console.log(error.message)
    }
}


const updateProfile=async(req,res)=>{
    try{
        if(req.file){
            const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,image:req.file.filename}})
        }
        else{
        const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno}})
        }
        res.redirect('/home');
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
    forgotVerify,
    forgotPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerificationLink,
    editLoad,
    updateProfile
}

