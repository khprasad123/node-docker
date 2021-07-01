const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
    console.log(req);
    const {username, password } =req.body;
    console.log("reaches here",password);
    if(password!=null && password !=""){
        try{
            const hashpassword = await bcrypt.hash(password, 12);
            const newUser= await User.create({
                username,
                password: hashpassword
            });
    
            req.session.user = newUser;
            res.status(201).json({
                status: 'success',
                data: {
                    user : newUser
                }
            });
        }catch(e){
            console.log(e);
            res.status(400).json({
                status: 'failed',
            });
        }
    }else{
        res.status(400).json({
            status: 'failed',
        });
    }
};



exports.login = async (req, res) => {
    const {username, password} =req.body;
    try{
       const user = await User.findOne({username});

        if(!user){
           res.status(404).json({
                status: 'failed',
                message: 'User not found'
           });
        }

       const isCorrect = await bcrypt.compare(password, user.password);

       if(isCorrect){
            req.session.user = user;
            res.status(200).json({
                status: 'success',
            });
       }else{
            res.status(400).json({
                status: 'failed',
                message: 'incorrect username or password'
            });
       }
       
    }catch(e){
        console.log(e);
        res.status(400).json({
            status: 'failed',
        });
    }
};
