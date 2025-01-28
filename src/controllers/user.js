const asyncHandler = require('../utils/asyncHandler.js');
const usermodel = require('../models/user.models.js');
const responseManger = require('../utils/responseManager.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const ApiResponse = require('../utils/apiresponse.js');

const genrateAccessandrefreshtoken = async (userId) => {
    try {
        const user = await usermodel.findById(userId);
        const accesstoken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });
        return { accesstoken, refreshToken };
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
}

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
                            // const coverImagelocalpath = req.files?.coverImage[0]?.path
                            let coverImagelocalpath;
                            if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                                coverImagelocalpath = req.files.coverImage[0].path;
                            }
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
        // console.log(error);
        return responseManger.servererror(res, "something went wrong...!");
    }
})

const loginuser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    try {
        if (username && username != null && username != undefined && typeof username === 'string' && username.trim() != '' || email && email != null && email != undefined && typeof email === 'string' && email.trim() != '') {
            const userdata = await usermodel.findOne({
                $or: [{ username }, { email }]
            });
            if (userdata != null) {
                const isPasswordvalid = await userdata.isPasswordCorrect(password);
                if (isPasswordvalid === true) {
                    const { accesstoken, refreshToken } = await genrateAccessandrefreshtoken(userdata._id)
                    const user = await usermodel.findById(userdata._id).select('-password -refreshToken');
                    const options = {
                        httpOnly: true,
                        secure: true
                    }
                    return res
                        .status(200)
                        .cookie("accesstoken", accesstoken, options)
                        .cookie("refreshtoken", refreshToken, options)
                        .json(
                            new ApiResponse(200,
                                {
                                    users: user, accesstoken, refreshToken
                                },
                                "User logged In successfully...!"
                            )
                        )
                } else {
                    return responseManger.Authorization(res, "password is Incorrect...!");
                }
            } else {
                console.log("1");
                return responseManger.badrequest(res, "user not found...!");
            }
        } else {
            return responseManger.badrequest(res, "username or email is required...! ");
        }
    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const logoutuser = asyncHandler(async (req, res) => {
    try {
        const user = await usermodel.findByIdAndUpdate(req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            }
            , {
                new: true
            }
        );
        const options = {
            httpOnly: true,
            secure: true
        }
        if (!user) {
            throw new Error("User not found or update failed.");
        }

        return res
            .status(200)
            .clearCookie("accesstoken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User loggedOut successfully...!"));

    } catch (error) {
        console.log(error);
        return responseManger.servererror(res, "Something went wrong...!");
    }
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return responseManger.Authorization(res, "unauthorized request...!");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await usermodel.findById(decodedToken?._id)

        if (!user) {
            return responseManger.Authorization(res, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return responseManger.Authorization(res, "refresh token is expried or used...!");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await genrateAccessandrefreshtoken(user._id)

        return res
            .status(200)
            .cookie("accesstoken", accessToken, options)
            .cookie("refreshtoken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }

})

const changecurrectpassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    try {

        if (oldpassword != newpassword) {
            const user = await usermodel.findById(user._id);
            const isPasswordvalid = await user.isPasswordCorrect(oldpassword);
            if (isPasswordvalid) {
                user.password = newpassword;
                await user.save();
                return responseManger.onsuccess(res, {}, "password change successfully...!");
            } else {
                return responseManger.badrequest(res, "old password is Invalid...!");
            }
        } else {
            return responseManger.badrequest(res, "oldpassword and newpassword is same...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const getcurrentuser = asyncHandler(async (req, res) => {
    try {
        return responseManger.onsuccess(res, req.user._id, "user fetched successfully...!");
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const updateAccountdetails = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body
    try {
        if (fullName && fullName != null && fullName != undefined && typeof fullName === 'string' && fullName.trim() != '' || username && username != null && username != undefined && typeof username === 'string' && username.trim() != '') {
            const user = await usermodel.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        fullName,
                        username
                    }
                },
                { new: true }
            );
            if (user != null) {
                return responseManger.onsuccess(res, "user updated successfully...!");
            } else {
                return responseManger.badrequest(res, "user not found...!");
            }
        } else {
            return responseManger.badrequest(res, "fullname or username is required...!");
        }
    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const avatarupdateuser = asyncHandler(async (req, res) => {
    try {
        const avatarlocalpath = req.files?.path;
        if (avatarlocalpath != null) {
            const avatar = await uploadOnCloudinary(avatarlocalpath)
            if (avatar.url != null) {
                const user = await usermodel.findByIdAndUpdate(req.user?._id, {
                    $set: {
                        avatar: avatar.url
                    }
                }, { new: true }).select('-password')
                return responseManger.onsuccess(res, "avatar change successfully...!");
            } else {
                return responseManger.badrequest(res, "error while uploading on avatar...!");
            }
        } else {
            return responseManger.badrequest(res, "Avatar file is missing...!");
        }

    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

const coverImageupdateuser = asyncHandler(async (req, res) => {
    try {
        const coverImagelocalpath = req.files?.path;
        if (coverImagelocalpath != null) {
            const coverImage = await uploadOnCloudinary(coverImagelocalpath)
            if (coverImage.url != null) {
                const user = await usermodel.findByIdAndUpdate(req.user?._id, {
                    $set: {
                        coverImage: coverImage.url
                    }
                }, { new: true }).select('-password')
                return responseManger.onsuccess(res, "coverImage change successfully...!");
            } else {
                return responseManger.badrequest(res, "error while uploading on coverImage...!");
            }
        } else {
            return responseManger.badrequest(res, "coverImage file is missing...!");
        }

    } catch (error) {
        return responseManger.servererror(res, "Something went wrong...!");
    }
});

module.exports = { registeruser, loginuser, logoutuser, refreshAccessToken, changecurrectpassword, getcurrentuser, updateAccountdetails, avatarupdateuser, coverImageupdateuser }