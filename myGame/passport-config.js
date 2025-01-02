 import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";

export const init=(passport, getUserByUsername, getUserById)=>{
    //funciton to authenticate users
    const authenticateUsers = async(username, password, done) => {
        //get users by username
        const user = getUserByUsername(username);
        //if usern= not found
        if (user == null){
            return done(null, false, {message:"No user found with that usernmae"});
        }
        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }
            else{
                return done(null, false, {message: "Password incorrect"})
            }
        } catch (error) {
            return done(e);
        }
    };

    passport.use(new localStrategy({usernameField: 'username'}, authenticateUsers));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

