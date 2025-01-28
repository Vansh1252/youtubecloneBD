const asyncHandler = require('../utils/asyncHandler.js');
const usermodel = require('../models/user.models.js');
const responseManger = require('../utils/responseManager.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');

const registeruser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    try {
        if (fullName && fullName != null && fullName != undefined && typeof fullName === 'string' && fullName.trim() != '') {
            if (email && email != null && email != undefined && typeof email === 'string' && email.trim() != '') {
                if (username && username != null && username != undefined && typeof username === 'string' && username.trim() != '') {
                    if (password && password != null && password != undefined && typeof password === 'string' && password.trim() != '') {
                        const existinguser = await usermodel.findOne({
                            $or: [{ username }, { email }]
                        });
                        if (existinguser === null) {
                            const avatarlocalpath = req.files?.avatar[0]?.path
                            const coverImagelocalpath = req.files?.coverImage[0]?.path
                            console.log(coverImagelocalpath);
                            console.log(avatarlocalpath);
                            if (avatarlocalpath) {
                                const avatar = await uploadOnCloudinary(avatarlocalpath);
                                const coverImage = await uploadOnCloudinary(coverImagelocalpath);
                                if (avatar) {
                                    const user = await usermodel.create({
                                        fullName,
                                        avatar: avatar.url,
                                        coverImage: coverImage?.url || "",
                                        email,
                                        password,
                                        username: username.toLowerCase()
                                    });
                                    const usercretaed = await usermodel.findById(user._id).select('-password -refreshToken');
                                    if (usercretaed) {
                                        return responseManger.created(res, usercretaed, "user created successfully...!");
                                    } else {
                                        return responseManger.badrequest(res, "Something went wrong while registering the user...!");
                                    }
                                } else {
                                    return responseManger.badrequest(res, "Avatar files required...!");
                                }
                            } else {
                                return responseManger.badrequest(res, "Avatar file is required...!");
                            }
                        } else {
                            return responseManger.badrequest(res, "user with username or email already existing...!");
                        }
                    } else {
                        return responseManger.badrequest(res, "password is required...!");
                    }
                } else {
                    return responseManger.badrequest(res, "username is required...!");
                }
            } else {
                return responseManger.badrequest(res, "email is required...!");
            }
        } else {
            return responseManger.badrequest(res, "full is required...!");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "something went wrong...!");
    }
})



module.exports = { registeruser }