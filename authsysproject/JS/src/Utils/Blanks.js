import React, { Component } from "react";
import "../style.css";
import PopUp from "../PopUps/PopUpblan";

class Blanks extends Component {
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
        // Other state fields...
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
    let report = this.props.generatePatientTable || ""; // Ensure default value
    const impression = [];
    let totalCovidPoints = 0;

    
    //Auto data by Aman Gutpa on 23/06/23
    if (frmData.NameTextFR29 && frmData.IDTextFR29 && frmData.AgeTextFR29 && frmData.GenderTextFR29 && frmData.ReferralDrTextFR29 && frmData.ReporttimeTextFR29) {
      report += "<pre>" + "<b>" + "<header>" + "<table>" +
                "<tr>" +
                  "<td>" + "Name: " + frmData.NameTextFR29 + "</td>" +
                  "<td>" + "Patient ID: " + frmData.IDTextFR29 + "</td>" +
                  "<td>" + "Age: " + frmData.AgeTextFR29 + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "Gender: " + frmData.GenderTextFR29 + "</td>" +
                  "<td>" + "Test date: " + frmData.TestDateTextFR29 + "</td>" +
                  "<td>" + "Report date: " + frmData.ReportDateTextFR29 + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "Referral Dr: " + frmData.ReferralDrTextFR29 + "</td>" +
                  "<td>" + "Report time: " + frmData.ReporttimeTextFR29 + "</td>" +
                "</tr>" +
                "</table>" + "</b>" + "</pre>" + "</header>";
  }

    const current_user = JSON.parse(
      document.getElementById("current-user").textContent || "{}"
    );

    report +=
      this.pageBreak() +
      this.getCorads(current_user);

    if (frmData.reportimage) {
      report +=
        "<div class='image-container'>" +
        "<img src='" +
        frmData.reportimage +
        "' alt='Report' class='report-image' />" +
        "</div>";
    }

    this.setState({ reportFrmData: report }, () => {
      if (this.props.generateReport) this.props.generateReport(report);
    });
  }

  pageBreak() {
    return '<div class="page-break"></div>';
  }

  getCorads(user) {
    return (
      "<div><br><img src='" +
      user.signature +
      "' height='75' />" +
      "<p>" +
      user.full_name +
      "<br>" +
      user.designation +
      "</p></div>"
    );
  }



  render() {
    const { frmData } = this.state;
    return (
      <div>
        <PopUp
          handleClick={this.props.handleClick}
          data={frmData}
          handleData={this.handleData}
          name="Blanks"
        />
      </div>
    );
  }
}

export default Blanks;
