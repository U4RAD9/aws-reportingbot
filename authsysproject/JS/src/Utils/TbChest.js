
import React, { Component } from "react";
import "../style.css";
import PopUp from "../PopUps/PopUpTb";

//import text from "../Forms/text_tb_ches.json";
import { data } from "jquery";
import { FlashOnRounded, InvertColorsOff } from "@material-ui/icons";

class TbChest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frmData: {
        name: "John Doe",
        description: "",
        measurements: 0,
        done: true,
        recurrence: "Daily",
        rating: 3,
        // suspectedTB: false,
        // suspectedTBRUZ: false,
        // suspectedTBRMZ: false,
        // suspectedTBRLZ: false,
        // suspectedTBLUZ: false,
        // suspectedTBLMZ: false,
        // suspectedTBLLZ: false,
      },
    };
    this.handleData = this.handleData.bind(this);
    this.formatData = this.formatData.bind(this);
  }

  async handleData(data) {
    console.log("====data index", data);
    this.setState({ frmData: data }, async () => {
      await this.formatData();
    });
  }


  async formatData() {
    const { frmData } = this.state;
    let report = this.props.generatePatientTable;
    const impression = [];
    let pageBreak = 0;
    let totalCovidPoints = 0;



    // Auto data by Aman Gupta on 23/06/23
if (
    frmData.NameTextFR2 &&
    frmData.IDTextFR2 &&
    frmData.AgeTextFR2 &&
    frmData.GenderTextFR2
  ) {
    report +=
      "<pre>" +
      "<b>" +
      "<header>" +
      "<table>" +
      "<tr>" +
      "<td>" +
      "Name: " +
      frmData.NameTextFR2 +
      "</td>" +
      "<td>" +
      "Patient ID: " +
      frmData.IDTextFR2 +
      "</td>" +
      "<td>" +
      "Age: " +
      frmData.AgeTextFR2 +
      "</td>" +
      "</tr>" +
      "<tr>" +
      "<td>" +
      "Gender: " +
      frmData.GenderTextFR2 +
      "</td>" +
      "<td>" +
      "Test date: " +
      frmData.TestDateTextFR2 +
      "</td>" +
      "<td>" +
      "Report date: " +
      frmData.ReportDateTextFR2 +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</b>" +
      "</pre>" +
      "</header>";
  }
  
  if (
    (frmData.XrayTypes === "AP" || frmData.suspectedTB) ||
    (frmData.XrayTypes === "PA" || frmData.XrayTypes === "LATERAL" || frmData.XrayTypes === "AP/PA")
  ) {
    report +=
      "<p style='text-align: center;'>" +
      "<strong>" +
      "<u>" +
      "CHEST X-RAY FOR TUBERCULOSIS" +
      "</u>" +
      "</strong>" +
      "</p>";
    report +=
      "<h5>" + "<strong>" + "<u>" + "OBSERVATIONS:" + "</u>" + "</strong>" + "</h5>";
  }

    //***************************OPACITIES****************************************************

    if (frmData.BothNormal && (frmData.XrayTypes === 'AP' || frmData.XrayTypes === 'PA' || frmData.XrayTypes === 'AP/PA')) {
        report += "<p>" + "The trachea is central.<br><br>Lung zones are clear.<br><br>Both hila are normal.<br><br>Cardiophrenic and costophrenic angles are normal.<br><br>The mediastinal and cardiac silhouette are normal.<br><br>Bones of the thoracic cage are normal.<br><br>Soft tissues of the chest wall are normal.<br><br>Cardiothoracic ratio is normal." + "</p>"
      }
   // In TbChest.js formatData function
if (frmData.suspectedTB) {
  if (frmData.suspectedTBType && frmData.suspectedTBType.length > 0) {
    const zones = frmData.suspectedTBType.map(zone => {
      const zoneNames = {
        RUZ: "Right Upper Zone",
        RMZ: "Right Mid Zone",
        RLZ: "Right Lower Zone",
        LUZ: "Left Upper Zone",
        LMZ: "Left Mid Zone",
        LLZ: "Left Lower Zone"
      };
      return zoneNames[zone] || zone;
    }).join(", ");

    report += "<p><strong>Suspected Tuberculosis in:</strong> " + zones + "</p>";
    impression.push("<b>" + "Abnormality seen in " + zones + "</b>");
  }
  
  
  if (frmData.AdditionalNotes) {
    report += "<p><strong>Additional Notes:</strong> " + frmData.AdditionalNotes + "</p>";
  }
} 

    //TO BE ADDED
    var current_user = JSON.parse(document.getElementById("current-user").textContent);

    report +=
      this.pageBreak() +

      this.getImpression(impression, totalCovidPoints) +
      this.getCorads(current_user); // TO BE ADDED

      if (frmData.reportimage) {
        report += "<div class='image-container'>" +
          "<img src='" + frmData.reportimage + "' alt='Report' class='report-image' />" +
          "</div>";
      }

    this.setState({ reportFrmData: report }, () => {
      this.props.generateReport(report);
    });
  }



  pageBreak() {
    return '<div class="page-break ck-widget ck-widget_selected" contenteditable="false" draggable="true"></div>';
  }
  //TO BE ADDED
  getCorads(user) {
    return (
      "<p><br><img src='" + user.signature + "' height='75' /><p>" + user.full_name + "<br>" + "<br>" + user.designation + "</p></p>"
    );
  }

  getImpression(impression, totalCovidPoints) {
    let text = "</br><p><strong><u>IMPRESSION:</u></strong></p><p>";
    return (
      text +
      (impression.length !== 0
        ? impression.join("")
        : "<strong>•  No significant abnormality seen.</strong>") +
      "</p>"
    );
  }

  render() {
    const { frmData } = this.state;
    return (
      <div>
        {
          <PopUp
            handleClick={this.props.handleClick}
            data={frmData}
            handleData={this.handleData}
            name="TbChest" />
        }
      </div>

    );
  }
}

export default TbChest;
