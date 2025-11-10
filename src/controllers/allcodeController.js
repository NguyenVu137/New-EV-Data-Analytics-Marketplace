import db from '../models/index.js'

export const getAllCode = async (req, res) => {
    try {
        const type = req.query.type
        if (!type) {
            return res.status(400).json({ errCode: 1, message: 'Missing type parameter', data: [] })
        }

        const data = await db.Allcode.findAll({
            where: { type: type },
            attributes: ['key', 'valueEn', 'valueVi']
        })

        if (!data || data.length === 0) {
            return res.status(404).json({ errCode: 2, message: 'No data found for type ' + type, data: [] })
        }

        return res.status(200).json({ errCode: 0, message: 'OK', data: data })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ errCode: 3, message: 'Server error', data: [] })
    }
}
