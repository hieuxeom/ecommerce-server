const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt"); // For password hashing

class UserController {
	constructor() {}

	// Get User Information
	async getUserInfo(req, res, next) {
		try {
			// Assuming you have authentication middleware and userId is available in req.user
			const userId = req.user._id;
			const user = await UserModel.findById(userId);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Exclude sensitive information like password
			const { password, ...userInfo } = user.toObject();
			res.status(200).json(userInfo);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	// Get User Addresses
	async getUserAddresses(req, res, next) {
		try {
			const userId = req.user._id; // Assuming userId is available from authentication
			const user = await UserModel.findById(userId).select("listAddresses");

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.status(200).json(user.listAddresses);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	// Change Password
	async changePassword(req, res, next) {
		try {
			const userId = req.user._id; // Assuming userId is available
			const { oldPassword, newPassword } = req.body;

			// Basic validation
			if (!oldPassword || !newPassword) {
				return res.status(400).json({ message: "Old password and new password are required" });
			}

			const user = await UserModel.findById(userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
			if (!isPasswordValid) {
				return res.status(401).json({ message: "Incorrect old password" });
			}

			const hashedNewPassword = await bcrypt.hash(newPassword, 10);
			user.password = hashedNewPassword;
			await user.save();

			res.status(200).json({ message: "Password changed successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}

module.exports = new UserController();
