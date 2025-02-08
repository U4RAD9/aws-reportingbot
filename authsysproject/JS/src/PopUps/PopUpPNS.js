import React from "react";
import Modal from "react-bootstrap4-modal";
// import "bootstrap/dist/css/bootstrap.min.css";
import Form4 from "../Forms/form4";

export default class PopUpPNS extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        PnsSinuses: false,

        PnsFrontal: false,
        PnsFrontalRight: false,
        PnsFrontalLeft: false,
        PnsFrontalRightPneumatization: false,
        PnsFrontalLeftPneumatization: false,
        PnsFrontalRightMusocalThicking: false,
        PnsFrontalLeftMusocalThicking: false,
        PnsFrontalRightFrontoEthmoid: false,
        PnsFrontalLeftFrontoEthmoid: false,

        PnsMaxillary: false,
        PnsMaxillaryRight: false,
        PnsMaxillaryLeft: false,
        PnsMaxillaryRightPneumatization: false,
        PnsMaxillaryLeftPneumatization: false,
        PnsMaxillaryRightMusocalThicking: false,
        PnsMaxillaryLeftMusocalThicking: false,
        PnsMaxillaryRightOsteomeatalUnit: false,
        PnsMaxillaryLeftOsteomeatalUnit: false,

        PnsEthmoidal: false,
        PnsEthmoidalRight: false,
        PnsEthmoidalLeft: false,
        PnsEthmoidalRightPneumatization: false,
        PnsEthmoidalLeftPneumatization: false,
        PnsEthmoidalRightMusocalThicking: false,
        PnsEthmoidalLeftMusocalThicking: false,
        PnsEthmoidalRightSeptae: false,
        PnsEthmoidalLeftSeptae: false,
        PnsEhtmoidalRightVarient: false,
        PnsEhtmoidalLeftVarient: false,

        PnsSphenoid: false,
        PnsSphenoidRight: false,
        PnsSphenoidLeft: false,
        PnsSphenoidRightPneumatization: false,
        PnsSphenoidLeftPneumatization: false,
        PnsSphenoidRightMusocalThicking: false,
        PnsSphenoidLeftMusocalThicking: false,
        PnsSphenoidRightEthmoid: false,
        PnsSphenoidLeftEthmoid: false,


        NasalCavity: false,
        DNSNasalCavity: false,
        TurbinatesNasalCavity: false,
        TurbinatesNasalRight: false,
        TurbinatesNasalLeft: false,
        TurbinatesNasalRightMiddle: false,
        TurbinatesNasalLeftMiddle: false,
        TurbinatesNasalRightConcha: false,
        TurbinatesNasalLeftConcha: false,

        TurbinatesNasalRightInferior: false,
        TurbinatesNasalLeftInferior: false,

        NasalMusocalThicking: false,

        Miscellaneous: false,
        MiscellaneousTypeKeros: false,
        MiscellaneousTypeOpticNerve: false,
        MiscellaneousbonyPneumatization: false,
        MiscellaneousbonyPneumatizationRight: false,
        MiscellaneousbonyPneumatizationLeft: false,

        MiscellaneousMastoid: false,
        MiscellaneousMastoidRight: false,
        MiscellaneousMastoidLeft: false,
        MiscellaneousMastoidLeftSoftTissue: false,
        MiscellaneousMastoidRightSoftTissue: false,

        MiscellaneousPosterior: false,
        MiscellaneousPosteriorRight: false,
        MiscellaneousPosteriorLeft: false,
        MiscellaneousPosteriorStenosisRight: false,
        MiscellaneousPosteriorStenosisLeft: false,

        MiscellaneousOsteoma: false,
        MiscellaneousOsteomaRight: false,
        MiscellaneousOsteomaLeft: false,

        MiscellaneousMucocele: false,
        MiscellaneousMucoceleRight: false,
        MiscellaneousMucoceleLeft: false,
        MiscellaneousAdenoid: false,
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



    if (data.PnsSinuses) {
      if (!(data.PnsFrontal || data.PnsMaxillary
        || data.PnsEthmoidal || data.PnsSphenoid)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.PnsFrontalRight || data.PnsFrontalLeft
        || data.PnsMaxillaryRight || data.PnsMaxillaryLeft
        || data.PnsEthmoidalRight || data.PnsEthmoidalLeft
        || data.PnsSphenoidRight || data.PnsSphenoidLeft)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.PnsFrontalRightPneumatization || data.PnsFrontalLeftPneumatization
        || data.PnsFrontalRightMusocalThicking || data.PnsFrontalLeftMusocalThicking
        || data.PnsFrontalRightAirFluid || data.PnsFrontalLeftAirFluid
        || data.PnsFrontalRightFrontoEthmoid || data.PnsFrontalLeftFrontoEthmoid
        || data.PnsFrontalRightBonyErosions || data.PnsFrontalLeftBonyErosions

        || data.PnsMaxillaryRightPneumatization || data.PnsMaxillaryLeftPneumatization
        || data.PnsMaxillaryRightMusocalThicking || data.PnsMaxillaryLeftMusocalThicking
        || data.PnsMaxillaryRightAirFluid || data.PnsMaxillaryLeftAirFluid
        || data.PnsMaxillaryRightOsteomeatalUnit || data.PnsMaxillaryLeftOsteomeatalUnit
        || data.PnsMaxillaryRightBonyErosions || data.PnsMaxillaryLeftBonyErosions
        || data.PnsMaxillaryRightAccessoryOstia || data.PnsMaxillaryLeftAccessoryOstia

        || data.PnsEthmoidalRightPneumatization || data.PnsEthmoidalLeftPneumatization
        || data.PnsEthmoidalRightMusocalThicking || data.PnsEthmoidalLeftMusocalThicking
        || data.PnsEhtmoidalRightAirFluid || data.PnsEhtmoidalLeftAirFluid
        || data.PnsEthmoidalRightBonyErosions || data.PnsEthmoidalLeftBonyErosions
        || data.PnsEthmoidalRightSeptae || data.PnsEthmoidalLeftSeptae
        || data.PnsEhtmoidalRightVarient || data.PnsEhtmoidalLeftVarient

        || data.PnsSphenoidRightPneumatization || data.PnsSphenoidLeftPneumatization
        || data.PnsSphenoidRightMusocalThicking || data.PnsSphenoidLeftMusocalThicking
        || data.PnsSphenoidRightAirFluid || data.PnsSphenoidLeftAirFluid
        || data.PnsSphenoidRightEthmoid || data.PnsSphenoidLeftEthmoid
        || data.PnsSphenoidRightBonyErosions || data.PnsSphenoidLeftBonyErosions)) {

        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }
    // Pneumatization*****
    if (data.PnsFrontalRightPneumatization || data.PnsFrontalLeftPneumatization
      || data.PnsMaxillaryRightPneumatization || data.PnsMaxillaryLeftPneumatization
      || data.PnsEthmoidalRightPneumatization || data.PnsEthmoidalLeftPneumatization
      || data.PnsSphenoidRightPneumatization || data.PnsSphenoidLeftPneumatization) {

      if (!(data.PnsFrontalRightPneumatizationtype || data.PnsFrontalLeftPneumatizationtype
        || data.PnsMaxillaryRightPneumatizationtype || data.PnsMaxillaryLeftPneumatizationtype
        || data.PnsEthmoidalRightPneumatizationtype || data.PnsEthmoidalLeftPneumatizationtype
        || data.PnsSphenoidRightPneumatizationtype || data.PnsSphenoidLeftPneumatizationtype)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    // Musocal thicking***
    if (data.PnsFrontalRightMusocalThicking || data.PnsFrontalLeftMusocalThicking
      || data.PnsMaxillaryRightMusocalThicking || data.PnsMaxillaryLeftMusocalThicking
      || data.PnsEthmoidalRightMusocalThicking || data.PnsEthmoidalLeftMusocalThicking
      || data.PnsSphenoidRightMusocalThicking || data.PnsSphenoidLeftMusocalThicking) {

      if (!(data.PnsFrontalRightMusocalThickingType || data.PnsFrontalLeftMusocalThickingType
        || data.PnsMaxillaryRightMusocalThickingType || data.PnsMaxillaryLeftMusocalThickingType
        || data.PnsEthmoidalRightMusocalThickingType || data.PnsEthmoidalLeftMusocalThickingType
        || data.PnsSphenoidRightMusocalThickingType || data.PnsSphenoidLeftMusocalThickingType)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.PnsFrontalRightFrontoEthmoid || data.PnsFrontalLeftFrontoEthmoid
      || data.PnsMaxillaryRightOsteomeatalUnit || data.PnsMaxillaryLeftOsteomeatalUnit
      || data.PnsEthmoidalRightSeptae || data.PnsEthmoidalLeftSeptae
      || data.PnsEhtmoidalRightVarient || data.PnsEhtmoidalLeftVarient
      || data.PnsSphenoidRightEthmoid || data.PnsSphenoidLeftEthmoid) {

      if (!(data.PnsFrontalRightFrontoEthmoidType || data.PnsFrontalLeftFrontoEthmoidType
        || data.PnsMaxillaryRightOsteomeatalUnitType || data.PnsMaxillaryLeftOsteomeatalUnitType
        || data.PnsEthmoidalRightSeptaeType || data.PnsEthmoidalLeftSeptaeType
        || data.PnsEhtmoidalRightVarientHaller || data.PnsEhtmoidalLeftVarientHaller
        || data.PnsEhtmoidalRightVarientOnodi || data.PnsEhtmoidalLeftVarientOnodi
        || data.PnsSphenoidRightEthmoidType || data.PnsSphenoidLeftEthmoidType)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.NasalCavity) {
      if (!(data.DNSNasalCavity || data.TurbinatesNasalCavity || data.NasalMusocalThicking)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.DNSNasalCavityType || data.TurbinatesNasalRight || data.TurbinatesNasalLeft
        || data.TurbinatesNasalLeftMiddle || data.TurbinatesNasalRightMiddle
        || data.NasalMusocalThickingRight || data.NasalMusocalThickingLeft)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.DNSNasalCavityType) {
      if (!(data.DNSNasalCavityWithWithoutType)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.TurbinatesNasalRight || data.TurbinatesNasalLeft) {
      if (!(data.TurbinatesNasalRightMiddle || data.TurbinatesNasalLeftMiddle
        || data.TurbinatesNasalRightInferior || data.TurbinatesNasalLeftInferior)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.TurbinatesNasalRightConcha || data.TurbinatesNasalLeftConcha
        || data.TurbinatesNasalRightHypertrophied || data.TurbinatesNasalLeftHypertrophied
        || data.TurbinatesNasalRightParadoxical || data.TurbinatesNasalLeftParadoxical
        || data.TurbinatesNasalRightInferiorHypertrophied || data.TurbinatesNasalLeftInferiorHypertrophied)) {
        document.querySelectorAll('label[id^="#/properties/PnsSinuses"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }























    if (data.MiscellaneousOsteoma) {
      if (!(data.MiscellaneousOsteomaRight || data.MiscellaneousOsteomaLeft)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousOsteoma"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.MiscellaneousOsteomaRightText || data.MiscellaneousOsteomaLeftText)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousOsteoma"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.MiscellaneousMucocele) {
      if (!(data.MiscellaneousMucoceleRight || data.MiscellaneousMucoceleLeft)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousMucocele"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.MiscellaneousMucoceleRightText || data.MiscellaneousMucoceleLeftText)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousOsteoma"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }

    if (data.Miscellaneous) {
      if (!(data.MiscellaneousTypeKeros || data.MiscellaneousTypeOpticNerve || data.MiscellaneousAdenoid)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousOsteoma"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.MiscellaneousTypeKerosType || data.MiscellaneousTypeOpticNerveType
        || data.MiscellaneousAdenoidyesType)) {
        document.querySelectorAll('label[id^="#/properties/MiscellaneousOsteoma"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }




    // if (!err) {
    //   this.props.handleClick();
    // }
    if (!err) {
      // Make an API call to update the isDone field
      const urlSearchParams = new URLSearchParams(window.location.search);
      const studyId = urlSearchParams.get("data-study-id");

      // Get the CSRF token from cookies
      const csrftoken = document.cookie.match(/csrftoken=([\w-]+)/)[1];

      // Make a POST request to your Django backend to update the isDone field
      fetch(`/api/update_patient_done_status_xray/${studyId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,  // Include CSRF token in headers
          // Add any additional headers as needed
        },
        body: JSON.stringify({ isDone: true }),
      })
      .then(response => {
        if (response.ok) {
          // Close the popup after the API call
          this.setState({ isDone: true }, () => {
            this.props.handleClick();
          });
        } else {
          // Handle errors
          console.error('Failed to update isDone status');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }



    this.setState({ isDone: true }, () => {
      this.props.handleClick();
    });
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
    // const reportimage = urlSearchParams.get("data-reportimage");

    // Decode the reportimage URL
    let reportimage = urlSearchParams.get("data-reportimage");
    if (reportimage) {
      reportimage = decodeURIComponent(reportimage);
    }

    const formData = {
      ...this.state.data,  // Preserve initial state values
      NameTextFR4: patientName,
      IDTextFR4: patientId,
      AgeTextFR4: age,
      GenderTextFR4: gender,
      TestDateTextFR4: testDate,
      ReportDateTextFR4: reportDate,
      reportimage: reportimage,
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
          <Form4 data={formData} handleChange={this.handleChange} />
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
