import e from "express";
import db from "../models/index";

let getTopDataHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [["createdAt", 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attibutes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attibutes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDatas = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let datas = await db.User.findAll({
                where: {roleId: 'R2'},
                attributes: {
                    exclude: ['password', 'image']
                }
            })

            resolve ({
                errCode: 0,
                data: datas
            })
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getTopDataHome: getTopDataHome,
    getAllDatas: getAllDatas
}