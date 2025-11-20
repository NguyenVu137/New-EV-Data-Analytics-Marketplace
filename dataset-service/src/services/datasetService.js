import db from '../models/index';
import { Op } from 'sequelize';

class DatasetService {
  getAllDatasets = async (filters = {}, page = 1, perPage = 12) => {
    try {
      const offset = (page - 1) * perPage;
      const whereClause = {};

      if (filters.data_type) whereClause.data_type = filters.data_type;
      if (filters.region) whereClause.region = filters.region;
      if (filters.format) whereClause.format = filters.format;
      if (filters.provider) whereClause.provider = filters.provider;
      if (filters.vehicle_type) whereClause.vehicle_type = filters.vehicle_type;
      if (filters.search) {
        whereClause.name = { [Op.like]: `%${filters.search}%` };
      }

      const { count, rows } = await db.Dataset.findAndCountAll({
        where: whereClause,
        limit: perPage,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: rows,
        total: count,
        page,
        perPage,
        totalPages: Math.ceil(count / perPage)
      };
    } catch (error) {
      console.error('Get all datasets error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getDatasetById = async (id) => {
    try {
      const dataset = await db.Dataset.findByPk(id);

      if (!dataset) {
        return {
          success: false,
          error: 'Dataset not found'
        };
      }

      return {
        success: true,
        data: dataset
      };
    } catch (error) {
      console.error('Get dataset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  createDataset = async (datasetData) => {
    try {
      const dataset = await db.Dataset.create(datasetData);

      return {
        success: true,
        data: dataset,
        message: 'Dataset created successfully'
      };
    } catch (error) {
      console.error('Create dataset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  updateDataset = async (id, datasetData) => {
    try {
      await db.Dataset.update(datasetData, {
        where: { id }
      });

      const dataset = await db.Dataset.findByPk(id);

      return {
        success: true,
        data: dataset,
        message: 'Dataset updated successfully'
      };
    } catch (error) {
      console.error('Update dataset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  deleteDataset = async (id) => {
    try {
      await db.Dataset.destroy({
        where: { id }
      });

      return {
        success: true,
        message: 'Dataset deleted successfully'
      };
    } catch (error) {
      console.error('Delete dataset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DatasetService();
