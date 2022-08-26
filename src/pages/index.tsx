/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import * as Api from '@/api';

interface AppProps {
  app: Api.Application;
}

function App({ app }: AppProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);

  const [values, setValues] = useState(() => {
    const initialValues: Record<Api.Field['name'], Api.Field['value']> = {};
    app.steps.forEach((step) => {
      step.fields.forEach((field) => {
        switch (field.kind) {
          case 'text':
            initialValues[field.name] = field.value ?? '';
            break;
          case 'radio':
            if (!initialValues[field.name] && field.checked) {
              initialValues[field.name] = field.value ?? '';
            }
            break;
          case 'checkbox':
            initialValues[field.name] = field.value ?? false;
            break;
          default: {
            const never: never = field;
            throw new Error(never);
          }
        }
      });
    });
    return initialValues;
  });

  const [errors, setErrors] = useState<Record<Api.Field['name'], string | null>>({});

  function onSubmit(evt: React.FormEvent<HTMLFormElement>): void {
    evt.preventDefault();
    if (isCurrentStepValid()) {
      console.log(values);
    }
  }

  function onBack(): void {
    setCurrentStep(currentStep - 1);
  }

  function onNext(): void {
    if (isCurrentStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  }

  function isCurrentStepValid(): boolean {
    const { fields } = app.steps[currentStep];
    const allErrors = fields.map((field) => validate(field, values[field.name]));
    if (allErrors.some((err) => err !== null)) {
      fields.forEach((field, idx) => {
        setErrors((prev) => ({
          ...prev,
          [field.name]: allErrors[idx],
        }));
      });
      return false;
    }
    return true;
  }

  function validate(field: Api.Field, value: Api.Field['value']): string | null {
    switch (field.kind) {
      case 'text': {
        if (Boolean(field.required) && String(value).length === 0) {
          return 'This field is required';
        }
        const failedRule = field.rules?.find((rule) => {
          switch (rule.type) {
            case 'email':
              return !/^.+@.+$/.test(String(value));
            case 'phone':
              return !/^\d{10}$/.test(String(value));
            default: {
              const never: never = rule.type;
              throw new Error(never);
            }
          }
        });
        return failedRule?.error ?? null;
      }
      case 'checkbox':
      case 'radio':
        return null;
      default: {
        const never: never = field;
        throw new Error(never);
      }
    }
  }

  return (
    <main>
      <h1>{app.title}</h1>
      <form action="POST" onSubmit={onSubmit}>
        {app.steps.map((step, idx) => {
          if (currentStep === idx) {
            return (
              <Step key={step.id} title={step.title}>
                {step.fields.map((field) => {
                  switch (field.kind) {
                    case 'text':
                      return (
                        <ValueField
                          key={field.id}
                          id={field.id}
                          type={field.type}
                          name={field.name}
                          label={field.label}
                          value={values[field.name] as Api.ValueField['value']}
                          error={errors[field.name] ?? null}
                          description={field.description}
                          onChange={(value) => {
                            setValues((prev) => ({
                              ...prev,
                              [field.name]: value,
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              [field.name]: validate(field, value),
                            }));
                          }}
                        />
                      );
                    case 'checkbox':
                      return (
                        <CheckboxField
                          key={field.id}
                          id={field.id}
                          name={field.name}
                          label={field.label}
                          value={values[field.name] as Api.CheckboxField['value']}
                          description={field.description}
                          onChange={(value) => {
                            setValues((prev) => ({
                              ...prev,
                              [field.name]: value,
                            }));
                          }}
                        />
                      );
                    case 'radio':
                      return (
                        <RadioField
                          key={field.id}
                          id={field.id}
                          name={field.name}
                          label={field.label}
                          value={field.value}
                          checked={values[field.name] === field.value}
                          description={field.description}
                          onChange={(value) => {
                            setValues((prev) => ({
                              ...prev,
                              [field.name]: value,
                            }));
                          }}
                        />
                      );
                    default: {
                      const never: never = field;
                      throw new Error(never);
                    }
                  }
                })}
              </Step>
            );
          }
          return null;
        })}
        {currentStep > 0 && (
          <button type="button" onClick={onBack}>
            Back
          </button>
        )}
        {currentStep < app.steps.length - 1 && (
          <button type="button" onClick={onNext}>
            Next
          </button>
        )}
        {currentStep === app.steps.length - 1 && <button type="submit">Finish</button>}
      </form>
    </main>
  );
}

interface StepProps extends Pick<Api.Step, 'title' | 'description'> {
  children: React.ReactNode;
}

function Step({ title, children }: StepProps): JSX.Element {
  return (
    <fieldset>
      <h2>{title}</h2>
      {children}
    </fieldset>
  );
}

interface ValueFieldProps extends Omit<Api.ValueField, 'kind'> {
  onChange?(value: Api.ValueField['value']): void;
  error?: string | null;
}

function ValueField({
  id,
  type,
  name,
  label,
  placeholder,
  description,
  value,
  error,
  onChange,
}: ValueFieldProps): JSX.Element {
  switch (type) {
    case 'text':
    case 'number':
      return (
        <div>
          <label htmlFor={id}>{label}</label>
          <br />
          <input
            id={id}
            type={type}
            name={name}
            placeholder={placeholder}
            defaultValue={value}
            onChange={(evt) => onChange?.(evt.target.value)}
          />
          {description && <p>{description}</p>}
          {error !== null && <p>{error}</p>}
        </div>
      );
    case 'textarea':
      return (
        <div>
          <label htmlFor={id}>{label}</label>
          <br />
          <textarea id={id} name={name} placeholder={placeholder} defaultValue={value} />
          {description && <p>{description}</p>}
          {error !== null && <p>{error}</p>}
        </div>
      );
    default: {
      const never: never = type;
      throw new Error(never);
    }
  }
}

interface CheckboxFieldProps extends Omit<Api.CheckboxField, 'kind'> {
  onChange?(value: Api.CheckboxField['value']): void;
  error?: string | null;
}

function CheckboxField({ id, name, value, label, description, error, onChange }: CheckboxFieldProps): JSX.Element {
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        name={name}
        defaultChecked={value}
        onChange={(evt) => onChange?.(evt.target.checked)}
      />
      <label htmlFor={id}>{label}</label>
      {description && <p>{description}</p>}
      {error !== null && <p>{error}</p>}
    </div>
  );
}

interface RadioFieldProps extends Omit<Api.RadioField, 'kind'> {
  onChange?(value: Api.RadioField['value']): void;
  error?: string | null;
}

function RadioField({ id, name, checked, label, value, description, error, onChange }: RadioFieldProps): JSX.Element {
  return (
    <div>
      <input
        id={id}
        type="radio"
        name={name}
        defaultChecked={checked}
        defaultValue={value}
        onChange={(evt) => onChange?.(evt.target.value)}
      />
      <label htmlFor={id}>{label}</label>
      {description && <p>{description}</p>}
      {error !== null && <p>{error}</p>}
    </div>
  );
}

export function getStaticProps(): { props: AppProps } {
  const app: Api.Application = {
    id: 'app',
    category: 'workers-compensation',
    title: "Worker's compensation application",
    steps: [
      {
        id: 'primary-contact',
        title: 'Who is the primary contact for this policy?',
        description:
          "This person will receive all communications from Newfront about this policy. You can change this contact information later. If you're not sure, just add your contact information",
        fields: [
          {
            id: 'fullname',
            kind: 'text',
            name: 'fullname',
            type: 'text',
            label: 'Full Name',
            required: true,
          },
          {
            id: 'role',
            kind: 'text',
            name: 'role',
            type: 'text',
            label: 'Role',
            required: true,
          },
          {
            id: 'phone',
            kind: 'text',
            name: 'phone',
            type: 'number',
            label: 'Phone',
            required: true,
            rules: [
              {
                type: 'phone',
                error: 'Must be a valid phone number',
              },
            ],
          },
        ],
      },
      {
        id: 'about-company',
        title: 'Tell us about your company',
        fields: [
          {
            id: 'company-name',
            kind: 'text',
            name: 'company-name',
            type: 'text',
            label: 'Company Name',
            required: true,
          },
          {
            id: 'fein',
            kind: 'text',
            name: 'fein',
            type: 'number',
            label: 'What is your Federal Employer Identification Number? (FEIN)',
            required: true,
          },
          {
            id: 'number-of-locations',
            kind: 'text',
            name: 'number-of-locations',
            type: 'number',
            label: 'Number of locations',
            required: true,
          },
          {
            id: 'states',
            kind: 'text',
            name: 'states',
            type: 'text',
            label: 'In which states do you operate?',
            required: true,
          },
        ],
      },
      {
        id: 'about-employees',
        title: 'Tell us about your employees',
        fields: [
          {
            id: 'work-injury-contact',
            kind: 'text',
            name: 'work-injury',
            type: 'text',
            label: "What's the name of the clinic, physician, or ERused for work injuries",
            required: true,
          },
          {
            id: 'medical-insurance',
            kind: 'checkbox',
            name: 'medical-insurance',
            label: 'Do you provide group medical insurance?',
            required: true,
          },
          {
            id: 'retirement-pension',
            kind: 'checkbox',
            name: 'retirement-pension',
            label: 'Do you offer a retirement or pension plan?',
            required: true,
          },
          {
            id: 'paid-vacation',
            kind: 'checkbox',
            name: 'paid-vacation',
            label: 'Do you give paid vacation?',
            required: true,
          },
          {
            id: 'paid-vacation-details',
            kind: 'text',
            name: 'paid-vacation-details',
            type: 'text',
            label: 'Please provide details about the paid vacation',
            dependsOn: {
              fieldName: 'paid-vacation',
              fieldValue: true,
            },
          },
        ],
      },
      {
        id: 'pay',
        title: 'How do you want to pay for your policy',
        fields: [
          {
            id: 'pay-newfront',
            kind: 'radio',
            name: 'pay',
            label: 'I want to pay Newfront',
            value: 'Newfront',
            description: "You'll pay Newfront instead of paying each insurance company separately. There are no fees.",
            checked: true,
            required: true,
          },
          {
            id: 'pay-insurance',
            kind: 'radio',
            name: 'pay',
            label: 'I want to pay the insurance company directly',
            value: 'Insurance',
            description:
              "You'll receive bills from the insurance company and it will be your responsibility to make sure they are paid to keep your coverage.",
            required: true,
          },
        ],
      },
    ],
  };
  return {
    props: {
      app,
    },
  };
}

export default App;
