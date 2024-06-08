const VoucherModel = require("../models/VoucherModel");
const {decodeToken} = require("../utils/token");

class VoucherController {
    constructor() {
    }

    async getAllVouchers(req, res, next) {
        const listVouchers = await VoucherModel.find();

        if (listVouchers.length > 0) {
            return res.status(200).json({
                status: "success",
                message: "",
                data: listVouchers,
            });
        } else {
            return res.status(204).json({
                status: "success",
                message: "No vouchers found to response",
            });
        }
    }

    async getVoucherById(req, res, next) {
        try {
            let {voucherId} = req.params;

            voucherId = voucherId.toLowerCase()

            try {
                const voucherData = await VoucherModel.findById(voucherId);

                if (voucherData.length === 0) {
                    throw {name: "EmptyData", message: "vc"};
                }

                return res.status(200).json({
                    status: "success",
                    message: `Successfully get data of voucher with id ${voucherId}`,
                    data: voucherData,
                });
            } catch (err) {
                const voucherData = await VoucherModel.findOne({
                    voucherCode: voucherId,
                });

                if (voucherData.length === 0) {
                    throw {name: "EmptyData", message: "vc"};
                }

                return res.status(200).json({
                    status: "success",
                    message: `Successfully get data of voucher with code ${voucherId}`,
                    data: voucherData,
                });
            }
        } catch (err) {

            if (err.name === "CastError") {
                return res.status(404).json({
                    status: "error",
                    message: "Invalid Voucher Id or Voucher Code",
                });
            }

            if (err.name === "EmptyData") {
                return res.status(204).json({
                    status: "success",
                    message: "No vouchers found with the input provided",
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.message,
            });
        }
    }

    async getVoucherByCode(voucherCode) {
        const voucherData = await VoucherModel.find({
            voucherCode
        })

        return voucherData;
    }

    async createNewVoucher(req, res, next) {
        const newVoucherData = req.body;

        const newVoucher = new VoucherModel(newVoucherData);

        await newVoucher.save();

        return res.status(201).json({
            status: "success",
            message: "Created new discount code successfully",
        });
    }

    async checkValidVoucher(voucherCode) {
        if (voucherCode === '') {
            return true;
        }

        const [voucherData] = await VoucherModel.find({
            voucherCode: voucherCode.toLowerCase(),
        });

        if (!voucherData || voucherData.usedCount >= voucherData.maxUsage) {
            return false;
        }

        return !!voucherData;
    }

    async editVoucher(req, res, next) {
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

            const editData = req.body
            const {voucherId} = req.params

            console.log(voucherId, editData)
            await VoucherModel.findByIdAndUpdate(voucherId, editData)

            return res.status(200).json({
                status: 'success',
                message: 'vcl'
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

    async disableVoucher(req, res, next) {
    }

    async removeVoucher(req, res, next) {
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

module.exports = new VoucherController();
