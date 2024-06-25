const {decodeToken} = require("./token");

function checkToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token)
        if (!token) {
            return res.status(400).json({
                status: "error",
                message: "JWT Token not found",
            });
        }

        try {
            decodeToken(token);
            next()
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
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: err.message
        })
    }
}

function checkAdminRole(req, res, next) {
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
        console.log('check from middleware')

        next()
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

module.exports = {
    checkAdminRole,
    checkToken
}