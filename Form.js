import React, { useState } from 'react';
import Form from 'react-jsonschema-form';
import data from './data.json';
import Stepper from 'react-stepper-horizontal';
import './FormComponent.css';


const CustomErrorList = ({ errors }) => {
  return (
    <div className="alert alert-danger">
      {errors.map((error, i) => (
        <div key={i}>{error.stack}</div>
      ))}
    </div>
  );
};
const schema = {
  type: 'object',
  properties: {},
  required: [], // Tableau des propriétés requises (initialisé vide)
};

const uiSchema = {};

for (let i = 0; i < data.length; i++) {
  const dataObj = data[i];
  const dataObjProperties = {};

  for (let j = 0; j < dataObj.ids.length; j++) {
    const id = dataObj.ids[j];
    const propertyTitle = data[i].ids[j].lines;

    if (id.fieldType === 'Image') {
      
      dataObjProperties[propertyTitle] = {
        type: 'string',
        title: propertyTitle,
        format:'data-url',
        
      };


    } 
    else if  (id.fieldType === 'Integer') {
      
      dataObjProperties[propertyTitle] = {
        type: 'integer',
        title: propertyTitle,
       
     
       
        
      };
    }
    else {
      const uniqueLines = [...new Set(id.lines)]; 
      dataObjProperties[propertyTitle] = {
        type: 'string',
        title: propertyTitle,
        items: {
          type: 'string',  
          enum: uniqueLines,
         
          
        },
        
        // Ajout des conditions de validation
        minLength: 1, // champ obligatoire
        pattern: id.fieldType === 'Phone' ? '^\\d{3}-\\d{4}$' : id.fieldType === 'Email' ? '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$'
         :id.fieldType === 'BIC' ?'/^([A-Z]{6}[A-Z0-9]{2}|[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?)$/'
         :id.fieldType === 'Date' ? '/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/'
         :id.fieldType === 'IBAN' ?'/^([A-Z]{2}[0-9]{2})([A-Z0-9]{1,30})$/':undefined, // format de saisie
        
validate: (value) => {
  const inputDate = new Date(value);
  const currentDate = new Date();
  return inputDate <= currentDate ? undefined : "Date can't be in the future";
},

        maxLength: id.fieldType === 'Password' ? 30 : undefined, // longueur maximale
        minLength: id.fieldType === 'Password' ? 8 : undefined, // longueur minimale
        
      };
      if (dataObjProperties[propertyTitle].minLength || dataObjProperties[propertyTitle].pattern ) {
        
        schema.required.push(propertyTitle); // Ajout de la propriété au tableau des propriétés requises
      

      };
    }
  }

 schema.properties[dataObj.name] = {
    type: 'object',
    title: dataObj.name,
    properties: dataObjProperties,
  };
}

const ImageWidget = props => {
  const { id, value, onChange } = props;

  const handleFileChange = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {value && (
        <img
          src={value}
          alt="Uploaded file"
          
        />
      )}
      <input type="file" id={id} onChange={handleFileChange} />
    </div>
  );
};

const widgets = {
  'ui:widget': ImageWidget,
};

function onSubmit({ formData }) {
  console.log('Form submitted:', formData);
}



function FormComponent() {
  const [step, setStep] = useState(0);

  const steps = data.map(d => ({ title: d.name }));

  const onNext = () => setStep(step + 1);
  const onPrev = () => setStep(step - 1);
  

  return (
    <>
    <div className='allsteps'>
      <Stepper
        steps={steps}
        activeStep={step}
        activeColor="green"
        completeColor="blue"
        defaultBarColor="#e9ecef"
        completeBarColor="#28a745"
        circleFontSize={12}
        titleFontSize={16}
      />
      </div>
      <Form
        schema={schema.properties[data[step].name]}
        uiSchema={uiSchema}
        widgets={widgets}
        onSubmit={onNext}
        
      />
      {step >0 && <button type="button"  onClick={onPrev} >Previous</button>}
    </>
  );
}

export default FormComponent;
