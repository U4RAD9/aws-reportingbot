import React from "react";
import Modal from "react-bootstrap4-modal";
// import "bootstrap/dist/css/bootstrap.min.css";
import Form3 from "../Forms/form3";

export default class PopUpCtHead extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {
        // name: "John Doe",
        // description: "Confirm if you have passed the subject\nHereby ...",
        // done: true,
        // recurrence: "Daily",
        // rating: 3,
        cerebralParenchyma: true,
        extraAxialCollection: true,
        extraduralCollection: true,
        subduralCollection: true,
        subarachnoidhemorrhage: true,
        hematoma: false,
        hematomaR: false,
        hematomaL: false,
        Atrophy: false,

        Infarct: false, 
        TypeofInfarct: false,
        Location: false,
        InfractRight: false,
        InfractLeft: false,
        MassEffectInfract: false,
        EffacedSulciInfract: false,
        EffacedLateralVentriclesInfract: false,
        UncalHerniationInfract: false,
        InfractMidlineShift: false,
        //MidliniftTextInfract: false,

        HemorrhagicTransFormation: false,
        Hemorrhage: false,
        IntraAxial: false,
        IntraRight: false,
        RightIntraLocation: false,
        RightIntraFrontal: false,
        RightIntraTemporal: false,
        RightIntraParietal: false,
        RightIntraOccipital: false,
        RightIntraBasalGanglia: false,
        RightIntraThalamus: false,
        RightIntraCerebellum: false,
        RightIntraMedulla: false,
        RightIntraMidBrain: false,
        RightIntraPons: false,
        Chronicity: false,
        // ChronicityType: false,
        Size: false,
        //SizeCCText: false,
        //SizeAPText: false,
        //SizeTRText: false,
        Perilesional: false,
        //PerilesionalType: false,
        MassEffect: false,
        EffacedSulci: false,
        EffacedLateralVentricles: false,
        UncalHerniation: false,
        MidlineShift: false,
        //MidlineShiftText: false,
        //Towards: false,
        Intraventricular: false,
        //IntraventricularType: false,
        Yes: false,
        LateralVentricle: false,
        ThirdVentricle: false,
        FourthVentricle: false,

        // Intra Left
        IntraLeft: false,
        LeftIntraLocation: false,

        LeftIntraFrontal: false,
        LeftIntraTemporal: false,
        LeftIntraParietal: false,
        LeftIntraOccipital: false,
        LeftIntraBasalGanglia: false,
        LeftIntraThalamus: false,
        LeftIntraCerebellum: false,
        LeftIntraMedulla: false,
        LeftIntraMidBrain: false,
        LeftIntraPons: false,
        Chronicity1: false,

        //ChronicityType1: false,
        Size1: false,

        //SizeCCText1: false,
        //SizeAPText1: false,
        //SizeTRText1: false,
        Perilesional1: false,
        //PerilesionalType1: false,
        MassEffect1: false,
        EffacedSulci1: false,
        EffacedLateralVentricles1: false,
        UncalHerniation1: false,

        MidlineShift1: false,
        //MidlineShiftText1: false,

        //Towards1: false,
        Intraventricular1: false,
        //IntraventricularType1: false,
        Yes1: false,
        LateralVentricle1: false,
        ThirdVentricle1: false,
        FourthVentricle1: false,
        //ExtraAxial
        ExtraAxial: false,
        SDH: false,
        RightSDH: false,

        RightLocation: false,
        RightLocationFrontal: false,
        RightLocationTemporal: false,
        RightLocaitonParietal: false,
        RightLocationOccipital: false,

        RightLocationFalx: false,
        RightLocaitonTantorium: false,
        RightLocaitonChronicity: false,

        //RightLocaitonChronicityType: false,

        RightMaximumThickness: false,
        //RightMaximumText: false,
        RightMassEffect: false,
        RightMassEffectEffecedSulci: false,
        RightMassEffectLateralVentricle: false,
        RightMassEffectUncal: false,
        RightMassMidlineShift: false,
        //RightMassMidLineShiftText: false,
        //RightMassMidLineTowards: false,

        // Left***************************
        LeftSDH: false,

        LeftLocation: false,
        LeftLocationFrontal: false,
        LeftLocationTemporal: false,
        LeftLocaitonParietal: false,
        LeftLocationOccipital: false,

        LeftLocationFalx: false,
        LeftLocaitonTantorium: false,
        LeftLocaitonChronicity: false,

        //LeftLocaitonChronicityType: false,

        LeftMaximumThickness: false,
        //LeftMaximumText: false,
        LeftMassEffect: false,
        LeftMassEffectEffecedSulci: false,
        LeftMassEffectLateralVentricle: false,
        LeftMassEffectUncal: false,
        LeftMassMidlineShift: false,
        //LeftSDHMidLineShiftText: false,
        //LeftMassMidLineTowards: false,

        EDH: false,
        RightEDH: false,

        EDHRightLocation: false,
        EDHRightLocationFrontal: false,
        EDHRightLocationTemporal: false,
        EDHRightLocaitonParietal: false,
        EDHRightLocationOccipital: false,

        EDHRightLocationFalx: false,
        EDHRightLocaitonTantorium: false,
        EDHRightLocaitonChronicity: false,

        //EDHRightLocaitonChronicityType: false,

        EDHRightMaximumThickness: false,
        //EDHRightMaximumText: false,
        EDHRightMassEffect: false,
        EDHRightMassEffectEffecedSulci: false,
        EDHRightMassEffectLateralVentricle: false,
        EDHRightMassEffectUncal: false,
        EDHRightMassMidlineShift: false,
        //EDHRightMassMidLineShiftText: false,
        //EDHRightMassMidLineTowards: false,

        // Left***************************
        LeftEDH: false,

        EDHLeftLocation: false,
        EDHLeftLocationFrontal: false,
        EDHLeftLocationTemporal: false,
        EDHLeftLocaitonParietal: false,
        EDHLeftLocationOccipital: false,

        EDHLeftLocationFalx: false,
        EDHLeftLocaitonTantorium: false,
        EDHLeftLocaitonChronicity: false,

        //EDHLeftLocaitonChronicityType: false,

        EDHLeftMaximumThickness: false,
        //EDHLeftMaximumText: false,
        EDHLeftMassEffect: false,
        EDHLeftMassEffectEffecedSulci: false,
        EDHLeftMassEffectLateralVentricle: false,
        EDHLeftMassEffectUncal: false,
        EDHLeftMassMidlineShift: false,
        //EDHLeftMassMidLineShiftText: false,
        //EDHLeftMassMidLineTowards: false,

        SAH: false,
        //SAHType: false,
        SAHRight: false,
        SAHRightFrontal: false,
        SAHRightParietal: false,
        SAHRightOccipital: false,
        SAHRightTemporal: false,
        SAHRightFalx: false,
        SAHRightBasalCisterns: false,
        SAHRightSylvianFissures: false,
        SAHRightSuprasellerCistern: false,

        SAHLeft: false,
        SAHLeftFrontal: false,
        SAHLeftParietal: false,
        SAHLeftOccipital: false,
        SAHLeftTemporal: false,
        SAHLefttFalx: false,
        SAHLeftBasalCisterns: false,
        SAHLeftSylvianFissures: false,
        SAHLeftSuprasellerCistern: false,

        IVH: false,

        LateralVentriclesLeft: false,

        LateralVentriclesRight: false,

        ThirdVentricles: false,
        FourthVentricles: false,
        ObstructiveHydrocephalus: false,

        //ObstructiveHydrocephalusType: false,
        //EvansIndex: false,
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

    // if (data.cerebralParenchyma) {
    //   document.querySelectorAll('label[id^="#/properties/cerebralParenchyma"]').forEach((el) => {
    //     el.classList.add("err");
    //   });
    //   return;
    // }
    // if (!data.allNormal) {
    //   document.querySelectorAll('label[id^="#/properties/allNormal"]').forEach((el) => {
    //     el.classList.add("err");
    //   });
    //   return;
    // }

    if (data.Atrophy) {
      if (!data.Atrophytype) {
        document.querySelectorAll('label[id^="#/properties/Atrophy"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
    }
    //Infarct
    if (data.Infarct) {
      if (!(data.TypeofInfarct && data.Location)) {
        document.querySelectorAll('label[id^="#/properties/Infarct"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      if (!(data.InfarctTypes && (data.InfractRight || data.InfractLeft))) {
        document.querySelectorAll('label[id^="#/properties/Infarct"]').forEach((el) => {
          el.classList.add("err");
        });
        return;
      }
      //if (!(data.Frontal || data.Parietal || data.Temporal || data.Occipital
      //  || data.BasalGanglia || data.Thalamus || data.CoronaRadiate || data.CentrumSemiovale
      //  || data.Cerebellum || data.Pons || data.Medulla || data.Midbrain)) {
      //  document.querySelectorAll('label[id^="#/properties/Infarct"]').forEach((el) => {
      //    el.classList.add("err");
      //  });
      //  return;
      //}
    }
    if(data.Hemorrhage){
      if (data.IntraRight) {
        if(!(data.RightIntraLocation && data.Chronicity && data.Size && data.MassEffect)){
          document.querySelectorAll('label[id^="#/properties/IntraRight"]').forEach((el) => {
                el.classList.add("err");
              });
          return;
        }
      }
      if (data.IntraLeft) {
        if(!(data.LeftIntraLocation && data.Chronicity1 && data.Size1 && data.MassEffect1)){
          document.querySelectorAll('label[id^="#/properties/IntraLeft"]').forEach((el) => {
                el.classList.add("err");
              });
          return;
        }
      }
      if (data.ExtraAxial) {
        if (data.SDH) {
          if (data.RightSDH) {
            if(!(data.RightLocation && data.RightLocaitonChronicity && data.RightMaximumThickness && data.RightMassEffect)){
              document.querySelectorAll('label[id^="#/properties/SDH"]').forEach((el) => {
                    el.classList.add("err");
                  });
              return;
            }
          }
          if (data.LeftSDH) {
            if(!(data.LeftLocation && data.LeftLocaitonChronicity && data.LeftMaximumThickness && data.LeftMassEffect)){
              document.querySelectorAll('label[id^="#/properties/SDH"]').forEach((el) => {
                    el.classList.add("err");
                  });
              return;
            }
          }
        }
      }
    }

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
      NameTextFR3: patientName,
      IDTextFR3: patientId,
      AgeTextFR3: age,
      GenderTextFR3: gender,
      TestDateTextFR3: testDate,
      ReportDateTextFR3: reportDate,
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
          <Form3 data={formData} handleChange={this.handleChange} />
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
