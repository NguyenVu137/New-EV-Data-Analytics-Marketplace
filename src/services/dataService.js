import { raw } from "body-parser";
import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
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
                    // create a Dataset record linked to provider (dataId) when creating markdown
                    try {
                        await db.Dataset.create({
                            dataType: inputData.dataType ? inputData.dataType : null,
                            dataName: inputData.dataName ? inputData.dataName : (inputData.description ? inputData.description.substring(0, 120) : ''),
                            formatCsv: inputData.formatCsv ? inputData.formatCsv : null,
                            formatHTML: inputData.formatHTML ? inputData.formatHTML : null,
                            basicPrice: inputData.basicPrice ? inputData.basicPrice : null,
                            standardPrice: inputData.standardPrice ? inputData.standardPrice : null,
                            premiumPrice: inputData.premiumPrice ? inputData.premiumPrice : null,
                            valueVi: inputData.valueVi ? inputData.valueVi : (inputData.description ? inputData.description : ''),
                            providerId: inputData.dataId
                        })
                    } catch (e) {
                        console.log('create Dataset error: ', e);
                    }
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
                    // update or create Dataset for this provider and dataType
                    try {
                        if (inputData.dataType) {
                            let dataset = await db.Dataset.findOne({ where: { providerId: inputData.dataId, dataType: inputData.dataType }, raw: false });
                            if (dataset) {
                                dataset.dataName = inputData.dataName ? inputData.dataName : (inputData.description ? inputData.description.substring(0, 120) : dataset.dataName);
                                dataset.formatCsv = inputData.formatCsv ? inputData.formatCsv : dataset.formatCsv;
                                dataset.formatHTML = inputData.formatHTML ? inputData.formatHTML : dataset.formatHTML;
                                dataset.basicPrice = inputData.basicPrice ? inputData.basicPrice : dataset.basicPrice;
                                dataset.standardPrice = inputData.standardPrice ? inputData.standardPrice : dataset.standardPrice;
                                dataset.premiumPrice = inputData.premiumPrice ? inputData.premiumPrice : dataset.premiumPrice;
                                dataset.valueVi = inputData.valueVi ? inputData.valueVi : dataset.valueVi;
                                await dataset.save();
                            } else {
                                await db.Dataset.create({
                                    dataType: inputData.dataType,
                                    dataName: inputData.dataName ? inputData.dataName : (inputData.description ? inputData.description.substring(0, 120) : ''),
                                    formatCsv: inputData.formatCsv ? inputData.formatCsv : null,
                                    formatHTML: inputData.formatHTML ? inputData.formatHTML : null,
                                    basicPrice: inputData.basicPrice ? inputData.basicPrice : null,
                                    standardPrice: inputData.standardPrice ? inputData.standardPrice : null,
                                    premiumPrice: inputData.premiumPrice ? inputData.premiumPrice : null,
                                    valueVi: inputData.valueVi ? inputData.valueVi : (inputData.description ? inputData.description : ''),
                                    providerId: inputData.dataId
                                })
                            }
                        }
                    } catch (e) {
                        console.log('update/create Dataset error: ', e);
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

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.dataId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required param!'
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                //get all existing data
                let existing = await db.Schedule.findAll({
                    where: { dataId: data.dataId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'dataId', 'maxNumber'],
                    raw: true
                });

                //compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDataTypeById = (dataId, dataType) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dataId || !dataType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let  dataType = await db.Dataset.findAll({
                    where: {
                        id: dataId,
                        dataType: dataType
                    },
                    include:[
                        {model: db.Allcode, as: 'dataTypeData', attributes: ['valueEn', 'valueVi']}
                    ],
                    raw: false,
                    nest: true
                })

                if (!dataType)  dataType = [];

                resolve({
                    errCode: 0,
                    data: dataType
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
    getDetailDataById: getDetailDataById,
    bulkCreateSchedule: bulkCreateSchedule,
    getDataTypeById: getDataTypeById
}