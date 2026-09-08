import ep1 from './ep1';

// Programme APIs
export const programmeAPI = {
    create: (data) => ep1.post('/api/v2/programme/createds', data),
    getAll: (query) => ep1.get('/api/v2/programme/getallds', { params: query }),
    getOne: (data) => ep1.post('/api/v2/programme/getoneds', data),
    update: (data) => ep1.post('/api/v2/programme/updateds', data),
    delete: (programmeCode, colid) => ep1.get('/api/v2/programme/deleteds', { params: { programmeCode, colid } })
};

// Subject APIs
export const subjectAPI = {
    create: (data) => ep1.post('/api/v2/subject/createds', data),
    getAll: (query) => ep1.get('/api/v2/subject/getallds', { params: query }),
    getOne: (data) => ep1.post('/api/v2/subject/getoneds', data),
    update: (data) => ep1.post('/api/v2/subject/updateds', data),
    delete: (subjectCode, colid) => ep1.get('/api/v2/subject/deleteds', { params: { subjectCode, colid } }),
    getByProgramme: (data) => ep1.post('/api/v2/subject/getbyprogrammeds', data),
    resetSeats: (data) => ep1.post('/api/v2/subject/resetseatsds', data)
};

// Student APIs
export const studentAPI = {
    create: (data) => ep1.post('/api/v2/student/createds', data),
    bulkCreate: (data) => ep1.post('/api/v2/student/bulkcreateds', data),
    getAll: (query) => ep1.get('/api/v2/student/getallds', { params: query }),
    getOne: (data) => ep1.post('/api/v2/student/getoneds', data),
    update: (data) => ep1.post('/api/v2/student/updateds', data),
    delete: (enrollmentNumber, colid) => ep1.get('/api/v2/student/deleteds', { params: { enrollmentNumber, colid } }),
    getByProgramme: (data) => ep1.post('/api/v2/student/getbyprogrammeds', data),
    getMeritList: (data) => ep1.post('/api/v2/student/getmeritlistds', data),
    getCount: (query) => ep1.get('/api/v2/student/countds', { params: query }),
    checkDuplicate: (data) => ep1.post('/api/v2/student/checkduplicateds', data)
};

// Session APIs
export const sessionAPI = {
    create: (data) => ep1.post('/api/v2/session/createds', data),
    getAll: (query) => ep1.get('/api/v2/session/getallds', { params: query }),
    getOne: (data) => ep1.post('/api/v2/session/getoneds', data),
    update: (data) => ep1.post('/api/v2/session/updateds', data),
    delete: (sessionId, colid) => ep1.get('/api/v2/session/deleteds', { params: { sessionId, colid } }),
    validateStart: (data) => ep1.post('/api/v2/session/validatestartds', data)
};

// Allocation APIs
export const allocationAPI = {
    startSingle: (data) => ep1.post('/api/v2/allocation/startsingleds', data),
    runRound: (data) => ep1.post('/api/v2/allocation/runroundds', data),
    getBySession: (data) => ep1.post('/api/v2/allocation/getbysessionds', data),
    getByStudent: (data) => ep1.post('/api/v2/allocation/getbystudentds', data),
    getBySubject: (data) => ep1.post('/api/v2/allocation/getbysubjectds', data),
    getStats: (data) => ep1.post('/api/v2/allocation/getstatsds', data),
    reset: (sessionId, colid) => ep1.get('/api/v2/allocation/resetds', { params: { sessionId, colid } }),
    preview: (data) => ep1.post('/api/v2/allocation/previewds', data),
    validatePreferences: (data) => ep1.post('/api/v2/allocation/validatepreferencesds', data),
    getNotAllocated: (data) => ep1.post('/api/v2/allocation/getnotallocatedds', data),
    getAuditLog: (data) => ep1.post('/api/v2/allocation/getauditlogds', data)
};

// Report APIs
export const reportAPI = {
    meritList: (data) => ep1.post('/api/v2/report/meritlistds', data),
    allocationResults: (data) => ep1.post('/api/v2/report/allocationresultsds', data),
    subjectWise: (data) => ep1.post('/api/v2/report/subjectwiseds', data),
    demandAnalysis: (data) => ep1.post('/api/v2/report/demandanalysisds', data),
    notChosenSubjects: (data) => ep1.post('/api/v2/report/notchosensubjectsds', data)
};
