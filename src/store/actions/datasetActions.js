import actionTypes from './actionTypes';
import {
    getAllCodeService,
    getAllDatasetsService,
    getAllDatasetsForAdminService,
    createDatasetService,
    updateDatasetService,
    deleteDatasetService,
    approveDatasetService,
    rejectDatasetService
} from '../../services/datasetService';


// PROVIDER ACTIONS

export const fetchAllDatasets = () => {
    return async (dispatch) => {
        try {
            let res = await getAllDatasetsService();
            if (res && res.errCode === 0) {
                dispatch(fetchAllDatasetsSuccess(res.data));
                return { success: true, data: res.data };
            } else {
                dispatch(fetchAllDatasetsFailed());
                return { success: false, message: res?.errMessage || 'Failed to fetch datasets' };
            }
        } catch (e) {
            dispatch(fetchAllDatasetsFailed());
            console.log('fetchAllDatasetsFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const fetchAllDatasetsSuccess = (data) => ({
    type: actionTypes.FETCH_ALL_DATASETS_SUCCESS,
    datasets: data
})

export const fetchAllDatasetsFailed = () => ({
    type: actionTypes.FETCH_ALL_DATASETS_FAILED
})

export const createDataset = (data) => {
    return async (dispatch) => {
        try {
            let res = await createDatasetService(data);
            if (res && res.errCode === 0) {
                dispatch(createDatasetSuccess());
                await dispatch(fetchAllDatasets());
                return { success: true, message: res.message || 'Dataset created successfully' };
            } else {
                dispatch(createDatasetFailed());
                return { success: false, message: res?.errMessage || 'Failed to create dataset' };
            }
        } catch (e) {
            dispatch(createDatasetFailed());
            console.log('createDatasetFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const createDatasetSuccess = () => ({
    type: actionTypes.CREATE_DATASET_SUCCESS
})

export const createDatasetFailed = () => ({
    type: actionTypes.CREATE_DATASET_FAILED
})

export const updateDataset = (id, data) => {
    return async (dispatch) => {
        try {
            let res = await updateDatasetService(id, data);
            if (res && res.errCode === 0) {
                dispatch(updateDatasetSuccess());
                await dispatch(fetchAllDatasets());
                return { success: true, message: res.errMessage || 'Dataset updated successfully' };
            } else {
                dispatch(updateDatasetFailed());
                return { success: false, message: res?.errMessage || 'Failed to update dataset' };
            }
        } catch (e) {
            dispatch(updateDatasetFailed());
            console.log('updateDatasetFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const updateDatasetSuccess = () => ({
    type: actionTypes.UPDATE_DATASET_SUCCESS
})

export const updateDatasetFailed = () => ({
    type: actionTypes.UPDATE_DATASET_FAILED
})

export const deleteDataset = (id) => {
    return async (dispatch) => {
        try {
            let res = await deleteDatasetService(id);
            if (res && res.errCode === 0) {
                dispatch(deleteDatasetSuccess());
                await dispatch(fetchAllDatasets());
                return { success: true, message: res.errMessage || 'Dataset deleted successfully' };
            } else {
                dispatch(deleteDatasetFailed());
                return { success: false, message: res?.errMessage || 'Failed to delete dataset' };
            }
        } catch (e) {
            dispatch(deleteDatasetFailed());
            console.log('deleteDatasetFailed error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const deleteDatasetSuccess = () => ({
    type: actionTypes.DELETE_DATASET_SUCCESS
})

export const deleteDatasetFailed = () => ({
    type: actionTypes.DELETE_DATASET_FAILED
})

// ADMIN ACTIONS
export const fetchAllDatasetsForAdmin = () => {
    return async (dispatch) => {
        try {
            let res = await getAllDatasetsForAdminService();
            if (res && res.errCode === 0) {
                dispatch(fetchAllDatasetsSuccess(res.data));
                return { success: true, data: res.data };
            } else {
                dispatch(fetchAllDatasetsFailed());
                return { success: false, message: res?.errMessage || 'Failed to fetch datasets' };
            }
        } catch (e) {
            dispatch(fetchAllDatasetsFailed());
            console.log('fetchAllDatasetsForAdmin error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const approveDataset = (id) => {
    return async (dispatch) => {
        try {
            let res = await approveDatasetService(id);
            if (res && res.errCode === 0) {
                await dispatch(fetchAllDatasetsForAdmin());
                return { success: true, message: res.errMessage || 'Dataset approved successfully' };
            } else {
                return { success: false, message: res?.errMessage || 'Failed to approve dataset' };
            }
        } catch (e) {
            console.log('approveDataset error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

export const rejectDataset = (id, reason) => {
    return async (dispatch) => {
        try {
            let res = await rejectDatasetService(id, reason);
            if (res && res.errCode === 0) {
                await dispatch(fetchAllDatasetsForAdmin());
                return { success: true, message: res.errMessage || 'Dataset rejected successfully' };
            } else {
                return { success: false, message: res?.errMessage || 'Failed to reject dataset' };
            }
        } catch (e) {
            console.log('rejectDataset error', e);
            return { success: false, message: 'Server error' };
        }
    }
}

//Lấy categories, formats, statuses
export const fetchCategoryStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllCodeService("DATASET_CATEGORY");
            if (res && res.errCode === 0) {
                dispatch(fetchCategorySuccess(res.data));
            } else {
                dispatch(fetchCategoryFailed());
            }
        } catch (e) {
            dispatch(fetchCategoryFailed());
            console.log('fetchCategoryStart error', e);
        }
    }
}

export const fetchCategorySuccess = (data) => ({
    type: actionTypes.FETCH_CATEGORY_SUCCESS,
    data: data
});

export const fetchCategoryFailed = () => ({
    type: actionTypes.FETCH_CATEGORY_FAILED
});

export const fetchFormatStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllCodeService("DATASET_FORMAT");
            if (res && res.errCode === 0) {
                dispatch(fetchFormatSuccess(res.data));
            } else {
                dispatch(fetchFormatFailed());
            }
        } catch (e) {
            dispatch(fetchFormatFailed());
            console.log('fetchFormatStart error', e);
        }
    }
}

export const fetchFormatSuccess = (data) => ({
    type: actionTypes.FETCH_FORMAT_SUCCESS,
    data: data
});

export const fetchFormatFailed = () => ({
    type: actionTypes.FETCH_FORMAT_FAILED
});

export const fetchStatusStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllCodeService("DATASET_STATUS");
            if (res && res.errCode === 0) {
                dispatch(fetchStatusSuccess(res.data));
            } else {
                dispatch(fetchStatusFailed());
            }
        } catch (e) {
            dispatch(fetchStatusFailed());
            console.log('fetchStatusStart error', e);
        }
    }
}

export const fetchStatusSuccess = (data) => ({
    type: actionTypes.FETCH_STATUS_SUCCESS,
    data: data
});

export const fetchStatusFailed = () => ({
    type: actionTypes.FETCH_STATUS_FAILED
});