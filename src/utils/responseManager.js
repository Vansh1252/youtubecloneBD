class responseManger {
    static onsuccess(res, data = {}, message = "", statuscode = 200) {
        return res.status(statuscode).json({
            success: true,
            data,
            message,
        });
    };
    static created(res, data = {}, message = "", statuscode = 201) {
        return res.status(statuscode).json({
            success: true,
            data,
            message,
        });
    };
    static badrequest(res, message = "", statuscode = 400, errors = "") {
        return res.status(statuscode).json({
            success: false,
            message,
            errors
        });
    };
    static Authorization(res, message = "", statuscode = 401, errors = "") {
        return res.status(statuscode).json({
            success: false,
            message,
            errors
        })
    };
    static servererror(res, message = "error in the server ", statuscode = 500,) {
        return res.status(statuscode).json({ success: false, message })
    }
};

module.exports = responseManger;