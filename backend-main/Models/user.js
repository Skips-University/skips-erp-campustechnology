const mongoose=require('mongoose');

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required: [true,'Please enter email'],
        unique: true
    },
    name: {
        type: String,
        required: [true,'Please enter name']
    },
    phone: {
        type: String,
        required: [true,'Please enter phone']
    },
    password: {
        type: String,
        required: [true,'Please enter password']
    },
    role: {
        type: String,
        required: [true,'Please enter role']
    },
    regno: {
        type: String,
        required: [true,'Please enter regno']
    },
    scholarnumber: {
        type: String
    },
    abcid: {
        type: String
    },
    program: {
        type: String
    },
    programcode: {
        type: String,
        required: [true,'Please enter program code']
    },
    admissionyear: {
        type: String,
        required: [true,'Please enter admission year']
    },
    academicyear: {
        type: String
    },
    rollno: {
        type: String
    },
    semester: {
        type: String,
        required: [true,'Please enter semester']
    },
    section: {
        type: String,
        required: [true,'Please enter section']
    },
    gender: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    district: {
        type: String
    },
    pincode: {
        type: String
    },
    department: {
        type: String,
        required: [true,'Please enter role']
    },
    designation: {
        type: String
    },
    pan: {
        type: String
    },
    photo: {
        type: String
    },
    guardianname: {
        type: String
    },
    guardianmobile: {
        type: String
    },
    guardianemail: {
        type: String
    },
    expotoken: {
        type: String
    },
    category: {
        type: String
    },
    address: {
        type: String
    },
    quota: {
        type: String
    },
    user: {
        type: String
    },
    addedby: {
        type: String
    },
    status1: {
        type: String
    },
    comments: {
        type: String
    },
    lastlogin: {
        type: Date
    },
    colid: {
        type: Number,
        required: [true,'Please enter colid']
    },
    status: {
        type: Number,
        required: [true,'Please enter status']
    },
    fathername: {
        type: String
    },
    mothername: {
        type: String
    },
    dob: {
        type: String
    },
    birthdate: {
        type: Date
    },
    joiningdate: {
        type: Date
    },
    eligibilityname: {
        type: String
    },
    srno: {
        type: Number
    },
    degree: {
        type: String
    },
    regulation: {
        type: String
    },
    samestate: {
        type: String
    },
    admissionapplicationid: {
        type: String
    },
    Major: {
        type: String
    },
    Minor: {
        type: String
    },
    AEC: {
        type: String
    },
    SEC: {
        type: String
    },
    VAC: {
        type: String
    },
    IDC: {
        type: String
    },
    MDC: {
        type: String
    },
    minorsub: {
        type: String
    },
    vocationalsub: {
        type: String
    },
    mdcsub: {
        type: String
    },
    othersub:{
        type: String
    }, // other subjects means PW/AP/CE Subjects
    merit: {
        type: String
    },
    obtain: {
        type:Number
    },
    bonus: {
        type: Number
    },
    weightage: {
        type: Number
    },
    ncctype: {
        type: String
    },
    isdisabled: {
        type: String
    },
    scholarship:{
        type: String
    },
    skills: {
        type: String
    },
    institution:{
        type: String
    },
    Mediumofinstruction:{
        type: String
    },
    specialization1:{
        type: String
    },
    specialization2:{
        type: String
    },
    profileapprovalstatus:{
        type: String
    },
    profileapprovalcomments:{
        type: String
    },
    // Personal details
    title: { type: String },
    surname: { type: String },
    bloodgroup: { type: String },
    maritalstatus: { type: String },
    spousename: { type: String },
    religion: { type: String },
    aadharcardnumber: { type: String },
    nationality: { type: String },
    nriPio: { type: String },

    // Class 10 and Class 12 details
    class10thBoard: { type: String },
    class10thMedium: { type: String },
    class10thPercentile: { type: String },
    class10thPercentage: { type: String },
    class10thPassingYear: { type: String },
    class12thBoard: { type: String },
    class12thMedium: { type: String },
    class12thPercentile: { type: String },
    class12thPercentage: { type: String },
    class12thPassingYear: { type: String },
    class12thStream: { type: String },

    // Graduation and post-graduation details
    graduationCollege: { type: String },
    graduationUniversity: { type: String },
    graduationCgpa: { type: String },
    graduationSemester1Percentage: { type: String },
    graduationSemester1Sgpa: { type: String },
    graduationSemester2Percentage: { type: String },
    graduationSemester2Sgpa: { type: String },
    graduationSemester3Percentage: { type: String },
    graduationSemester3Sgpa: { type: String },
    graduationSemester4Percentage: { type: String },
    graduationSemester4Sgpa: { type: String },
    graduationSemester5Percentage: { type: String },
    graduationSemester5Sgpa: { type: String },
    graduationSemester6Percentage: { type: String },
    graduationSemester6Sgpa: { type: String },
    graduationSemester7Percentage: { type: String },
    graduationSemester7Sgpa: { type: String },
    graduationSemester8Percentage: { type: String },
    graduationSemester8Sgpa: { type: String },
    graduationPassingYear: { type: String },
    postGraduationDegree: { type: String },
    postGraduationMedium: { type: String },
    postGraduationCollege: { type: String },
    postGraduationUniversity: { type: String },
    postGraduationCgpa: { type: String },
    postGraduationSemester1Percentage: { type: String },
    postGraduationSemester1Sgpa: { type: String },
    postGraduationSemester2Percentage: { type: String },
    postGraduationSemester2Sgpa: { type: String },
    postGraduationSemester3Percentage: { type: String },
    postGraduationSemester3Sgpa: { type: String },
    postGraduationSemester4Percentage: { type: String },
    postGraduationSemester4Sgpa: { type: String },
    postGraduationSemester5Percentage: { type: String },
    postGraduationSemester5Sgpa: { type: String },
    postGraduationSemester6Percentage: { type: String },
    postGraduationSemester6Sgpa: { type: String },
    postGraduationPassingYear: { type: String },
    entranceExamName: { type: String },
    entranceExamPercentage: { type: String },
    entranceExamScore: { type: String },
    entranceExamScoreOutOf: { type: String },
    entranceExamMonthYear: { type: String },

    // Address details not represented by the existing current-address fields
    currentCountry: { type: String },
    permanentAddress: { type: String },
    permanentCity: { type: String },
    permanentState: { type: String },
    permanentPincode: { type: String },
    permanentCountry: { type: String },

    // Document links
    sscCertificateFile: { type: String },
    hscCertificateFile: { type: String },
    graduationSemester1CertificateFile: { type: String },
    graduationSemester2CertificateFile: { type: String },
    graduationSemester3CertificateFile: { type: String },
    graduationSemester4CertificateFile: { type: String },
    graduationSemester5CertificateFile: { type: String },
    graduationSemester6CertificateFile: { type: String },
    graduationSemester7CertificateFile: { type: String },
    graduationSemester8CertificateFile: { type: String },
    graduationDegreeFile: { type: String },
    additionalGraduationCertificateFile1: { type: String },
    additionalGraduationCertificateFile2: { type: String },
    additionalGraduationCertificateFile3: { type: String },
    additionalGraduationCertificateFile4: { type: String },
    additionalGraduationCertificateFile5: { type: String },
    postGraduationSemester1CertificateFile: { type: String },
    postGraduationSemester2CertificateFile: { type: String },
    postGraduationSemester3CertificateFile: { type: String },
    postGraduationSemester4CertificateFile: { type: String },
    postGraduationSemester5CertificateFile: { type: String },
    postGraduationSemester6CertificateFile: { type: String },
    postGraduationDegreeFile: { type: String },
    additionalPostGraduationCertificateFile1: { type: String },
    additionalPostGraduationCertificateFile2: { type: String },
    additionalPostGraduationCertificateFile3: { type: String },
    additionalPostGraduationCertificateFile4: { type: String },
    additionalPostGraduationCertificateFile5: { type: String },
    entranceExamCertificateFile: { type: String },
    aadharCardFile: { type: String },
    professionalCourseCertificateFile: { type: String },
    professionalCourseName: { type: String },
    domicileCertificateFile: { type: String },
    categoryCertificateFile: { type: String },
    disabilityCertificateFile: { type: String },
    workExperienceCertificateFile: { type: String },
    schoolLeavingCertificateFile: { type: String },
    nonCreamyLayerCertificateFile: { type: String },
    abcCertificateFile: { type: String },
    registrationFeesReceiptFile: { type: String },
    firstInstallmentFeesReceiptFile: { type: String },
    thirdInstallmentFeesReceiptFile: { type: String },
    fifthInstallmentFeesReceiptFile: { type: String },

    // Employment, family and other details
    currentEmployerName: { type: String },
    currentEmploymentDuration: { type: String },
    previousEmployerName: { type: String },
    previousEmploymentDuration: { type: String },
    currentSalary: { type: String },
    fatherMobile: { type: String },
    fatherEmail: { type: String },
    motherMobile: { type: String },
    motherEmail: { type: String },
    siblingName1: { type: String },
    siblingName2: { type: String },
    siblingName3: { type: String },
    educationLoan: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    bankAddress: { type: String },
    hasTwoWheeler: { type: String },
    hasDrivingLicense: { type: String },
    requiresHostelFacility: { type: String },
    requiresTransportationFacility: { type: String },
    busPickupLocation: { type: String },
    drivingLicenseNumber: { type: String },
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
})
//
const User=mongoose.model('Users',userschema);

module.exports=User;
