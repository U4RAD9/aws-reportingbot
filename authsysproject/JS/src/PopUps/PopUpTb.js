import React from "react";
import Modal from "react-bootstrap4-modal";
import Form30 from "../Forms/forms30";

export default class PopUpTb extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
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


  // In PopUpTb.js handleDone
if (data.suspectedTB) {
  if (!data.suspectedTBType || data.suspectedTBType.length === 0) {
    document.querySelectorAll('label[id^="#/properties/suspectedTB"]').forEach((el) => {
      el.classList.add("err");
    });
    return;
  }
}
   
    this.setState({ err });
  }

  // *****************************
  handleDone() {
    const { data, err } = this.state;
    console.log("======data", data);

    if (!data.XrayTypes) {
      document.querySelectorAll('label[id^="#/properties/XrayTypes"]').forEach((el) => {
        el.classList.add("err");
      });
      return;
    }

    if (data.suspectedTB) {
      if (!data.suspectedTBType) {
        document.querySelectorAll('label[id^="#/properties/suspectedTB"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      
    }
  
    // if (!err) {
    //   // Make an API call to update the isDone field
    //   const urlSearchParams = new URLSearchParams(window.location.search);
    //   const patientId = urlSearchParams.get("data-patientid");

    //   // Get the CSRF token from cookies
    //   const csrftoken = document.cookie.match(/csrftoken=([\w-]+)/)[1];

    //   // Make a POST request to your Django backend to update the isDone field
    //   fetch(`/api/update_patient_done_status_xray/${patientId}/`, {
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

    if (!err) {
      this.props.handleClick();
    }
  }

  // event handling methods go here
  render() {
    const { data, handleClick, name } = this.props;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientId = urlSearchParams.get("data-patientid");
    const patientName = urlSearchParams.get("data-patientname");
    const age = urlSearchParams.get("data-age");
    const gender = urlSearchParams.get("data-gender");
    const testDate = urlSearchParams.get("data-testdate");
    const reportDate = urlSearchParams.get("data-reportdate");
    const ReferralDr = urlSearchParams.get("data-referringdoctor");
    const Reporttime = urlSearchParams.get("data-reporttime");
    
    // const reportimage = urlSearchParams.get("data-reportimage");

    // Decode the reportimage URL
    let reportimage = urlSearchParams.get("data-reportimage");
    if (reportimage) {
      reportimage = decodeURIComponent(reportimage);
    }

    const formData = {
      NameTextFR30: patientName,
      IDTextFR30: patientId,
      AgeTextFR30: age,
      GenderTextFR30: gender,
      TestDateTextFR30: testDate,
      ReportDateTextFR30: reportDate,
      reportimage: reportimage,
      ReferralDrTextFR30:ReferralDr,
      ReporttimeTextFR30:Reporttime
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
          <Form30 data={formData} handleChange={this.handleChange} />
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