import {google} from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Create an OAuth2 client with the given credentials 
export const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

