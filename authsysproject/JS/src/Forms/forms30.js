import React, { Component } from "react";
import { JsonForms } from "@jsonforms/react";
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
      enum: ["Male", "Female", "Others"],
    },
    TestDateTextFR2: {
      type: "string",
    },
    ReportDateTextFR2: {
      type: "string",
    },
    XrayTypes: {
      type: "string",
      enum: ["AP", "PA", "LATERAL", "AP/PA"],
    },
    BothNormal: {
      type: "boolean",
    },
    suspectedTB: {
      type: "boolean",
    },
   // In Form30.js
    suspectedTBType: {
      type: "array",
      items: {
        type: "string",
        enum: ["RUZ", "RMZ", "RLZ", "LUZ", "LMZ", "LLZ"],
      },
      uniqueItems: true,
    },
        AdditionalNotes: {
          type: "string",
        },
      },
      required: ["XrayTypes", "suspectedTB"],
    };

const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Group",
      elements: [
        {
          type: "HorizontalLayout",
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
    {
      type: "Group",
      elements: [
        {
          type: "Control",
          label: "X-Ray Type",
          scope: "#/properties/XrayTypes",
          options: {
            format: "radio",
          },
        },
        {
          type: "Control",
          label: "Normal?",
          scope: "#/properties/BothNormal",
        },
        {
          type: "Control",
          label: "SuspectedTB?",
          scope: "#/properties/suspectedTB",
        },
        {
          type: "Group",
          // rule: {
          //   effect: "SHOW",
          //   condition: {
          //     scope: "#/properties/suspectedTB",
          //     schema: {
          //       const: true,
          //     },
          //   },
          // },
          elements: [
            // In Form30.js
            {
              type: "Control",
              label: "SuspectedTB Type",
              scope: "#/properties/suspectedTBType",
              options: {
                format: "checkboxes", // Changed from radio
              },
            },
          ],
        },
      ],
    },
    {
      type: "Control",
      label: "Additional Notes",
      scope: "#/properties/AdditionalNotes",
    },
  ],
};

export default class Form30 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        XrayTypes: "PA",
        BothNormal: true,
        suspectedTBType: [], // Initialize as empty array
        ...props.data,
      },
      schema: _schema,
    };
  }

  handleForm = (data) => {
    // If suspectedTBType is selected, adjust the checkboxes
    if (data.suspectedTBType && data.suspectedTBType.length > 0) {
      data.BothNormal = false; // Uncheck "Normal"
      data.suspectedTB = true; // Check "SuspectedTB"
    }
    this.setState({ data }, () => {
      if (this.props.handleChange) {
        this.props.handleChange(data, false);
      }
    });
  };

  render() {
    const { data, schema } = this.state;
    return (
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        validationMode="ValidateAndShow"
        onChange={({ data }) => this.handleForm(data)}
      />
    );
  }
}
