import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
export const register = async (req, res) => {
    const {username, email, password} = req.body;

    try {
        // Has Pass
        const hashedPassword = await bcrypt.hash(password,10);
        console.log(hashedPassword);
        
        //User Create
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
            
        })
        console.log(newUser);
        
        res.status(201).json({message: "User created successfully"});
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Failed to create user"});
    } 
}

export const login = async (req, res) => {
    const {username, password} = req.body;

    try {
        
        // Check if uers exist
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        });
        console.log(user);

        if(!user) return res.status(404).json({message: "Invalid credentials"});
        
        // Check if the password is correct

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});

        // generate cookie token and send to the user

        //res.setHeader('Set-Cookie', 'test=' + 'myValue').json({message: "Logged in successfully"});
        const age = 1000 * 60 * 60 * 24 * 7;
        const token = jwt.sign({
            id: user.id,
            isAdmin: false,
        }, process.env.JWT_SECRET,
        { expiresIn: age }
        );

        const { password: userPassword, ...userInfo } = user;

        res
        .cookie('token', token, {
            httpOnly: true,
            //secure: true,
            maxAge: age,
        })
        .status(200)
        .json(userInfo);
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({message: "Failed to login"});   
    }
}

export const logout = (req, res) => {
    res.clearCookie('token').status(200).json({message: "Logged out successfully"});
}