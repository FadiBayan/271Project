import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import zxcvbn from 'zxcvbn';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import db from './db.js';

dotenv.config();

const app = express();

const bytespertoken = 5;
const jwt_secretKey = process.env.JWT_SECRET;

app.use(cors());

app.use(express.json());


export const port = 5000;

/**
 * The salt rounds for the bcrypt password encryption algorithm. 
 */
const saltRounds = 10;


//#region [Log-in Request Handler]
app.post(`/login-user`, async (req, res) => {


    const {username, password} = req.body;

    //Need to check for username in database:

    const user_DB = await getUserFromDB(username);

    if (user_DB){

        //User must have verified his account:
        if (user_DB.verified == false){
            res.status(401).json({message: "Account not verified. Please check your inbox and verify your account."})
            return;
        }

        //Check if passwords match:

        const pass_Vald = await bcrypt.compare(password, user_DB.password_hash);

        if (!pass_Vald){
            res.status(401).json({message: "Invalid username or password"});
            return;
        }


        //TODO: Implement authorization (JWT)


        //Create the JWT object:
        const user_jwt_payload = {
            username: username,
            role: 'user',
            club: ''
        };

        //Now, I need to sign the jwt:
        console.log(jwt_secretKey);
        const user_jwt_signed = jwt.sign(user_jwt_payload, jwt_secretKey, {expiresIn: '1hr'});

        //Next, I need to store the token in cookies:
        res.cookie('token', user_jwt_signed, {
            httpOnly: true,
            secure: false, //TODO: Need to set this to true when we switch from http to https
            sameSite: 'strict',
            maxAge: 3600000
        });


        res.json({message: "login successful"});
    
    }
    else {
        res.status(401).json({message: "Invalid username or password."});
        return;
    }

});
//#endregion


app.post(`/login-club`, async (req, res) => {

    const {username, user_password, crn, club_password} = req.body;

    /**
     * 1. Check username in database (DONE)
     * 2. Check user password (DONE)
     * 3. Check if user is verified (DONE)
     * 4. Check club crn in database (DONE)
     * 5. Check club password (DONE)
     * 6. Update the jwt (DONE)
     * 7. Add the club access to database
     */

    const user_DB = await getUserFromDB(username);

    if (user_DB){

        //User must have verified his account:
        if (user_DB.verified == false){
            res.status(401).json({message: "User not verified. Please check your inbox and verify your account."})
            return;
        }

        //Check if passwords match:

        const userpass_Vald = await bcrypt.compare(user_password, user_DB.password_hash);

        if (!userpass_Vald){
            res.status(401).json({message: "Invalid username or password"});
            return;
        }

        const club_DB = await getClubFromDB(crn);

        if (club_DB){

            const clubpass_Vald = await bcrypt.compare(club_password, club_DB.password_hash);

            if (!clubpass_Vald){
                res.status(401).json({message: "Invalid club CRN or password"});
                return;
            }

            //Create the JWT object:
            const user_jwt_payload = {
                username: username,
                role: 'cabinet',
                club: crn
            };

            //Now, I need to sign the jwt:
            const user_jwt_signed = jwt.sign(user_jwt_payload, jwt_secretKey, {expiresIn: '1hr'});

            //Next, I need to store the token in cookies:
            res.cookie('token', user_jwt_signed, {
                httpOnly: true,
                secure: false, //TODO: Need to set this to true when we switch from http to https
                sameSite: 'strict',
                maxAge: 3600000
            });


            res.json({message: "club login successful"});

        }

        
    
    }
    else {
        res.status(401).json({message: "Invalid username or password."});
        return;
    }

});


//#region [Sign-up Request Handler]
app.post(`/signup`, async (req, res) => {

    //Destruct request body to get email and password variables:
    const {email, password} = req.body;

    //Need to validate email address:

    //Validate AUB email:
    const email_Vald = validateAUBEmail(email);

    if (!email_Vald){
        res.status(401).json({message: 'invalid email address'});
        return;
    }

    //Need to extract the username from the email:
    
    const username = getUsername_from_email(email);


    const user_DB = await getUserFromDB(username);

    if (user_DB){//If account already exists, then we must inform the user to log in instead.
        res.status(409).json({
            success: false,
            message: 'Cannot create account. User with given username already exists.',
            errorCode: 'ACCOUNT EXISTS'
        });
        return;
    }


    //need to await the hashing process before storing the password in the database:
    //Hash password:
    const hashedPass = await bcrypt.hash(password, saltRounds);


    //Now, before adding user to data base, we need to confirm that the right email was given.
    
    //But what if the same one-time token was generated for another user, so we have 2 users with the same verification token??
    //To fix this problem, we will use a cryptographically secure token:
    const verif_token = crypto.randomBytes(bytespertoken).toString('hex');

    const emailSent = await sendVerificationLink(email, verif_token);

    //TODO: Add user to an actual database:

    //Adding the user to the database:
    await db.execute('CALL InsertNewUser(?, ?, ?, ?)', [username, email, hashedPass, verif_token]);
    console.log('User added to database successfully.');

    //Need to add the verification token to the verifToken table:
    await db.execute('CALL InsertVerifToken(?, ?)', [verif_token, username]);

    res.json({
        success: true,
        message: 'Account created successfully. Please check your inbox for a verification link. If the email does not appear, please check your spam/junk folder.'
    });
    return;


});
//#endregion

function checkToken(user, token){
    return user.veriftoken == token;
}

//#region [Verification Request Handler]
app.get('/verify', async (req, res) => {

    //A token would be passed here. This token is stored in the database and is mapped to a specific username:
    /**
     *   TODO:   1. Read token from query parameter.
     *   TODO:   2. Use token to get username in database, then set the 'verified' field to true
     *   TODO:   3. Set expiry date to null or something
     */

    const verif_token_string = req.query.token;


    //TODO: Check if token is in database. If not, tell user an error occurred.

    const [row] = await db.execute('CALL GetUserFromVerifToken(?)',[verif_token_string]);

    const verif_username = (row[0][0])?row[0][0].username : null;
    
    
    if (verif_username == false){
        res.status(404).json({message: "Something went wrong. Invalid verification token."});
        return;
    }

    //Here, everything went fine, so we update the user at index user-index to become verifiied:
    //users[user_index].verified = true;

    await db.execute('CALL VerifyUser(?)', [verif_username]);

    res.status(200).send('<h1>CampusLink Verification</h1> <p>User successfully verified.</p>');

});
//#endregion

/**
 * This function sends a verification link to the specified email. The link contains the /verify route, and is passed a verification token as a query parameter.
 * @param {*} email the email of the user the verification link will be sent to.
 * @param {*} verif_token the verification token used to identify the user being verified.
 */
async function sendVerificationLink(email, verif_token){

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'campuslinkteam@gmail.com',
            pass: 'aqlw bfvp wkvn hgie'
        }
    });


    const mailOptions = {
        from: 'campuslinkteam@gmail.com',
        to: email,
        subject: 'Verify Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">Hello,</h2>
                <p>Thank you for signing up! To complete your registration, please verify your account by clicking the button below:</p>
                
                <p style="text-align: center;">
                    <a href="http://localhost:5000/verify?token=${verif_token}" 
                       style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Verify Account
                    </a>
                </p>
                
                <p>This link will expire in 1 hour. If you did not sign up, please ignore this email.</p>
                
                <p>Best regards,<br>CampusLink Team</p>
    
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>If you have any issues or questions, feel free to reach out to us at <a href="mailto:support@campuslink.com">support@campuslink.com</a>.</p>
                </footer>
            </div>
        `
    };
    
    

    try {
        // Send email and await the result
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 1;  // Return success
    } catch (error) {
        console.error('Error sending email:', error);
        return -1;  // Return error code
    }

}



/**
 * This function retrieves the user object with the given username from the table of users in the database. If the user is not found it returns null.
 * @param {*} username the username to search the database by
 * @returns either the user or null if no user with the specified username exits
 */
async function getUserFromDB(username){

    const [rows] = await db.execute('CALL GetUser(?)', [username]);
    //So, db.execute will return two arrays in an array: [rows, fields], where rows is itself an array of result sets where each result set contains an array of rows
    //The fields is an array of metadata (like column names...)

    return rows[0][0];
    
}

/**
 * This function retrieves the user object with the given username from the table of users in the database. If the user is not found it returns null.
 * @param {*} username the username to search the database by
 * @returns either the user or null if no user with the specified username exits
 */
async function getClubFromDB(crn){

    const [rows] = await db.execute('CALL GetClub(?)', [crn]);
    //So, db.execute will return two arrays in an array: [rows, fields], where rows is itself an array of result sets where each result set contains an array of rows
    //The fields is an array of metadata (like column names...)

    return rows[0][0];
    
}

function validateEmailDomain(email, domain){

    //Need to make sure that email is a valid email address with the right domain.

    if (!email.includes('@')) return false;

    if (email.substring(email.indexOf('@') + 1, email.length) != domain) return false;

    if (email.substring(0, email.indexOf('@')).length == 0) return false;

    return true;

}

function validateAUBEmail(email){

    return validateEmailDomain(email, 'mail.aub.edu');

}

function getUsername_from_email(email){

    const username = email.substring(0, email.indexOf('@'));

    return username;

}


//#region [Check database for expired verification tokens]

const checkDelay_verifToken = 60000; //1 minute

//TODO: Check expiration of verification tokens and remove expired tokens every minute.
setInterval(() => {

    //

}, checkDelay_verifToken);

//#endregion


app.listen(port, () => console.log(`Listening on port ${port}...`));