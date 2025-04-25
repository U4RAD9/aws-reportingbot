import React, { Component, useState } from "react";
import { useRef } from "react";
import { render } from "react-dom";
import "./style.css";
import CKEditor from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import XrayChest from "./Utils/XrayChest";
import CampECG from "./Utils/CampECG";
import CampECG2 from "./Utils/CampECG2";
import Optometry from "./Utils/Optometry";
import Optometry2 from "./Utils/Optometry2";
import Optometry3 from "./Utils/Optometry3";
import Optometry4 from "./Utils/Optometry4";
import Audiometry from "./Utils/Audiometry";
import PnsAbnormal from "./Utils/PnsAbnormal";
import XrayLeftShoulder from "./Utils/XrayLeftShoulder";
import XrayRightShoulder from "./Utils/XrayRightShoulder";
import XrayKnee from "./Utils/XrayKnee";
import XraySpineCervical from "./Utils/XraySpineCervical";
import XraySpineLumber from "./Utils/XraySpineLumber";
import XraySpineDorsal from "./Utils/XraySpineDorsal";
import Vitals from "./Utils/Vitals";
import CtHead from "./Utils/CtHead";
import CtAbdomen from "./Utils/CtAbdomen";
import Blanks from './Utils/Blanks';
import TbChest from './Utils/TbChest';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Test } from "@jsonforms/core";
import html2pdf from "html2pdf.js";
import axios from "axios";
import $ from 'jquery';
import { AiOutlineZoomIn } from 'react-icons/ai';
import { AiOutlineDrag } from 'react-icons/ai'; // Pan (Drag) icon from Ant Design
//cornerstone imports - core, tools, dicom-image-loader, streaming-image-loader, dicomParser
import { FaRedoAlt } from 'react-icons/fa'; // Import rotate icon
import { FaSearch } from 'react-icons/fa'; // Import search/probe icon
import { FaAdjust } from 'react-icons/fa'; // Import adjust/contrast icon
import { FaRuler } from 'react-icons/fa'; // Import measurement ruler icon
import { FaEraser } from 'react-icons/fa'; // Import eraser icon
import { FaCube } from 'react-icons/fa'; // Import 3D cube icon
import { FaBars } from 'react-icons/fa'; // Import bars icon for slab thickness
import { FaThLarge } from 'react-icons/fa'; // Import grid layout icon
import { FaUndo } from 'react-icons/fa'; // Import undo/reset icon
import { FaCamera } from 'react-icons/fa'; // Import camera icon
import { FaExpand } from 'react-icons/fa'; // Import expand icon

import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { cornerstoneStreamingImageVolumeLoader, cornerstoneStreamingDynamicImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import dicomParser from 'dicom-parser';

// These are required for the pdf generation logic - Himanshu.
import ReactDOM from 'react-dom';
import autoTable from 'jspdf-autotable';
import Pica from 'pica';
import { PDFDocument } from 'pdf-lib';
import pako from 'pako';
import Compress from 'compress.js';

//VERY IMPORTANT IMPORT
//all the associated JS files that this function requires are stored in Utils folder
//ensure that the following files are present in Utils
//removeInvalidTags.js
//ptScalingMetaDataProvider.js
//getPixelSpacingInformation.js
//createImageIdsAndCacheMetaData.js
//convertMultiframeImageIds.js

//when adding functionality for PET scans, uncomment the last IF statement from createImageIdsAndCacheMetaData.js
//allow typescript files in the project and place https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/getPTImageIdInstanceMetadata.ts in Utils
import createImageIdsAndCacheMetaData from './Utils/createImageIdsAndCacheMetaData';



//cornerstone inits - core, tools
await cornerstone.init();
cornerstoneTools.init();


//cornerstone metadata providers, adds generic metadata provider and calibrated pixel spacing metadata provider
cornerstone.metaData.addProvider(
  cornerstone.utilities.calibratedPixelSpacingMetadataProvider.get.bind(
    cornerstone.utilities.calibratedPixelSpacingMetadataProvider
  ),
  11000);

cornerstone.metaData.addProvider(
  cornerstone.utilities.genericMetadataProvider.get.bind(
    cornerstone.utilities.genericMetadataProvider
  ),
  10000
);


const { preferSizeOverAccuracy, useNorm16Texture } =
  cornerstone.getConfiguration().rendering;

window.cornerstone = cornerstone;
window.cornerstoneTools = cornerstoneTools;

//Register and set up cornerstone volume loader
cornerstone.volumeLoader.registerVolumeLoader('cornerstoneStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);
cornerstone.volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
cornerstone.volumeLoader.registerVolumeLoader('cornerstoneStreamingDynamicImageVolume', cornerstoneStreamingDynamicImageVolumeLoader);


//Register and set up cornerstone dicom image loader
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
      use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
    },
});

let maxWebWorkers = 1;

if (navigator.hardwareConcurrency) {
  maxWebWorkers = Math.min(navigator.hardwareConcurrency, 10);
}


//dicom image loader configuration settings
var config = {
  maxWebWorkers,
  startWebWorkersOnDemand: false,
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      strict: false,
    },
  },
};

cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);

//create a toolgroup id and a variable for the toolgroup created in componentWillMount()
const toolGroupId = 'myToolGroup';
var toolGroup

//create a rendering engine and define viewport ids
const renderingEngineId = 'myRenderingEngine';
const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
const viewportIds = ['first', 'second', 'third', 'fourth']

//viewport variables
let first_viewport;
let second_viewport;
let third_viewport;
let fourth_viewport;
let viewport_list = {};

//map for storing the image ID display divs in accordance with viewport id
let indexMap = {first: 'viewport1Index', second: 'viewport2Index', third: 'viewport3Index', fourth: 'viewport4Index'}

//previously selected element and viewport
var selected_viewport;
var prev_selected_element;

//non CT image Id list
var nonCT_ImageIds = [];

var curr_tool = null;
var prev_layout = 'one';
//Dict of all cornerstone tools 
const Tools = {
  "Length": cornerstoneTools.LengthTool,
  "Angle": cornerstoneTools.AngleTool,
  "CobbAngle": cornerstoneTools.CobbAngleTool,
  "RectangleROI": cornerstoneTools.RectangleROITool,
  "CircleROI": cornerstoneTools.CircleROITool,
  "EllipticalROI": cornerstoneTools.EllipticalROITool,
  "FreehandROI": cornerstoneTools.PlanarFreehandROITool,
  "Bidirectional": cornerstoneTools.BidirectionalTool,
  "Zoom": cornerstoneTools.ZoomTool,
  "Pan": cornerstoneTools.PanTool,
  "Contrast": cornerstoneTools.WindowLevelTool,
  "Probe": cornerstoneTools.ProbeTool,
  "Eraser": cornerstoneTools.EraserTool,
  "PlanarRotate": cornerstoneTools.PlanarRotateTool,
  "Height": cornerstoneTools.HeightTool,
  "SplineROI": cornerstoneTools.SplineROITool,
  "StackScroll": cornerstoneTools.StackScrollMouseWheelTool,
  "ArrowAnnotate": cornerstoneTools.ArrowAnnotateTool,
  "Crosshairs": cornerstoneTools.CrosshairsTool,
  "Magnify": cornerstoneTools.MagnifyTool,
  "Wheel": cornerstoneTools.StackScrollTool,
  "ReferenceLines": cornerstoneTools.ReferenceLinesTool, // ✅ Added
};
var current_user = JSON.parse(
  document.getElementById("current-user").textContent
);



///////////// Dynamic lists by aman gupta on 07/07/2023 ///////////////
const options = JSON.parse(current_user.serviceslist).map((service) => ({
  label: service.fields.title,
  id: service.pk,
}));

const exportOptions = JSON.parse(current_user.exportlist).map((item) => ({
  label: item.fields.export,
  id: item.pk,
}));

class App extends Component {
  editor = null;
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      reportFrmData: this.generatePatientTable(),
      showPatientData: true,   
      options_label: "DEFAULT",
    };
    this.ActionEvents = this.ActionEvents.bind(this);
    this.GetCopiedEvents = this.GetCopiedEvents.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSeletion = this.handleSeletion.bind(this);
    this.generateReport = this.generateReport.bind(this);
    this.GetDivContentOnPDF = this.GetDivContentOnPDF.bind(this);
    this.GetDivContentOnPDFWithoutImage = this.GetDivContentOnPDFWithoutImage.bind(this);
    this.GetEcgContentOnPDF = this.GetEcgContentOnPDF.bind(this);
    this.uploadEcgPDF = this.uploadEcgPDF.bind(this);
    this.uploadXrayPDF = this.uploadXrayPDF.bind(this);
    this.UploadDivContentOnPDFVitals = this.UploadDivContentOnPDFVitals.bind(this);
    this.GetDivContentOnWord = this.GetDivContentOnWord.bind(this);
    this.onclickDiv = this.onclickDiv.bind(this);
    this.viewportSettings = this.viewportSettings.bind(this);
    this.toggleTool = this.toggleTool.bind(this);
    this.orientationSettings = this.orientationSettings.bind(this);
    this.windowingSettings = this.windowingSettings.bind(this);
    this.alignmentSettings = this.alignmentSettings.bind(this);
    this.layoutSettings = this.layoutSettings.bind(this);
    this.cornerstone = this.cornerstone.bind(this);
    this.volumeOrientation = this.volumeOrientation.bind(this);
    this.slabThickness = this.slabThickness.bind(this);
    this.capture = this.capture.bind(this);
    this.fullScreen = this.fullScreen.bind(this);
    this.drop = this.drop.bind(this);
    this.allowDrop = this.allowDrop.bind(this);  
    this.toggleDivs = this.toggleDivs.bind(this); 
    this.togglePatientData = this.togglePatientData.bind(this); 
    this.openImageInViewport = this.openImageInViewport.bind(this);
    this.toggleFullScreen=this.toggleFullScreen.bind(this);
    
   this.getHeaderFooterImages=this.getHeaderFooterImages.bind(this);
   this.slab=this.slab.bind(this);
   this.downloadAsJPEG=this.downloadAsJPEG.bind(this);
    
  }
  allowDrop(event){
    event.preventDefault();
  }
  toggleFullScreen() {
    const editorContainer = document.getElementById('reportEditor');
    if (!document.fullscreenElement) {
      editorContainer.requestFullscreen().catch((err) => {
        // console.error(Error attempting to enable full-screen mode: ${err.message});
      });
    } else {
      document.exitFullscreen();
    }
  }
  toggleDivs() {
    this.setState((prevState) => ({
      isDiv2Visible: !prevState.isDiv2Visible,
    }));
  }
  togglePatientData() {
    this.setState(prevState => ({
      showPatientData: !prevState.showPatientData,
    }));
  }    
   //function to capture selected viewport and download it as image
  capture(element) {
    html2canvas(element, { allowTaint: true }).then(function (canvas) {
      // Get the base64 image URL from the canvas
      const imageUrl = canvas.toDataURL('image/png');
  
      if (window.editor) {
        window.editor.model.change(writer => {
          // Get the end position of the document root to insert the image at the end
          const root = window.editor.model.document.getRoot();
          const endPosition = writer.createPositionAt(root, 'end');
  
          // Create an image element with the captured image URL
          const imageElement = writer.createElement('image', {
            src: imageUrl,
            alt: 'Captured Screenshot'
          });
  
          // Insert the image at the end position of the document
          writer.insert(imageElement, endPosition);
        });
      } else {
        console.error("CKEditor instance not found.");
      }
    });
  }
    // Function to download selected viewport as JPEG
downloadAsJPEG(element) {
  html2canvas(element, { allowTaint: true }).then(function (canvas) {
    // Convert canvas to JPEG data URL
    const jpegImageUrl = canvas.toDataURL('image/jpeg');

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = jpegImageUrl;
    link.download = 'captured-screenshot.jpeg';
    link.click();
  });
}

  
  //function to toggle full screen settings for viewer, changes css settings for div with ID page-content and for CKEditor
  fullScreen(call){
    const mainPage = document.getElementById('page-content');
    const reportEditor = document.getElementById('reportEditor');
    const valueChange = document.getElementById('fullScreen')
    switch(call){
      case 'small':
        mainPage.style.gridTemplateColumns = '20% 80%';
        reportEditor.style.display = 'none'
        valueChange.value = 'full'
        break;
      case 'full':
        mainPage.style.gridTemplateColumns = '25% 15% 60%';
        reportEditor.style.display = 'block'
        valueChange.value = 'small'
        break;
    }

    //important, resizes the image inside the viewport when the viewport size changes
    renderingEngine.resize(true, false);
  }  
  async  openImageInViewport(ID, modality,viewport_ID) {
    let newViewport;
  
    // Determine orientation based on description
    
    let orientation = cornerstone.Enums.OrientationAxis.ACQUISITION;
    
  
    const viewport = renderingEngine.getViewport(viewport_ID);
  
    // Clear previous data
    if (viewport.type === cornerstone.Enums.ViewportType.STACK) {
      viewport.setStack([]);
    } else if (viewport.type === cornerstone.Enums.ViewportType.VOLUME) {
      viewport.setVolumes([]);
    }
    viewport.render();
  
    // Handle single image (e.g., non-DICOM)
     if (modality === 'CT' || modality === 'MR') {
      const volume = cornerstone.cache.getVolume(ID);
      const hasMultipleSlices = volume?.imageIds?.length > 1;
  
      if (hasMultipleSlices) {
        newViewport = await cornerstone.utilities.convertStackToVolumeViewport({
          options: { volumeId: ID, viewportId: viewport_ID, orientation },
          viewport,
        });
        newViewport.setProperties({ rotation: 0 });
        toolGroup.addViewport(newViewport.id, renderingEngineId);
        newViewport.render();
  
        // Update slice index display
        newViewport.element.addEventListener(cornerstone.EVENTS.VOLUME_NEW_IMAGE, () => {
          const index = newViewport.getSliceIndex() + 1;
          document.getElementById(indexMap[newViewport.id]).innerHTML = `Image: ${index}`;
        });
      } else {
        viewport.setStack(volume.imageIds);
        viewport.render();
      }
    } else {
      // Handle non-CT/MR (e.g., XA, CR)
      if (viewport.type === cornerstone.Enums.ViewportType.STACK) {
        viewport.setStack(nonCT_ImageIds[Number(ID)]);
        viewport.render();
      } else {
        renderingEngine.disableElement(viewport_ID);
        const curr = viewport_list[viewport_ID];
        curr.type = cornerstone.Enums.ViewportType.STACK;
        delete curr.defaultOptions;
        renderingEngine.enableElement(curr);
        
        const newViewport = renderingEngine.getViewport(viewport_ID);
        newViewport.setProperties({ rotation: 0 });
        toolGroup.addViewport(newViewport.id, renderingEngineId);
        newViewport.setStack(nonCT_ImageIds[Number(ID)]);
        newViewport.render();
  
        // Update image index display
        newViewport.element.addEventListener(cornerstone.EVENTS.STACK_NEW_IMAGE, () => {
          const index = newViewport.getCurrentImageIdIndex() + 1;
          document.getElementById(indexMap[newViewport.id]).innerHTML = index;
        });
      }
    }
  }      



  drop(event) {
    event.preventDefault();
  
    let newViewport;
  
    // Get dropped item info
    const obj = JSON.parse(event.dataTransfer.getData('text'));
    const ID = obj[0];
    const modality = obj[1];
    const description = obj[2];
  
    // Detect orientation from description

  
    let orientation = cornerstone.Enums.OrientationAxis.ACQUISITION;
    
  
    // Get current viewport
    const parentElement = event.target.parentElement;
    const viewport_ID = parentElement.getAttribute('data-value');
    let viewport = renderingEngine.getViewport(viewport_ID);
  
    // Clear old data
    if (viewport.type === cornerstone.Enums.ViewportType.STACK) {
      viewport.setStack([]);
      viewport.render();
    } else if (viewport.type === cornerstone.Enums.ViewportType.VOLUME) {
      viewport.setVolumes([]);
      viewport.render();
    }
  
    // Main logic for CT / MR
    if (modality === 'CT' || modality === 'MR') {
      (async () => {
        const volume = cornerstone.cache.getVolume(ID);
        const hasMultipleSlices = volume && volume.imageIds.length > 1;
  
        if (hasMultipleSlices) {
          newViewport = await cornerstone.utilities.convertStackToVolumeViewport({
            options: { volumeId: ID, viewportId: viewport_ID, orientation: orientation },
            viewport: viewport,
          });
  
          newViewport.setProperties({ rotation: 0 });
          toolGroup.addViewport(newViewport.id, renderingEngineId);
          newViewport.render();
  
          newViewport.element.addEventListener(cornerstone.EVENTS.VOLUME_NEW_IMAGE, () => {
            const index = newViewport.getSliceIndex() + 1;
            document.getElementById(indexMap[newViewport.id]).innerHTML = 'Image: ' + index;
          });
        } else {
          viewport.setStack(volume.imageIds);
          viewport.render();
        }
      })();
    } else {
      // Logic for non-CT (other modalities like Ultrasound, X-ray)
      if (viewport.type === cornerstone.Enums.ViewportType.STACK) {
        viewport.setStack(nonCT_ImageIds[Number(ID)]);
        viewport.render();
      } else {
        (async () => {
          renderingEngine.disableElement(viewport_ID);
          let curr = viewport_list[viewport_ID];
          curr.type = cornerstone.Enums.ViewportType.STACK;
          delete curr.defaultOptions;
  
          renderingEngine.enableElement(curr);
          viewport = renderingEngine.getViewport(viewport_ID);
          viewport.setProperties({ rotation: 0 });
          toolGroup.addViewport(viewport.id, renderingEngineId);
          viewport.setStack(nonCT_ImageIds[Number(ID)]);
          viewport.render();
  
          viewport.element.addEventListener(cornerstone.EVENTS.STACK_NEW_IMAGE, () => {
            const index = viewport.getCurrentImageIdIndex() + 1;
            document.getElementById(indexMap[viewport.id]).innerHTML = index;
          });
        })();
      }
    }
  }
  
  async  cornerstone(PARAM) {
    try {
        const previewTab = document.getElementById('previewTab');
        const viewport = document.querySelector('.patientdata');
        const studyid = PARAM;
  
        // Create a loading message div
        const loadingMessage = document.createElement('div');
        loadingMessage.id = 'loadingMessage';
        loadingMessage.innerText = 'Please wait, images are loading...';
        loadingMessage.style.position = 'absolute';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingMessage.style.color = '#fff';
        loadingMessage.style.padding = '10px 20px';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.fontSize = '16px';
        loadingMessage.style.zIndex = '1000';
        loadingMessage.style.pointerEvents = 'none'; // Ensure it's non-interactive
        document.body.appendChild(loadingMessage);
  
        // Timeout for the loading message - 1 minute
        const loadingMessageTimeout = setTimeout(() => {
            const message = document.getElementById('loadingMessage');
            if (message) {
                document.body.removeChild(message); // Hide the loading message after 1 minute
                console.log('Loading message removed after timeout');
            }
        }, 60000); // 1 minute in milliseconds
  
        // Get CSRF token for POST request
        const re = await fetch("/get-csrf-token/");
        const FI = await re.json();
        const token = FI.csrf_token;
  
        // Fetch study details from view that accesses Orthanc server
        const response = await fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "X-CSRFToken": token
            },
            body: studyid
        });
        const data = await response.json();
  
        // Patient + study details
        const study_uid = data.study_uid;
        const series = data.series;
        const name = data.name;
        const id = data.id;
        const study_date = data.date;
        const study_time = data.time;
        
 // Fetch notes from dicom_data.py
 const notesResponse = await fetch('/get-dicom-notes/', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      "X-CSRFToken": token
  },
  body: JSON.stringify({ study_id: studyid })
});
const notesData = await notesResponse.json();
const notes = notesData.notes || 'No notes available';


  
        let k = 0;
        let imageIdIndex = 0;
        const totalSeries = series.length;
        let loadedSeriesCount = 0;
  
        // Function to format time
        function formatTime(study_time) {
            const hours = study_time.slice(0, 2);
            const minutes = study_time.slice(2, 4);
            const seconds = study_time.slice(4, 6);
            return `${hours}:${minutes}:${seconds}`;
        }
        const formattedTime = formatTime(study_time);
  
        // Function to format the date as YYYY/MM/DD
        function formatDate(date) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                const [year, month, day] = date.split("-");
                return `${year}/${month}/${day}`;
            } else if (/^\d{8}$/.test(date)) {
                const year = date.slice(0, 4);
                const month = date.slice(4, 6);
                const day = date.slice(6, 8);
                return `${year}/${month}/${day}`;
            }
  
            console.error("Invalid date format:", date);
            return "Invalid Date";
        }
        const formattedDate = formatDate(study_date);
  
      // Update patient details section
      viewport.innerHTML += `
      <p style="margin-bottom:0">
          Name: ${name}<br>
          ID: ${id}<br>
          Study Date: ${formattedDate}<br>
          Study Time: ${formattedTime}<br>
          Patient history: ${notes}<br>
      </p>
  `;
  
        // Handle each series asynchronously in parallel using Promise.all + series.map()
        const imagePromises = series.map(async (item, index) => {
            const startTime = Date.now();  // Start time for performance tracking
            
            let imageId = await createImageIdsAndCacheMetaData({
                StudyInstanceUID: study_uid,
                SeriesInstanceUID: item[0],
                wadoRsRoot: 'https://pacs.reportingbot.in/dicom-web',
            });
  
            let imageCount = 0;
            if (Array.isArray(imageId)) {
                imageCount = imageId.length;
            }
  
            let image = document.createElement('img');
            image.src = item[3];
            image.style.height = '100px';
            image.style.width = '120px';
            image.style.marginBottom = '0px';
  
            if (item[1] === 'CT' || item[1] === 'MR') {
                let volumeId = 'cornerstoneStreamingImageVolume: myVolume' + k;
                k += 1;
                image.dataset.value = volumeId;
  
                let volume = await cornerstone.volumeLoader.createAndCacheVolume(volumeId, { imageIds: imageId });
                cornerstone.utilities.cacheUtils.performCacheOptimizationForVolume(volumeId); // Cache optimization
                volume.load();
  
                image.dataset.modality = item[1];
                image.dataset.description = item[2];
                image.draggable = true;
  
                image.addEventListener('load', () => {
                    loadedSeriesCount++;
                    console.log(`Image loaded: ${item[2]} - Loaded Series: ${loadedSeriesCount}`);
                });
  
                // Add to preview tab
                const textContainer = document.createElement('div');
                textContainer.style.border = '1px solid #ccc';
                textContainer.style.padding = '10px';
                textContainer.style.marginBottom = '5px';
                textContainer.style.borderRadius = '2px';
                textContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                textContainer.style.backgroundColor = '#f9f9f9';
                textContainer.style.maxWidth = '100px';
                textContainer.style.textAlign = 'center';
                textContainer.innerHTML = `
                    <p style="margin: 1px 0; line-height: 1.3; font-size: 10px;">
                        <strong>${item[1]}</strong><br>
                        <span><strong>${item[2]}</strong><br></span>
                        <span>Image Count: <strong>${imageCount}</strong></span>
                    </p>
                `;
  
                previewTab.appendChild(textContainer);
                previewTab.appendChild(image);
            } else {
                nonCT_ImageIds.push(imageId);
                image.dataset.value = imageIdIndex;
                imageIdIndex += 1;
  
                image.dataset.modality = item[1];
                image.dataset.description = item[2];
                image.draggable = true;
                const textContainer = document.createElement('div');
                textContainer.style.border = '1px solid #ccc';
                textContainer.style.padding = '10px';
                textContainer.style.marginBottom = '5px';
                textContainer.style.borderRadius = '2px';
                textContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                textContainer.style.backgroundColor = '#f9f9f9';
                textContainer.style.maxWidth = '100px';
                textContainer.style.textAlign = 'center';
                textContainer.innerHTML = `
                    <p style="margin: 1px 0; line-height: 1.3; font-size: 10px;">
                        <strong>${item[1]}</strong><br>
                        <span><strong>${item[2]}</strong><br></span>
                        <span>Image Count: <strong>${imageCount}</strong></span>
                    </p>
                `;
  
                // Add to the preview tab
                previewTab.appendChild(textContainer);
                previewTab.appendChild(image);
  
                // Non-CT image loading (no caching required)
                image.addEventListener('load', () => {
                    loadedSeriesCount++;
                    console.log(`Non-CT Image loaded: ${item[2]} - Loaded Series: ${loadedSeriesCount}`);
                });
            }
            image.addEventListener('click', (event) => {
              const ID = event.target.dataset.value;
              const modality = event.target.dataset.modality;
              const targetViewportId = viewportIds[0]; // Or implement viewport selection logic
            
             this. openImageInViewport(ID, modality,targetViewportId);
            });
            
  
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;
            console.log(`Series ${index + 1} (modality: ${item[1]}): Load Time = ${elapsedTime} ms`);
            return item; // Ensure proper promise resolution
        });
  
        // Once all promises are resolved, proceed to cleanup
        Promise.all(imagePromises)
            .then(() => {
                clearTimeout(loadingMessageTimeout); // Cancel timeout if all images loaded
                const message = document.getElementById('loadingMessage');
                if (message) {
                    document.body.removeChild(message); // Remove the loading message
                    console.log('All images loaded, loading message removed');
                }
                const firstImage = previewTab.querySelector('img');
                if (firstImage) {
                    const ID = firstImage.dataset.value;
                    const modality = firstImage.dataset.modality;

                    const targetViewportId = viewportIds[0];
                    this.openImageInViewport(ID, modality,targetViewportId);}
                    })
            .catch(error => {
                // In case of error in loading images
                clearTimeout(loadingMessageTimeout); // Cancel timeout on error
                const message = document.getElementById('loadingMessage');
                if (message) {
                    document.body.removeChild(message); // Hide loading message on error
                }
                console.error('Error while loading images:', error);
            });
  
        previewTab.addEventListener('dragstart', (event) => {
            if (event.target.tagName === 'IMG') {
                const transferData = [event.target.dataset.value, event.target.dataset.modality, event.target.dataset.description];
                event.dataTransfer.setData("text", JSON.stringify(transferData));
            }
        });
  
    } catch (error) {
        console.error(error);
        const message = document.getElementById('loadingMessage');
        if (message) {
            document.body.removeChild(message); // Ensure loading message is removed on error
        }
    }
  }
  
  
 


  //function to set new tool active and previous tool passive
  toggleTool(newTool){
    var tool = Tools[newTool].toolName;
    if(curr_tool != null){
      toolGroup.setToolPassive(curr_tool);
    };
    toolGroup.setToolActive(tool, {
      bindings: [
        {
          mouseButton: cornerstoneTools.Enums.MouseBindings.Primary,
        },
      ],
    });
    curr_tool = tool;
  }
  // Viewport layout settings for single viewport, 2 viewports, or 4 viewports
  layoutSettings(event) {
    const call = event.target.value;
    const container = document.getElementById('viewport-container');
    const viewport2 = document.getElementById('viewport2');
    const viewport3 = document.getElementById('viewport3');
    const viewport4 = document.getElementById('viewport4');
    
    // Ensure prev_layout is initialized
    if (!prev_layout) {
      prev_layout = 'one';  // Set the initial layout if not already set
    }
  
  
    switch (call) {
      case 'one':
        console.log('Switching to 1x1 layout (one)');
        if (prev_layout == 'four') {
          // Log the transition from four to one
          console.log('Transitioning from 4 to 1 layout');
          renderingEngine.disableElement(viewportIds[1]);
          renderingEngine.disableElement(viewportIds[2]);
          renderingEngine.disableElement(viewportIds[3]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[2]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[3]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[1]);

          viewport2.style.display = 'none';
          viewport3.style.display = 'none';
          viewport4.style.display = 'none';
        } else if (prev_layout == 'three') {
          // Log the transition from three to one
          console.log('Transitioning from 3 to 1 layout');
          renderingEngine.disableElement(viewportIds[1]);
          renderingEngine.disableElement(viewportIds[2]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[1]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[2]);
  
          viewport2.style.display = 'none';
          viewport3.style.display = 'none';
        } else if (prev_layout == "two") {
          // Already in a 1 viewport layout
          renderingEngine.disableElement(viewportIds[1]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[1]);
          viewport2.style.display = 'none';
        }
        
        container.style.gridTemplateColumns = 'none';
        container.style.gridTemplateRows = 'none';
        break;
  
      case 'two':
        console.log('Switching to 2x1 layout');
        if (prev_layout == 'four') {
          console.log('Transitioning from 4 to 2 layout');
          renderingEngine.disableElement(viewportIds[2]);
          renderingEngine.disableElement(viewportIds[3]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[2]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[3]);
  
          viewport3.style.display = 'none';
          viewport4.style.display = 'none';
        }
        else if(prev_layout == "three") {
          renderingEngine.disableElement(viewportIds[2]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[2]);
          viewport3.style.display = 'none';
        }
         else {
          console.log('Enabling viewport 2');
          renderingEngine.enableElement(second_viewport);
          toolGroup.addViewport(viewportIds[1], renderingEngineId);
          viewport2.style.display = 'block';
        }
  
        container.style.gridTemplateColumns = '50% 50%';
        container.style.gridTemplateRows = 'none';
        break;
  
      case 'three':
        console.log('Switching to 1x3 layout');
        if (prev_layout == 'four') {
          console.log('Transitioning from 4 to 3 layout');
          renderingEngine.disableElement(viewportIds[3]);
          toolGroup.removeViewports(renderingEngineId, viewportIds[3]);
  
          viewport4.style.display = 'none';
        } else {
          console.log('Enabling viewports 2 and 3');
          renderingEngine.enableElement(second_viewport);
          renderingEngine.enableElement(third_viewport);
          toolGroup.addViewport(viewportIds[1], renderingEngineId);
          toolGroup.addViewport(viewportIds[2], renderingEngineId);
  
          viewport2.style.display = 'block';
          viewport3.style.display = 'block';
        }
  
        container.style.gridTemplateColumns = '33.33% 33.33% 33.33%';
        container.style.gridTemplateRows = 'none';
        break;
  
      case 'four':
        console.log('Switching to 2x2 layout');
        if (prev_layout == 'one') {
          console.log('Transitioning from 1 to 4 layout');
          renderingEngine.enableElement(second_viewport);
          viewport2.style.display = 'block';
          toolGroup.addViewport(viewportIds[1], renderingEngineId);
        }
  
        console.log('Enabling viewports 3 and 4');
        renderingEngine.enableElement(third_viewport);
        renderingEngine.enableElement(fourth_viewport);
        toolGroup.addViewport(viewportIds[2], renderingEngineId);
        toolGroup.addViewport(viewportIds[3], renderingEngineId);
        viewport3.style.display = 'block';
        viewport4.style.display = 'block';
  
        container.style.gridTemplateColumns = '50% 50%';
        container.style.gridTemplateRows = '50% 50%';
        break;
    }
  
    renderingEngine.resize(true, false);
  
    // Update prev_layout with the new layout state
    prev_layout = call;
  
    event.target.value = '';
  }

  slabThickness(val, id) {
    const viewport = renderingEngine.getViewport(id);
    if (!viewport) {
        console.error("MIP: Viewport not found!");
        return;
    }
    
    console.log("Setting MIP with slab thickness:", val);
    viewport.setBlendMode(cornerstone.Enums.BlendModes.MAXIMUM_INTENSITY_BLEND);
    viewport.setProperties({ slabThickness: Number(val) });
    viewport.render();
    console.log("MIP render complete.");
}

slab(val, id) {
    const viewport = renderingEngine.getViewport(id);
    if (!viewport) {
        console.error("MinIP: Viewport not found!");
        return;
    }

    console.log("Setting MinIP with slab thickness:", val);
    viewport.setBlendMode(cornerstone.Enums.BlendModes.MINIMUM_INTENSITY_BLEND);
    viewport.setProperties({ slabThickness: Number(val) });
    viewport.render();
    console.log("MinIP render complete.");
}

  //function for image alignment in viewport, uses viewport display area
  alignmentSettings(call, id){
    const viewport = renderingEngine.getViewport(id);
    var display;
    switch(call){
      case 'AlignLeft':
        display = {"imageArea": [1.1, 1.1], "imageCanvasPoint": {'imagePoint':[0, 0.5], 'canvasPoint':[0, 0.5]}}
        viewport.setDisplayArea(display)
        break;
      case 'AlignRight':
        display = {"imageArea": [1.1, 1.1], "imageCanvasPoint": {'imagePoint':[1, 0.5], 'canvasPoint':[1, 0.5]}}
        viewport.setDisplayArea(display)
        break;
      case 'AlignCenter':
        display = {"imageArea": [1.1, 1.1], "imageCanvasPoint": {'imagePoint':[0.5, 0.5], 'canvasPoint':[0.5, 0.5]}}
        viewport.setDisplayArea(display)
        break;
    }
    viewport.render();
  }

  //volume orientation settings - coronal, sagittal, axial 
  volumeOrientation(event, id){
    const call = event.target.value
    const viewport = renderingEngine.getViewport(id);
    switch(call){
      case 'axial':
        viewport.setOrientation(cornerstone.Enums.OrientationAxis.AXIAL);
        break;
      
      case 'sagittal':
        viewport.setOrientation(cornerstone.Enums.OrientationAxis.SAGITTAL)
        break;
      
      case 'coronal':
        viewport.setOrientation(cornerstone.Enums.OrientationAxis.CORONAL)
        break;
    }
    event.target.value = ''
  }

  //function for orientation settings - right rotate, left rotate, horizontal flip, vertical flip
  orientationSettings(event, id){
    const call = event.target.value
    const viewport = renderingEngine.getViewport(id);
    const { rotation } = viewport.getProperties();
    switch(call){
      case 'Rleft':
        viewport.setProperties({rotation: rotation - 90});
        break; 

      case 'Rright':
        viewport.setProperties({rotation: rotation + 90});
        break;

      case 'Hflip':
        const { flipHorizontal } = viewport.getCamera();
        viewport.setCamera({ flipHorizontal: !flipHorizontal })
        break;

      case 'Vflip':
        const { flipVertical } = viewport.getCamera();
        viewport.setCamera({ flipVertical: !flipVertical })
        break;
    }
    viewport.render();
    event.target.value = '';
  }

  //function for windowing settings (for any changes, change the upper and lower voiRange for specific windowing) and invert
  //might need to fix some value
  windowingSettings(event, id) {
    const call = event.target.value;
    const viewport = renderingEngine.getViewport(id);
    let selectedWindow = '';
    let upperValue, lowerValue;
  
    switch (call) {
      case 'Invert':
        const { invert } = viewport.getProperties();
        viewport.setProperties({ invert: !invert });
        selectedWindow = 'Invert';
        upperValue = lowerValue = null;  // No range for Invert
        break;
  
      case 'Lungs':
        viewport.setProperties({ voiRange: { upper: 1050, lower: -1650 } });
        selectedWindow = 'Lungs';
        upperValue = 1050;
        lowerValue = -1650;
        break;
  
      case 'Brain':
        viewport.setProperties({ voiRange: { upper: 80, lower: 0 } });
        selectedWindow = 'Brain';
        upperValue = 80;
        lowerValue = 0;
        break;
  
      case 'Bone':
        viewport.setProperties({ voiRange: { upper: 1500, lower: -500 } });
        selectedWindow = 'Bone';
        upperValue = 1500;
        lowerValue = -500;
        break;
  
      case 'ST':
        viewport.setProperties({ voiRange: { upper: 225, lower: -125 } });
        selectedWindow = 'Soft Tissue (ST)';
        upperValue = 225;
        lowerValue = -125;
        break;
  
      case 'Abdomen':
        viewport.setProperties({ voiRange: { upper: 250, lower: -150 } });
        selectedWindow = 'Abdomen';
        upperValue = 250;
        lowerValue = -150;
        break;
  
      case 'Liver':
        viewport.setProperties({ voiRange: { upper: 150, lower: 0 } });
        selectedWindow = 'Liver';
        upperValue = 150;
        lowerValue = 0;
        break;
  
      case 'Mediastinal':
        viewport.setProperties({ voiRange: { upper: 225, lower: -125 } });
        selectedWindow = 'Mediastinal';
        upperValue = 225;
        lowerValue = -125;
        break;
  
    
    }
  
   
    event.target.value = '';
    viewport.render();
  }

  //function to reset to regular viewport settings
  viewportSettings(call, id){ 
    const viewport = renderingEngine.getViewport(id);
    switch(call){
        case 'Reset':
          viewport.resetCamera();
          viewport.resetProperties();
          break;
    };
    viewport.render()
  }
  

  onclickDiv(e) {
    var ctrlDown = false,
      ctrlKey = 17,
      cmdKey = 91,
      vKey = 86,
      cKey = 67;

    document
      .onkeydown(function (e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
      })
      .keyup(function (e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
      });

    // Document Ctrl + C/V
    document.keydown(function (e) {
      if (ctrlDown && e.keyCode == cKey) console.log("Document catch Ctrl+C");
      if (ctrlDown && e.keyCode == vKey) console.log("Document catch Ctrl+V");
    });
  }

  ///////////ecg image by aman on 21/08/23
  componentDidMount() {
    
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const imageUrl = urlSearchParams.get("data-reportimage");
      const studyid = urlSearchParams.get("data-study-id")

      //setting cache size
      cornerstone.cache.setMaxCacheSize(32000000000);

      //use normal array buffer
      cornerstone.setUseSharedArrayBuffer(false);
      const elements = [document.getElementById('viewport1'), document.getElementById('viewport2'), document.getElementById('viewport3'), document.getElementById('viewport4')]
      
      //create tool groups for storing all tools
      toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);
  
      //adding tools to toolGroup
      for (const [key, value] of Object.entries(Tools)){
    
        cornerstoneTools.addTool(value);
        toolGroup.addTool(value.toolName);
      }
        // Enable tools
        toolGroup.setToolConfiguration(cornerstoneTools.StackScrollTool.toolName, {
          bindings: [
            {
              mouseButton: cornerstoneTools.Enums.MouseBindings.Primary,
            },
          ],
        });


      //set scroll active
      toolGroup.setToolActive(cornerstoneTools.StackScrollMouseWheelTool.toolName);
      toolGroup.setToolConfiguration(cornerstoneTools.CrosshairsTool.toolName, {
        bindings: [
          {
            mouseButton: cornerstoneTools.Enums.MouseBindings.Primary,
          },
        ],
      });
      
     
      toolGroup.setToolConfiguration(cornerstoneTools.PlanarFreehandROITool.toolName, {
        calculateStats: true
      });
      toolGroup.setToolConfiguration(cornerstoneTools.HeightTool.toolName, {
        calculateStats: true
      });
      
      //define 4 stack viewports with viewport id, viewport type, DOM element to be used
      first_viewport = {
        viewportId: viewportIds[0],
        type: cornerstone.Enums.ViewportType.STACK,
        element: elements[0],
        };

      second_viewport = {
        viewportId: viewportIds[1],
        type: cornerstone.Enums.ViewportType.STACK,
        element: elements[1],
      };

      third_viewport = {
        viewportId: viewportIds[2],
        type: cornerstone.Enums.ViewportType.STACK,
        element: elements[2],
      };
      
      fourth_viewport = {
        viewportId: viewportIds[3],
        type: cornerstone.Enums.ViewportType.STACK,
        element: elements[3],
      };

      viewport_list = {first: first_viewport, second: second_viewport, third: third_viewport, fourth: fourth_viewport}

      //enable first_viewport, make it the previously selected viewport, set its properties, add the toolgroup
      renderingEngine.enableElement(first_viewport);
      selected_viewport = viewportIds[0];
      prev_selected_element = elements[0];

      const viewport = renderingEngine.getViewport(selected_viewport);

      //need to set rotation to 0 in order to use it as a property for any rotation specific settings
      viewport.setProperties({rotation: 0});
      toolGroup.addViewport(viewportIds[0], renderingEngineId);

      //function to cache images and metadata, create volumes if needed
      //PUT REFRESH CONDITION SO THAT THIS FUNCTION DOES NOT RUN ON REFRESH
      this.cornerstone(studyid);

      let i = 0
      //event listeners for viewports
      elements.forEach((item) => {

        //initial event listener for stack viewport to capture image index
        item.addEventListener(cornerstone.EVENTS.STACK_NEW_IMAGE, function(){
          let currViewport = renderingEngine.getViewport(viewportIds[i]);
          let index = currViewport.getCurrentImageIdIndex() + 1;

          //update image index
          let indexElem = document.getElementById(indexMap[currViewport.id])
          indexElem.innerHTML = index
          
        })

        i += 1;
        

      
        item.addEventListener('click', function () {
          // Get clicked viewport ID
          const clickedViewportId = viewportIds[elements.indexOf(item)];
        
          if (selected_viewport !== clickedViewportId) {
            // Update selected viewport
            selected_viewport = clickedViewportId;
        
            // Reset border style
            if (prev_selected_element) {
              prev_selected_element.style.borderColor = 'white';
            }
            item.style.borderColor = 'red';
            prev_selected_element = item;
        
            // Dynamically update reference lines config
            const targetViewports = viewportIds.filter(id => id !== selected_viewport);
        
            toolGroup.setToolConfiguration(cornerstoneTools.ReferenceLinesTool.toolName, {
              sourceViewportId: selected_viewport,
              targetViewportIds: targetViewports,
            });
        
            // Force render update
            renderingEngine.render();
          }
        });

      });

      this.setState({
        reportFrmData: this.generatePatientTable(),
      });
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }

  ////////////////////////////////////////

  generateReport(data) {
    this.setState({ reportFrmData: data });
  }

  handleClick() {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
    });
  }




  generatePatientTable() {
    let params = new URL(document.location).searchParams;
    const age = params.get("age") ? params.get("age") + "Yr" : "";
    let tableBody = this.companyLogo(current_user);
    tableBody += "<table><tbody>";
    tableBody += "<tr>";
    tableBody += "<td>Patient Name</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Date Of Birth</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>National Health ID</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Age/Sex</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>Accession No.</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Referral Dr</td><td>" + " " + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>Study Date Time</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Report Date Time</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "</tbody>";
    tableBody += "</table>";
    return this.companyLogo(current_user);
  }





  companyLogo(user) {
    return "<img src='" + user.companylogo + "' height='' width='500' />";
  }





  choose() {
    // Retrieve query parameters from the URL
    const urlSearchParams = new URLSearchParams(window.location.search);
    let modality = urlSearchParams.get("data-Modality");
    let list = document.createElement("select");
    list.id = "choose_scan";
  
    // Map modality to modality1
    let modality1 = modality;
    if (modality === "DX" || modality === "CR" || modality === "DR") {
      modality1 = "Xray";
    } else if (modality === "CT") {
      modality1 = "CT";
    } else {
      modality1 = "MR";
    }
    console.log(modality1);
  
    // Default "Generate report" option
    let optionSelect = document.createElement("option");
    optionSelect.value = 0;
    optionSelect.text = "Generate report";
    list.appendChild(optionSelect);
  
    // Filter and append options
    options
      .filter(({ label }) => {
        const lowerLabel = label.toLowerCase();
        if (modality1 === "Xray") {
          return (
            lowerLabel.includes("xray") ||
            lowerLabel.includes("left-shoulder") ||
            lowerLabel.includes("right-shoulder") ||
            lowerLabel.includes("blanks") ||
            lowerLabel.includes("knee") ||
            lowerLabel.includes("spine") ||
            lowerLabel.includes("chest") ||
            lowerLabel.includes("tbchest")
          );
        } else if (modality1 === "CT") {
          return (
            lowerLabel.includes("head") ||
            lowerLabel.includes("blanks") ||
            lowerLabel.includes("abdomen") ||
            lowerLabel.includes("pns")
          );
        } else {
          return lowerLabel.includes("blanks");
        }
      })
      .forEach(({ label, id }) => {
        let option = document.createElement("option");
        option.value = id;
        option.text = label;
        list.appendChild(option);
      });
  
    // Assign a handler for onchange
    list.onchange = this.handleSeletion;
  
    // Auto-trigger handleSelection if only one option is available (excluding default)
    if (list.options.length === 2) {
      list.selectedIndex = 1;
      list.dispatchEvent(new Event('change'));
    }
  
    return list;
  }
  actionDropDown() {
    var list = document.createElement("select");
    list.id = "export_data";

    var optionSelect = document.createElement("option");
    optionSelect.value = 0;
    optionSelect.text = "Export Report";
    list.appendChild(optionSelect);

    // Iterate over exportOptions array to create options dynamically
    exportOptions.forEach(({ label, id }) => {
        var option = document.createElement("option");
        option.value = id;
        option.text = label;
        list.appendChild(option);
    });

    list.onchange = this.ActionEvents.bind(this); // bind 'this' to ActionEvents
    return list;
  }

  //Updated copy paste code by Aman Gupta
  copyAction() {
    var btn = document.createElement("a");
    btn.value = "Copy";
    btn.innerHTML = "Copy";
    btn.className = "report-here";
    btn.id = "copy_data";
    btn.addEventListener("click", this.GetCopiedEvents.bind(this));
    return btn;
  }

  GetCopiedEvents(event) {
    var content = document.querySelector(
      "#root > div > div > div.document-editor__editable-container > div"
    );
    content = this.extractContent(content);
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([content.outerHTML], { type: "text/html" }),
    });
    navigator.clipboard
      .write([clipboardItem])
      .then(() => {
        console.log("Content copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy content to clipboard:", err);
      });
  }

  // extractContent(s) {
  //   var span = document.createElement("span");
  //   span.innerHTML = s.innerHTML;
  //   var filterHtml = [...span.getElementsByTagName("table")];
  //   filterHtml.forEach((child) => {
  //     child.remove();
  //   });
  //   var img = [...span.getElementsByTagName("img")];
  //   img.forEach((child) => {
  //     child.remove();
  //   });

  //   return span;
  // }

  userDropdown() {
    var userDiv = document.createElement("div");
    var current_user = JSON.parse(
      document.getElementById("current-user").textContent
    );
    userDiv.innerHTML = `Welcome <span class='current-user'>${current_user.username}</span>`;
    userDiv.className = "user-name";
    current_user.className = "xyz";

    var logout = document.createElement("a");
    logout.href = "/logout";
    logout.innerHTML = "Logout";

    userDiv.appendChild(logout);
    logout.className = "report-here";

    return userDiv;
  }

  //print function add by Aman Gupta on 28/06/23
  printReport() {
    const data = document.querySelector(".ck-editor__editable");

    if (data !== null) {
      data.classList.add("ck-blurred");
      data.classList.remove("ck-focused");

      // Apply inline CSS styles
      data.style.fontSize = "28px";
      data.style.padding = "6px";

      // Add CSS styles for the table
      const tableStyle = `
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Added to ensure equal cell sizes */
          }
  
          td {
            border: 1px solid black;
            padding: 2px;
            font-size: 20px;
            width: auto; /* Adjust this value as needed */
          }
        </style>
      `;
      data.innerHTML = tableStyle + data.innerHTML;

      window.print();
    }
  }


     ////////////////////////////////// EVERYTHING RELATED TO REPORT FORMAT //////////////////////////// 
  // This will contain all the new functionalities which i have changed in the code which runs in backend which 
  // supports the PDF generation in all the required formats. - Himanshu. ( 30-11-2024 ).

  // These are all the functions that are common.

  // This will show the loader at the starting of the Report Generation Logic.

  showLoader = () => {
    console.log("Showing loader");
    const loader = document.querySelector(".loader");
    if (loader) {
        loader.style.display = "block";
    }
  };

  // This will hide the loader after report generation and doing respective task.
  hideLoader = () => {
    console.log("Hiding loader");
    const loader = document.querySelector(".loader");
    if (loader) {
        loader.style.display = "none";
    }
  };

  // This is the function/method with standard syntax which creates the filename as id_name
  createFilename() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientNameElement = document.querySelector(
      "#root > div > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
    );
    const PatientIdElement = document.querySelector(
      "#root > div > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
    );
    const patientName = patientNameElement?.innerHTML.trim(); // Trim extra spaces
    const PatientId = PatientIdElement?.innerHTML.trim(); // Trim extra spaces
    const location = urlSearchParams.get("data-institution_name");

    let filename;
    if (!patientName || !PatientId) {
      filename = ["Patient", "0"];
    } else {
      filename = [
        PatientId.replace("Patient ID:", "").replace(" ", "_"),
        patientName.replace("Name:", "").trim(), // Trim extra spaces
        location,
      ];
    }

    // Rest of your code
    filename = filename.filter(Boolean).join("_").toUpperCase();
    filename = filename.replace(/^_/, ""); // Remove leading underscore if present
    return filename;
  }

  // This is the function to get the Uri of the data.
  getDataUri(url) {
    return new Promise((resolve) => {
      var image = new Image();
      image.setAttribute("crossOrigin", "anonymous"); //getting images from external domain

      image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        //next three lines for white background in case png has a transparent background
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; /// set white fill style
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.getContext("2d").drawImage(this, 0, 0);

        resolve(canvas.toDataURL("image/jpeg"));
      };

      image.src = url;
    });
  }

  // This is the function to extract the data that is passed in the url. 
  extractDataFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    // const patientId = urlParams.get("data-patientid");
    // const patientName = urlParams.get("data-patientname");
    // const age = urlParams.get("data-age");
    // const gender = urlParams.get("data-gender");
    // const testDate = urlParams.get("data-testdate");
    // const reportDate = urlParams.get("data-reportdate");
    const location = urlParams.get("data-location");
    const accession = urlParams.get("data-accession");
    const institutionName = urlParams.get("data-institution_name");
    // const reportImageUrl = urlParams.get("data-reportimage");

    // return { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl };
    return { location, accession, institutionName };
  };

    // This is the function to get the data from the table of ckeditor - Himanshu.
 

extractTableData = (tableData) => {
  // Get the table element.
  const table = tableData.querySelector('table');
  // Get all rows of the table.
  const rows = table.querySelectorAll('tr');

  // Initialize object to store extracted data.
  const data = {
      patientName: '',
      patientId: '',
      age: '',
      gender: '',
      testDate: '',
      reportDate: '',
      referralDr: '',
      reportTime: ''
  };

  rows.forEach(row => {
      const cells = row.querySelectorAll('td'); // Get all cells in the row.
      cells.forEach(cell => {
          const strongTag = cell.querySelector('strong'); // Look for <strong> inside <td>.

          if (strongTag) {
              const textContent = strongTag.textContent.trim(); // Get text inside <strong>.
              if (textContent.includes("Name:")) {
                  data.patientName = textContent.replace("Name:", "").trim(); // Extract patient name.
              } else if (textContent.includes("Patient ID:")) {
                  data.patientId = textContent.replace("Patient ID:", "").trim(); // Extract patient ID.
              } else if (textContent.includes("Age:")) {
                  data.age = textContent.replace("Age:", "").trim(); // Extract age.
              } else if (textContent.includes("Gender:")) {
                  data.gender = textContent.replace("Gender:", "").trim(); // Extract gender.
              } else if (textContent.includes("Test date:")) {
                  data.testDate = textContent.replace("Test date:", "").trim(); // Extract test date.
              } else if (textContent.includes("Report date:")) {
                  data.reportDate = textContent.replace("Report date:", "").trim(); // Extract report date.
              } else if (textContent.includes("Referral Dr:")) {
                  data.referralDr = textContent.replace("Referral Dr:", "").trim(); // Extract referral doctor.
              } else if (textContent.includes("Report time:")) {
                  data.reportTime = textContent.replace("Report time:", "").trim(); // Extract report time.
              }
          }
      });
  });

  // Return the extracted data as an object.
  return data;
};



 


  addParagraphToPdf = (pdf, element, fontSize, isHeading, currentYPosition) => {
    const lines = this.splitParagraphIntoLines(element).filter(line => line.trim().length > 0);
    pdf.setFontSize(fontSize);
    const baseX = 40;

    for (let line of lines) {
        let fontStyle = "normal";
        let xCoordinate = baseX + 20;
        let extraSpacing = 15;
        let maxWidth = pdf.internal.pageSize.width - xCoordinate - 40; // Adjust right margin

        if (element.querySelector('strong u')) {
            fontStyle = "bold";
            xCoordinate = baseX;
            extraSpacing = 20;
            maxWidth = pdf.internal.pageSize.width - xCoordinate - 40; // Adjust for heading
        }

        pdf.setFont("helvetica", fontStyle);
        const sublines = pdf.splitTextToSize(line, maxWidth);
        
        for (const subline of sublines) {
            if (currentYPosition > pdf.internal.pageSize.height - 40) {
                pdf.addPage();
                currentYPosition = 40; // Reset Y position on new page
            }
            pdf.text(subline, xCoordinate, currentYPosition);
            currentYPosition += extraSpacing;
        }
    }
    return currentYPosition;
  };


  
  // Utility function to decode HTML entities into their character equivalents
  decodeHtmlEntities = (str) => {
    let doc = new DOMParser().parseFromString(str, "text/html");
    return doc.body.textContent || "";
  };

  splitParagraphIntoLines = (element) => {
    const lines = [];
    let currentLine = "";
    
    const children = element.childNodes; // Get all child nodes (including text and <br> tags)
  
    children.forEach((child) => {
      if (child.nodeName === "BR") {
        // If a <br> tag is found, push the current line if it's not empty
        if (currentLine.trim().length > 0) {
          // Check if the current line contains unwanted entities like "&nbsp;" or "&NoBreak"
          if (!currentLine.includes("&nbsp;") && !currentLine.includes("&NoBreak")) {
            lines.push(currentLine.trim()); // Only add non-empty lines that don't contain unwanted entities
          }
        }
        currentLine = ""; // Reset the current line for the next one
      } else if (child.nodeType === Node.TEXT_NODE) {
        // For text nodes, append the text to the current line
        currentLine += child.textContent;
      } else {
        // Handle other tags (e.g., <strong>, <em>) if necessary
        currentLine += child.textContent; // Append child content (e.g., bold or italic) to current line
      }
    });
  
    // Add the last line if it's not empty and doesn't contain unwanted entities
    if (currentLine.trim().length > 0) {
      if (!currentLine.includes("&nbsp;") && !currentLine.includes("&NoBreak")) {
        lines.push(currentLine.trim());
      }
    }
  
    return lines;
  };

  // Showing the notification on the browser.
  showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
          notificationText.innerText = message;
          notification.style.display = "block";

          setTimeout(() => {
              notification.style.display = "none";
          }, 1500);
      }
  };

  // getting the csrf token for much better and secured processing.
  getCSRFToken = async () => {
      try {
          const response = await fetch("/get-csrf-token/");
          const data = await response.json();
          return data.csrf_token;
      } catch (error) {
          console.error("Error fetching CSRF token:", error);
          throw error;
      }
  };

  // Fetching the image and converting it to a Base 64 data so that it can be added to the pdf correctly.
  fetchImageAsBase64 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });
      } catch (error) {
          console.error("Error fetching image:", error);
          throw error;
      }
  };

  // Adding the logo on the pdf.
  addLogo = async (pdf, logoUrl, currentYPosition) => {
      if (logoUrl) {
          try {
              const imageData = await this.fetchImageAsBase64(logoUrl);
              const pageWidth = pdf.internal.pageSize.width;
              const imgWidth = pageWidth - 80;
              const imgHeight = 50;
              const imgX = 40;
              const imgY = currentYPosition;

              pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
              currentYPosition = imgY + imgHeight;
              return currentYPosition;
          } catch (error) {
              console.log("Error adding logo image to PDF:", error);
              throw error;
          }
      }
      return currentYPosition;
  };

  // Adding the doctor signature on the pdf.
  addSignature = async (pdf, signatureUrl, currentYPosition) => {
      if (signatureUrl) {
          try {
              const imageData = await this.fetchImageAsBase64(signatureUrl);
              const pageWidth = pdf.internal.pageSize.width;
              const imgWidth = pageWidth - 80;
              const imgHeight = 60;
              const imgX = 40;
              const imgY = currentYPosition ;

              pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
              currentYPosition = imgY + imgHeight + 20;
              return currentYPosition;
          } catch (error) {
              console.log("Error adding signature image to PDF:", error);
              throw error;
          }
      }
      return currentYPosition;
  };

  // This is for adding the image on the single page of an pdf.
  addReportImage = async (pdf, reportImageUrl, currentYPosition) => {
    const A4_HEIGHT = 841.89; // A4 height in points (for "pt" unit used in jsPDF)

    if (reportImageUrl) {
        try {
          console.log("Inside the add report image function.");
            // const imageData = await this.fetchImageAsBase64(reportImageUrl);
            const imageData = reportImageUrl; // because it is already in the format of base 64.
            const pageWidth = pdf.internal.pageSize.width;
            // const imgWidth = 300;
            const imgWidth = pageWidth - 80;
            const imgHeight = 200;
            const imgX = (pageWidth - imgWidth) / 2;
            let imgY = currentYPosition;

            // Calculate the new Y position after adding the image
            const newYPosition = imgY + imgHeight + 20;

            // Check if the new Y position exceeds the A4 page height
            if (newYPosition > A4_HEIGHT) {
                // Add a new page to the PDF
                console.log("This is the new y position :", newYPosition);
                console.log("condition to add a new page.");
                pdf.addPage();
                console.log("New page is added.");
                // Reset currentYPosition for the new page
                imgY = 80; // Start at a margin from the top of the new page
            }

            // Add the image
            pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);

            // Update currentYPosition for the next content
            currentYPosition = imgY + imgHeight + 20; // Update the position for the next content
            return currentYPosition;
        } catch (error) {
            console.error("Error adding image to PDF:", error);
            this.hideLoader();
            this.showNotification("Error processing image. Please try again.");
            throw error;
        }
    }
    return currentYPosition;
  };

  // End of all the common functions for the reporting bot.
  
async getHeaderFooterImages(institutionName) {
  try {
      console.log("Fetching header and footer images...");
      const response = await fetch(`/get-client-header-footer/?institution_name=${institutionName}`);
      const headerFooterData = await response.json();
      console.log("Header/Footer Data:", headerFooterData);
      return headerFooterData;
  } catch (error) {
      console.error("Error fetching header/footer images:", error);
      throw error;
  }
}
extractContent(editor) {
  if (!editor) {
    return null;
  }

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;

    const processNode = (node) => {
      // Handle text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      // Handle element nodes 
      if (node.nodeType === Node.ELEMENT_NODE) {
        let text = '';
        const tag = node.tagName.toLowerCase();
        
        switch (tag) {
          case 'p':
            // Skip the first table that contains patient info
            const firstTable = node.closest('figure.table');
            if (firstTable && firstTable === tempDiv.querySelector('figure.table')) {
              return '';
            }

            // Check if paragraph contains a list
            if (node.querySelector('ul, ol')) {
              return Array.from(node.childNodes)
                .map(child => processNode(child))
                .join('');
            }
            text = Array.from(node.childNodes)
              .map(child => processNode(child))
              .join('');
            return text + '\n';
          
          case 'strong':
          case 'b':
            // Mark bold text with [BOLD] tags
            return `[BOLD]${node.textContent}[/BOLD]`;
          
          case 'ul':
          case 'ol':
            // Process lists
            return Array.from(node.children)
              .map(li => `• ${processNode(li)}`)
              .join('\n') + '\n';
          
          case 'li':
            return Array.from(node.childNodes)
              .map(child => processNode(child))
              .join('');
          
          case 'table':
            // Skip the first table that contains patient info
            if (node === tempDiv.querySelector('table')) {
              return '';
            }
            return processTable(node);
          
          case 'br':
            return '\n';
          
          default:
            return Array.from(node.childNodes)
              .map(child => processNode(child))
              .join('');
        }
      }
      return '';
    };

    const processTable = (table) => {
      // Skip the first table that contains patient info
      if (table === tempDiv.querySelector('table')) {
        return '';
      }

      let tableContent = '';
      const rows = table.rows;
      
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        let rowContent = [];
        
        for (let j = 0; j < cells.length; j++) {
          const cellNode = cells[j];
          const cellText = Array.from(cellNode.childNodes)
            .map(child => processNode(child))
            .join('')
            .trim();
          rowContent.push(cellText);
        }
        
        if (rowContent.length === 1) {
          tableContent += rowContent[0] + '\n';
        } else {
          tableContent += rowContent.join('\t') + '\n';
        }
      }
      
      return tableContent + '\n';
    };

    const content = Array.from(tempDiv.childNodes)
      .map(node => processNode(node))
      .join('')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return content;
  } catch (error) {
    console.error('Error extracting content:', error);
    return null;
  }
}


GetDivContentOnPDFWithoutImage() {
  (async () => {
      this.showLoader();
      const filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      const urlParams = new URLSearchParams(window.location.search);
      const institutionName = urlParams.get('data-institution_name');
      const images = data.querySelectorAll("img");
            const signatureElement = images[1];
            const signatureUrl = signatureElement ? signatureElement.src : null;
           const logoElement = images[0];
           const logoUrl = logoElement ? logoElement.src : null;
            console.log("This is the signature Url:", signatureUrl);
            console.log("This is the logo Url:", logoUrl);
      const pdf = new jsPDF("p", "pt", "a4");
      let currentYPosition = 100;

      try {
          console.log("Starting PDF generation...");
          console.log("Institution Name:", institutionName);

          // Fetch header and footer from the server
          const headerFooterData = await this.getHeaderFooterImages(institutionName);
          const headerImage = headerFooterData.upload_header;
          const footerImage = headerFooterData.upload_footer;

          // Add Header
          if (headerImage) {
              console.log("Adding header image...");
              const headerHeight = 60;
              await pdf.addImage(headerImage, "JPEG", 0, 0, pdf.internal.pageSize.width, headerHeight);
              currentYPosition = headerHeight + 20;
          }

        // Example usage.
const tableData = this.extractTableData(data);
const { patientId, patientName, age, gender, testDate, reportDate, referralDr, reportTime } = tableData;
console.log("Extracted Table Data:", tableData);

const tableContent = [
    ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
    ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
    ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"],
    ["Referral Dr:", referralDr || "N/A", "Report Time:", reportTime || "N/A"]
];

// Add patient details to PDF.
pdf.autoTable({
    startY: currentYPosition,
    body: tableContent,
    theme: "grid",
    styles: { cellPadding: 3, fontSize: 10 },
});
          currentYPosition = pdf.previousAutoTable.finalY + 20;

          // Get Images (Logo and Signature)
          const images = data.querySelectorAll("img");
          const signatureElement = images[1];
          const signatureUrl = signatureElement ? signatureElement.src : null;
          const logoElement = images[0];
          const logoUrl = logoElement ? logoElement.src : null;

          console.log("Logo URL:", logoUrl);
          console.log("Signature URL:", signatureUrl);

          // Add Logo
          if (logoUrl) {
              currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);
          }

          // Add Report Content
          const elements = data.children;
          for (let i = 0; i < elements.length; i++) {
              const element = elements[i];

              if (element.tagName === "P") {
                  const isHeading = element.querySelector("strong u");
                  if (isHeading) {
                      console.log("Adding heading:", element.textContent);
                      currentYPosition = this.addParagraphToPdf(pdf, element, 13, true, currentYPosition);
                  } else {
                      if (element.textContent.includes("Dr.")) {
                          console.log("Adding signature...");
                          currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                      }
                      console.log("Adding paragraph:", element.textContent);
                      currentYPosition = this.addParagraphToPdf(pdf, element, 12, false, currentYPosition);
                  }
              }

              // Add footer on each page
              if (currentYPosition > pdf.internal.pageSize.height - 100) {
                  if (footerImage) {
                      console.log("Adding footer to current page...");
                      const footerHeight = 50;
                      await pdf.addImage(
                          footerImage,
                          "JPEG",
                          0,
                          pdf.internal.pageSize.height - footerHeight,
                          pdf.internal.pageSize.width,
                          footerHeight
                      );
                  }
                  console.log("Adding new page...");
                  pdf.addPage();
                  currentYPosition = 100;
              }
          }

          // Add final footer on the last page
          if (footerImage) {
              console.log("Adding final footer...");
              const footerHeight = 50;
              await pdf.addImage(
                  footerImage,
                  "JPEG",
                  0,
                  pdf.internal.pageSize.height - footerHeight,
                  pdf.internal.pageSize.width,
                  footerHeight
              );
          }

          // Save the PDF
          console.log("Saving PDF...");
          pdf.save(filename ? filename + ".pdf" : "download.pdf");
          this.hideLoader();

      } catch (error) {
          console.error("Error generating PDF:", error);
          this.showNotification("Error generating PDF. Please try again.");
      } finally {
          console.log("PDF generation process completed.");
          this.hideLoader();
      }
  })();
}






  GetDivContentOnPDF() {
    (async () => {
      try {
        this.showLoader();
        const filename = this.createFilename();
        const data = document.getElementsByClassName("ck-editor__editable")[0];
        const urlParams = new URLSearchParams(window.location.search);
        const institutionName = urlParams.get('data-institution_name');

        if (!data) throw new Error("No CKEditor content found.");

        const images = data.querySelectorAll("img");
        const logoUrl = images[0]?.src || null;
        const signatureUrl = images[1]?.src || null;
        const remainingReportImages = Array.from(images).slice(2);

        

        const elements = data.children;
        let currentYPosition = 40;

        const pdf = new jsPDF("p", "pt", "a4");

        console.log("Starting PDF generation...");

        // Fetch header and footer from server
        const headerFooterData = await this.getHeaderFooterImages(institutionName);
        const headerImage = headerFooterData.upload_header;
        const footerImage = headerFooterData.upload_footer;

        // Add Header
        if (headerImage) {
          console.log("Adding header image...");
          const headerHeight = 60;
          await pdf.addImage(headerImage, "JPEG", 0, 0, pdf.internal.pageSize.width, headerHeight);
          currentYPosition += headerHeight + 20;
        }

        
        // Example usage.
const tableData = this.extractTableData(data);
const { patientId, patientName, age, gender, testDate, reportDate, referralDr, reportTime } = tableData;
console.log("Extracted Table Data:", tableData);

const tableContent = [
    ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
    ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
    ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"],
    ["Referral Dr:", referralDr || "N/A", "Report Time:", reportTime || "N/A"]
];

// Add patient details to PDF.
pdf.autoTable({
    startY: currentYPosition,
    body: tableContent,
    theme: "grid",
    styles: { cellPadding: 3, fontSize: 10 },
});
        currentYPosition = pdf.previousAutoTable.finalY + 20;

        // Process CKEditor elements
        for (let element of elements) {
          if (element.tagName === 'P') {
            const isHeading = element.querySelector('strong u');

            if (isHeading) {
              currentYPosition = this.addParagraphToPdf(pdf, element, 13, true, currentYPosition);
            } else {
              if (element.textContent.includes("Dr.")) {
                currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
              }
              currentYPosition = this.addParagraphToPdf(pdf, element, 12, false, currentYPosition);
            }
          }
        }

        // Add Report Images
        for (let image of remainingReportImages) {
          const imageUrl = image?.src || null;
          if (imageUrl) {
            currentYPosition = await this.addReportImage(pdf, imageUrl, currentYPosition);
          }
        }

        // Add Footer
        if (footerImage) {
          const footerHeight = 50;
          await pdf.addImage(footerImage, "JPEG", 0, pdf.internal.pageSize.height - footerHeight, pdf.internal.pageSize.width, footerHeight);
        }

        // Download PDF
        pdf.save(filename ? filename + ".pdf" : "download.pdf");

        const currentURL = window.location.href;
        setTimeout(() => {
          window.location.href = document.referrer + "?nocache=" + Date.now();
        }, 200);

        window.addEventListener("popstate", () => {
          if (window.location.href !== currentURL) {
            setTimeout(() => {
              window.location.reload(true);
            }, 200);
          }
        });

      } catch (error) {
        console.error("Error generating PDF:", error);
        this.showNotification("Error generating PDF. Please try again.");
      } finally {
        this.hideLoader();
      }
    })();
  }

  //***************************************************************** pdf for ECG */

  GetEcgContentOnPDF() {
    const showLoader = () => {
      //console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      //console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };
    // Show the loader before starting the PDF generation
    showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Create a function to load images and render PDF
    const loadImageAndRenderPDF = async () => {
      try {
        let graphSrc = Array.from(data.children).pop().children[0].currentSrc;
        let graphElement = document.querySelector(
          "figure.image:nth-last-of-type(1)"
        );
        graphElement.remove();

        if (data != undefined) {
          var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
          var a4Height = 841.89; // A4 height in points

          var canvasWidth = a4Width; // Adjusted width to leave some margin
          var canvasHeight = a4Height; // Adjusted height to maintain aspect ratio and leave margin

          const canvas = await html2canvas(data, {
            scale: 2, // Adjust the scale if needed for better quality
            useCORS: true, // Enable CORS to capture images from external URLs
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);

          // Calculate the image dimensions to fit within the PDF dimensions
          const canvasAspectRatio = canvas.width / canvas.height;
          const pdfAspectRatio = a4Width / a4Height;

          let pdfImageWidth = canvasWidth;
          let pdfImageHeight = canvasHeight;

          if (canvasAspectRatio > pdfAspectRatio) {
            pdfImageWidth = canvasWidth;
            pdfImageHeight = canvasWidth / canvasAspectRatio;
          } else {
            pdfImageHeight = canvasHeight;
            pdfImageWidth = canvasHeight * canvasAspectRatio;
          }

          // Calculate the positioning to center the image
          const xPosition = (pdf.internal.pageSize.width - pdfImageWidth) / 2;
          const yPosition = (pdf.internal.pageSize.height - pdfImageHeight) / 2;

          // Create a separate canvas for the rotated graph image
          const graphCanvas = document.createElement("canvas");
          graphCanvas.width = 1024;
          graphCanvas.height = 1024;
          const graphCtx = graphCanvas.getContext("2d");
          let graphImg = await this.getDataUri(graphSrc);
          const image = new Image();
          image.src = graphImg;

          await new Promise((resolve) => {
            image.onload = resolve;
          });

          graphCtx.translate(graphCanvas.width / 2, graphCanvas.height / 2);
          graphCtx.rotate(Math.PI / 2); // Rotate the image by 90 degrees
          graphCtx.drawImage(
            image,
            -graphCanvas.height / 2,
            -graphCanvas.width / 2,
            graphCanvas.height,
            graphCanvas.width
          );

          pdf.addImage(
            graphCanvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            a4Width,
            a4Height
          );

          pdf.addPage("a4", "portrait"); // Add a new portrait-oriented page
          pdf.addImage(
            imgData,
            "PNG",
            xPosition,
            yPosition,
            pdfImageWidth,
            pdfImageHeight
          );

          pdf.setTextColor(255, 255, 255);

          // Calculate the position to place the text at the bottom
          const textX = 40;
          const textY = 841.89 - 2; // 20 points from the bottom

          // If a table exists within the ck-editor__editable div, capture its text content
          if (table) {
            const tableText = table.textContent || "";

            // Add the table text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY, tableText);
          }

          // Iterate through all paragraphs in the ck-editor__editable div
          const paragraphs = data.querySelectorAll("p");
          paragraphs.forEach((paragraph) => {
            const paragraphText = paragraph.textContent || "";

            // Add each paragraph text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
          });
          // Hide the loader when the PDF is ready
          hideLoader();
          // Save the PDF
          pdf.save(filename ? filename + ".pdf" : "download.pdf");

          // Get the previous page URL
          const previousPageURL = document.referrer;

          // Redirect to the previous page after a short delay
          await delay(500); // Adjust the delay as needed
          window.location.replace(previousPageURL);

          // Reload the current page after another delay
          await delay(200); // Adjust the delay as needed
          window.location.reload(true);
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    };

    loadImageAndRenderPDF();
  }

  

  ////////////////////////////////////////////////////////////////////////// UPLOAD ECG PDF //////////////////////////////////////////////////////////////////////////
  uploadEcgPDF = async () => {
    const showLoader = () => {
      //console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      //console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    const extractDataFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const patientId = urlParams.get("data-patientid");
      const patientName = urlParams.get("data-patientname");
      const testDate = urlParams.get("data-testdate");
      const reportDate = urlParams.get("data-reportdate");
      const location = urlParams.get("data-location");

      return { patientId, patientName, testDate, reportDate, location };
    };

    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
        notificationText.innerText = message;
        notification.style.display = "block";

        // Hide the notification after 3 seconds (adjust the delay as needed)
        setTimeout(() => {
          notification.style.display = "none";
        }, 1000);
      }
    };

    const getCSRFToken = async () => {
      try {
        const response = await fetch("/get-csrf-token/");
        const data = await response.json();
        return data.csrf_token;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        throw error;
      }
    };

    // Show the loader before starting the PDF generation
    showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Create a function to load images and render PDF
    const loadImageAndRenderPDF = async () => {
      try {
        let graphSrc = Array.from(data.children).pop().children[0].currentSrc;
        let graphElement = document.querySelector(
          "figure.image:nth-last-of-type(1)"
        );
        graphElement.remove();

        if (data != undefined) {
          var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
          var a4Height = 841.89; // A4 height in points

          var canvasWidth = a4Width; // Adjusted width to leave some margin
          var canvasHeight = a4Height; // Adjusted height to maintain aspect ratio and leave margin

          const canvas = await html2canvas(data, {
            scale: 2, // Adjust the scale if needed for better quality
            useCORS: true, // Enable CORS to capture images from external URLs
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);

          // Calculate the image dimensions to fit within the PDF dimensions
          const canvasAspectRatio = canvas.width / canvas.height;
          const pdfAspectRatio = a4Width / a4Height;

          let pdfImageWidth = canvasWidth;
          let pdfImageHeight = canvasHeight;

          if (canvasAspectRatio > pdfAspectRatio) {
            pdfImageWidth = canvasWidth;
            pdfImageHeight = canvasWidth / canvasAspectRatio;
          } else {
            pdfImageHeight = canvasHeight;
            pdfImageWidth = canvasHeight * canvasAspectRatio;
          }

          // Calculate the positioning to center the image
          const xPosition = (pdf.internal.pageSize.width - pdfImageWidth) / 2;
          const yPosition = (pdf.internal.pageSize.height - pdfImageHeight) / 2;

          // Create a separate canvas for the rotated graph image
          const graphCanvas = document.createElement("canvas");
          graphCanvas.width = 1024;
          graphCanvas.height = 1024;
          const graphCtx = graphCanvas.getContext("2d");
          let graphImg = await this.getDataUri(graphSrc);
          const image = new Image();
          image.src = graphImg;

          await new Promise((resolve) => {
            image.onload = resolve;
          });

          graphCtx.translate(graphCanvas.width / 2, graphCanvas.height / 2);
          graphCtx.rotate(Math.PI / 2); // Rotate the image by 90 degrees
          graphCtx.drawImage(
            image,
            -graphCanvas.height / 2,
            -graphCanvas.width / 2,
            graphCanvas.height,
            graphCanvas.width
          );

          pdf.addImage(
            graphCanvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            a4Width,
            a4Height
          );

          pdf.addPage("a4", "portrait"); // Add a new portrait-oriented page
          pdf.addImage(
            imgData,
            "PNG",
            xPosition,
            yPosition,
            pdfImageWidth,
            pdfImageHeight
          );

          pdf.setTextColor(255, 255, 255);

          // Calculate the position to place the text at the bottom
          const textX = 40;
          const textY = 841.89 - 2; // 20 points from the bottom

          // If a table exists within the ck-editor__editable div, capture its text content
          if (table) {
            const tableText = table.textContent || "";

            // Add the table text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY, tableText);
          }

          // Iterate through all paragraphs in the ck-editor__editable div
          const paragraphs = data.querySelectorAll("p");
          paragraphs.forEach((paragraph) => {
            const paragraphText = paragraph.textContent || "";

            // Add each paragraph text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
          });

          // Convert the PDF to a Blob
          const pdfBlob = pdf.output("blob");

          // Extract data from URL
          const { patientId, patientName, testDate, reportDate, location } =
            extractDataFromURL();

          // Send the FormData to Django backend using fetch
          const csrfToken = await getCSRFToken();
          //console.log("CSRF Token:", csrfToken);

          // Create FormData and append the PDF Blob
          const formData = new FormData();
          formData.append(
            "pdf",
            pdfBlob,
            filename ? filename + ".pdf" : "download.pdf"
          );
          formData.append("patientId", patientId);
          formData.append("patientName", patientName);
          formData.append("testDate", testDate);
          formData.append("reportDate", reportDate);
          formData.append("location", location);

          //console.log("FormData:", formData);

          try {
            const response = await axios.post("/upload_ecg_pdf/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": csrfToken,
              },
            });

            console.log(
              "PDF successfully sent to Django backend.",
              response.data
            );
            // Hide the loader when the PDF is ready
            hideLoader();
            // Show the success notification
            showNotification("PDF successfully uploaded!");
          } catch (error) {
            console.error("Error sending PDF to Django backend.", error);
            // Show the error notification
            showNotification("Error uploading PDF. Please try again.");
          }

          //alert("Report Uploaded successfully!");

          // Save the current URL before going back in the history
          const currentURL = window.location.href;

          // Redirect to the previous page after a short delay
          await delay(200);

          // Navigate back to the previous page with a cache-busting query parameter
          window.location.href = document.referrer + "?nocache=" + Date.now();

          // Listen for the popstate event to know when the history state changes
          window.addEventListener("popstate", () => {
            // Check if the URL has changed
            if (window.location.href !== currentURL) {
              // Reload the current page after a short delay
              setTimeout(() => {
                window.location.reload(true);
              }, 200);
            }
          });
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        // Hide the loader when the PDF is ready
      }
    };

    loadImageAndRenderPDF();
  };
  //***************************************///////////////////// upload ECG pdf to database (END) ///////////////**********************************************/

  ////////////////////////////////////////////////////////////////////////// UPLOAD XRAY PDF //////////////////////////////////////////////////////////////////////////
  uploadXrayPDF = async () => {
    const showLoader = () => {
      //console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      //console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    const extractDataFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const patientId = urlParams.get("data-patientid");
      const patientName = urlParams.get("data-patientname");
      const testDate = urlParams.get("data-testdate");
      const reportDate = urlParams.get("data-reportdate");
      const location = urlParams.get("data-location");
      const institution_name = urlParams.get("data-institution_name");

      return { patientId, patientName, testDate, reportDate, location, institution_name };
    };

    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
        notificationText.innerText = message;
        notification.style.display = "block";

        // Hide the notification after 3 seconds (adjust the delay as needed)
        setTimeout(() => {
          notification.style.display = "none";
        }, 1000);
      }
    };

    const getCSRFToken = async () => {
      try {
        const response = await fetch("/get-csrf-token/");
        const data = await response.json();
        return data.csrf_token;
      } catch (error) {
        //console.error("Error fetching CSRF token:", error);
        throw error;
      }
    };

    // Show the loader before starting the PDF generation
    showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Create a function to load images and render PDF
    const loadImageAndRenderPDF = async () => {
      try {
        let graphSrc = Array.from(data.children).pop().children[0].currentSrc;
        let graphElement = document.querySelector(
          "figure.image:nth-last-of-type(1)"
        );
        graphElement.remove();

        if (data != undefined) {
          var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
          var a4Height = 841.89; // A4 height in points

          var canvasWidth = a4Width; // Adjusted width to leave some margin
          var canvasHeight = a4Height; // Adjusted height to maintain aspect ratio and leave margin

          const canvas = await html2canvas(data, {
            scale: 2, // Adjust the scale if needed for better quality
            useCORS: true, // Enable CORS to capture images from external URLs
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);

          // Calculate the image dimensions to fit within the PDF dimensions
          const canvasAspectRatio = canvas.width / canvas.height;
          const pdfAspectRatio = a4Width / a4Height;

          let pdfImageWidth = canvasWidth;
          let pdfImageHeight = canvasHeight;

          if (canvasAspectRatio > pdfAspectRatio) {
            pdfImageWidth = canvasWidth;
            pdfImageHeight = canvasWidth / canvasAspectRatio;
          } else {
            pdfImageHeight = canvasHeight;
            pdfImageWidth = canvasHeight * canvasAspectRatio;
          }

          // Calculate the positioning to center the image
          const xPosition = (pdf.internal.pageSize.width - pdfImageWidth) / 2;
          const yPosition = (pdf.internal.pageSize.height - pdfImageHeight) / 2;

          // Create a separate canvas for the rotated graph image
          const graphCanvas = document.createElement("canvas");
          graphCanvas.width = 1024;
          graphCanvas.height = 1024;
          const graphCtx = graphCanvas.getContext("2d");
          let graphImg = await this.getDataUri(graphSrc);
          const image = new Image();
          image.src = graphImg;

          await new Promise((resolve) => {
            image.onload = resolve;
          });

          graphCtx.translate(graphCanvas.width / 2, graphCanvas.height / 2);
          graphCtx.rotate(Math.PI / 2); // Rotate the image by 90 degrees
          graphCtx.drawImage(
            image,
            -graphCanvas.height / 2,
            -graphCanvas.width / 2,
            graphCanvas.height,
            graphCanvas.width
          );

          pdf.addImage(
            graphCanvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            a4Width,
            a4Height
          );

          pdf.addPage("a4", "portrait"); // Add a new portrait-oriented page
          pdf.addImage(
            imgData,
            "PNG",
            xPosition,
            yPosition,
            pdfImageWidth,
            pdfImageHeight
          );

          pdf.setTextColor(255, 255, 255);

          // Calculate the position to place the text at the bottom
          const textX = 40;
          const textY = 841.89 - 2; // 20 points from the bottom

          // If a table exists within the ck-editor__editable div, capture its text content
          if (table) {
            const tableText = table.textContent || "";

            // Add the table text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY, tableText);
          }

          // Iterate through all paragraphs in the ck-editor__editable div
          const paragraphs = data.querySelectorAll("p");
          paragraphs.forEach((paragraph) => {
            const paragraphText = paragraph.textContent || "";

            // Add each paragraph text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
          });

          // Convert the PDF to a Blob
          const pdfBlob = pdf.output("blob");

          // Extract data from URL
          const { patientId, patientName, testDate, reportDate, location, institution_name } =
            extractDataFromURL();

          // Send the FormData to Django backend using fetch
          const csrfToken = await getCSRFToken();
          //console.log("CSRF Token:", csrfToken);

          // Create FormData and append the PDF Blob
          const formData = new FormData();
          formData.append(
            "pdf",
            pdfBlob,
            filename ? filename + ".pdf" : "download.pdf"
          );
          formData.append("patientId", patientId);
          formData.append("patientName", patientName);
          formData.append("testDate", testDate);
          formData.append("reportDate", reportDate);
          formData.append("location", location);
          formData.append("institution_name", institution_name);

          //console.log("FormData:", formData);

          try {
            const response = await axios.post("/upload_xray_pdf/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": csrfToken,
              },
            });

            // AFTER SUCCESSFUL PDF UPLOAD - TRIGGER ISDONE UPDATE
            const urlSearchParams = new URLSearchParams(window.location.search);
            const studyId = urlSearchParams.get("data-study-id");

            const updateResponse = await fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
              },
              body: JSON.stringify({ isDone: true }),
            });

            if (updateResponse.ok) {
              this.setState({ isDone: true }, () => {
                this.handleClick();
              });
            } else {
              console.error('Failed to update isDone status');
            }

            console.log(
              "PDF successfully sent to Django backend.",
              response.data
            );
            // Hide the loader when the PDF is ready
            hideLoader();
            // Show the success notification
            showNotification("PDF successfully uploaded!");
          } catch (error) {
            console.error("Error sending PDF to Django backend.", error);
            // Show the error notification
            showNotification("Error uploading PDF. Please try again.");
          }

          // Save the current URL before going back in the history
          const currentURL = window.location.href;

          // Redirect to the previous page after a short delay
          await delay(200);

          // Navigate back to the previous page with a cache-busting query parameter
          window.location.href = document.referrer + "?nocache=" + Date.now();

          // Listen for the popstate event to know when the history state changes
          window.addEventListener("popstate", () => {
            // Check if the URL has changed
            if (window.location.href !== currentURL) {
              // Reload the current page after a short delay
              setTimeout(() => {
                window.location.reload(true);
              }, 200);
            }
          });
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        // Hide the loader when the PDF is ready
      }
    };

    loadImageAndRenderPDF();
  };
  //***************************************///////////////////// upload split XRAY pdf to database (END) ///////////////**********************************************/

////////////////////////////////// Upload XRAY PDF without IMAGE (START) ////////////////////////
//   UploadDivContentOnPDFWithoutImage() {
//     (async () => {
//       this.showLoader();
//       const filename = this.createFilename();
//       const data = document.getElementsByClassName("ck-editor__editable")[0];
//       console.log("This is the data i got from the class :",data);
//       const dataFromId = document.getElementById("reportEditor");
//       console.log("This is the data i got from the id reportEditor :", dataFromId);

//       const { location, accession, institution_name } = this.extractDataFromURL();
      
//       const images = data.querySelectorAll("img");
//       const signatureElement = images[1];
//       const signatureUrl = signatureElement ? signatureElement.src : null;
//       const logoElement = images[0];
//       const logoUrl = logoElement ? logoElement.src : null;
//       console.log("This is the signature Url:", signatureUrl);
//       console.log("This is the logo Url:", logoUrl);
//       // This is my new logic to add each captured image on the pdf. - Himanshu.
//       // The following code will convert the images nodelist to a array like thing (not actual array, a shallow array like object)
//       // I have done this so that i can directly use the slice method to remove the logo and sign from the images, and pass only 
//       // remaining required images at the end to reduce the time complexity.
//       const remainingReportImages = Array.prototype.slice.call(images, 2);

//       // Getting the table data from my function.
//       // Destructuring the object data , that's why first assigned it to tableData, instead of directly using it.
      
//       console.log("This is my extracted table data :",tableData);

//       // Getting all the children elements of the data (ckeditor content).
//       const elements = data.children;
//       // This is the variable to handle the skipping of elemens(if needed).
//       let skipNext = false;

//       const pdf = new jsPDF("p", "pt", "a4");

//       let currentYPosition = 40;

//       try {
//           currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

//                 // Example usage.
// const tableData = this.extractTableData(data);
// const { patientId, patientName, age, gender, testDate, reportDate, referralDr, reportTime } = tableData;
// console.log("Extracted Table Data:", tableData);

// const tableContent = [
//     ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
//     ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
//     ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"],
//     ["Referral Dr:", referralDr || "N/A", "Report Time:", reportTime || "N/A"]
// ];

// // Add patient details to PDF.
// pdf.autoTable({
//     startY: currentYPosition,
//     body: tableContent,
//     theme: "grid",
//     styles: { cellPadding: 3, fontSize: 10 },
// });
//           currentYPosition = pdf.previousAutoTable.finalY + 20;

//           // Looping through each element inside the CKEditor.
//           for (let i = 0; i < elements.length; i++) {
//             const element = elements[i];
//             console.log("These are individual children elements of data :",element);
//             if (element.tagName === 'P') {
//               const isHeading = element.querySelector('strong u'); // Check if heading (bold + underline)
//               if (isHeading) {
//                   // Add heading
//                   currentYPosition = this.addParagraphToPdf(pdf, element, 13, true, currentYPosition);
//               } else {
//                   // Check if it's a "Dr." line and needs signature
//                   if (element.textContent.includes("Dr.")) {
//                       // Add signature first
//                       currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
//                   }

//                   // Splitting paragraphs based on <br> tags and processing each line
//                   // const lines = this.splitParagraphIntoLines(element);

//                   // Regular paragraph
//                   currentYPosition = this.addParagraphToPdf(pdf, element, 12, false, currentYPosition);
//               }
//             }
//           }
          
//           // Adding the data to blob to send it to backend.
//           const pdfBlob = pdf.output("blob");

//           try {
//             const csrfToken = await this.getCSRFToken();
//             const formData = new FormData();
//             formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
//             formData.append("patientId", patientId);
//             formData.append("patientName", patientName);
//             formData.append("age", age);
//             formData.append("gender", gender);
//             formData.append("testDate", testDate);
//             formData.append("reportDate", reportDate);
//             formData.append("location", location);
//             formData.append("accession", accession);
//             formData.append("institution_name", institution_name);

//             await axios.post("/upload_xray_pdf/", formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                     "X-CSRFToken": csrfToken,
//                 },
//             });

//             // AFTER SUCCESSFUL PDF UPLOAD - TRIGGER ISDONE UPDATE
//             const urlSearchParams = new URLSearchParams(window.location.search);
//             const studyId = urlSearchParams.get("data-study-id");

//             const updateResponse = await fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': csrfToken,
//               },
//               body: JSON.stringify({ isDone: true }),
//             });

//             if (updateResponse.ok) {
//               this.setState({ isDone: true }, () => {
//                 this.handleClick();
//               });
//             } else {
//               console.error('Failed to update isDone status');
//             }

//             console.log("PDF successfully sent to Django backend.");
//               this.showNotification("PDF successfully uploaded!");
//           } catch (error) {
//               console.error("Error sending PDF to Django backend.", error);
//               this.showNotification("Error uploading PDF. Please try again.");
//           }

//           const currentURL = window.location.href;

//           setTimeout(() => {
//               window.location.href = document.referrer + "?nocache=" + Date.now();
//           }, 200);

//           window.addEventListener("popstate", () => {
//               if (window.location.href !== currentURL) {
//                   setTimeout(() => {
//                       window.location.reload(true);
//                   }, 200);
//               }
//           });

//       } catch (error) {
//           console.error("Error generating PDF:", error);
//           // this.showNotification("Error generating PDF. Please try again.");
//       } finally {
//           this.hideLoader();
//       }
//     })();
//   }
UploadDivContentOnPDFWithoutImage() {
  (async () => {
    try {
      this.showLoader();
      const filename = this.createFilename();
      const editorContent = document.getElementsByClassName("ck-editor__editable")[0];
      
      if (!editorContent) {
        throw new Error('CKEditor content not found');
      }

      const { location, accession, institution_name } = this.extractDataFromURL();
      
      // Get all images including captured ones
      const images = editorContent.querySelectorAll("img");
      const signatureElement = images[1];
      const signatureUrl = signatureElement ? signatureElement.src : null;
      const logoElement = images[0];
      const logoUrl = logoElement ? logoElement.src : null;
      
      // Extract remaining images (captured ones)
      const remainingReportImages = Array.prototype.slice.call(images, 2);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
        compress: true, // Enable compression
      });

      let currentYPosition = 40;

      // Add logo if exists
      if (logoUrl) {
        currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);
      }

      // Add table data
      const tableData = this.extractTableData(editorContent);
      if (Object.keys(tableData).length > 0) {
        const { patientId, patientName, age, gender, testDate, reportDate, referralDr, reportTime } = tableData;
        const tableContent = [
          ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
          ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
          ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"],
          ["Referral Dr:", referralDr || "N/A", "Report Time:", reportTime || "N/A"]
        ];

        currentYPosition += 20;

        pdf.autoTable({
          startY: currentYPosition,
          body: tableContent,
          theme: "grid",
          styles: { cellPadding: 3, fontSize: 10 },
        });
        currentYPosition = pdf.previousAutoTable.finalY + 20;
      }

      // Process main content
      const content = this.extractContent(editorContent);
      if (content) {
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            let text = line;
            let isBold = false;

            // Extract bold sections
            const boldMatches = text.match(/\[BOLD\](.*?)\[\/BOLD\]/g);
            if (boldMatches) {
              isBold = true;
              text = text.replace(/\[BOLD\](.*?)\[\/BOLD\]/g, '$1');
            }

            // Check for bullet points
            const isBullet = text.startsWith('•');
            if (isBullet) {
              text = text.substring(1).trim();
              currentYPosition += 5;
            }

            // Add signature if it's a doctor's line
            if (text.includes("Dr.") && signatureUrl) {
              currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
            }

            // Set font based on formatting
            pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
            pdf.setFontSize(12);
            
            const splitText = pdf.splitTextToSize(text, pdf.internal.pageSize.width - (isBullet ? 100 : 80));
            
            if (currentYPosition + (splitText.length * 15) > pdf.internal.pageSize.height - 40) {
              pdf.addPage();
              currentYPosition = 40;
            }

            // Add bullet point if needed
            if (isBullet) {
              pdf.text('•', 60, currentYPosition);
              pdf.text(splitText, 80, currentYPosition);
            } else {
              pdf.text(splitText, 40, currentYPosition);
            }
            
            currentYPosition += splitText.length * 15;
          }
        }
      }

      // Add captured images
      for (const image of remainingReportImages) {
        const imageUrl = image ? image.src : null;
        if (imageUrl) {
          currentYPosition = await this.addReportImage(pdf, imageUrl, currentYPosition);
        }
      }

      // Convert and upload PDF
      const pdfBlob = pdf.output("blob", { compress: true });
      const csrfToken = await this.getCSRFToken();
      const formData = new FormData();
      formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
      formData.append("patientId", tableData.patientId);
      formData.append("patientName", tableData.patientName);
      formData.append("age", tableData.age);
      formData.append("gender", tableData.gender);
      formData.append("testDate", tableData.testDate);
      formData.append("reportDate", tableData.reportDate);
      formData.append("location", location);
      formData.append("accession", accession);
      formData.append("institution_name", institution_name);

      await axios.post("/upload_xray_pdf/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken,
        },
      });

      // Update isDone status
      const urlSearchParams = new URLSearchParams(window.location.search);
      const studyId = urlSearchParams.get("data-study-id");

      const updateResponse = await fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ isDone: true }),
      });

      if (updateResponse.ok) {
        this.setState({ isDone: true }, () => {
          this.handleClick();
        });
      } else {
        console.error('Failed to update isDone status');
      }

      this.showNotification("PDF successfully uploaded!");

      // Handle navigation
      const currentURL = window.location.href;
      setTimeout(() => {
        window.location.href = document.referrer + "?nocache=" + Date.now();
      }, 200);

      window.addEventListener("popstate", () => {
        if (window.location.href !== currentURL) {
          setTimeout(() => {
            window.location.reload(true);
          }, 200);
        }
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      this.showNotification("Error uploading PDF. Please try again.");
    } finally {
      this.hideLoader();
    }
  })();
}


  UploadDivContentOnPDF() {
    (async () => {
      this.showLoader();
      const filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      //console.log("This is the data i got from the class :",data);
      const dataFromId = document.getElementById("reportEditor");
      //console.log("This is the data i got from the id reportEditor :", dataFromId);

      const { location, accession, institutionName } = this.extractDataFromURL();
      
      const images = data.querySelectorAll("img");
      const signatureElement = images[1];
      const signatureUrl = signatureElement ? signatureElement.src : null;
      const logoElement = images[0];
      const logoUrl = logoElement ? logoElement.src : null;
      //console.log("This is the signature Url:", signatureUrl);
      //console.log("This is the logo Url:", logoUrl);
      // This is my new logic to add each captured image on the pdf. - Himanshu.
      // The following code will convert the images nodelist to a array like thing (not actual array, a shallow array like object)
      // I have done this so that i can directly use the slice method to remove the logo and sign from the images, and pass only 
      // remaining required images at the end to reduce the time complexity.
      const remainingReportImages = Array.prototype.slice.call(images, 2);

      // Getting the table data from my function.
      // Destructuring the object data , that's why first assigned it to tableData, instead of directly using it.
      const tableData = this.extractTableData(data);
      const { patientId, patientName, age, gender, testDate, reportDate, referralDr, reportTime } = tableData;
      //console.log("This is my extracted table data :",tableData);

      // Getting all the children elements of the data (ckeditor content).
      const elements = data.children;
      // This is the variable to handle the skipping of elemens(if needed).
      let skipNext = false;

      //const pdf = new jsPDF("p", "pt", "a4", true);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
        compress: true, // Enables compression
      });

      let currentYPosition = 40;

      try {
          currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

          const tableContent = [
            ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
            ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
            ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"],
            ["Referral Dr:", referralDr || "N/A", "Report Time:", reportTime || "N/A"]
        ];
        

          currentYPosition += 20;

          pdf.autoTable({
            startY: currentYPosition,
            body: tableContent,
            theme: "grid",
            styles: { cellPadding: 3, fontSize: 10 },
        });
          currentYPosition = pdf.previousAutoTable.finalY + 20;

          // Looping through each element inside the CKEditor.
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            //console.log("These are individual children elements of data :",element);
            if (element.tagName === 'P') {
              const isHeading = element.querySelector('strong u'); // Check if heading (bold + underline)
              if (isHeading) {
                  // Add heading
                  currentYPosition = this.addParagraphToPdf(pdf, element, 13, true, currentYPosition);
              } else {
                  // Check if it's a "Dr." line and needs signature
                  if (element.textContent.includes("Dr.")) {
                      // Add signature first
                      currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                  }

                  // Splitting paragraphs based on <br> tags and processing each line
                  // const lines = this.splitParagraphIntoLines(element);

                  // Regular paragraph
                  currentYPosition = this.addParagraphToPdf(pdf, element, 12, false, currentYPosition);
              }
            }
          }

          // Passing the remaining images instead of the url fetched image directly to add all captured images.
          for (const image of remainingReportImages) {
            const imageUrl = image ? image.src : null;
            console.log("This is the image Url:", imageUrl);
            currentYPosition = await this.addReportImage(pdf, imageUrl, currentYPosition);
          }
          // Adding the data to blob to send it to backend.
          const pdfBlob = pdf.output("blob", { compress: true });

          try {
            const csrfToken = await this.getCSRFToken();
            const formData = new FormData();
            formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
            formData.append("patientId", patientId);
            formData.append("patientName", patientName);
            formData.append("age", age);
            formData.append("gender", gender);
            formData.append("testDate", testDate);
            formData.append("reportDate", reportDate);
            formData.append("location", location);
            formData.append("accession", accession);
            formData.append("institution_name", institutionName);
            await axios.post("/upload_xray_pdf/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-CSRFToken": csrfToken,
                },
            });

            // AFTER SUCCESSFUL PDF UPLOAD - TRIGGER ISDONE UPDATE
            const urlSearchParams = new URLSearchParams(window.location.search);
            const studyId = urlSearchParams.get("data-study-id");

            const updateResponse = await fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
              },
              body: JSON.stringify({ isDone: true }),
            });

            if (updateResponse.ok) {
              this.setState({ isDone: true }, () => {
                this.handleClick();
              });
            } else {
              console.error('Failed to update isDone status');
            }

            //console.log("PDF successfully sent to Django backend.");
              this.showNotification("PDF successfully uploaded!");
          } catch (error) {
              //console.error("Error sending PDF to Django backend.", error);
              this.showNotification("Error uploading PDF. Please try again.");
          }

          const currentURL = window.location.href;

          setTimeout(() => {
              window.location.href = document.referrer + "?nocache=" + Date.now();
          }, 200);

          window.addEventListener("popstate", () => {
              if (window.location.href !== currentURL) {
                  setTimeout(() => {
                      window.location.reload(true);
                  }, 200);
              }
          });

      } catch (error) {
          console.error("Error generating PDF:", error);
          this.showNotification("Error generating PDF. Please try again.");
      } finally {
          this.hideLoader();
      }
    })();
  }


  // UploadDivContentOnPDF() {
  //   (async () => {
  //     this.showLoader();
  //     const filename = this.createFilename();
  //     const data = document.getElementsByClassName("ck-editor__editable")[0];
  //     const { location, accession, institutionName } = this.extractDataFromURL();
  
  //     // Image optimization function
  //     const optimizeImage = async (imageUrl, maxWidth = 800, quality = 0.7) => {
  //       return new Promise((resolve) => {
  //         const img = new Image();
  //         img.src = imageUrl;
  //         img.onload = () => {
  //           const canvas = document.createElement('canvas');
  //           const scale = Math.min(maxWidth / img.width, 1);
  //           canvas.width = img.width * scale;
  //           canvas.height = img.height * scale;
  //           const ctx = canvas.getContext('2d');
  //           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //           resolve(canvas.toDataURL('image/jpeg', quality));
  //         };
  //       });
  //     };
  
  //     // Process all images
  //     const images = data.querySelectorAll("img");
  //     const [logoElement, signatureElement, ...reportImgElements] = images;
      
  //     const logoUrl = logoElement ? await optimizeImage(logoElement.src) : null;
  //     const signatureUrl = signatureElement ? await optimizeImage(signatureElement.src) : null;
  //     const reportImages = await Promise.all(
  //       Array.from(reportImgElements).map(img => optimizeImage(img.src))
  //     );
  
  //     // Initialize PDF with compression
  //     const pdf = new jsPDF({
  //       orientation: "p",
  //       unit: "pt",
  //       format: "a4",
  //       compress: true,
  //     });
  
  //     let currentYPosition = 40;
  
  //     // Add logo
  //     if (logoUrl) {
  //       const logoImg = await new Promise(resolve => {
  //         const img = new Image();
  //         img.src = logoUrl;
  //         img.onload = () => resolve(img);
  //       });
  //       const logoWidth = Math.min(logoImg.width, 200);
  //       const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
  //       pdf.addImage(logoImg, "JPEG", 20, currentYPosition, logoWidth, logoHeight);
  //       currentYPosition += logoHeight + 20;
  //     }
  
  //     // Add patient table
  //     const tableData = this.extractTableData(data);
  //     const { patientId, patientName, age, gender, testDate, reportDate } = tableData;
      
  //     pdf.autoTable({
  //       startY: currentYPosition,
  //       body: [
  //         ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
  //         ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
  //         ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
  //       ],
  //       theme: 'grid',
  //       styles: { fontSize: 10, cellPadding: 3 },
  //       margin: { horizontal: 10 }
  //     });
  //     currentYPosition = pdf.previousAutoTable.finalY + 20;
  
  //     // Process editor content
  //     for (const element of data.children) {
  //       if (element.tagName === 'P') {
  //         const isHeading = element.querySelector('strong u');
  //         const isSignatureLine = element.textContent.includes("Dr.");
  
  //         if (isHeading) {
  //           pdf.setFontSize(13);
  //           pdf.setFont("helvetica", "bold");
  //           pdf.text(element.textContent, 20, currentYPosition);
  //           currentYPosition += 20;
  //         } else if (isSignatureLine) {
  //           if (signatureUrl) {
  //             const sigImg = await new Promise(resolve => {
  //               const img = new Image();
  //               img.src = signatureUrl;
  //               img.onload = () => resolve(img);
  //             });
  //             const sigWidth = Math.min(sigImg.width, 120);
  //             const sigHeight = (sigImg.height * sigWidth) / sigImg.width;
  //             pdf.addImage(sigImg, "JPEG", 20, currentYPosition, sigWidth, sigHeight);
  //             currentYPosition += sigHeight + 20;
  //           }
  //         } else {
  //           pdf.setFontSize(12);
  //           pdf.setFont("helvetica", "normal");
  //           const splitText = pdf.splitTextToSize(element.textContent, pdf.internal.pageSize.width - 40);
  //           pdf.text(splitText, 20, currentYPosition);
  //           currentYPosition += splitText.length * 15 + 10;
  //         }
  //       }
  //     }
  
  //     // Add report images
  //     for (const imgUrl of reportImages) {
  //       const img = await new Promise(resolve => {
  //         const image = new Image();
  //         image.src = imgUrl;
  //         image.onload = () => resolve(image);
  //       });
        
  //       const pageWidth = pdf.internal.pageSize.width - 40;
  //       const scale = Math.min(pageWidth / img.width, 1);
  //       const imgWidth = img.width * scale;
  //       const imgHeight = img.height * scale;
  
  //       if (currentYPosition + imgHeight > pdf.internal.pageSize.height) {
  //         pdf.addPage();
  //         currentYPosition = 20;
  //       }
  
  //       pdf.addImage(img, "JPEG", 20, currentYPosition, imgWidth, imgHeight);
  //       currentYPosition += imgHeight + 20;
  //     }
  
  //     // Finalize and upload
  //     const pdfBlob = pdf.output("blob");
  //     const formData = new FormData();
  //     formData.append("pdf", pdfBlob, `${filename}.pdf`);
  //     formData.append("patientId", patientId);
  //     // ... append other fields ...
  //     formData.append("patientName", patientName);
  //     formData.append("age", age);
  //     formData.append("gender", gender);
  //     formData.append("testDate", testDate);
  //     formData.append("reportDate", reportDate);
  //     formData.append("location", location);
  //     formData.append("accession", accession);
  //     formData.append("institution_name", institutionName);
  
  //     try {
  //       await axios.post("/upload_xray_pdf/", formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           "X-CSRFToken": await this.getCSRFToken(),
  //         }
  //       });
  //       this.showNotification("PDF uploaded successfully!");
  //     } catch (error) {
  //       console.error("Upload failed:", error);
  //       this.showNotification("Upload failed. Please try again.");
  //     } finally {
  //       this.hideLoader();
  //     }
  //   })();
  // }

  
  //////////////////// Upload XRAY PDF with IMAGE (END) ////////////////////////////////////


  ////////////////////////////////// Upload VITALS PDF without IMAGE (START) ////////////////////////
  UploadDivContentOnPDFVitals() {
    const showLoader = () => {
      console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    const extractDataFromURL = () => {
      const patientId = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const patientName = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
      )?.innerHTML;
      const testDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const reportDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(3) > span > strong"
      )?.innerHTML;

      return { patientId, patientName, testDate, reportDate };
    };

    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
        notificationText.innerText = message;
        notification.style.display = "block";

        // Hide the notification after 3 seconds (adjust the delay as needed)
        setTimeout(() => {
          notification.style.display = "none";
        }, 1000);
      }
    };

    const getCSRFToken = async () => {
      try {
        const response = await fetch("/get-csrf-token/");
        const data = await response.json();
        return data.csrf_token;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        throw error;
      }
    };
    // Show the loader before starting the PDF generation
    showLoader();
    var filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (data != undefined) {
      var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
      var a4Height = 841.89; // A4 height in points

      var canvasWidth = a4Width - 40; // Adjusted width to leave some margin

      html2canvas(data, {
        scale: 4, // Adjust the scale if needed for better quality
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
      }).then(async (canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);

        // Calculate the height based on the aspect ratio of the captured image
        const canvasHeight = (canvasWidth / canvas.width) * canvas.height;

        // Hide the loader when the PDF is ready
        hideLoader();

        // Create PDF with only the captured content
        const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
        pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);

        pdf.setTextColor(255, 255, 255);

        // Calculate the position to place the text at the bottom
        const textX = 40;
        const textY = 841.89 - 2; // 20 points from the bottom

        // If a table exists within the ck-editor__editable div, capture its text content
        if (table) {
          const tableText = table.textContent || "";

          // Add the table text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY, tableText);
        }

        // Iterate through all paragraphs in the ck-editor__editable div
        const paragraphs = data.querySelectorAll("p");
        paragraphs.forEach((paragraph) => {
          const paragraphText = paragraph.textContent || "";

          // Add each paragraph text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
        });

        // Convert the PDF to a Blob
        const pdfBlob = pdf.output("blob");

        // Extract data from URL
        const { patientId, patientName, testDate, reportDate } =
          extractDataFromURL();

        // Send the FormData to Django backend using fetch
        const csrfToken = await getCSRFToken();
        console.log("CSRF Token:", csrfToken);

        // Create FormData and append the PDF Blob
        const formData = new FormData();
        formData.append(
          "pdf",
          pdfBlob,
          filename ? filename + ".pdf" : "download.pdf"
        );
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("testDate", testDate);
        formData.append("reportDate", reportDate);

        console.log("FormData:", formData);

        try {
          const response = await axios.post("/upload_vitals_pdf/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRFToken": csrfToken,
            },
          });

          console.log(
            "PDF successfully sent to Django backend.",
            response.data
          );
          // Hide the loader when the PDF is ready
          hideLoader();
          // Show the success notification
          showNotification("PDF successfully uploaded!");
        } catch (error) {
          console.error("Error sending PDF to Django backend.", error);
          // Show the error notification
          showNotification("Error uploading PDF. Please try again.");
        }

        // Reload the current page after a short delay
        setTimeout(() => {
          window.location.reload(true);
        }, 200);
      });
    }
  }
  ////////////////////////////////// Upload Vitals PDF without IMAGE (END) ////////////////////////


    ////////////////////////////////// Upload OPtometry PDF without IMAGE (START) ////////////////////////
    UploadDivContentOnPDFOptometry() {
      const showLoader = () => {
        console.log("Showing loader");
        const loader = document.querySelector(".loader");
        if (loader) {
          loader.style.display = "block";
        }
      };
  
      const hideLoader = () => {
        console.log("Hiding loader");
        const loader = document.querySelector(".loader");
        if (loader) {
          loader.style.display = "none";
        }
      };
  
      const extractDataFromURL = () => {
        const patientId = document.querySelector(
          "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
        )?.innerHTML;
        const patientName = document.querySelector(
          "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
        )?.innerHTML;
        const testDate = document.querySelector(
          "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(2) > span > strong"
        )?.innerHTML;
        const reportDate = document.querySelector(
          "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(3) > span > strong"
        )?.innerHTML;
  
        return { patientId, patientName, testDate, reportDate };
      };
  
      const showNotification = (message) => {
        const notification = document.getElementById("notification");
        const notificationText = document.getElementById("notification-text");
  
        if (notification && notificationText) {
          notificationText.innerText = message;
          notification.style.display = "block";
  
          // Hide the notification after 3 seconds (adjust the delay as needed)
          setTimeout(() => {
            notification.style.display = "none";
          }, 1000);
        }
      };
  
      const getCSRFToken = async () => {
        try {
          const response = await fetch("/get-csrf-token/");
          const data = await response.json();
          return data.csrf_token;
        } catch (error) {
          console.error("Error fetching CSRF token:", error);
          throw error;
        }
      };
      // Show the loader before starting the PDF generation
      showLoader();
      var filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      const table = data.querySelector("table");
      data.classList.add("ck-blurred");
      data.classList.remove("ck-focused");
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
      if (data != undefined) {
        var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
        var a4Height = 841.89; // A4 height in points
  
        var canvasWidth = a4Width - 40; // Adjusted width to leave some margin
  
        html2canvas(data, {
          scale: 4, // Adjust the scale if needed for better quality
          windowWidth: document.body.scrollWidth,
          windowHeight: document.body.scrollHeight,
        }).then(async (canvas) => {
          const imgData = canvas.toDataURL("image/png", 1.0);
  
          // Calculate the height based on the aspect ratio of the captured image
          const canvasHeight = (canvasWidth / canvas.width) * canvas.height;
  
          // Hide the loader when the PDF is ready
          hideLoader();
  
          // Create PDF with only the captured content
          const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
          pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);
  
          pdf.setTextColor(255, 255, 255);
  
          // Calculate the position to place the text at the bottom
          const textX = 40;
          const textY = 841.89 - 2; // 20 points from the bottom
  
          // If a table exists within the ck-editor__editable div, capture its text content
          if (table) {
            const tableText = table.textContent || "";
  
            // Add the table text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY, tableText);
          }
  
          // Iterate through all paragraphs in the ck-editor__editable div
          const paragraphs = data.querySelectorAll("p");
          paragraphs.forEach((paragraph) => {
            const paragraphText = paragraph.textContent || "";
  
            // Add each paragraph text as text (preserve original formatting)
            pdf.setFontSize(2); // Adjust the font size as needed
            pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
          });
  
          // Convert the PDF to a Blob
          const pdfBlob = pdf.output("blob");
  
          // Extract data from URL
          const { patientId, patientName, testDate, reportDate } =
            extractDataFromURL();
  
          // Send the FormData to Django backend using fetch
          const csrfToken = await getCSRFToken();
          console.log("CSRF Token:", csrfToken);
  
          // Create FormData and append the PDF Blob
          const formData = new FormData();
          formData.append(
            "pdf",
            pdfBlob,
            filename ? filename + ".pdf" : "download.pdf"
          );
          formData.append("patientId", patientId);
          formData.append("patientName", patientName);
          formData.append("testDate", testDate);
          formData.append("reportDate", reportDate);
  
          console.log("FormData:", formData);
  
          try {
            const response = await axios.post("/upload_optometry_pdf/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": csrfToken,
              },
            });
  
            console.log(
              "PDF successfully sent to Django backend.",
              response.data
            );
            // Hide the loader when the PDF is ready
            hideLoader();
            // Show the success notification
            showNotification("PDF successfully uploaded!");
          } catch (error) {
            console.error("Error sending PDF to Django backend.", error);
            // Show the error notification
            showNotification("Error uploading PDF. Please try again.");
          }
  
          // Reload the current page after a short delay
          setTimeout(() => {
            window.location.reload(true);
          }, 200);
        });
      }
    }
    ////////////////////////////////// Upload Optometry PDF without IMAGE (END) ////////////////////////



  //////////////////////////////////////////////////////////////
  toDataURL(url, index, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(index, reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  Export2Doc() {
    var filename = this.createFilename();
    console.log("printig word");
    const data = document.getElementsByClassName("ck-editor__editable")[0];

    var imgs = data.getElementsByTagName("img");
    console.log(...imgs);
    for (var i = 0; i < imgs.length; i++) {
      this.toDataURL(imgs[i].src, i, function (index, data) {
        console.log(imgs[index].src + "==>" + data);
        imgs[index].src = data;
      });
    }
    var element = data;
    console.log(data);
    //  _html_ will be replace with custom html
    var meta =
      "Mime-Version: 1.0\nContent-Base: " +
      location.href +
      '\nContent-Type: Multipart/related; boundary="NEXT.ITEM-BOUNDARY";type="text/html"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset="utf-8"\nContent-Location: ' +
      location.href +
      "\n\n<!DOCTYPE html>\n<html>\n_html_</html>";
    //  _styles_ will be replaced with custome css
    var head =
      '<head>\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<style>\n_styles_\n</style>\n</head>\n';

    var html = data.innerHTML;

    var blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    var css =
      "<style>" +
      "img {width:300px;}table {border-collapse: collapse; border-spacing: 0;}td{padding: 6px;}" +
      "</style>";
    //  Image Area %%%%
    var options = { maxWidth: 624 };
    var images = Array();
    var img = data.getElementsByTagName("img");
    for (var i = 0; i < img.length; i++) {
      // Calculate dimensions of output image
      var w = Math.min(img[i].width, options.maxWidth);
      var h = img[i].height * (w / img[i].width);
      // Create canvas for converting image to data URL
      var canvas = document.createElement("CANVAS");
      canvas.width = w;
      canvas.height = h;
      // Draw image to canvas
      var context = canvas.getContext("2d");
      context.drawImage(img[i], 0, 0, w, h);
      // Get data URL encoding of image
      var uri = canvas.toDataURL("image/png");
      //$(img[i]).attr("src", img[i].src);
      img[i].src = img[i].src;
      img[i].width = w;
      img[i].height = h;
      // Save encoded image to array
      images[i] = {
        type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
        encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
        location: img[i].src, //$(img[i]).attr("src"),
        data: uri.substring(uri.indexOf(",") + 1),
      };
    }

    // Prepare bottom of mhtml file with image data
    var imgMetaData = "\n";
    for (var i = 0; i < images.length; i++) {
      imgMetaData += "--NEXT.ITEM-BOUNDARY\n";
      imgMetaData += "Content-Location: " + images[i].location + "\n";
      imgMetaData += "Content-Type: " + images[i].type + "\n";
      imgMetaData +=
        "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
      imgMetaData += images[i].data + "\n\n";
    }
    imgMetaData += "--NEXT.ITEM-BOUNDARY--";
    // end Image Area %%

    var output =
      meta.replace("_html_", head.replace("_styles_", css) + html) +
      imgMetaData;

    var url =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(output);

    filename = filename ? filename + ".doc" : "document.doc";

    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
    }

    document.body.removeChild(downloadLink);
  }

  GetDivContentOnWord() {
    var filename = this.createFilename();
    console.log("printig word");
    const data = document.getElementsByClassName("ck-editor__editable")[0];

    var imgs = data.getElementsByTagName("img");
    console.log(...imgs);
    for (var i = 0; i < imgs.length; i++) {
      this.toDataURL(imgs[i].src, i, function (index, data) {
        console.log(imgs[index].src + "==>" + data);
        imgs[index].src = data;
      });
    }
    console.log(data);

    var css =
      "<style>" +
      "@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}" +
      "div.WordSection1 {page: WordSection1;}" +
      "</style>";
    var preHTML =
      "<html xlmns:o='url:schemas-microsoft-com:office:office' xmlns:w='url:schemas-microsoft-com:office:word' xmlns='http://www.w3.org /TR/REC-html40'<head><meta charset='utf-8'><title>Word</title>" +
      css +
      "</head><body>";
    var postHTML = "</body></html>";
    var html = preHTML + data.innerHTML + postHTML;

    var blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    var url =
      "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

    filename = filename ? filename + ".doc" : "document.doc";

    var link = document.createElement("a");
    document.body.appendChild(link);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      link.href = url;
      link.download = filename;
      link.click();
    }
    document.body.removeChild(link);
  }

  ActionEvents(evt) {
    let nindex = evt.target.selectedIndex;
    let label = evt.target[nindex].text;
    let value = evt.target.value;
    console.log("Selected Index:", nindex);
    console.log("Selected Label:", label);
    console.log("Selected Value:", value);
    switch (value) {
      case "1":
        console.log("pdf");
        this.GetDivContentOnPDFWithoutImage();
        break;
      case "2":
        console.log("pdf");
        this.GetDivContentOnPDF();
        break;
      case "3":
        console.log("pdf");
        this.GetEcgContentOnPDF();
        break;
      case "4":
        this.Export2Doc();
        break;
      case "5":
        this.printReport();
        break;
      case "6":
        this.uploadEcgPDF();
        break;
      case "7":
        console.log("Double page pdf uploaded");
        this.uploadXrayPDF();
        break;
      case "8":
        console.log("Single page pdf without image uploaded");
        this.UploadDivContentOnPDFWithoutImage();
        break;
      case "9":
        console.log("Single page pdf with image uploaded");
        this.UploadDivContentOnPDF();
        break;
      case "10":
        console.log("Vitals Report pdf");
        this.UploadDivContentOnPDFVitals();
        break;
      case "11":
        console.log("Optometry Report pdf");
        this.UploadDivContentOnPDFOptometry();
        break;
      default:
        console.log("---");
        break;
    }
    //document.getElementById("export_data").selectedIndex = 0;
    evt.target.selectedIndex = 0;
  }

  handleSeletion(evt) {
    let nindex = evt.target.selectedIndex;
    let label = evt.target[nindex].text;
    let value = evt.target.value;
    this.setState({
      options_label: label,
      reportFrmData: this.generatePatientTable(),
    });
    options.forEach(({ label, id }) => {
      if (value == id) {
        this.handleClick();
      }
    });
  }

  
  render() {
    const { data, handleClick, name } = this.props;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const { options_label, reportFrmData } = this.state;
    const { isDiv2Visible} = this.state;
   
      return (
      <div>
          <div className="document-editor">
        <div className="document-editor__toolbar">
        </div>
        <div className="page-content" id='page-content'>
          <div  className='cornerstone-container'>
          <div className='tools'>
{/*Button for enabling Zoom tool */}
<div className="button-container"><button className='tool-button' value='Zoom'
onClick={e => this.toggleTool(e.target.value)}> <AiOutlineZoomIn size={25} /> {/* Adjust size as 
needed */}Zoom</button></div>

<div className="button-container"><button className='tool-button' value='Crosshairs'
onClick={e => this.toggleTool(e.target.value)}> <AiOutlineZoomIn size={25} /> {/* Adjust size as 
needed */}3*1 oblique mpr</button></div>
<div className="button-container">
  <button className='tool-button' value='ReferenceLines' onClick={e => this.toggleTool(e.target.value)}>
    📐 Reference Lines
  </button>
</div>

<div className="button-container"><button className='tool-button' value='Wheel'
onClick={e => this.toggleTool(e.target.value)}> <AiOutlineZoomIn size={25} /> {/* Adjust size as 
needed */}StackScroll</button></div>   

{/* {button for the magnify tool} */}
<div className="button-container"><button className='tool-button' value='Magnify'
onClick={e => this.toggleTool(e.target.value)}> <AiOutlineZoomIn size={25} /> {/* Adjust size as 
needed */}Magnify</button></div>
{/*Button for enabling Pan tool, drop down for changing alignment settings */}
<div className="button-container" id='Pan Settings'>
<button className='tool-button' value='Pan' onClick={e =>
this.toggleTool(e.target.value)}><AiOutlineDrag size={25} /> {/* Pan Icon */}
Pan</button>
<select id="alignment" className="dropdown" onChange={e =>
this.alignmentSettings(e.target.value, selected_viewport)}>
<option value='' selected disabled hidden></option>
<option value='AlignLeft'>Align Left</option>
<option value='AlignCenter'>Align Center</option>
<option value='AlignRight'>Align Right</option>
</select>
</div>
{/*Drop down for changing rotation and flip settings */}
<div className="button-container" id='Orientation Settings'>
<button className='tool-button' value='PlanarRotate' onClick={e =>
this.toggleTool(e.target.value)}> <FaRedoAlt /> {/* Rotate icon */}Rotate</button>
<select id='orientation' className="dropdown" onChange={e =>
this.orientationSettings(e, selected_viewport)}>
<option value='' selected disabled hidden></option>
<option value='Rleft'>Rotate Left</option>
<option value='Rright'>Rotate Right</option>
<option value='Hflip'>Horizontal Flip</option>
<option value='Vflip'>Vertical Flip</option>
</select>
</div>
{/*Button for enabling Probe Tool */}
<div className="button-container"><button className='tool-button' value='Probe'
onClick={e => this.toggleTool(e.target.value)}> <FaSearch /> {/* Probe/ magnifying glass icon 
*/}Pixel value</button></div>
{/*Button for enabling Contrast tool, Drop down for changing windowing settings*/}
<div className="button-container">
<button className='tool-button' value='Contrast' onClick={e =>
this.toggleTool(e.target.value)}> <FaAdjust /> {/* Contrast/adjust icon */}Windowing</button>
<select id='windowing' className="dropdown" onChange={e =>
this.windowingSettings(e, selected_viewport)}>
<option value='' selected disabled hidden></option>
<option value="Invert">Invert</option>
<option value="Bone">Bone</option>
<option value="Lungs">Lungs</option>
<option value="Brain">Brain</option>
<option value="Abdomen">Abdomen</option>
<option value="ST">Soft Tissue</option>
<option value="Liver">Liver</option>
<option value="Mediastinal">Mediastinal</option>
</select>
</div>
<div className="button-container">
  <button className='tool-button' value='Length' onClick={e => this.toggleTool(e.target.value)}>
    📐 Measure
  </button>
</div>
{/*Drop down for enabling measurement tools */}
<div className="button-container">
<button className='name-button' disabled> <FaRuler /> {/* Measurement icon 
*/}Measurements</button>
<select id="measurement" className="dropdown" onChange={e =>
this.toggleTool(e.target.value)}>
<option value='' selected disabled hidden></option>
<option value='Angle'>Angle</option>
<option value='CobbAngle'>Cobb Angle</option>
<option value='RectangleROI'>Rectangle ROI</option>
<option value='CircleROI'>Circle ROI</option>
<option value='EllipticalROI'>Elliptical ROI</option>
<option value='FreehandROI'>Freehand ROI</option>
<option value='SplineROI'>Spline ROI</option>
<option value='Bidirectional'>Bidirectional</option>
<option value='ArrowAnnotate'>Arrow Annotate</option>
</select>
</div>
{/*Button for enabling Eraser tool */}
<div className="button-container"><button className='tool-button' value='Eraser'
onClick={e => this.toggleTool(e.target.value)}> <FaEraser /> {/* Eraser icon 
*/}Eraser</button></div>
{/*Drop down for changing MPR orientation for a volume in a selected viewport */}
<div className="button-container">
<button className='name-button' disabled> <FaCube /> {/* 3D Cube icon 
*/}MPR</button>
<select id='mpr' className="dropdown" onChange={e => this.volumeOrientation(e, 
selected_viewport)}>
<option value='' selected disabled hidden></option>
<option value='axial'>Axial</option>
<option value='sagittal'>Sagittal</option>
<option value='coronal'>Coronal</option>
</select>
</div>
{/*Slider for changing selected viewports slab thickness */}
<div className='button-container'>
  <button className='name-button' disabled>
    <FaBars /> {/* Bars icon */} Max MIP
  </button>
  <input 
    type='range' 
    min='0' 
    max='50' 
    defaultValue='0' 
    className='slider' 
    id='slider-mip'
    onChange={e => this.slabThickness(e.target.value, selected_viewport)}
  />
</div>


<div className='button-container'>
  <button className='name-button' disabled>
    <FaBars /> {/* Bars icon */} Min MinIP
  </button>
  <input 
    type='range' 
    min='0' 
    max='50' 
    defaultValue='0' 
    className='slider' 
    id='slider-minip'
    onChange={e => this.slab(e.target.value, selected_viewport)} // ✅ FIXED: Calls slab() correctly
  />
</div>

{/*Drop down for changing the layout of the viewports */}
<div className="button-container">
<button className='name-button' disabled> <FaThLarge /> {/* Grid layout icon 
*/}Layout</button>
<select id="layout" className="dropdown" onChange={e => this.layoutSettings(e)}>
<option value='one' selected>1x1</option>
<option value='two'>1x2</option>
<option value='three'>1x3</option>
<option value='four'>2x2</option>
</select>
</div>
{/*Button for resetting selected viewport settings */}
<div className="button-container"><button className='tool-button' value='Reset'
onClick={e => this.viewportSettings(e.target.value, selected_viewport)}> <FaUndo /> {/* 
Undo/Reset icon */}Reset</button></div>
{/*Button for capturing selected viewport */}
<div className="button-container"><button className='tool-button' onClick={e =>
this.capture(prev_selected_element)}> <FaCamera /> {/* Camera icon */}Capture</button></div>

<div className="button-container"><button className='tool-button' onClick={e =>
this.downloadAsJPEG(prev_selected_element)}> <FaCamera /> {/* Camera icon */}Save as jpeg</button></div>
{/*Button for hiding editor and putting the viewer in full screen mode */}
<div className="button-container">
<button  className='tool-button' onClick={this.toggleDivs}>
<FaExpand />  {isDiv2Visible ? 'Full screen' : 'create report'}
        </button>
</div>
<button 
        style={{ margin: "1px", padding: "1px 1px", cursor: "pointer" }}
        onClick={this.togglePatientData}
      >
        {this.state.showPatientData ? "Hide Details" : "Show Details"}
      </button>
</div>
{/*container for all four viewports */}
<div className='viewport-container' id='viewport-container'>
<div 
    className="patientdata" 
    style={{
  backgroundColor: "rgba(255, 255, 255, 0.9)", 
  padding: "1px",
  position: "absolute",
  zIndex: 10,
  borderRadius: "1px",
  overflowX: "auto", // Horizontal scrolling
  overflowY: "auto", // Vertical scrolling
  width: "200px",    // Fixed width
  display: this.state.showPatientData ? "block" : "none",
}}
  >
  </div>
  
<div className="viewport" id='viewport1' data-value='first' onDragOver={e =>
this.allowDrop(e)} onDrop={e => this.drop(e)}></div>
<div className="viewport" id='viewport2' data-value='second' onDragOver={e =>
this.allowDrop(e)} onDrop={e => this.drop(e)}></div>
<div className="viewport" id='viewport3' data-value='third' onDragOver={e =>
this.allowDrop(e)} onDrop={e => this.drop(e)}></div>
<div className="viewport" id='viewport4' data-value='fourth' onDragOver={e =>
this.allowDrop(e)} onDrop={e => this.drop(e)}></div>
</div>
{/*Container for patient details */}
<div className='details'>
<div id="viewport1Index">Image: </div>
<div id='viewport2Index'>Image: </div>
<div id='viewport3Index'>Image: </div>
<div id='viewport4Index'>Image: </div>
</div>
<div id='output'></div>
</div>
          {isDiv2Visible && ( <div className="document-editor__editable-container" id="reportEditor">
    {this.state.modal && options_label === "X-RAY CHEST" ? (
      <XrayChest
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "Blanks" ? (
      <Blanks
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "TbChest" ? (
      <TbChest
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />  
    ) : this.state.modal && options_label === "CT PNS" ? (
      <PnsAbnormal
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "CAMP ECG" ? (
      <CampECG2
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY LEFT-SHOULDER" ? (
      <XrayLeftShoulder
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY RIGHT-SHOULDER" ? (
      <XrayRightShoulder
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY KNEE" ? (
      <XrayKnee
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY SPINE(CERVICAL)" ? (
      <XraySpineCervical
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY SPINE(LUMBER)" ? (
      <XraySpineLumber
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "X-RAY SPINE(DORSAL)" ? (
      <XraySpineDorsal
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "VITALS" ? (
      <Vitals
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "OPTOMETRY" ? (
      <Optometry
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "OPTOMETRY NO-INPUT" ? (
      <Optometry2
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "OPTOMETRY (CAMP)" ? (
      <Optometry3
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "AUDIOMETRY" ? (
      <Audiometry
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "OPTOMETRY (CAMP) NO-INPUT" ? (
      <Optometry4
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "CT ABDOMEN" ? (
      <CtAbdomen
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : this.state.modal && options_label === "CT HEAD" ? (
      <CtHead
        handleClick={this.handleClick}
        reportFrmData={reportFrmData}
        generateReport={this.generateReport}
        generatePatientTable={this.generatePatientTable()}
      />
    ) : (
      ""
    )}
   
   <CKEditor
  editor={DecoupledEditor}
  data={reportFrmData}
  onInit={(editor) => {
    editor.onclick = this.onclickDiv;

    window.editor = editor;
    editor.allowedContent = true;
    editor.config.extraAllowedContent = '*(*);*{*}';

    const urlParams = new URLSearchParams(window.location.search);
    const currentStudyId = urlParams.get('data-study-id');

    if (!currentStudyId) {
      console.warn('No study ID found in the URL.');
      return;
    }

    // Fetch Initial Content
    const fetchEditorContent = async () => {
      try {
        const response = await fetch(`/get-editor-content/${currentStudyId}/`);
        const data = await response.json();
        if (data.editor_content) {
          editor.setData(data.editor_content);
        }
      } catch (error) {
        console.error('Error fetching editor content:', error);
      }
    };

    fetchEditorContent();

    // Save Content on Change
    editor.model.document.on('change:data', async () => {
      try {
        const content = editor.getData();
        await fetch('/save-editor-content/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ study_id: currentStudyId, editor_content: content }),
        });
      } catch (error) {
        console.error('Error saving editor content:', error);
      }
    });

    const toolbarContainer = document.querySelector('.document-editor__toolbar');

    if (!toolbarContainer.querySelector('.custom-toolbar')) {
      // Create Custom Toolbar
      const customToolbar = document.createElement('div');
      customToolbar.classList.add('custom-toolbar');
      customToolbar.style.display = "flex"; // Flex for horizontal layout
      customToolbar.style.gap = "10px";
      customToolbar.style.marginTop = "10px";

      // Create Template Dropdown
      const templateDropdown = document.createElement('select');
      templateDropdown.classList.add('template-dropdown');
      templateDropdown.innerHTML = `<option value="">Select Template</option>`;
      customToolbar.appendChild(templateDropdown);

      // Load Templates Function
      const loadTemplates = async () => {
        try {
          const response = await fetch('/save-template/');
          const data = await response.json();
          templateDropdown.innerHTML = '<option value="">Select Template</option>'; // Reset options
          data.templates.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.text = template.name;
            templateDropdown.appendChild(option);
          });
        } catch (error) {
          console.error('Error fetching templates:', error);
        }
      };

      // Load templates initially
      loadTemplates();

    
     

      templateDropdown.onchange = async (e) => {
        const templateId = e.target.value;
        if (templateId) {
          try {
            const response = await fetch(`/get-template/${templateId}/`);
            const data = await response.json();
            if (data.template_content) {
              editor.model.change((writer) => {
                const viewFragment = editor.data.processor.toView(data.template_content);
                const modelFragment = editor.data.toModel(viewFragment);
      
                // Use insertContent instead of manual writer.insert
                editor.model.insertContent(modelFragment, editor.model.document.selection);
              });
            } else {
              console.warn('No template content found.');
            }
          } catch (error) {
            console.error('Error loading template:', error);
          }
        }
      };
      
        

      // Create "Save as Template" Button
      const saveTemplateButton = document.createElement('button');
      saveTemplateButton.innerText = 'Save as Template';
      saveTemplateButton.classList.add('save-template-button');
      saveTemplateButton.style.padding = '5px 10px';
      saveTemplateButton.style.cursor = 'pointer';
      saveTemplateButton.style.backgroundColor = '#4CAF50';
      saveTemplateButton.style.color = 'white';
      saveTemplateButton.style.border = 'none';
      saveTemplateButton.style.borderRadius = '5px';

      // // Handle Save Template Click
      // saveTemplateButton.onclick = async () => {
      //   const templateName = prompt('Enter template name:');
      //   if (templateName) {
      //     try {
      //       const content = editor.getData();
      //       await fetch('/save-template/', {
      //         method: 'POST',
      //         headers: { 'Content-Type': 'application/json' },
      //         body: JSON.stringify({ name: templateName, content }),
      //       });
      //       alert('Template saved successfully!');
      //       loadTemplates(); // Refresh dropdown
      //     } catch (error) {
      //       console.error('Error saving template:', error);
      //     }
      //   }
      // };
      // Handle Save Template Click
saveTemplateButton.onclick = async () => {
  const templateName = prompt('Enter template name:');
  if (templateName) {
    try {
      const selection = editor.model.document.selection;

      // Get the selected range
      const range = selection.getFirstRange();

      if (!range) {
        alert('No content selected! Please highlight some text.');
        return;
      }

      // Convert model selection to view document fragment
      const viewFragment = editor.data.toView(editor.model.getSelectedContent(selection));

      // Convert view document fragment to HTML
      const selectedContent = editor.data.processor.toData(viewFragment);

      if (!selectedContent.trim()) {
        alert('Selected content is empty! Please highlight valid text.');
        return;
      }

      // Send the selected content to backend
      await fetch('/save-template/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName, content: selectedContent }),
      });

      alert('Selected content saved successfully!');
      loadTemplates(); // Refresh dropdown

    } catch (error) {
      console.error('Error saving selected content:', error);
    }
  }
};


      // Append Save Button to Custom Toolbar
      customToolbar.appendChild(saveTemplateButton);

      // Append CKEditor Default Toolbar
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);

      // Append Custom Buttons to Default Toolbar
      editor.ui.view.toolbar.element.children[0].appendChild(this.copyAction());
      editor.ui.view.toolbar.element.children[0].appendChild(this.choose());
      editor.ui.view.toolbar.element.children[0].appendChild(this.actionDropDown());
      editor.ui.view.toolbar.element.children[0].appendChild(this.userDropdown());

      // Append Custom Toolbar to the Editor Toolbar
      editor.ui.view.toolbar.element.appendChild(customToolbar);
    }
  }}
/>


  </div>)}
        </div>
        <div className="previewTab" id="previewTab"></div>
      </div>
      </div>
       );
    
  };

  //remove all images and metadata from cache, destroy any created volumes
  componentWillUnmount() {
    //terminate webworkers that are used for decoding dicom files
    cornerstoneDICOMImageLoader.webWorkerManager.terminate();

    //destroy cornerstone tools
    cornerstoneTools.destroy();

    //destroy the created rendering engine
    renderingEngine.destroy();

    //decache and destroy all the volumes created
    for (const volume of cornerstone.cache.getVolumes()){
      volume.decache(true)
      volume.destroy();
    };

    //purge cache
    cornerstone.cache.purgeCache();
    
  }
  
}

render(<App />, document.getElementById("root"));