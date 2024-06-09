const bcrypt = require("bcrypt");
const {decodeToken, generateAccessToken} = require("../utils/token"); // For password hashing

const UserModel = require("../models/UserModel");
const OrderModel = require("../models/OrderModel");

const addressController = require("./AddressController");
const otpController = require("./OTPController");

class UserController {
    constructor() {
    }

    async getAllUsers(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const listUsersData = await UserModel.find({});

            return res.status(200).json({
                status: "success",
                message: "get ok",
                data: listUsersData
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async deactivateUser(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {userId} = req.body;

            await UserModel.findByIdAndUpdate(userId, {
                isActive: 0
            })

            return res.status(200).json({
                status: 'success',
                message: 'Account deactivated successfully'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async reactivateUser(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {role} = decodeToken(token);

            if (role !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "You don't have permission to access this resource"
                })
            }

            const {userId} = req.body;

            await UserModel.findByIdAndUpdate(userId, {
                isActive: 1
            })

            return res.status(200).json({
                status: 'success',
                message: 'Account reactivated successfully'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async getCurrentUser(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }
        try {

            const {_id, email} = decodeToken(token);

            const userData = await UserModel.findById(_id);
            return res.status(200).json({
                status: "success",
                message: "Get current user info successfully",
                data: userData,
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async handleRefreshToken(req, res, next) {
        try {

            const refreshToken = req.headers["x-rftk"];
            const {_id} = decodeToken(refreshToken);

            const userData = await UserModel.findById(_id);
            const newAccessToken = generateAccessToken(userData);
            return res.status(200).json({
                status: "success",
                message: "Get new access token successfully",
                data: newAccessToken,
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const {userId} = req.params;
            const userData = await UserModel.findById(userId);

            if (!userData) {
                return res.status(404).json({status: "failure", message: `Cant find any user with _id = ${userId}`});
            }

            const {password, ...userInfo} = userData.toObject();
            res.status(200).json({
                status: "success",
                message: "",
                data: {
                    userData: userInfo,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({status: "error", message: "Internal server error"});
        }
    }

    async getUserAddresses(req, res, next) {
        try {
            const userId = req.user._id; // Assuming userId is available from authentication
            const user = await UserModel.findById(userId).select("listAddresses");

            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            res.status(200).json(user.listAddresses);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Internal server error"});
        }
    }

    // Change Password
    async changePassword(req, res, next) {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {_id} = decodeToken(token);
            const {oldPassword, newPassword, otpCode} = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: "Old password and new password are required"
                });
            }

            if (oldPassword === newPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: "New password can't be the same as old password"
                });
            }

            const isValidOTP = await otpController.isOTPActive(_id, otpCode, 'password')

            if (!isValidOTP) {
                return res.status(203).json({
                    status: 'failure',
                    message: 'OTP is incorrect, please try again',
                })
            }

            const userData = await UserModel.findById(_id);

            const isPasswordValid = await bcrypt.compare(oldPassword, userData.password);

            if (!isPasswordValid) {
                return res.status(401).json({message: "Incorrect old password"});
            }

            userData.password = await bcrypt.hash(newPassword, 10);

            await userData.save();
            await otpController.changeStatusOTP(_id, otpCode, 'password');
            res.status(200).json({status: 'success', message: "Password changed successfully"});

        } catch (error) {
            console.error(error);
            res.status(500).json({status: 'error', message: "Internal server error"});
        }
    }

    async getUserAddress(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);

            const listAddresses = await addressController.getUserAddresses(_id);

            return res.status(200).json({
                status: "success",
                message: "Get user address successfully",
                data: listAddresses,
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async getAddressDetails(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }
        try {
            const {_id} = decodeToken(token);
            const {addressId} = req.params;

            const [addressData] = await addressController.getAddressDetails(_id, addressId)

            return res.status(200).json({
                status: "success",
                message: "Get Address Details successfully",
                data: addressData,
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async createNewAddress(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);
            const {newAddress} = req.body;

            const userData = await UserModel.findById(_id);

            userData.listAddresses.push(newAddress);

            await userData.save();

            return res.status(201).json({
                status: "success",
                message: "Create new address successfully",
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async editAddress(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            const {_id} = decodeToken(token);

            const {newAddress} = req.body;
            const {addressId} = req.params;

            const userData = await UserModel.findById(_id);
            userData.listAddresses = await addressController.editAddress(_id, addressId, newAddress);

            await userData.save();

            return res.status(200).json({
                status: 'success',
                message: "",
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json(
                {
                    status: "error",
                    message: err.message
                }
            )
        }
    }

    async removeAddress(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "JWT Token not found",
            })
        }

        try {
            const {_id} = decodeToken(token);
            const {addressId} = req.params

            const userData = await UserModel.findById(_id);

            userData.listAddresses = await addressController.removeAddress(_id, addressId);

            userData.save();

            return res.status(200).json({
                status: 'success',
                message: "Delete address successfully"
            })
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                })
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async changeEmailAddress(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'JWT Token not found',
            })
        }

        try {
            const {_id} = decodeToken(token);
            const {newEmail, otpCode} = req.body;

            const isEmailExists = await UserModel.find({
                email: newEmail,
            })

            if (isEmailExists.length > 0) {
                return res.status(203).json({
                    status: 'failure',
                    message: 'Email already exists, please try with another email',
                })
            }

            const isValidOTP = await otpController.isOTPActive(_id, otpCode, 'email')

            if (!isValidOTP) {
                return res.status(203).json({
                    status: 'failure',
                    message: 'OTP is incorrect, please try again',
                })
            }

            const userData = await UserModel.findById(_id);

            userData.email = newEmail;

            await userData.save();
            await otpController.changeStatusOTP(_id, otpCode, 'email');

            return res.status(200).json({
                status: 'success',
                message: 'Email address changed successfully'
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                })
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async changeUsername(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'JWT Token not found',
            })
        }

        try {
            const {_id} = decodeToken(token);

            const {newUsername} = req.body;

            const isUsernameExists = await UserModel.find({
                userName: newUsername
            })

            if (isUsernameExists.length > 0) {
                return res.status(203).json({
                    status: 'failure',
                    message: "Username already exists, please try with another username"
                })
            }

            await UserModel.findByIdAndUpdate(_id, {
                userName: newUsername
            })

            return res.status(200).json({
                status: 'success',
                message: "Username changed successfully"
            })
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                })
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }

    async getUserOrders(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {

            const {_id} = decodeToken(token);
            console.log(_id)
            const listOrders = await OrderModel.find({
                customerId: _id
            }).sort({
                orderDate: -1
            })

            console.log(listOrders)
            return res.status(200).json({
                status: 'success',
                message: "Successfully get list user orders",
                data: listOrders,
            })

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired ",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message
            })
        }
    }
}

module.exports = new UserController();
