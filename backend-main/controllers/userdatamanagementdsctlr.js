const User = require('../Models/user');
const UserCustomField = require('../Models/usercustomfieldds');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
const Awsconfig = require('../Models/awsconfig');

const excludedFilterFields = new Set(['_id', '__v', 'colid', 'user', 'customFields']);
const hiddenFields = new Set([
  '_id', '__v', 'colid', 'user', 'customFields', 'lastlogin', 'photo',
  'dob', 'eligibilityname', 'srno', 'degree', 'samestate', 'admissionapplicationid',
  'minorsub', 'vocationalsub', 'mdcsub', 'othersub', 'merit', 'obtain', 'bonus',
  'weightage', 'ncctype', 'scholarship', 'expotoken', 'quota', 'status1',
  'comments', 'addedby'
]);
const upload = multer({ storage: multer.memoryStorage() });

const cleanValue = (value) => {
  if (value === undefined || value === null) return '';
  return value;
};

const dateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const hasDemoText = (payload) => {
  const name = String(payload.name || '').toLowerCase();
  const email = String(payload.email || '').toLowerCase();
  return name.includes('demo') || email.includes('demo');
};

const isHiddenSchemaPath = (field) => hiddenFields.has(field) || String(field).startsWith('customFields.');

const baseUserFields = () => Object.keys(User.schema.paths).filter((field) => !isHiddenSchemaPath(field));

const humanizeField = (field) => String(field)
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/(\D)(\d+)/g, '$1 $2')
  .replace(/(\d+)([A-Za-z])/g, '$1 $2')
  .replace(/\bCgpa\b/g, 'CGPA')
  .replace(/\bSgpa\b/g, 'SGPA')
  .replace(/\bAbc\b/g, 'ABC')
  .replace(/\bNri\b/g, 'NRI')
  .replace(/\bPio\b/g, 'PIO')
  .replace(/\bSsc\b/g, 'SSC')
  .replace(/\bHsc\b/g, 'HSC')
  .replace(/^./, (value) => value.toUpperCase());

const fieldOptions = (field) => {
  if (field === 'gender') return ['Male', 'Female', 'Not specified'];
  if (field === 'category') return ['General', 'SC', 'ST', 'OBC', 'EBC', 'EWS', 'PH'];
  if (field === 'isdisabled') return ['Yes', 'No'];
  if (field === 'role') return ['Faculty', 'Student', 'All', 'Admin'];
  if (field === 'status') return ['1', '0'];
  return [];
};

const numericFields = () => Object.entries(User.schema.paths)
  .filter(([, path]) => path.instance === 'Number')
  .map(([field]) => field);

const normalizeCustomFields = (customFields) => {
  if (!customFields) return {};
  if (customFields instanceof Map) return Object.fromEntries(customFields);
  if (typeof customFields === 'object') return customFields;
  return {};
};

const colidOnlyFilter = (colid) => ({ colid: Number(colid) });

const encodeS3Key = (key) => String(key || '').split('/').map(encodeURIComponent).join('/');

const s3Url = (bucket, region, key) => {
  const encodedKey = encodeS3Key(key);
  if (region === 'us-east-1') return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
};

const userPayload = (body, customFieldDefs = []) => {
  const payload = {};
  const numberFields = new Set(numericFields());
  const isNonStudent = /^non/i.test(String(body.usertype || body.userType || body.studenttype || ''));
  const nonStudentNaFields = ['program', 'programcode', 'regulation', 'Major', 'Minor', 'AEC', 'SEC', 'VAC', 'IDC', 'rollno', 'semester', 'section'];

  baseUserFields().forEach((field) => {
    if (body[field] !== undefined) {
      const bodyValue = field === 'status' && /^active$/i.test(String(body[field])) ? 1
        : field === 'status' && /^inactive$/i.test(String(body[field])) ? 0
          : body[field];
      payload[field] = numberFields.has(field) ? Number(bodyValue || 0) : cleanValue(bodyValue);
    }
  });

  if (isNonStudent) {
    nonStudentNaFields.forEach((field) => {
      payload[field] = 'NA';
    });
  }

  payload.colid = Number(body.colid);
  payload.user = body.user || '';
  if (body.photo !== undefined) payload.photo = cleanValue(body.photo);
  payload.lastlogin = hasDemoText(payload) ? dateAfterDays(3) : dateAfterDays(365);

  const customInput = normalizeCustomFields(body.customFields);
  const customValues = {};
  customFieldDefs.forEach((field) => {
    if (customInput[field.fieldname] !== undefined) {
      customValues[field.fieldname] = customInput[field.fieldname];
    } else if (body[field.fieldname] !== undefined) {
      customValues[field.fieldname] = body[field.fieldname];
    }
  });
  payload.customFields = customValues;

  return payload;
};

const serializeUser = (row) => {
  const data = row.toObject ? row.toObject() : row;
  data.customFields = normalizeCustomFields(data.customFields);
  return data;
};

const buildFilter = (colid, filters = []) => {
  const mongoFilter = colidOnlyFilter(colid);
  const numberFields = new Set(numericFields());

  filters.forEach((filter) => {
    if (!filter?.field || excludedFilterFields.has(filter.field)) return;
    const value = filter.value;
    if (value === undefined || value === null || String(value).trim() === '') return;

    const fieldPath = String(filter.field).startsWith('customFields.')
      ? filter.field
      : filter.field;

    if (numberFields.has(filter.field)) {
      mongoFilter[fieldPath] = Number(value);
    } else {
      mongoFilter[fieldPath] = { $regex: String(value), $options: 'i' };
    }
  });

  return mongoFilter;
};

exports.getMeta = async (req, res) => {
  try {
    const colid = Number(req.query.colid);
    const customFields = await UserCustomField.find({ ...colidOnlyFilter(colid), isactive: 'Yes' }).sort({ page: 1, section: 1, order: 1, label: 1 }).lean();
    const fields = baseUserFields().map((field) => ({
      field,
      label: humanizeField(field),
      type: User.schema.paths[field]?.instance === 'Number' ? 'number' : 'text',
      options: fieldOptions(field),
      source: 'user'
    }));
    const custom = customFields.map((field) => ({
      field: `customFields.${field.fieldname}`,
      fieldname: field.fieldname,
      label: field.label,
      type: field.type || 'text',
      options: field.options || [],
      source: 'custom'
    }));

    res.json({ fields, customFields: customFields || [], filterFields: [...fields, ...custom] });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getOptions = async (req, res) => {
  try {
    const colid = Number(req.query.colid);
    const field = req.query.field;
    if (!field || excludedFilterFields.has(field) || String(field).includes('$')) return res.json([]);
    const values = await User.distinct(field, colidOnlyFilter(colid));
    res.json(values.filter((item) => item !== undefined && item !== null && String(item).trim() !== '').sort());
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.uploadPhotoMiddleware = upload.single('photo');

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Select a photo to upload' });
    const colid = Number(req.body.colid);
    if (!colid) return res.status(400).json({ msg: 'colid is required' });

    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png'].includes(req.file.mimetype);
    const allowedExtension = ['.jpg', '.jpeg', '.png'].includes(extension);
    if (!allowedMime || !allowedExtension) {
      return res.status(400).json({ msg: 'Photo must be a JPG, JPEG, or PNG file' });
    }

    const config = await Awsconfig.findOne({
      colid,
      type: /^aws$/i,
      default: /^yes$/i
    }).lean();
    if (!config?.username || !config?.password || !config?.bucket || !config?.region) {
      return res.status(400).json({ msg: 'Default AWS configuration is missing or incomplete' });
    }

    const cleanName = path.basename(req.file.originalname).replace(/[^\w.\-() ]/g, '_');
    const key = `${colid}/user-photos/${Date.now()}-${cleanName}`;
    const s3 = new AWS.S3({
      accessKeyId: config.username,
      secretAccessKey: config.password,
      region: config.region
    });

    await s3.putObject({
      Bucket: config.bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();

    res.json({
      filename: cleanName,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucket: config.bucket,
      region: config.region,
      key,
      url: s3Url(config.bucket, config.region, key)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const filter = buildFilter(req.body.colid, req.body.filters || []);
    const data = await User.find(filter).sort({ createdAt: -1, name: 1 }).limit(Number(req.body.limit || 1000));
    res.json(data.map(serializeUser));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const colid = Number(req.body.colid);
    const customFieldDefs = await UserCustomField.find({ ...colidOnlyFilter(colid), isactive: 'Yes' }).lean();
    const payload = userPayload(req.body, customFieldDefs);
    const data = await User.create(payload);
    res.json(serializeUser(data));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Duplicate email is not allowed' });
    res.status(500).json({ msg: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const colid = Number(req.body.colid);
    const customFieldDefs = await UserCustomField.find({ ...colidOnlyFilter(colid), isactive: 'Yes' }).lean();
    const payload = userPayload(req.body, customFieldDefs);
    const duplicate = await User.findOne({ _id: { $ne: req.body.id }, email: payload.email });
    if (duplicate) return res.status(400).json({ msg: 'Duplicate email is not allowed' });

    const data = await User.findOneAndUpdate(
      { _id: req.body.id, ...colidOnlyFilter(colid) },
      payload,
      { new: true, runValidators: true }
    );
    res.json(serializeUser(data));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Duplicate email is not allowed' });
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.body.id, ...colidOnlyFilter(req.body.colid) });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const colid = Number(req.body.colid);
    if (!colid) return res.status(400).json({ msg: 'College id is required' });
    if (items.length === 0) return res.status(400).json({ msg: 'No rows received' });

    const customFieldDefs = await UserCustomField.find({ ...colidOnlyFilter(colid), isactive: 'Yes' }).lean();
    const errors = [];
    let saved = 0;

    for (let index = 0; index < items.length; index += 1) {
      const rowNumber = items[index].rowNumber || index + 2;
      const payload = userPayload({ ...items[index], colid, user: req.body.user || items[index].user }, customFieldDefs);
      if (!payload.email) {
        errors.push({ rowNumber, msg: 'Email is required' });
        continue;
      }

      try {
        await User.findOneAndUpdate(
          { email: payload.email },
          payload,
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        saved += 1;
      } catch (err) {
        errors.push({ rowNumber, msg: err.message });
      }
    }

    res.json({ saved, errors });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Duplicate email is not allowed' });
    res.status(500).json({ msg: err.message });
  }
};

const studentProfileSections = [
  { title: 'Personal Details', fields: [
    ['title', 'Title'], ['name', 'First Name'], ['fathername', 'Father Name'], ['surname', 'Surname'], ['gender', 'Gender'], ['birthdate', 'Date of Birth'], ['phone', 'Mobile Number'], ['email', 'Email'], ['bloodgroup', 'Blood Group'], ['maritalstatus', 'Marital Status'], ['spousename', 'Spouse Name'], ['category', 'Caste'], ['religion', 'Religion'], ['isdisabled', 'Physical Disability'], ['aadharcardnumber', 'Aadhar Card Number'], ['abcid', 'ABC Number'], ['nationality', 'Nationality'], ['nriPio', 'NRI / PIO']
  ] },
  { title: 'Academic Details', fields: [
    ['program', 'Programme'], ['programcode', 'Programme Code'], ['Major', 'Major'], ['Minor', 'Minor'], ['semester', 'Semester'], ['section', 'Section'], ['specialization1', 'Specialization 1'], ['specialization2', 'Specialization 2'],
    ['class10thBoard', 'Class 10th Board'], ['class10thMedium', 'Class 10th Medium'], ['class10thPercentile', 'Class 10th Percentile'], ['class10thPercentage', 'Class 10th Percentage'], ['class10thPassingYear', 'Class 10th Passing Year'],
    ['class12thBoard', 'Class 12th Board'], ['class12thMedium', 'Class 12th Medium'], ['class12thPercentile', 'Class 12th Percentile'], ['class12thPercentage', 'Class 12th Percentage'], ['class12thPassingYear', 'Class 12th Passing Year'], ['class12thStream', 'Class 12th Stream'],
    ['degree', 'Graduation Degree'], ['Mediumofinstruction', 'Graduation Medium'], ['graduationCollege', 'Graduation College'], ['graduationUniversity', 'Graduation University'], ['graduationCgpa', 'Graduation CGPA'],
    ['graduationSemester1Percentage', 'Graduation Semester 1 Percentage'], ['graduationSemester1Sgpa', 'Graduation Semester 1 SGPA'], ['graduationSemester2Percentage', 'Graduation Semester 2 Percentage'], ['graduationSemester2Sgpa', 'Graduation Semester 2 SGPA'], ['graduationSemester3Percentage', 'Graduation Semester 3 Percentage'], ['graduationSemester3Sgpa', 'Graduation Semester 3 SGPA'], ['graduationSemester4Percentage', 'Graduation Semester 4 Percentage'], ['graduationSemester4Sgpa', 'Graduation Semester 4 SGPA'], ['graduationSemester5Percentage', 'Graduation Semester 5 Percentage'], ['graduationSemester5Sgpa', 'Graduation Semester 5 SGPA'], ['graduationSemester6Percentage', 'Graduation Semester 6 Percentage'], ['graduationSemester6Sgpa', 'Graduation Semester 6 SGPA'], ['graduationSemester7Percentage', 'Graduation Semester 7 Percentage'], ['graduationSemester7Sgpa', 'Graduation Semester 7 SGPA'], ['graduationSemester8Percentage', 'Graduation Semester 8 Percentage'], ['graduationSemester8Sgpa', 'Graduation Semester 8 SGPA'], ['graduationPassingYear', 'Graduation Passing Year'],
    ['postGraduationDegree', 'Post Graduation Degree'], ['postGraduationMedium', 'Post Graduation Medium'], ['postGraduationCollege', 'Post Graduation College'], ['postGraduationUniversity', 'Post Graduation University'], ['postGraduationCgpa', 'Post Graduation CGPA'],
    ['postGraduationSemester1Percentage', 'Post Graduation Semester 1 Percentage'], ['postGraduationSemester1Sgpa', 'Post Graduation Semester 1 SGPA'], ['postGraduationSemester2Percentage', 'Post Graduation Semester 2 Percentage'], ['postGraduationSemester2Sgpa', 'Post Graduation Semester 2 SGPA'], ['postGraduationSemester3Percentage', 'Post Graduation Semester 3 Percentage'], ['postGraduationSemester3Sgpa', 'Post Graduation Semester 3 SGPA'], ['postGraduationSemester4Percentage', 'Post Graduation Semester 4 Percentage'], ['postGraduationSemester4Sgpa', 'Post Graduation Semester 4 SGPA'], ['postGraduationSemester5Percentage', 'Post Graduation Semester 5 Percentage'], ['postGraduationSemester5Sgpa', 'Post Graduation Semester 5 SGPA'], ['postGraduationSemester6Percentage', 'Post Graduation Semester 6 Percentage'], ['postGraduationSemester6Sgpa', 'Post Graduation Semester 6 SGPA'], ['postGraduationPassingYear', 'Post Graduation Passing Year'],
    ['entranceExamName', 'Entrance Exam Name'], ['entranceExamPercentage', 'Entrance Exam Percentage'], ['entranceExamScore', 'Entrance Exam Score'], ['entranceExamScoreOutOf', 'Entrance Exam Score Out of'], ['entranceExamMonthYear', 'Entrance Exam Month and Year']
  ] },
  { title: 'Address Details', fields: [
    ['address', 'Current Address'], ['city', 'Current City'], ['state', 'Current State'], ['pincode', 'Current Pincode'], ['currentCountry', 'Current Country'], ['permanentAddress', 'Permanent Address'], ['permanentCity', 'Permanent City'], ['permanentState', 'Permanent State'], ['permanentPincode', 'Permanent Pincode'], ['permanentCountry', 'Permanent Country']
  ] },
  { title: 'Documents', document: true, fields: [
    ['sscCertificateFile', 'SSC Certificate File'], ['hscCertificateFile', 'HSC Certificate File'], ['graduationSemester1CertificateFile', 'Graduation Semester 1 Certificate File'], ['graduationSemester2CertificateFile', 'Graduation Semester 2 Certificate File'], ['graduationSemester3CertificateFile', 'Graduation Semester 3 Certificate File'], ['graduationSemester4CertificateFile', 'Graduation Semester 4 Certificate File'], ['graduationSemester5CertificateFile', 'Graduation Semester 5 Certificate File'], ['graduationSemester6CertificateFile', 'Graduation Semester 6 Certificate File'], ['graduationSemester7CertificateFile', 'Graduation Semester 7 Certificate File'], ['graduationSemester8CertificateFile', 'Graduation Semester 8 Certificate File'], ['graduationDegreeFile', 'Graduation Degree File'],
    ['additionalGraduationCertificateFile1', 'Additional Graduation Certificate File 1'], ['additionalGraduationCertificateFile2', 'Additional Graduation Certificate File 2'], ['additionalGraduationCertificateFile3', 'Additional Graduation Certificate File 3'], ['additionalGraduationCertificateFile4', 'Additional Graduation Certificate File 4'], ['additionalGraduationCertificateFile5', 'Additional Graduation Certificate File 5'],
    ['postGraduationSemester1CertificateFile', 'Post Graduation Semester 1 Certificate File'], ['postGraduationSemester2CertificateFile', 'Post Graduation Semester 2 Certificate File'], ['postGraduationSemester3CertificateFile', 'Post Graduation Semester 3 Certificate File'], ['postGraduationSemester4CertificateFile', 'Post Graduation Semester 4 Certificate File'], ['postGraduationSemester5CertificateFile', 'Post Graduation Semester 5 Certificate File'], ['postGraduationSemester6CertificateFile', 'Post Graduation Semester 6 Certificate File'], ['postGraduationDegreeFile', 'Post Graduation Degree File'],
    ['additionalPostGraduationCertificateFile1', 'Additional Post Graduation Certificate File 1'], ['additionalPostGraduationCertificateFile2', 'Additional Post Graduation Certificate File 2'], ['additionalPostGraduationCertificateFile3', 'Additional Post Graduation Certificate File 3'], ['additionalPostGraduationCertificateFile4', 'Additional Post Graduation Certificate File 4'], ['additionalPostGraduationCertificateFile5', 'Additional Post Graduation Certificate File 5'],
    ['entranceExamCertificateFile', 'Entrance Exam Certificate File'], ['aadharCardFile', 'Aadhar Card'], ['photo', 'Passport Size Photo'], ['professionalCourseCertificateFile', 'Professional Course Certificate File'], ['professionalCourseName', 'Professional Course Name'], ['domicileCertificateFile', 'Domicile Certificate'], ['categoryCertificateFile', 'Category Certificate'], ['disabilityCertificateFile', 'Disability Certificate'], ['workExperienceCertificateFile', 'Work Experience Certificate'], ['schoolLeavingCertificateFile', 'School Leaving Certificate'], ['nonCreamyLayerCertificateFile', 'Non Creamy Layer Certificate'], ['abcCertificateFile', 'ABC Certificate'], ['registrationFeesReceiptFile', 'Registration Fees Receipt'], ['firstInstallmentFeesReceiptFile', 'First Installment Fees Receipt'], ['thirdInstallmentFeesReceiptFile', 'Third Installment Fees Receipt'], ['fifthInstallmentFeesReceiptFile', 'Fifth Installment Fees Receipt']
  ] },
  { title: 'Employment Details', fields: [
    ['currentEmployerName', 'Current Employer Name'], ['currentEmploymentDuration', 'Current Employment Duration'], ['previousEmployerName', 'Previous Employer Name'], ['previousEmploymentDuration', 'Previous Employment Duration'], ['currentSalary', 'Current Salary'], ['designation', 'Current Designation']
  ] },
  { title: 'Family Details', fields: [
    ['fathername', 'Father Name'], ['fatherMobile', 'Father Mobile'], ['fatherEmail', 'Father Email'], ['mothername', 'Mother Name'], ['motherMobile', 'Mother Mobile'], ['motherEmail', 'Mother Email'], ['siblingName1', 'Sibling Name 1'], ['siblingName2', 'Sibling Name 2'], ['siblingName3', 'Sibling Name 3']
  ] },
  { title: 'Other Details', fields: [
    ['educationLoan', 'Have you taken Education Loan'], ['bankName', 'Bank Name'], ['bankBranch', 'Bank Branch'], ['bankAddress', 'Bank Address'], ['hasTwoWheeler', 'Do you have two wheeler'], ['hasDrivingLicense', 'Do you have driving license'], ['drivingLicenseNumber', 'Driving License Number'], ['requiresHostelFacility', 'Do you Require Hostel Facility?'], ['requiresTransportationFacility', 'Do you Require Transportation Facility?'], ['busPickupLocation', 'Bus Pickup Location']
  ] }
];

const studentProfileReadOnlyFields = new Set(['email', 'name', 'program', 'programcode', 'Major', 'Minor', 'semester', 'section', 'specialization1', 'specialization2']);
const studentProfileDocumentFields = new Set(studentProfileSections.filter((section) => section.document).flatMap((section) => section.fields.map(([field]) => field)).filter((field) => field !== 'professionalCourseName'));
const studentProfileFields = new Set(studentProfileSections.flatMap((section) => section.fields.map(([field]) => field)));
const studentProfileDropdownOptions = {
  title: ['Mr.', 'Ms.'],
  gender: ['Male', 'Female', 'Other'],
  bloodgroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Rh null'],
  maritalstatus: ['Single', 'Married'],
  category: ['General', 'ST', 'SC', 'OBC', 'EWS'],
  isdisabled: ['Yes', 'No'],
  nriPio: ['NRI', 'PIO'],
  hasTwoWheeler: ['Yes', 'No'],
  hasDrivingLicense: ['Yes', 'No'],
  requiresHostelFacility: ['Yes', 'No'],
  requiresTransportationFacility: ['Yes', 'No'],
  busPickupLocation: ['Narol', 'Isanpur Chokdi', 'Ghodasar', 'CTM', 'Bapunagar BRTS', 'Sone ke chawl', 'Thakkarbapa Nagar', 'Krishnanagar', 'Naroda Patiya', 'Nana Chiloda Circle', 'Galaxy Cinema', 'Tapovan Circle', 'Gota Chokdi', 'Kargil Pump', 'Kankariya lake (Balwant rai Hall)', 'Anjali Cross Road', 'Nehrunagar circle', 'Shivranjani Cross Rd', 'Jodhpur Cr Rd', 'Ramdevnagar', 'Sobo Center', 'Bopal', 'Shilaj', 'Old Vadaj', 'Income tax cross road', 'Pelican House', 'MithaKhali Six Road', 'Girish Cold drinks', 'Commerce 6 Road', 'Vijay Cross Road', 'Helmet Cross Road', 'Gurukul', 'Doordarshan Tower', 'Vastral', 'Nikol Chokdi', 'Indrabridge', 'Sardarnagar', 'Dafnada', 'RTO Circle', 'Sabarmati Police Station', 'Chandkheda Chokdi', 'Zundal Chokdi', 'Vaishno Devi Circle', 'Sanand Chokdi', 'Makarba', 'Iscon Cr Rd', 'Thaltej Chokdi', 'Sci City Rd']
};
const studentProfileUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const studentProfileUserFilter = (colid, email) => ({ colid: Number(colid), $or: [{ email }, { user: email }, { regno: email }] });
const profileSectionsPayload = () => studentProfileSections.map((section) => ({
  title: section.title,
  document: Boolean(section.document),
  fields: section.fields.map(([field, label]) => ({ field, label, readOnly: studentProfileReadOnlyFields.has(field), document: studentProfileDocumentFields.has(field), options: studentProfileDropdownOptions[field] || [] }))
}));

exports.getStudentCompleteProfile = async (req, res) => {
  try {
    const colid = Number(req.query.colid);
    const email = String(req.query.email || req.query.user || '').trim();
    if (!colid || !email) return res.status(400).json({ msg: 'College id and user email are required' });
    const user = await User.findOne(studentProfileUserFilter(colid, email)).lean();
    if (!user) return res.status(404).json({ msg: 'Student profile was not found' });
    res.json({ sections: profileSectionsPayload(), values: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateStudentCompleteProfile = async (req, res) => {
  try {
    const colid = Number(req.body.colid);
    const email = String(req.body.email || req.body.user || '').trim();
    if (!colid || !email) return res.status(400).json({ msg: 'College id and user email are required' });
    const values = req.body.values && typeof req.body.values === 'object' ? req.body.values : {};
    const update = {};
    Object.entries(values).forEach(([field, value]) => {
      if (!studentProfileFields.has(field) || studentProfileReadOnlyFields.has(field) || studentProfileDocumentFields.has(field)) return;
      update[field] = cleanValue(value);
    });
    const invalidDropdowns = Object.entries(update)
      .filter(([field, value]) => studentProfileDropdownOptions[field] && value !== '' && !studentProfileDropdownOptions[field].includes(String(value)))
      .map(([field]) => field);
    if (invalidDropdowns.length) return res.status(400).json({ msg: `Invalid dropdown value for: ${invalidDropdowns.join(', ')}` });
    if (update.birthdate) {
      const match = String(update.birthdate).match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (!match) return res.status(400).json({ msg: 'Date of Birth must use DD-MM-YYYY format' });
      const [, day, month, year] = match;
      const birthdate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (birthdate.getUTCFullYear() !== Number(year) || birthdate.getUTCMonth() !== Number(month) - 1 || birthdate.getUTCDate() !== Number(day)) {
        return res.status(400).json({ msg: 'Date of Birth is not a valid calendar date' });
      }
      update.birthdate = birthdate;
    }
    if (!Object.keys(update).length) return res.json({ msg: 'No editable profile values were changed' });
    const user = await User.findOneAndUpdate(studentProfileUserFilter(colid, email), { $set: update }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ msg: 'Student profile was not found' });
    res.json({ msg: 'Profile updated', values: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.uploadStudentProfileDocumentMiddleware = studentProfileUpload.single('file');
exports.uploadStudentProfileDocument = async (req, res) => {
  try {
    const colid = Number(req.body.colid);
    const email = String(req.body.email || req.body.user || '').trim();
    const field = String(req.body.field || '').trim();
    if (!colid || !email || !field) return res.status(400).json({ msg: 'College id, user email and document field are required' });
    if (!studentProfileDocumentFields.has(field)) return res.status(400).json({ msg: 'This field must be updated as a profile value, not as a document' });
    if (!req.file) return res.status(400).json({ msg: 'Select a document to upload' });
    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']);
    if (!allowedExtensions.has(extension)) return res.status(400).json({ msg: 'Upload a PDF, JPG, JPEG, PNG, DOC or DOCX file' });
    if (field === 'photo' && !['.jpg', '.jpeg', '.png'].includes(extension)) return res.status(400).json({ msg: 'Passport size photo must be a JPG, JPEG or PNG file' });
    const user = await User.findOne(studentProfileUserFilter(colid, email));
    if (!user) return res.status(404).json({ msg: 'Student profile was not found' });
    const config = await Awsconfig.findOne({ colid, type: /^aws$/i, default: /^yes$/i }).lean();
    if (!config?.username || !config?.password || !config?.bucket || !config?.region) return res.status(400).json({ msg: 'Default AWS configuration is missing or incomplete' });
    const cleanName = path.basename(req.file.originalname).replace(/[^\w.\-() ]/g, '_');
    const safeEmail = email.replace(/[^\w.-]/g, '_');
    const key = `${colid}/student-profile-documents/${safeEmail}/${field}/${Date.now()}-${cleanName}`;
    const s3 = new AWS.S3({ accessKeyId: config.username, secretAccessKey: config.password, region: config.region });
    await s3.putObject({ Bucket: config.bucket, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }).promise();
    const url = s3Url(config.bucket, config.region, key);
    user[field] = url;
    await user.save();
    res.json({ msg: 'Document uploaded', field, url, filename: cleanName, originalname: req.file.originalname });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
const studentDocumentMappingFields = () => studentProfileSections
  .filter((section) => section.document)
  .flatMap((section) => section.fields)
  .filter(([field]) => studentProfileDocumentFields.has(field))
  .map(([field, label]) => ({ field, label }));

const awsObjectKeyFromReference = (reference, bucket) => {
  const value = String(reference || '').trim();
  if (!value) return '';
  const s3Prefix = `s3://${bucket}/`;
  if (value.toLowerCase().startsWith(s3Prefix.toLowerCase())) return decodeURIComponent(value.slice(s3Prefix.length));
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    const expectedHosts = [`${bucket}.s3.amazonaws.com`, `${bucket}.s3`];
    if (!expectedHosts.some((host) => parsed.hostname === host || parsed.hostname.startsWith(`${host}.`))) {
      throw new Error('URL does not belong to the configured AWS S3 bucket');
    }
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  }
  return value.replace(/^\/+/, '');
};

exports.getStudentDocumentMappingMeta = async (req, res) => {
  try {
    if (!/^all$/i.test(String(req.query.actorrole || '').trim())) return res.status(403).json({ msg: 'Role All access is required' });
    res.json({ fields: studentDocumentMappingFields() });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.bulkMapStudentDocuments = async (req, res) => {
  try {
    if (!/^all$/i.test(String(req.body.actorrole || '').trim())) return res.status(403).json({ msg: 'Role All access is required' });
    const colid = Number(req.body.colid);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!colid) return res.status(400).json({ msg: 'College id is required' });
    if (!items.length) return res.status(400).json({ msg: 'No mapping rows received' });
    const config = await Awsconfig.findOne({ colid, type: /^aws$/i, default: /^yes$/i }).lean();
    if (!config?.username || !config?.password || !config?.bucket || !config?.region) {
      return res.status(400).json({ msg: 'Default AWS configuration is missing or incomplete' });
    }
    const s3 = new AWS.S3({ accessKeyId: config.username, secretAccessKey: config.password, region: config.region });
    const documentFields = studentDocumentMappingFields().map((item) => item.field);
    const errors = [];
    let mapped = 0;

    for (let index = 0; index < items.length; index += 1) {
      const row = items[index] || {};
      const rowNumber = row.rowNumber || index + 2;
      const email = String(row.email || '').trim();
      const regno = String(row.regno || '').trim();
      if (!email && !regno) {
        errors.push({ rowNumber, msg: 'Email or regno is required' });
        continue;
      }
      const values = documentFields.filter((field) => String(row[field] || '').trim());
      if (!values.length) {
        errors.push({ rowNumber, msg: 'At least one document URL or S3 object key is required' });
        continue;
      }
      try {
        const user = await User.findOne({ colid, $or: [...(email ? [{ email }, { user: email }] : []), ...(regno ? [{ regno }] : [])] });
        if (!user) throw new Error('Student not found for the supplied email/regno');
        const update = {};
        for (const field of values) {
          const key = awsObjectKeyFromReference(row[field], config.bucket);
          if (!key) throw new Error(`${field}: invalid S3 object key`);
          await s3.headObject({ Bucket: config.bucket, Key: key }).promise();
          update[field] = s3Url(config.bucket, config.region, key);
        }
        await User.updateOne({ _id: user._id, colid }, { $set: update });
        mapped += 1;
      } catch (err) {
        errors.push({ rowNumber, msg: err.message || 'Unable to map documents' });
      }
    }
    res.json({ mapped, errors });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};