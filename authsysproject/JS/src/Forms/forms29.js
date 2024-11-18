import React, { Component, useState } from "react";
import { Generate } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
//import {vanillaRenderers, vanillaCells, JsonFormsStyleContext } from '@jsonforms/vanilla-renderers';
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";

const _schema = {
  type: "object",
  properties: {

    NameTextFR2: {
			type: "string",
		},
		IDTextFR2: {
			type: "string",
		},
		AgeTextFR2: {
			type: "string",
		},
		GenderTextFR2: {
			type: "string",
			enum: ['Male', 'Female', 'Others'],
		},
		TestDateTextFR2: {
			type: "string",
		},
    ReportDateTextFR2: {
			type: "string",
		},

  },
};


const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Group",
      elements: [
        {
          type: "HorizontalLayout",
          label: "",
          elements: [
            {
							type: "Control",
							label: "Name",
							scope: "#/properties/NameTextFR2",
						},
						{
							type: "Control",
							label: "Patient ID",
							scope: "#/properties/IDTextFR2",
						},
						{
							type: "Control",
							label: "Age",
							scope: "#/properties/AgeTextFR2",
						},
						{
							type: "Control",
							label: "Test date",
							scope: "#/properties/TestDateTextFR2",
						},
            {
							type: "Control",
							label: "Report date",
							scope: "#/properties/ReportDateTextFR2",
						},

          ],

        },
        {
          type: "Control",
          label: "Gender",
          scope: "#/properties/GenderTextFR2",
          options: {
            format: "radio",
          },
        },
      ],
    },

  ]
};

const styleContextValue = {
  styles: [
    {
      name: "control.input",
      classNames: ["custom-input"],
    },
    {
      name: "control.select",
      classNames: ["select", "select-box"],
    },
    {
      name: "array.button",
      classNames: ["custom-array-button"],
    },
  ],
};
export default class Form29 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      schema: _schema,
    };
  }

  componentDidUpdate() { }

  handleForm(data) {
    const { schema } = this.state;
    this.setState(data, () => {
      this.props.handleChange(data, false);
    });
  }

  render() {
    const { data, schema } = this.state;
    return (
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        ValidationMode="ValidateAndShow"
        onChange={({ data, _errors }) => this.handleForm(data)}
      />
    );
  }
}
//Auto data by Aman Gupta on 23/06/2023
// export default class Form2 extends Component {
// 	constructor(props) {
// 	  super(props);
// 	  this.state = {
// 		data: props.data,
// 		schema: _schema,
// 		patients: [],
// 		query: '',
// 	  };

// 	  this.search = this.search.bind(this);
// 	  this.setQuery = this.setQuery.bind(this);
// 	  this.patientSelected = this.patientSelected.bind(this);
// 	}
  
// 	componentDidUpdate() { }
  
// 	handleForm(data) {
// 	  const { schema } = this.state;
// 	  this.setState({data: data}, () => {
// 		this.props.handleChange(data, false);
// 	  });
// 	  this.forceUpdate();
// 	}

// 	setQuery(e) {
// 		this.setState({query: e.target.value})
// 	}

// 	search() {
// 		fetch(`/patientdata?query=${this.state.query}`).then((r) => {
// 			if (r.ok) {
// 				return r.json();
// 			}
// 		}).then((d) => {
// 			let patients = [];
// 			d.forEach((p) => {
// 				patients.push(p.fields);
// 			});
// 			//this.setState(patients);
// 			this.setState({patients: patients});
// 			//this.forceUpdate();
// 		}).catch((e) => {
// 			console.error(e);
// 		})
// 	}

// 	patientSelected(e) {
// 		const {data} = this.state;
// 		const pid = e.target.value;
// 		const patient = this.state.patients.find((p) => {
// 			return p.PatientId === pid;
// 		});
// 		let formData = {
// 			...data,
// 			GenderTextFR2: patient.gender,
// 			AgeTextFR2: patient.age,
// 			NameTextFR2: patient.PatientName,
// 			IDTextFR2: patient.PatientId,
// 			TestDateTextFR2: patient.TestDate,
// 			ReportDateTextFR2: patient.ReportDate
// 		}
// 		this.handleForm(formData);
// 	}
  
// 	render() {
// 	  const { data, schema, patients } = this.state;
// 	  return (
// 		<div>
// 			<input type="text" placeholder="Enter name or Patient ID" onChange={this.setQuery}/> <button onClick={this.search}>Search</button>
// 			{patients.length > 0 &&
// 				<select id="patients" onChange={this.patientSelected}>
// 					<option value="-1">-- Select Patient --</option>
// 					{patients.map((p) => {
// 						return <option value={p.PatientId} key={p.PatientId}>{p.PatientName} | ID: {p.PatientId}</option>;
// 					})};	
// 				</select>
// 			}
// 			<JsonForms
// 			schema={schema}
// 			uischema={uischema}
// 			data={data}
// 			renderers={materialRenderers}
// 			cells={materialCells}
// 			ValidationMode="ValidateAndShow"
// 			onChange={({ data, _errors }) => this.handleForm(data)}
// 			/>
// 		</div>
// 	  );
// 	}
// }
