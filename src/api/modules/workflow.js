import request from '../request'

export default {
  saveNodeData (id, data) {
    return request.put(`/workflows/${id}`, data)
  },

  getNodeData (id) {
    return request.get(`/workflows/${id}`)
  },

  tryRunModel (id, data) {
    return request.post(`/workflows/${id}/run`, data)
  },

  getRunData (id) {
    return request.get(`/workflows/${id}/runs/latest`)
  },

  getRunConfig (id) {
    return request.get(`/workflows/${id}/run-config`)
  },

  testHttpNode (id, data) {
    return request.post(`/workflows/${id}/http-nodes/test`, data)
  },

  testAndSaveHttpNode (id, nodeId, data) {
    return request.post(
      `/workflows/${id}/http-nodes/${encodeURIComponent(nodeId)}/test-runs`,
      data,
      { timeout: 240000 }
    )
  },

  getLatestHttpNodeTestRun (id, nodeId) {
    return request.get(`/workflows/${id}/http-nodes/${encodeURIComponent(nodeId)}/test-runs/latest`)
  }

}
