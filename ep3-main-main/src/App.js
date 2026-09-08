import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  EventNewAllocationPage,
  EventNewCrudPage,
  EventNewPublicCertificatePage,
  EventNewPublicFeedbackPage,
  EventNewPublicRegisterPage,
  EventNewReportsPage,
  EventPaperSubmissionPage,
  EventPaperSubmissionReportPage,
  EventNewTransportReportsPage,
  GuestHouseAllocationPage,
  GuestHouseAvailabilityPage,
  GuestHouseReportsPage
} from './pages/EventManagementNewPage';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LearningManagementSystem from './LearningManagementSystem';
import NAAC from './NAAC';
import Reports from './Reports';
import Parct1 from './pages/pract1';
import AddUser from './Crud/Add';
import EditUser from './Crud/Edit';
import DeleteUser from './Crud/Delete';
import ExportUsers from './Crud/Export';
import Viewcourse from './pages/Viewcourse';
import Viewcourse1 from './pages/Viewcourse1';
import Login from './pages/Login';
import Dashmcas11 from './pages/Dashmcas11';

import Dashmncas11 from './pages/Dashmncas11';
import Dashmncas11admin from './pages/Dashmncas11admin';
import Dashmncas12 from './pages/Dashmncas12';
import Dashmncas12admin from './pages/Dashmncas12admin';

import Dashmncas22 from './pages/Dashmncas22';
import Dashmncas22admin from './pages/Dashmncas22admin';
import Dashmncas23 from './pages/Dashmncas23';
import Dashmncas23admin from './pages/Dashmncas23admin';
import Dashmncas241 from './pages/Dashmncas241';
import Dashmncas241admin from './pages/Dashmncas241admin';
import Dashmncas242 from './pages/Dashmncas242';
import Dashmncas242admin from './pages/Dashmncas242admin';
import Dashmncas243 from './pages/Dashmncas243';
import Dashmncas243admin from './pages/Dashmncas243admin';
import Dashmncas251 from './pages/Dashmncas251';
import Dashmncas251admin from './pages/Dashmncas251admin';
import Dashmncas252 from './pages/Dashmncas252';
import Dashmncas252admin from './pages/Dashmncas252admin';
import Dashmncas253 from './pages/Dashmncas253';
import Dashmncas253admin from './pages/Dashmncas253admin';
import Dashmncas26 from './pages/Dashmncas26';
import Dashmncas26admin from './pages/Dashmncas26admin';

import Dashmprojects from './pages/Dashmprojects';
import Dashmprojectsadmin from './pages/Dashmprojectsadmin';

import Dashmpublications from './pages/Dashmpublications';
import Dashmpublicationsadmin from './pages/Dashmpublicationsadmin';
import Dashmpatents from './pages/Dashmpatents';
import Dashmpatentsadmin from './pages/Dashmpatentsadmin';
import Dashmteacherfellow from './pages/Dashmteacherfellow';
import Dashmteacherfellowadmin from './pages/Dashmteacherfellowadmin';
import Dashmconsultancy from './pages/Dashmconsultancy';
import Dashmconsultancyadmin from './pages/Dashmconsultancyadmin';
import Dashmphdguide from './pages/Dashmphdguide';
import Dashmphdguideadmin from './pages/Dashmphdguideadmin';
import Dashmseminar from './pages/Dashmseminar';
import Dashmseminaradmin from './pages/Dashmseminaradmin';
import Dashmbook from './pages/Dashmbook';
import Dashmbookadmin from './pages/Dashmbookadmin';

import Dashmexamschedule from './pages/Dashmexamschedule';
import Dashmexamscheduleadmin from './pages/Dashmexamscheduleadmin';
import Dashmexamroom from './pages/Dashmexamroom';
import Dashmexamroomadmin from './pages/Dashmexamroomadmin';

import Loginstud from './pages/Loginstud';

import Dashmmprograms from './pages/Dashmmprograms';
import Dashmmprogramsadmin from './pages/Dashmmprogramsadmin';
import Dashmmcourses from './pages/Dashmmcourses';
import Dashmmcoursesadmin from './pages/Dashmmcoursesadmin';
import Dashmmstudents from './pages/Dashmmstudents';
import Dashmmstudentsadmin from './pages/Dashmmstudentsadmin';
import Dashmexamtimetable from './pages/Dashmexamtimetable';
import Dashmexamtimetableadmin from './pages/Dashmexamtimetableadmin';

import Dashmmfaccourses from './pages/Dashmmfaccourses';
import Dashmmfaccoursesadmin from './pages/Dashmmfaccoursesadmin';
import Dashmmfaccoursesatt from './pages/Dashmmfaccoursesatt';
import Dashmmfaccoursesattadmin from './pages/Dashmmfaccoursesattadmin';

import Dashmmattcalc from './pages/Dashmmattcalc';
import Dashmmattcalcadmin from './pages/Dashmmattcalcadmin';

import Dashmmcolevels from './pages/Dashmmcolevels';
import Dashmmcolevelsadmin from './pages/Dashmmcolevelsadmin';

import Dashmmcolevelscalc from './pages/Dashmmcolevelscalc';

import Dashmmcourseslist from './pages/Dashmmcourseslist';
import Dashmmcourseslistadmin from './pages/Dashmmcourseslistadmin';

import Dashmmstudents1 from './pages/Dashmmstudents1';
import Dashmmstudents1admin from './pages/Dashmmstudents1admin';

import Dashmclassenr1 from './pages/Dashmclassenr1';
import Dashmclassenr1admin from './pages/Dashmclassenr1admin';

import Dashmclassenr1stud from './pages/Dashmclassenr1stud';

import Dashmmsyllabus from './pages/Dashmmsyllabus';
import Dashmmsyllabusstud from './pages/Dashmmsyllabusstud';
import Dashmmsyllabusadmin from './pages/Dashmmsyllabusadmin';

import Dashmmassignments from './pages/Dashmmassignments';
import Dashmmassignmentsadmin from './pages/Dashmmassignmentsadmin';
import Dashmmanouncements from './pages/Dashmmanouncements';
import Dashmmanouncementsadmin from './pages/Dashmmanouncementsadmin';
import Dashmmcourseco from './pages/Dashmmcourseco';
import Dashmmcoursecoadmin from './pages/Dashmmcoursecoadmin';
import Dashmmcalendar from './pages/Dashmmcalendar';
import Dashmmcalendaradmin from './pages/Dashmmcalendaradmin';
import Dashmmcoursematerial from './pages/Dashmmcoursematerial';
import Dashmmcoursematerialadmin from './pages/Dashmmcoursematerialadmin';

import Dashmmannouncementsstud from './pages/Dashmmannouncementsstud';
import Dashmmassignmentsstud from './pages/Dashmmassignmentsstud';
import Dashmmcalendarstud from './pages/Dashmmcalendarstud';
import Dashmmcoursematerialstud from './pages/Dashmmcoursematerialstud';
import Dashmmcoursecostud from './pages/Dashmmcoursecostud';

import Dashmmassignsubmit from './pages/Dashmmassignsubmit';
import Dashmmassignsubmitadmin from './pages/Dashmmassignsubmitadmin';
import Dashmmdiscussion from './pages/Dashmmdiscussion';
import Dashmmdiscussionadmin from './pages/Dashmmdiscussionadmin';

import Dashmmassignsubmitfac from './pages/Dashmmassignsubmitfac';

import Dashmquotanew from './pages/Dashmquotanew';
import Dashmquotanewadmin from './pages/Dashmquotanewadmin';

// import Resistor from './pages/Resistor';
// import Bubblesort from './pages/BubbleSort';
// import Firstsimulator from './pages/FirstSimulator';
// import SecondSimulator from './pages/SecondSimulator';

import Dashmclassnew from './pages/Dashmclassnew';
import Dashmclassnewadmin from './pages/Dashmclassnewadmin';
import Dashmattendancenew from './pages/Dashmattendancenew';
import Dashmattendancenewadmin from './pages/Dashmattendancenewadmin';

import SubHalfAdder1 from './pages/SubHalfAdder1';
import BasicLogicGateExpFirst from './pages/BasicLogicGateExpFirst';
import BasicLogicGateExpSecond from './pages/BasicLogicGateExpSecond';
import HalfSubtractor from './pages/HalfSubtractor';
import FullSubtractor from './pages/FullSubtractor';
import TwoBitAdder from './pages/TwoBitAdder';

import Dashmattccode from './pages/Dashmattccode';
import Dashmattpcode from './pages/Dashmattpcode';
import Dashmclassnewc from './pages/Dashmclassnewc';

import Dashmclassnewstud from './pages/Dashmclassnewstud';
import FourBitAdderSubtractor from './pages/FourBitAdderSubtractor';

import Dashmstudawardsnew from './pages/Dashmstudawardsnew';
import Dashmstudawardsnewadmin from './pages/Dashmstudawardsnewadmin';
import Dashmscholnew from './pages/Dashmscholnew';
import Dashmscholnewadmin from './pages/Dashmscholnewadmin';
import Dashmscholnewstud from './pages/Dashmscholnewstud';
import Dashmstudawardsnewstud from './pages/Dashmstudawardsnewstud';

import Dashmslideshow from './pages/Dashmslideshow';
import Dashmslideshowadmin from './pages/Dashmslideshowadmin';

import Dashmeventsnew1 from './pages/Dashmeventsnew1';
import Dashmeventsnew1admin from './pages/Dashmeventsnew1admin';
import Dashmpolicy from './pages/Dashmpolicy';

import Dashmqualitative from './pages/Dashmqualitative';

import Dashmtestnew from './pages/Dashmtestnew';
import Dashmtestnewadmin from './pages/Dashmtestnewadmin';
import Dashmtestq from './pages/Dashmtestq';
import Dashmtestqadmin from './pages/Dashmtestqadmin';
import Dashmtesto from './pages/Dashmtesto';
import Dashmtestoadmin from './pages/Dashmtestoadmin';

import CharacterizationOfDigitalLogic from './pages/CharacterizationOfDigitalLogic';

import InsertionSort from './pages/InsertionSort';
import SelectionSort from './pages/SelectionSort';

import Dashmtestnewstud from './pages/Dashmtestnewstud';

import StackVisualization from './pages/StackVisualization';
import ArrayVisualization from './pages/ArrayVisualization';
import BinaryArithmeticSimulation from './pages/BinaryArithmeticSimulation';

import QueueVisualization from './pages/QueueVisualization';
import BinarySearch from './pages/BinarySearch';
import BinaryArithmeticS from './pages/BinaryArithmeticS';

import NOTGate from './pages/NOTGate';
import NOTGate2 from './pages/NOTGate2';
import ANDGate from './pages/ANDGate';
import ANDGate2 from './pages/ANDGate2';
import ORGate from './pages/ORGate';
import ORGate2 from './pages/ORGate2';

import Dashmtestqstud from './pages/Dashmtestqstud';

import NANDGate from './pages/NANDGate';
import NANDGate2 from './pages/NANDGate2';
import NORGate from './pages/NORGate';
import NORGate2 from './pages/NORGate2';

import Dashmgeotagtest from './pages/Dashmgeotagtest';

import XORGate from './pages/XORGate';
import HalfSubtractorCircuit from './pages/HalfSubtractorCircuit';

import XNORGate from './pages/XNORGate';
import XNORGate2 from './pages/XNORGate2';
import XORGate2 from './pages/XORGate2';

import FullSubCircuitVerify from './pages/FullSubCircuitVerify';
import FullSubtractorCircuit from './pages/FullSubtractorCircuit';
import HalfSubCircuitVerify from './pages/HalfSubCircuitVerify';

import VideoPage from './pages/VideoPage';

import CodeEditor from './pages/CodeEditor';
import BCDToExcessConverter from './pages/BCDToExcessConverter';
import BitSerial from './pages/BitSerial';
import GrayToBinaryConverter from './pages/GrayToBinaryConverter';

import Dashmlmsvideos from './pages/Dashmlmsvideos';
import Dashmlmsvideosadmin from './pages/Dashmlmsvideosadmin';
import Dashmlmsvideosc from './pages/Dashmlmsvideosc';
import Dashmlmsvideoscadmin from './pages/Dashmlmsvideoscadmin';

import VideoPage2 from './pages/VideoPage2';
import Videopagepre from './pages/Videopagepre';
import Videopage3 from './pages/Videopage3';
import Videopage31 from './pages/Videopage31';

import Videopagepreshare from './pages/Videopagepreshare';

import Dashmhtmleditor from './pages/Dashmhtmleditor';

import Circulareventsm from './pages/Circulareventsm';

import CampusWebsite from './pages/CampusWebsite';
import OrthintelHomepage from './pages/OrthintelHomepage';

import SignupPage from './pages/SignupPage';
import Signinpage from './pages/Signinpage';

import Dashmmvac from './pages/Dashmmvac';
import Dashmmvacadmin from './pages/Dashmmvacadmin';

import Dashawsconfig from './pages/Dashawsconfig';
import AwsConfigCrudPage from './pages/AwsConfigCrudPage';
import AwsFileLibraryPage from './pages/AwsFileLibraryPage';
import AwsDocumentsPage from './pages/AwsDocumentsPage';
import InstitutionPolicyPage from './pages/InstitutionPolicyPage';

import Dashmtestscoreall from './pages/Dashmtestscoreall';
import StefansLaw from './pages/StefansLaw';
import Videopage32 from './pages/Videopage32';
import Videopage32a from './pages/Videopage32a';
import PhaseSequenceSynchronous from './pages/PhaseSequenceSynchronous';

import OpticalFibre from './pages/OpticalFibre';
import TransformerOilStrength from './pages/TransformerOilStrength';

import Dashmpassword from './pages/Dashmpassword';
import Dashmpasswordstud from './pages/Dashmpasswordstud';


import Dashmlpublications from './pages/Dashmlpublications';
import Dashmlpublicationsadmin from './pages/Dashmlpublicationsadmin';
import Dashmlpubeditions from './pages/Dashmlpubeditions';
import Dashmlpubeditionsadmin from './pages/Dashmlpubeditionsadmin';
import Dashmlpubreviews from './pages/Dashmlpubreviews';
import Dashmlpubreviewsadmin from './pages/Dashmlpubreviewsadmin';
import Dashmlpubarticles from './pages/Dashmlpubarticles';
import Dashmlpubarticlesadmin from './pages/Dashmlpubarticlesadmin';

import Dashmlpublicationspublic from './pages/Dashmlpublicationspublic';
import Dashmlpubeditionspublic from './pages/Dashmlpubeditionspublic';

import DigitalTriradii from './pages/DigitalTriradii';
import FingerPrintPatterns from './pages/FingerPrintPatterns';

import DCShuntMotorSimulation from './pages/DCShuntMotorSimulation';
import SkeletonExp from './pages/SkeletonExp';

import Titration from './pages/Titration';
import SkeletonExpPart2 from './pages/SkeletonExpPart2';
import InfraRedSpectros from './pages/InfraRedSpectros';

import SkeletonExpPart2Game from './pages/SkeletonExpPart2Game';
import GetMoldGame from './pages/GetMoldGame';
import OpticalFibreGame from './pages/OpticalFibreGame';
import DigitalTriradiiGame from './pages/DigitalTriradiiGame';

import TransformerOilStrengthGame from './pages/TransformerOilStrengthGame';
import TitrationGame from './pages/TitrationGame';
import InfraRedSpectrosGame from './pages/InfraRedSpectrosGame';
import Dashmmplacement from './pages/Dashmmplacement';
import Dashmmplacementadmin from './pages/Dashmmplacementadmin';

import Dashmmassets from './pages/Dashmmassets';
import Dashmmassetsadmin from './pages/Dashmmassetsadmin';
import Dashmmassetassign from './pages/Dashmmassetassign';
import Dashmmassetassignadmin from './pages/Dashmmassetassignadmin';
import Dashmmvendors from './pages/Dashmmvendors';
import Dashmmvendorsadmin from './pages/Dashmmvendorsadmin';
import Dashmmvendorbanks from './pages/Dashmmvendorbanks';
import Dashmmvendorbanksadmin from './pages/Dashmmvendorbanksadmin';
import Dashmmpurchase from './pages/Dashmmpurchase';
import Dashmmpurchaseadmin from './pages/Dashmmpurchaseadmin';
import Dashmmpurchaseitems from './pages/Dashmmpurchaseitems';
import Dashmmpurchaseitemsadmin from './pages/Dashmmpurchaseitemsadmin';
import Dashmmpopayments from './pages/Dashmmpopayments';
import Dashmmpopaymentsadmin from './pages/Dashmmpopaymentsadmin';

import BCDToExcessConverterGame from './pages/BCDToExcessConverterGame';
// import BinaryToGrayConverterGame from './pages/BinaryToGrayConverterGame';
// import DCShuntMotorSimulationGame from './pages/DCShuntMotorSimulationGame';
import FullSubCircuitVerifyGame from './pages/FullSubCircuitVerifyGame';
import FullSubtractorCircuitGame from './pages/FullSubtractorCircuitGame';
import GrayToBinaryConverterGame from './pages/GrayToBinaryConverterGame';
import HalfSubCircuitVerifyGame from './pages/HalfSubCircuitVerifyGame';
import HalfSubtractorCircuitGame from './pages/HalfSubtractorCircuitGame';

import ANDGateGame from './pages/ANDGateGame';
import BitSerialGame from './pages/BitSerialGame';
import FingerPrintPatternsGame from './pages/FingerPrintPatternsGame';
import NANDGateGame from './pages/NANDGateGame';
import NORGateGame from './pages/NORGateGame';

import NOTGateGame from './pages/NOTGateGame.js';
// import OpticalFibreGame from './pages/OpticalFibreGame.js';
import ORGateGame from './pages/ORGateGame.js';
// import ResistorGame from './pages/ResistorGame.js';
import SkeletonExpGame from './pages/SkeletonExpGame.js';
// import SkeletonExpPart2Game from './pages/SkeletonExpPart2Game.js';
import StefansLawGame from './pages/StefansLawGame.js';
import SubHalfAdder1Game from './pages/SubHalfAdder1Game.js';
import XNORGateGame from './pages/XNORGateGame.js';
import XORGateGame from './pages/XORGateGame.js';

import Dashmstudgender from './pages/Dashmstudgender.js';
import Dashmstudcategory from './pages/Dashmstudcategory.js';
import Dashmstudquota from './pages/Dashmstudquota.js';

import FindDiff from './pages/FindDiff.js';
import RaceGame from './pages/RaceGame.js';
import WordGuessing from './pages/WordGuessing.js';
import ImgPuzzle from './pages/ImgPuzzle.js';
import PacManGame from './pages/PacMan.js';
import BetterAimGame2 from './pages/BatterAim.js';

import TetrisGame from './pages/TetrisGame.js';
// import DiceGame from './pages/DiceGame.js';
import SudokuGame from './pages/SudokuGame.js';
import TowerOfHanoi from './pages/TowerOfHanoi.js';
import UltimateBattleGame from './pages/UltimateBattleGame.js';
// import MazeGen from './pages/MazeGen.js';

import Dashmmtestnewm from './pages/Dashmmtestnewm';
import Dashmmtestnewmadmin from './pages/Dashmmtestnewmadmin';
import Dashmmtestseenrol from './pages/Dashmmtestseenrol';
import Dashmmtestseenroladmin from './pages/Dashmmtestseenroladmin';
import Dashmmtestsections from './pages/Dashmmtestsections';
import Dashmmtestsectionsadmin from './pages/Dashmmtestsectionsadmin';
import Dashmmtestqnew from './pages/Dashmmtestqnew';
import Dashmmtestqnewadmin from './pages/Dashmmtestqnewadmin';
import Dashmmtestsessions from './pages/Dashmmtestsessions';
import Dashmmtestsessionsadmin from './pages/Dashmmtestsessionsadmin';

import Dashmmtestsections1 from './pages/Dashmmtestsections1';
import Dashmmtestsections1admin from './pages/Dashmmtestsections1admin';

import Dashmmtestseenrol1 from './pages/Dashmmtestseenrol1';
import Dashmmtestseenrol1admin from './pages/Dashmmtestseenrol1admin';

import CampusTalent from './pages/CampusTalent';

import Dashmtestscorenew from './pages/Dashmtestscorenew.js';

import Dashmmguides from './pages/Dashmmguides';
import Dashmmguidesadmin from './pages/Dashmmguidesadmin';
import Dashmmctalentreg from './pages/Dashmmctalentreg';
import Dashmmctalentregadmin from './pages/Dashmmctalentregadmin';
import Dashmmtestqnewcs from './pages/Dashmmtestqnewcs';
import Dashmmtestqnewcsadmin from './pages/Dashmmtestqnewcsadmin';

import CampusTalentRegister from './pages/CampusTalentRegister';
import CampusTalent1 from './pages/CampusTalent1.js';

import Dashmonlinepay from './pages/Dashmonlinepay';
import Dashmonlinepayadmin from './pages/Dashmonlinepayadmin';

import CampusTalentRegister1 from './pages/CampusTalentRegister1';

import Signinpay from './pages/Signinpay';
import Forgotpassword from './pages/Forgotpassword';

import Dashmtestscoresnewall from './pages/Dashmtestscoresnewall';

import Deleteaccount from './pages/Deleteaccount';

import Viewmreactflow1 from './pages/Viewmreactflow1';
import Dashmreactflow1 from './pages/Dashmreactflow1';


import Dashmmindmaplist from './pages/Dashmmindmaplist';
import Dashmmindmaplistadmin from './pages/Dashmmindmaplistadmin';
import Dashmmindmapedges from './pages/Dashmmindmapedges';
import Dashmmindmapedgesadmin from './pages/Dashmmindmapedgesadmin';
import Dashmmindmapnodes from './pages/Dashmmindmapnodes';
import Dashmmindmapnodesadmin from './pages/Dashmmindmapnodesadmin';

import Viewmindmap from './pages/Viewmindmap';
import Viewmindmap1 from './pages/Viewmindmap1';
import Viewmindmap2 from './pages/Viewmindmap2';


import Dashmminewm from './pages/Dashmminewm';
import Dashmminewmadmin from './pages/Dashmminewmadmin';
import Dashmmisessions from './pages/Dashmmisessions';
import Dashmmisessionsadmin from './pages/Dashmmisessionsadmin';
import Dashmmiseenrol1 from './pages/Dashmmiseenrol1';
import Dashmmiseenrol1admin from './pages/Dashmmiseenrol1admin';
import Dashmmisections1 from './pages/Dashmmisections1';
import Dashmmisections1admin from './pages/Dashmmisections1admin';
import Dashmmiqnew from './pages/Dashmmiqnew';
import Dashmmiqnewadmin from './pages/Dashmmiqnewadmin';

import Dashmmiscorenew from './pages/Dashmmiscorenew';

import Viewmallclients from './pages/Viewmallclients';
import Viewmusers from './pages/Viewmusers';
import Viewminterns from './pages/Viewminterns';

import Dashmbmou from './pages/Dashmbmou';
import Dashmbmouadmin from './pages/Dashmbmouadmin';

import Dashmbtrialb from './pages/Dashmbtrialb';
import Dashmbtrialbadmin from './pages/Dashmbtrialbadmin';
import Dashmstudlist from './pages/Dashmstudlist';
import Dashmstudlistadmin from './pages/Dashmstudlistadmin';
import Dashmbfacyear from './pages/Dashmbfacyear';
import Dashmbfacyearadmin from './pages/Dashmbfacyearadmin';

import Viewmpricing from './pages/Viewmpricing';

import CampusPricing from './pages/CampusPricing';

import SignupAdmin from './pages/SignupAdmin';

import Internall from './pages/Internall';

import Internselect from './pages/Internselect';
import Courseall from './pages/Courseall';


import stest2 from './pages/stest2';

import SeedTest1 from './pages/SeedTest1';
import AcademicAuditInfo from './pages/AcademicAuditInfo';
import AAaudit from './pages/AAaudit';
import GreenAudit from './pages/GreenAudit';

import Dashtest1 from './pages/Dashtest1';

import Dashmnn11 from './pages/Dashmnn11';
import Dashmnn11admin from './pages/Dashmnn11admin';
import Dashmnn12 from './pages/Dashmnn12';
import Dashmnn12admin from './pages/Dashmnn12admin';
import Dashmnn14 from './pages/Dashmnn14';
import Dashmnn14admin from './pages/Dashmnn14admin';
import Dashmnn15 from './pages/Dashmnn15';
import Dashmnn15admin from './pages/Dashmnn15admin';
import Dashmnn17 from './pages/Dashmnn17';
import Dashmnn17admin from './pages/Dashmnn17admin';
import Dashmnn16 from './pages/Dashmnn16';
import Dashmnn16admin from './pages/Dashmnn16admin';


import Dashmnn211a from './pages/Dashmnn211a';
import Dashmnn211aadmin from './pages/Dashmnn211aadmin';
import Dashmnn211b from './pages/Dashmnn211b';
import Dashmnn211badmin from './pages/Dashmnn211badmin';
import Dashmnn23 from './pages/Dashmnn23';
import Dashmnn23admin from './pages/Dashmnn23admin';
import Dashmnn22 from './pages/Dashmnn22';
import Dashmnn22admin from './pages/Dashmnn22admin';
import Dashmnn244 from './pages/Dashmnn244';
import Dashmnn244admin from './pages/Dashmnn244admin';
import Dashmnn26 from './pages/Dashmnn26';
import Dashmnn26admin from './pages/Dashmnn26admin';
import Dashmnn25 from './pages/Dashmnn25';
import Dashmnn25admin from './pages/Dashmnn25admin';
import Dashmnn31 from './pages/Dashmnn31';
import Dashmnn31admin from './pages/Dashmnn31admin';
import Dashmnn32 from './pages/Dashmnn32';
import Dashmnn32admin from './pages/Dashmnn32admin';

import Dashmnn33a from './pages/Dashmnn33a';
import Dashmnn33aadmin from './pages/Dashmnn33aadmin';
import Dashmnn33b from './pages/Dashmnn33b';
import Dashmnn33badmin from './pages/Dashmnn33badmin';
import Dashmnn35 from './pages/Dashmnn35';
import Dashmnn35admin from './pages/Dashmnn35admin';
import Dashmnn36 from './pages/Dashmnn36';
import Dashmnn36admin from './pages/Dashmnn36admin';
import Dashmnn46 from './pages/Dashmnn46';
import Dashmnn46admin from './pages/Dashmnn46admin';

import Dashmnn51 from './pages/Dashmnn51';
import Dashmnn51admin from './pages/Dashmnn51admin';
import Dashmnn52 from './pages/Dashmnn52';
import Dashmnn52admin from './pages/Dashmnn52admin';
import Dashmnn53examdays from './pages/Dashmnn53examdays';
import Dashmnn53examdaysadmin from './pages/Dashmnn53examdaysadmin';
import Dashmnn53passp from './pages/Dashmnn53passp';
import Dashmnn53passpadmin from './pages/Dashmnn53passpadmin';
import Dashmnn53obe from './pages/Dashmnn53obe';
import Dashmnn53obeadmin from './pages/Dashmnn53obeadmin';
import Dashmnn54 from './pages/Dashmnn54';
import Dashmnn54admin from './pages/Dashmnn54admin';
import Dashmnn55 from './pages/Dashmnn55';
import Dashmnn55admin from './pages/Dashmnn55admin';
import Dashmnn56 from './pages/Dashmnn56';
import Dashmnn56admin from './pages/Dashmnn56admin';

import Dashmnallaccr from './pages/Dashmnallaccr';
import Dashmnallaccradmin from './pages/Dashmnallaccradmin';

import Dashmqualall from './pages/Dashmqualall';

import ElectricalMachineLab from './pages/ElectricalMachineLab';

import Dashmnallaccrans from './pages/Dashmnallaccrans';
import Dashmnallaccransadmin from './pages/Dashmnallaccransadmin';

import Dashmnn61 from './pages/Dashmnn61';
import Dashmnn61admin from './pages/Dashmnn61admin';
import Dashmnn62 from './pages/Dashmnn62';
import Dashmnn62admin from './pages/Dashmnn62admin';
import Dashmnn6clubs from './pages/Dashmnn6clubs';
import Dashmnn6clubsadmin from './pages/Dashmnn6clubsadmin';

import Dashmnn76 from './pages/Dashmnn76';
import Dashmnn76admin from './pages/Dashmnn76admin';
import Dashmnn781 from './pages/Dashmnn781';
import Dashmnn781admin from './pages/Dashmnn781admin';
import Dashmnn82 from './pages/Dashmnn82';
import Dashmnn82admin from './pages/Dashmnn82admin';
import Dashmnn84 from './pages/Dashmnn84';
import Dashmnn84admin from './pages/Dashmnn84admin';
import Dashmnn83 from './pages/Dashmnn83';
import Dashmnn83admin from './pages/Dashmnn83admin';
import Dashmnn86 from './pages/Dashmnn86';
import Dashmnn86admin from './pages/Dashmnn86admin';
import Dashmnn87 from './pages/Dashmnn87';
import Dashmnn87admin from './pages/Dashmnn87admin';
import Dashmnn96 from './pages/Dashmnn96';
import Dashmnn96admin from './pages/Dashmnn96admin';
import Dashmnn98 from './pages/Dashmnn98';
import Dashmnn98admin from './pages/Dashmnn98admin';
import Dashmnn97 from './pages/Dashmnn97';
import Dashmnn97admin from './pages/Dashmnn97admin';

import Dashmmfaccoursesatto from './pages/Dashmmfaccoursesatto';

import Dashmattyear from './pages/Dashmattyear';
import Dashmattyearadmin from './pages/Dashmattyearadmin';

import Dashmngroup from './pages/Dashmngroup';
import Dashmngroupadmin from './pages/Dashmngroupadmin';
import Dashmngrouppages from './pages/Dashmngrouppages';
import Dashmngrouppagesadmin from './pages/Dashmngrouppagesadmin';
import Dashmngroupaccr from './pages/Dashmngroupaccr';
import Dashmngroupaccradmin from './pages/Dashmngroupaccradmin';

import Dashmnallaccrgroup from './pages/Dashmnallaccrgroup';

import Dashmmstudentprofile from './pages/Dashmmstudentprofile';

import Dashmtimeslotsn from './pages/Dashmtimeslotsn';
import Dashmtimeslotsnadmin from './pages/Dashmtimeslotsnadmin';
import Dashmworkloadn from './pages/Dashmworkloadn';
import Dashmworkloadnadmin from './pages/Dashmworkloadnadmin';

import Dashmtimeslotsn1 from './pages/Dashmtimeslotsn1';
import Dashmtimeslotsn1admin from './pages/Dashmtimeslotsn1admin';
import Dashmworkloadn1 from './pages/Dashmworkloadn1';
import Dashmworkloadn1admin from './pages/Dashmworkloadn1admin';

import Dashmfacwcal from './pages/Dashmfacwcal';
import Dashmfacwcaladmin from './pages/Dashmfacwcaladmin';


import AdmissionTemplate1 from "./pages/forms/AdmissionTemplate1";
import AdmissionTemplate2 from "./pages/forms/AdmissionTemplate2";
import AdmissionTemplate3 from "./pages/forms/AdmissionTemplate3";
import AdmissionTemplate4 from "./pages/forms/AdmissionTemplate4";
import Success from "./pages/Success";

import Dashmadmission from "./pages/Dashmadmission";

import Dashmappmodel2 from './pages/Dashmappmodel2';
import Dashmappmodel2cat from './pages/Dashmappmodel2cat';

import Dashmask1 from './pages/Dashmask1';

import IDCardManager from './pages/IdCardManeger';
import IdCardTemplatePage from './pages/IdCardTemplatePage';
import IdCardGeneratePage from './pages/IdCardGeneratePage';

import CertificateGenerator from './pages/CertificatesGenerator';


import ExamApplication from './pages/ExamApplication';
import AdminDashboard from './pages/AdminDashboard';
import AdmitCardTemplate from './pages/AdmitCardTemplate';
import ReleaseAdmitCard from './pages/ReleaseAdmitCard';
import DownloadAdmitCard from './pages/DownloadAdmitCard';

import Dashapplyadmitstud from './pages/Dashapplyadmitstud';

import Dashmexamadmit from './pages/Dashmexamadmit';
import Dashmexamadmitadmin from './pages/Dashmexamadmitadmin';
import Dashmfees from './pages/Dashmfees';
import Dashmfeesadmin from './pages/Dashmfeesadmin';
import Dashmledgerstud from './pages/Dashmledgerstud';
import Dashmledgerstudadmin from './pages/Dashmledgerstudadmin';

import Dashmexamadmitstud from './pages/Dashmexamadmitstud';
import Dashmledgerstudstud from './pages/Dashmledgerstudstud';


import DashmUser from './pages/DashmUser';
import DashmUseradmin from './pages/DashmUseradmin';



import CreateLibraryForm from './pages/CreateLibraryForm';
import AdminLibrariesPage from './pages/AdminLibrariesPage';
import LibraryBooksPage from './pages/LibraryBooksPage';
import IssuedBooksPage from './pages/IssuedBookPage';
import LibraryReportPage from './pages/LibraryReportPage';

import Dashlibraryform from './pages/Dashlibraryform';

import Dashadmitdownload from './pages/Dashadmitdownload';

import Studadmitcard from './pages/Studadmitcard';

import HostelBuildingPage from './pages/HostelBuildingPage';
import HostelRoomPage from './pages/HostelRoomPage';

import ApplicationReviewPage from './pages/ApplicationReviewPage';
import DetailedApplicationPage from './pages/DetailedApplicationPage';

import Dashnirfplacement from './pages/Dashnirfplacement';


import TaskManagerPage from './pages/TaskManagerPage';

import Dashinterncomplete from './pages/Dashinterncomplete';

import Dashworkloadn1faculty from './pages/Dashworkloadn1faculty';

import Dashmexammarksall from './pages/Dashmexammarksall';
import Dashmexammarksalladmin from './pages/Dashmexammarksalladmin';

import Dashmarksheet from './pages/Dashmarksheet';

import Studmarksheet from './pages/Studmarksheet';

import Studbonafide from './pages/Studbonafide';
import Studadmission from './pages/Studadmission';

import Report2 from './pages/Report2';
import EventReport from './pages/EventReport';

import Dashalerts from './pages/Dashalerts';

import SetupPage from './pages/SetupPage';
import Dashleavesetup from './pages/Dashleavesetup';
import LeavesPage from './pages/LeavesPage';
import NavigatetoPages from './pages/NavigatetoPages';


import TaskCreatorPage from './pages/TaskCreatorPage';
import TaskAssignToMePage from './pages/TaskAssignToMePage';
import ApproverTasksPage from './pages/ApproverTaskPage';


import FormPage from "./pages/FormPage";
import ResponsePage from "./pages/ResponsePage";
import FillForm from "./pages/FillForm";


import EventsListPage from './pages/EventListPage';
import EventRegisterPage from './pages/EventRegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import ApproveSpeakersPage from './pages/ApproveSpeakersPage';
import EventRegisterPage1 from './pages/EventRegisterationPage1';
import EventsListPage1 from './pages/EventListPage1';

import Dasheventlistpage from './pages/Dasheventlistpage';
import Dashapprovespeakers from './pages/Dashapprovespeakers';


import JobManagerPage from "./pages/JobManagerPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import StudentCVPage from "./pages/StudentCVPage";
import JobApplicationDetailsPage from "./pages/JobApplicationDetailsPage";

import Dashmcompany from "./pages/Dashmcompany";
import Signinpagecompany from "./pages/Signinpagecompany";

import Dashmjobds from './pages/Dashmjobds';
import Dashmjobdsadmin from './pages/Dashmjobdsadmin';
import Dashmjobapplicationds from './pages/Dashmjobapplicationds';
import Dashmjobapplicationdsadmin from './pages/Dashmjobapplicationdsadmin';


import Dashpsectorreport from './pages/Dashpsectorreport';

import Dashpappplaced from './pages/Dashpappplaced';

import Dashmplaced from './pages/Dashmplaced';

import InternalApplicationStatusPage from "./pages/InternalApplicationStatusPage";
import JobApplicationInternalDetailsPage from "./pages/JobApplicationInternalDetailsPage";
import JobManagerInternalPage from "./pages/JobManagerInternalPage";
import JobApplicationInternalPage from "./pages/JobApplicationInternalPage";

import AllCVPage from "./pages/AllCVPage";

import RoutePage from './pages/RoutePage';
import BusPage from './pages/BusPage';
import BusDetailPage from './pages/BusDetailPage';


import DetailedView from "./pages/DetailedView";
import FinalizeData from "./pages/FinalizeData";
import RubricExamPage from "./pages/RubricExamPage";

import StudentProfile from "./pages/StudentProfile";

import StudentProfile1 from "./pages/StudentProfile1";
import Dashstudprofileall from "./pages/Dashstudprofileall";

import Dashmroles from "./pages/Dashmroles";

import ClassManagement from "./pages/ClassManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import EnrollmentManagement from "./pages/EnrollmentManagement";


import Dashmlessonplannew from './pages/Dashmlessonplannew';
import Dashmlessonplannewadmin from './pages/Dashmlessonplannewadmin';

import Dashmserbplan from './pages/Dashmserbplan';
import Dashmserbplanadmin from './pages/Dashmserbplanadmin';

import Dashmserb from './pages/Dashmserb';

import FeedbackManagement from "./pages/FeedbackManagement";
import CreateFeedback from "./pages/CreateFeedback";
import FeedbackFillResponse from "./pages/FeedbackFillResponse";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import FeedbackResponses from "./pages/FeedbackResponses";

import FeedbackInternalManagement from "./pages/FeedbackInternalManagement";
import CreateFeedbackInternal from "./pages/CreateFeedbackInternal";
import FeedbackInternalResponse from "./pages/FeedbackInternalResponse";
import FeedbackInternalAnalytics from "./pages/FeedbackInternalAnalytics";
import FeedbackInternalResponses from "./pages/FeedbackInternalResponses";


import FeedbackInternalManagement1 from './pages/FeedbackInternalManagement1';
import CreateFeedbackInternal1 from './pages/CreateFeedbackInternal1';
import FeedbackInternalResponse1 from './pages/FeedbackInternalResponse1';
import FeedbackInternalResponses1 from './pages/FeedbackInternalResponses1';
import FeedbackInternalAnalytics1 from './pages/FeedbackInternalAnalytics1';
import FeedbackAdvancedPage, { FeedbackAdvancedPublicPage } from "./pages/FeedbackAdvancedPage";


import DetailedView1 from "./pages/DetailedView1";
import FinalizeData1 from "./pages/FinalizeData1";
import RubricExamPage1 from "./pages/RubricExamPage1";

import Dashmmcoatt from "./pages/Dashmmcoatt";

import BreakoutRoomManagement from "./pages/BreakoutRoomManagement";
import StudentBreakoutRoom from "./pages/StudentBreakoutRoom";
import StudentClassView from "./pages/StudentClassView";
import ClassManagement1 from "./pages/ClassManagement1";


import FacultyDashboardds from './pages/FacultyDashboardds';


import Dashdashfacnew from './pages/Dashdashfacnew';


import FacultyTopicPage1ds from "./pages/FacultyTopicPage1ds";
import StudentTopicPage1ds from "./pages/StudentTopicPage1ds";
import DiscussionPostsPage1ds from "./pages/DiscussionPostsPage1ds";
import TopicCategoryPage1ds from "./pages/TopicCategoryPage1ds";


import FacultyTopicPageds from "./pages/FacultyTopicPageds";
import StudentTopicPageds from "./pages/StudentTopicPageds";
import DiscussionPostsPageds from "./pages/DiscussionPostsPageds";

import AttendanceApp from "./AttendanceApp";
import ClassManagementn from "./pages/ClassManagementn";

import Dashboardj from './pages/dashboardj';
import IpManagementPagej from './pages/ipaddressj';

import AttendancePagej from './pages/attendancej';
import AttendanceCalendarj from './pages/allattendancej';
import AttendanceByEmailj from './pages/attendancebyemailj';
import SalaryPagej from './pages/salaryj'; 
import SalarySearchj from './pages/salarybysearchj';

import SalarySlipj from './pages/salaryslipj';
import Deductionj from './pages/deductionj';

import Dashmmacadcal from './pages/Dashmmacadcal';
import Dashmmacadcaladmin from './pages/Dashmmacadcaladmin';
import Dashmmfeescol from './pages/Dashmmfeescol';
import Dashmmfeescoladmin from './pages/Dashmmfeescoladmin';

import Dashmmfeescolbydate from './pages/Dashmmfeescolbydate';
import Dashfeescolaggr from './pages/Dashfeescolaggr';

import PaymentReceipt from './pages/PaymentReceipt';

import Dashmfeespay from './pages/Dashmfeespay';

import Dashchattest from './pages/Dashchattest';

import GenerateInstituteCode from "./pages/GenerateInstituteCode";

import Dashmmjournal1 from './pages/Dashmmjournal1';
import Dashmmjournal1admin from './pages/Dashmmjournal1admin';
import Dashmmtrialbalance1 from './pages/Dashmmtrialbalance1';
import Dashmmtrialbalance1admin from './pages/Dashmmtrialbalance1admin';

// import AccountGroupPage from "./pages/AccountGroupPage";
// import AccountdsPage from "./pages/AccountdsPage";
import Mjournal1Page from "./pages/Mjournal1Page";
// import BulkUploadPage from "./pages/BulkUploadPage";
import Mjournal1ReportPage from "./pages/Mjournal1ReportPage";


import Dashmmjournal2 from './pages/Dashmmjournal2';
import Dashmmjournal2admin from './pages/Dashmmjournal2admin';
import Dashmmtrialbalance2 from './pages/Dashmmtrialbalance2';
import Dashmmtrialbalance2admin from './pages/Dashmmtrialbalance2admin';


import AccountGroupPage from "./pages/AccountGroupPage";
import AccountdsPage from "./pages/AccountdsPage";
import Mjournal2Page from "./pages/Mjournal2Page";
import BulkUploadPage from "./pages/BulkUploadPage";
import Mjournal2ReportPage from "./pages/Mjournal2ReportPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import BalanceSheetPage from "./pages/BalanceSheetPage"; 
import {
  FeesChequeReconciliationPage,
  FinanceAccountGroupNewPage,
  FinanceAccountNewPage,
  JournalEntryNewPage,
  PaymentVoucherPage
} from "./pages/FinanceNewPages";

import Dashmmtradingaccount from './pages/Dashmmtradingaccount';
import Dashmmtradingaccountadmin from './pages/Dashmmtradingaccountadmin';
import Dashmmplaccount from './pages/Dashmmplaccount';
import Dashmmplaccountadmin from './pages/Dashmmplaccountadmin';
import Dashmmbalancesheet from './pages/Dashmmbalancesheet';
import Dashmmbalancesheetadmin from './pages/Dashmmbalancesheetadmin';


import Dashmmtradinggenerate from './pages/Dashmmtradinggenerate';

import AttendanceNavigation from "./pages/AttendanceNavigation";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendanceRecords from "./pages/AttendanceRecords";
import SalaryManagement from "./pages/SalaryManagement";
import SalarySlips from "./pages/SalarySlips";
import IPManagement from "./pages/IPManagement";
import AttendanceSettings from "./pages/AttendanceSettings";
import AdminAttendanceView from './pages/AdminAttendanceView';


import SetupPageds1 from './pages/SetupPageds1';
import LeavesPageds1 from './pages/LeavesPageds1';

import Addrubric1bulk from './pages/Addrubric1bulk';

import Addrubric1bulkedit from './pages/Addrubric1bulkedit';

import Dashmattstud from './pages/Dashmattstud';


// User Management - Admin
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import EditUserds from "./pages/EditUserds";
import BulkUploadUsers from "./pages/BulkUploadUsers";
import AdminPasswordUsersds from "./pages/AdminPasswordUsersds";
import MeritListPage from "./pages/MeritListPage";
import MeritListSelectionPage from "./pages/MeritListSelectionPage";
import RegulationMasterPage from "./pages/RegulationMasterPage";
import RegulationSubjectPage from "./pages/RegulationSubjectPage";
import RegulationSeatPage from "./pages/RegulationSeatPage";
import RegulationCourseMapPage from "./pages/RegulationCourseMapPage";
import GraceMarksPolicyPage from "./pages/GraceMarksPolicyPage";
import AtktRulePage from "./pages/AtktRulePage";
import ProgramwiseMarksheetConfigurationPage from "./pages/ProgramwiseMarksheetConfigurationPage";
import NepLmsElectiveEnrollmentPage from "./pages/NepLmsElectiveEnrollmentPage";
import NepLmsElectiveApprovalPage from "./pages/NepLmsElectiveApprovalPage";
import NepLmsStudentElectiveApplicationPage from "./pages/NepLmsStudentElectiveApplicationPage";
import NepLmsStudentElectivesPage from "./pages/NepLmsStudentElectivesPage";
import SpecializationPage from "./pages/SpecializationPage";
import { SpecializationAttendancePage, SpecializationCoursesPage, SpecializationNewPage, SpecializationStudentsPage, SpecializationTimetablePage } from "./pages/SpecializationNewPages";
import CourseAssessmentPage from "./pages/CourseAssessmentPage";
import AssessmentComponentPage from "./pages/AssessmentComponentPage";
import PassMarksConfigurationPage from "./pages/PassMarksConfigurationPage";
import SyllabusPage from "./pages/SyllabusPage";
import CourseOutcomePage from "./pages/CourseOutcomePage";
import GradeConfigurationPage from "./pages/GradeConfigurationPage";
import BosCyclePage from "./pages/BosCyclePage";
import BosApprovalMatrixPage from "./pages/BosApprovalMatrixPage";
import BosAssignmentPage from "./pages/BosAssignmentPage";
import BosCourseReviewPage from "./pages/BosCourseReviewPage";
import BosCourseApprovalPage from "./pages/BosCourseApprovalPage";
import BosProgramReviewPage from "./pages/BosProgramReviewPage";
import BosReportPage from "./pages/BosReportPage";
import RelativeGradingConfigurationPage from "./pages/RelativeGradingConfigurationPage";
import ZScoreConfigurationPage from "./pages/ZScoreConfigurationPage";
import AcademicSubjectPage from "./pages/AcademicSubjectPage";
import AccreditationStatusPage from "./pages/AccreditationStatusPage";
import WorkloadAssignmentPage from "./pages/WorkloadAssignmentPage";
import WorkloadDynamicReportPage from "./pages/WorkloadDynamicReportPage";
import { AutoWorkloadAllocationPage, FacultyQualificationAdminPage, FacultyQualificationPage } from "./pages/FacultyQualificationPages";
import ProgramPeriodSlotPage from "./pages/ProgramPeriodSlotPage";
import FacultyAvailabilityPage from "./pages/FacultyAvailabilityPage";
import FacultyAvailabilityAdminPage from "./pages/FacultyAvailabilityAdminPage";
import NepLmsAssignedCoursesPage from "./pages/NepLmsAssignedCoursesPage";
import NepLmsCourseWorkspacePage from "./pages/NepLmsCourseWorkspacePage";
import NepLmsFacultyLogbookPage from "./pages/NepLmsFacultyLogbookPage";
import NepLmsTimetableCreatorFilteredPage from "./pages/NepLmsTimetableCreatorFilteredPage";
import NepLmsAdminResourceAssignmentPage from "./pages/NepLmsAdminResourceAssignmentPage";
import { NepLmsAdminMindMapPage, NepLmsFacultyMindMapPage, NepLmsStudentMindMapPage } from "./pages/NepLmsMindMapPages";
import NepLmsMyCourseContentPage from "./pages/NepLmsMyCourseContentPage";
import NepLmsQuizAnalyticsPage from "./pages/NepLmsQuizAnalyticsPage";
import {
  SupplementaryAttendanceApprovalPage,
  SupplementaryAttendanceReportPage,
  SupplementaryAttendanceRequestPage,
  SupplementaryAttendanceWorkflowPage
} from "./pages/NepLmsSupplementaryAttendancePages";
import NepLmsLiveQuizPage from "./pages/NepLmsLiveQuizPage";
import NepLmsPreReadingPage, { NepLmsPreReadingAdminPage, StudentPreReadingPage } from "./pages/NepLmsPreReadingPage";
import NepLmsClassGroupsPage from "./pages/NepLmsClassGroupsPage";
import NepLmsClassGroupsAdminPage from "./pages/NepLmsClassGroupsAdminPage";
import NepLmsAiCourseGenerationPage from "./pages/NepLmsAiCourseGenerationPage";
import NepLmsStudentWorkspacePage from "./pages/NepLmsStudentWorkspacePage";
import NepLmsStudentSequentialContentPage from "./pages/NepLmsStudentSequentialContentPage";
import NepLmsStudentLiveQuizPage from "./pages/NepLmsStudentLiveQuizPage";
import NepLmsMyAttendanceSummaryPage from "./pages/NepLmsMyAttendanceSummaryPage";
import NepLmsLoginBasedAttendancePage from "./pages/NepLmsLoginBasedAttendancePage";
import NepLmsAssessmentPage from "./pages/NepLmsAssessmentPage";
import NepLmsStudentAssessmentPage from "./pages/NepLmsStudentAssessmentPage";
import NepLmsRemedialPage from "./pages/NepLmsRemedialPage";
import NepLmsStudentRemedialPage from "./pages/NepLmsStudentRemedialPage";
import NepLmsStudentDashboardPage from "./pages/NepLmsStudentDashboardPage";
import NepLmsFacultyDashboardPage from "./pages/NepLmsFacultyDashboardPage";
import { DashboardWidgetBuilderPage, DashboardWidgetCatalogPage, DashboardWidgetViewPage } from "./pages/DashboardWidgetPages";
import {
  EstateDailyRosterPage,
  EstateDailyRosterReportPage,
  EstateCampusPage,
  EstateMaintenanceSchedulePage,
  EstateMeetingRoomFeaturesPage,
  EstateMeetingRoomPlannerPage,
  EstateMeetingRoomsPage,
  EstateRealEstatesPage,
  EstateServiceAllocationPage,
  EstateServiceProvidersPage,
  EstateServiceShiftPage,
  EstateServiceTypesPage,
  EstateTypesPage,
  EstateVendorContractsPage
} from "./pages/EstateManagementPages";
import ManagementDashboardPage from "./pages/ManagementDashboardPage";
import StudentDemographicDashboardPage from "./pages/StudentDemographicDashboardPage";
import LmsDirectorDashboardPage from "./pages/LmsDirectorDashboardPage";
import HodDashboardPage from "./pages/HodDashboardPage";
import FeesDashboardPage from "./pages/FeesDashboardPage";
import MentoringWorkspacePage from "./pages/MentoringWorkspacePage";
import StudentMentoringWorkspacePage from "./pages/StudentMentoringWorkspacePage";
import { ActivityMonitoringReport2Page, ActivityMonitoringReportPage, ActivityPointsConfigurationPage, ActivityUserPointsPage, NepLmsAttendanceEventPage } from "./pages/ActivityMonitoringPages";
import { MentoringHomeVisitPage, MentoringSessionPage, MentoringStudentProfilePage, StudentMentoringReadonlyPage } from "./pages/MentoringDetailsPages";
import CrmManagementPage from "./pages/CrmManagementPage";
import CrmLeadActionPage from "./pages/CrmLeadActionPage";
import CrmReportsPage from "./pages/CrmReportsPage";
import CrmMyLeadsPage from "./pages/CrmMyLeadsPage";
import CrmMyFollowupsPage from "./pages/CrmMyFollowupsPage";
import CrmCounselorMappingPage from "./pages/CrmCounselorMappingPage";
import NepLmsMasterTimetableReportPage from "./pages/NepLmsMasterTimetableReportPage";
import NepLmsTimetableManagerPage, { NepLmsClassGroupwiseTimetablePage, NepLmsSectionwiseTimetablePage } from "./pages/NepLmsTimetableManagerPage";
import NepLmsOnlineClassRoomPage from "./pages/NepLmsOnlineClassRoomPage";
import NepLmsTimetableCreatorPage from "./pages/NepLmsTimetableCreatorPage";
import NepLmsTimetableRoomCreatorPage from "./pages/NepLmsTimetableRoomCreatorPage";
import NepLmsMyClassesPage from "./pages/NepLmsMyClassesPage";
import RoomResourcePage from "./pages/RoomResourcePage";
import RoomCalendarPage from "./pages/RoomCalendarPage";
import NepLmsAttendancePage, { NepLmsSectionwiseAttendancePage } from "./pages/NepLmsAttendancePage";
import NepLmsGroupAttendancePage, { NepLmsClassGroupAttendance2Page } from "./pages/NepLmsGroupAttendancePage";
import {
  NepLmsEnrollmentAttendancePage,
  NepLmsEnrollmentGroupPage,
  NepLmsEnrollmentGroupStudentsPage,
  NepLmsEnrollmentTimetablePage,
  NepLmsEnrollmentWorkloadPage,
  NepLmsProxyAttendancePage,
  NepLmsProxyFacultyPage
} from "./pages/NepLmsProxyEnrollmentPages";
import NepLmsPhotoAttendancePage from "./pages/NepLmsPhotoAttendancePage";
import NepLmsOtpAttendancePage from "./pages/NepLmsOtpAttendancePage";
import NepLmsStudentOtpAttendancePage from "./pages/NepLmsStudentOtpAttendancePage";
import NepLmsAttendanceReviewPage from "./pages/NepLmsAttendanceReviewPage";
import NepLmsAssessmentMarksPage from "./pages/NepLmsAssessmentMarksPage";
import NepLmsAssessmentMarksViewPage from "./pages/NepLmsAssessmentMarksViewPage";
import NepLmsComponentMarksViewPage from "./pages/NepLmsComponentMarksViewPage";
import NepLmsFinalMarksViewPage from "./pages/NepLmsFinalMarksViewPage";
import NepLmsFinalMarksEditPage from "./pages/NepLmsFinalMarksEditPage";
import NepLmsGradeCardPage from "./pages/NepLmsGradeCardPage";
import NepLmsAdvancedGradeCardPage from "./pages/NepLmsAdvancedGradeCardPage";
import PublicGradeCardBlockchainVerifyPage from "./pages/PublicGradeCardBlockchainVerifyPage";
import NepLmsStudentwiseAttendanceReportPage from "./pages/NepLmsStudentwiseAttendanceReportPage";
import NepLmsStudentCoursewiseAttendanceReportPage from "./pages/NepLmsStudentCoursewiseAttendanceReportPage";
import NepLmsLowAttendanceReportPage from "./pages/NepLmsLowAttendanceReportPage";
import NepLmsFacultyCourseLowAttendanceReportPage from "./pages/NepLmsFacultyCourseLowAttendanceReportPage";
import NepLmsConsecutiveAbsencePage from "./pages/NepLmsConsecutiveAbsencePage";
import NepLmsMissingTimetablePage from "./pages/NepLmsMissingTimetablePage";
import NepLmsCourseProgressionPage from "./pages/NepLmsCourseProgressionPage";
import NepLmsStudentLearningProfilePage from "./pages/NepLmsStudentLearningProfilePage";
import ConductExamMasterPage from "./pages/ConductExamMasterPage";
import ConductExamDatesPage from "./pages/ConductExamDatesPage";
import ConductExamCoursePage from "./pages/ConductExamCoursePage";
import ConductExamCourseSchedulerPage from "./pages/ConductExamCourseSchedulerPage";
import ConductExamRollPage from "./pages/ConductExamRollPage";
import StudentExamRegistrationPage from "./pages/StudentExamRegistrationPage";
import ConductExamRoomPage from "./pages/ConductExamRoomPage";
import ConductExamSeatAllocationPage from "./pages/ConductExamSeatAllocationPage";
import ConductExamInvigilationPage from "./pages/ConductExamInvigilationPage";
import ConductExamInvigilatorAllocationPage from "./pages/ConductExamInvigilatorAllocationPage";
import ConductExamInvigilatorAttendancePage from "./pages/ConductExamInvigilatorAttendancePage";
import ConductExamInvigilatorPaymentPage from "./pages/ConductExamInvigilatorPaymentPage";
import ConductExamStudentAttendancePage from "./pages/ConductExamStudentAttendancePage";
import {
  ConductExamFlyingSquadAssignmentPage,
  ConductExamFlyingSquadMembersPage,
  ConductExamFlyingSquadPage,
  ConductExamUnfairMeansPage,
  ConductExamUnfairMeansReportPage
} from "./pages/ConductExamFlyingSquadPages";
import ConductExamExaminerListPage from "./pages/ConductExamExaminerListPage";
import ConductExamExaminerAllotmentPage from "./pages/ConductExamExaminerAllotmentPage";
import ConductExamExaminerAllotmentReportPage from "./pages/ConductExamExaminerAllotmentReportPage";
import ConductExamExaminerMarksEntryPage from "./pages/ConductExamExaminerMarksEntryPage";
import ConductExamComponentwiseAllocationPage from "./pages/ConductExamComponentwiseAllocationPage";
import ConductExamComponentwiseMarksPage from "./pages/ConductExamComponentwiseMarksPage";
import { ConductExamDaywiseMarksMonitoringPage, ConductExamExaminerReassignmentPage, ConductExamMarksEntryMonitoringPage } from "./pages/ConductExamComponentMonitoringPages";
import ExamModel2ComponentMarksCrudPage from "./pages/ExamModel2ComponentMarksCrudPage";
import ExamModel2InterimMarksTransferPage from "./pages/ExamModel2InterimMarksTransferPage";
import ConductExamPaperSetterRegistrationPage from "./pages/ConductExamPaperSetterRegistrationPage";
import ConductExamSubmitQuestionPaperPage from "./pages/ConductExamSubmitQuestionPaperPage";
import ConductExamModeratorRegistrationPage from "./pages/ConductExamModeratorRegistrationPage";
import ConductExamModerationPage from "./pages/ConductExamModerationPage";
import ConductExamReviewPapersPage from "./pages/ConductExamReviewPapersPage";
import ConductExamRateCardPage from "./pages/ConductExamRateCardPage";
import { ConductExamExaminerPaymentPage, ConductExamModeratorPaymentPage, ConductExamPaperSetterPaymentPage } from "./pages/ConductExamStaffPaymentPages";
import { ConductExamStationaryMasterPage, ConductExamStationaryRequirementPage } from "./pages/ConductExamStationaryPages";
import { ConductExamGeneratorAllocationPage, ConductExamGeneratorMasterPage, ConductExamGeneratorRequirementPage } from "./pages/ConductExamGeneratorPages";
import { ConductExamOnScreenMarkingPage, ConductExamScoreRulePage } from "./pages/ConductExamOnScreenMarkingPages";
import { ConductExamFeePage, ConductExamFormBuilderPage, StudentExamDynamicFormPage } from "./pages/ConductExamFormPages";
import PublicQuestionPaperBlockchainVerifyPage from "./pages/PublicQuestionPaperBlockchainVerifyPage";
import HrLeaveManagementPage from "./pages/HrLeaveManagementPage";
import HrLeaveApplyPage from "./pages/HrLeaveApplyPage";
import HrLeaveApprovePage from "./pages/HrLeaveApprovePage";
import HrLeaveDashboardPage from "./pages/HrLeaveDashboardPage";
import HrLeaveHrDashboardPage from "./pages/HrLeaveHrDashboardPage";
import HrLeaveAllLeavesPage from "./pages/HrLeaveAllLeavesPage";
import HrEmployeeAttendancePage from "./pages/HrEmployeeAttendancePage";
import HrEmployeeAttendanceMatrixPage from "./pages/HrEmployeeAttendanceMatrixPage";
import HrEmployeeAttendanceApprovalPage from "./pages/HrEmployeeAttendanceApprovalPage";
import { HrEmployeeHoursPage, HrShiftAllocationPage, HrShiftTimingPage } from "./pages/HrShiftPages";
import { HrLatePolicyPage, HrOvertimePolicyPage } from "./pages/HrAttendancePolicyPages";
import { HrAttendanceProcessingRulesPage, HrAttendanceRuleBasedPage } from "./pages/HrAttendanceRuleBasedPages";
import { HrLeaveAccrualRulePage, HrLeaveCompensatoryBalancePage, HrLeaveCompensatoryRulePage, HrLeaveHolidayListPage, HrLeaveNewJoineeRulePage, HrLeaveWeeklyOffPage } from "./pages/HrLeaveCompensatoryPages";
import { HrLeavePopulateVacationPage, HrLeaveVacationPolicyPage } from "./pages/HrLeaveVacationPages";
import HostelBuildingRoomPage from "./pages/HostelBuildingRoomPage";
import HostelAssignmentPage from "./pages/HostelAssignmentPage";
import HostelVacancyReportPage from "./pages/HostelVacancyReportPage";
import HostelCardPage from "./pages/HostelCardPage";
import StudentHostelBedApplyPage from "./pages/StudentHostelBedApplyPage";
import HostelBedRequestApprovalPage from "./pages/HostelBedRequestApprovalPage";
import HostelLightBillPage from "./pages/HostelLightBillPage";
import EmployeeDatabasePage from "./pages/EmployeeDatabasePage";
import EmployeeDatabaseReportPage from "./pages/EmployeeDatabaseReportPage";
import EmployeeProfileEditPage from "./pages/EmployeeProfileEditPage";
import StudentDataUploadPage from "./pages/StudentDataUploadPage";
import StudentMenuManagementPage from "./pages/StudentMenuManagementPage";
import SpecializationAssignmentPage from "./pages/SpecializationAssignmentPage";
import CasNewEntryPage from "./pages/CasNewEntryPage";
import CasNewSummaryPage from "./pages/CasNewSummaryPage";
import CasNewMasterReportPage from "./pages/CasNewMasterReportPage";
import CasNewWorkflowPage from "./pages/CasNewWorkflowPage";
import CasNewApprovalPage from "./pages/CasNewApprovalPage";
import CasNewStatusPage from "./pages/CasNewStatusPage";
import StudentEmailMessagePage from "./pages/StudentEmailMessagePage";
import StudentActivitiesPage from "./pages/StudentActivitiesPage";
import FeeItemReportPage from "./pages/FeeItemReportPage";
import DynamicAdmissionFormPage from "./pages/DynamicAdmissionFormPage";
import AdmissionAiAgentsPage from "./pages/AdmissionAiAgentsPage";
import AdmissionAiAgentLogsPage from "./pages/AdmissionAiAgentLogsPage";
import {
  AdmissionInboundApiPage,
  CrmAiAgentPage,
  CrmBulkAssignmentPage,
  CrmFormLinkPage,
  CrmInboundApiPage,
  PublicCrmFormPage
} from "./pages/InboundApiAndCrmPages";
import {
  OnlineExamManagementPage,
  OnlineExamReportPage,
  OnlineExamResponsesPage,
  StudentOnlineExamPage
} from "./pages/OnlineExaminationPages";
import DynamicAdmissionApplicationsPage from "./pages/DynamicAdmissionApplicationsPage";
import AdmissionApplicationManagementPage from "./pages/AdmissionApplicationManagementPage";
import AdmissionApplicationCommentsPage from "./pages/AdmissionApplicationCommentsPage";
import DynamicAdmissionProfilePage from "./pages/DynamicAdmissionProfilePage";
import DynamicAdmissionProfile2Page from "./pages/DynamicAdmissionProfile2Page";
import StudentCombinedDynamicProfilePage from "./pages/StudentCombinedDynamicProfilePage";
import DynamicAdmissionProfileSubjectsPage from "./pages/DynamicAdmissionProfileSubjectsPage";
import SubjectWiseAdmissionApplicationsPage from "./pages/SubjectWiseAdmissionApplicationsPage";
import PublicAdmissionApplyPage from "./pages/PublicAdmissionApplyPage";
import PublicAdmissionApplyGroupedPage from "./pages/PublicAdmissionApplyGroupedPage";
import PublicAdmissionApplyTabbedPage from "./pages/PublicAdmissionApplyTabbedPage";
import PublicAdmissionApplyTabbedProgramPage from "./pages/PublicAdmissionApplyTabbedProgramPage";
import PublicAdmissionApplyTabbedProgramDraftPage from "./pages/PublicAdmissionApplyTabbedProgramDraftPage";
import PublicAdmissionApplyTabbedProgramCredentialDraftPage from "./pages/PublicAdmissionApplyTabbedProgramCredentialDraftPage";
import PublicAdmissionApplyTabbedProgramCredentialDraftRedPage from "./pages/PublicAdmissionApplyTabbedProgramCredentialDraftRedPage";
import PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelPage from "./pages/PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelPage";
import PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPage from "./pages/PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPage";
import PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPhPage from "./pages/PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPhPage";
import PublicAdmissionAiPhPage from "./pages/PublicAdmissionAiPhPage";
import PublicAdmissionAiPhDocumentsPage from "./pages/PublicAdmissionAiPhDocumentsPage";
import PublicAdmissionAiAgentDocumentsPage from "./pages/PublicAdmissionAiAgentDocumentsPage";
import PublicAdmissionApplySubjectsPage from "./pages/PublicAdmissionApplySubjectsPage";
import AdmissionApplicationLookupPage from "./pages/AdmissionApplicationLookupPage";
import AdmissionDatewiseSummaryPage from "./pages/AdmissionDatewiseSummaryPage";
import AdmissionDynamicReportPage from "./pages/AdmissionDynamicReportPage";
import AdmissionPaymentsPage from "./pages/AdmissionPaymentsPage";
import AdmissionFeeReceiptPage from "./pages/AdmissionFeeReceiptPage";
import AdmissionAddressConfigurationPage from "./pages/AdmissionAddressConfigurationPage";
import AdmissionBoardConfigurationPage from "./pages/AdmissionBoardConfigurationPage";
import AdmissionValidationCriteriaPage from "./pages/AdmissionValidationCriteriaPage";
import AdmissionFormDocumentsPage from "./pages/AdmissionFormDocumentsPage";
import AcademicCalendarPage from "./pages/AcademicCalendarPage";
import AcademicCalendarAiPage from "./pages/AcademicCalendarAiPage";
import RecruitmentManagementPage from "./pages/RecruitmentManagementPage";
import RecruitmentInterviewPanelPage from "./pages/RecruitmentInterviewPanelPage";
import RecruitmentPanelMembersPage from "./pages/RecruitmentPanelMembersPage";
import RecruitmentPanelJobPage from "./pages/RecruitmentPanelJobPage";
import RecruitmentInterviewSchedulePage from "./pages/RecruitmentInterviewSchedulePage";
import {
  RecruitmentInterviewParametersPage,
  RecruitmentInterviewProfilePage,
  RecruitmentInterviewScoreEntryPage
} from "./pages/RecruitmentInterviewEvaluationPages";
import PublicRecruitmentApplyPage from "./pages/PublicRecruitmentApplyPage";
import {
  RecruitmentCandidatesToUserPage,
  RecruitmentOfferLetterPage,
  RecruitmentOfferTemplatesPage,
  RecruitmentOnboardingChecklistPage,
  RecruitmentOnboardingReportPage,
  RecruitmentOnboardingStepsPage
} from "./pages/RecruitmentOfferOnboardingPages";
import SalaryStructureCrudPage from "./pages/SalaryStructureCrudPage";
import PlacementLeadsPage from "./pages/PlacementLeadsPage";
import PlacementLeadStagePage from "./pages/PlacementLeadStagePage";
import PlacementVisitPlanPage from "./pages/PlacementVisitPlanPage";
import PlacementVisitCalendarPage from "./pages/PlacementVisitCalendarPage";
import {
  PlacementCompanyDetailsPage,
  PlacementConversionReportPage,
  PlacementJobPostingPage,
  PlacementIndustryReportPage,
  PlacementPlacedReportPage,
  PlacementProjectReportPage,
  PlacementProjectStagesPage,
  PlacementReportsPage,
  PlacementSipStudentListPage,
  PlacementStageAddStudentsPage,
  PlacementStageDetailsPage,
  PlacementStageReportPage,
  PlacementStagesPage,
  PlacementStagewiseStudentsPage,
  PlacementStudentsPage,
  PlacementStudentAssignedSipPage,
  PlacementStudentInternshipProfilePage,
  PlacementStudentMentorAssignmentPage,
  PlacementStudentSkillsPage,
  PlacementUnemployedStudentsPage
} from "./pages/PlacementNewPages";
import {
  ContinuousFeedbackQuickFormPage,
  ContinuousFeedbackReportPage,
  StudentContinuousFeedbackPage
} from "./pages/ContinuousFeedbackPages";
import DynamicAdmissionSortPage from "./pages/DynamicAdmissionSortPage";
import DynamicAdmissionBulkUploadPage from "./pages/DynamicAdmissionBulkUploadPage";
import StudentDynamicFilterPage from "./pages/StudentDynamicFilterPage";
import ProgramEligibilityPage from "./pages/ProgramEligibilityPage";
import DynamicAdmissionToUserPage from "./pages/DynamicAdmissionToUserPage";
import ProvisionalAdmissionLetterPage from "./pages/ProvisionalAdmissionLetterPage";
import OfferLetterPage from "./pages/OfferLetterPage";
import ProgramManagementPage from "./pages/ProgramManagementPage";
import SchoolClassManagementPage from "./pages/SchoolClassManagementPage";
import SchoolSyllabusYearPage from "./pages/SchoolSyllabusYearPage";
import SchoolSubjectGroupPage from "./pages/SchoolSubjectGroupPage";
import SchoolCourseListPage from "./pages/SchoolCourseListPage";
import EmailConfigurationPage from "./pages/EmailConfigurationPage";
import ConfigurationSetupPage from "./pages/ConfigurationSetupPage";
import AiConfigurationPage from "./pages/AiConfigurationPage";
import OllamaConfigurationPage from "./pages/OllamaConfigurationPage";
import CountryConfigurationPage from "./pages/CountryConfigurationPage";
import DummyDataGeneratorPage from "./pages/DummyDataGeneratorPage";
import { observeStudentLabelChanges } from "./utils/countryTerminology";
import UserCustomFieldsPage from "./pages/UserCustomFieldsPage";
import UserDataUploadPage from "./pages/UserDataUploadPage";
import StudentDocumentMappingBulkPage from "./pages/StudentDocumentMappingBulkPage";
import StudentCompleteProfilePage from "./pages/StudentCompleteProfilePage";
import UserEditJoiningDatePage from "./pages/UserEditJoiningDatePage";
import UserDocumentRequirementPage from "./pages/UserDocumentRequirementPage";
import UserDocumentUploadPage from "./pages/UserDocumentUploadPage";
import UserBankAccountPage from "./pages/UserBankAccountPage";
import {
  UserAcademicDetailsPage,
  UserEmploymentDetailsPage,
  UserProfileDetailRequirementsPage,
  UserAcademicEmploymentAdminPage,
  UserProfileFullPage,
  MyProfileFullPage
} from "./pages/UserAcademicEmploymentPages";
import UserProfileLayoutPage from "./pages/UserProfileLayoutPage";
import UserProfileDisplayLayoutPage from "./pages/UserProfileDisplayLayoutPage";
import UserProfileLayoutDisplayPage, { StudentProfileLayoutDisplayPage } from "./pages/UserProfileLayoutDisplayPage";
import UserProfileEditPage from "./pages/UserProfileEditPage";
import UserProfileApprovalWorkflowPage from "./pages/UserProfileApprovalWorkflowPage";
import UserProfileApprovalPage from "./pages/UserProfileApprovalPage";
import UserProfileStudentApprovalPage from "./pages/UserProfileStudentApprovalPage";
import UserProfileApprovalReportPage from "./pages/UserProfileApprovalReportPage";
import UserProfilePrintPage from "./pages/UserProfilePrintPage";
import UserProfileAuditLogPage from "./pages/UserProfileAuditLogPage";
import UserLocationSearchPage from "./pages/UserLocationSearchPage";
import UserConsentContentPage from "./pages/UserConsentContentPage";
import UserConsentPage from "./pages/UserConsentPage";
import UserConsentWithdrawPage from "./pages/UserConsentWithdrawPage";
import UserConsentAuditLogPage from "./pages/UserConsentAuditLogPage";
import {
  ExaminationModel2MarksPage,
  ExaminationModel2VivaMarksPage,
  ExaminationModel2VivaGradingTemplatePage,
  ExaminationModel2VivaGradingTemplateDetailPage,
  ExaminationModel2VivaClassConfigurationPage,
  ExaminationModel2VivaGradeProcessingPage,
  ExaminationModel2VivaPercentageCalculationPage,
  ExaminationModel2VivaComponentFailRulePage,
  ExaminationModel2VivaMarksheetPage,
  ExaminationModel2VivaMarksOnlyMarksheetPage,
  ExaminationModel2GradingTemplatePage,
  ExaminationModel2GradingTemplateDetailPage,
  ExaminationModel2ClassConfigurationPage,
  ExaminationModel2GradeProcessingPage,
  ExaminationModel2PercentageCalculationPage,
  ExaminationModel2ComponentFailRulePage,
  ExaminationModel2FinalGradeProcessingPage,
  ExaminationModel2MarksheetPage,
  ExaminationModel2AprMarksheetPage,
  ExaminationModel2BulkAprMarksheetPage,
  PublicExamModel2MarksheetVerifyPage
} from "./pages/ExaminationModel2Pages";
import MenuSearchPage from "./pages/MenuSearchPage";
import UserPivotReportPage from "./pages/UserPivotReportPage";
import UserPivotCountPage from "./pages/UserPivotCountPage";
import StudentDetailsReportPage from "./pages/StudentDetailsReportPage";
import StudentPhotoUploadPage from "./pages/StudentPhotoUploadPage";
import UserPhotoUploadPage from "./pages/UserPhotoUploadPage";
import FacultyCadraRequirementPage from "./pages/FacultyCadraRequirementPage";
import StudentPromotionPage from "./pages/StudentPromotionPage";
import { ProgramTransferLogPage, ProgramTransferPage, FeeTransferLogPage } from "./pages/ProgramTransferPages";
import AdmissionCancellationPage from "./pages/AdmissionCancellationPage";
import AdmissionRefundDetailsPage from "./pages/AdmissionRefundDetailsPage";
import AdmissionRefundLetterPage from "./pages/AdmissionRefundLetterPage";
import TranscriptRecorderPage from "./pages/TranscriptRecorderPage";
import TranscriptMeetingsCalendarPage from "./pages/TranscriptMeetingsCalendarPage";
import MeetingTranscriptRecorderPage from "./pages/MeetingTranscriptRecorderPage";
import KnowledgebasePage from "./pages/KnowledgebasePage";
import PublicAiHelpdeskChatbotPage from "./pages/PublicAiHelpdeskChatbotPage";

// User Management - Student
import StudentProfileds1 from "./pages/StudentProfileds1";

import Dashmchatentry from "./pages/Dashmchatentry";

import SubjectGroupds from './pages/SubjectGroupds';
import StudentSubjectds from './pages/StudentSubjectds';
import SubjectApprovalds from './pages/SubjectApprovalds';

import SubjectLimitConfig from './pages/SubjectLimitConfig';
import SubjectReportds from './pages/SubjectReportds';

import Seatallocator from './pages/Seatallocator';
import Seatallocator1 from './pages/Seatallocator1';
import Seatallocatorm1 from './pages/Seatallocatorm1';

import Seatallocatorm2 from './pages/Seatallocatorm2';
import Seatallocatorm3 from './pages/Seatallocatorm3';
import Seatallocatorm4 from './pages/Seatallocatorm4';
import Seatallocatorm5 from './pages/Seatallocatorm5';

import Seatallocatormds4 from './pages/Seatallocatormds4';


// User Management - Admin
import UserManagementdsoct18 from "./pages/UserManagementdsoct18";
import CreateUserdsoct18 from "./pages/CreateUserdsoct18";
import LeadToUserds from "./pages/LeadToUserds";
import AdmitFromCrmPage from "./pages/AdmitFromCrmPage";
import EditUserdsoct18 from "./pages/EditUserdsoct18";
import BulkUploadUsersdsoct18 from "./pages/BulkUploadUsersdsoct18";

// User Management - Student
import StudentProfiledsoct18 from "./pages/StudentProfiledsoct18";

import ProfileEditConfigds from "./pages/ProfileEditConfigds";
import ProfileEditLogsds from "./pages/ProfileEditLogsds";
import DataQualityReportds from "./pages/DataQualityReportds";


import Vendormanagementds from "./pages/Vendormanagementds";
import Productmanagementds from "./pages/Productmanagementds";
import Vendorproductmanagementds from "./pages/Vendorproductmanagementds";
import Productrequestds from "./pages/Productrequestds";
import Productrequestadminds from "./pages/Productrequestadminds";
import Purchasemanagementds from "./pages/Purchasemanagementds";
import Paymentmanagementds from "./pages/Paymentmanagementds";


import TransactionrefdsPage from "./pages/TransactionrefdsPage";
import JournalsByGroupdsPage from "./pages/JournalsByGroupdsPage";

import Purchasedsearchds from "./pages/Purchasedsearchds";


import CreateScholarshipDS from './pages/CreateScholarshipDS';
import ApplyScholarshipDS from './pages/ApplyScholarshipDS';
import ScholarshipAdminDS from './pages/ScholarshipAdminDS';
import StudentScholarshipSuggestionPage from './pages/StudentScholarshipSuggestionPage';

import Dashmstudalloc1 from './pages/Dashmstudalloc1';
import Dashmstudalloc1admin from './pages/Dashmstudalloc1admin';


import Allocatefaculties from './pages/Allocatefaculties';

import Viewmmcevents from './pages/Viewmmcevents';

import ParentDetailsPage from './pages/ParentDetailsPage';
import GatewayPassApprovalPage from './pages/GatewayPassApprovalPage';
import StudentGatewayPassPage from './pages/StudentGatewayPassPage';
import StudentGatewayStatusPage from './pages/StudentGatewayStatusPage';
import ParentApprovalPage from './pages/ParentApprovalPage';
import BuildingStaffConfigPage from './pages/BuildingStaffConfigPage';
import MessPollsPage from './pages/MessPollsPage';
import StudentMealVotePage from './pages/StudentMealVotePage';
import MessApplicationPage from './pages/MessApplicationPage';
import StudentMessApplicationPage from './pages/StudentMessApplicationPage';

import DashboardPageHostel from './pages/DashboardPageHostel';
import Dashboardhostelpagestud from './pages/Dashboardhostelpagestud';

import DashmPatient from './pages/DashmPatient';
import DashmPatientadmin from './pages/DashmPatientadmin';
import Dashmicu from './pages/Dashmicu';
import Dashmicuadmin from './pages/Dashmicuadmin';
import Dashmmicu from './pages/Dashmmicu';
import Dashmmicuadmin from './pages/Dashmmicuadmin';
import Dashmnicu from './pages/Dashmnicu';
import Dashmnicuadmin from './pages/Dashmnicuadmin';
import Dashmhdu from './pages/Dashmhdu';
import Dashmhduadmin from './pages/Dashmhduadmin';
import Dashmward from './pages/Dashmward';
import Dashmwardadmin from './pages/Dashmwardadmin';
import Dashmemergency from './pages/Dashmemergency';
import Dashmemergencyadmin from './pages/Dashmemergencyadmin';
import Dashmnemergency from './pages/Dashmnemergency';
import Dashmnemergencyadmin from './pages/Dashmnemergencyadmin';
import Dashmpadmission from './pages/Dashmpadmission';
import Dashmpadmissionadmin from './pages/Dashmpadmissionadmin';
import Dashmicubed from './pages/Dashmicubed';
import Dashmicubedadmin from './pages/Dashmicubedadmin';
import Dashmmicubed from './pages/Dashmmicubed';
import Dashmmicubedadmin from './pages/Dashmmicubedadmin';
import Dashmnicubed from './pages/Dashmnicubed';
import Dashmnicubedadmin from './pages/Dashmnicubedadmin';
import Dashmhdubed from './pages/Dashmhdubed';
import Dashmhdubedadmin from './pages/Dashmhdubedadmin';
import Dashmwardbed from './pages/Dashmwardbed';
import Dashmwardbedadmin from './pages/Dashmwardbedadmin';
import Dashmerbed from './pages/Dashmerbed';
import Dashmerbedadmin from './pages/Dashmerbedadmin';
import Dashmnerbed from './pages/Dashmnerbed';
import Dashmnerbedadmin from './pages/Dashmnerbedadmin';
import Dashmpadmhistory from './pages/Dashmpadmhistory';
import Dashmpadmhistoryadmin from './pages/Dashmpadmhistoryadmin';
import Dashmpbilling from './pages/Dashmpbilling';
import Dashmpbillingadmin from './pages/Dashmpbillingadmin';

import Dashmpillness from './pages/Dashmpillness';
import Dashmpillnessadmin from './pages/Dashmpillnessadmin';
import Dashmpsurgery from './pages/Dashmpsurgery';
import Dashmpsurgeryadmin from './pages/Dashmpsurgeryadmin';
import Dashmpfamily from './pages/Dashmpfamily';
import Dashmpfamilyadmin from './pages/Dashmpfamilyadmin';
import Dashmpallergies from './pages/Dashmpallergies';
import Dashmpallergiesadmin from './pages/Dashmpallergiesadmin';

import Dashmpconsent from './pages/Dashmpconsent';
import Dashmpconsentadmin from './pages/Dashmpconsentadmin';
import Dashmptreatment from './pages/Dashmptreatment';
import Dashmptreatmentadmin from './pages/Dashmptreatmentadmin';
import Dashmplab from './pages/Dashmplab';
import Dashmplabadmin from './pages/Dashmplabadmin';
import Dashmpimaging from './pages/Dashmpimaging';
import Dashmpimagingadmin from './pages/Dashmpimagingadmin';
import Dashmpdischarge from './pages/Dashmpdischarge';
import Dashmpdischargeadmin from './pages/Dashmpdischargeadmin';

import Viewmmcevmed from './pages/Viewmmcevmed';
import Viewmmcevmeddis from './pages/Viewmmcevmeddis';


import Dashmwcollection from './pages/Dashmwcollection';
import Dashmwcollectionadmin from './pages/Dashmwcollectionadmin';
import Dashmwcolschedule from './pages/Dashmwcolschedule';
import Dashmwcolscheduleadmin from './pages/Dashmwcolscheduleadmin';
import Dashmwdisposal from './pages/Dashmwdisposal';
import Dashmwdisposaladmin from './pages/Dashmwdisposaladmin';
import Dashmwspill from './pages/Dashmwspill';
import Dashmwspilladmin from './pages/Dashmwspilladmin';


import Dashmwbin from './pages/Dashmwbin';
import Dashmwbinadmin from './pages/Dashmwbinadmin';
import Dashmwcolschedule1 from './pages/Dashmwcolschedule1';
import Dashmwcolschedule1admin from './pages/Dashmwcolschedule1admin';
import Dashmwdisposal1 from './pages/Dashmwdisposal1';
import Dashmwdisposal1admin from './pages/Dashmwdisposal1admin';
import Dashmwspill1 from './pages/Dashmwspill1';
import Dashmwspill1admin from './pages/Dashmwspill1admin';


import ExamMarksStructurePageds from "./pages/ExamMarksStructurePageds";
import MarksEntryPageds from "./pages/MarksEntryPageds";
import TabulationRegisterPage from "./pages/TabulationRegisterPage";

import Dashmstudallocf from "./pages/Dashmstudallocf";

import Dashmpcounselnew from './pages/Dashmpcounselnew';
import Dashmpcounselnewadmin from './pages/Dashmpcounselnewadmin';
import Dashmpcounselc from './pages/Dashmpcounselc';
import Dashmpcounselcadmin from './pages/Dashmpcounselcadmin';
import Dashmpmealplan from './pages/Dashmpmealplan';
import Dashmpmealplanadmin from './pages/Dashmpmealplanadmin';
import Dashmpfood from './pages/Dashmpfood';
import Dashmpfoodadmin from './pages/Dashmpfoodadmin';


import Dashmstudalloc1exam from './pages/Dashmstudalloc1exam';

import BulkTabulationRegisterPage from "./pages/BulkTabulationRegisterPage";

import CollegeStudentLedgerReportPageds from "./pages/CollegeStudentLedgerReportPageds";
import StudentLedgerReportPageds from "./pages/StudentLedgerReportPageds";

import LedgerStudPageds from "./pages/LedgerStudPage";

import LedgerInstallmentPageds from "./pages/LedgerInstallmentPageds";
import StudentLedgerInstallmentPage from "./pages/StudentLedgerInstallmentPage";
import ApplicationFeePage from "./pages/ApplicationFeePage";
import ProvisionalAdmissionFeePage from "./pages/ProvisionalAdmissionFeePage";
import EasebuzzGatewayPage from "./pages/EasebuzzGatewayPage";
import MasterGatewayPage from "./pages/MasterGatewayPage";
import IciciGatewayPage from "./pages/IciciGatewayPage";
import EasebuzzPaymentProcessPage from "./pages/EasebuzzPaymentProcessPage";
import EasebuzzPaymentViewPage from "./pages/EasebuzzPaymentViewPage";
import IciciPaymentViewPage from "./pages/IciciPaymentViewPage";
import StudentOnlineFeePaymentPage from "./pages/StudentOnlineFeePaymentPage";
import StudentOnlinePaymentReportPage from "./pages/StudentOnlinePaymentReportPage";
import StudentMyOnlinePaymentReportPage from "./pages/StudentMyOnlinePaymentReportPage";
import {
  LibraryBookMasterPage,
  LibraryBookScanPage,
  LibraryFinePage,
  LibraryLoanPage,
  LibraryMasterPage,
  LibraryCounterPage,
  LibraryIssuePage,
  LibraryPhotocopyRequestsPage,
  LibraryRequestsPage,
  LibraryReportsPage,
  LibraryRoleMaxBooksPage,
  LibraryRoleMaxDaysPage,
  LibraryReturnPage,
  LibraryTransferPage,
  LibraryUserAccessPage,
  StudentLibraryIssuedPage,
  StudentLibraryOpacPage
} from "./pages/LibraryNewPages";
import {
  StudentCounterFee2ReceiptPage,
  StudentDetailedLedgerPage,
  StudentFeesBalanceReportPage
} from "./pages/StudentFeeUtilityPages";
import {
  InstallmentApprovalPage,
  InstallmentApprovalWorkflowPage,
  StudentInstallmentRequestPage
} from "./pages/InstallmentApprovalPages";
import Purchase2CrudPage from "./pages/Purchase2CrudPage";
import {
  Purchase2GatePassPage,
  Purchase2GrnCreationPage,
  Purchase2IndentRequestPage,
  Purchase2LocalPoPage,
  Purchase2PoAssignmentPage,
  Purchase2QualityCheckPage,
  Purchase2StorePrRequestPage,
  Purchase2StoreRequestReviewPage
} from "./pages/Purchase2WorkflowPages";

import FacultyRegistrationFormPage from "./pages/FacultyRegistrationFormPage";

import FacultyRegistrationManagementPage from "./pages/FacultyRegistrationManagementPage";
import FacultyBankDetailsPage from "./pages/FacultyBankDetailsPage";


import CreateGrievanceFormds from "./pages/CreateGrievanceFormds";
import AdminGrievanceDashboardds from "./pages/AdminGrievanceDashboardds";
import AssigneeGrievancePageds from "./pages/AssigneeGrievancePageds";
import ManageGrievanceCategoriesds from "./pages/ManageGrievanceCategoriesds";


import CreateGrievanceFormds1 from "./pages/CreateGrievanceFormds1";
import AdminGrievanceDashboardds1 from "./pages/AdminGrievanceDashboardds1";
import AssigneeGrievancePageds1 from "./pages/AssigneeGrievancePageds1";
import ManageGrievanceCategoriesds1 from "./pages/ManageGrievanceCategoriesds1";
import ManageApiKeyds from "./pages/ManageApiKeyds";
import GeminiChatds from "./pages/GeminiChatds";

import TranscriptPageds from "./pages/Transcriptpageds";

import QuestionBankListds from "./pages/QuestionBankListds";
import ManageSectionsds from "./pages/ManageSectionsds";
import ManageQuestionsds from "./pages/ManageQuestionsds";
import ViewEditLogsds from "./pages/ViewEditLogsds";
import GeneratePDFds from "./pages/GeneratePDFds";

import ManageCategoryAssigneeds1 from "./pages/ManageCategoryAssigneeds1";

import ManageCategoryAssigneeds from "./pages/ManageCategoryAssigneeds";

import DashboardSummaryReportds from "./pages/DashboardSummaryReportds";
import CourseFacultyAssignedReportds from "./pages/CourseFacultyAssignedReportds";
import FacultyCourseSummaryReportds from "./pages/FacultyCourseSummaryReportds";
import FacultyOverallSummaryReportds from "./pages/FacultyOverallSummaryReportds";
import CourseCompletionStatusReportds from "./pages/CourseCompletionStatusReportds";
import FacultyCourseStudentDetailsReportds from "./pages/FacultyCourseStudentDetailsReportds";

import Dashmcrmh1 from './pages/Dashmcrmh1';
import Dashmcrmh1admin from './pages/Dashmcrmh1admin';

import ReevaluationApplicationPageds from "./pages/ReevaluationApplicationPageds";
import ExaminerConfigPageds from "./pages/ExaminerConfigPageds";
import ExaminerEvaluationPageds from "./pages/ExaminerEvaluationPageds";

import Dashmexaminerallocate from "./pages/Dashmexaminerallocate";

import Returnmanagementds from "./pages/Returnmanagementds";

import Dashmexamupload from "./pages/Dashmexamupload";

import Dashchattest4 from "./pages/Dashchattest4";

import Dashchattest4d from "./pages/Dashchattest4d";

import Dashmtall from './pages/Dashmtall';
import Dashmtalladmin from './pages/Dashmtalladmin';
import Dashmtfields from './pages/Dashmtfields';
import Dashmtfieldsadmin from './pages/Dashmtfieldsadmin';

import chattest44 from './pages/chattest44';

import Dashmtbcolumnsall from './pages/Dashmtbcolumnsall';
import Dashmtbcolumnsalladmin from './pages/Dashmtbcolumnsalladmin';


import ReevaluationApplicationNewPageds from "./pages/ReevaluationApplicationNewPageds";
import AdminReevaluationManagementPageds from "./pages/AdminReevaluationManagementPageds";
import ExaminerReevaluationEvaluationPageds from "./pages/ExaminerReevaluationEvaluationPageds";
import AdminExaminer3AllocationPageds from "./pages/AdminExaminer3AllocationPageds";


import Dashboardreevalds from "./pages/Dashboardreevalds";

import Dashmtblapi from './pages/Dashmtblapi';
import Dashmtblapiadmin from './pages/Dashmtblapiadmin';

import Dashreports from './pages/Dashreports';
import Dashmwreport1 from './pages/Dashmwreport1';
import Dashmwreport2 from './pages/Dashmwreport2';

import RequestedAttendanceds from './pages/RequestedAttendanceds';
import StudentAttendanceViewds from './pages/StudentAttendanceViewds';
import SupplementaryAttendanceds from './pages/SupplementaryAttendanceds';

// NEW IMPORTS
import AnswerSheetEvaluationListPageds from "./pages/AnswerSheetEvaluationListPageds";
import AnswerSheetEvaluationPageds from "./pages/AnswerSheetEvaluationPageds";
import ReevaluationQuestionWiseViewPageds from "./pages/ReevaluationQuestionWiseViewPageds";
import ReevaluationQuestionWiseEditPageds from "./pages/ReevaluationQuestionWiseEditPageds";


import DashboardCrmds from "./pages/DashboardCrmds";
import Categoryds from "./pages/Categoryds";
import Leadsds from "./pages/Leadsds";
import Leaddetailds from "./pages/Leaddetailds";
import Programmasterds from "./pages/Programmasterds";
import Landingpageds from "./pages/Landingpageds";
import Dripcampaignds from "./pages/Dripcampaignds";
import Apikeyds from "./pages/Apikeyds";
import Analyticsds from "./pages/Analyticsds";
import Publiclandingpageds from "./pages/Publiclandingpageds";
import CommunicationSettings from "./pages/CommunicationSettings";
import Sourceds from "./pages/Sourceds";

import Dashchattest4a from "./pages/Dashchattest4a";

// Add these imports after other page imports (around line 400+)
import ApiConfig from './pages/ApiConfig';
import ApiChatbot from './pages/ApiChatbot';
import ApiChatbot1 from './pages/ApiChatbot1';

import DataApiConfig from './pages/DataApiConfigds';
import AiDataManager from './pages/AiDataManager';

import AlumniLoginds from "./pages/Alumni/AlumniLoginds";
import AlumniDashboardds from "./pages/Alumni/AlumniDashboardds";
import AlumniProfileds from "./pages/Alumni/AlumniProfileds";
import AlumniEventsds from "./pages/Alumni/AlumniEventsds";
import AlumniJobsds from "./pages/Alumni/AlumniJobsds";
import AlumniMaterialsds from "./pages/Alumni/AlumniMaterialsds";
import AlumniDonationsds from "./pages/Alumni/AlumniDonationsds";
import AlumniDocumentsds from "./pages/Alumni/AlumniDocumentsds";
import AdminDashboardAlumnids from "./pages/Admin/AdminDashboardAlumnids";
import AdminAlumniManagementds from "./pages/Admin/AdminAlumniManagementds";
import AdminEventManagementds from "./pages/Admin/AdminEventManagementds";
import AdminDonationManagementds from "./pages/Admin/AdminDonationManagementds";
import AdminApplicationsManagement from "./pages/Admin/AdminApplicationsManagement";
import AlumniRegistrationForm from "./pages/Public/AlumniRegistrationForm";
import StudentJobsPortalds from "./pages/Student/StudentJobsPortalds";
import StudentMaterialsLibraryds from "./pages/Student/StudentMaterialsLibraryds";

import Dashmtblemitter from './pages/Dashmtblemitter';
import Dashmtblemitteradmin from './pages/Dashmtblemitteradmin';

import Dashmtblerrorlog from './pages/Dashmtblerrorlog';
import Dashmtblerrorlogadmin from './pages/Dashmtblerrorlogadmin';


import WorkflowConfigds from './pages/WorkflowConfigds';
import WorkflowChatbotds from './pages/WorkflowChatbotds';

import WorkflowChatbotds1 from './pages/WorkflowChatbotds1';
import WorkflowConfigds1 from './pages/WorkflowConfigds1';

// Add imports
import MarksheetDataEntryPageds from "./pages/MarksheetDataEntryPageds";
import MarksheetGenerationPageds from "./pages/MarksheetGenerationPageds";

import UserManagementdsnov17 from "./pages/UserManagementdsnov17";

import Layout from "./components/Commonmeritds/Layoutmeritds";
import Dashboarddsmeritds from "./components/Dashboardmeritds/Dashboarddsmeritds";
import ProgrammeList from "./components/Programmemeritds/ProgrammeListdsmeritds";
import SubjectList from "./components/Subjectmeritds/SubjectListdsmeritds";
import StudentList from "./components/Studentmeritds/StudentListdsmeritds";
import AllocationHome from "./components/Allocationmeritds/AllocationHomedsmeritds";
import SessionExecution from "./components/Allocationmeritds/SessionExecutiondsmeritds";
import ReportList from "./components/Reportsmeritds/ReportListdsmeritds";

import StudentMasterListds from "./pages/StudentMasterListds";

import Dashmconvdates from './pages/Dashmconvdates';
import Dashmconvdatesadmin from './pages/Dashmconvdatesadmin';
import Dashmconvdocs from './pages/Dashmconvdocs';
import Dashmconvdocsadmin from './pages/Dashmconvdocsadmin';
import Dashmconvfees from './pages/Dashmconvfees';
import Dashmconvfeesadmin from './pages/Dashmconvfeesadmin';
import Dashmconvgh from './pages/Dashmconvgh';
import Dashmconvghadmin from './pages/Dashmconvghadmin';
import Dashmconvtransport from './pages/Dashmconvtransport';
import Dashmconvtransportadmin from './pages/Dashmconvtransportadmin';
import TransportDriverPage from './pages/TransportDriverPage';
import TransportDriverRosterPage from './pages/TransportDriverRosterPage';
import TransportBusPassPage from './pages/TransportBusPassPage';
import Dashmconvguests from './pages/Dashmconvguests';
import Dashmconvguestsadmin from './pages/Dashmconvguestsadmin';
import Dashmconvattendees from './pages/Dashmconvattendees';
import Dashmconvattendeesadmin from './pages/Dashmconvattendeesadmin';

import Dashmvendords from './pages/Dashmvendords';
import Dashmvendordsadmin from './pages/Dashmvendordsadmin';
import Dashmvendoritemds from './pages/Dashmvendoritemds';
import Dashmvendoritemdsadmin from './pages/Dashmvendoritemdsadmin';
import Dashmrequisationds from './pages/Dashmrequisationds';
import Dashmrequisationdsadmin from './pages/Dashmrequisationdsadmin';
import Dashmitemmasterds from './pages/Dashmitemmasterds';
import Dashmitemmasterdsadmin from './pages/Dashmitemmasterdsadmin';
import Dashmstoreitemds from './pages/Dashmstoreitemds';
import Dashmstoreitemdsadmin from './pages/Dashmstoreitemdsadmin';
import Dashmstorerequisationds from './pages/Dashmstorerequisationds';
import Dashmstorerequisationdsadmin from './pages/Dashmstorerequisationdsadmin';
import Dashmstorepoorderds from './pages/Dashmstorepoorderds';
import Dashmstorepoorderdsadmin from './pages/Dashmstorepoorderdsadmin';
import Dashmstorepoitemsds from './pages/Dashmstorepoitemsds';
import Dashmstorepoitemsdsadmin from './pages/Dashmstorepoitemsdsadmin';
import Dashmstockregisterds from './pages/Dashmstockregisterds';
import Dashmstockregisterdsadmin from './pages/Dashmstockregisterdsadmin';


// Purchasing Module Imports - NEW
import FacultyCreateRequestds from './pages/FacultyCreateRequestds';
import FacultyRequestStatusds from './pages/FacultyRequestStatusds';
import StoreManagerDashboardds from './pages/StoreManagerDashboardds';
import PurchaseOrderDashboardds from './pages/PurchaseOrderDashboardds';
import DeliveryDashboardds from './pages/DeliveryDashboardds';
import DashboardPurchaseds from './pages/DashboardPurchaseds';
import PurchasingMasterDatads from './pages/PurchasingMasterDatads';

import Leadsdsadmin from './pages/Leaddsadmin';
import BulkLeadActionsds from './pages/BulkLeadActionsds';

import ApprovalConfigurationds from './pages/ApprovalConfigurationds';
import FacultyRequestApprovalds from './pages/FacultyRequestApprovalds';


import PurchaseCellInventoryds from './pages/PurchaseCellInventoryds';


import Institutionsds from './pages/Institutionsds';

import NewDashmuser from './pages/NewDashmuser';
import NewDashmcompany from './pages/NewDashmcompany';
import NewDashmroles from './pages/NewDashmroles';
import NewDashmadmission from './pages/NewDashmadmission';
import NewDashmappmodel2 from './pages/NewDashmappmodel2';
import NewDashmappmodel2cat from './pages/NewDashmappmodel2cat';
import NewApplicationReviewPage from './pages/NewApplicationReviewPage';
import NewDashmfeesadmin from './pages/NewDashmfeesadmin';
import NewDashmledgerstudadmin from './pages/NewDashmledgerstudadmin';
import NewDashmmfeescoladmin from './pages/NewDashmmfeescoladmin';
import NewInstitutionsds from './pages/NewInstitutionsds';
import NewDashmmprogramsadmin from './pages/NewDashmmprogramsadmin';
import NewDashmmcourseslistadmin from './pages/NewDashmmcourseslistadmin';
import NewDashmmstudents1admin from './pages/NewDashmmstudents1admin';
import NewDashmexamscheduleadmin from './pages/NewDashmexamscheduleadmin';
import NewDashmexamtimetableadmin from './pages/NewDashmexamtimetableadmin';
import NewDashmexamroomadmin from './pages/NewDashmexamroomadmin';
import NewDashmexamadmitadmin from './pages/NewDashmexamadmitadmin';
import NewDashmexammarksalladmin from './pages/NewDashmexammarksalladmin';
import NewDashmstudalloc1admin from './pages/NewDashmstudalloc1admin';
import NewDashmmguidesadmin from './pages/NewDashmmguidesadmin';
import NewDashmmctalentregadmin from './pages/NewDashmmctalentregadmin';
import NewDashmlmsvideosadmin from './pages/NewDashmlmsvideosadmin';
import NewDashboardPageHostel from './pages/NewDashboardPageHostel';
import NewHostelBuildingPage from './pages/NewHostelBuildingPage';
import NewHostelRoomPage from './pages/NewHostelRoomPage';
import NewLeadsds from './pages/NewLeadsds';
import NewDashboardCrmds from './pages/NewDashboardCrmds';
import NewDashboardPurchaseds from './pages/NewDashboardPurchaseds';
import NewPurchaseCellInventoryds from './pages/NewPurchaseCellInventoryds';
import NewVendormanagementds from './pages/NewVendormanagementds';
import NewPurchaseOrderDashboardds from './pages/NewPurchaseOrderDashboardds';
import NewDeliveryDashboardds from './pages/NewDeliveryDashboardds';
import NewAttendanceDashboard from './pages/NewAttendanceDashboard';
import NewJobApplicationPage from './pages/NewJobApplicationPage';
import NewSalaryManagement from './pages/NewSalaryManagement';
import NewLeavesPage from './pages/NewLeavesPage';
import NewDashmUseradmin from './pages/NewDashmUseradmin';
import NewDashmmacadcaladmin from './pages/NewDashmmacadcaladmin';
import NewDashmmassignmentsadmin from './pages/NewDashmmassignmentsadmin';
import NewDashmmanouncementsadmin from './pages/NewDashmmanouncementsadmin';
import NewDashmmcoursecoadmin from './pages/NewDashmmcoursecoadmin';
import NewDashmmcoursematerialadmin from './pages/NewDashmmcoursematerialadmin';
import NewDashmclassnewadmin from './pages/NewDashmclassnewadmin';
import NewDashmattendancenewadmin from './pages/NewDashmattendancenewadmin';
import NewDashmattyearadmin from './pages/NewDashmattyearadmin';
import NewDashmmindmaplistadmin from './pages/NewDashmmindmaplistadmin';
import NewDashmmindmapnodesadmin from './pages/NewDashmmindmapnodesadmin';
import NewDashmmindmapedgesadmin from './pages/NewDashmmindmapedgesadmin';
import NewDashmtimeslotsn1admin from './pages/NewDashmtimeslotsn1admin';
import NewDashmworkloadn1admin from './pages/NewDashmworkloadn1admin';
import NewDashmfacwcaladmin from './pages/NewDashmfacwcaladmin';
import NewDashmmfaccoursesadmin from './pages/NewDashmmfaccoursesadmin';
import NewDashmmfaccoursesattadmin from './pages/NewDashmmfaccoursesattadmin';
import NewDashmmattcalcadmin from './pages/NewDashmmattcalcadmin';
import NewDashmmcolevelsadmin from './pages/NewDashmmcolevelsadmin';
import AdminNavbar from './components/AdminNavbar';
import DashMainAdmin from './pages/DashMainAdmin';


import NewAttendanceReportds from './pages/NewAttendanceReportds';
import ItemCategoryds from './pages/ItemCategoryds';
import ItemUnitds from './pages/ItemUnitds';
import NewComunicationds from './pages/NewComunicationds';
import NewFileMasterds from './pages/newfilemasterds';
import NewFileMovementds from './pages/newfilemovementds';
import Dashstudprofileallds from './pages/Dashstudprofileallds';
import StudentProfile1ds from './pages/StudentProfile1ds';
import NewAttendanceTimeReportds from './pages/NewAttendanceTimeReportds';


import NewRoleListds from './pages/NewRoleListds';
import NewPurchaseUserAddds from './pages/NewPurchaseUserAddds';
import VendorComparisonSheetds from './pages/VendorComparisonSheetds';


import CashApprovalds from './pages/CashApprovalds';
import ApproveCashApprovalds from './pages/ApproveCashApprovalds';

import Pipelinestageag from './pages/pipelinestageag';
import Outcomeag from './pages/outcomeag';

import RoleLayout from './components/RoleLayout';

import Viewmexamtimetables from './pages/Viewmexamtimetables';

import FeeSummaryReport from './pages/FeeSummaryReport';

import ProgramFeeReport from './pages/ProgramFeeReport';
import StudentLedgerReport from './pages/StudentLedgerReport';

import RevenueDashboard from './pages/RevenueDashboard';

import FeeCReport from './pages/FeeCReport';

import Oicrmrep2 from './pages/Oicrmrep2';
import Crmreports2 from './pages/Crmreports2';

import Dailyfeesreport1 from './pages/Dailyfeesreport1';

import Dashmfeespayl from './pages/Dashmfeespayl';

import CrmdsReportsPage from './pages/crmdsReportsPage.jsx';
import CrmdsOverdueLeadsPage from './pages/crmdsOverdueLeadsPage.jsx';
import CrmdsCounsellorWiseLeadsReport from './pages/crmdsCounsellorWiseLeadsReport.jsx';
import CrmdsPipelineStageWiseReport from './pages/crmdsPipelineStageWiseReport.jsx';
import CrmdsSourceWiseLeadsReport from './pages/crmdsSourceWiseLeadsReport.jsx';
import CrmdsDateWiseNewLeads from './pages/crmdsDateWiseNewLeads.jsx';

import Dashmcrmstage from './pages/Dashmcrmstage';

import Viewcrmstagepivot from './pages/Viewcrmstagepivot';
import Viewcrmstagepivot2 from './pages/Viewcrmstagepivot2';

import Crompipedrill from './pages/Crompipedrill';

import Keiaddquestion from './pages/Keiaddquestion';
import Keiteacherformsall from './pages/Keiteacherformsall';
import Keiteacherformsall1 from './pages/Keiteacherformsall1';
import Keiteacherperformancs from './pages/Keiteacherperformancs';

import Pucadmissionform from './pages/Pucadmissionform';

import DashmkeiquestionModel from './pages/DashmkeiquestionModel';
import DashmkeiquestionModeladmin from './pages/DashmkeiquestionModeladmin';

import Keifacultyreport from './pages/Keifacultyreport';

import Dashmkeiyear from './pages/Dashmkeiyear';
import Dashmkeiyearadmin from './pages/Dashmkeiyearadmin';

import Dashmkeiyearmy from './pages/Dashmkeiyearmy';

import Dashmunivampus from './pages/Dashmunivampus';
import Dashmunivampusadmin from './pages/Dashmunivampusadmin';
import Dashmunivfac from './pages/Dashmunivfac';
import Dashmunivfacadmin from './pages/Dashmunivfacadmin';
import Dashmunivdep from './pages/Dashmunivdep';
import Dashmunivdepadmin from './pages/Dashmunivdepadmin';



import BudgetTypeds from './pages/BudgetTypeds';
import BudgetApproverds from './pages/BudgetApproverds';
import BudgetDashboardds from './pages/BudgetDashboardds';
import BudgetApprovalds from './pages/BudgetApprovalds';
import IndBudgetApprovalRolesPage from './pages/IndBudgetApprovalRolesPage';
import {
  NewBudgetCategoryPage,
  NewBudgetAuditLogPage,
  NewBudgetAnalysisPage,
  NewBudgetBlockchainPage,
  NewBudgetBlockchainVerifyPage,
  NewBudgetDepartmentReportPage,
  NewBudgetDepartmentApprovalPage,
  NewBudgetDepartmentWorkflowPage,
  NewBudgetEntryPage,
  NewBudgetInstitutionApprovalPage,
  NewBudgetInstitutionWorkflowPage,
  NewBudgetSubmissionActivationPage
} from './pages/NewBudgetApprovalPages';
import {
  PurchaseNewApprovedIndentsPage,
  PurchaseNewDepartmentApprovalPage,
  PurchaseNewDepartmentWorkflowPage,
  PurchaseNewIndentAuditLogPage,
  PurchaseNewIndentHistoryPage,
  PurchaseNewIndentPage,
  PurchaseNewItemMasterPage,
  PurchaseNewAssignedStoreIndentsPage,
  PurchaseNewInstitutionApprovalPage,
  PurchaseNewInstitutionWorkflowPage,
  PurchaseNewStoreIndentPage,
  PurchaseNewStoreApprovalPage,
  PurchaseNewStoreWorkflowPage,
  PurchaseNewStorePage,
  PurchaseNewStoreUserAssignmentPage,
  PurchaseNewPoWorkflowPage,
  PurchaseNewFinanceWorkflowPage,
  PurchaseNewRfpWorkflowPage,
  PurchaseNewCategoryOfficerPage,
  PurchaseNewOfficerWorkbenchPage,
  PurchaseNewRfpApprovalPage,
  PurchaseNewVendorPage,
  PurchaseNewRfpVendorAssignmentPage,
  PurchaseNewApprovedRfpsPage,
  PurchaseNewApprovedRfpsBlockchainVerifyPage,
  PurchaseNewRfpBlockchainVerifyPage,
  PurchaseNewVendorLoginPage,
  PurchaseNewVendorDashboardPage,
  PurchaseNewVendorProfilePage,
  PurchaseNewVendorRfpsPage,
  PurchaseNewVendorPoPage,
  PurchaseNewRfpSubmissionVerifyPage,
  PurchaseNewPoVerifyPage,
  PurchaseNewVendorComparisonPage,
  PurchaseNewPoApprovalPage,
  PurchaseNewApprovedPoPage,
  PurchaseNewVendorDeliverySchedulePage,
  PurchaseNewVendorDeliveryStatusPage,
  PurchaseNewVendorInvoicePage,
  PurchaseNewQualityPage,
  PurchaseNewInvoiceApprovalPage,
  PurchaseNewInvoiceAgingPage,
  PurchaseNewInvoicePaymentPage,
  PurchaseNewInvoiceStatusPage,
  PurchaseNewDeliveryNoteVerifyPage,
  PurchaseNewInvoiceVerifyPage
} from './pages/PurchaseNewPages';
import {
  RequisitionCreatePage,
  RequisitionDepartmentApprovalPage,
  RequisitionDepartmentWorkflowPage,
  RequisitionInstitutionApprovalPage,
  RequisitionInstitutionWorkflowPage,
  RequisitionStoreApprovalPage,
  RequisitionStockRegisterPage,
  RequisitionStoreViewPage,
  RequisitionStoreWorkflowPage
} from './pages/RequisitionPages';
import {
  AssetNewInventoryPage,
  AssetNewTrackingPage,
  AssetNewReissuePage,
  AssetNewRetirementPage,
  AssetNewReportsPage
} from './pages/AssetManagementNewPages';

import Dashchattestadmin from './pages/Dashchattestadmin';

import Dashmfeebook from './pages/Dashmfeebook';
import Dashmfeebookadmin from './pages/Dashmfeebookadmin';
import Dashmcashbook from './pages/Dashmcashbook';
import Dashmcashbookadmin from './pages/Dashmcashbookadmin';
import MFeesConfigPage from './pages/MFeesConfigPage';
import FeeApprovalPage from './pages/FeeApprovalPage';
import FeeApprovalRolesPage from './pages/FeeApprovalRolesPage';
import FeeApplicationPage from './pages/FeeApplicationPage';
import FeesApplicationAutoPage from './pages/FeesApplicationAutoPage';
import StudentLedgerCrudPage from './pages/StudentLedgerCrudPage';
import StudentLedgerMasterPage from './pages/StudentLedgerMasterPage';
import FeeRefundManagementPage from './pages/FeeRefundManagementPage';
import FeeRefundSummaryPage from './pages/FeeRefundSummaryPage';
import UpdateFeeRefundPage from './pages/UpdateFeeRefundPage';
import FeesModelReportPage from './pages/FeesModelReportPage';
import StudentFeeApplyPage from './pages/StudentFeeApplyPage';
import StudentLedgerApprovalPage from './pages/StudentLedgerApprovalPage';
import StudentLedgerApprovalRolesPage from './pages/StudentLedgerApprovalRolesPage';
import StudentLedgerAdjustmentPage from './pages/StudentLedgerAdjustmentPage';
import StudentLedgerAnalyticsPage from './pages/StudentLedgerAnalyticsPage';
import StudentLedgerPaidAnalyticsPage from './pages/StudentLedgerPaidAnalyticsPage';
import FeesPivotPage from './pages/FeesPivotPage';
import FeesPivot2Page from './pages/FeesPivot2Page';
import FeesPaidReportPage from './pages/FeesPaidReportPage';
import ProgramwiseFeesReportPage from './pages/ProgramwiseFeesReportPage';
import PendingFeesPage from './pages/PendingFeesPage';
import DisciplinaryActionPage from './pages/DisciplinaryActionPage';
import DisciplinaryActionUpdatePage from './pages/DisciplinaryActionUpdatePage';
import ExamrollRulesCheckPage from './pages/ExamrollRulesCheckPage';
import { DetainedStudentsPage, ExamrollDisciplinaryHoldPage, FeesDefaultersPage } from './pages/ExamrollExceptionReviewPage';
import ConductExamHallTicketPage, { PublicHallTicketBlockchainVerifyPage, StudentAdmitCardNewPage } from './pages/ConductExamHallTicketPage';
import StudentViewControlPage from './pages/StudentViewControlPage';
import StudentLedgerCounterPaymentPage from './pages/StudentLedgerCounterPaymentPage';
import CounterFee2PaymentPage from './pages/CounterFee2PaymentPage';
import CounterFee3PaymentPage from './pages/CounterFee3PaymentPage';
import CounterFee4PaymentPage from './pages/CounterFee4PaymentPage';
import CounterFee5PaymentPage from './pages/CounterFee5PaymentPage';
import CounterFee2ReceiptPage from './pages/CounterFee2ReceiptPage';
import CounterFee4ReceiptPage from './pages/CounterFee4ReceiptPage';
import FeesReceiptNotePage from './pages/FeesReceiptNotePage';
import StudentOnlineFeePayment2Page from './pages/StudentOnlineFeePayment2Page';
import ChequePaymentDetailsPage from './pages/ChequePaymentDetailsPage';
import { MiscellaneousAmountPage, MiscellaneousFeeCollectionPage } from './pages/MiscellaneousFeesPages';
import StudentFeesReceiptPage from './pages/StudentFeesReceiptPage';
import BlockchainStudentFeesReceiptPage from './pages/BlockchainStudentFeesReceiptPage';
import BlockchainFeesReceiptVerifyPage from './pages/BlockchainFeesReceiptVerifyPage';
import StudentLedgerDetailPage from './pages/StudentLedgerDetailPage';
import ResearchApprovalMatrixPage from './pages/ResearchApprovalMatrixPage';
import ResearchComponentPage from './pages/ResearchComponentPage';
import ResearchGrantApplyPage from './pages/ResearchGrantApplyPage';
import ResearchGrantApprovalPage from './pages/ResearchGrantApprovalPage';
import ResearchGrantSummaryPage from './pages/ResearchGrantSummaryPage';
import Dashmwebcourses from './pages/Dashmwebcourses';
import Dashmwebcoursesadmin from './pages/Dashmwebcoursesadmin';
import Dashmwebevents from './pages/Dashmwebevents';
import Dashmwebeventsadmin from './pages/Dashmwebeventsadmin';

import Dashmhrstructure from './pages/Dashmhrstructure';
import Dashmhrstructureadmin from './pages/Dashmhrstructureadmin';
import Dashmhrstructuresal from './pages/Dashmhrstructuresal';
import Dashmhrstructuresaladmin from './pages/Dashmhrstructuresaladmin';
import Dashmhrsalstructure from './pages/Dashmhrsalstructure';
import Dashmhrsalstructureadmin from './pages/Dashmhrsalstructureadmin';
import Dashmhrsalary from './pages/Dashmhrsalary';
import Dashmhrsalaryadmin from './pages/Dashmhrsalaryadmin';
import Dashmhrempledger from './pages/Dashmhrempledger';
import Dashmhrempledgeradmin from './pages/Dashmhrempledgeradmin';

import Salarypivot from './pages/Salarypivot';
import Salarypivot1 from './pages/Salarypivot1';
import HrSalaryComponentReport from './pages/HrSalaryComponentReport';
import HrSalarySlipPage from './pages/HrSalarySlipPage';
import MySalarySlipPage from './pages/MySalarySlipPage';
import HrForm16Page from './pages/HrForm16Page';
import HrCompanyTaxDetailsPage from './pages/HrCompanyTaxDetailsPage';
import HrEmployeePanPage from './pages/HrEmployeePanPage';
import HrTdsDepositPage from './pages/HrTdsDepositPage';
import VisitingFacultyRegisterPage from './pages/VisitingFacultyRegisterPage';
import VisitingFacultyClassPage from './pages/VisitingFacultyClassPage';
import VisitingFacultyPayPage from './pages/VisitingFacultyPayPage';
import UgcSeventhPayStructurePage from './pages/UgcSeventhPayStructurePage';
import MenuAccessControlPage from './pages/MenuAccessControlPage';
import ProgramwiseAccessPage from './pages/ProgramwiseAccessPage';
import HrResignationPage from './pages/HrResignationPage';
import HrResignationReportPage from './pages/HrResignationReportPage';
import { EmployeeLedgerNewPage, SalaryPaymentWorkflowPage, SalarySheetApprovalPage } from './pages/SalaryPaymentApprovalPages';
import {
  DepartmentOrgChartPage,
  EmployeeReportingPage,
  HrExpenseApprovalPage,
  HrExpenseReportPage,
  HrExpenseRulesPage,
  HrExpenseStatusPage,
  HrExpenseSubmitPage,
  HrExpenseWorkflowPage,
  HrSalaryRegisterPage,
  InstitutionOrgChartPage,
  OrganizationHierarchyPage
} from './pages/HrAdvancedPages';
import HrHelpPage from './pages/HrHelpPage';
import {
  AcademicConfigurationHelpPage,
  AiHelpdeskHelpPage,
  AdmissionHelpPage,
  ExaminationHelpPage,
  FeesHelpPage,
  LibraryNewHelpPage,
  MenuManagementHelpPage,
  NepLmsHelpPage,
  PlacementCoordinatorHelpPage,
  ProfileHelpPage,
  RecruitmentHelpPage,
  TranscriptHelpPage,
  UserManagementHelpPage
} from './pages/HelpDocumentationPages';
import MenuPageShell from './pages/MenuPageShell';

import Salarygenerator from './pages/Salarygenerator';
import Salassign from './pages/Salassign';

import Examapply from './pages/Examapply';
import Examapply1 from './pages/Examapply1';

import Dashmexamnewrubrics1 from './pages/Dashmexamnewrubrics1';
import Dashmexamnewrubrics1admin from './pages/Dashmexamnewrubrics1admin';

import Dashmexamext1 from './pages/Dashmexamext1';
import Dashmexamext1admin from './pages/Dashmexamext1admin';
import Dashmexamtotal1 from './pages/Dashmexamtotal1';
import Dashmexamtotal1admin from './pages/Dashmexamtotal1admin';

import Examtransfer from './pages/Examtransfer';

import Salassign1 from './pages/Salassign1';
import Gametoys from './pages/Gametoys';
import Saldeduction from './pages/Saldeduction';

import Saldeductiontdspf from './pages/Saldeductiontdspf';
import Salarytransfer from './pages/Salarytransfer';
import PopulateArrearPage from './pages/PopulateArrearPage';

import Dashmprtemplate from './pages/Dashmprtemplate';
import Dashmprtemplateadmin from './pages/Dashmprtemplateadmin';
import Dashmprtemplateapprovers from './pages/Dashmprtemplateapprovers';
import Dashmprtemplateapproversadmin from './pages/Dashmprtemplateapproversadmin';
import Dashmprlist from './pages/Dashmprlist';
import Dashmprlistadmin from './pages/Dashmprlistadmin';
import Dashmpritems from './pages/Dashmpritems';
import Dashmpritemsadmin from './pages/Dashmpritemsadmin';
import Dashmitemlist from './pages/Dashmitemlist';
import Dashmitemlistadmin from './pages/Dashmitemlistadmin';
import Dashmcategorybudget from './pages/Dashmcategorybudget';
import Dashmcategorybudgetadmin from './pages/Dashmcategorybudgetadmin';
import Dashmpraudit from './pages/Dashmpraudit';
import Dashmprauditadmin from './pages/Dashmprauditadmin';

import Mrncreate from './pages/Mrncreate';
import Prapproverscreen from './pages/Prapproverscreen';

import Mrnapprover1 from './pages/Mrnapprover1';







import StorePage from "./pages/StorePage";
import StockPage from "./pages/StockPage";
import CategoryPage from "./pages/CategoryPage";


import StockPage1 from "./pages/StockPage1";
import BudgetPage from "./pages/BudgetPage";
import BudgetLogPage from "./pages/BudgetLogPage";
import Indentpage from "./pages/Indentpage";

import IndentPage1 from "./pages/IndentPage1";
import IndentApproval from "./pages/IndentApproval";
import IndentApproval1 from "./pages/IndentApproval1";
import IndentByUserPrintPage from "./pages/IndentByUserPrintPage";



import RfpPage from "./pages/RfpPage";
import VendorPage from "./pages/VendorPage";

import VendorComparisonPage from "./pages/VendorComparisonPage";

import VendorNegotiation from "./pages/VendorNegotiation";
import VendorFinalPrice from "./pages/VendorFinalPrice";
import VendorNegotiation1 from "./pages/VendorNegotiation1";

import VendorFinalComparison from "./pages/VendorFinalComparison";
import VendorFinalComparison1 from "./pages/VendorFinalComparison1";

import CategoryOfficerPage from "./pages/CategoryOfficerPage";

import CreatePoPage from "./pages/CreatePoPage";

import CreatePOPage1 from "./pages/CreatePOPage1";

import POApprovalPage from "./pages/POApprovalPage";
import POApprovalPage1 from "./pages/POApprovalPage1";
import POApprovalRolesPage from "./pages/POApprovalRolesPage";


import DeliverySchedulePage from "./pages/DeliverySchedulePage";
import POShipmentBatchPage from "./pages/POShipmentBatchPage";
import POSecurityReceivePage from "./pages/POSecurityReceivePage";
import POReceivedInspectionPage from "./pages/POReceivedInspectionPage";
import QualityPage from "./pages/QualityPage";
import GRNPage from "./pages/GRNPage";
import GRNViewPage from "./pages/GRNViewPage";

import POReceivedSummary from "./pages/POReceivedSummary";
import InwardGatePass from "./pages/InwardGatePass";
import InvoicePaymentPage from "./pages/InvoicePaymentPage";
import InvoiceCreatePage from "./pages/InvoiceCreatePage";
import FinanceDashboard from "./pages/FinanceDashboard";

import PrepDashboard from "./pages/PrepDashboard";
import PrepDepartmentDetails from "./pages/PrepDepartmentDetails";
import IndIndentApprovalRolesPage from "./pages/IndIndentApprovalRolesPage";

import FinanceDashboardNew from "./pages/FinanceDashboardNew";
import AgingDashboardPage from "./pages/AgingDashboardPage";

import VendorLedgerPage from "./pages/VendorLedgerPage";
import OverduePage from './pages/OverduePage';
import VendorLedgerPage1 from "./pages/VendorLedgerPage1";

import VendorDashboardPage from "./pages/VendorDashboardPage";

import VendorCreatePage from "./pages/VendorCreatePage";
import VendorLoginPage from "./pages/VendorLoginPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import VendorProfilePage1 from "./pages/VendorProfilePage1";

import VendorCreatePage1 from "./pages/VendorCreatePage1";

import VendorLoginPage1 from "./pages/VendorLoginPage1";
import VendorProfilePage2 from "./pages/VendorProfilePage2";

import RfpFromIndentPage from "./pages/RfpFromIndentPage";
import RfpViewPage from "./pages/RfpViewPage";
import RfpPrintViewPage from "./pages/RfpPrintViewPage";

import VendorMapPage from "./pages/VendorMapPage";

import VendorHomePage from "./pages/VendorHomePage";
import VendorRfpPage from "./pages/VendorRfpPage";
import VendorRfpSubmitPage from "./pages/VendorRfpSubmitPage";
import VendorSubmitPage from "./pages/VendorSubmitPage";
import VendorSubmitPage1 from "./pages/VendorSubmitPage1";
import VendorSubmitPage2 from "./pages/VendorSubmitPage2";

import BellUpload from "./pages/BellUpload";
import BellDashboard from "./pages/BellDashboard";
import BellDashboard1 from "./pages/BellDashboard1";

import BellConfig from "./pages/BellConfig";

import BellDashboardnew from "./pages/BellDashboardnew";
import BellUploadnew from "./pages/BellUploadnew";

import Rbellconfig from "./pages/Rbellconfig";
import Rbellupload from "./pages/Rbellupload";
import Rbelldashboard from "./pages/Rbelldashboard";

import VendorComparisonPagecol from "./pages/VendorComparisonPagecol";

import Mbuser from "./pages/Mbuser";

import VendorComparisonPagecol1 from "./pages/VendorComparisonPagecol1";
import VendorComparisonPagecol2 from "./pages/VendorComparisonPagecol2";
import VendorComparisonPagecol3 from "./pages/VendorComparisonPagecol3";
import ItemWisePOPerPage from "./pages/ItemWisePOPerPage";

import POPrintPage from "./pages/POPrintPage";

import POPrintPage1 from "./pages/POPrintPage1";
import POPrintPage2 from "./pages/POPrintPage2";

import Insdetails from "./pages/Insdetails";
import IndentApproval2 from "./pages/IndentApproval2";


import IndentPage2 from "./pages/IndentPage2";

import RfpFromIndentPage1 from "./pages/RfpFromIndentPage1";
import RfpFromIndentPage4 from "./pages/RfpFromIndentPage4";

















































function App() {
  useEffect(() => observeStudentLabelChanges(), []);

  const HomePage = () => {
    const host = window.location.hostname.toLowerCase();
    return host.includes("orthintel") ? <OrthintelHomepage /> : <CampusWebsite />;
  };
  const withMenu = (title, page) => <MenuPageShell title={title}>{page}</MenuPageShell>;

  return (
    <Router>
         <AdminNavbar />
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/event-new-public-register" element={<EventNewPublicRegisterPage />} />
        <Route path="/event-new-public-feedback" element={<EventNewPublicFeedbackPage />} />
        <Route path="/event-new-certificate" element={<EventNewPublicCertificatePage />} />
        <Route path="/event-new-events" element={<EventNewCrudPage mode="events" />} />
        <Route path="/event-new-attendees" element={<EventNewCrudPage mode="attendees" />} />
        <Route path="/event-new-distinguished-attendees" element={<EventNewCrudPage mode="distinguished" />} />
        <Route path="/event-new-vehicles" element={<EventNewCrudPage mode="vehicles" />} />
        <Route path="/event-new-transport-requirements" element={<EventNewCrudPage mode="transportrequirements" />} />
        <Route path="/event-new-vehicle-allocations" element={<EventNewCrudPage mode="vehicleallocations" />} />
        <Route path="/event-new-vehicle-auto-allocation" element={<EventNewAllocationPage />} />
        <Route path="/event-new-reports" element={<EventNewReportsPage />} />
        <Route path="/event-new-transport-reports" element={<EventNewTransportReportsPage />} />
        <Route path="/event-new-paper-submission" element={<EventPaperSubmissionPage />} />
        <Route path="/event-new-paper-submission-report" element={<EventPaperSubmissionReportPage />} />
        <Route path="/guest-house-buildings" element={<EventNewCrudPage mode="guestbuildings" />} />
        <Route path="/guest-house-rooms" element={<EventNewCrudPage mode="guestrooms" />} />
        <Route path="/guest-house-reservations" element={<EventNewCrudPage mode="guestreservations" />} />
        <Route path="/guest-house-availability" element={<GuestHouseAvailabilityPage />} />
        <Route path="/guest-house-allocation" element={<GuestHouseAllocationPage />} />
        <Route path="/guest-house-reports" element={<GuestHouseReportsPage />} />
        <Route path="/orthintel-home" element={<OrthintelHomepage />} />
        <Route path="/viewcourse1" element={<Viewcourse1 />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/learning-management-system" element={<LearningManagementSystem />} />
        <Route path="/naac" element={<NAAC />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/Parct1" element={<Parct1 />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/delete/:id" element={<DeleteUser />} />
        {/* <Route path="/users" element={<Users />} /> */}
        <Route path="/export" element={<ExportUsers />} />
        <Route path="/dashmcas11" element={<Dashmcas11 />} />
        <Route path="/dashmncas11" element={<Dashmncas11 />} />
        <Route path="/dashmncas11admin" element={<Dashmncas11admin />} />
        <Route path="/Login3" element={<Login />} />
        <Route path="/dashmncas12" element={<Dashmncas12 />} />
        <Route path="/dashmncas12admin" element={<Dashmncas12admin />} />

        <Route path="/rfpfromindentpage4" element={<RfpFromIndentPage4 />} />
        <Route path="/rfpfromindentpage1" element={<RfpFromIndentPage1 />} />

        <Route path="/indentpage2" element={<IndentPage2 />} />

        <Route path="/indentapproval2" element={<IndentApproval2 />} />
        <Route path="/indindentapprovalroles" element={<IndIndentApprovalRolesPage />} />

        <Route path="/insdetails" element={<Insdetails />} />
        
        <Route path="/poprintpage2" element={<POPrintPage2 />} />
        <Route path="/poprintpage1" element={<POPrintPage1 />} />
        <Route path="/poprintpage" element={<POPrintPage />} />
        <Route path="/itemwisepoperpage" element={<ItemWisePOPerPage />} />

        <Route path="/mbuser" element={<Mbuser />} />

        <Route path="/vendorcomparisonpagecol3" element={<VendorComparisonPagecol3 />} />
        <Route path="/vendorcomparisonpagecol2" element={<VendorComparisonPagecol2 />} />
        <Route path="/vendorcomparisonpagecol" element={<VendorComparisonPagecol />} />
        <Route path="/vendorcomparisonpagecol1" element={<VendorComparisonPagecol1 />} />

        <Route path="/rbelldashboard" element={<Rbelldashboard />} />
        <Route path="/rbellconfig" element={<Rbellconfig />} />
        <Route path="/rbellupload" element={<Rbellupload />} />



        <Route path="/belluploadnew" element={<BellUploadnew />} />
        <Route path="/belldashboardnew" element={<BellDashboardnew />} />

        <Route path="/bellconfig" element={<BellConfig />} />
        <Route path="/belldashboard" element={<BellDashboard1 />} />
        <Route path="/bellupload" element={<BellUpload />} />



           <Route path="/vendor-submit" element={<VendorSubmitPage2 />} />
        <Route path="/vendor-home" element={<VendorHomePage />} />
        <Route path="/vendor-rfp" element={<VendorRfpPage />} />
        <Route path="/vendor-rfp-submit" element={<VendorRfpSubmitPage />} />

        <Route path="/vendormappage" element={<VendorMapPage />} />

        <Route path="rfpviewpage" element={<RfpViewPage />} />
        <Route path="/rfpprintview" element={<RfpPrintViewPage />} />

        <Route path="/rfpfromindent" element={<RfpFromIndentPage />} />

        <Route path="/vendorloginpage" element={<VendorLoginPage />} />
        <Route path="/vendor-login" element={<VendorLoginPage1 />} />
        {/* <Route path="/vendorprofilepage" element={<VendorProfilePage />} /> */}
        <Route path="/vendor-profile" element={<VendorProfilePage2 />} />
        <Route path="/vendorcreatepage" element={<VendorCreatePage />} />
        <Route path="/vendorcreatepage1" element={<VendorCreatePage1 />} />

        <Route path="/vendordashboardpage" element={<VendorDashboardPage />} />
        <Route path="/vendorledgerpage1" element={<VendorLedgerPage1 />} />
        <Route path="/overduepage" element={<OverduePage />} />
        <Route path="/vendorledgerpage" element={<VendorLedgerPage />} />
        <Route path="/agingdashboardpage" element={<AgingDashboardPage />} />

        <Route path="/financedashboardnew" element={<FinanceDashboardNew />} />

        <Route path="/prepdashboard" element={<PrepDashboard />} />
        <Route path="/prep/department/:name" element={<PrepDepartmentDetails />} />

        <Route path="/Financedashboard" element={<FinanceDashboard />} />
        <Route path="/invoicecreatepage" element={<InvoiceCreatePage />} />
        <Route path="/invoicepaymentpage" element={<InvoicePaymentPage />} />
        <Route path="/inwardgatepass" element={<InwardGatePass />} />

        <Route path="/poreceivedsummary" element={<POReceivedSummary />} />
        <Route path="/grnviewpage" element={<GRNViewPage />} />

        <Route path="/grnpage" element={<GRNPage />} />
        <Route path="/qualitypage" element={<QualityPage />} />
        <Route path="/po-shipment-batches" element={<POShipmentBatchPage />} />
        <Route path="/po-security-receive" element={<POSecurityReceivePage />} />
        <Route path="/po-received-inspection" element={<POReceivedInspectionPage />} />
        <Route path="/deliveryschedulepage" element={<DeliverySchedulePage />} />

        <Route path="/poapprovalpage1" element={<POApprovalPage1 />} />
        <Route path="/poapprovalpage" element={<POApprovalPage />} />
        <Route path="/poapprovalroles" element={<POApprovalRolesPage />} />
        <Route path="/createpopage1" element={<CreatePOPage1 />} />
        <Route path="/createpopage" element={<CreatePoPage />} />
        <Route path="/categoryofficerpage" element={<CategoryOfficerPage />} />

        <Route path="/vendorfinalcomparison" element={<VendorFinalComparison />} />
        <Route path="/vendorfinalcomparison1" element={<VendorFinalComparison1 />} />

        <Route path="/vendornegotiation1" element={<VendorNegotiation1 />} />
        <Route path="/vendornegotiation" element={<VendorNegotiation />} />
        <Route path="/vendorfinalprice" element={<VendorFinalPrice />} />
        <Route path="/vendorcomparisonpage" element={<VendorComparisonPage />} />
        <Route path="/VendorPage" element={<VendorPage />} />
        <Route path="/rfppage" element={<RfpPage />} />
        <Route path="/indentapproval1" element={<IndentApproval1 />} />
        <Route path="/indentbyuser" element={<IndentByUserPrintPage />} />

        <Route path="/indentpage1" element={<IndentPage1 />} />
        <Route path="/indentapproval" element={<IndentApproval />} />

        <Route path="/indentpage" element={<Indentpage />} />
        <Route path="/budgetpage" element={<BudgetPage />} />
        <Route path="/budgetlog" element={<BudgetLogPage />} />
        <Route path="/stockpage1" element={<StockPage1 />} />

        <Route path="/storepage" element={<StorePage />} />
        <Route path="/stockpage" element={<StockPage />} />
        <Route path="/categorypage" element={<CategoryPage />} />




        <Route path="/mrnapprover1" element={<Mrnapprover1 />} />

        <Route path="/prapproverscreen" element={<Prapproverscreen />} />

        <Route path="/mrncreate" element={<Mrncreate />} />

        <Route path="/dashmprtemplate" element={<Dashmprtemplate />} />
<Route path="/dashmprtemplateadmin" element={<Dashmprtemplateadmin />} />
<Route path="/dashmprtemplateapprovers" element={<Dashmprtemplateapprovers />} />
<Route path="/dashmprtemplateapproversadmin" element={<Dashmprtemplateapproversadmin />} />
<Route path="/dashmprlist" element={<Dashmprlist />} />
<Route path="/dashmprlistadmin" element={<Dashmprlistadmin />} />
<Route path="/dashmpritems" element={<Dashmpritems />} />
<Route path="/dashmpritemsadmin" element={<Dashmpritemsadmin />} />
<Route path="/dashmitemlist" element={<Dashmitemlist />} />
<Route path="/dashmitemlistadmin" element={<Dashmitemlistadmin />} />
<Route path="/dashmcategorybudget" element={<Dashmcategorybudget />} />
<Route path="/dashmcategorybudgetadmin" element={<Dashmcategorybudgetadmin />} />
<Route path="/dashmpraudit" element={<Dashmpraudit />} />
<Route path="/dashmprauditadmin" element={<Dashmprauditadmin />} />


        <Route path="/salarytransfer" element={<Salarytransfer />} />
        <Route path="/populatearrear" element={<PopulateArrearPage />} />
        <Route path="/saldeductiontdspf" element={<Saldeductiontdspf />} />
        <Route path="/saldeduction" element={<Saldeduction />} />

        <Route path="/gametoys" element={<Gametoys />} />
        <Route path="/salassign1" element={<Salassign1 />} />
        <Route path="/examtransfer" element={<Examtransfer />} />

        <Route path="/dashmexamext1" element={<Dashmexamext1 />} />
        <Route path="/dashmexamext1admin" element={<Dashmexamext1admin />} />
        <Route path="/dashmexamtotal1" element={<Dashmexamtotal1 />} />
        <Route path="/dashmexamtotal1admin" element={<Dashmexamtotal1admin />} />


        <Route path="/dashmexamnewrubrics1" element={<Dashmexamnewrubrics1 />} />
        <Route path="/dashmexamnewrubrics1admin" element={<Dashmexamnewrubrics1admin />} />


        <Route path="/examapply1" element={<Examapply1 />} />
        <Route path="/examapply" element={<Examapply />} />
        <Route path="/salassign" element={<Salassign />} />

        <Route path="/salarygenerator" element={<Salarygenerator />} />
        <Route path="/salarypivot1" element={<Salarypivot1 />} />
        <Route path="/salarypivot" element={<Salarypivot />} />
        <Route path="/hrsalarycomponentreport" element={<HrSalaryComponentReport />} />
        <Route path="/hrsalaryslip" element={<HrSalarySlipPage />} />
        <Route path="/mysalaryslip" element={<MySalarySlipPage />} />
        <Route path="/salarypaymentworkflow" element={<SalaryPaymentWorkflowPage />} />
        <Route path="/salarysheetapproval" element={<SalarySheetApprovalPage />} />
        <Route path="/employeeledgernew" element={<EmployeeLedgerNewPage />} />
        <Route path="/myemployeeledger" element={<EmployeeLedgerNewPage mine />} />
        <Route path="/employeesalaryregister" element={<HrSalaryRegisterPage />} />
        <Route path="/mysalaryregister" element={<HrSalaryRegisterPage mine />} />
        <Route path="/hrform16" element={<HrForm16Page />} />
        <Route path="/hrcompanytaxdetails" element={<HrCompanyTaxDetailsPage />} />
        <Route path="/hremployeepan" element={<HrEmployeePanPage />} />
        <Route path="/hrtdsdeposited" element={<HrTdsDepositPage />} />
        <Route path="/visitingfaculty" element={<VisitingFacultyRegisterPage />} />
        <Route path="/visitingfacultyregister" element={<VisitingFacultyClassPage />} />
        <Route path="/visitingfacultypay" element={<VisitingFacultyPayPage />} />
        <Route path="/ugcseventhpaystructure" element={<UgcSeventhPayStructurePage />} />
        <Route path="/hrresignation" element={<HrResignationPage />} />
        <Route path="/hrresignationreport" element={<HrResignationReportPage />} />
        <Route path="/menuaccesscontrol" element={<MenuAccessControlPage />} />
        <Route path="/usercustomfields" element={<UserCustomFieldsPage />} />
        <Route path="/userdataupload" element={<UserDataUploadPage />} />
        <Route path="/studentdocumentmapping" element={<StudentDocumentMappingBulkPage />} />
        <Route path="/studentcompleteprofile" element={<StudentCompleteProfilePage />} />
        <Route path="/usereditjoiningdate" element={<UserEditJoiningDatePage />} />
        <Route path="/userdocumentrequirements" element={<UserDocumentRequirementPage />} />
        <Route path="/userdocumentupload" element={<UserDocumentUploadPage />} />
        <Route path="/userbankaccounts" element={<UserBankAccountPage />} />
        <Route path="/studentbankaccounts" element={<UserBankAccountPage student />} />
        <Route path="/useracademicdetails" element={<UserAcademicDetailsPage />} />
        <Route path="/useremploymentdetails" element={<UserEmploymentDetailsPage />} />
        <Route path="/userprofiledetailrequirements" element={<UserProfileDetailRequirementsPage />} />
        <Route path="/useracademicemploymentadmin" element={<UserAcademicEmploymentAdminPage />} />
        <Route path="/userfullprofile" element={<UserProfileFullPage />} />
        <Route path="/myfullprofile" element={<MyProfileFullPage />} />
        <Route path="/userprofilelayout" element={<UserProfileLayoutPage />} />
        <Route path="/userprofiledisplaylayout" element={<UserProfileDisplayLayoutPage />} />
        <Route path="/userprofilelayoutdisplay" element={<UserProfileLayoutDisplayPage />} />
        <Route path="/studentprofilelayoutdisplay" element={<StudentProfileLayoutDisplayPage />} />
        <Route path="/studentadmissionprofile" element={<DynamicAdmissionProfile2Page student />} />
        <Route path="/studentdynamicprofile" element={<StudentCombinedDynamicProfilePage />} />
        <Route path="/userprofileedit" element={<UserProfileEditPage />} />
        <Route path="/studentprofiledynamic" element={<UserProfileEditPage student />} />
        <Route path="/userprofileapprovalworkflow" element={<UserProfileApprovalWorkflowPage />} />
        <Route path="/userprofileapproval" element={<UserProfileApprovalPage />} />
        <Route path="/userprofileapprovalstudent" element={<UserProfileStudentApprovalPage />} />
        <Route path="/userprofileapprovalreport" element={<UserProfileApprovalReportPage />} />
        <Route path="/userprofileprint" element={<UserProfilePrintPage />} />
        <Route path="/userprofileauditlog" element={<UserProfileAuditLogPage />} />
        <Route path="/userlocationsearch" element={<UserLocationSearchPage />} />
        <Route path="/mylocationsearch" element={<UserLocationSearchPage myOnly />} />
        <Route path="/studentlocationpublish" element={<UserLocationSearchPage student />} />
        <Route path="/studentlocationsearch" element={<UserLocationSearchPage student />} />
        <Route path="/userconsentcontent" element={<UserConsentContentPage />} />
        <Route path="/userconsent" element={<UserConsentPage />} />
        <Route path="/userconsentwithdraw" element={<UserConsentWithdrawPage />} />
        <Route path="/userconsentauditlog" element={<UserConsentAuditLogPage />} />
        <Route path="/menusearch" element={<MenuSearchPage />} />

        <Route path="/salary-structure" element={<SalaryStructureCrudPage />} />
        <Route path="/dashmhrstructure" element={<Dashmhrstructure />} />
        <Route path="/dashmhrstructureadmin" element={<Dashmhrstructureadmin />} />
        <Route path="/dashmhrstructuresal" element={<Dashmhrstructuresal />} />
        <Route path="/dashmhrstructuresaladmin" element={<Dashmhrstructuresaladmin />} />
        <Route path="/dashmhrsalstructure" element={<Dashmhrsalstructure />} />
        <Route path="/dashmhrsalstructureadmin" element={<Dashmhrsalstructureadmin />} />
        <Route path="/dashmhrsalary" element={<Dashmhrsalary />} />
        <Route path="/dashmhrsalaryadmin" element={<Dashmhrsalaryadmin />} />
        <Route path="/dashmhrempledger" element={<Dashmhrempledger />} />
        <Route path="/dashmhrempledgeradmin" element={<Dashmhrempledgeradmin />} />


        <Route path="/dashmfeebook" element={<Dashmfeebook />} />
        <Route path="/dashmfeebookadmin" element={<Dashmfeebookadmin />} />
        <Route path="/dashmcashbook" element={<Dashmcashbook />} />
        <Route path="/dashmcashbookadmin" element={<Dashmcashbookadmin />} />
        <Route path="/dashmwebcourses" element={<Dashmwebcourses />} />
        <Route path="/dashmwebcoursesadmin" element={<Dashmwebcoursesadmin />} />
        <Route path="/dashmwebevents" element={<Dashmwebevents />} />
        <Route path="/dashmwebeventsadmin" element={<Dashmwebeventsadmin />} />


        <Route path="/dashchattestadmin" element={<Dashchattestadmin />} />

           {/* Budget Module Routes */}
                                        <Route path="/BudgetTypeds" element={<BudgetTypeds />} />
                                        <Route path="/BudgetApproverds" element={<BudgetApproverds />} />
                                        <Route path="/BudgetDashboardds" element={<BudgetDashboardds />} />
                                        <Route path="/BudgetApprovalds" element={<BudgetApprovalds />} />
                                        <Route path="/indbudgetapprovalroles" element={<IndBudgetApprovalRolesPage />} />
                                        <Route path="/newbudgetdepartmentworkflow" element={<NewBudgetDepartmentWorkflowPage />} />
                                        <Route path="/newbudgetinstitutionworkflow" element={<NewBudgetInstitutionWorkflowPage />} />
                                        <Route path="/newbudgetcategory" element={<NewBudgetCategoryPage />} />
                                        <Route path="/newbudgetentry" element={<NewBudgetEntryPage />} />
                                        <Route path="/newbudgetsubmissionactivation" element={<NewBudgetSubmissionActivationPage />} />
                                        <Route path="/newbudgetdepartmentapproval" element={<NewBudgetDepartmentApprovalPage />} />
                                        <Route path="/newbudgetinstitutionapproval" element={<NewBudgetInstitutionApprovalPage />} />
                                        <Route path="/newbudgetauditlog" element={<NewBudgetAuditLogPage />} />
                                        <Route path="/newbudgetanalysis" element={<NewBudgetAnalysisPage />} />
                                        <Route path="/newbudgetdepartmentreport" element={<NewBudgetDepartmentReportPage />} />
                                        <Route path="/newbudgetblockchain" element={<NewBudgetBlockchainPage />} />
                                        <Route path="/verify-budget-blockchain" element={<NewBudgetBlockchainVerifyPage />} />
                                        <Route path="/purchasenewdepartmentworkflow" element={<PurchaseNewDepartmentWorkflowPage />} />
                                        <Route path="/purchasenewinstitutionworkflow" element={<PurchaseNewInstitutionWorkflowPage />} />
                                        <Route path="/purchasenewstoreworkflow" element={<PurchaseNewStoreWorkflowPage />} />
                                        <Route path="/purchasenewstores" element={<PurchaseNewStorePage />} />
                                        <Route path="/purchasenewitemmaster" element={<PurchaseNewItemMasterPage />} />
                                        <Route path="/purchasenewstoreusers" element={<PurchaseNewStoreUserAssignmentPage />} />
                                        <Route path="/purchasenewassignedstoreindents" element={<PurchaseNewAssignedStoreIndentsPage />} />
                                        <Route path="/purchasenewindent" element={<PurchaseNewIndentPage />} />
                                        <Route path="/purchasenewstoreindent" element={<PurchaseNewStoreIndentPage />} />
                                        <Route path="/purchasenewindenthistory" element={<PurchaseNewIndentHistoryPage />} />
                                        <Route path="/purchasenewdepartmentapproval" element={<PurchaseNewDepartmentApprovalPage />} />
                                        <Route path="/purchasenewinstitutionapproval" element={<PurchaseNewInstitutionApprovalPage />} />
                                        <Route path="/purchasenewstoreapproval" element={<PurchaseNewStoreApprovalPage />} />
                                        <Route path="/purchasenewapprovedindents" element={<PurchaseNewApprovedIndentsPage />} />
                                        <Route path="/purchasenewindentauditlog" element={<PurchaseNewIndentAuditLogPage />} />
                                        <Route path="/purchasenewpoworkflow" element={<PurchaseNewPoWorkflowPage />} />
                                        <Route path="/purchasenewfinanceworkflow" element={<PurchaseNewFinanceWorkflowPage />} />
                                        <Route path="/purchasenewrfpworkflow" element={<PurchaseNewRfpWorkflowPage />} />
                                        <Route path="/purchasenewcategoryofficer" element={<PurchaseNewCategoryOfficerPage />} />
                                        <Route path="/purchasenewvendor" element={<PurchaseNewVendorPage />} />
                                        <Route path="/purchasenewrfpvendorassignment" element={<PurchaseNewRfpVendorAssignmentPage />} />
                                        <Route path="/purchasenewapprovedrfps" element={<PurchaseNewApprovedRfpsPage />} />
                                        <Route path="/purchasenewofficerworkbench" element={<PurchaseNewOfficerWorkbenchPage />} />
                                        <Route path="/purchasenewrfpapproval" element={<PurchaseNewRfpApprovalPage />} />
                                        <Route path="/purchasenewvendorcomparison" element={<PurchaseNewVendorComparisonPage />} />
                                        <Route path="/purchasenewpoapproval" element={<PurchaseNewPoApprovalPage />} />
                                        <Route path="/purchasenewapprovedpo" element={<PurchaseNewApprovedPoPage />} />
                                        <Route path="/purchase-new-vendor-login" element={<PurchaseNewVendorLoginPage />} />
                                        <Route path="/purchase-new-vendor-dashboard" element={<PurchaseNewVendorDashboardPage />} />
                                        <Route path="/purchase-new-vendor-profile" element={<PurchaseNewVendorProfilePage />} />
                                        <Route path="/purchase-new-vendor-rfps" element={<PurchaseNewVendorRfpsPage />} />
                                        <Route path="/purchase-new-vendor-pos" element={<PurchaseNewVendorPoPage />} />
                                        <Route path="/purchase-new-vendor-deliveries" element={<PurchaseNewVendorDeliverySchedulePage />} />
                                        <Route path="/purchase-new-vendor-delivery-status" element={<PurchaseNewVendorDeliveryStatusPage />} />
                                        <Route path="/purchase-new-vendor-invoices" element={<PurchaseNewVendorInvoicePage />} />
                                        <Route path="/purchasenewquality" element={<PurchaseNewQualityPage />} />
                                        <Route path="/purchasenewinvoiceapproval" element={<PurchaseNewInvoiceApprovalPage />} />
                                        <Route path="/purchasenewinvoicepayment" element={<PurchaseNewInvoicePaymentPage />} />
                                        <Route path="/purchasenewinvoiceaging" element={<PurchaseNewInvoiceAgingPage />} />
                                        <Route path="/purchasenewinvoicestatus" element={<PurchaseNewInvoiceStatusPage />} />
                                        <Route path="/verify-purchase-rfp-blockchain" element={<PurchaseNewRfpBlockchainVerifyPage />} />
                                        <Route path="/verify-approved-rfps-blockchain" element={<PurchaseNewApprovedRfpsBlockchainVerifyPage />} />
                                        <Route path="/verify-purchase-new-rfp-submission" element={<PurchaseNewRfpSubmissionVerifyPage />} />
                                        <Route path="/verify-purchase-new-po" element={<PurchaseNewPoVerifyPage />} />
                                        <Route path="/verify-purchase-new-delivery-note" element={<PurchaseNewDeliveryNoteVerifyPage />} />
                                        <Route path="/verify-purchase-new-invoice" element={<PurchaseNewInvoiceVerifyPage />} />
                                        <Route path="/requisitiondepartmentworkflow" element={<RequisitionDepartmentWorkflowPage />} />
                                        <Route path="/requisitioninstitutionworkflow" element={<RequisitionInstitutionWorkflowPage />} />
                                        <Route path="/requisitionstoreworkflow" element={<RequisitionStoreWorkflowPage />} />
                                        <Route path="/requisitioncreate" element={<RequisitionCreatePage />} />
                                        <Route path="/requisitiondepartmentapproval" element={<RequisitionDepartmentApprovalPage />} />
                                        <Route path="/requisitioninstitutionapproval" element={<RequisitionInstitutionApprovalPage />} />
                                        <Route path="/requisitionstoreapproval" element={<RequisitionStoreApprovalPage />} />
                                        <Route path="/requisitionstoreview" element={<RequisitionStoreViewPage />} />
                                        <Route path="/requisitionstockregister" element={<RequisitionStockRegisterPage />} />
                                        <Route path="/assetnewinventory" element={<AssetNewInventoryPage />} />
                                        <Route path="/assetnewtracking" element={<AssetNewTrackingPage />} />
                                        <Route path="/assetnewreissue" element={<AssetNewReissuePage />} />
                                        <Route path="/assetnewretirement" element={<AssetNewRetirementPage />} />
                                        <Route path="/assetnewreports" element={<AssetNewReportsPage />} />

        <Route path="/dashmunivampus" element={<Dashmunivampus />} />
        <Route path="/dashmunivampusadmin" element={<Dashmunivampusadmin />} />
        <Route path="/dashmunivfac" element={<Dashmunivfac />} />
        <Route path="/dashmunivfacadmin" element={<Dashmunivfacadmin />} />
        <Route path="/dashmunivdep" element={<Dashmunivdep />} />
        <Route path="/dashmunivdepadmin" element={<Dashmunivdepadmin />} />


        <Route path="/dashmkeiyearmy" element={<Dashmkeiyearmy />} />
        <Route path="/dashmkeiyear" element={<Dashmkeiyear />} />
        <Route path="/dashmkeiyearadmin" element={<Dashmkeiyearadmin />} />

        <Route path="/keiteacherformsall1" element={<Keiteacherformsall1 />} />


        <Route path="/keifacultyreport" element={<Keifacultyreport />} />

        <Route path="/dashmkeiquestionModel" element={<DashmkeiquestionModel />} />
        <Route path="/dashmkeiquestionModeladmin" element={<DashmkeiquestionModeladmin />} />


        <Route path="/pucadmissionform" element={<Pucadmissionform />} />

        <Route path="/keiteacherperformancs" element={<Keiteacherperformancs />} />
        <Route path="/keiteacherformsall" element={<Keiteacherformsall />} />
        <Route path="/keiaddquestion" element={<Keiaddquestion />} />

        <Route path="/crompipedrill" element={<Crompipedrill />} />

        <Route path="/viewcrmstagepivot2" element={<Viewcrmstagepivot2 />} />
        <Route path="/viewcrmstagepivot" element={<Viewcrmstagepivot />} />
        <Route path="/dashmcrmstage" element={<Dashmcrmstage />} />

         <Route path="/crmupcommingfollowup" element={<CrmdsReportsPage />} />
                                        <Route path="/crmds-overdue-leads" element={<CrmdsOverdueLeadsPage />} />
                                        <Route path="/crmds-counsellor-wise-leads" element={<CrmdsCounsellorWiseLeadsReport />} />
                                        <Route path="/crmds-pipeline-stage-wise" element={<CrmdsPipelineStageWiseReport />} />
                                        <Route path="/crmds-source-wise-leads" element={<CrmdsSourceWiseLeadsReport />} />
                                        <Route path="/crmdatewisenewleads" element={<CrmdsDateWiseNewLeads />} />

        <Route path="/dashmfeespayl" element={<Dashmfeespayl />} />
        <Route path="/dailyfeesreport1" element={<Dailyfeesreport1 />} />

        <Route path="/crmreports2" element={<Crmreports2 />} />
        {/* <Route path="/oicrmfleadreports" element={<oicrmfLeadReports />} /> */}
        <Route path="/oicrmrep2" element={<Oicrmrep2 />} />

        <Route path="/feecreport" element={<FeeCReport />} />

        <Route path="/revenuedashboard" element={<RevenueDashboard />} />

        <Route path="/programfeereport" element={<ProgramFeeReport />} />
        <Route path="/studentledgerreport" element={<StudentLedgerReport />} />

        <Route path="/feesummaryreport" element={<FeeSummaryReport />} />


        <Route path="/viewmexamtimetables" element={<Viewmexamtimetables />} />

        <Route path="/role/cash-approval" element={<RoleLayout><CashApprovalds /></RoleLayout>} />
                                                <Route exact path="/approvecashapprovalds/:id" element={<RoleLayout><ApproveCashApprovalds /></RoleLayout>} />
        
                                                <Route path="/pipelinestageag" element={<Pipelinestageag />} />
                                                <Route path="/outcomeag" element={<Outcomeag />} />

        <Route path="/admin/role-list" element={<NewRoleListds />} />
<Route path="/admin/purchase-user-add" element={<NewPurchaseUserAddds />} />
<Route path="/admin/vendor-comparison" element={<VendorComparisonSheetds />} />

        <Route path="/newattendancereportds" element={<NewAttendanceReportds />} />
                                        <Route path="/newcomunicationds" element={<NewComunicationds />} />
                                        <Route path="/filemasterds" element={<NewFileMasterds />} />
                                        <Route path="/filemovementds" element={<NewFileMovementds />} />
                                        <Route path="/dashstudprofileallds" element={<Dashstudprofileallds />} />
                                        <Route path="/studentprofile1ds" element={<StudentProfile1ds />} />
                                        <Route path="/attendancetimereportds" element={<NewAttendanceTimeReportds />} />

                                         <Route path="/ItemCategoryds" element={<ItemCategoryds />} />
                                        <Route path="/ItemUnitds" element={<ItemUnitds />} />


                                        {/* NEW ADMIN ROUTES (Sticky Navbar Layout) */}
                                        <Route path="/admin/user-list" element={<NewDashmuser />} />
                                        <Route path="/admin/company-list" element={<NewDashmcompany />} />
        
                                        <Route path="/admin/role-list" element={<NewDashmroles />} />
        
                                        {/* Admission Routes */}
                                        <Route path="/admin/admission-form" element={<NewDashmadmission />} />
                                        <Route path="/admin/merit-list-all" element={<NewDashmappmodel2 />} />
                                        <Route path="/admin/merit-list-cat" element={<NewDashmappmodel2cat />} />
                                        <Route path="/admin/confirm-admission" element={<NewApplicationReviewPage />} />
        
                                        {/* Fees Routes */}
                                        <Route path="/admin/fee-config" element={<NewDashmfeesadmin />} />
                                        <Route path="/admin/student-ledger" element={<NewDashmledgerstudadmin />} />
                                        <Route path="/admin/fees-collection" element={<NewDashmmfeescoladmin />} />
        
        
                                        {/* Institutions Route */}
                                        <Route path="/admin/institutions" element={<NewInstitutionsds />} />
        
                                        {/* Examination Routes */}
                                        <Route path="/admin/program-list" element={<NewDashmmprogramsadmin />} />
                                        <Route path="/admin/course-list" element={<NewDashmmcourseslistadmin />} />
                                        <Route path="/admin/student-list" element={<NewDashmmstudents1admin />} />
                                        <Route path="/admin/exam-schedule" element={<NewDashmexamscheduleadmin />} />
                                        <Route path="/admin/exam-timetable" element={<NewDashmexamtimetableadmin />} />
                                        <Route path="/admin/exam-room-allotment" element={<NewDashmexamroomadmin />} />
                                        <Route path="/admin/exam-registration" element={<NewDashmexamadmitadmin />} />
                                        <Route path="/admin/exam-marks" element={<NewDashmexammarksalladmin />} />
                                        <Route path="/admin/student-alloc-eval" element={<NewDashmstudalloc1admin />} />
                                        <Route path="/admin/solved-questions" element={<NewDashmmguidesadmin />} />
        
                                        <Route path="/admin/talent-exam-reg" element={<NewDashmmctalentregadmin />} />
        
                                        {/* LMS Routes */}
                                        <Route path="/admin/lms-academic-calendar" element={<NewDashmmacadcaladmin />} />
                                        <Route path="/admin/lms-assignments" element={<NewDashmmassignmentsadmin />} />
                                        <Route path="/admin/lms-announcements" element={<NewDashmmanouncementsadmin />} />
                                        <Route path="/admin/lms-course-outcome" element={<NewDashmmcoursecoadmin />} />
                                        <Route path="/admin/lms-course-materials" element={<NewDashmmcoursematerialadmin />} />
                                        <Route path="/admin/lms-class-schedule" element={<NewDashmclassnewadmin />} />
                                        <Route path="/admin/lms-videos" element={<NewDashmlmsvideosadmin />} />
                                        <Route path="/admin/lms-attendance" element={<NewDashmattendancenewadmin />} />
                                        <Route path="/admin/lms-attainment-method-1" element={<NewDashmattyearadmin />} />
                                        <Route path="/admin/lms-mindmap-list" element={<NewDashmmindmaplistadmin />} />
                                        <Route path="/admin/lms-mindmap-nodes" element={<NewDashmmindmapnodesadmin />} />
                                        <Route path="/admin/lms-mindmap-edges" element={<NewDashmmindmapedgesadmin />} />
                                        <Route path="/admin/lms-time-slot" element={<NewDashmtimeslotsn1admin />} />
                                        <Route path="/admin/lms-workload" element={<NewDashmworkloadn1admin />} />
                                        <Route path="/admin/lms-faculty-workload-calendar" element={<NewDashmfacwcaladmin />} />
                                        <Route path="/admin/lms-courselist-co" element={<NewDashmmfaccoursesadmin />} />
                                        <Route path="/admin/lms-co-attainment" element={<NewDashmmfaccoursesattadmin />} />
                                        <Route path="/admin/lms-co-attainment-calc" element={<NewDashmmattcalcadmin />} />
                                        <Route path="/admin/lms-threshold-attainment" element={<NewDashmmcolevelsadmin />} />
        
                                        {/* Hostel Routes */}
                                        <Route path="/admin/hostel-dashboard" element={<NewDashboardPageHostel />} />
                                        <Route path="/admin/hostel-buildings" element={<NewHostelBuildingPage />} />
                                        <Route path="/admin/hostel-rooms" element={<NewHostelRoomPage />} />
        
                                        {/* CRM Routes */}
                                        <Route path="/admin/crm-leads" element={<NewLeadsds />} />
                                        <Route path="/admin/crm-dashboard" element={<NewDashboardCrmds />} />
        
                                        {/* Purchase Routes */}
                                        <Route path="/admin/purchase-dashboard" element={<NewDashboardPurchaseds />} />
                                        <Route path="/admin/purchase-inventory" element={<NewPurchaseCellInventoryds />} />
                                        <Route path="/admin/purchase-vendors" element={<NewVendormanagementds />} />
                                        <Route path="/admin/purchase-orders" element={<NewPurchaseOrderDashboardds />} />
                                        <Route path="/admin/purchase-delivery" element={<NewDeliveryDashboardds />} />
        
                                        {/* HR Routes */}
                                        <Route path="/admin/hr-employee-list" element={<NewDashmUseradmin />} />
                                        <Route path="/admin/hr-attendance" element={<NewAttendanceDashboard />} />
                                        <Route path="/admin/hr-job-applications" element={<NewJobApplicationPage />} />
                                        <Route path="/admin/hr-payroll" element={<NewSalaryManagement />} />
                                        <Route path="/admin/hr-leaves" element={<NewLeavesPage />} />
                                        <Route path="/admin-new" element={<DashMainAdmin />} />

        <Route path="/institutionsds" element={<Institutionsds />} />

        <Route path="/PurchaseCellInventoryds" element={<PurchaseCellInventoryds />} />


        <Route path="/FacultyRequestApprovalds" element={<FacultyRequestApprovalds />} />
        <Route path="/ApprovalConfigurationds" element={<ApprovalConfigurationds />} />

        <Route path="/leadsdsadmin" element={<Leadsdsadmin />} />
<Route path="/bulkleadsds" element={<BulkLeadActionsds />} />

        {/* Purchasing Module Routes - NEW */}
                                <Route path="/faculty-create-request" element={<FacultyCreateRequestds />} />
                                <Route path="/faculty-request-status" element={<FacultyRequestStatusds />} />
                                <Route path="/store-manager-dashboard" element={<StoreManagerDashboardds />} />
                                <Route path="/purchase-order-dashboard" element={<PurchaseOrderDashboardds />} />
                                <Route path="/delivery-dashboard" element={<DeliveryDashboardds />} />
                                <Route path="/dashboard-purchasing" element={<DashboardPurchaseds />} />
                                <Route path="/purchasing-master-data" element={<PurchasingMasterDatads />} />

        <Route path="/dashmvendords" element={<Dashmvendords />} />
<Route path="/dashmvendordsadmin" element={<Dashmvendordsadmin />} />
<Route path="/dashmvendoritemds" element={<Dashmvendoritemds />} />
<Route path="/dashmvendoritemdsadmin" element={<Dashmvendoritemdsadmin />} />
<Route path="/dashmrequisationds" element={<Dashmrequisationds />} />
<Route path="/dashmrequisationdsadmin" element={<Dashmrequisationdsadmin />} />
<Route path="/dashmitemmasterds" element={<Dashmitemmasterds />} />
<Route path="/dashmitemmasterdsadmin" element={<Dashmitemmasterdsadmin />} />
<Route path="/dashmstoreitemds" element={<Dashmstoreitemds />} />
<Route path="/dashmstoreitemdsadmin" element={<Dashmstoreitemdsadmin />} />
<Route path="/dashmstorerequisationds" element={<Dashmstorerequisationds />} />
<Route path="/dashmstorerequisationdsadmin" element={<Dashmstorerequisationdsadmin />} />
<Route path="/dashmstorepoorderds" element={<Dashmstorepoorderds />} />
<Route path="/dashmstorepoorderdsadmin" element={<Dashmstorepoorderdsadmin />} />
<Route path="/dashmstorepoitemsds" element={<Dashmstorepoitemsds />} />
<Route path="/dashmstorepoitemsdsadmin" element={<Dashmstorepoitemsdsadmin />} />
<Route path="/dashmstockregisterds" element={<Dashmstockregisterds />} />
<Route path="/dashmstockregisterdsadmin" element={<Dashmstockregisterdsadmin />} />


        <Route path="/dashmconvdates" element={<Dashmconvdates />} />
<Route path="/dashmconvdatesadmin" element={<Dashmconvdatesadmin />} />
<Route path="/dashmconvdocs" element={<Dashmconvdocs />} />
<Route path="/dashmconvdocsadmin" element={<Dashmconvdocsadmin />} />
<Route path="/dashmconvfees" element={<Dashmconvfees />} />
<Route path="/dashmconvfeesadmin" element={<Dashmconvfeesadmin />} />
<Route path="/dashmconvgh" element={<Dashmconvgh />} />
<Route path="/dashmconvghadmin" element={<Dashmconvghadmin />} />
<Route path="/dashmconvtransport" element={<Dashmconvtransport />} />
<Route path="/dashmconvtransportadmin" element={<Dashmconvtransportadmin />} />
<Route path="/transportdrivers" element={<TransportDriverPage />} />
<Route path="/transportdriverroster" element={<TransportDriverRosterPage />} />
<Route path="/transportbuspass" element={<TransportBusPassPage />} />
<Route path="/dashmconvguests" element={<Dashmconvguests />} />
<Route path="/dashmconvguestsadmin" element={<Dashmconvguestsadmin />} />
<Route path="/dashmconvattendees" element={<Dashmconvattendees />} />
<Route path="/dashmconvattendeesadmin" element={<Dashmconvattendeesadmin />} />


         <Route path="/studentmasterlistds" element={<StudentMasterListds />} />

         <Route path="/dashboardmeritlist" element={<Layout><Dashboarddsmeritds /></Layout>} />
        <Route path="/programmesmeritlist" element={<Layout><ProgrammeList /></Layout>} />
        <Route path="/subjectsmeritlist" element={<Layout><SubjectList /></Layout>} />
        <Route path="/studentsmeritlist" element={<Layout><StudentList /></Layout>} />
        <Route path="/allocationsmeritlist" element={<Layout><AllocationHome /></Layout>} />
        <Route path="/allocations/execute/:sessionId" element={<Layout><SessionExecution /></Layout>} />
        <Route path="/reportsmeritlist" element={<Layout><ReportList /></Layout>} />

        <Route path="/usermanagementdsnov17" element={<UserManagementdsnov17 />} />

        <Route path="/marksheetdataentryds" element={<MarksheetDataEntryPageds />} />
        <Route path="/marksheetgenerationds" element={<MarksheetGenerationPageds />} />

        <Route path="/workflowchatbotds1" element={<WorkflowChatbotds1 />} />
        <Route path="/workflowconfigds1" element={<WorkflowConfigds1 />} />

        <Route path="/workflowconfigds" element={<WorkflowConfigds />} />
        <Route path="/workflowchatbotds" element={<WorkflowChatbotds />} />

        <Route path="/dashmtblerrorlog" element={<Dashmtblerrorlog />} />
        <Route path="/dashmtblerrorlogadmin" element={<Dashmtblerrorlogadmin />} />


        <Route path="/dashmtblemitter" element={<Dashmtblemitter />} />
        <Route path="/dashmtblemitteradmin" element={<Dashmtblemitteradmin />} />


         {/* Alumni Portal Routes */}
        <Route path="/alumni/login" element={<AlumniLoginds />} />
        <Route path="/alumni/dashboard" element={<AlumniDashboardds />} />
        <Route path="/alumni/profile" element={<AlumniProfileds />} />
        <Route path="/alumni/events" element={<AlumniEventsds />} />
        <Route path="/alumni/jobs" element={<AlumniJobsds />} />
        <Route path="/alumni/materials" element={<AlumniMaterialsds />} />
        <Route path="/alumni/donations" element={<AlumniDonationsds />} />
        <Route path="/alumni/documents" element={<AlumniDocumentsds />} />
        
        {/* Public Alumni Registration */}
        <Route path="/alumni/register" element={<AlumniRegistrationForm />} />
        
        {/* Admin Alumni Portal Routes */}
        <Route path="/admin/alumni/dashboard" element={<AdminDashboardAlumnids />} />
        <Route path="/admin/alumni/management" element={<AdminAlumniManagementds />} />
        <Route path="/admin/alumni/events" element={<AdminEventManagementds />} />
        <Route path="/admin/alumni/donations" element={<AdminDonationManagementds />} />
        <Route path="/admin/alumni/applications" element={<AdminApplicationsManagement />} />
        
        {/* Student Portal Routes */}
        <Route path="/student/jobs" element={<StudentJobsPortalds />} />
        <Route path="/student/materials" element={<StudentMaterialsLibraryds />} />

         {/* AI API upload ROUTES */}
          <Route path="/dataconfig" element={<DataApiConfig />} />
          <Route path="/aidatamanager" element={<AiDataManager />} />

         {/* API Configuration and Chatbot */}
<Route path="/apiconfig" element={<ApiConfig />} />
<Route path="/apichatbot" element={<ApiChatbot />} />
<Route path="/apichatbot1" element={<ApiChatbot1 />} />

        <Route path="/dashchattest4a" element={<Dashchattest4a />} />

          <Route path="/dashboardcrmds" element={<DashboardCrmds />} />
                <Route path="/categoryds" element={<Categoryds />} />
                <Route path="/leadsds" element={<Leadsds />} />
                <Route path="/leaddetailds/:id" element={<Leaddetailds />} />
                <Route path="/programmasterds" element={<Programmasterds />} />
                <Route path="/landingpageds" element={<Landingpageds />} />
                <Route path="/dripcampaignds" element={<Dripcampaignds />} />
                <Route path="/apikeyds" element={<Apikeyds />} />
                <Route path="/analyticsds" element={<Analyticsds />} />
                <Route path="/landing/:slug" element={<Publiclandingpageds />} />
                <Route path="/communicationsettings" element={<CommunicationSettings />} />
                <Route path="/sourceds" element={<Sourceds />} />

           {/* NEW ROUTES */}
        <Route path="/AnswerSheetEvaluationListPageds" element={<AnswerSheetEvaluationListPageds />} />
        <Route path="/AnswerSheetEvaluationPageds" element={<AnswerSheetEvaluationPageds />} />
        <Route path="/ReevaluationQuestionWiseViewPageds" element={<ReevaluationQuestionWiseViewPageds />} />
        <Route path="/ReevaluationQuestionWiseEditPageds" element={<ReevaluationQuestionWiseEditPageds />} />


        <Route path="/supplementaryattendanceds" element={<SupplementaryAttendanceds />} />
        <Route path="/studentattendanceds" element={<StudentAttendanceViewds />} />
        <Route path="/requestedattendanceds" element={<RequestedAttendanceds />} />

        {/* <Route path="/requestedattendanceds" element={<RequestedAttendanceds />} />
        <Route path="/studentattendanceviewds" element={<StudentAttendanceViewds />} />
        <Route path="/studentattendanceviewds" element={<StudentAttendanceViewds />} /> */}

        <Route path="/dashmwreport2" element={<Dashmwreport2 />} />
        <Route path="/dashreports" element={<Dashreports />} />
        <Route path="/dashmwreport1" element={<Dashmwreport1 />} />

        <Route path="/dashmtblapi" element={<Dashmtblapi />} />
        <Route path="/dashmtblapiadmin" element={<Dashmtblapiadmin />} />


        <Route path="/dashboardreevalds" element={<Dashboardreevalds />} />
        <Route path="/reevaluation-application-new" element={<ReevaluationApplicationNewPageds />} />
        <Route path="/admin-reevaluation-management" element={<AdminReevaluationManagementPageds />} />
        <Route path="/examiner-reevaluation-evaluation" element={<ExaminerReevaluationEvaluationPageds />} />
        <Route path="/admin-examiner3-allocation" element={<AdminExaminer3AllocationPageds />} />

        <Route path="/dashmtbcolumnsall" element={<Dashmtbcolumnsall />} />
        <Route path="/dashmtbcolumnsalladmin" element={<Dashmtbcolumnsalladmin />} />


        <Route path="/chattest44" element={<chattest44 />} />

        <Route path="/dashmtall" element={<Dashmtall />} />
        <Route path="/dashmtalladmin" element={<Dashmtalladmin />} />
        <Route path="/dashmtfields" element={<Dashmtfields />} />
        <Route path="/dashmtfieldsadmin" element={<Dashmtfieldsadmin />} />


        <Route path="/dashchattest4d" element={<Dashchattest4d />} />

        <Route path="/dashchattest4" element={<Dashchattest4 />} />

        <Route path="/dashmexamupload" element={<Dashmexamupload />} />

        <Route path="/returnmanagementds" element={<Returnmanagementds />} />

        <Route path="/dashmexaminerallocate" element={<Dashmexaminerallocate />} />

        <Route path="/reevaluationapplicationds" element={<ReevaluationApplicationPageds />} />
        <Route path="/examinerconfigds" element={<ExaminerConfigPageds />} />
        <Route path="/examinerevaluationds" element={<ExaminerEvaluationPageds />} />

        <Route path="/dashmcrmh1" element={<Dashmcrmh1 />} />
        <Route path="/dashmcrmh1admin" element={<Dashmcrmh1admin />} />


        <Route path="/dashboardsummary" element={<DashboardSummaryReportds />} />
        <Route path="/coursefacultyassigned" element={<CourseFacultyAssignedReportds />} />
        <Route path="/facultycoursesummary" element={<FacultyCourseSummaryReportds />} />
        <Route path="/facultyoverallsummary" element={<FacultyOverallSummaryReportds />} />
        <Route path="/coursecompletionstatus" element={<CourseCompletionStatusReportds />} />
        <Route path="/facultycoursestudentdetails" element={<FacultyCourseStudentDetailsReportds />} />

        <Route path="/managecategoryassigneeds" element={<ManageCategoryAssigneeds />} />

        <Route path="/managecategoryassigneeds1" element={<ManageCategoryAssigneeds1 />} />

          <Route path="/questionbanklistds" element={<QuestionBankListds />} />
        <Route path="/managesectionsds/:questionbankcode" element={<ManageSectionsds />} />
        <Route path="/managequestionsds/:questionbankcode" element={<ManageQuestionsds />} />
        <Route path="/vieweditlogsds/:questionbankcode" element={<ViewEditLogsds />} />
        <Route path="/generatepdfds/:questionbankcode" element={<GeneratePDFds />} />

        <Route path="/transcriptpageds" element={<TranscriptPageds />} />

        
        <Route path="/creategrievanceds1" element={<CreateGrievanceFormds1 />} />
        <Route path="/admingrievancedashboardds1" element={<AdminGrievanceDashboardds1 />} />
        <Route path="/assigneegrievancepageds1" element={<AssigneeGrievancePageds1 />} />
        <Route path="/managegrievancecategoriesds1" element={<ManageGrievanceCategoriesds1 />} />
        <Route path="/manageapikeyds" element={<ManageApiKeyds />} />
        <Route path="/geminichatds" element={<GeminiChatds />} />

         <Route path="/creategrievanceds" element={<CreateGrievanceFormds />} />
        <Route path="/admingrievancedashboardds" element={<AdminGrievanceDashboardds />} />
        <Route path="/assigneegrievancepageds" element={<AssigneeGrievancePageds />} />
        <Route path="/managegrievancecategoriesds" element={<ManageGrievanceCategoriesds />} />

           <Route path="/facultyregistrationform" element={<FacultyRegistrationFormPage />} />

        <Route
          path="/facultyregistrationmanagement"
          element={<FacultyRegistrationManagementPage />}
        />
        <Route path="/facultybankdetails" element={<FacultyBankDetailsPage />} />

        <Route path="/ledgerstudpageds" element={<LedgerStudPageds />} />
        <Route path="/ledgerinstallmentpageds" element={<LedgerInstallmentPageds />} />
        <Route path="/studentledgerinstallment" element={withMenu("Installment", <StudentLedgerInstallmentPage />)} />
        <Route path="/installmentapprovalworkflow" element={<InstallmentApprovalWorkflowPage />} />
        <Route path="/installmentapproval" element={<InstallmentApprovalPage />} />
        <Route path="/studentinstallmentrequest" element={<StudentInstallmentRequestPage />} />
        <Route path="/applicationfee" element={withMenu("Application fee", <ApplicationFeePage />)} />
        <Route path="/provisionaladmissionfee" element={withMenu("Provisional Admission fee", <ProvisionalAdmissionFeePage />)} />
        <Route path="/easebuzzgateway" element={<EasebuzzGatewayPage />} />
        <Route path="/mastergateway" element={<MasterGatewayPage />} />
        <Route path="/icicigateway" element={<IciciGatewayPage />} />
        <Route path="/easebuzzpaymentprocess" element={<EasebuzzPaymentProcessPage />} />
        <Route path="/easebuzzpaymentview" element={<EasebuzzPaymentViewPage />} />
        <Route path="/icicipaymentview" element={<IciciPaymentViewPage />} />
        <Route path="/studentonlinefeepayment" element={<StudentOnlineFeePaymentPage />} />
        <Route path="/studentonlinefeepayment2" element={<StudentOnlineFeePayment2Page />} />
        <Route path="/studentonlinepaymentreport" element={<StudentOnlinePaymentReportPage />} />
        <Route path="/studentmyonlinepaymentreport" element={<StudentMyOnlinePaymentReportPage />} />
        <Route path="/studentdetailedledger" element={<StudentDetailedLedgerPage />} />
        <Route path="/studentcounterfee2receipt" element={<StudentCounterFee2ReceiptPage />} />
        <Route path="/studentfeesbalancereport" element={<StudentFeesBalanceReportPage />} />
        <Route path="/library-master" element={<LibraryMasterPage />} />
        <Route path="/library-user-access" element={<LibraryUserAccessPage />} />
        <Route path="/library-books" element={<LibraryBookMasterPage />} />
        <Route path="/library-book-scan" element={<LibraryBookScanPage />} />
        <Route path="/library-fines" element={<LibraryFinePage />} />
        <Route path="/library-role-max-books" element={<LibraryRoleMaxBooksPage />} />
        <Route path="/library-role-max-days" element={<LibraryRoleMaxDaysPage />} />
        <Route path="/library-counter" element={<LibraryCounterPage />} />
        <Route path="/library-issue" element={<LibraryIssuePage />} />
        <Route path="/library-return" element={<LibraryReturnPage />} />
        <Route path="/library-reports" element={<LibraryReportsPage />} />
        <Route path="/library-requests" element={<LibraryRequestsPage />} />
        <Route path="/library-photocopy-requests" element={<LibraryPhotocopyRequestsPage />} />
        <Route path="/library-transfer" element={<LibraryTransferPage />} />
        <Route path="/library-loan" element={<LibraryLoanPage />} />
        <Route path="/student-library-issued" element={<StudentLibraryIssuedPage />} />
        <Route path="/student-library-opac" element={<StudentLibraryOpacPage />} />
        <Route path="/purchase2/:modelKey" element={<Purchase2CrudPage />} />
        <Route path="/purchase2-indent-request" element={<Purchase2IndentRequestPage />} />
        <Route path="/purchase2-store-request-review" element={<Purchase2StoreRequestReviewPage />} />
        <Route path="/purchase2-store-pr-request" element={<Purchase2StorePrRequestPage />} />
        <Route path="/purchase2-po-assignment" element={<Purchase2PoAssignmentPage />} />
        <Route path="/purchase2-local-po" element={<Purchase2LocalPoPage />} />
        <Route path="/purchase2-gate-pass" element={<Purchase2GatePassPage />} />
        <Route path="/purchase2-quality-check" element={<Purchase2QualityCheckPage />} />
        <Route path="/purchase2-grn-creation" element={<Purchase2GrnCreationPage />} />
        <Route path="/researchapprovalmatrix" element={<ResearchApprovalMatrixPage />} />
        <Route path="/researchcomponents" element={<ResearchComponentPage />} />
        <Route path="/researchgrantapply" element={<ResearchGrantApplyPage />} />
        <Route path="/researchgrantapproval" element={<ResearchGrantApprovalPage />} />
        <Route path="/researchgrantsummary" element={<ResearchGrantSummaryPage />} />

         <Route path="/studentledgerreportds" element={<StudentLedgerReportPageds />} />
        <Route path="/collegerepledgerreportds" element={<CollegeStudentLedgerReportPageds />} />

        <Route path="/bulktabulationregisterpageds" element={<BulkTabulationRegisterPage />} />

<Route path="/dashmstudalloc1exam" element={<Dashmstudalloc1exam />} />

        <Route path="/dashmpcounselnew" element={<Dashmpcounselnew />} />
<Route path="/dashmpcounselnewadmin" element={<Dashmpcounselnewadmin />} />
<Route path="/dashmpcounselc" element={<Dashmpcounselc />} />
<Route path="/dashmpcounselcadmin" element={<Dashmpcounselcadmin />} />
<Route path="/dashmpmealplan" element={<Dashmpmealplan />} />
<Route path="/dashmpmealplanadmin" element={<Dashmpmealplanadmin />} />
<Route path="/dashmpfood" element={<Dashmpfood />} />
<Route path="/dashmpfoodadmin" element={<Dashmpfoodadmin />} />


        <Route path="/dashmstudallocf" element={<Dashmstudallocf />} />

         <Route path="/examstructurepageds" element={<ExamMarksStructurePageds />} />
                <Route path="/marksentrypageds" element={<MarksEntryPageds />} />
                <Route path="/tabulationregisterpageds" element={<TabulationRegisterPage />} />

        <Route path="/dashmwbin" element={<Dashmwbin />} />
<Route path="/dashmwbinadmin" element={<Dashmwbinadmin />} />
<Route path="/dashmwcolschedule1" element={<Dashmwcolschedule1 />} />
<Route path="/dashmwcolschedule1admin" element={<Dashmwcolschedule1admin />} />
<Route path="/dashmwdisposal1" element={<Dashmwdisposal1 />} />
<Route path="/dashmwdisposal1admin" element={<Dashmwdisposal1admin />} />
<Route path="/dashmwspill1" element={<Dashmwspill1 />} />
<Route path="/dashmwspill1admin" element={<Dashmwspill1admin />} />


        <Route path="/dashmwcollection" element={<Dashmwcollection />} />
<Route path="/dashmwcollectionadmin" element={<Dashmwcollectionadmin />} />
<Route path="/dashmwcolschedule" element={<Dashmwcolschedule />} />
<Route path="/dashmwcolscheduleadmin" element={<Dashmwcolscheduleadmin />} />
<Route path="/dashmwdisposal" element={<Dashmwdisposal />} />
<Route path="/dashmwdisposaladmin" element={<Dashmwdisposaladmin />} />
<Route path="/dashmwspill" element={<Dashmwspill />} />
<Route path="/dashmwspilladmin" element={<Dashmwspilladmin />} />


<Route path="/viewmmcevmeddis" element={<Viewmmcevmeddis />} />
<Route path="/viewmmcevmed" element={<Viewmmcevmed />} />

        <Route path="/dashmpconsent" element={<Dashmpconsent />} />
<Route path="/dashmpconsentadmin" element={<Dashmpconsentadmin />} />
<Route path="/dashmptreatment" element={<Dashmptreatment />} />
<Route path="/dashmptreatmentadmin" element={<Dashmptreatmentadmin />} />
<Route path="/dashmplab" element={<Dashmplab />} />
<Route path="/dashmplabadmin" element={<Dashmplabadmin />} />
<Route path="/dashmpimaging" element={<Dashmpimaging />} />
<Route path="/dashmpimagingadmin" element={<Dashmpimagingadmin />} />
<Route path="/dashmpdischarge" element={<Dashmpdischarge />} />
<Route path="/dashmpdischargeadmin" element={<Dashmpdischargeadmin />} />


        <Route path="/dashmpillness" element={<Dashmpillness />} />
<Route path="/dashmpillnessadmin" element={<Dashmpillnessadmin />} />
<Route path="/dashmpsurgery" element={<Dashmpsurgery />} />
<Route path="/dashmpsurgeryadmin" element={<Dashmpsurgeryadmin />} />
<Route path="/dashmpfamily" element={<Dashmpfamily />} />
<Route path="/dashmpfamilyadmin" element={<Dashmpfamilyadmin />} />
<Route path="/dashmpallergies" element={<Dashmpallergies />} />
<Route path="/dashmpallergiesadmin" element={<Dashmpallergiesadmin />} />


        <Route path="/dashmPatient" element={<DashmPatient />} />
<Route path="/dashmPatientadmin" element={<DashmPatientadmin />} />
<Route path="/dashmicu" element={<Dashmicu />} />
<Route path="/dashmicuadmin" element={<Dashmicuadmin />} />
<Route path="/dashmmicu" element={<Dashmmicu />} />
<Route path="/dashmmicuadmin" element={<Dashmmicuadmin />} />
<Route path="/dashmnicu" element={<Dashmnicu />} />
<Route path="/dashmnicuadmin" element={<Dashmnicuadmin />} />
<Route path="/dashmhdu" element={<Dashmhdu />} />
<Route path="/dashmhduadmin" element={<Dashmhduadmin />} />
<Route path="/dashmward" element={<Dashmward />} />
<Route path="/dashmwardadmin" element={<Dashmwardadmin />} />
<Route path="/dashmemergency" element={<Dashmemergency />} />
<Route path="/dashmemergencyadmin" element={<Dashmemergencyadmin />} />
<Route path="/dashmnemergency" element={<Dashmnemergency />} />
<Route path="/dashmnemergencyadmin" element={<Dashmnemergencyadmin />} />
<Route path="/dashmpadmission" element={<Dashmpadmission />} />
<Route path="/dashmpadmissionadmin" element={<Dashmpadmissionadmin />} />
<Route path="/dashmicubed" element={<Dashmicubed />} />
<Route path="/dashmicubedadmin" element={<Dashmicubedadmin />} />
<Route path="/dashmmicubed" element={<Dashmmicubed />} />
<Route path="/dashmmicubedadmin" element={<Dashmmicubedadmin />} />
<Route path="/dashmnicubed" element={<Dashmnicubed />} />
<Route path="/dashmnicubedadmin" element={<Dashmnicubedadmin />} />
<Route path="/dashmhdubed" element={<Dashmhdubed />} />
<Route path="/dashmhdubedadmin" element={<Dashmhdubedadmin />} />
<Route path="/dashmwardbed" element={<Dashmwardbed />} />
<Route path="/dashmwardbedadmin" element={<Dashmwardbedadmin />} />
<Route path="/dashmerbed" element={<Dashmerbed />} />
<Route path="/dashmerbedadmin" element={<Dashmerbedadmin />} />
<Route path="/dashmnerbed" element={<Dashmnerbed />} />
<Route path="/dashmnerbedadmin" element={<Dashmnerbedadmin />} />
<Route path="/dashmpadmhistory" element={<Dashmpadmhistory />} />
<Route path="/dashmpadmhistoryadmin" element={<Dashmpadmhistoryadmin />} />
<Route path="/dashmpbilling" element={<Dashmpbilling />} />
<Route path="/dashmpbillingadmin" element={<Dashmpbillingadmin />} />


        <Route path='/dashboardpagehostel' element={<DashboardPageHostel />} />
        <Route path='/dashboardhostelpagestud' element={<Dashboardhostelpagestud />} />

         {/* Warden Routes - NEW */}
                <Route path='/parent-details' element={<ParentDetailsPage />} />
                <Route path='/gateway-pass-approval' element={<GatewayPassApprovalPage />} />
                <Route path='/building-staff-config' element={<BuildingStaffConfigPage />} />
                <Route path='/mess-polls' element={<MessPollsPage />} />
                <Route path='/mess-applications' element={<MessApplicationPage />} />
                
                {/* Student Routes - NEW */}
                <Route path='/student-gateway-pass' element={<StudentGatewayPassPage />} />
                <Route path='/student-gateway-status' element={<StudentGatewayStatusPage />} />
                <Route path='/student-meal-vote' element={<StudentMealVotePage />} />
                <Route path='/student-mess-application' element={<StudentMessApplicationPage />} />
                
                {/* Parent Routes - NEW */}
                <Route path='/parent-approval/:token' element={<ParentApprovalPage />} />

        <Route path="/viewmmcevents" element={<Viewmmcevents />} />
        <Route path="/allocatefaculties" element={<Allocatefaculties />} />

        <Route path="/dashmstudalloc1" element={<Dashmstudalloc1 />} />
        <Route path="/dashmstudalloc1admin" element={<Dashmstudalloc1admin />} />


         <Route path='/CreateScholarshipDS' element={<CreateScholarshipDS />} />
        <Route path='/ApplyScholarshipDS' element={<ApplyScholarshipDS />} />
        <Route path='/ScholarshipAdminDS' element={<ScholarshipAdminDS />} />
        <Route path='/studentscholarshipsuggestion' element={<StudentScholarshipSuggestionPage />} />

        <Route path="/purchasedsearchds" element={<Purchasedsearchds />} />

        <Route path="/transactionrefds" element={<TransactionrefdsPage />} />
        <Route path="/journalsbygroupds" element={<JournalsByGroupdsPage />} />

         <Route path="/vendormanagementds" element={<Vendormanagementds />} />
        <Route path="/productmanagementds" element={<Productmanagementds />} />
        <Route path="/vendorproductmanagementds" element={<Vendorproductmanagementds />} />
        <Route path="/productrequestds" element={<Productrequestds />} />
        <Route path="/productrequestadminds" element={<Productrequestadminds />} />
        <Route path="/purchasemanagementds" element={<Purchasemanagementds />} />
        <Route path="/paymentmanagementds" element={<Paymentmanagementds />} />

         <Route path="/usermanagementdsoct18" element={<UserManagementdsoct18 />} />
        <Route path="/createuserdsoct18" element={<CreateUserdsoct18 />} />
        <Route path="/leadtouserds" element={<LeadToUserds />} />
        <Route path="/admit-from-crm" element={<AdmitFromCrmPage />} />
        <Route path="/edituserdsoct18/:id" element={<EditUserdsoct18 />} />
        <Route path="/bulkuploadusersdsoct18" element={<BulkUploadUsersdsoct18 />} />
        <Route path="/studentprofiledsoct18" element={<StudentProfiledsoct18 />} />
        <Route path="/profileeditconfigds" element={<ProfileEditConfigds />} />
        <Route path="/profileeditlogsds" element={<ProfileEditLogsds />} />
        <Route path="/dataqualityreportds" element={<DataQualityReportds />} />

        <Route path="/seatallocatormds4" element={<Seatallocatormds4 />} />

        <Route path="/seatallocator" element={<Seatallocator />} />
        <Route path="/seatallocator1" element={<Seatallocator1 />} />
        <Route path="/seatallocatorm1" element={<Seatallocatorm1 />} />
        <Route path="/seatallocatorm2" element={<Seatallocatorm2 />} />
        <Route path="/seatallocatorm3" element={<Seatallocatorm3 />} />
        <Route path="/seatallocatorm4" element={<Seatallocatorm4 />} />
        <Route path="/seatallocatorm5" element={<Seatallocatorm5 />} />

        {/* Faculty Routes */}
        
        <Route path="/subjectlimitconfig" element={<SubjectLimitConfig />} />
        <Route path="/subjectgroupds" element={<SubjectGroupds />} />
        <Route path='/subjectApprovalds' element={<SubjectApprovalds />} />
        <Route path="/subjectreportds" element={<SubjectReportds />} />
        
        {/* Student Route */}
        <Route path='/studentSubjectds' element={<StudentSubjectds />} />

        <Route path="/dashmchatentry" element={<Dashmchatentry />} />

        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/create-user" element={<CreateUser />} />
        <Route path="/admin/edit-user/:id" element={<EditUserds />} />
        <Route path="/admin/bulk-upload-users" element={<BulkUploadUsers />} />
        <Route path="/admin/admin-passwords" element={<AdminPasswordUsersds />} />
        <Route path="/meritlist" element={<MeritListPage />} />
        <Route path="/meritlistselection" element={<MeritListSelectionPage />} />
        <Route path="/regulationmaster" element={<RegulationMasterPage />} />
        <Route path="/regulationsubjects" element={<RegulationSubjectPage />} />
        <Route path="/regulationseats" element={<RegulationSeatPage />} />
        <Route path="/regulationcoursemap" element={<RegulationCourseMapPage />} />
        <Route path="/gracemarkspolicy" element={<GraceMarksPolicyPage />} />
        <Route path="/atktrules" element={<AtktRulePage />} />
        <Route path="/programwise-marksheet-configuration" element={<ProgramwiseMarksheetConfigurationPage />} />
        <Route path="/neplmselectiveenrollment" element={<NepLmsElectiveEnrollmentPage />} />
        <Route path="/neplmselectiveapproval" element={<NepLmsElectiveApprovalPage />} />
        <Route path="/studentelectiveapplication" element={<NepLmsStudentElectiveApplicationPage />} />
        <Route path="/studentmyelectives" element={<NepLmsStudentElectivesPage />} />
        <Route path="/specialization" element={<SpecializationPage />} />
        <Route path="/specializationnew" element={<SpecializationNewPage />} />
        <Route path="/specializationnewcourses" element={<SpecializationCoursesPage />} />
        <Route path="/specializationnewstudents" element={<SpecializationStudentsPage />} />
        <Route path="/specializationnewtimetable" element={<SpecializationTimetablePage />} />
        <Route path="/specializationnewattendance" element={<SpecializationAttendancePage />} />
        <Route path="/courseassessment" element={<CourseAssessmentPage />} />
        <Route path="/assessmentcomponent" element={<AssessmentComponentPage />} />
        <Route path="/passmarksconfiguration" element={<PassMarksConfigurationPage />} />
        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="/colist" element={<CourseOutcomePage />} />
        <Route path="/gradeconfiguration" element={<GradeConfigurationPage />} />
        <Route path="/boscycle" element={<BosCyclePage />} />
        <Route path="/bosapprovalmatrix" element={<BosApprovalMatrixPage />} />
        <Route path="/bosassignment" element={<BosAssignmentPage />} />
        <Route path="/boscoursereview" element={<BosCourseReviewPage />} />
        <Route path="/boscourseapproval" element={<BosCourseApprovalPage />} />
        <Route path="/bosprogramreview" element={<BosProgramReviewPage />} />
        <Route path="/bosreport" element={<BosReportPage />} />
        <Route path="/relativegradingconfiguration" element={<RelativeGradingConfigurationPage />} />
        <Route path="/zscoreconfiguration" element={<ZScoreConfigurationPage />} />
        <Route path="/academicsubjects" element={<AcademicSubjectPage />} />
        <Route path="/accreditationstatus" element={<AccreditationStatusPage />} />
        <Route path="/workloadassignment" element={<WorkloadAssignmentPage />} />
        <Route path="/workloaddynamicreport" element={<WorkloadDynamicReportPage />} />
        <Route path="/facultyqualification" element={<FacultyQualificationPage />} />
        <Route path="/facultyqualificationadmin" element={<FacultyQualificationAdminPage />} />
        <Route path="/autoworkload" element={<AutoWorkloadAllocationPage />} />
        <Route path="/periodconfiguration" element={<ProgramPeriodSlotPage />} />
        <Route path="/facultyavailability" element={<FacultyAvailabilityPage />} />
        <Route path="/facultyavailabilityadmin" element={<FacultyAvailabilityAdminPage />} />
        <Route path="/neplmsassignedcourses" element={<NepLmsAssignedCoursesPage />} />
        <Route path="/neplmscourseworkspace" element={<NepLmsCourseWorkspacePage />} />
        <Route path="/neplmsfacultylogbook" element={<NepLmsFacultyLogbookPage />} />
        <Route path="/neplmsmindmaps" element={<NepLmsFacultyMindMapPage />} />
        <Route path="/neplmsmindmapsadmin" element={<NepLmsAdminMindMapPage />} />
        <Route path="/neplmsadminresources" element={<NepLmsAdminResourceAssignmentPage />} />
        <Route path="/neplmsmycoursecontent" element={<NepLmsMyCourseContentPage />} />
        <Route path="/neplmsquizanalytics" element={<NepLmsQuizAnalyticsPage />} />
        <Route path="/neplmslivequiz" element={<NepLmsLiveQuizPage />} />
        <Route path="/neplmsprereading" element={<NepLmsPreReadingPage />} />
        <Route path="/neplmsprereadingadmin" element={<NepLmsPreReadingAdminPage />} />
        <Route path="/neplmsclassgroups" element={<NepLmsClassGroupsPage />} />
        <Route path="/neplmsclassgroupsadmin" element={<NepLmsClassGroupsAdminPage />} />
        <Route path="/neplmsassessment" element={<NepLmsAssessmentPage />} />
        <Route path="/studentneplmsassessment" element={<NepLmsStudentAssessmentPage />} />
        <Route path="/neplmsremedial" element={<NepLmsRemedialPage />} />
        <Route path="/studentneplmsremedial" element={<NepLmsStudentRemedialPage />} />
        <Route path="/neplmsaicoursegeneration" element={<NepLmsAiCourseGenerationPage />} />
        <Route path="/neplmsmastertimetable" element={<NepLmsMasterTimetableReportPage />} />
        <Route path="/neplmsonlineclass" element={<NepLmsOnlineClassRoomPage />} />
        <Route path="/neplmstimetablemanager" element={<NepLmsTimetableManagerPage />} />
        <Route path="/neplmssectionwisetimetable" element={<NepLmsSectionwiseTimetablePage />} />
        <Route path="/neplmsclassgroupwisetimetable" element={<NepLmsClassGroupwiseTimetablePage />} />
        <Route path="/neplmstimetablecreator" element={<NepLmsTimetableCreatorPage />} />
        <Route path="/neplmstimetablecreatorfiltered" element={<NepLmsTimetableCreatorFilteredPage />} />
        <Route path="/neplmstimetableroomcreator" element={<NepLmsTimetableRoomCreatorPage />} />
        <Route path="/neplmsmyclasses" element={<NepLmsMyClassesPage />} />
        <Route path="/roomconfiguration" element={<RoomResourcePage />} />
        <Route path="/roomcalendar" element={<RoomCalendarPage />} />
        <Route path="/neplmsattendance" element={<NepLmsAttendancePage />} />
        <Route path="/neplmsattendanceevent" element={<NepLmsAttendanceEventPage />} />
        <Route path="/neplmssectionwiseattendance" element={<NepLmsSectionwiseAttendancePage />} />
        <Route path="/neplmsproxyfaculty" element={<NepLmsProxyFacultyPage />} />
        <Route path="/neplmsproxyattendance" element={<NepLmsProxyAttendancePage />} />
        <Route path="/neplmsenrollmentgroup" element={<NepLmsEnrollmentGroupPage />} />
        <Route path="/neplmsenrollmentgroupstudents" element={<NepLmsEnrollmentGroupStudentsPage />} />
        <Route path="/neplmsenrollmentworkload" element={<NepLmsEnrollmentWorkloadPage />} />
        <Route path="/neplmsenrollmenttimetable" element={<NepLmsEnrollmentTimetablePage />} />
        <Route path="/neplmsenrollmentattendance" element={<NepLmsEnrollmentAttendancePage />} />
        <Route path="/neplmsgroupattendance" element={<NepLmsGroupAttendancePage />} />
        <Route path="/neplmsclassgroupattendance2" element={<NepLmsClassGroupAttendance2Page />} />
        <Route path="/neplmsphotoattendance" element={<NepLmsPhotoAttendancePage />} />
        <Route path="/neplmsotpattendance" element={<NepLmsOtpAttendancePage />} />
        <Route path="/studentneplmsotpattendance" element={<NepLmsStudentOtpAttendancePage />} />
        <Route path="/neplmsattendancereview" element={<NepLmsAttendanceReviewPage />} />
        <Route path="/neplmssupplementaryattendanceworkflow" element={<SupplementaryAttendanceWorkflowPage />} />
        <Route path="/neplmssupplementaryattendance" element={<SupplementaryAttendanceRequestPage />} />
        <Route path="/neplmssupplementaryattendanceapproval" element={<SupplementaryAttendanceApprovalPage />} />
        <Route path="/neplmssupplementaryattendancereport" element={<SupplementaryAttendanceReportPage />} />
        <Route path="/neplmsassessmentmarks" element={<NepLmsAssessmentMarksPage />} />
        <Route path="/neplmsassessmentmarksview" element={<NepLmsAssessmentMarksViewPage />} />
        <Route path="/neplmscomponentmarks" element={<NepLmsComponentMarksViewPage />} />
        <Route path="/neplmsfinalmarks" element={<NepLmsFinalMarksViewPage />} />
        <Route path="/neplmsfinalmarksedit" element={<NepLmsFinalMarksEditPage />} />
        <Route path="/neplmsgradecard" element={<NepLmsGradeCardPage />} />
        <Route path="/neplmsadvancedgradecard" element={<NepLmsAdvancedGradeCardPage />} />
        <Route path="/verify-grade-card-blockchain" element={<PublicGradeCardBlockchainVerifyPage />} />
        <Route path="/exammodel2marks" element={<ExaminationModel2MarksPage />} />
        <Route path="/exammodel2-component-marks-crud" element={<ExamModel2ComponentMarksCrudPage />} />
        <Route path="/exammodel2-interim-marks-transfer" element={<ExamModel2InterimMarksTransferPage />} />
        <Route path="/exammodel2vivamarks" element={<ExaminationModel2VivaMarksPage />} />
        <Route path="/exammodel2viva-gradingtemplate" element={<ExaminationModel2VivaGradingTemplatePage />} />
        <Route path="/exammodel2viva-gradingtemplatedetails" element={<ExaminationModel2VivaGradingTemplateDetailPage />} />
        <Route path="/exammodel2viva-classconfiguration" element={<ExaminationModel2VivaClassConfigurationPage />} />
        <Route path="/exammodel2viva-gradeprocessing" element={<ExaminationModel2VivaGradeProcessingPage />} />
        <Route path="/exammodel2viva-percentagecalculation" element={<ExaminationModel2VivaPercentageCalculationPage />} />
        <Route path="/exammodel2viva-componentfailrule" element={<ExaminationModel2VivaComponentFailRulePage />} />
        <Route path="/exammodel2viva-marksheet" element={<ExaminationModel2VivaMarksheetPage />} />
        <Route path="/exammodel2viva-marksheet-marks" element={<ExaminationModel2VivaMarksOnlyMarksheetPage />} />
        <Route path="/exammodel2gradingtemplate" element={<ExaminationModel2GradingTemplatePage />} />
        <Route path="/exammodel2gradingtemplatedetails" element={<ExaminationModel2GradingTemplateDetailPage />} />
        <Route path="/exammodel2classconfiguration" element={<ExaminationModel2ClassConfigurationPage />} />
        <Route path="/exammodel2gradeprocessing" element={<ExaminationModel2GradeProcessingPage />} />
        <Route path="/exammodel2percentagecalculation" element={<ExaminationModel2PercentageCalculationPage />} />
        <Route path="/exammodel2componentfailrule" element={<ExaminationModel2ComponentFailRulePage />} />
        <Route path="/exammodel2finalgradeprocessing" element={<ExaminationModel2FinalGradeProcessingPage />} />
        <Route path="/exammodel2marksheet" element={<ExaminationModel2MarksheetPage />} />
        <Route path="/exammodel2aprmarksheet" element={<ExaminationModel2AprMarksheetPage />} />
        <Route path="/exammodel2bulkaprmarksheet" element={<ExaminationModel2BulkAprMarksheetPage />} />
        <Route path="/verify-exam-model2-marksheet" element={<PublicExamModel2MarksheetVerifyPage />} />
        <Route path="/neplmsstudentwiseattendance" element={<NepLmsStudentwiseAttendanceReportPage />} />
        <Route path="/neplmsstudentcoursewiseattendance" element={<NepLmsStudentCoursewiseAttendanceReportPage />} />
        <Route path="/neplmsstudentlearningprofile" element={<NepLmsStudentLearningProfilePage />} />
        <Route path="/neplmslowattendance" element={<NepLmsLowAttendanceReportPage />} />
        <Route path="/neplmsfacultycourselowattendance" element={<NepLmsFacultyCourseLowAttendanceReportPage />} />
        <Route path="/neplmsloginbasedattendance" element={<NepLmsLoginBasedAttendancePage />} />
        <Route path="/neplmsconsecutiveabsence" element={<NepLmsConsecutiveAbsencePage />} />
        <Route path="/neplmsmissingtimetable" element={<NepLmsMissingTimetablePage />} />
        <Route path="/neplmscourseprogression" element={<NepLmsCourseProgressionPage />} />
        <Route path="/facultydashboard" element={<NepLmsFacultyDashboardPage />} />
        <Route path="/studentdashboard" element={<NepLmsStudentDashboardPage />} />
        <Route path="/studentneplmsworkspace" element={<NepLmsStudentWorkspacePage />} />
        <Route path="/studentneplmsmindmaps" element={<NepLmsStudentMindMapPage />} />
        <Route path="/studentsequentialcontent" element={<NepLmsStudentSequentialContentPage />} />
        <Route path="/studentneplmslivequiz" element={<NepLmsStudentLiveQuizPage />} />
        <Route path="/studentprereading" element={<StudentPreReadingPage />} />
        <Route path="/studentmyattendancesummary" element={<NepLmsMyAttendanceSummaryPage />} />
        <Route path="/mentoringworkspace" element={<MentoringWorkspacePage />} />
        <Route path="/studentmentoringworkspace" element={<StudentMentoringWorkspacePage />} />
        <Route path="/mentoringhomevisits" element={<MentoringHomeVisitPage />} />
        <Route path="/mentoringsessions" element={<MentoringSessionPage />} />
        <Route path="/mentoringstudentprofile" element={<MentoringStudentProfilePage />} />
        <Route path="/studentmentoringdetails" element={<StudentMentoringReadonlyPage />} />
        <Route path="/activitypointsconfiguration" element={<ActivityPointsConfigurationPage />} />
        <Route path="/activityuserpoints" element={<ActivityUserPointsPage />} />
        <Route path="/activitymonitoringreport" element={<ActivityMonitoringReportPage />} />
        <Route path="/activitymonitoringreport2" element={<ActivityMonitoringReport2Page />} />
        <Route path="/online-examination" element={<OnlineExamManagementPage />} />
        <Route path="/online-exam-responses" element={<OnlineExamResponsesPage />} />
        <Route path="/online-exam-report" element={<OnlineExamReportPage />} />
        <Route path="/student-online-exam" element={<StudentOnlineExamPage />} />
        <Route path="/crm-management" element={<CrmManagementPage />} />
        <Route path="/crm-lead-actions" element={<CrmLeadActionPage />} />
        <Route path="/crm-reports" element={<CrmReportsPage />} />
        <Route path="/crm-my-leads" element={<CrmMyLeadsPage />} />
        <Route path="/crm-my-followups" element={<CrmMyFollowupsPage />} />
        <Route path="/crm-counselor-mapping" element={<CrmCounselorMappingPage />} />
        <Route path="/crm-inbound-api" element={<CrmInboundApiPage />} />
        <Route path="/crm-bulk-assignment" element={<CrmBulkAssignmentPage />} />
        <Route path="/crm-form-link" element={<CrmFormLinkPage />} />
        <Route path="/crm-ai-agent" element={<CrmAiAgentPage />} />
        <Route path="/crm-public-form" element={<PublicCrmFormPage />} />
        <Route path="/hrleavehierarchy" element={<HrLeaveManagementPage defaultTab="hierarchy" />} />
        <Route path="/hrleavetypes" element={<HrLeaveManagementPage defaultTab="types" />} />
        <Route path="/hrleavecycle" element={<HrLeaveManagementPage defaultTab="cycle" />} />
        <Route path="/hrleavebalance" element={<HrLeaveManagementPage defaultTab="balance" />} />
        <Route path="/hrleavereset" element={<HrLeaveManagementPage defaultTab="reset" />} />
        <Route path="/hrleaveapply" element={<HrLeaveApplyPage />} />
        <Route path="/hrleaveapprove" element={<HrLeaveApprovePage />} />
        <Route path="/hrleavedashboard" element={<HrLeaveDashboardPage />} />
        <Route path="/hrleavehrdashboard" element={<HrLeaveHrDashboardPage />} />
        <Route path="/hrleaveallleaves" element={<HrLeaveAllLeavesPage />} />
        <Route path="/hrleavecomprule" element={<HrLeaveCompensatoryRulePage />} />
        <Route path="/hrleaveaccrualrule" element={<HrLeaveAccrualRulePage />} />
        <Route path="/hrleavenewjoineerule" element={<HrLeaveNewJoineeRulePage />} />
        <Route path="/hrleaveweeklyoff" element={<HrLeaveWeeklyOffPage />} />
        <Route path="/hrleaveholidaylist" element={<HrLeaveHolidayListPage />} />
        <Route path="/hrleavevacationpolicy" element={<HrLeaveVacationPolicyPage />} />
        <Route path="/hrleavepopulatevacation" element={<HrLeavePopulateVacationPage />} />
        <Route path="/hrleavecompbalance" element={<HrLeaveCompensatoryBalancePage />} />
        <Route path="/hremployeeattendance" element={<HrEmployeeAttendancePage />} />
        <Route path="/hrattendanceprocessingrules" element={<HrAttendanceProcessingRulesPage />} />
        <Route path="/hrattendancerulebased" element={<HrAttendanceRuleBasedPage />} />
        <Route path="/hrshifttiming" element={<HrShiftTimingPage />} />
        <Route path="/hrshiftallocation" element={<HrShiftAllocationPage />} />
        <Route path="/hremployeehours" element={<HrEmployeeHoursPage />} />
        <Route path="/hrlatepolicy" element={<HrLatePolicyPage />} />
        <Route path="/hrovertimepolicy" element={<HrOvertimePolicyPage />} />
        <Route path="/hremployeeattendancematrix" element={<HrEmployeeAttendanceMatrixPage />} />
        <Route path="/hremployeeattendanceapproval" element={<HrEmployeeAttendanceApprovalPage />} />
        <Route path="/organizationhierarchy" element={<OrganizationHierarchyPage />} />
        <Route path="/departmentalorgchart" element={<DepartmentOrgChartPage />} />
        <Route path="/institutionorgchart" element={<InstitutionOrgChartPage />} />
        <Route path="/employeereporting" element={<EmployeeReportingPage />} />
        <Route path="/hrexpenseworkflow" element={<HrExpenseWorkflowPage />} />
        <Route path="/hrexpenserules" element={<HrExpenseRulesPage />} />
        <Route path="/hrexpensesubmit" element={<HrExpenseSubmitPage />} />
        <Route path="/hrexpenseapproval" element={<HrExpenseApprovalPage />} />
        <Route path="/hrexpensestatus" element={<HrExpenseStatusPage />} />
        <Route path="/hrexpensereport" element={<HrExpenseReportPage />} />
        <Route path="/hrhelp" element={<HrHelpPage />} />
        <Route path="/helpmenu" element={<MenuManagementHelpPage />} />
        <Route path="/helpfees" element={<FeesHelpPage />} />
        <Route path="/helpexamination" element={<ExaminationHelpPage />} />
        <Route path="/helpprofile" element={<ProfileHelpPage />} />
        <Route path="/helpusermanagement" element={<UserManagementHelpPage />} />
        <Route path="/helpacademicconfiguration" element={<AcademicConfigurationHelpPage />} />
        <Route path="/helpadmission" element={<AdmissionHelpPage />} />
        <Route path="/helpneplms" element={<NepLmsHelpPage />} />
        <Route path="/helprecruitment" element={<RecruitmentHelpPage />} />
        <Route path="/helptranscript" element={<TranscriptHelpPage />} />
        <Route path="/helpplacement" element={<PlacementCoordinatorHelpPage />} />
        <Route path="/helpaihelpdesk" element={<AiHelpdeskHelpPage />} />
        <Route path="/helplibrarynew" element={<LibraryNewHelpPage />} />
        <Route path="/hostelbuildingrooms" element={<HostelBuildingRoomPage />} />
        <Route path="/hostelassignment" element={<HostelAssignmentPage />} />
        <Route path="/hostelvacancyreport" element={<HostelVacancyReportPage />} />
        <Route path="/hostelcard" element={<HostelCardPage />} />
        <Route path="/studenthostelbedapply" element={<StudentHostelBedApplyPage />} />
        <Route path="/hostelbedrequests" element={<HostelBedRequestApprovalPage />} />
        <Route path="/hostellightbill" element={<HostelLightBillPage />} />
        <Route path="/employeedatabase" element={<EmployeeDatabasePage />} />
        <Route path="/employeedatabasereport" element={<EmployeeDatabaseReportPage />} />
        <Route path="/employeeprofileedit" element={<EmployeeProfileEditPage />} />
        <Route path="/studentdataupload" element={<StudentDataUploadPage />} />
        <Route path="/studentmenumanagement" element={<StudentMenuManagementPage />} />
        <Route path="/programwiseaccess" element={<ProgramwiseAccessPage />} />
        <Route path="/specializationassignment" element={<SpecializationAssignmentPage />} />
        <Route path="/casnewentry" element={<CasNewEntryPage />} />
        <Route path="/casnewworkflow" element={<CasNewWorkflowPage />} />
        <Route path="/casnewapproval" element={<CasNewApprovalPage />} />
        <Route path="/casnewstatus" element={<CasNewStatusPage />} />
        <Route path="/casnewsummary" element={<CasNewSummaryPage />} />
        <Route path="/casnewmasterreport" element={<CasNewMasterReportPage />} />
        <Route path="/studentemailmessage" element={<StudentEmailMessagePage />} />
        <Route path="/mfeesconfig" element={withMenu("Fee configuration regulation", <MFeesConfigPage />)} />
        <Route path="/feeapproval" element={withMenu("Fee Approval", <FeeApprovalPage />)} />
        <Route path="/feeapprovalroles" element={withMenu("Fee Approval Roles", <FeeApprovalRolesPage />)} />
        <Route path="/feeapplication" element={<FeeApplicationPage />} />
        <Route path="/feesapplicationauto" element={<FeesApplicationAutoPage />} />
        <Route path="/feetransferlog" element={<FeeTransferLogPage />} />
        <Route path="/studentledgercrud" element={<StudentLedgerCrudPage />} />
        <Route path="/studentledgermaster" element={<StudentLedgerMasterPage />} />
        <Route path="/feerefundmanagement" element={<FeeRefundManagementPage />} />
        <Route path="/feerefundsummary" element={<FeeRefundSummaryPage />} />
        <Route path="/updatefeerefund" element={<UpdateFeeRefundPage />} />
        <Route path="/feesmodelreport" element={withMenu("Fees Model Report", <FeesModelReportPage />)} />
        <Route path="/feeitemreport" element={withMenu("Fees Item report", <FeeItemReportPage />)} />
        <Route path="/studentfeeapply" element={withMenu("Apply Fee to Student", <StudentFeeApplyPage />)} />
        <Route path="/studentledgerapproval" element={withMenu("Student Ledger Approval", <StudentLedgerApprovalPage />)} />
        <Route path="/studentledgerapprovalroles" element={withMenu("Student Ledger Approval Roles", <StudentLedgerApprovalRolesPage />)} />
        <Route path="/studentledgeradjustment" element={withMenu("Student Ledger Adjustment", <StudentLedgerAdjustmentPage />)} />
        <Route path="/studentledgeranalytics" element={withMenu("Student Ledger Analytics", <StudentLedgerAnalyticsPage />)} />
        <Route path="/studentledgerpaidanalytics" element={withMenu("Paid Date Ledger Analytics", <StudentLedgerPaidAnalyticsPage />)} />
        <Route path="/feespivot" element={withMenu("Fees pivot", <FeesPivotPage />)} />
        <Route path="/feespivot2" element={<FeesPivot2Page />} />
        <Route path="/feespaidreport" element={<FeesPaidReportPage />} />
        <Route path="/programwisefeesreport" element={<ProgramwiseFeesReportPage />} />
        <Route path="/pendingfees" element={<PendingFeesPage />} />
        <Route path="/disciplinaryaction" element={<DisciplinaryActionPage />} />
        <Route path="/disciplinaryactionupdate" element={<DisciplinaryActionUpdatePage />} />
        <Route path="/studentledgercounterpayment" element={<StudentLedgerCounterPaymentPage />} />
        <Route path="/counterfee2" element={<CounterFee2PaymentPage />} />
        <Route path="/counterfee3" element={<CounterFee3PaymentPage />} />
        <Route path="/counterfee4" element={<CounterFee4PaymentPage />} />
        <Route path="/counterfee5" element={<CounterFee5PaymentPage />} />
        <Route path="/feesreceiptnote" element={<FeesReceiptNotePage />} />
        <Route path="/counterfee2receipt" element={<CounterFee2ReceiptPage />} />
        <Route path="/counterfeereceipt" element={<CounterFee4ReceiptPage />} />
        <Route path="/chequepaymentdetails" element={<ChequePaymentDetailsPage />} />
        <Route path="/miscellaneousamounts" element={<MiscellaneousAmountPage />} />
        <Route path="/miscellaneousfeecollection" element={<MiscellaneousFeeCollectionPage />} />
        <Route path="/studentfeesreceipt" element={<StudentFeesReceiptPage />} />
        <Route path="/blockchainfeesreceipt" element={<BlockchainStudentFeesReceiptPage />} />
        <Route path="/verify-blockchain-fees-receipt" element={<BlockchainFeesReceiptVerifyPage />} />
        <Route path="/studentledgerdetail" element={<StudentLedgerDetailPage />} />
        <Route path="/dynamic-admission-form" element={withMenu("Dynamic Admission Form", <DynamicAdmissionFormPage />)} />
        <Route path="/admission-inbound-api" element={<AdmissionInboundApiPage />} />
        <Route path="/admission-ai-agents" element={<AdmissionAiAgentsPage />} />
        <Route path="/admission-ai-agent-logs" element={<AdmissionAiAgentLogsPage />} />
        <Route path="/dynamic-admission-applications" element={withMenu("Admission Applications", <DynamicAdmissionApplicationsPage />)} />
        <Route path="/admission-application-management" element={<AdmissionApplicationManagementPage />} />
        <Route path="/admission-application-comments" element={<AdmissionApplicationCommentsPage />} />
        <Route path="/subject-wise-admission" element={withMenu("Subject Wise Admission", <SubjectWiseAdmissionApplicationsPage />)} />
        <Route path="/dynamic-admission-profile/:id" element={withMenu("Admission Profile", <DynamicAdmissionProfilePage />)} />
        <Route path="/dynamic-admission-profile2/:id" element={<DynamicAdmissionProfile2Page />} />
        <Route path="/dynamic-admission-profile-subjects/:id" element={withMenu("Admission Subject Profile", <DynamicAdmissionProfileSubjectsPage />)} />
        <Route path="/admission-apply" element={<PublicAdmissionApplyPage />} />
        <Route path="/admission-apply-grouped" element={<PublicAdmissionApplyGroupedPage />} />
        <Route path="/admission-apply-tabbed" element={<PublicAdmissionApplyTabbedPage />} />
        <Route path="/admission-apply-tabbed-program" element={<PublicAdmissionApplyTabbedProgramPage />} />
        <Route path="/admission-apply-tabbed-program-draft" element={<PublicAdmissionApplyTabbedProgramDraftPage />} />
        <Route path="/admission-apply-tabbed-program-credential-draft" element={<PublicAdmissionApplyTabbedProgramCredentialDraftPage />} />
        <Route path="/admission-apply-tabbed-program-credential-draft-red" element={<PublicAdmissionApplyTabbedProgramCredentialDraftRedPage />} />
        <Route path="/admission-apply-tabbed-program-credential-draft-red-level" element={<PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelPage />} />
        <Route path="/admission-apply-tabbed-program-credential-draft-red-level-ai" element={<PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPage />} />
        <Route path="/admission-apply-tabbed-program-credential-draft-red-level-ai-ph" element={<PublicAdmissionApplyTabbedProgramCredentialDraftRedLevelAiPhPage />} />
        <Route path="/admission-ai-ph" element={<PublicAdmissionAiPhPage />} />
        <Route path="/admission-ai-ph-documents" element={<PublicAdmissionAiPhDocumentsPage />} />
        <Route path="/admission-ai-agent-documents" element={<PublicAdmissionAiAgentDocumentsPage />} />
        <Route path="/admission-application-lookup" element={<AdmissionApplicationLookupPage />} />
        <Route path="/admission-datewise-summary" element={withMenu("Admission Datewise Summary", <AdmissionDatewiseSummaryPage />)} />
        <Route path="/admission-dynamic-report" element={<AdmissionDynamicReportPage />} />
        <Route path="/admission-payments" element={<AdmissionPaymentsPage />} />
        <Route path="/admission-fee-receipt" element={<AdmissionFeeReceiptPage />} />
        <Route path="/admission-address-configuration" element={withMenu("Address Configuration", <AdmissionAddressConfigurationPage />)} />
        <Route path="/admission-board-configuration" element={withMenu("Board Configuration", <AdmissionBoardConfigurationPage />)} />
        <Route path="/admission-validation-criteria" element={withMenu("Admission Validation Criteria", <AdmissionValidationCriteriaPage />)} />
        <Route path="/admission-form-documents" element={<AdmissionFormDocumentsPage />} />
        <Route path="/academiccalendar" element={<AcademicCalendarPage />} />
        <Route path="/academiccalendar-ai" element={<AcademicCalendarAiPage />} />
        <Route path="/recruitment-management" element={<RecruitmentManagementPage />} />
        <Route path="/recruitment-interview-panels" element={<RecruitmentInterviewPanelPage />} />
        <Route path="/recruitment-panel-members" element={<RecruitmentPanelMembersPage />} />
        <Route path="/recruitment-panel-jobs" element={<RecruitmentPanelJobPage />} />
        <Route path="/recruitment-interview-schedule" element={<RecruitmentInterviewSchedulePage />} />
        <Route path="/recruitment-interview-parameters" element={<RecruitmentInterviewParametersPage />} />
        <Route path="/recruitment-interview-score-entry" element={<RecruitmentInterviewScoreEntryPage />} />
        <Route path="/recruitment-interview-profile" element={<RecruitmentInterviewProfilePage />} />
        <Route path="/recruitment-apply" element={<PublicRecruitmentApplyPage />} />
        <Route path="/recruitment-offer-templates" element={<RecruitmentOfferTemplatesPage />} />
        <Route path="/recruitment-onboarding-steps" element={<RecruitmentOnboardingStepsPage />} />
        <Route path="/recruitment-offer-letter" element={<RecruitmentOfferLetterPage />} />
        <Route path="/recruitment-candidates-to-user" element={<RecruitmentCandidatesToUserPage />} />
        <Route path="/recruitment-onboarding-checklist" element={<RecruitmentOnboardingChecklistPage />} />
        <Route path="/recruitment-onboarding-report" element={<RecruitmentOnboardingReportPage />} />
        <Route path="/placement-leads" element={<PlacementLeadsPage />} />
        <Route path="/placement-lead-stage" element={<PlacementLeadStagePage />} />
        <Route path="/placement-visit-plan" element={<PlacementVisitPlanPage />} />
        <Route path="/placement-visit-calendar" element={<PlacementVisitCalendarPage />} />
        <Route path="/placement-new-companies" element={<PlacementCompanyDetailsPage />} />
        <Route path="/placement-new-jobs" element={<PlacementJobPostingPage />} />
        <Route path="/placement-new-sip-students" element={<PlacementSipStudentListPage />} />
        <Route path="/placement-new-placement-students" element={<PlacementStudentsPage />} />
        <Route path="/placement-new-stages" element={<PlacementStagesPage />} />
        <Route path="/placement-new-stage-add-students" element={<PlacementStageAddStudentsPage />} />
        <Route path="/placement-new-stagewise-students" element={<PlacementStagewiseStudentsPage />} />
        <Route path="/placement-new-placed-report" element={<PlacementPlacedReportPage />} />
        <Route path="/placement-new-stage-report" element={<PlacementStageReportPage />} />
        <Route path="/placement-new-conversion-report" element={<PlacementConversionReportPage />} />
        <Route path="/placement-new-industry-report" element={<PlacementIndustryReportPage />} />
        <Route path="/placement-new-unemployed-students" element={<PlacementUnemployedStudentsPage />} />
        <Route path="/placement-new-mentors" element={<PlacementStudentMentorAssignmentPage />} />
        <Route path="/placement-new-reports" element={<PlacementReportsPage />} />
        <Route path="/placement-new-mentor-report" element={<PlacementProjectReportPage mentor />} />
        <Route path="/continuous-feedback-quick" element={<ContinuousFeedbackQuickFormPage />} />
        <Route path="/continuous-feedback-student" element={<StudentContinuousFeedbackPage />} />
        <Route path="/continuous-feedback-report" element={<ContinuousFeedbackReportPage />} />
        <Route path="/student-placement-skills" element={<PlacementStudentSkillsPage />} />
        <Route path="/student-placement-internships" element={<PlacementStudentInternshipProfilePage />} />
        <Route path="/student-placement-sip" element={<PlacementStudentAssignedSipPage />} />
        <Route path="/student-placement-project-stages" element={<PlacementProjectStagesPage />} />
        <Route path="/student-placement-stage-details" element={<PlacementStageDetailsPage />} />
        <Route path="/student-placement-project-report" element={<PlacementProjectReportPage />} />
        <Route path="/admission-apply-subjects" element={<PublicAdmissionApplySubjectsPage />} />
        <Route path="/dynamic-admission-sort" element={withMenu("Admission Sort", <DynamicAdmissionSortPage />)} />
        <Route path="/dynamic-admission-bulk-upload" element={withMenu("Admission Bulk Upload", <DynamicAdmissionBulkUploadPage />)} />
        <Route path="/student-dynamic-filter" element={<StudentDynamicFilterPage />} />
        <Route path="/program-eligibility" element={<ProgramEligibilityPage />} />
        <Route path="/dynamic-admission-to-user" element={withMenu("Admission To User", <DynamicAdmissionToUserPage />)} />
        <Route path="/provisional-admission-letter" element={withMenu("Provisional Admission Letter", <ProvisionalAdmissionLetterPage />)} />
        <Route path="/offer-letter" element={<OfferLetterPage />} />
        <Route path="/programmanagement" element={<ProgramManagementPage />} />
        <Route path="/schoolclassmanagement" element={<SchoolClassManagementPage />} />
        <Route path="/schoolsyllabusyear" element={<SchoolSyllabusYearPage />} />
        <Route path="/schoolsubjectgroup" element={<SchoolSubjectGroupPage />} />
        <Route path="/schoolcourselist" element={<SchoolCourseListPage />} />
        <Route path="/configuration" element={<ConfigurationSetupPage />} />
        <Route path="/aiconfiguration" element={<AiConfigurationPage />} />
        <Route path="/ollamaconfiguration" element={<OllamaConfigurationPage />} />
        <Route path="/countryconfiguration" element={<CountryConfigurationPage />} />
        <Route path="/dummy-data-generator" element={<DummyDataGeneratorPage />} />
        <Route path="/emailconfiguration" element={<EmailConfigurationPage />} />
        <Route path="/transcript-recorder" element={<TranscriptRecorderPage />} />
        <Route path="/transcript-meetings" element={<TranscriptMeetingsCalendarPage />} />
        <Route path="/my-transcript-meetings" element={<TranscriptMeetingsCalendarPage myOnly />} />
        <Route path="/meeting-transcript-recorder" element={<MeetingTranscriptRecorderPage />} />
        <Route path="/knowledgebase" element={<KnowledgebasePage />} />
        <Route path="/ai-helpdesk-chatbot" element={<PublicAiHelpdeskChatbotPage />} />
        <Route path="/userpivotreport" element={<UserPivotReportPage />} />
        <Route path="/userpivotcount" element={<UserPivotCountPage />} />
        <Route path="/studentdetails" element={<StudentDetailsReportPage />} />
        <Route path="/studentphotoupload" element={<StudentPhotoUploadPage />} />
        <Route path="/userphotoupload" element={<UserPhotoUploadPage />} />
        <Route path="/faculty-cadra-requirement" element={<FacultyCadraRequirementPage />} />
        <Route path="/studentpromotion" element={<StudentPromotionPage />} />
        <Route path="/programtransfer" element={<ProgramTransferPage />} />
        <Route path="/programtransferlog" element={<ProgramTransferLogPage />} />
        <Route path="/admissioncancellation" element={<AdmissionCancellationPage />} />
        <Route path="/admissionrefunddetails" element={<AdmissionRefundDetailsPage />} />
        <Route path="/admissionrefundletter" element={<AdmissionRefundLetterPage />} />
        <Route path="/studentactivities" element={<StudentActivitiesPage />} />
        <Route path="/conduct-exam-master" element={<ConductExamMasterPage />} />
        <Route path="/conduct-exam-fees" element={<ConductExamFeePage />} />
        <Route path="/conduct-exam-form-builder" element={<ConductExamFormBuilderPage />} />
        <Route path="/conduct-exam-dates" element={<ConductExamDatesPage />} />
        <Route path="/conduct-exam-rooms" element={<ConductExamRoomPage />} />
        <Route path="/conduct-exam-courses" element={<ConductExamCoursePage />} />
        <Route path="/conduct-exam-course-scheduler" element={<ConductExamCourseSchedulerPage />} />
        <Route path="/examroll" element={<ConductExamRollPage />} />
        <Route path="/examrollrulescheck" element={<ExamrollRulesCheckPage />} />
        <Route path="/detainedstudents" element={<DetainedStudentsPage />} />
        <Route path="/examrolldisciplinary" element={<ExamrollDisciplinaryHoldPage />} />
        <Route path="/feesdefaulters" element={<FeesDefaultersPage />} />
        <Route path="/conduct-exam-hall-ticket" element={<ConductExamHallTicketPage />} />
        <Route path="/student-view-control" element={<StudentViewControlPage />} />
        <Route path="/student-admit-card-new" element={<StudentAdmitCardNewPage />} />
        <Route path="/verify-hallticket-blockchain" element={<PublicHallTicketBlockchainVerifyPage />} />
        <Route path="/student-exam-registration" element={<StudentExamRegistrationPage />} />
        <Route path="/student-exam-dynamic-form" element={<StudentExamDynamicFormPage />} />
        <Route path="/conduct-exam-seat-allocation" element={<ConductExamSeatAllocationPage />} />
        <Route path="/conduct-exam-invigilation" element={<ConductExamInvigilationPage />} />
        <Route path="/conduct-exam-invigilator-allocation" element={<ConductExamInvigilatorAllocationPage />} />
        <Route path="/conduct-exam-invigilator-attendance" element={<ConductExamInvigilatorAttendancePage />} />
        <Route path="/conduct-exam-invigilator-payment" element={<ConductExamInvigilatorPaymentPage />} />
        <Route path="/conduct-exam-student-attendance" element={<ConductExamStudentAttendancePage />} />
        <Route path="/conduct-exam-flying-squad" element={<ConductExamFlyingSquadPage />} />
        <Route path="/conduct-exam-flying-squad-members" element={<ConductExamFlyingSquadMembersPage />} />
        <Route path="/conduct-exam-flying-squad-assignment" element={<ConductExamFlyingSquadAssignmentPage />} />
        <Route path="/conduct-exam-unfair-means" element={<ConductExamUnfairMeansPage />} />
        <Route path="/conduct-exam-unfair-means-report" element={<ConductExamUnfairMeansReportPage />} />
        <Route path="/conduct-exam-examiner-list" element={<ConductExamExaminerListPage />} />
        <Route path="/conduct-exam-examiner-allotment" element={<ConductExamExaminerAllotmentPage />} />
        <Route path="/conduct-exam-componentwise-allocation" element={<ConductExamComponentwiseAllocationPage />} />
        <Route path="/conduct-exam-examiner-allotment-report" element={<ConductExamExaminerAllotmentReportPage />} />
        <Route path="/conduct-exam-examiner-marks-entry" element={<ConductExamExaminerMarksEntryPage />} />
        <Route path="/conduct-exam-componentwise-marks" element={<ConductExamComponentwiseMarksPage />} />
        <Route path="/conduct-exam-marks-entry-monitoring" element={<ConductExamMarksEntryMonitoringPage />} />
        <Route path="/conduct-exam-examiner-monitoring" element={<ConductExamDaywiseMarksMonitoringPage />} />
        <Route path="/conduct-exam-examiner-reassignment" element={<ConductExamExaminerReassignmentPage />} />
        <Route path="/conduct-exam-paper-setter-registration" element={<ConductExamPaperSetterRegistrationPage />} />
        <Route path="/conduct-exam-submit-question-paper" element={<ConductExamSubmitQuestionPaperPage />} />
        <Route path="/conduct-exam-moderator-registration" element={<ConductExamModeratorRegistrationPage />} />
        <Route path="/conduct-exam-moderation" element={<ConductExamModerationPage />} />
        <Route path="/conduct-exam-review-papers" element={<ConductExamReviewPapersPage />} />
        <Route path="/conduct-exam-rate-card" element={<ConductExamRateCardPage />} />
        <Route path="/conduct-exam-stationary-master" element={<ConductExamStationaryMasterPage />} />
        <Route path="/conduct-exam-stationary-requirement" element={<ConductExamStationaryRequirementPage />} />
        <Route path="/conduct-exam-generator-requirement" element={<ConductExamGeneratorRequirementPage />} />
        <Route path="/conduct-exam-generator-master" element={<ConductExamGeneratorMasterPage />} />
        <Route path="/conduct-exam-generator-allocation" element={<ConductExamGeneratorAllocationPage />} />
        <Route path="/conduct-exam-score-rule" element={<ConductExamScoreRulePage />} />
        <Route path="/conduct-exam-on-screen-marking" element={<ConductExamOnScreenMarkingPage />} />
        <Route path="/conduct-exam-examiner-payment" element={<ConductExamExaminerPaymentPage />} />
        <Route path="/conduct-exam-moderator-payment" element={<ConductExamModeratorPaymentPage />} />
        <Route path="/conduct-exam-papersetter-payment" element={<ConductExamPaperSetterPaymentPage />} />
        <Route path="/verify-question-paper-blockchain" element={<PublicQuestionPaperBlockchainVerifyPage />} />
         <Route path="/student/profile" element={<StudentProfileds1 />} />

        <Route path="/dashmattstud" element={<Dashmattstud />} />

        <Route path="/addrubric1bulkedit" element={<Addrubric1bulkedit />} />
        <Route path="/addrubric1bulk" element={<Addrubric1bulk />} />

        <Route path="/setuppageds1" element={<SetupPageds1 />} />
        <Route path="/leavespageds1" element={<LeavesPageds1 />} />

         <Route path="/attendance-navigation" element={<AttendanceNavigation />} />
        <Route path="/attendance-dashboard" element={<AttendanceDashboard />} />
        <Route path="/attendance-records" element={<AttendanceRecords />} />
        <Route path="/salary-management" element={<SalaryManagement />} />
        <Route path="/salary-slips" element={<SalarySlips />} />
        <Route path="/ip-management" element={<IPManagement />} />
        <Route path="/attendance-settings" element={<AttendanceSettings />} />
        <Route path="/admin-attendance" element={<AdminAttendanceView />} />

        <Route path="/dashmmtradinggenerate" element={<Dashmmtradinggenerate />} />

        <Route path="/dashmmtradingaccount" element={<Dashmmtradingaccount />} />
        <Route path="/dashmmtradingaccountadmin" element={<Dashmmtradingaccountadmin />} />
        <Route path="/dashmmplaccount" element={<Dashmmplaccount />} />
        <Route path="/dashmmplaccountadmin" element={<Dashmmplaccountadmin />} />
        <Route path="/dashmmbalancesheet" element={<Dashmmbalancesheet />} />
        <Route path="/dashmmbalancesheetadmin" element={<Dashmmbalancesheetadmin />} />


        <Route path="/dashmmjournal2" element={<Dashmmjournal2 />} />
        <Route path="/dashmmjournal2admin" element={<Dashmmjournal2admin />} />
        <Route path="/dashmmtrialbalance2" element={<Dashmmtrialbalance2 />} />
        <Route path="/dashmmtrialbalance2admin" element={<Dashmmtrialbalance2admin />} />

        <Route path="/accountgroup" element={<AccountGroupPage />} />
        <Route path="/accountds" element={<AccountdsPage />} />
        <Route path="/mjournal2" element={<Mjournal2Page />} />
        <Route path="/finance-journal-new" element={<JournalEntryNewPage />} />
        <Route path="/finance-account-groups" element={<FinanceAccountGroupNewPage />} />
        <Route path="/finance-accounts" element={<FinanceAccountNewPage />} />
        <Route path="/fees-cheque-reconciliation" element={<FeesChequeReconciliationPage />} />
        <Route path="/payment-voucher-new" element={<PaymentVoucherPage />} />
        <Route path="/bulkuploadpageds" element={<BulkUploadPage />} />
        <Route path="/mjournal2reportpage" element={<Mjournal2ReportPage />} />
        <Route path="/trialbalancepage" element={<TrialBalancePage />} />
        <Route path="/balancesheetpage" element={<BalanceSheetPage />} />


        {/* <Route path="/accountgroup" element={<AccountGroupPage />} />
        <Route path="/accountds" element={<AccountdsPage />} /> */}
        <Route path="/mjournal1" element={<Mjournal1Page />} />
        {/* <Route path="/bulk-upload" element={<BulkUploadPage />} /> */}
        <Route path="/reports" element={<Mjournal1ReportPage />} />

        <Route path="/dashmmjournal1" element={<Dashmmjournal1 />} />
        <Route path="/dashmmjournal1admin" element={<Dashmmjournal1admin />} />
        <Route path="/dashmmtrialbalance1" element={<Dashmmtrialbalance1 />} />
        <Route path="/dashmmtrialbalance1admin" element={<Dashmmtrialbalance1admin />} />


        <Route path="/generateinstitutecode" element={<GenerateInstituteCode />} />
        <Route path="/dashchattest" element={<Dashchattest />} />

        <Route path="/paymentreceipt" element={<PaymentReceipt />} />
        <Route path="/dashmfeespay" element={<Dashmfeespay />} />
        

        <Route path="/dashmmfeescolbydate" element={<Dashmmfeescolbydate />} />
        <Route path="/dashfeescolaggr" element={<Dashfeescolaggr />} />
        

        <Route path="/dashmmacadcal" element={<Dashmmacadcal />} />
        <Route path="/dashmmacadcaladmin" element={<Dashmmacadcaladmin />} />
        <Route path="/dashmmfeescol" element={<Dashmmfeescol />} />
        <Route path="/dashmmfeescoladmin" element={<Dashmmfeescoladmin />} />


         <Route path="/dashboardj" element={<Dashboardj />} /> 
        <Route path="/allattendancej" element={<AttendanceCalendarj />} />
        <Route path="/attendancebyemailj" element={<AttendanceByEmailj />} />
        <Route path="/attendancej" element={<AttendancePagej />} />
        <Route path="/ipaddressj" element={<IpManagementPagej />} />
        <Route path="/salaryj" element={<SalaryPagej />} />
        <Route path="/salarybysearchj" element={<SalarySearchj />} />
        
        <Route path="/salaryslipj" element={<SalarySlipj />} />
        <Route path="/deductionj" element={<Deductionj/>} />

        <Route path="/attendance/*" element={<AttendanceApp />} />
        <Route path="/classesn" element={<ClassManagementn />} />


        <Route path="/facultytopicpage1ds/:categoryName" element={<FacultyTopicPage1ds />} />
        <Route path="/studenttopicpage1ds" element={<StudentTopicPage1ds />} />
        <Route path="/discussionpostspage1ds/:topicId" element={<DiscussionPostsPage1ds />} />

         {/* <Route path="/dashboardj" element={<Dashboardj />} /> 
        <Route path="/allattendancej" element={<AttendanceCalendar />} />
        <Route path="/attendancebyemailj" element={<AttendanceByEmail />} />
        <Route path="/attendancej" element={<AttendancePage />} />
        <Route path="/ipaddressj" element={<IpManagementPage />} />
        <Route path="/salaryj" element={<SalaryPage />} />
        <Route path="/salarybysearchj" element={<SalarySearch />} />
        <Route path="/salaryslipj" element={<SalarySlip />} />
        <Route path="/deductionj" element={<Deduction/>} /> */}

        <Route path="/topiccategorypage1ds" element={<TopicCategoryPage1ds />} />

         <Route path="/facultytopicpageds" element={<FacultyTopicPageds />} />
         <Route path="/studenttopicpageds" element={<StudentTopicPageds />} />
         <Route path="/discussionpostspageds/:topicId" element={<DiscussionPostsPageds />} />

        <Route path="/dashdashfacnew" element={<Dashdashfacnew />} />
         <Route path="/facultydashboardds" element={<FacultyDashboardds />} />

        <Route path="/classes1" element={<ClassManagement1 />} />
        <Route path="/breakout-rooms" element={<BreakoutRoomManagement />} />
        <Route path="/student-breakout-room/:roomid" element={<StudentBreakoutRoom />} />
        <Route path="/studentclassview" element={<StudentClassView />} />

        <Route path="/dashmmcoatt" element={<Dashmmcoatt />} />

        <Route path="/rubricexampage1" element={<RubricExamPage1 />} />
        <Route path="/detailedview1/:id" element={<DetailedView1 />} />
        <Route path="/finalizedata1" element={<FinalizeData1 />} />

         <Route path="/feedbackinternalmanagement1" element={<FeedbackInternalManagement1 />} />
        <Route path="/createfeedbackinternal1" element={<CreateFeedbackInternal1 />} />
        {/* ✅ Same component handles editing when feedbackId is provided */}
        <Route path="/editfeedbackinternal1/:feedbackId" element={<CreateFeedbackInternal1 />} />
        <Route path="/feedbackinternalresponse1/:feedbackId" element={<FeedbackInternalResponse1 />} />
        <Route path="/feedbackinternalresponses1/:feedbackId" element={<FeedbackInternalResponses1 />} />
        <Route path="/feedbackinternalanalytics1/:feedbackId" element={<FeedbackInternalAnalytics1 />} />

         <Route path="/feedbackinternalmanagement" element={<FeedbackInternalManagement />} />
        <Route path="/createfeedbackinternal" element={<CreateFeedbackInternal />} />
        {/* ✅ Same component handles editing when feedbackId is provided */}
        <Route path="/editfeedbackinternal/:feedbackId" element={<CreateFeedbackInternal />} />
        <Route path="/feedbackinternalresponse/:feedbackId" element={<FeedbackInternalResponse />} />
        <Route path="/feedbackinternalresponses/:feedbackId" element={<FeedbackInternalResponses />} />
        <Route path="/feedbackinternalanalytics/:feedbackId" element={<FeedbackInternalAnalytics />} />

        <Route path="/feedbackmanagement" element={<FeedbackManagement />} />
        <Route path="/createfeedback" element={<CreateFeedback />} />
        <Route path="/createfeedback/edit/:feedbackId" element={<CreateFeedback />} />
        <Route path="/feedbackfillresponse/:feedbackId" element={<FeedbackFillResponse />} />
        <Route path="/feedbackresponses/:feedbackId" element={<FeedbackResponses />} />
        <Route path="/feedbackanalytic/:feedbackId" element={<FeedbackAnalytics />} />
        <Route path="/feedback-advanced" element={<FeedbackAdvancedPage />} />
        <Route path="/feedback-advanced-public" element={<FeedbackAdvancedPublicPage />} />

        <Route path="/dashmserb" element={<Dashmserb />} />

        <Route path="/dashmserbplan" element={<Dashmserbplan />} />
        <Route path="/dashmserbplanadmin" element={<Dashmserbplanadmin />} />


        <Route path="/dashmlessonplannew" element={<Dashmlessonplannew />} />
        <Route path="/dashmlessonplannewadmin" element={<Dashmlessonplannewadmin />} />


        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/enrollment" element={<EnrollmentManagement />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        {/* <Route path="/attendance/*" element={<AttendanceApp />} />
        <Route path="/classesn" element={<ClassManagementn />} /> */}

        <Route path="/dashmroles" element={<Dashmroles />} />

        <Route path="/dashstudprofileall" element={<Dashstudprofileall />} />
        <Route path="/studentprofile1" element={<StudentProfile1 />} />
        <Route path="/studentprofile" element={<StudentProfile />} />

        <Route path="/mainrubric" element={<RubricExamPage />} />
        <Route path="/detail/:id" element={<DetailedView />} />
        <Route path="/finalize" element={<FinalizeData />} />

         <Route path='/route' element={<RoutePage />} />
         <Route path='/busesbyroute/:routeId' element={<BusPage />} />
         <Route path='/bus-detail/:busId' element={<BusDetailPage />} />

        
        <Route path="/allcvpage" element={<AllCVPage />} />

         <Route path="/internal/jobmanager" element={<JobManagerInternalPage />} />
        <Route path="/internal/jobapplication/:colid" element={<JobApplicationInternalPage />} />
        <Route path="/internal/jobapplicationstatus/:jobid" element={<InternalApplicationStatusPage />} />
        <Route path="/internal/applicationdetail/:id" element={<JobApplicationInternalDetailsPage />} />

        <Route path="/dashmplaced" element={<Dashmplaced />} />

        <Route path="/dashpappplaced" element={<Dashpappplaced />} />
        <Route path="/dashpsectorreport" element={<Dashpsectorreport />} />

        <Route path="/dashmjobds" element={<Dashmjobds />} />
        <Route path="/dashmjobdsadmin" element={<Dashmjobdsadmin />} />
        <Route path="/dashmjobapplicationds" element={<Dashmjobapplicationds />} />
        <Route path="/dashmjobapplicationdsadmin" element={<Dashmjobapplicationdsadmin />} />


        <Route path="/dashmcompany" element={<Dashmcompany />} />
        <Route path="/logincompany" element={<Signinpagecompany />} />

         <Route path="/jobmanager" element={<JobManagerPage />} />
        <Route path="/jobs-apply" element={<JobApplicationPage />} />
        <Route  path="/applications-status/:jobid"  element={<ApplicationStatusPage />} />
        <Route path="/studentcv" element={<StudentCVPage />} />
        <Route path="/application-detail/:id"  element={<JobApplicationDetailsPage />}/>

         <Route path='/dasheventlistpage' element={<Dasheventlistpage />} />
         <Route path='/dashapprovespeakers' element={<Dashapprovespeakers />} />

         <Route path='/eventslist' element={<EventsListPage />} />
         <Route path="/event/:id/register" element={<EventRegisterPage />} />
         <Route path="/event/:id/:colid" element={<EventDetailPage />} />
         <Route path="/event/:id/approvespeakers" element={<ApproveSpeakersPage />} />
         <Route path="/eventregistrationcolid/:id/:colid" element ={<EventRegisterPage1 />} />
         <Route path='/eventlistwithcolid/:colid' element={<EventsListPage1 />} />

         <Route path="/forms" element={<FormPage />} />
        <Route path="/responses/:formId" element={<ResponsePage />} />
        <Route path="/fill/:formId" element={<FillForm />} />

        <Route path="/taskcreatorpage" element = {<TaskCreatorPage />} />
         <Route path='/assigneetaskpage' element={<TaskAssignToMePage />} />
         <Route path='/approvertaskpage' element = {<ApproverTasksPage />} />

         <Route path='/dashleavesetup' element ={<Dashleavesetup />} />
         <Route path='/navigatetopage' element ={<NavigatetoPages />} />
         <Route path='/setuppage' element = {<SetupPage />} />
         <Route path='/leavespage' element = {<LeavesPage />} />


        <Route path='/dashalerts' element = {<Dashalerts />} />

        <Route path='/report2' element = {<Report2 />} />
        <Route path = "/eventreport" element = {<EventReport />} />

        <Route path="/studadmission" element={<Studadmission />} />
        <Route path="/dashboard-widgets" element={<DashboardWidgetCatalogPage />} />
        <Route path="/dashboard-widget-builder" element={<DashboardWidgetBuilderPage />} />
        <Route path="/dashboard-widget-view" element={<DashboardWidgetViewPage />} />
        <Route path="/estate-types" element={<EstateTypesPage />} />
        <Route path="/estate-campus" element={<EstateCampusPage />} />
        <Route path="/estate-real-estates" element={<EstateRealEstatesPage />} />
        <Route path="/estate-service-types" element={<EstateServiceTypesPage />} />
        <Route path="/estate-maintenance-schedule" element={<EstateMaintenanceSchedulePage />} />
        <Route path="/estate-service-providers" element={<EstateServiceProvidersPage />} />
        <Route path="/estate-vendor-contracts" element={<EstateVendorContractsPage />} />
        <Route path="/estate-service-allocation" element={<EstateServiceAllocationPage />} />
        <Route path="/estate-service-shift" element={<EstateServiceShiftPage />} />
        <Route path="/estate-daily-roster" element={<EstateDailyRosterPage />} />
        <Route path="/estate-daily-roster-report" element={<EstateDailyRosterReportPage />} />
        <Route path="/estate-meeting-room-features" element={<EstateMeetingRoomFeaturesPage />} />
        <Route path="/estate-meeting-rooms" element={<EstateMeetingRoomsPage />} />
        <Route path="/estate-meeting-room-planner" element={<EstateMeetingRoomPlannerPage />} />
        <Route path="/management-dashboard" element={<ManagementDashboardPage />} />
        <Route path="/student-demographic-dashboard" element={<StudentDemographicDashboardPage />} />
        <Route path="/lms-director-dashboard" element={<LmsDirectorDashboardPage />} />
        <Route path="/hod-dashboard" element={<HodDashboardPage />} />
        <Route path="/fees-dashboard" element={<FeesDashboardPage />} />
        <Route path="/studbonafide" element={<Studbonafide />} />
        <Route path="/studmarksheet" element={<Studmarksheet />} />
        <Route path="/dashmarksheet" element={<Dashmarksheet />} />

        <Route path="/dashmexammarksall" element={<Dashmexammarksall />} />
        <Route path="/dashmexammarksalladmin" element={<Dashmexammarksalladmin />} />


        <Route path='/dashworkloadn1faculty' element={<Dashworkloadn1faculty />} />

        <Route path='/dashinterncomplete' element={<Dashinterncomplete />} />
        <Route path='/taskmanager' element={<TaskManagerPage />} />

        <Route path='/dashnirfplacement' element={<Dashnirfplacement />} />

        <Route path='/applicationreviewpage' element={<ApplicationReviewPage />} />
        <Route path='/application/:id' element={<DetailedApplicationPage />} />

        <Route path='/hostelbuldingmanager' element = {< HostelBuildingPage />} />
        <Route path='/rooms/:buildingname' element = {<HostelRoomPage />} />

        <Route path='/studadmitcard' element={<Studadmitcard />} />
        <Route path='/dashadmitdownload' element={<Dashadmitdownload />} />
        <Route path='/dashlibraryform' element={<Dashlibraryform />} />

         {/* <Route path='/login' element = {<LoginPage />}/> */}
        <Route path='/createlibraryform' element={<CreateLibraryForm />} />
        <Route path='/admin/libraries' element ={<AdminLibrariesPage />} />
        <Route path="/library/:id" element={<LibraryBooksPage />} />
        <Route path="/library/:id/issuedbooks" element={<IssuedBooksPage />} />
        <Route path="/library/:id/report" element={<LibraryReportPage />} />

        <Route path="/dashmuser" element={<DashmUser />} />
        <Route path="/dashmuseradmin" element={<DashmUseradmin />} />


        <Route path="/dashmexamadmitstud" element={<Dashmexamadmitstud />} />
        <Route path="/dashmledgerstudstud" element={<Dashmledgerstudstud />} />


        <Route path="/dashmexamadmit" element={<Dashmexamadmit />} />
        <Route path="/dashmexamadmitadmin" element={<Dashmexamadmitadmin />} />
        <Route path="/dashmfees" element={<Dashmfees />} />
        <Route path="/dashmfeesadmin" element={<Dashmfeesadmin />} />
        <Route path="/dashmledgerstud" element={<Dashmledgerstud />} />
        <Route path="/dashmledgerstudadmin" element={<Dashmledgerstudadmin />} />


        <Route path='/dashapplyadmitstud' element={<Dashapplyadmitstud />} />
        <Route path='/examapplicationform' element={<ExamApplication />} />
        <Route path='/approvesubjects' element={<AdminDashboard />} />
        <Route path='/admitcardtemplate' element={<AdmitCardTemplate />} />
        <Route path='/releaseadmitcard' element={<ReleaseAdmitCard />} />
        <Route path='/downloadadmitcard' element={<DownloadAdmitCard />} />

        <Route path='/createcertificates' element={<CertificateGenerator />} />

        <Route path='/idcardmanager' element={<IDCardManager />} />
        <Route path='/id-card-templates' element={<IdCardTemplatePage />} />
        <Route path='/id-card-generate' element={<IdCardGeneratePage />} />
        <Route path="/dashmask1" element={<Dashmask1 />} />

        <Route path="/dashmappmodel2cat" element={<Dashmappmodel2cat />} />
        <Route path="/dashmappmodel2" element={<Dashmappmodel2 />} />
        <Route path="/dashmadmission" element={<Dashmadmission />} />

         <Route path="/admissionform1/:colId" element={<AdmissionTemplate1 />} />
        <Route path="/admissionform2/:colId" element={<AdmissionTemplate2 />} />
        <Route path="/admissionform3/:colId" element={<AdmissionTemplate3 />} />
        <Route path="/admissionform4/:colId" element={<AdmissionTemplate4 />} />
        <Route path="/success" element={<Success />} />

        <Route path="/dashmfacwcal" element={<Dashmfacwcal />} />
        <Route path="/dashmfacwcaladmin" element={<Dashmfacwcaladmin />} />


        <Route path="/dashmtimeslotsn" element={<Dashmtimeslotsn />} />
        <Route path="/dashmtimeslotsnadmin" element={<Dashmtimeslotsnadmin />} />
        <Route path="/dashmworkloadn" element={<Dashmworkloadn />} />
        <Route path="/dashmworkloadnadmin" element={<Dashmworkloadnadmin />} />

        <Route path="/dashmtimeslotsn1" element={<Dashmtimeslotsn1 />} />
        <Route path="/dashmtimeslotsn1admin" element={<Dashmtimeslotsn1admin />} />
        <Route path="/dashmworkloadn1" element={<Dashmworkloadn1 />} />
        <Route path="/dashmworkloadn1admin" element={<Dashmworkloadn1admin />} />



        <Route path="/dashmmstudentprofile" element={<Dashmmstudentprofile />} />
        <Route path="/dashmnallaccrgroup" element={<Dashmnallaccrgroup />} />

        <Route path="/dashmngroup" element={<Dashmngroup />} />
        <Route path="/dashmngroupadmin" element={<Dashmngroupadmin />} />
        <Route path="/dashmngrouppages" element={<Dashmngrouppages />} />
        <Route path="/dashmngrouppagesadmin" element={<Dashmngrouppagesadmin />} />
        <Route path="/dashmngroupaccr" element={<Dashmngroupaccr />} />
        <Route path="/dashmngroupaccradmin" element={<Dashmngroupaccradmin />} />


        <Route path="/dashmattyear" element={<Dashmattyear />} />
        <Route path="/dashmattyearadmin" element={<Dashmattyearadmin />} />


        <Route path="/dashmmfaccoursesatto" element={<Dashmmfaccoursesatto />} />
        <Route path="/dashmnn76" element={<Dashmnn76 />} />
        <Route path="/dashmnn76admin" element={<Dashmnn76admin />} />
        <Route path="/dashmnn781" element={<Dashmnn781 />} />
        <Route path="/dashmnn781admin" element={<Dashmnn781admin />} />
        <Route path="/dashmnn82" element={<Dashmnn82 />} />
        <Route path="/dashmnn82admin" element={<Dashmnn82admin />} />
        <Route path="/dashmnn83" element={<Dashmnn83 />} />
        <Route path="/dashmnn83admin" element={<Dashmnn83admin />} />
        <Route path="/dashmnn84" element={<Dashmnn84 />} />
        <Route path="/dashmnn84admin" element={<Dashmnn84admin />} />
        <Route path="/dashmnn86" element={<Dashmnn86 />} />
        <Route path="/dashmnn86admin" element={<Dashmnn86admin />} />
        <Route path="/dashmnn87" element={<Dashmnn87 />} />
        <Route path="/dashmnn87admin" element={<Dashmnn87admin />} />
        <Route path="/dashmnn96" element={<Dashmnn96 />} />
        <Route path="/dashmnn96admin" element={<Dashmnn96admin />} />
        <Route path="/dashmnn97" element={<Dashmnn97 />} />
        <Route path="/dashmnn97admin" element={<Dashmnn97admin />} />
        <Route path="/dashmnn98" element={<Dashmnn98 />} />
        <Route path="/dashmnn98admin" element={<Dashmnn98admin />} />


        <Route path="/dashmnn61" element={<Dashmnn61 />} />
        <Route path="/dashmnn61admin" element={<Dashmnn61admin />} />
        <Route path="/dashmnn62" element={<Dashmnn62 />} />
        <Route path="/dashmnn62admin" element={<Dashmnn62admin />} />
        <Route path="/dashmnn6clubs" element={<Dashmnn6clubs />} />
        <Route path="/dashmnn6clubsadmin" element={<Dashmnn6clubsadmin />} />


        <Route path="/dashmnallaccrans" element={<Dashmnallaccrans />} />
        <Route path="/dashmnallaccransadmin" element={<Dashmnallaccransadmin />} />


        <Route path="/electricalmachinelab" element={<ElectricalMachineLab />} />

        <Route path="/dashmqualall" element={<Dashmqualall />} />

        <Route path="/dashmnn51" element={<Dashmnn51 />} />
        <Route path="/dashmnn51admin" element={<Dashmnn51admin />} />
        <Route path="/dashmnn52" element={<Dashmnn52 />} />
        <Route path="/dashmnn52admin" element={<Dashmnn52admin />} />
        <Route path="/dashmnn53passp" element={<Dashmnn53passp />} />
        <Route path="/dashmnn53passpadmin" element={<Dashmnn53passpadmin />} />
        <Route path="/dashmnn53obe" element={<Dashmnn53obe />} />
        <Route path="/dashmnn53obeadmin" element={<Dashmnn53obeadmin />} />
        <Route path="/dashmnn54" element={<Dashmnn54 />} />
        <Route path="/dashmnn54admin" element={<Dashmnn54admin />} />
        <Route path="/dashmnn53examdays" element={<Dashmnn53examdays />} />
        <Route path="/dashmnn53examdaysadmin" element={<Dashmnn53examdaysadmin />} />
        <Route path="/dashmnn55" element={<Dashmnn55 />} />
        <Route path="/dashmnn55admin" element={<Dashmnn55admin />} />
        <Route path="/dashmnn56" element={<Dashmnn56 />} />
        <Route path="/dashmnn56admin" element={<Dashmnn56admin />} />

        <Route path="/dashmnallaccr" element={<Dashmnallaccr />} />
        <Route path="/dashmnallaccradmin" element={<Dashmnallaccradmin />} />



        <Route path="/dashmnn33a" element={<Dashmnn33a />} />
        <Route path="/dashmnn33aadmin" element={<Dashmnn33aadmin />} />
        <Route path="/dashmnn33b" element={<Dashmnn33b />} />
        <Route path="/dashmnn33badmin" element={<Dashmnn33badmin />} />
        <Route path="/dashmnn36" element={<Dashmnn36 />} />
        <Route path="/dashmnn36admin" element={<Dashmnn36admin />} />
        <Route path="/dashmnn46" element={<Dashmnn46 />} />
        <Route path="/dashmnn46admin" element={<Dashmnn46admin />} />
        <Route path="/dashmnn35" element={<Dashmnn35 />} />
        <Route path="/dashmnn35admin" element={<Dashmnn35admin />} />


        <Route path="/dashmnn211a" element={<Dashmnn211a />} />
        <Route path="/dashmnn211aadmin" element={<Dashmnn211aadmin />} />
        <Route path="/dashmnn211b" element={<Dashmnn211b />} />
        <Route path="/dashmnn211badmin" element={<Dashmnn211badmin />} />
        <Route path="/dashmnn22" element={<Dashmnn22 />} />
        <Route path="/dashmnn22admin" element={<Dashmnn22admin />} />
        <Route path="/dashmnn23" element={<Dashmnn23 />} />
        <Route path="/dashmnn23admin" element={<Dashmnn23admin />} />
        <Route path="/dashmnn244" element={<Dashmnn244 />} />
        <Route path="/dashmnn244admin" element={<Dashmnn244admin />} />
        <Route path="/dashmnn26" element={<Dashmnn26 />} />
        <Route path="/dashmnn26admin" element={<Dashmnn26admin />} />
        <Route path="/dashmnn25" element={<Dashmnn25 />} />
        <Route path="/dashmnn25admin" element={<Dashmnn25admin />} />
        <Route path="/dashmnn31" element={<Dashmnn31 />} />
        <Route path="/dashmnn31admin" element={<Dashmnn31admin />} />
        <Route path="/dashmnn32" element={<Dashmnn32 />} />
        <Route path="/dashmnn32admin" element={<Dashmnn32admin />} />


        <Route path="/dashmnn11" element={<Dashmnn11 />} />
        <Route path="/dashmnn11admin" element={<Dashmnn11admin />} />
        <Route path="/dashmnn12" element={<Dashmnn12 />} />
        <Route path="/dashmnn12admin" element={<Dashmnn12admin />} />
        <Route path="/dashmnn14" element={<Dashmnn14 />} />
        <Route path="/dashmnn14admin" element={<Dashmnn14admin />} />
        <Route path="/dashmnn15" element={<Dashmnn15 />} />
        <Route path="/dashmnn15admin" element={<Dashmnn15admin />} />
        <Route path="/dashmnn17" element={<Dashmnn17 />} />
        <Route path="/dashmnn17admin" element={<Dashmnn17admin />} />
        <Route path="/dashmnn16" element={<Dashmnn16 />} />
        <Route path="/dashmnn16admin" element={<Dashmnn16admin />} />


        <Route path="/Dashtest1" element={<Dashtest1 />} />
        <Route path="/GreenAudit" element={<GreenAudit />} />
        <Route path="/AcademicAuditInfo" element={<AAaudit />} />
        <Route path="/SeedTest1" element={<SeedTest1 />} />
        <Route path="/Courseall" element={<Courseall />} />
        <Route path="/Internselect" element={<Internselect />} />
        <Route path="/Internall" element={<Internall />} />
        <Route path="/SignupAdmin" element={<SignupAdmin />} />
        <Route path="/campuspricing" element={<CampusPricing />} />
        <Route path="/viewmpricing" element={<Viewmpricing />} />
        <Route path="/dashmbtrialb" element={<Dashmbtrialb />} />
        <Route path="/dashmbtrialbadmin" element={<Dashmbtrialbadmin />} />
        <Route path="/dashmbfacyear" element={<Dashmbfacyear />} />
        <Route path="/dashmbfacyearadmin" element={<Dashmbfacyearadmin />} />
        <Route path="/dashmstudlist" element={<Dashmstudlist />} />
        <Route path="/dashmstudlistadmin" element={<Dashmstudlistadmin />} />


        <Route path="/dashmbmou" element={<Dashmbmou />} />
        <Route path="/dashmbmouadmin" element={<Dashmbmouadmin />} />

        
        <Route path="/viewminterns" element={<Viewminterns />} />
        <Route path="/viewmusers" element={<Viewmusers />} />
        <Route path="/viewmallclients" element={<Viewmallclients />} />
        <Route path="/dashmmiscorenew" element={<Dashmmiscorenew />} />
        <Route path="/dashmminewm" element={<Dashmminewm />} />
        <Route path="/dashmminewmadmin" element={<Dashmminewmadmin />} />
        <Route path="/dashmmisessions" element={<Dashmmisessions />} />
        <Route path="/dashmmisessionsadmin" element={<Dashmmisessionsadmin />} />
        <Route path="/dashmmiseenrol1" element={<Dashmmiseenrol1 />} />
        <Route path="/dashmmiseenrol1admin" element={<Dashmmiseenrol1admin />} />
        <Route path="/dashmmisections1" element={<Dashmmisections1 />} />
        <Route path="/dashmmisections1admin" element={<Dashmmisections1admin />} />
        <Route path="/dashmmiqnew" element={<Dashmmiqnew />} />
        <Route path="/dashmmiqnewadmin" element={<Dashmmiqnewadmin />} />



        <Route path="/viewmindmap" element={<Viewmindmap2 />} />
        <Route path="/dashmmindmaplist" element={<Dashmmindmaplist />} />
        <Route path="/dashmmindmaplistadmin" element={<Dashmmindmaplistadmin />} />
        <Route path="/dashmmindmapedges" element={<Dashmmindmapedges />} />
        <Route path="/dashmmindmapedgesadmin" element={<Dashmmindmapedgesadmin />} />
        <Route path="/dashmmindmapnodes" element={<Dashmmindmapnodes />} />
        <Route path="/dashmmindmapnodesadmin" element={<Dashmmindmapnodesadmin />} />


        <Route path="/dashmreactflow1" element={<Dashmreactflow1 />} />
        <Route path="/viewmreactflow1" element={<Viewmreactflow1 />} />
        <Route path="/deleteaccount" element={<Deleteaccount />} />
        <Route path="/dashmtestscoresnewall" element={<Dashmtestscoresnewall />} />
        
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/signinpay" element={<Signinpay />} />

        <Route path="/campustalentregister1" element={<CampusTalentRegister1 />} />

        <Route path="/dashmonlinepay" element={<Dashmonlinepay />} />
        <Route path="/dashmonlinepayadmin" element={<Dashmonlinepayadmin />} />


        <Route path="/campustalentregister" element={<CampusTalentRegister />} />

        <Route path="/dashmmctalentreg" element={<Dashmmctalentreg />} />
        <Route path="/dashmmctalentregadmin" element={<Dashmmctalentregadmin />} />
        <Route path="/dashmmtestqnewcs" element={<Dashmmtestqnewcs />} />
        <Route path="/dashmmtestqnewcsadmin" element={<Dashmmtestqnewcsadmin />} />
        <Route path="/dashmmguides" element={<Dashmmguides />} />
        <Route path="/dashmmguidesadmin" element={<Dashmmguidesadmin />} />


        <Route path="/dashmtestscorenew" element={<Dashmtestscorenew />} />
        <Route path="/campustalent" element={<CampusTalent1 />} />
        <Route path="/dashmmtestsections1" element={<Dashmmtestsections1 />} />
        <Route path="/dashmmtestsections1admin" element={<Dashmmtestsections1admin />} />
        <Route path="/dashmmtestseenrol1" element={<Dashmmtestseenrol1 />} />
        <Route path="/dashmmtestseenrol1admin" element={<Dashmmtestseenrol1admin />} />



        <Route path="/dashmmtestnewm" element={<Dashmmtestnewm />} />
        <Route path="/dashmmtestnewmadmin" element={<Dashmmtestnewmadmin />} />
        <Route path="/dashmmtestsessions" element={<Dashmmtestsessions />} />
        <Route path="/dashmmtestsessionsadmin" element={<Dashmmtestsessionsadmin />} />
        <Route path="/dashmmtestseenrol" element={<Dashmmtestseenrol />} />
        <Route path="/dashmmtestseenroladmin" element={<Dashmmtestseenroladmin />} />
        <Route path="/dashmmtestqnew" element={<Dashmmtestqnew />} />
        <Route path="/dashmmtestqnewadmin" element={<Dashmmtestqnewadmin />} />
        <Route path="/dashmmtestsections" element={<Dashmmtestsections />} />
        <Route path="/dashmmtestsectionsadmin" element={<Dashmmtestsectionsadmin />} />


        {/* <Route path="/mazegen" element={<MazeGen />} /> */}
        <Route path="/ultimatebattlegame" element={<UltimateBattleGame />} />
        <Route path="/sudokugame" element={<SudokuGame />} />
        <Route path="/towerofhanoi" element={<TowerOfHanoi />} />
        {/* <Route path="/dicegame" element={<DiceGame />} /> */}
        <Route path="/tetrisgame" element={<TetrisGame />} />
        <Route path="/finddiff" element={<FindDiff />} />
        <Route path="/racegame" element={<RaceGame />} />
        <Route path="/wordguessing" element={<WordGuessing />} />
        <Route path="/imgpuzzle" element={<ImgPuzzle />} />
        <Route path="/pacmangame" element={<PacManGame />} />
        <Route path="/betteraimgame" element={<BetterAimGame2 />} />

        <Route path="/dashmstudquota" element={<Dashmstudquota />} />
        <Route path="/dashmstudcategory" element={<Dashmstudcategory />} />
        <Route path="/dashmstudgender" element={<Dashmstudgender />} />
        <Route path="/notgategame" element={<NOTGateGame />} />
        {/* <Route path="/opticalfibregame" element={<OpticalFibreGame />} /> */}
        <Route path="/orgategame" element={<ORGateGame />} />
        {/* <Route path="/resistorgame" element={<ResistorGame />} /> */}
        <Route path="/skeletonexpgame" element={<SkeletonExpGame />} />
        {/* <Route path="/skeletonexppart2game" element={<SkeletonExpPart2Game />} /> */}
        <Route path="/stefanslawgame" element={<StefansLawGame />} />
        <Route path="/subhalfadder1game" element={<SubHalfAdder1Game />} />
        <Route path="/xnorgategame" element={<XNORGateGame />} />
        <Route path="/xorgategame" element={<XORGateGame />} />

        <Route path="/norgategame" element={<NORGateGame />} />
        <Route path="/nandgategame" element={<NANDGateGame />} />
        <Route path="/andgategame" element={<ANDGateGame />} />
        <Route path="/bitserialgame" element={<BitSerialGame />} />
        <Route path="/fingerprintpatterngames" element={<FingerPrintPatternsGame />} />


        <Route path="/bcdtoexcessgames" element={<BCDToExcessConverterGame />} />
        <Route path="/halfsubcircuitverifygame" element={<HalfSubCircuitVerifyGame />} />
        {/* <Route path="/binarytograygames" element={<BinaryToGrayConverterGame />} />
        <Route path="/dcshuntgames" element={<DCShuntMotorSimulationGame />} /> */}
        <Route path="/fullsubcircuitverifygame" element={<FullSubCircuitVerifyGame />} />
        <Route path="/fullsubtractorcircuitgame" element={<FullSubtractorCircuitGame />} />
        <Route path="/graytobinaryconvertedgame" element={<GrayToBinaryConverterGame />} />
        <Route path="/halfsubtractorcircuitgame" element={<HalfSubtractorCircuitGame />} />


        <Route path="/dashmmassets" element={<Dashmmassets />} />
        <Route path="/dashmmassetsadmin" element={<Dashmmassetsadmin />} />
        <Route path="/dashmmassetassign" element={<Dashmmassetassign />} />
        <Route path="/dashmmassetassignadmin" element={<Dashmmassetassignadmin />} />
        <Route path="/dashmmvendors" element={<Dashmmvendors />} />
        <Route path="/dashmmvendorsadmin" element={<Dashmmvendorsadmin />} />
        <Route path="/dashmmvendorbanks" element={<Dashmmvendorbanks />} />
        <Route path="/dashmmvendorbanksadmin" element={<Dashmmvendorbanksadmin />} />
        <Route path="/dashmmpurchase" element={<Dashmmpurchase />} />
        <Route path="/dashmmpurchaseadmin" element={<Dashmmpurchaseadmin />} />
        <Route path="/dashmmpurchaseitems" element={<Dashmmpurchaseitems />} />
        <Route path="/dashmmpurchaseitemsadmin" element={<Dashmmpurchaseitemsadmin />} />
        <Route path="/dashmmpopayments" element={<Dashmmpopayments />} />
        <Route path="/dashmmpopaymentsadmin" element={<Dashmmpopaymentsadmin />} />


        <Route path="/dashmmplacement" element={<Dashmmplacement />} />
        <Route path="/dashmmplacementadmin" element={<Dashmmplacementadmin />} />

        <Route path="/transformeroilgame" element={<TransformerOilStrengthGame />} />
        <Route path="/titrationgame" element={<TitrationGame />} />
        <Route path="/infraredgame" element={<InfraRedSpectrosGame />} />

        <Route path="/skeletonpart2game" element={<SkeletonExpPart2Game />} />
        <Route path="/getmoldgame" element={<GetMoldGame />} />
        <Route path="/opticalfibregame" element={<OpticalFibreGame />} />
        <Route path="/digitaltriradiigame" element={<DigitalTriradiiGame />} />


        <Route path="/infraredspectros" element={<InfraRedSpectros />} />
        <Route path="/skeletonpart2" element={<SkeletonExpPart2 />} />
        <Route path="/titration" element={<Titration />} />
        <Route path="/skeletonexp" element={<SkeletonExp />} />
        <Route path="/dcshuntmotor" element={<DCShuntMotorSimulation />} />
        <Route path="/fingerprintpatterns" element={<FingerPrintPatterns />} />
        <Route path="/digitaltriradii" element={<DigitalTriradii />} />
        <Route path="/dashmlpubeditionspublic" element={<Dashmlpubeditionspublic />} />
        <Route path="/dashmlpublicationspublic" element={<Dashmlpublicationspublic />} />
        <Route path="/dashmlpublications" element={<Dashmlpublications />} />
        <Route path="/dashmlpublicationsadmin" element={<Dashmlpublicationsadmin />} />
        <Route path="/dashmlpubeditions" element={<Dashmlpubeditions />} />
        <Route path="/dashmlpubeditionsadmin" element={<Dashmlpubeditionsadmin />} />
        <Route path="/dashmlpubreviews" element={<Dashmlpubreviews />} />
        <Route path="/dashmlpubreviewsadmin" element={<Dashmlpubreviewsadmin />} />
        <Route path="/dashmlpubarticles" element={<Dashmlpubarticles />} />
        <Route path="/dashmlpubarticlesadmin" element={<Dashmlpubarticlesadmin />} />


        <Route path="/dashmpasswordstud" element={<Dashmpasswordstud />} />
        <Route path="/dashmpassword" element={<Dashmpassword />} />
        <Route path="/transformeroilstrength" element={<TransformerOilStrength />} />
        <Route path="/opticalfibre" element={<OpticalFibre />} />
        <Route path="/stephanslaw" element={<StefansLaw />} />
        <Route path="/phasesequence" element={<PhaseSequenceSynchronous />} />

        <Route path="/dashmtestscoreall" element={<Dashmtestscoreall />} />
        <Route path="/dashawsconfig" element={<Dashawsconfig />} />
        <Route path="/awsconfigcrudpage" element={<AwsConfigCrudPage />} />
        <Route path="/awsfilelibrary" element={<AwsFileLibraryPage />} />
        <Route path="/awsdocuments" element={<AwsDocumentsPage />} />
        <Route path="/institutionpolicies" element={<InstitutionPolicyPage />} />
        <Route path="/studentpolicies" element={<InstitutionPolicyPage studentView />} />

        <Route path="/dashmmvac" element={<Dashmmvac />} />
        <Route path="/dashmmvacadmin" element={<Dashmmvacadmin />} />


        <Route path="/Login" element={<Signinpage />} />
        <Route path="/signuppage" element={<SignupPage />} />
        <Route path="/campuswebsite" element={<CampusWebsite />} />
        <Route path="/circulareventsm" element={<Circulareventsm />} />
        <Route path="/dashmhtmleditor" element={<Dashmhtmleditor />} />
        <Route path="/videoshare/:videoid" element={<Videopagepreshare />} />
        <Route path="/videopage31" element={<Videopage32a />} />
        {/* <Route path="/videopage31" element={<Videopage31 />} /> */}
        <Route path="/videopage3" element={<Videopage3 />} />
        <Route path="/videopagepre" element={<Videopagepre />} />
        <Route path="/videopage2" element={<VideoPage2 />} />

        <Route path="/dashmlmsvideos" element={<Dashmlmsvideos />} />
        <Route path="/dashmlmsvideosadmin" element={<Dashmlmsvideosadmin />} />
        <Route path="/dashmlmsvideosc" element={<Dashmlmsvideosc />} />
        <Route path="/dashmlmsvideoscadmin" element={<Dashmlmsvideoscadmin />} />


        <Route path="/graytobinaryconverter" element={<GrayToBinaryConverter />} />
        <Route path="/bitserial" element={<BitSerial />} />
        <Route path="/bcdtoexcessconverter" element={<BCDToExcessConverter />} />
        <Route path="/codeeditor" element={<CodeEditor />} />
        <Route path="/videopage" element={<VideoPage />} />

        <Route path="/fullsubcircuitverify" element={<FullSubCircuitVerify />} />
        <Route path="/fullsubtractorcircuit" element={<FullSubtractorCircuit />} />
        <Route path="/halfsubcircuitverify" element={<HalfSubCircuitVerify />} />

        <Route path="/xnorgate" element={<XNORGate />} />
        <Route path="/xnorgate2" element={<XNORGate2 />} />
        <Route path="/xorgate2" element={<XORGate2 />} />
        
        <Route path="/halfsubtractorcircuit" element={<HalfSubtractorCircuit />} />
        <Route path="/xorgate" element={<XORGate />} />
        <Route path="/dashmgeotagtest" element={<Dashmgeotagtest />} />

        <Route path="/nandgate" element={<NANDGate />} />
        <Route path="/nandgate2" element={<NANDGate2 />} />
        <Route path="/norgate" element={<NORGate />} />
        <Route path="/norgate2" element={<NORGate2 />} />

        <Route path="/dashmtestqstud" element={<Dashmtestqstud />} />

        <Route path="/andgate" element={<ANDGate />} />
        <Route path="/andgate2" element={<ANDGate2 />} />
        <Route path="/orgate" element={<ORGate />} />
        <Route path="/orgate2" element={<ORGate2 />} />
        <Route path="/notgate" element={<NOTGate />} />
        <Route path="/notgate2" element={<NOTGate2 />} />


        <Route path="/binaryarithmetics" element={<BinaryArithmeticS />} />
        <Route path="/queuevisual" element={<QueueVisualization />} />
        <Route path="/binarysearch" element={<BinarySearch />} />

        <Route path="/binaryarith" element={<BinaryArithmeticSimulation />} />
        <Route path="/stackvisualization" element={<StackVisualization />} />
        <Route path="/arrayvisualization" element={<ArrayVisualization />} />

        <Route path="/dashmtestnewstud" element={<Dashmtestnewstud />} />
        
        <Route path="/codl" element={<CharacterizationOfDigitalLogic />} />
        
        <Route path="/insertionsort" element={<InsertionSort />} />
        <Route path="/selectionsort" element={<SelectionSort />} />

        <Route path="/dashmtestnew" element={<Dashmtestnew />} />
        <Route path="/dashmtestnewadmin" element={<Dashmtestnewadmin />} />
        <Route path="/dashmtestq" element={<Dashmtestq />} />
        <Route path="/dashmtestqadmin" element={<Dashmtestqadmin />} />
        <Route path="/dashmtesto" element={<Dashmtesto />} />
        <Route path="/dashmtestoadmin" element={<Dashmtestoadmin />} />


        <Route path="/dashmqualitative" element={<Dashmqualitative />} />
        <Route path="/dashmpolicy" element={<Dashmpolicy />} />
        <Route path="/dashmeventsnew1" element={<Dashmeventsnew1 />} />
        <Route path="/dashmeventsnew1admin" element={<Dashmeventsnew1admin />} />


        <Route path="/dashmslideshow" element={<Dashmslideshow />} />
        <Route path="/dashmslideshowadmin" element={<Dashmslideshowadmin />} />

        
        <Route path="/dashmscholnew" element={<Dashmscholnew />} />
        <Route path="/dashmscholnewadmin" element={<Dashmscholnewadmin />} />
        <Route path="/dashmstudawardsnew" element={<Dashmstudawardsnew />} />
        <Route path="/dashmstudawardsnewadmin" element={<Dashmstudawardsnewadmin />} />
        <Route path="/dashmscholnewstud" element={<Dashmscholnewstud />} />
        <Route path="/dashmstudawardsnewstud" element={<Dashmstudawardsnewstud />} />



        <Route path="/fourbitaddersubtractor" element={<FourBitAdderSubtractor />} />
        <Route path="/dashmclassnewstud" element={<Dashmclassnewstud />} />
        <Route path="/dashmclassnewc" element={<Dashmclassnewc />} />
        <Route path="/dashmattccode" element={<Dashmattccode />} />
        <Route path="/dashmattpcode" element={<Dashmattpcode />} />

        <Route path="/subhalfadder1" element={<SubHalfAdder1 />} />
        <Route path="/basiclogicgateexpfirst" element={<BasicLogicGateExpFirst />} />
        <Route path="/basiclogicgateexpsecond" element={<BasicLogicGateExpSecond />} />
        <Route path="/fullsubtractor" element={<FullSubtractor />} />
        <Route path="/halfsubtractor" element={<HalfSubtractor />} />
        <Route path="/twobitadder" element={<TwoBitAdder />} />

        <Route path="/dashmclassnew" element={<Dashmclassnew />} />
<Route path="/dashmclassnewadmin" element={<Dashmclassnewadmin />} />
<Route path="/dashmattendancenew" element={<Dashmattendancenew />} />
<Route path="/dashmattendancenewadmin" element={<Dashmattendancenewadmin />} />


        {/* <Route path="/resistor" element={<Resistor />} />
        <Route path="/bubblesort" element={<Bubblesort />} />
        <Route path="/firstsimulator" element={<Firstsimulator />} />
        <Route path="/secondsimulator" element={<SecondSimulator />} /> */}


        <Route path="/dashmquotanew" element={<Dashmquotanew />} />
<Route path="/dashmquotanewadmin" element={<Dashmquotanewadmin />} />


        <Route path="/dashmmassignsubmitfac" element={<Dashmmassignsubmitfac />} />

        <Route path="/dashmmassignsubmit" element={<Dashmmassignsubmit />} />
<Route path="/dashmmassignsubmitadmin" element={<Dashmmassignsubmitadmin />} />
<Route path="/dashmmdiscussion" element={<Dashmmdiscussion />} />
<Route path="/dashmmdiscussionadmin" element={<Dashmmdiscussionadmin />} />


        <Route path="/dashmmcoursecostud" element={<Dashmmcoursecostud />} />
        <Route path="/dashmmcoursematerialstud" element={<Dashmmcoursematerialstud />} />
        <Route path="/dashmmcalendarstud" element={<Dashmmcalendarstud />} />
        <Route path="/dashmmassignmentsstud" element={<Dashmmassignmentsstud />} />
        <Route path="/dashmmanouncementsstud" element={<Dashmmannouncementsstud />} />

        <Route path="/dashmmassignments" element={<Dashmmassignments />} />
<Route path="/dashmmassignmentsadmin" element={<Dashmmassignmentsadmin />} />
<Route path="/dashmmanouncements" element={<Dashmmanouncements />} />
<Route path="/dashmmanouncementsadmin" element={<Dashmmanouncementsadmin />} />
<Route path="/dashmmcourseco" element={<Dashmmcourseco />} />
<Route path="/dashmmcoursecoadmin" element={<Dashmmcoursecoadmin />} />
<Route path="/dashmmcalendar" element={<Dashmmcalendar />} />
<Route path="/dashmmcalendaradmin" element={<Dashmmcalendaradmin />} />
<Route path="/dashmmcoursematerial" element={<Dashmmcoursematerial />} />
<Route path="/dashmmcoursematerialadmin" element={<Dashmmcoursematerialadmin />} />


        <Route path="/dashmmsyllabus" element={<Dashmmsyllabus />} />
        
<Route path="/dashmmsyllabusadmin" element={<Dashmmsyllabusadmin />} />

<Route path="/dashmmsyllabusstud" element={<Dashmmsyllabusstud />} />

        <Route path="/dashmclassenr1" element={<Dashmclassenr1 />} />
<Route path="/dashmclassenr1admin" element={<Dashmclassenr1admin />} />
<Route path="/dashmclassenr1stud" element={<Dashmclassenr1stud />} />



        <Route path="/dashmmstudents1" element={<Dashmmstudents1 />} />
<Route path="/dashmmstudents1admin" element={<Dashmmstudents1admin />} />


        <Route path="/dashmmcourseslist" element={<Dashmmcourseslist />} />
<Route path="/dashmmcourseslistadmin" element={<Dashmmcourseslistadmin />} />


        <Route path="/dashmmcolevelscalc" element={<Dashmmcolevelscalc />} />

        <Route path="/dashmmcolevels" element={<Dashmmcolevels />} />
<Route path="/dashmmcolevelsadmin" element={<Dashmmcolevelsadmin />} />


        <Route path="/dashmmattcalc" element={<Dashmmattcalc />} />
<Route path="/dashmmattcalcadmin" element={<Dashmmattcalcadmin />} />


        <Route path="/dashmmfaccourses" element={<Dashmmfaccourses />} />
<Route path="/dashmmfaccoursesadmin" element={<Dashmmfaccoursesadmin />} />
<Route path="/dashmmfaccoursesatt" element={<Dashmmfaccoursesatt />} />
<Route path="/dashmmfaccoursesattadmin" element={<Dashmmfaccoursesattadmin />} />



        <Route path="/dashmmprograms" element={<Dashmmprograms />} />
<Route path="/dashmmprogramsadmin" element={<Dashmmprogramsadmin />} />
<Route path="/dashmmcourses" element={<Dashmmcourses />} />
<Route path="/dashmmcoursesadmin" element={<Dashmmcoursesadmin />} />
<Route path="/dashmmstudents" element={<Dashmmstudents />} />
<Route path="/dashmmstudentsadmin" element={<Dashmmstudentsadmin />} />
<Route path="/dashmexamtimetable" element={<Dashmexamtimetable />} />
<Route path="/dashmexamtimetableadmin" element={<Dashmexamtimetableadmin />} />


        
        <Route path="/loginstud" element={<Loginstud />} />
        <Route path="/dashmexamschedule" element={<Dashmexamschedule />} />
<Route path="/dashmexamscheduleadmin" element={<Dashmexamscheduleadmin />} />
<Route path="/dashmexamroom" element={<Dashmexamroom />} />
<Route path="/dashmexamroomadmin" element={<Dashmexamroomadmin />} />



        <Route path="/dashmpublications" element={<Dashmpublications />} />
<Route path="/dashmpublicationsadmin" element={<Dashmpublicationsadmin />} />
<Route path="/dashmpatents" element={<Dashmpatents />} />
<Route path="/dashmpatentsadmin" element={<Dashmpatentsadmin />} />
<Route path="/dashmteacherfellow" element={<Dashmteacherfellow />} />
<Route path="/dashmteacherfellowadmin" element={<Dashmteacherfellowadmin />} />
<Route path="/dashmconsultancy" element={<Dashmconsultancy />} />
<Route path="/dashmconsultancyadmin" element={<Dashmconsultancyadmin />} />
<Route path="/dashmphdguide" element={<Dashmphdguide />} />
<Route path="/dashmphdguideadmin" element={<Dashmphdguideadmin />} />
<Route path="/dashmseminar" element={<Dashmseminar />} />
<Route path="/dashmseminaradmin" element={<Dashmseminaradmin />} />
<Route path="/dashmbook" element={<Dashmbook />} />
<Route path="/dashmbookadmin" element={<Dashmbookadmin />} />



        <Route path="/dashmprojects" element={<Dashmprojects />} />
<Route path="/dashmprojectsadmin" element={<Dashmprojectsadmin />} />



        <Route path="/dashmncas22" element={<Dashmncas22 />} />
<Route path="/dashmncas22admin" element={<Dashmncas22admin />} />
<Route path="/dashmncas241" element={<Dashmncas241 />} />
<Route path="/dashmncas241admin" element={<Dashmncas241admin />} />
<Route path="/dashmncas23" element={<Dashmncas23 />} />
<Route path="/dashmncas23admin" element={<Dashmncas23admin />} />
<Route path="/dashmncas242" element={<Dashmncas242 />} />
<Route path="/dashmncas242admin" element={<Dashmncas242admin />} />
<Route path="/dashmncas243" element={<Dashmncas243 />} />
<Route path="/dashmncas243admin" element={<Dashmncas243admin />} />
<Route path="/dashmncas251" element={<Dashmncas251 />} />
<Route path="/dashmncas251admin" element={<Dashmncas251admin />} />
<Route path="/dashmncas252" element={<Dashmncas252 />} />
<Route path="/dashmncas252admin" element={<Dashmncas252admin />} />
<Route path="/dashmncas253" element={<Dashmncas253 />} />
<Route path="/dashmncas253admin" element={<Dashmncas253admin />} />
<Route path="/dashmncas26" element={<Dashmncas26 />} />
<Route path="/dashmncas26admin" element={<Dashmncas26admin />} />



        
      </Routes>
    </Router>
  );
}

export default App;
