import React from "react";
import Modal from "react-bootstrap4-modal";
// import "bootstrap/dist/css/bootstrap.min.css";
import Form18 from "../Forms/forms18";

export default class PopUpCtHead extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        Appendix: false,
				AppendixDialated: false,
				AppendixDialatedPeriappendicealFluidCollection: false,
				AppendixDialatedPeriappendicealPeriphereally: true,
				AppendixDialatedMesentericNodes: false,
				AppendixDialatedAppendicularMass: false,
      },
      err: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleDone = this.handleDone.bind(this);
  }

  handleChange(data, err) {
    if (!err) {
      this.setState({ data }, () => this.props.handleData(data));
    }
    

    this.setState({ err });
  }


  handleDone() {
    const { data, err } = this.state;
    console.log("======data", data);

    

    if (!err) {
      this.props.handleClick();
    }
    // if (!err) {
    //   // Make an API call to update the isDone field
    //   const urlSearchParams = new URLSearchParams(window.location.search);
    //   const studyId = urlSearchParams.get("data-study-id");

    //   // Get the CSRF token from cookies
    //   const csrftoken = document.cookie.match(/csrftoken=([\w-]+)/)[1];

    //   // Make a POST request to your Django backend to update the isDone field
    //   fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'X-CSRFToken': csrftoken,  // Include CSRF token in headers
    //       // Add any additional headers as needed
    //     },
    //     body: JSON.stringify({ isDone: true }),
    //   })
    //   .then(response => {
    //     if (response.ok) {
    //       // Close the popup after the API call
    //       this.setState({ isDone: true }, () => {
    //         this.props.handleClick();
    //       });
    //     } else {
    //       // Handle errors
    //       console.error('Failed to update isDone status');
    //     }
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //   });
    // }



    // this.setState({ isDone: true }, () => {
    //   this.props.handleClick();
    // });
  }

  // event handling methods go here
  render() {
    const { data, handleClick, name } = this.props;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientId = urlSearchParams.get("data-patientid");
    const patientName = urlSearchParams.get("data-patientname");
    const age = urlSearchParams.get("data-age");
    const gender = urlSearchParams.get("data-gender");
    const institution = urlSearchParams.get("data-institution_name");
    const testDate = urlSearchParams.get("data-testdate");
    const reportDate = urlSearchParams.get("data-reportdate");
    const ReferralDr =   urlSearchParams.get("data-referringdoctor");
    const Reporttime=    urlSearchParams.get("data-reporttime");
    

    // Decode the reportimage URL
    let reportimage = urlSearchParams.get("data-reportimage");
    if (reportimage) {
      reportimage = decodeURIComponent(reportimage);
    }

    const formData = {
      ...this.state.data,  // Preserve initial state values
      NameTextFR18: patientName,
      IDTextFR18: patientId,
      AgeTextFR18: age,
      GenderTextFR18: gender,
      TestDateTextFR18: testDate,
      ReportDateTextFR18: reportDate,
      reportimage: reportimage,
      ReferralDrTextFR18:ReferralDr,
      ReporttimeTextFR18:Reporttime
    };
    return (
      <Modal visible={true} onClickBackdrop={this.modalBackdropClicked}>
        <div className="modal-header">
          <h5 className="modal-title">{name}</h5>
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ margin: "9px" }}
              onClick={this.handleDone}
            >
              Done
            </button>
            {/* Add a WhatsApp button */}
            <button
              type="button"
              className="btn btn-danger"
              style={{ margin: "9px" }}
              onClick={this.handleSendWhatsAppMessage}
            >
              Reject
            </button>
          </div>
        </div>
        <div className="modal-body">
          <Form18 data={formData} handleChange={this.handleChange} />
          {reportimage && (
            <div className="image-container">
              <img src={reportimage} alt="Report" className="report-image" />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
