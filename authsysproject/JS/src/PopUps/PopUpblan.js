import React from "react";
import Modal from "react-bootstrap4-modal";
// import "bootstrap/dist/css/bootstrap.min.css";
import Form29 from "../Forms/forms29";

export default class PopUpblan extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {},
      err: false,
      isDone: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleDone = this.handleDone.bind(this);
    this.handleSendWhatsAppMessage = this.handleSendWhatsAppMessage.bind(this);
  }

  handleChange(data, err) {
    if (!err) {
      this.setState({ data }, () => this.props.handleData(data));
    }
    this.setState({ err });
  }

  handleDone() {
    const { data, err } = this.state;

    if (err) {
      console.error("Error detected in data");
      return;
    }

    // Make an API call to update the isDone field
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientId = urlSearchParams.get("data-patientid");

    const csrftoken = document.cookie.match(/csrftoken=([\w-]+)/);
    if (!csrftoken) {
      console.error("CSRF token not found!");
      return;
    }
    const csrftokenValue = csrftoken[1];

    fetch(`/api/update_patient_done_status_xray/${patientId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftokenValue,
      },
      body: JSON.stringify({ isDone: true }),
    })
      .then((response) => {
        if (response.ok) {
          this.setState({ isDone: true }, () => {
            this.props.handleClick();
          });
        } else {
          console.error("Failed to update isDone status");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleSendWhatsAppMessage() {
    console.log("WhatsApp message functionality not implemented yet.");
  }

  render() {
    const { data, handleClick, name } = this.props;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientId = urlSearchParams.get("data-patientid");
    const patientName = urlSearchParams.get("data-patientname");
    const age = urlSearchParams.get("data-age");
    const gender = urlSearchParams.get("data-gender");
    const testDate = urlSearchParams.get("data-testdate");
    const reportDate = urlSearchParams.get("data-reportdate");

    let reportimage = urlSearchParams.get("data-reportimage");
    if (reportimage) {
      reportimage = decodeURIComponent(reportimage);
    }

    const formData = {
      NameTextFR2: patientName,
      IDTextFR2: patientId,
      AgeTextFR2: age,
      GenderTextFR2: gender,
      TestDateTextFR2: testDate,
      ReportDateTextFR2: reportDate,
      reportimage: reportimage,
    };

    return (
      <Modal visible={true}>
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
          <Form29 data={formData} handleChange={this.handleChange} />
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
