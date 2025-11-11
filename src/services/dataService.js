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
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                }
            })

            resolve({
                errCode: 0,
                data: datas
            })
        } catch (e) {
            reject(e);
        }
    })
}

let saveDetailInforData = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.dataId || !inputData.contentHTML || !inputData.contentMarkdown || !inputData.action) {
                resolve({
                    errCode: -1,
                    errMessage: "Missing parameter"
                })
            } else {
                if (inputData.action === "CREATE") {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        dataId: inputData.dataId
                    })
                } else if (inputData.action === "EDIT") {
                    let dataMarkdown = await db.Markdown.findOne({
                        where: { dataId: inputData.dataId },
                        raw: false
                    })
                    if (dataMarkdown) {
                        dataMarkdown.contentHTML = inputData.contentHTML;
                        dataMarkdown.contentMarkdown = inputData.contentMarkdown;
                        dataMarkdown.description = inputData.description;
                        dataMarkdown.dataId = inputData.dataId;
                        dataMarkdown.updateAt = new Date();
                        await dataMarkdown.save();
                    }
                }




                resolve({
                    errCode: 0,
                    errMessage: "Save infor data succeed!"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDataById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!"
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },

                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = Buffer.from(data.image, 'base64').toString('binary');
                }

                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getTopDataHome: getTopDataHome,
    getAllDatas: getAllDatas,
    saveDetailInforData: saveDetailInforData,
    getDetailDataById: getDetailDataById
}