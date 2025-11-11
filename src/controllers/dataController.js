import dataService from "../services/dataService";

let getTopDataHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;
    try {
        let response = await dataService.getTopDataHome(+limit);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Error from server..."
        })
    }
}

let getAllDatas = async (req, res) => {
    try {
        let datas = await dataService.getAllDatas();
        return res.status(200).json(datas);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server!"
        })
    }
}

let postInforDatas = async (req, res) => {
    try {
        let response = await dataService.saveDetailInforData(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server!"
        })
    }
}

let getDetailDataById = async (req, res) => {
    try {
        let infor = await dataService.getDetailDataById(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server"
        })
    }
}

module.exports = {
    getTopDataHome: getTopDataHome,
    getAllDatas: getAllDatas,
    postInforDatas: postInforDatas,
    getDetailDataById: getDetailDataById
}